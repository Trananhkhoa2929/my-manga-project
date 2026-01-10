// ===========================================
// TRANSLATOR STORE - Zustand State Management
// With fallback to client-side processing
// ===========================================

import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import {
    BubbleRegion,
    TextRegion,
    SupportedLanguage,
    TranslatorStep,
    TranslatorImage,
} from '@/lib/types/translator.types'
import { translatorApi } from '@/lib/api/translatorApi'
import { saveAs } from 'file-saver'
import Tesseract from 'tesseract.js'

interface TranslatorState {
    // Images
    originalImage: TranslatorImage | null
    processedImageUrl: string | null

    // Detection results
    detectedBubbles: BubbleRegion[]
    selectedBubbleId: string | null

    // Translation settings
    sourceLanguage: SupportedLanguage
    targetLanguage: SupportedLanguage

    // UI State
    isProcessing: boolean
    processingMessage: string
    progress: number
    currentStep: TranslatorStep
    error: string | null

    // Actions
    setImage: (file: File) => Promise<void>
    clearImage: () => void
    setSourceLanguage: (lang: SupportedLanguage) => void
    setTargetLanguage: (lang: SupportedLanguage) => void
    detectAndExtract: () => Promise<void>
    translateAll: () => Promise<void>
    processAndRender: () => Promise<void>
    updateBubbleText: (bubbleId: string, text: string) => void
    selectBubble: (bubbleId: string | null) => void
    exportResult: (format: 'png' | 'jpeg') => Promise<void>
    setStep: (step: TranslatorStep) => void
    reset: () => void
}

const initialState = {
    originalImage: null,
    processedImageUrl: null,
    detectedBubbles: [],
    selectedBubbleId: null,
    sourceLanguage: 'jpn' as SupportedLanguage,
    targetLanguage: 'vie' as SupportedLanguage,
    isProcessing: false,
    processingMessage: '',
    progress: 0,
    currentStep: 'upload' as TranslatorStep,
    error: null,
}

// Language map for Tesseract
const TESSERACT_LANG_MAP: Record<SupportedLanguage, string> = {
    jpn: 'jpn',
    kor: 'kor',
    chi_sim: 'chi_sim',
    chi_tra: 'chi_tra',
    eng: 'eng',
    vie: 'vie',
}

// Translation language map
const TRANSLATION_LANG_MAP: Record<SupportedLanguage, string> = {
    jpn: 'ja',
    kor: 'ko',
    chi_sim: 'zh',
    chi_tra: 'zh',
    eng: 'en',
    vie: 'vi',
}

