'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { registerServiceWorker } from './register-sw';
import { LazyMotion, domAnimation } from 'framer-motion';
import { ThemeProvider } from './theme-provider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Register service worker immediately but non-blocking
        registerServiceWorker();

        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setUser(session?.user ?? null);
          }
        );

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ user, loading, signOut }}>
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
