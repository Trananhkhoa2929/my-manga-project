// ===========================================
// TRANSLATOR SERVER CONFIG
// Environment variables and API configuration
// ===========================================

// ============ Environment Variables ============

export const translatorConfig = {
    // Translation API Configuration
    translation: {
        // Primary: MyMemory API (free tier)
        myMemoryApiUrl: 'https://api.mymemory.translated.net/get',
        myMemoryEmail: process.env.MYMEMORY_EMAIL || '',

        // Fallback: LibreTranslate
        libreTranslateUrl: process.env.LIBRE_TRANSLATE_URL || 'https://libretranslate.com/translate',
        libreTranslateApiKey: process.env.LIBRE_TRANSLATE_API_KEY || '',

        // Optional: Google Translate (requires API key)
        googleApiKey: process.env.GOOGLE_TRANSLATE_API_KEY || '',

        // Optional: DeepL (requires API key)
        deepLApiKey: process.env.DEEPL_API_KEY || '',
    },

    // OCR Configuration
    ocr: {
        // Tesseract worker path
        workerPath: process.env.TESSERACT_WORKER_PATH || '',
        // Language data path
        langPath: process.env.TESSERACT_LANG_PATH || '',
        // Cache directory for language data
        cacheDir: process.env.TESSERACT_CACHE_DIR || '/tmp/tesseract-cache',
    },

    // Image Processing
    image: {
        // Temporary upload directory
        uploadDir: process.env.UPLOAD_DIR || '/tmp/translator-uploads',
        // Maximum file size (bytes)
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
        // Image quality for exports
        exportQuality: parseInt(process.env.EXPORT_QUALITY || '90', 10),
    },

    // Rate Limiting
    rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
        requestsPerMinute: parseInt(process.env.RATE_LIMIT_RPM || '30', 10),
        requestsPerHour: parseInt(process.env.RATE_LIMIT_RPH || '500', 10),
    },

    // Caching
    cache: {
        enabled: process.env.CACHE_ENABLED !== 'false',
        ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
    },

    // Debug mode
    debug: process.env.NODE_ENV === 'development',
} as const

// ============ Validate Required Config ============

export function validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // No required env vars for basic functionality (using free APIs)
    // Add validation here if you add premium API keys

    return {
        valid: errors.length === 0,
        errors,
    }
}

// ============ Get Translation Provider ============

export type TranslationProvider = 'mymemory' | 'libretranslate' | 'google' | 'deepl'

export function getAvailableProviders(): TranslationProvider[] {
    const providers: TranslationProvider[] = ['mymemory'] // Always available (free)

    if (translatorConfig.translation.libreTranslateApiKey) {
        providers.push('libretranslate')
    }

    if (translatorConfig.translation.googleApiKey) {
        providers.push('google')
    }

    if (translatorConfig.translation.deepLApiKey) {
        providers.push('deepl')
    }

    return providers
}

export default translatorConfig
