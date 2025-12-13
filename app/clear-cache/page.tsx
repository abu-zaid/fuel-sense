'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ClearCachePage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const clearAllCaches = async () => {
    setLoading(true);
    setStatus('Clearing caches...');

    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // Clear localStorage
      localStorage.clear();
      
      setStatus('✅ All caches cleared! Reloading...');
      
      // Force reload from server
      setTimeout(() => {
        window.location.href = window.location.href + '?nocache=' + Date.now();
      }, 1000);
    } catch (err) {
      setStatus('❌ Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-white">
            🔧 Cache Manager
          </h1>
          <p className="text-stone-600 dark:text-stone-400">
            Having issues with outdated content or blank screens?
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Clear all cached data</li>
                <li>Unregister service workers</li>
                <li>Clear localStorage</li>
                <li>Force reload from server</li>
              </ul>
            </p>
          </div>

          {status && (
            <div className="p-4 bg-stone-100 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-stone-900 dark:text-white">{status}</p>
            </div>
          )}

          <Button
            onClick={clearAllCaches}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            size="lg"
          >
            {loading ? 'Clearing...' : 'Clear All Caches & Reload'}
          </Button>

          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Back to Home
          </Button>
        </div>

        <div className="pt-4 border-t border-stone-200 dark:border-slate-700">
          <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
            Version: {new Date().toISOString()}
          </p>
        </div>
      </div>
    </div>
  );
}
