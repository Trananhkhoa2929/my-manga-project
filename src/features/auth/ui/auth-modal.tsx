'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginInput, RegisterSchema, RegisterInput } from '../schemas';
import { registerAction, socialLogin } from '../actions';
import { Button, Input, Modal, useToast } from '@shared/ui';
import { useAuthModal } from './auth-modal-context';

function LoginTab() {
    const router = useRouter();
    const { close, setView } = useAuthModal();
    const [isPending, setIsPending] = useState(false);
    const { error: toastError, success: toastSuccess } = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: '', password: '' },
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
                close();
                router.refresh();
            }
        } catch {
            toastError('Đã xảy ra lỗi. Vui lòng thử lại!');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-4">
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

            <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-text-secondary">hoặc</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            <Button
                variant="outline"
                className="w-full"
                onClick={() => socialLogin("google")}
                disabled={isPending}
            >
                Tiếp tục với Google
            </Button>

            <p className="text-sm text-text-secondary text-center">
                Chưa có tài khoản?{' '}
                <button onClick={() => setView('register')} className="text-brand-primary hover:underline font-medium">
                    Đăng ký ngay
                </button>
            </p>
        </div>
    );
}

function RegisterTab() {
    const router = useRouter();
    const { close, setView } = useAuthModal();
    const [isPending, setIsPending] = useState(false);
    const { error: toastError, success: toastSuccess } = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: { username: '', email: '', password: '' },
    });

    const onSubmit = async (data: RegisterInput) => {
        setIsPending(true);
        try {
            const res = await registerAction(data);
            if (res?.error) {
                toastError(res.error);
            } else if (res?.success) {
                toastSuccess(res.success);
                setView('login'); // Switch to login tab
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-4">
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

            <p className="text-sm text-text-secondary text-center">
                Đã có tài khoản?{' '}
                <button onClick={() => setView('login')} className="text-brand-primary hover:underline font-medium">
                    Đăng nhập ngay
                </button>
            </p>
        </div>
    );
}

export function AuthModal() {
    const { isOpen, view, close } = useAuthModal();

    return (
        <Modal
            isOpen={isOpen}
            onClose={close}
            title={view === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            size="sm"
        >
            {view === 'login' ? <LoginTab /> : <RegisterTab />}
        </Modal>
    );
}
