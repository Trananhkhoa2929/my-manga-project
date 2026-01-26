/**
 * Client Component Providers
 * 
 * This file contains client-side providers that need to wrap the application.
 * Separated from layout.tsx to keep the root layout as a server component.
 */

'use client';

import { ToastProvider } from '@shared/ui';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
