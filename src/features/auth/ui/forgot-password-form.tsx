'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchema, ForgotPasswordInput } from '../schemas';
import { forgotPasswordAction } from '../actions';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, useToast } from '@shared/ui';
import Link from 'next/link';

export function ForgotPasswordForm() {
    const [isPending, startTransition] = useTransition();
    const { error: toastError, success: toastSuccess } = useToast();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = (data: ForgotPasswordInput) => {
        startTransition(() => {
            forgotPasswordAction(data).then((res) => {
                if (res?.error) {
                    toastError(res.error);
                } else if (res?.success) {
                    toastSuccess(res.success);
                    reset();
                    // Dev only: log token for testing
                    if (res.devToken) {
                        console.log('[DEV] Reset token:', res.devToken);
                        console.log('[DEV] Use URL: /reset-password?token=' + res.devToken);
                    }
                }
            });
        });
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Quên mật khẩu</CardTitle>
                <p className="text-sm text-text-secondary text-center mt-2">
                    Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="example@mangahub.com"
                        error={errors.email?.message}
                        {...register('email')}
                        disabled={isPending}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Đang xử lý...' : 'Gửi hướng dẫn'}
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
