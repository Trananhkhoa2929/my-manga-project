'use client'

// ===========================================
// IMAGE UPLOADER COMPONENT (ENHANCED)
// Premium drag & drop with animations
// ===========================================

import React, { useCallback, useState } from 'react'
import { Upload, Image as ImageIcon, X, FileImage, Sparkles } from 'lucide-react'
import { useTranslatorStore } from '@/lib/stores/translatorStore'

export function ImageUploader() {
    const { originalImage, setImage, clearImage, isProcessing } = useTranslatorStore()
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragOver(false)

            const files = Array.from(e.dataTransfer.files)
            const imageFile = files.find((file) => file.type.startsWith('image/'))

            if (imageFile) {
                await setImage(imageFile)
            }
        },
        [setImage]
    )

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                await setImage(file)
            }
        },
        [setImage]
    )

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    if (originalImage) {
        return (
            <div className="relative group rounded-2xl overflow-hidden border-2 border-purple-500/30 bg-gray-900/50">
                <img
                    src={originalImage.url}
                    alt="Uploaded manga"
                    className="w-full h-auto max-h-[500px] object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                        <div className="text-white">
                            <p className="font-medium truncate max-w-[200px]">{originalImage.file.name}</p>
                            <p className="text-sm text-gray-400">
                                {originalImage.width} × {originalImage.height}px • {(originalImage.file.size / 1024 / 1024).toFixed(2)}MB
                            </p>
                        </div>
                        <button
                            onClick={clearImage}
                            className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            disabled={isProcessing}
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Success indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-500/90 rounded-full">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">Sẵn sàng!</span>
                </div>
            </div>
        )
    }

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
        relative border-2 border-dashed rounded-2xl p-12 md:p-16
        transition-all duration-300 cursor-pointer overflow-hidden
        ${isDragOver
                    ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
                    : 'border-gray-600 bg-gradient-to-br from-gray-900/50 to-gray-800/30 hover:border-purple-500/50 hover:bg-gray-800/50'
                }
      `}
        >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.4),transparent_50%)]" />
            </div>

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
            />

            <div className="flex flex-col items-center gap-6 text-center pointer-events-none relative z-10">
                {/* Icon */}
                <div className={`
          relative p-6 rounded-full transition-all duration-300
          ${isDragOver
                        ? 'bg-purple-500/30 scale-110'
                        : 'bg-gradient-to-br from-gray-800 to-gray-900'
                    }
        `}>
                    {isDragOver ? (
                        <ImageIcon className="w-14 h-14 text-purple-400 animate-bounce" />
                    ) : (
                        <Upload className="w-14 h-14 text-gray-400" />
                    )}

                    {/* Pulse ring */}
                    <div className={`
            absolute inset-0 rounded-full border-2 animate-ping opacity-30
            ${isDragOver ? 'border-purple-400' : 'border-gray-600'}
          `} />
                </div>

                {/* Text */}
                <div>
                    <p className="text-xl font-bold text-white mb-2">
                        {isDragOver ? '📥 Thả ảnh vào đây!' : 'Kéo & thả ảnh manga'}
                    </p>
                    <p className="text-gray-400">
                        hoặc <span className="text-purple-400 font-medium">click để chọn file</span>
                    </p>
                </div>

                {/* Supported formats */}
                <div className="flex items-center gap-3">
                    {['PNG', 'JPG', 'WEBP'].map((format) => (
                        <div
                            key={format}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 rounded-lg border border-gray-700"
                        >
                            <FileImage className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs text-gray-400 font-medium">{format}</span>
                        </div>
                    ))}
                </div>

                {/* Size limit */}
                <p className="text-xs text-gray-600">
                    Tối đa 10MB • Khuyến nghị độ phân giải cao
                </p>
            </div>
        </div>
    )
}

export default ImageUploader
