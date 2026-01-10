// ===========================================
// TRANSLATION SERVER SERVICE
// Server-side translation with multiple providers
// ===========================================

import { SupportedLanguage } from '@/lib/types/translator.types'
import { TranslateResponse } from '@/lib/types/api.types'
import { TRANSLATION_LANGUAGE_MAP } from '@/lib/constants/translator.constants'
import { translatorConfig, TranslationProvider, getAvailableProviders } from '../config/translatorConfig'
import { createError } from '../utils/errorHandler'

// ============ Translation Cache ============

class TranslationCache {
    private cache: Map<string, { value: string; timestamp: number }> = new Map()
    private maxSize = 1000
    private ttl: number

    constructor(ttlSeconds: number = 3600) {
        this.ttl = ttlSeconds * 1000
    }

    private getKey(text: string, from: string, to: string): string {
        return `${from}:${to}:${text}`
    }

    get(text: string, from: string, to: string): string | null {
        const key = this.getKey(text, from, to)
        const cached = this.cache.get(key)

        if (!cached) return null

        // Check if expired
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key)
            return null
        }

        return cached.value
    }

    set(text: string, from: string, to: string, translated: string): void {
        // Evict oldest if at max size
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value
            if (oldestKey) this.cache.delete(oldestKey)
        }

        const key = this.getKey(text, from, to)
        this.cache.set(key, { value: translated, timestamp: Date.now() })
    }

    clear(): void {
        this.cache.clear()
    }

    get size(): number {
        return this.cache.size
    }
}

// ============ Translation Service Class ============

class TranslationServerService {
    private cache: TranslationCache
    private providers: TranslationProvider[]

    constructor() {
        this.cache = new TranslationCache(translatorConfig.cache.ttl)
        this.providers = getAvailableProviders()
    }

    /**
     * Translate a single text
     */
    async translate(
        text: string,
        from: SupportedLanguage,
        to: SupportedLanguage
    ): Promise<string> {
        if (!text.trim()) return ''

        const fromLang = TRANSLATION_LANGUAGE_MAP[from]
        const toLang = TRANSLATION_LANGUAGE_MAP[to]

        // Check cache
        if (translatorConfig.cache.enabled) {
            const cached = this.cache.get(text, fromLang, toLang)
            if (cached) {
                if (translatorConfig.debug) {
                    console.log('[Translation Server] Cache hit')
                }
                return cached
            }
        }

        // Try providers in order
        let lastError: Error | null = null

        for (const provider of this.providers) {
            try {
                const translated = await this.translateWithProvider(text, fromLang, toLang, provider)

                // Cache the result
                if (translatorConfig.cache.enabled) {
                    this.cache.set(text, fromLang, toLang, translated)
                }

                return translated
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error')
                if (translatorConfig.debug) {
                    console.log(`[Translation Server] ${provider} failed:`, lastError.message)
                }
                // Try next provider
            }
        }

        throw createError.translationFailed(lastError?.message || 'All providers failed')
    }

    /**
     * Translate using a specific provider
     */
    private async translateWithProvider(
        text: string,
        from: string,
        to: string,
        provider: TranslationProvider
    ): Promise<string> {
        switch (provider) {
            case 'mymemory':
                return this.translateWithMyMemory(text, from, to)
            case 'libretranslate':
                return this.translateWithLibreTranslate(text, from, to)
            case 'google':
                return this.translateWithGoogle(text, from, to)
            case 'deepl':
                return this.translateWithDeepL(text, from, to)
            default:
                throw new Error(`Unknown provider: ${provider}`)
        }
    }

    /**
     * MyMemory Translation API (free)
     */
    private async translateWithMyMemory(
        text: string,
        from: string,
        to: string
    ): Promise<string> {
        const url = new URL(translatorConfig.translation.myMemoryApiUrl)
        url.searchParams.set('q', text)
        url.searchParams.set('langpair', `${from}|${to}`)

        if (translatorConfig.translation.myMemoryEmail) {
            url.searchParams.set('de', translatorConfig.translation.myMemoryEmail)
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            signal: AbortSignal.timeout(translatorConfig.translation.libreTranslateUrl ? 10000 : 30000),
        })

        if (!response.ok) {
            throw new Error(`MyMemory API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
            throw new Error(data.responseDetails || 'MyMemory translation failed')
        }

        return data.responseData.translatedText
    }

    /**
     * LibreTranslate API
     */
    private async translateWithLibreTranslate(
        text: string,
        from: string,
        to: string
    ): Promise<string> {
        const response = await fetch(translatorConfig.translation.libreTranslateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: from,
                target: to,
                format: 'text',
                api_key: translatorConfig.translation.libreTranslateApiKey || undefined,
            }),
            signal: AbortSignal.timeout(30000),
        })

        if (!response.ok) {
            throw new Error(`LibreTranslate API error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.translatedText) {
            throw new Error('LibreTranslate returned empty result')
        }

        return data.translatedText
    }

    /**
     * Google Translate API (requires API key)
     */
    private async translateWithGoogle(
        text: string,
        from: string,
        to: string
    ): Promise<string> {
        if (!translatorConfig.translation.googleApiKey) {
            throw new Error('Google Translate API key not configured')
        }

        const url = new URL('https://translation.googleapis.com/language/translate/v2')
        url.searchParams.set('key', translatorConfig.translation.googleApiKey)

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: from,
                target: to,
                format: 'text',
            }),
            signal: AbortSignal.timeout(30000),
        })

        if (!response.ok) {
            throw new Error(`Google Translate API error: ${response.status}`)
        }

        const data = await response.json()

        return data.data?.translations?.[0]?.translatedText || text
    }

    /**
     * DeepL API (requires API key)
     */
    private async translateWithDeepL(
        text: string,
        from: string,
        to: string
    ): Promise<string> {
        if (!translatorConfig.translation.deepLApiKey) {
            throw new Error('DeepL API key not configured')
        }

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${translatorConfig.translation.deepLApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: [text],
                source_lang: from.toUpperCase(),
                target_lang: to.toUpperCase(),
            }),
            signal: AbortSignal.timeout(30000),
        })

        if (!response.ok) {
            throw new Error(`DeepL API error: ${response.status}`)
        }

        const data = await response.json()

        return data.translations?.[0]?.text || text
    }

    /**
     * Batch translate multiple texts
     */
    async batchTranslate(
        texts: string[],
        from: SupportedLanguage,
        to: SupportedLanguage
    ): Promise<TranslateResponse> {
        const startTime = Date.now()

        if (translatorConfig.debug) {
            console.log(`[Translation Server] Batch translating ${texts.length} texts`)
        }

        const translations: { original: string; translated: string }[] = []

        // Process in parallel with concurrency limit
        const concurrency = 5
        for (let i = 0; i < texts.length; i += concurrency) {
            const batch = texts.slice(i, i + concurrency)

            const results = await Promise.all(
                batch.map(async (text) => {
                    const translated = await this.translate(text, from, to)
                    return { original: text, translated }
                })
            )

            translations.push(...results)
        }

        return {
            translations,
            processingTime: Date.now() - startTime,
        }
    }

    /**
     * Clear translation cache
     */
    clearCache(): void {
        this.cache.clear()
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; enabled: boolean } {
        return {
            size: this.cache.size,
            enabled: translatorConfig.cache.enabled,
        }
    }
}

// Export singleton instance
export const translationServerService = new TranslationServerService()
export default translationServerService
