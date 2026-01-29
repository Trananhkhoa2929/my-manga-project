'use client';

import React, { useState, useTransition } from 'react';
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
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit3, Eye, CheckCircle, Clock, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@shared/ui';

export interface Chapter {
    id: string;
    number: number;
    title: string | null;
    status: 'draft' | 'translating' | 'editing' | 'proofreading' | 'published';
    pagesCount: number;
    viewsCount: number;
}

interface ChapterListProps {
    chapters: Chapter[];
    onReorder: (chapters: Chapter[]) => void;
    onStatusChange: (chapterId: string, status: Chapter['status']) => void;
    onEdit: (chapter: Chapter) => void;
    onDelete: (chapterId: string) => void;
}

const statusConfig: Record<Chapter['status'], { label: string; color: string; icon: React.ElementType }> = {
    draft: { label: 'Bản nháp', color: 'bg-gray-500', icon: Edit3 },
    translating: { label: 'Đang dịch', color: 'bg-blue-500', icon: Clock },
    editing: { label: 'Đang sửa', color: 'bg-yellow-500', icon: Edit3 },
    proofreading: { label: 'Đang kiểm tra', color: 'bg-purple-500', icon: Eye },
    published: { label: 'Đã xuất bản', color: 'bg-green-500', icon: CheckCircle },
};

const statusOrder: Chapter['status'][] = ['draft', 'translating', 'editing', 'proofreading', 'published'];

function SortableChapterItem({
    chapter,
    onStatusChange,
    onEdit,
    onDelete,
}: {
    chapter: Chapter;
    onStatusChange: (status: Chapter['status']) => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [isPending, startTransition] = useTransition();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: chapter.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const StatusIcon = statusConfig[chapter.status].icon;

    const handleStatusChange = (newStatus: Chapter['status']) => {
        startTransition(() => {
            onStatusChange(newStatus);
            setShowStatusMenu(false);
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors ${isDragging ? 'shadow-lg ring-2 ring-brand-primary' : ''
                }`}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
            >
                <GripVertical className="w-5 h-5" />
            </button>

            {/* Chapter Number */}
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-lg font-bold">
                {chapter.number}
            </div>

            {/* Chapter Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">
                    {chapter.title || `Chương ${chapter.number}`}
                </h4>
                <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                    <span>{chapter.pagesCount} trang</span>
                    <span>•</span>
                    <span>{chapter.viewsCount.toLocaleString()} lượt xem</span>
                </div>
            </div>

            {/* Status Badge */}
            <div className="relative">
                <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    disabled={isPending}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${statusConfig[chapter.status].color
                        } bg-opacity-20 hover:bg-opacity-30`}
                >
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig[chapter.status].label}
                </button>

                {/* Status Menu */}
                {showStatusMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                        {statusOrder.map((status) => {
                            const config = statusConfig[status];
                            const Icon = config.icon;
                            return (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${chapter.status === status ? 'text-brand-primary' : ''
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                    <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

export function ChapterList({
    chapters,
    onReorder,
    onStatusChange,
    onEdit,
    onDelete,
}: ChapterListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = chapters.findIndex((c) => c.id === active.id);
            const newIndex = chapters.findIndex((c) => c.id === over.id);

            const newChapters = arrayMove(chapters, oldIndex, newIndex).map((c, i) => ({
                ...c,
                number: i + 1,
            }));

            onReorder(newChapters);
        }
    };

    if (chapters.length === 0) {
        return (
            <div className="text-center py-12 text-text-secondary">
                <p>Chưa có chương nào</p>
                <p className="text-sm mt-1">Thêm chương đầu tiên để bắt đầu</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {chapters.map((chapter) => (
                        <SortableChapterItem
                            key={chapter.id}
                            chapter={chapter}
                            onStatusChange={(status) => onStatusChange(chapter.id, status)}
                            onEdit={() => onEdit(chapter)}
                            onDelete={() => onDelete(chapter.id)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
