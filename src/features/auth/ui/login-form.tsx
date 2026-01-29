'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginInput } from '../schemas';
import { socialLogin } from '../actions';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, useToast } from '@shared/ui';
import Link from 'next/link';

export function LoginForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const { error: toastError, success: toastSuccess } = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginInput) => {
        setIsPending(true);
        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toastError('Email hoặc mật khẩu không chính xác!');
            } else if (result?.ok) {
                toastSuccess('Đăng nhập thành công!');
                router.push('/');
                router.refresh();
            }
        } catch {
            toastError('Đã xảy ra lỗi. Vui lòng thử lại!');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
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
                    <Input
                        label="Mật khẩu"
                        type="password"
                        placeholder="******"
                        error={errors.password?.message}
                        {...register('password')}
                        disabled={isPending}
                    />
                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-sm text-brand-primary hover:underline">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Đang xử lý...' : 'Đăng nhập'}
                    </Button>
                </form>

                <div className="mt-4 flex items-center justify-between">
                    <div className="w-full h-[1px] bg-border"></div>
                    <span className="px-2 text-sm text-text-secondary">hoặc</span>
                    <div className="w-full h-[1px] bg-border"></div>
                </div>

                <div className="mt-4">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => socialLogin("google")}
                        disabled={isPending}
                    >
                        Tiếp tục với Google
                    </Button>
                </div>

            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-text-secondary">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-brand-primary hover:underline font-medium">
                        Đăng ký ngay
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
