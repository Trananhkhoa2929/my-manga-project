import { auth } from '@shared/config/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserSettings, SettingsForm } from '@features/settings';

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const { data: settings, error } = await getUserSettings();

    if (error || !settings) {
        return <div>Error loading settings</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/profile"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                >
                    ← Quay lại hồ sơ
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-6">Cài đặt tài khoản</h1>

            <div className="max-w-2xl">
                <SettingsForm initialSettings={settings} />
            </div>
        </div>
    );
}
