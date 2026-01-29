'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Modal, Button } from '@shared/ui';
import { Upload, X, Image as ImageIcon, GripVertical, Check, AlertCircle } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface UploadedImage {
    id: string;
    file: File;
    preview: string;
    order: number;
}

interface ChapterUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (images: File[]) => Promise<void>;
    projectId: string;
}

function SortableImage({
    image,
    onRemove,
}: {
    image: UploadedImage;
    onRemove: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden border border-gray-700 ${isDragging ? 'ring-2 ring-brand-primary' : ''
                }`}
        >
            <img
                src={image.preview}
                alt={`Page ${image.order}`}
                className="w-full h-full object-cover"
            />

            {/* Page number */}
            <div className="absolute top-2 left-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-xs font-bold">
                {image.order}
            </div>

            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
                <GripVertical className="w-4 h-4" />
            </button>

            {/* Remove button */}
            <button
                onClick={onRemove}
                className="absolute bottom-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ChapterUpload({
    isOpen,
    onClose,
    onUpload,
}: ChapterUploadProps) {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const processFiles = useCallback((files: FileList | File[]) => {
        const imageFiles = Array.from(files).filter(file =>
            file.type.startsWith('image/')
        );

        if (imageFiles.length === 0) {
            setError('Không tìm thấy file ảnh hợp lệ');
            return;
        }

        const newImages: UploadedImage[] = imageFiles.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            file,
            preview: URL.createObjectURL(file),
            order: images.length + i + 1,
        }));

        setImages(prev => [...prev, ...newImages]);
        setError(null);
    }, [images.length]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    }, [processFiles]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setImages(prev => {
                const oldIndex = prev.findIndex(img => img.id === active.id);
                const newIndex = prev.findIndex(img => img.id === over.id);

                return arrayMove(prev, oldIndex, newIndex).map((img, i) => ({
                    ...img,
                    order: i + 1,
                }));
            });
        }
    };

    const removeImage = useCallback((id: string) => {
        setImages(prev => {
            const filtered = prev.filter(img => img.id !== id);
            // Revoke URL for removed image
            const removed = prev.find(img => img.id === id);
            if (removed) {
                URL.revokeObjectURL(removed.preview);
            }
            // Reorder remaining
            return filtered.map((img, i) => ({ ...img, order: i + 1 }));
        });
    }, []);

    const handleUpload = async () => {
        if (images.length === 0) return;

        setIsUploading(true);
        setError(null);

        try {
            // Sort by order and extract files
            const sortedFiles = images
                .sort((a, b) => a.order - b.order)
                .map(img => img.file);

            await onUpload(sortedFiles);

            // Cleanup previews
            images.forEach(img => URL.revokeObjectURL(img.preview));
            setImages([]);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload thất bại');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        // Cleanup previews
        images.forEach(img => URL.revokeObjectURL(img.preview));
        setImages([]);
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Thêm chương mới" size="xl">
            <div className="space-y-4">
                {/* Upload Area */}
                <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragOver
                            ? 'border-brand-primary bg-brand-primary/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Kéo thả hoặc click để chọn ảnh</p>
                    <p className="text-sm text-text-secondary mt-1">
                        Hỗ trợ PNG, JPG, WebP. Có thể chọn nhiều ảnh.
                    </p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Image Grid */}
                {images.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{images.length} trang</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    images.forEach(img => URL.revokeObjectURL(img.preview));
                                    setImages([]);
                                }}
                            >
                                Xóa tất cả
                            </Button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-80 overflow-y-auto p-1">
                                    {images.map(image => (
                                        <SortableImage
                                            key={image.id}
                                            image={image}
                                            onRemove={() => removeImage(image.id)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        <p className="text-xs text-text-secondary mt-2">
                            Kéo thả để sắp xếp thứ tự trang
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={images.length === 0 || isUploading}
                        isLoading={isUploading}
                        className="flex-1"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        {isUploading ? 'Đang upload...' : `Upload ${images.length} trang`}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
