'use client'

// ===========================================
// TRANSLATOR TOOL - MAIN COMPONENT (ENHANCED)
// Complete manga translation workflow with API integration
// ===========================================

import React, { useEffect } from 'react'
import {
    Upload,
    ScanSearch,
    Languages,
    Image as ImageIcon,
    Download,
    RotateCcw,
    Sparkles,
    ChevronRight,
    AlertCircle,
    Wand2,
    Zap,
    Check,
    ArrowRight,
} from 'lucide-react'
import { useTranslatorStore } from '@/lib/stores/translatorStore'
import { ImageUploader } from './ImageUploader'
import { LanguageSelector } from './LanguageSelector'
import { BubbleEditor } from './BubbleEditor'
import { TranslationPreview } from './TranslationPreview'
import { ProgressBar } from './ProgressBar'

// Feature cards for hero section
function FeatureCards() {
    const features = [
        {
            icon: ScanSearch,
            title: 'OCR Thông Minh',
            desc: 'Phát hiện tự động text bubble từ manga',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Languages,
            title: 'Đa Ngôn Ngữ',
            desc: 'Hỗ trợ JP, KR, CN, EN, VI',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Wand2,
            title: 'AI Dịch Thuật',
            desc: 'Dịch chính xác với ngữ cảnh',
            color: 'from-orange-500 to-red-500',
        },
        {
            icon: Zap,
            title: 'Xử Lý Nhanh',
            desc: 'Server-side processing hiệu suất cao',
            color: 'from-green-500 to-emerald-500',
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {features.map((feature, idx) => (
                <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl bg-gray-900/50 border border-gray-800 p-5 hover:border-gray-700 transition-all hover:scale-[1.02]"
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${feature.color} mb-3`}>
                        <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
            ))}
        </div>
    )
}

// Step indicator component (enhanced)
function StepIndicator() {
    const { currentStep, detectedBubbles, processedImageUrl } = useTranslatorStore()

    const steps = [
        { id: 'upload', label: 'Upload', icon: Upload, desc: 'Tải ảnh lên' },
        { id: 'detect', label: 'Phát Hiện', icon: ScanSearch, desc: 'OCR văn bản' },
        { id: 'translate', label: 'Dịch', icon: Languages, desc: 'Dịch sang tiếng Việt' },
        { id: 'preview', label: 'Xem Trước', icon: ImageIcon, desc: 'Xem kết quả' },
        { id: 'export', label: 'Xuất File', icon: Download, desc: 'Tải về máy' },
    ]

    const currentIndex = steps.findIndex((s) => s.id === currentStep)

    return (
        <div className="relative mb-10">
            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-800 hidden md:block">
                <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                />
            </div>

            <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isActive = step.id === currentStep
                    const isCompleted = index < currentIndex

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`
                  relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
                  ${isActive
                                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-110'
                                        : isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-800 text-gray-500'
                                    }
                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>
                            <span className={`mt-2 text-sm font-medium ${isActive ? 'text-purple-400' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                            <span className="text-xs text-gray-600 hidden md:block">{step.desc}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Action buttons based on current step (enhanced)
function ActionButtons() {
    const {
        currentStep,
        originalImage,
        detectedBubbles,
        processedImageUrl,
        isProcessing,
        detectAndExtract,
        translateAll,
        processAndRender,
        exportResult,
        reset,
    } = useTranslatorStore()

    const buttonConfigs = {
        detect: {
            show: originalImage !== null,
            onClick: detectAndExtract,
            icon: ScanSearch,
            label: 'Phát Hiện Văn Bản',
            gradient: 'from-purple-600 to-pink-600',
            shadow: 'shadow-purple-500/30',
        },
        translate: {
            show: detectedBubbles.length > 0,
            onClick: translateAll,
            icon: Languages,
            label: 'Dịch Tất Cả',
            gradient: 'from-blue-600 to-cyan-600',
            shadow: 'shadow-blue-500/30',
        },
        preview: {
            show: detectedBubbles.some(b => b.translatedText),
            onClick: processAndRender,
            icon: Wand2,
            label: 'Tạo Ảnh Dịch',
            gradient: 'from-green-600 to-emerald-600',
            shadow: 'shadow-green-500/30',
        },
        export: {
            show: processedImageUrl !== null,
            onClick: () => { },
            icon: Download,
            label: 'Tải Về',
            gradient: 'from-orange-600 to-amber-600',
            shadow: 'shadow-orange-500/30',
        },
    }

    const currentConfig = buttonConfigs[currentStep as keyof typeof buttonConfigs]

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {currentConfig?.show && currentStep !== 'export' && (
                <button
                    onClick={currentConfig.onClick}
                    disabled={isProcessing}
                    className={`
            group flex items-center gap-3 px-8 py-4 
            bg-gradient-to-r ${currentConfig.gradient}
            hover:opacity-90 rounded-2xl font-bold text-white text-lg
            shadow-xl ${currentConfig.shadow} 
            transition-all hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          `}
                >
                    <currentConfig.icon className="w-6 h-6 group-hover:animate-pulse" />
                    {currentConfig.label}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            )}

            {currentStep === 'export' && processedImageUrl && (
                <div className="flex gap-4">
                    <button
                        onClick={() => exportResult('png')}
                        disabled={isProcessing}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 
                       hover:opacity-90 rounded-2xl font-bold text-white text-lg
                       shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-6 h-6" />
                        Tải PNG
                    </button>
                    <button
                        onClick={() => exportResult('jpeg')}
                        disabled={isProcessing}
                        className="flex items-center gap-3 px-8 py-4 bg-gray-700 hover:bg-gray-600
                       rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-6 h-6" />
                        Tải JPG
                    </button>
                </div>
            )}

            {originalImage && (
                <button
                    onClick={reset}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-4 bg-gray-800/50 hover:bg-gray-800
                     rounded-2xl font-medium text-gray-300 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RotateCcw className="w-5 h-5" />
                    Làm Mới
                </button>
            )}
        </div>
    )
}

// Error display component
function ErrorDisplay() {
    const { error } = useTranslatorStore()

    if (!error) return null

    return (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
        </div>
    )
}

// Statistics bar
function StatsBar() {
    const { detectedBubbles, originalImage } = useTranslatorStore()

    const translatedCount = detectedBubbles.filter(b => b.translatedText).length

    if (!originalImage) return null

    return (
        <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-gray-900/30 rounded-xl border border-gray-800">
            <div className="text-center">
                <div className="text-2xl font-bold text-white">{originalImage.width}×{originalImage.height}</div>
                <div className="text-xs text-gray-500">Kích thước ảnh</div>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{detectedBubbles.length}</div>
                <div className="text-xs text-gray-500">Bubble phát hiện</div>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{translatedCount}</div>
                <div className="text-xs text-gray-500">Đã dịch</div>
            </div>
        </div>
    )
}

export function TranslatorTool() {
    const { currentStep, originalImage, reset } = useTranslatorStore()

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Don't reset on unmount to preserve state
        }
    }, [])

    return (
        <div className="min-h-screen py-8 px-4">
            <ProgressBar />

            {/* Hero Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-300 font-medium">AI Powered Translation</span>
                    <span className="px-2 py-0.5 bg-purple-600 rounded-full text-xs text-white font-bold">NEW</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                        Manga Translator
                    </span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Dịch manga từ tiếng Nhật, Hàn, Trung sang tiếng Việt một cách tự động
                    với công nghệ <span className="text-purple-400 font-semibold">OCR</span> và
                    <span className="text-pink-400 font-semibold"> AI Translation</span>
                </p>
            </div>

            {/* Feature Cards - Only show on upload step */}
            {currentStep === 'upload' && <FeatureCards />}

            {/* Step Indicator */}
            <StepIndicator />

            {/* Error Display */}
            <ErrorDisplay />

            {/* Stats Bar */}
            <StatsBar />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {/* Language Selector - Always visible after upload */}
                {originalImage && (
                    <div className="mb-6">
                        <LanguageSelector />
                    </div>
                )}

                {/* Step Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Upload/Original Image */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    {currentStep === 'upload' ? (
                                        <>
                                            <Upload className="w-5 h-5 text-purple-400" />
                                            Tải Ảnh Manga
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-5 h-5 text-purple-400" />
                                            Xem Trước
                                        </>
                                    )}
                                </h2>
                            </div>

                            {currentStep === 'upload' ? (
                                <ImageUploader />
                            ) : (
                                <TranslationPreview />
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Controls & Bubble Editor */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 sticky top-20 backdrop-blur-sm">
                            <BubbleEditor />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <ActionButtons />

                {/* Tips Section */}
                {currentStep === 'upload' && (
                    <div className="mt-12 p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/20">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Mẹo sử dụng
                        </h3>
                        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-400">
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                Sử dụng ảnh có độ phân giải cao để OCR chính xác hơn
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                Chọn đúng ngôn ngữ gốc của manga
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                Chỉnh sửa bản dịch nếu cần thiết trước khi xuất
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                Ảnh nên có text bubble rõ ràng, không bị che khuất
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TranslatorTool
