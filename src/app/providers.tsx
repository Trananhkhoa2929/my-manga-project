/**
 * Client Component Providers
 * 
 * This file contains client-side providers that need to wrap the application.
 * Separated from layout.tsx to keep the root layout as a server component.
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@shared/ui';
import { AuthModalProvider } from '@features/auth/ui/auth-modal-context';
import { AuthModal } from '@features/auth/ui/auth-modal';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <AuthModalProvider>
          {children}
          <AuthModal />
        </AuthModalProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
