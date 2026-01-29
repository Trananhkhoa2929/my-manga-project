'use client';

import { useState, useTransition } from 'react';
import { updateUserSettings, clearReadingHistory, deleteAccount } from '@features/settings/actions';
import { UserSettingsInput } from '@features/settings/schemas';
import { Button, Card, CardHeader, CardTitle, CardContent, useToast } from '@shared/ui';
import { signOut } from 'next-auth/react';
import {
    Moon, Sun, Monitor, Bell, BellOff, Mail,
    BookOpen, Trash2, AlertTriangle, Languages,
    Image, ArrowRight, ArrowLeft, ArrowDown
} from 'lucide-react';

interface SettingsFormProps {
    initialSettings: UserSettingsInput;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [isPending, startTransition] = useTransition();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { error: toastError, success: toastSuccess } = useToast();

    const handleChange = (key: keyof UserSettingsInput, value: unknown) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        startTransition(() => {
            updateUserSettings(newSettings).then((res) => {
                if (res?.error) {
                    toastError(res.error);
                } else if (res?.success) {
                    toastSuccess(res.success);
                }
            });
        });
    };

    const handleClearHistory = () => {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử đọc?')) return;

        startTransition(() => {
            clearReadingHistory().then((res) => {
                if (res?.error) toastError(res.error);
                else if (res?.success) toastSuccess(res.success);
            });
        });
    };

    const handleDeleteAccount = () => {
        startTransition(() => {
            deleteAccount().then((res) => {
                if (res?.error) {
                    toastError(res.error);
                } else if (res?.success) {
                    signOut({ callbackUrl: '/' });
                }
            });
        });
    };

    return (
        <div className="space-y-6">
            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sun className="w-5 h-5" />
                        Giao diện
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Chủ đề</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'light', icon: Sun, label: 'Sáng' },
                                { value: 'dark', icon: Moon, label: 'Tối' },
                                { value: 'system', icon: Monitor, label: 'Hệ thống' },
                            ].map(({ value, icon: Icon, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleChange('theme', value)}
                                    disabled={isPending}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${settings.theme === value
                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                        : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'vi', label: '🇻🇳 Tiếng Việt' },
                                { value: 'en', label: '🇺🇸 English' },
                                { value: 'ja', label: '🇯🇵 日本語' },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleChange('language', value)}
                                    disabled={isPending}
                                    className={`px-4 py-2 rounded-lg border transition-colors ${settings.language === value
                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                        : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reading */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Đọc truyện
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Hướng đọc</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'ltr', icon: ArrowRight, label: 'Trái → Phải' },
                                { value: 'rtl', icon: ArrowLeft, label: 'Phải → Trái' },
                                { value: 'vertical', icon: ArrowDown, label: 'Cuộn dọc' },
                            ].map(({ value, icon: Icon, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleChange('readingDirection', value)}
                                    disabled={isPending}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${settings.readingDirection === value
                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                        : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Chất lượng ảnh</label>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { value: 'low', label: 'Thấp (tiết kiệm data)' },
                                { value: 'medium', label: 'Trung bình' },
                                { value: 'high', label: 'Cao' },
                                { value: 'original', label: 'Gốc' },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleChange('imageQuality', value)}
                                    disabled={isPending}
                                    className={`px-4 py-2 rounded-lg border transition-colors ${settings.imageQuality === value
                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                        : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Thông báo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { key: 'emailNotifications', icon: Mail, label: 'Thông báo qua email' },
                        { key: 'chapterNotifications', icon: BookOpen, label: 'Chương mới từ truyện đang theo dõi' },
                        { key: 'commentNotifications', icon: Bell, label: 'Phản hồi bình luận' },
                    ].map(({ key, icon: Icon, label }) => (
                        <button
                            key={key}
                            onClick={() => handleChange(key as keyof UserSettingsInput, !settings[key as keyof UserSettingsInput])}
                            disabled={isPending}
                            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <span className="flex items-center gap-3">
                                <Icon className="w-5 h-5 text-text-secondary" />
                                {label}
                            </span>
                            <div className={`w-10 h-6 rounded-full transition-colors relative ${settings[key as keyof UserSettingsInput] ? 'bg-brand-primary' : 'bg-gray-600'
                                }`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings[key as keyof UserSettingsInput] ? 'translate-x-5' : 'translate-x-1'
                                    }`} />
                            </div>
                        </button>
                    ))}
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-500/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        Vùng nguy hiểm
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700">
                        <div>
                            <p className="font-medium">Xóa lịch sử đọc</p>
                            <p className="text-sm text-text-secondary">Xóa toàn bộ lịch sử đọc truyện</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearHistory}
                            disabled={isPending}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/30 bg-red-500/5">
                        <div>
                            <p className="font-medium text-red-400">Xóa tài khoản</p>
                            <p className="text-sm text-text-secondary">Xóa vĩnh viễn tài khoản và tất cả dữ liệu</p>
                        </div>
                        {!showDeleteConfirm ? (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Xóa tài khoản
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleDeleteAccount}
                                    disabled={isPending}
                                >
                                    Xác nhận xóa
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