export const useTranslatorStore = create<TranslatorState>((set, get) => ({
    ...initialState,

    setImage: async (file: File) => {
        try {
            set({ isProcessing: true, processingMessage: 'Đang tải ảnh...', error: null })

            // Create object URL for preview
            const url = URL.createObjectURL(file)

            // Get image dimensions
            const img = new Image()
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve()
                img.onerror = () => reject(new Error('Failed to load image'))
                img.src = url
            })

            const translatorImage: TranslatorImage = {
                id: uuidv4(),
                file,
                url,
                width: img.naturalWidth,
                height: img.naturalHeight,
            }

            set({
                originalImage: translatorImage,
                processedImageUrl: null,
                detectedBubbles: [],
                currentStep: 'detect',
                isProcessing: false,
                processingMessage: '',
            })
        } catch (error) {
            set({
                error: `Không thể tải ảnh: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isProcessing: false,
            })
        }
    },

    clearImage: () => {
        const state = get()
        if (state.originalImage?.url) {
            URL.revokeObjectURL(state.originalImage.url)
        }
        if (state.processedImageUrl) {
            URL.revokeObjectURL(state.processedImageUrl)
        }
        set({
            originalImage: null,
            processedImageUrl: null,
            detectedBubbles: [],
            currentStep: 'upload',
        })
    },

    setSourceLanguage: (lang) => set({ sourceLanguage: lang }),
    setTargetLanguage: (lang) => set({ targetLanguage: lang }),

    detectAndExtract: async () => {
        const { originalImage, sourceLanguage } = get()
        if (!originalImage) return

        try {
            set({
                isProcessing: true,
                processingMessage: 'Đang khởi tạo OCR...',
                progress: 5,
                error: null,
            })

            // Try server-side first, fallback to client
            let regions: TextRegion[] = []

            try {
                // Attempt server-side OCR with timeout
                set({ progress: 10, processingMessage: 'Đang nhận dạng text...' })

                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

                const ocrResult = await translatorApi.performOcr(originalImage.file, sourceLanguage)
                clearTimeout(timeoutId)

                regions = ocrResult.regions
                set({ progress: 70 })
            } catch (serverError) {
                // Fallback to client-side Tesseract
                console.log('[Store] Server OCR failed, using client-side Tesseract')
                set({ processingMessage: 'Đang tải dữ liệu ngôn ngữ (có thể mất 1-2 phút)...' })

                const result = await Tesseract.recognize(
                    originalImage.url,
                    TESSERACT_LANG_MAP[sourceLanguage],
                    {
                        logger: (m) => {
                            if (m.status === 'loading tesseract core') {
                                set({ progress: 15, processingMessage: 'Đang tải Tesseract core...' })
                            } else if (m.status === 'loading language traineddata') {
                                set({ progress: 25, processingMessage: `Đang tải dữ liệu ${sourceLanguage}...` })
                            } else if (m.status === 'initializing tesseract') {
                                set({ progress: 40, processingMessage: 'Đang khởi tạo OCR engine...' })
                            } else if (m.status === 'recognizing text') {
                                const prog = 40 + Math.round(m.progress * 30)
                                set({ progress: prog, processingMessage: `Đang nhận dạng: ${Math.round(m.progress * 100)}%` })
                            }
                        },
                    }
                )

                // Extract regions from client-side result
                if (result.data.lines) {
                    regions = result.data.lines.map((line) => ({
                        id: uuidv4(),
                        boundingBox: {
                            x: line.bbox.x0,
                            y: line.bbox.y0,
                            width: line.bbox.x1 - line.bbox.x0,
                            height: line.bbox.y1 - line.bbox.y0,
                        },
                        text: line.text.trim(),
                        confidence: line.confidence,
                        language: sourceLanguage,
                    }))
                }

                set({ progress: 70 })
            }

            set({ processingMessage: 'Đang phân tích bubble...' })

            // Group text regions into bubbles
            const bubbles = groupRegionsIntoBubbles(regions)

            set({
                detectedBubbles: bubbles,
                currentStep: bubbles.length > 0 ? 'translate' : 'detect',
                isProcessing: false,
                processingMessage: '',
                progress: 100,
                error: bubbles.length === 0 ? 'Không tìm thấy văn bản trong ảnh. Thử với ảnh khác hoặc ngôn ngữ khác.' : null,
            })
        } catch (error) {
            set({
                error: `Lỗi phát hiện văn bản: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isProcessing: false,
                progress: 0,
            })
        }
    },

    translateAll: async () => {
        const { detectedBubbles, sourceLanguage, targetLanguage } = get()
        if (detectedBubbles.length === 0) return

        try {
            set({
                isProcessing: true,
                processingMessage: 'Đang dịch văn bản...',
                progress: 0,
                error: null,
            })

            // Collect all texts to translate
            const textsToTranslate = detectedBubbles
                .map(b => b.originalText || '')
                .filter(t => t.length > 0)

            if (textsToTranslate.length === 0) {
                set({
                    isProcessing: false,
                    currentStep: 'preview',
                })
                return
            }

            set({ progress: 20, processingMessage: 'Đang kết nối API dịch...' })

            // Try API first, fallback to free service
            let translations: string[] = []

            try {
                const result = await translatorApi.translate(textsToTranslate, sourceLanguage, targetLanguage)
                translations = result.translations.map(t => t.translated)
                set({ progress: 80 })
            } catch (apiError) {
                // Fallback to MyMemory free API directly
                console.log('[Store] Server translation failed, using direct MyMemory API')
                set({ processingMessage: 'Đang dịch qua MyMemory...' })

                const fromLang = TRANSLATION_LANG_MAP[sourceLanguage]
                const toLang = TRANSLATION_LANG_MAP[targetLanguage]

                for (let i = 0; i < textsToTranslate.length; i++) {
                    const text = textsToTranslate[i]
                    const progress = 20 + Math.round((i / textsToTranslate.length) * 60)
                    set({ progress, processingMessage: `Đang dịch ${i + 1}/${textsToTranslate.length}...` })

                    try {
                        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
                        const response = await fetch(url)
                        const data = await response.json()

                        if (data.responseStatus === 200 && data.responseData?.translatedText) {
                            translations.push(data.responseData.translatedText)
                        } else {
                            translations.push(text) // Keep original if failed
                        }
                    } catch {
                        translations.push(text)
                    }

                    // Small delay to avoid rate limiting
                    await new Promise(r => setTimeout(r, 300))
                }
            }

            set({ progress: 90, processingMessage: 'Đang cập nhật kết quả...' })

            // Map translations back to bubbles
            const updatedBubbles = [...detectedBubbles]
            let translationIndex = 0

            for (let i = 0; i < updatedBubbles.length; i++) {
                const bubble = updatedBubbles[i]
                if (bubble.originalText && bubble.originalText.length > 0) {
                    updatedBubbles[i] = {
                        ...bubble,
                        translatedText: translations[translationIndex] || bubble.originalText,
                    }
                    translationIndex++
                }
            }

            set({
                detectedBubbles: updatedBubbles,
                currentStep: 'preview',
                isProcessing: false,
                processingMessage: '',
                progress: 100,
            })
        } catch (error) {
            set({
                error: `Lỗi dịch thuật: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isProcessing: false,
                progress: 0,
            })
        }
    },

    processAndRender: async () => {
        const { originalImage, detectedBubbles } = get()
        if (!originalImage || detectedBubbles.length === 0) return

        try {
            set({ isProcessing: true, processingMessage: 'Đang xử lý ảnh...', progress: 10 })

            // Try server-side, fallback to client canvas
            let processedUrl: string

            try {
                set({ progress: 30, processingMessage: 'Đang render trên server...' })

                const blob = await translatorApi.processImage(
                    originalImage.file,
                    detectedBubbles,
                    { format: 'png' }
                )
                processedUrl = URL.createObjectURL(blob)
            } catch (serverError) {
                // Fallback to client-side canvas rendering
                console.log('[Store] Server processing failed, using client-side canvas')
                set({ processingMessage: 'Đang render trên client...' })

                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')!

                const img = new Image()
                img.crossOrigin = 'anonymous'

                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve()
                    img.onerror = reject
                    img.src = originalImage.url
                })

                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)

                set({ progress: 50 })

                // Fill bubbles and draw text
                for (const bubble of detectedBubbles) {
                    const { x, y, width, height } = bubble.boundingBox

                    // Fill with white
                    ctx.fillStyle = bubble.backgroundColor || '#FFFFFF'
                    ctx.fillRect(x, y, width, height)

                    // Draw translated text
                    if (bubble.translatedText) {
                        const fontSize = Math.min(height * 0.6, 24)
                        ctx.font = `bold ${fontSize}px Arial, sans-serif`
                        ctx.fillStyle = '#000000'
                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'

                        // Simple text wrapping
                        const words = bubble.translatedText.split(' ')
                        const lines: string[] = []
                        let currentLine = ''

                        for (const word of words) {
                            const testLine = currentLine ? `${currentLine} ${word}` : word
                            const metrics = ctx.measureText(testLine)
                            if (metrics.width > width - 10 && currentLine) {
                                lines.push(currentLine)
                                currentLine = word
                            } else {
                                currentLine = testLine
                            }
                        }
                        if (currentLine) lines.push(currentLine)

                        const lineHeight = fontSize * 1.2
                        const startY = y + (height - lines.length * lineHeight) / 2 + fontSize / 2

                        lines.forEach((line, i) => {
                            ctx.fillText(line, x + width / 2, startY + i * lineHeight)
                        })
                    }
                }

                set({ progress: 80 })

                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob((b) => resolve(b!), 'image/png', 0.95)
                })

                processedUrl = URL.createObjectURL(blob)
            }

            set({
                processedImageUrl: processedUrl,
                currentStep: 'export',
                isProcessing: false,
                processingMessage: '',
                progress: 100,
            })
        } catch (error) {
            set({
                error: `Lỗi xử lý ảnh: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isProcessing: false,
                progress: 0,
            })
        }
    },

    updateBubbleText: (bubbleId, text) => {
        set((state) => ({
            detectedBubbles: state.detectedBubbles.map((bubble) =>
                bubble.id === bubbleId ? { ...bubble, translatedText: text } : bubble
            ),
        }))
    },

    selectBubble: (bubbleId) => set({ selectedBubbleId: bubbleId }),

    exportResult: async (format) => {
        const { originalImage, processedImageUrl } = get()

        try {
            set({ isProcessing: true, processingMessage: 'Đang xuất ảnh...' })

            if (processedImageUrl) {
                const response = await fetch(processedImageUrl)
                const blob = await response.blob()
                const fileName = originalImage?.file.name?.replace(/\.[^/.]+$/, '') || 'translated'
                saveAs(blob, `${fileName}_translated.${format}`)
            }

            set({ isProcessing: false, processingMessage: '' })
        } catch (error) {
            set({
                error: `Lỗi xuất ảnh: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isProcessing: false,
            })
        }
    },

    setStep: (step) => set({ currentStep: step }),

    reset: () => {
        const state = get()
        if (state.originalImage?.url) {
            URL.revokeObjectURL(state.originalImage.url)
        }
        if (state.processedImageUrl) {
            URL.revokeObjectURL(state.processedImageUrl)
        }
        set(initialState)
    },
}))

// ============ Helper Functions ============

function groupRegionsIntoBubbles(regions: TextRegion[]): BubbleRegion[] {
    if (regions.length === 0) return []

    // Filter out low confidence results
    const validRegions = regions.filter(r => r.text.length > 0 && r.confidence > 30)
    if (validRegions.length === 0) return []

    const bubbles: BubbleRegion[] = []
    const used = new Set<string>()

    // Group nearby regions together
    const isNearby = (r1: TextRegion, r2: TextRegion, threshold = 80): boolean => {
        const centerX1 = r1.boundingBox.x + r1.boundingBox.width / 2
        const centerY1 = r1.boundingBox.y + r1.boundingBox.height / 2
        const centerX2 = r2.boundingBox.x + r2.boundingBox.width / 2
        const centerY2 = r2.boundingBox.y + r2.boundingBox.height / 2

        const distance = Math.sqrt(
            Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
        )

        return distance < threshold
    }

    validRegions.forEach((region) => {
        if (used.has(region.id)) return

        const group: TextRegion[] = [region]
        used.add(region.id)

        // Find all nearby regions
        let foundNew = true
        while (foundNew) {
            foundNew = false
            validRegions.forEach((other) => {
                if (used.has(other.id)) return

                if (group.some(r => isNearby(r, other))) {
                    group.push(other)
                    used.add(other.id)
                    foundNew = true
                }
            })
        }

        // Calculate bounding box for the group
        const minX = Math.min(...group.map(r => r.boundingBox.x))
        const minY = Math.min(...group.map(r => r.boundingBox.y))
        const maxX = Math.max(...group.map(r => r.boundingBox.x + r.boundingBox.width))
        const maxY = Math.max(...group.map(r => r.boundingBox.y + r.boundingBox.height))

        // Add padding
        const padding = 10

        bubbles.push({
            id: uuidv4(),
            boundingBox: {
                x: Math.max(0, minX - padding),
                y: Math.max(0, minY - padding),
                width: maxX - minX + padding * 2,
                height: maxY - minY + padding * 2,
            },
            shape: 'rectangle',
            backgroundColor: '#FFFFFF',
            textRegions: group,
            originalText: group.map(r => r.text).join(' '),
        })
    })

    return bubbles
}

export default useTranslatorStore
