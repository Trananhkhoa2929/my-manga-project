'use client'

// ===========================================
// CREDIT PAGE GENERATOR COMPONENT
// Generates attribution page for chapters
// ===========================================

import React, { useMemo } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva'
import type { Credit } from '@/lib/types/editor.types'

interface CreditPageGeneratorProps {
    chapterTitle: string
    chapterNumber: number
    seriesTitle: string
    groupName: string
    credits: Credit[]
    width?: number
    height?: number
    onExport?: (dataUrl: string) => void
}

interface CreditDisplay {
    role: string
    names: string[]
}

const roleLabels: Record<string, string> = {
    translator: 'Dịch thuật',
    editor: 'Chỉnh sửa',
    proofreader: 'Hiệu đính',
    cleaner: 'Cleaning',
    typesetter: 'Typeset',
    quality_check: 'QC',
    raw_provider: 'Raw Provider',
}

export const CreditPageGenerator: React.FC<CreditPageGeneratorProps> = ({
    chapterTitle,
    chapterNumber,
    seriesTitle,
    groupName,
    credits,
    width = 800,
    height = 1200,
    onExport,
}) => {
    const stageRef = React.useRef<any>(null)

    // Group credits by role
    const groupedCredits = useMemo(() => {
        const groups: Record<string, string[]> = {}

        credits.forEach((credit) => {
            const role = credit.role
            if (!groups[role]) {
                groups[role] = []
            }
            // In real app, would fetch user name
            groups[role].push(`User ${credit.user_id?.slice(-4) || 'Unknown'}`)
        })

        return Object.entries(groups).map(([role, names]) => ({
            role: roleLabels[role] || role,
            names,
        }))
    }, [credits])

    const handleExport = () => {
        if (stageRef.current && onExport) {
            const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 })
            onExport(dataUrl)
        }
    }

    return (
        <div className="relative">
            <Stage ref={stageRef} width={width} height={height}>
                <Layer>
                    {/* Background */}
                    <Rect
                        width={width}
                        height={height}
                        fill="#1a1a2e"
                    />

                    {/* Gradient overlay */}
                    <Rect
                        width={width}
                        height={height}
                        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                        fillLinearGradientEndPoint={{ x: width, y: height }}
                        fillLinearGradientColorStops={[
                            0, 'rgba(139, 92, 246, 0.1)',
                            0.5, 'rgba(236, 72, 153, 0.05)',
                            1, 'rgba(139, 92, 246, 0.1)',
                        ]}
                    />

                    {/* Decorative lines */}
                    <Rect x={50} y={80} width={width - 100} height={2} fill="#8b5cf6" opacity={0.5} />
                    <Rect x={50} y={height - 80} width={width - 100} height={2} fill="#8b5cf6" opacity={0.5} />

                    {/* Group Name (Top) */}
                    <Text
                        text={groupName}
                        x={0}
                        y={100}
                        width={width}
                        fontSize={28}
                        fontFamily="Arial"
                        fontStyle="bold"
                        fill="#8b5cf6"
                        align="center"
                    />

                    {/* Series Title */}
                    <Text
                        text={seriesTitle}
                        x={0}
                        y={180}
                        width={width}
                        fontSize={48}
                        fontFamily="Arial"
                        fontStyle="bold"
                        fill="#ffffff"
                        align="center"
                    />

                    {/* Chapter Info */}
                    <Text
                        text={`Chapter ${chapterNumber}`}
                        x={0}
                        y={250}
                        width={width}
                        fontSize={32}
                        fontFamily="Arial"
                        fill="#a0a0a0"
                        align="center"
                    />

                    {chapterTitle && (
                        <Text
                            text={chapterTitle}
                            x={0}
                            y={295}
                            width={width}
                            fontSize={24}
                            fontFamily="Arial"
                            fill="#d0d0d0"
                            align="center"
                        />
                    )}

                    {/* Credits Section */}
                    <Text
                        text="CREDITS"
                        x={0}
                        y={400}
                        width={width}
                        fontSize={20}
                        fontFamily="Arial"
                        fontStyle="bold"
                        fill="#8b5cf6"
                        align="center"
                        letterSpacing={8}
                    />

                    {/* Credit Lines */}
                    {groupedCredits.map((credit, index) => (
                        <Group key={index}>
                            <Text
                                text={credit.role}
                                x={0}
                                y={480 + index * 80}
                                width={width}
                                fontSize={18}
                                fontFamily="Arial"
                                fill="#8b5cf6"
                                align="center"
                            />
                            <Text
                                text={credit.names.join(', ')}
                                x={0}
                                y={505 + index * 80}
                                width={width}
                                fontSize={22}
                                fontFamily="Arial"
                                fontStyle="bold"
                                fill="#ffffff"
                                align="center"
                            />
                        </Group>
                    ))}

                    {/* Footer */}
                    <Text
                        text="Cảm ơn bạn đã đọc!"
                        x={0}
                        y={height - 180}
                        width={width}
                        fontSize={24}
                        fontFamily="Arial"
                        fill="#a0a0a0"
                        align="center"
                    />

                    <Text
                        text="Vui lòng ủng hộ tác giả bằng cách mua manga chính hãng"
                        x={0}
                        y={height - 140}
                        width={width}
                        fontSize={16}
                        fontFamily="Arial"
                        fill="#666666"
                        align="center"
                    />
                </Layer>
            </Stage>

            {/* Export Button */}
            <button
                onClick={handleExport}
                className="absolute bottom-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
                Export Credit Page
            </button>
        </div>
    )
}

// Simple preview version without Konva (for SSR)
export const CreditPagePreview: React.FC<Omit<CreditPageGeneratorProps, 'onExport'>> = ({
    chapterTitle,
    chapterNumber,
    seriesTitle,
    groupName,
    credits,
}) => {
    const groupedCredits = useMemo(() => {
        const groups: Record<string, string[]> = {}
        credits.forEach((credit) => {
            const role = credit.role
            if (!groups[role]) groups[role] = []
            groups[role].push(`User ${credit.user_id?.slice(-4) || 'Unknown'}`)
        })
        return Object.entries(groups).map(([role, names]) => ({
            role: roleLabels[role] || role,
            names,
        }))
    }, [credits])

    return (
        <div className="w-full max-w-lg mx-auto bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-xl p-8 text-center">
            <div className="border-t-2 border-purple-500/50 pt-4 mb-8" />

            <p className="text-purple-400 font-bold text-lg mb-2">{groupName}</p>
            <h1 className="text-3xl font-bold text-white mb-2">{seriesTitle}</h1>
            <p className="text-gray-400 text-xl mb-1">Chapter {chapterNumber}</p>
            {chapterTitle && <p className="text-gray-300">{chapterTitle}</p>}

            <div className="my-8">
                <p className="text-purple-400 font-bold tracking-[0.3em] text-sm mb-6">CREDITS</p>

                <div className="space-y-4">
                    {groupedCredits.map((credit, index) => (
                        <div key={index}>
                            <p className="text-purple-400 text-sm">{credit.role}</p>
                            <p className="text-white font-bold">{credit.names.join(', ')}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-700">
                <p className="text-gray-400">Cảm ơn bạn đã đọc!</p>
                <p className="text-gray-600 text-sm mt-1">
                    Vui lòng ủng hộ tác giả bằng cách mua manga chính hãng
                </p>
            </div>
        </div>
    )
}

export default CreditPageGenerator
