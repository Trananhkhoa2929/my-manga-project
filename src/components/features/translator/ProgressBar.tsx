'use client'

// ===========================================
// PROGRESS BAR COMPONENT (ENHANCED)
// Premium animated progress indicator
// ===========================================

import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { useTranslatorStore } from '@/lib/stores/translatorStore'

export function ProgressBar() {
    const { isProcessing, processingMessage, progress } = useTranslatorStore()

    if (!isProcessing) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex flex-col items-center gap-6">
                    {/* Animated Icon Container */}
                    <div className="relative">
                        {/* Outer ring */}
                        <div className="w-24 h-24 rounded-full border-4 border-gray-700" />

                        {/* Progress ring */}
                        <svg className="absolute inset-0 w-24 h-24 -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="44"
                                stroke="url(#progressGradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 44}`}
                                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                                className="transition-all duration-300"
                            />
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#A855F7" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
                        </div>

                        {/* Spinning loader ring */}
                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
                    </div>

                    {/* Message */}
                    <div className="text-center">
                        <p className="text-xl font-bold text-white mb-1">
                            {processingMessage || 'Đang xử lý...'}
                        </p>
                        <p className="text-sm text-gray-400">
                            Vui lòng đợi trong giây lát
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Tiến trình</span>
                            <span className="text-sm font-bold text-purple-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </div>
                        </div>
                    </div>

                    {/* Fun facts */}
                    <div className="text-center p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                        <p className="text-xs text-gray-500">
                            💡 Độ chính xác OCR phụ thuộc vào chất lượng ảnh và font chữ trong manga
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom animation style */}
            <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
        </div>
    )
}

export default ProgressBar
