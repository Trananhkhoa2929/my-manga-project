'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginInput } from '../schemas';
import { loginAction, socialLogin } from '../actions';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, useToast } from '@shared/ui';
import Link from 'next/link';

export function LoginForm() {
    const [isPending, startTransition] = useTransition();
    const { error: toastError } = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginInput) => {
        startTransition(() => {
            loginAction(data).then((res) => {
                if (res?.error) {
                    toastError(res.error);
                }
            });
        });
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
