// ===========================================
// MANGA TRANSLATOR - TYPE DEFINITIONS
// ===========================================

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface TextRegion {
  id: string
  boundingBox: BoundingBox
  text: string
  confidence: number
  language?: string
}

export interface BubbleRegion {
  id: string
  boundingBox: BoundingBox
  shape: 'ellipse' | 'rectangle' | 'cloud' | 'custom'
  backgroundColor: string
  textRegions: TextRegion[]
  translatedText?: string
  originalText?: string
}

export interface TranslationResult {
  original: string
  translated: string
  from: string
  to: string
}

export interface TextRenderOptions {
  fontFamily: string
  fontSize: number
  fontWeight: string
  color: string
  textAlign: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'middle' | 'bottom'
  isVertical: boolean
  lineHeight: number
}

export interface OCRResult {
  text: string
  confidence: number
  regions: TextRegion[]
}

export interface TranslatorImage {
  id: string
  file: File
  url: string
  width: number
  height: number
}

export type TranslatorStep = 'upload' | 'detect' | 'translate' | 'preview' | 'export'

export type SupportedLanguage = 
  | 'jpn'  // Japanese
  | 'kor'  // Korean
  | 'chi_sim'  // Chinese Simplified
  | 'chi_tra'  // Chinese Traditional
  | 'eng'  // English
  | 'vie'  // Vietnamese

export interface LanguageOption {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'jpn', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'kor', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'chi_tra', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'eng', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'vie', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
]

// Translation API language codes mapping
export const TRANSLATION_LANG_MAP: Record<SupportedLanguage, string> = {
  'jpn': 'ja',
  'kor': 'ko', 
  'chi_sim': 'zh-CN',
  'chi_tra': 'zh-TW',
  'eng': 'en',
  'vie': 'vi',
}
