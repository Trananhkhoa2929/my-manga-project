'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterInput } from '../schemas';
import { registerAction } from '../actions';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@shared/ui';
import Link from 'next/link';

export function RegisterForm() {
    const [isPending, startTransition] = useTransition();
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: RegisterInput) => {
        startTransition(() => {
            registerAction(data).then((res) => {
                if (res?.error) {
                    console.error(res.error);
                }
            });
        });
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Đăng ký</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Username"
                        type="text"
                        placeholder="wibu_lord"
                        error={errors.username?.message}
                        {...register('username')}
                        disabled={isPending}
                    />
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
                        {isPending ? 'Đang xử lý...' : 'Đăng ký'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-text-secondary">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="text-brand-primary hover:underline font-medium">
                        Đăng nhập ngay
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
