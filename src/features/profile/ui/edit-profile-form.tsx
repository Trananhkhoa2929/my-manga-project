'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileAction } from '../actions';
import { UpdateProfileSchema, UpdateProfileInput } from '../schemas';
import { Button, Input, Modal, useToast } from '@shared/ui';

interface EditProfileFormProps {
    initialData: {
        displayName?: string | null;
        bio?: string | null;
        website?: string | null;
    };
    isOpen: boolean;
    onClose: () => void;
}

export function EditProfileForm({ initialData, isOpen, onClose }: EditProfileFormProps) {
    const [isPending, startTransition] = useTransition();
    const { error: toastError, success: toastSuccess } = useToast();

    const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: {
            displayName: initialData.displayName || '',
            bio: initialData.bio || '',
            website: initialData.website || '',
        },
    });

    const onSubmit = (data: UpdateProfileInput) => {
        startTransition(() => {
            updateProfileAction(data).then((res) => {
                if (res?.error) {
                    toastError(res.error);
                } else if (res?.success) {
                    toastSuccess(res.success);
                    onClose();
                }
            });
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa hồ sơ" size="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Tên hiển thị"
                    type="text"
                    placeholder="Tên của bạn"
                    error={errors.displayName?.message}
                    {...register('displayName')}
                    disabled={isPending}
                />

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-text-primary">
                        Giới thiệu
                    </label>
                    <textarea
                        className="w-full px-3 py-2 bg-background-surface1 border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                        rows={4}
                        placeholder="Viết vài điều về bạn..."
                        {...register('bio')}
                        disabled={isPending}
                    />
                    {errors.bio && (
                        <p className="text-sm text-red-400">{errors.bio.message}</p>
                    )}
                </div>

                <Input
                    label="Website"
                    type="url"
                    placeholder="https://example.com"
                    error={errors.website?.message}
                    {...register('website')}
                    disabled={isPending}
                />

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
                        Hủy
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isPending}>
                        {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
