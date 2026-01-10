// ===========================================
// TRANSLATION SERVICE - Multi-language Translation
// Using free translation APIs
// ===========================================

import {
    SupportedLanguage,
    TRANSLATION_LANG_MAP,
    TranslationResult
} from '@/lib/types/translator.types'

class TranslationService {
    private cache: Map<string, string> = new Map()

    /**
     * Generate cache key for translation
     */
    private getCacheKey(text: string, from: string, to: string): string {
        return `${from}:${to}:${text}`
    }

    /**
     * Translate text using MyMemory API (free, no API key required)
     */
    async translate(
        text: string,
        from: SupportedLanguage,
        to: SupportedLanguage
    ): Promise<string> {
        if (!text.trim()) return ''

        const fromLang = TRANSLATION_LANG_MAP[from]
        const toLang = TRANSLATION_LANG_MAP[to]

        // Check cache first
        const cacheKey = this.getCacheKey(text, fromLang, toLang)
        if (this.cache.has(cacheKey)) {
            console.log('[Translation] Cache hit')
            return this.cache.get(cacheKey)!
        }

        try {
            console.log(`[Translation] Translating: "${text.substring(0, 50)}..." from ${fromLang} to ${toLang}`)

            // Using MyMemory Translation API (free tier: 1000 words/day)
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.responseStatus === 200 && data.responseData?.translatedText) {
                const translated = data.responseData.translatedText

                // Cache the result
                this.cache.set(cacheKey, translated)

                console.log(`[Translation] Success: "${translated.substring(0, 50)}..."`)
                return translated
            }

            // Fallback: Try LibreTranslate
            return await this.translateWithLibre(text, fromLang, toLang)
        } catch (error) {
            console.error('[Translation] Error:', error)
            // Return original text if translation fails
            return text
        }
    }

    /**
     * Fallback translation using LibreTranslate
     */
    private async translateWithLibre(
        text: string,
        from: string,
        to: string
    ): Promise<string> {
        try {
            const response = await fetch('https://libretranslate.com/translate', {
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
            })

            const data = await response.json()

            if (data.translatedText) {
                const cacheKey = this.getCacheKey(text, from, to)
                this.cache.set(cacheKey, data.translatedText)
                return data.translatedText
            }

            return text
        } catch (error) {
            console.error('[Translation] LibreTranslate fallback failed:', error)
            return text
        }
    }

    /**
     * Batch translate multiple texts
     */
    async batchTranslate(
        texts: string[],
        from: SupportedLanguage,
        to: SupportedLanguage
    ): Promise<TranslationResult[]> {
        console.log(`[Translation] Batch translating ${texts.length} texts`)

        const results: TranslationResult[] = []

        // Process in chunks to avoid rate limiting
        const chunkSize = 5
        for (let i = 0; i < texts.length; i += chunkSize) {
            const chunk = texts.slice(i, i + chunkSize)

            const translations = await Promise.all(
                chunk.map(async (text) => {
                    const translated = await this.translate(text, from, to)
                    return {
                        original: text,
                        translated,
                        from: TRANSLATION_LANG_MAP[from],
                        to: TRANSLATION_LANG_MAP[to],
                    }
                })
            )

            results.push(...translations)

            // Small delay between chunks to avoid rate limiting
            if (i + chunkSize < texts.length) {
                await new Promise(resolve => setTimeout(resolve, 500))
            }
        }

        console.log(`[Translation] Batch complete: ${results.length} translations`)
        return results
    }

    /**
     * Clear translation cache
     */
    clearCache(): void {
        this.cache.clear()
        console.log('[Translation] Cache cleared')
    }

    /**
     * Get cache size
     */
    getCacheSize(): number {
        return this.cache.size
    }
}

// Export singleton instance
export const translationService = new TranslationService()
export default translationService
