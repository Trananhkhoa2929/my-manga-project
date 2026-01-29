'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type AuthModalView = 'login' | 'register';

interface AuthModalContextType {
    isOpen: boolean;
    view: AuthModalView;
    openLogin: () => void;
    openRegister: () => void;
    close: () => void;
    setView: (view: AuthModalView) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<AuthModalView>('login');

    const openLogin = () => {
        setView('login');
        setIsOpen(true);
    };

    const openRegister = () => {
        setView('register');
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
    };

    return (
        <AuthModalContext.Provider value={{ isOpen, view, openLogin, openRegister, close, setView }}>
            {children}
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
}
