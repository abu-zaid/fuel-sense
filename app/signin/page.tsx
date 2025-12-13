'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';
import AuthPage from '@/components/auth/auth-page';

export default function SignInPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-950 dark:to-slate-900">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-stone-300 dark:border-slate-600 border-t-blue-500 dark:border-t-blue-400 rounded-full" />
        </div>
      </div>
    );
  }

  return user ? null : <AuthPage />;
}
