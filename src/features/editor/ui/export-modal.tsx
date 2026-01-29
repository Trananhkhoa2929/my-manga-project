'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@shared/ui';
import {
    useExport,
    ExportFormat,
    ExportQuality,
    exportFormatOptions,
    exportQualityOptions
} from '../hooks/use-export';
import Konva from 'konva';
import { Download, FileImage, Package, Check } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    stage: Konva.Stage | null;
    stages?: Konva.Stage[];
    defaultFileName?: string;
}

export function ExportModal({
    isOpen,
    onClose,
    stage,
    stages = [],
    defaultFileName = 'manga-page',
}: ExportModalProps) {
    const [format, setFormat] = useState<ExportFormat>('png');
    const [quality, setQuality] = useState<ExportQuality>('high');
    const [exportMode, setExportMode] = useState<'single' | 'batch'>('single');
    const [isExporting, setIsExporting] = useState(false);

    const { exportSingle, exportBatch } = useExport();

    const handleExport = async () => {
        if (!stage && exportMode === 'single') return;
        if (stages.length === 0 && exportMode === 'batch') return;

        setIsExporting(true);
        try {
            if (exportMode === 'single' && stage) {
                await exportSingle(stage, {
                    format,
                    quality,
                    fileName: defaultFileName,
                });
            } else if (exportMode === 'batch' && stages.length > 0) {
                await exportBatch(stages, {
                    format,
                    quality,
                    zipName: defaultFileName,
                });
            }
            onClose();
        } finally {
            setIsExporting(false);
        }
    };

    const canBatchExport = stages.length > 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Xuất ảnh">
            <div className="space-y-6">
                {/* Export Mode */}
                {canBatchExport && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Chế độ xuất</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setExportMode('single')}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${exportMode === 'single'
                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <FileImage className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Trang hiện tại</div>
                                    <div className="text-xs text-text-secondary">Xuất 1 ảnh</div>
                                </div>
                                {exportMode === 'single' && <Check className="w-4 h-4 ml-auto" />}
                            </button>
                            <button
                                onClick={() => setExportMode('batch')}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${exportMode === 'batch'
                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <Package className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Tất cả trang</div>
                                    <div className="text-xs text-text-secondary">{stages.length} trang (ZIP)</div>
                                </div>
                                {exportMode === 'batch' && <Check className="w-4 h-4 ml-auto" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Format Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Định dạng</label>
                    <div className="grid grid-cols-3 gap-2">
                        {exportFormatOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFormat(option.value)}
                                className={`p-3 rounded-lg border transition-colors ${format === option.value
                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-text-secondary">{option.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quality Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Chất lượng</label>
                    <div className="grid grid-cols-2 gap-2">
                        {exportQualityOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setQuality(option.value)}
                                className={`p-3 rounded-lg border transition-colors ${quality === option.value
                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-text-secondary">{option.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || (!stage && exportMode === 'single')}
                        isLoading={isExporting}
                        className="flex-1"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? 'Đang xuất...' : 'Xuất ảnh'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
