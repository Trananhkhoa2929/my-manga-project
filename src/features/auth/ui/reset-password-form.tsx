'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema, ResetPasswordInput } from '../schemas';
import { resetPasswordAction } from '../actions';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, useToast } from '@shared/ui';
import Link from 'next/link';

export function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [isPending, startTransition] = useTransition();
    const { error: toastError, success: toastSuccess } = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            token,
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: ResetPasswordInput) => {
        startTransition(() => {
            resetPasswordAction(data).then((res) => {
                if (res?.error) {
                    toastError(res.error);
                } else if (res?.success) {
                    toastSuccess(res.success);
                    setTimeout(() => {
                        router.push('/login');
                    }, 1500);
                }
            });
        });
    };

    if (!token) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="py-8 text-center">
                    <p className="text-red-400 mb-4">Token không hợp lệ hoặc đã hết hạn.</p>
                    <Link href="/forgot-password" className="text-brand-primary hover:underline">
                        Yêu cầu đặt lại mật khẩu mới
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Đặt lại mật khẩu</CardTitle>
                <p className="text-sm text-text-secondary text-center mt-2">
                    Nhập mật khẩu mới của bạn
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input type="hidden" {...register('token')} />
                    <Input
                        label="Mật khẩu mới"
                        type="password"
                        placeholder="******"
                        error={errors.password?.message}
                        {...register('password')}
                        disabled={isPending}
                    />
                    <Input
                        label="Xác nhận mật khẩu"
                        type="password"
                        placeholder="******"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                        disabled={isPending}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center">
                <Link href="/login" className="text-sm text-brand-primary hover:underline font-medium">
                    ← Quay lại đăng nhập
                </Link>
            </CardFooter>
        </Card>
    );
}
