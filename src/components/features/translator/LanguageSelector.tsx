'use client'

// ===========================================
// LANGUAGE SELECTOR COMPONENT (ENHANCED)
// Premium source & target language selection
// ===========================================

import React from 'react'
import { ArrowRight, ArrowLeftRight, Globe } from 'lucide-react'
import { useTranslatorStore } from '@/lib/stores/translatorStore'
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/types/translator.types'

export function LanguageSelector() {
    const {
        sourceLanguage,
        targetLanguage,
        setSourceLanguage,
        setTargetLanguage,
        isProcessing,
    } = useTranslatorStore()

    const handleSwap = () => {
        const temp = sourceLanguage
        setSourceLanguage(targetLanguage)
        setTargetLanguage(temp)
    }

    const getLanguageInfo = (code: SupportedLanguage) => {
        return SUPPORTED_LANGUAGES.find(l => l.code === code)
    }

    const sourceLang = getLanguageInfo(sourceLanguage)
    const targetLang = getLanguageInfo(targetLanguage)

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-5 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            {/* Header Icon */}
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30">
                <Globe className="w-5 h-5 text-purple-400" />
            </div>

            {/* Source Language */}
            <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">
                    Ngôn ngữ gốc
                </label>
                <div className="relative">
                    <select
                        value={sourceLanguage}
                        onChange={(e) => setSourceLanguage(e.target.value as SupportedLanguage)}
                        disabled={isProcessing}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl
                       text-white font-semibold text-lg appearance-none
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all cursor-pointer hover:border-gray-500"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.flag} {lang.nativeName}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="text-2xl">{sourceLang?.flag}</span>
                    </div>
                </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center">
                <button
                    onClick={handleSwap}
                    disabled={isProcessing}
                    className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 
                     rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg shadow-purple-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Hoán đổi ngôn ngữ"
                >
                    <ArrowLeftRight className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Arrow (mobile only) */}
            <div className="hidden sm:flex items-center">
                <ArrowRight className="w-5 h-5 text-gray-600" />
            </div>

            {/* Target Language */}
            <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider">
                    Ngôn ngữ đích
                </label>
                <div className="relative">
                    <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
                        disabled={isProcessing}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl
                       text-white font-semibold text-lg appearance-none
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all cursor-pointer hover:border-gray-500"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.flag} {lang.nativeName}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="text-2xl">{targetLang?.flag}</span>
                    </div>
                </div>
            </div>

            {/* Quick info */}
            <div className="hidden lg:flex flex-col items-end text-right">
                <span className="text-sm text-gray-400">
                    {sourceLang?.name} → {targetLang?.name}
                </span>
                <span className="text-xs text-gray-600">
                    Powered by AI
                </span>
            </div>
        </div>
    )
}

export default LanguageSelector
