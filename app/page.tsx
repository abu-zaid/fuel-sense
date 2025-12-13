'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers';
import AuthPage from '@/components/auth/auth-page';
import Dashboard from '@/components/dashboard/dashboard';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-stone-300 border-t-blue-500 rounded-full" />
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}
