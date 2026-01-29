'use client';

import { useCallback, useRef } from 'react';
import Konva from 'konva';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export type ExportFormat = 'png' | 'jpg' | 'webp';
export type ExportQuality = 'low' | 'medium' | 'high' | 'original';

interface ExportOptions {
    format: ExportFormat;
    quality: ExportQuality;
    fileName?: string;
}

interface BatchExportOptions {
    format: ExportFormat;
    quality: ExportQuality;
    zipName?: string;
}

interface UseExportReturn {
    /** Export single page from stage */
    exportSingle: (stage: Konva.Stage, options: ExportOptions) => Promise<void>;
    /** Export multiple stages as ZIP */
    exportBatch: (stages: Konva.Stage[], options: BatchExportOptions) => Promise<void>;
    /** Get data URL from stage */
    getDataUrl: (stage: Konva.Stage, format: ExportFormat, quality: ExportQuality) => string;
}

/**
 * Quality to pixel ratio mapping
 */
const qualityToPixelRatio: Record<ExportQuality, number> = {
    low: 0.5,
    medium: 1,
    high: 2,
    original: 3,
};

/**
 * Quality to JPEG/WebP quality mapping (0-1)
 */
const qualityToJpegQuality: Record<ExportQuality, number> = {
    low: 0.6,
    medium: 0.8,
    high: 0.92,
    original: 1,
};

/**
 * Format to MIME type mapping
 */
const formatToMimeType: Record<ExportFormat, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    webp: 'image/webp',
};

/**
 * useExport hook
 * Provides export functionality for Konva stages
 */
export function useExport(): UseExportReturn {
    const isExportingRef = useRef(false);

    /**
     * Get data URL from stage
     */
    const getDataUrl = useCallback((
        stage: Konva.Stage,
        format: ExportFormat,
        quality: ExportQuality
    ): string => {
        const pixelRatio = qualityToPixelRatio[quality];
        const mimeType = formatToMimeType[format];
        const jpegQuality = format !== 'png' ? qualityToJpegQuality[quality] : undefined;

        return stage.toDataURL({
            mimeType,
            pixelRatio,
            quality: jpegQuality,
        });
    }, []);

    /**
     * Convert data URL to Blob
     */
    const dataUrlToBlob = useCallback((dataUrl: string): Blob => {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }, []);

    /**
     * Export single page
     */
    const exportSingle = useCallback(async (
        stage: Konva.Stage,
        options: ExportOptions
    ): Promise<void> => {
        if (isExportingRef.current) return;
        isExportingRef.current = true;

        try {
            const { format, quality, fileName = 'manga-page' } = options;
            const dataUrl = getDataUrl(stage, format, quality);
            const blob = dataUrlToBlob(dataUrl);
            const extension = format === 'jpg' ? 'jpg' : format;

            saveAs(blob, `${fileName}.${extension}`);
        } finally {
            isExportingRef.current = false;
        }
    }, [getDataUrl, dataUrlToBlob]);

    /**
     * Export multiple pages as ZIP
     */
    const exportBatch = useCallback(async (
        stages: Konva.Stage[],
        options: BatchExportOptions
    ): Promise<void> => {
        if (isExportingRef.current || stages.length === 0) return;
        isExportingRef.current = true;

        try {
            const { format, quality, zipName = 'manga-pages' } = options;
            const zip = new JSZip();
            const extension = format === 'jpg' ? 'jpg' : format;

            // Process each stage
            for (let i = 0; i < stages.length; i++) {
                const stage = stages[i];
                const dataUrl = getDataUrl(stage, format, quality);
                const blob = dataUrlToBlob(dataUrl);

                // Pad page number for proper sorting
                const pageNum = String(i + 1).padStart(3, '0');
                zip.file(`page_${pageNum}.${extension}`, blob);
            }

            // Generate and download ZIP
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${zipName}.zip`);
        } finally {
            isExportingRef.current = false;
        }
    }, [getDataUrl, dataUrlToBlob]);

    return {
        exportSingle,
        exportBatch,
        getDataUrl,
    };
}

/**
 * Export quality options for UI
 */
export const exportQualityOptions = [
    { value: 'low' as ExportQuality, label: 'Thấp (nhanh)', description: '50% kích thước' },
    { value: 'medium' as ExportQuality, label: 'Trung bình', description: '100% kích thước' },
    { value: 'high' as ExportQuality, label: 'Cao', description: '2x kích thước' },
    { value: 'original' as ExportQuality, label: 'Gốc', description: '3x kích thước' },
];

/**
 * Export format options for UI
 */
export const exportFormatOptions = [
    { value: 'png' as ExportFormat, label: 'PNG', description: 'Chất lượng cao, trong suốt' },
    { value: 'jpg' as ExportFormat, label: 'JPG', description: 'Nhẹ, phù hợp web' },
    { value: 'webp' as ExportFormat, label: 'WebP', description: 'Hiện đại, nén tốt' },
];
