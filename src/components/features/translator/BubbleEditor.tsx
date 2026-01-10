'use client'

// ===========================================
// BUBBLE EDITOR COMPONENT (ENHANCED)
// Premium display and edit detected text bubbles
// ===========================================

import React from 'react'
import { Edit3, Check, X, MessageCircle, Type, Sparkles, AlertTriangle } from 'lucide-react'
import { useTranslatorStore } from '@/lib/stores/translatorStore'
import { BubbleRegion } from '@/lib/types/translator.types'

interface BubbleItemProps {
    bubble: BubbleRegion
    index: number
    isSelected: boolean
    onSelect: () => void
    onUpdateText: (text: string) => void
}

function BubbleItem({ bubble, index, isSelected, onSelect, onUpdateText }: BubbleItemProps) {
    const [isEditing, setIsEditing] = React.useState(false)
    const [editText, setEditText] = React.useState(bubble.translatedText || '')

    React.useEffect(() => {
        setEditText(bubble.translatedText || '')
    }, [bubble.translatedText])

    const handleSave = () => {
        onUpdateText(editText)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditText(bubble.translatedText || '')
        setIsEditing(false)
    }

    const hasTranslation = !!bubble.translatedText

    return (
        <div
            onClick={onSelect}
            className={`
        group p-4 rounded-xl border transition-all cursor-pointer
        ${isSelected
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                    : 'border-gray-700/50 bg-gray-900/30 hover:border-gray-600 hover:bg-gray-800/30'
                }
      `}
        >
            <div className="flex items-start gap-3">
                {/* Index Badge */}
                <div className={`
          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
          ${hasTranslation
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }
        `}>
                    {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Original Text */}
                    <div className="mb-3">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Type className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium uppercase">Gốc</span>
                        </div>
                        <p className="text-sm text-gray-300 break-words leading-relaxed p-2 bg-gray-800/50 rounded-lg">
                            {bubble.originalText || <span className="text-gray-600 italic">(Không có văn bản)</span>}
                        </p>
                    </div>

                    {/* Translated Text */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span className="text-xs text-purple-400 font-medium uppercase">Dịch</span>
                        </div>

                        {isEditing ? (
                            <div className="flex gap-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-gray-800 border border-purple-500 rounded-lg
                             text-white text-sm resize-none
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    rows={3}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) handleSave()
                                        if (e.key === 'Escape') handleCancel()
                                    }}
                                />
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleSave()
                                        }}
                                        className="p-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                                        title="Lưu (Ctrl+Enter)"
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleCancel()
                                        }}
                                        className="p-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                                        title="Hủy (Esc)"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2">
                                <p className={`
                  flex-1 text-sm break-words leading-relaxed p-2 rounded-lg
                  ${hasTranslation
                                        ? 'text-green-300 bg-green-900/20 border border-green-500/20'
                                        : 'text-gray-500 italic bg-gray-800/50'
                                    }
                `}>
                                    {bubble.translatedText || '(Chưa dịch)'}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsEditing(true)
                                    }}
                                    className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                                    title="Chỉnh sửa"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function BubbleEditor() {
    const {
        detectedBubbles,
        selectedBubbleId,
        selectBubble,
        updateBubbleText,
        isProcessing,
        currentStep,
    } = useTranslatorStore()

    const translatedCount = detectedBubbles.filter(b => b.translatedText).length

    if (currentStep === 'upload') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Bắt đầu dịch manga</h3>
                <p className="text-sm text-gray-500 max-w-[250px]">
                    Upload ảnh manga để phát hiện và dịch các text bubble tự động
                </p>
            </div>
        )
    }

    if (detectedBubbles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Chưa phát hiện bubble</h3>
                <p className="text-sm text-gray-500 max-w-[250px]">
                    Nhấn <span className="text-purple-400 font-medium">"Phát Hiện Văn Bản"</span> để bắt đầu
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    Text Bubbles
                </h3>
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-purple-600/30 rounded-full text-xs text-purple-300 font-medium">
                        {detectedBubbles.length} bubble
                    </span>
                    {translatedCount > 0 && (
                        <span className="px-2.5 py-1 bg-green-600/30 rounded-full text-xs text-green-300 font-medium">
                            {translatedCount} đã dịch
                        </span>
                    )}
                </div>
            </div>

            {/* Bubble List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {detectedBubbles.map((bubble, index) => (
                    <BubbleItem
                        key={bubble.id}
                        bubble={bubble}
                        index={index}
                        isSelected={selectedBubbleId === bubble.id}
                        onSelect={() => selectBubble(bubble.id)}
                        onUpdateText={(text) => updateBubbleText(bubble.id, text)}
                    />
                ))}
            </div>

            {/* Helper text */}
            <div className="mt-4 pt-3 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center">
                    💡 Click vào bubble trên ảnh để chọn • Ctrl+Enter để lưu chỉnh sửa
                </p>
            </div>
        </div>
    )
}

export default BubbleEditor
