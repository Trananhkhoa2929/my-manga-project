import { RegisterForm } from '@features/auth';

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
                        MangaHub
                    </h1>
                    <p className="text-text-secondary mt-2">Tạo tài khoản mới</p>
                </div>
                <RegisterForm />
            </div>
        </div>
    );
}
