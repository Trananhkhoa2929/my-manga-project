'use client';

import { useState } from 'react';
import { Button } from '@shared/ui';
import { EditProfileForm } from '@features/profile/ui/edit-profile-form';
import { Settings } from 'lucide-react';

interface ProfileActionsProps {
    profile: {
        displayName?: string | null;
        bio?: string | null;
        website?: string | null;
    };
}

export function ProfileActions({ profile }: ProfileActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="w-full"
            >
                <Settings className="w-4 h-4 mr-2" />
                Chỉnh sửa hồ sơ
            </Button>

            <EditProfileForm
                initialData={profile}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />
        </>
    );
}
