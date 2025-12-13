'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ClearCachePage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoCleared, setAutoCleared] = useState(false);

  // Auto-clear on mount for easier recovery
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto') === 'true' && !autoCleared) {
      clearAllCaches();
      setAutoCleared(true);
    }
  }, [autoCleared]);

  const clearAllCaches = async () => {
    setLoading(true);
    setStatus('🧹 Clearing all caches...');

    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      setStatus(`🧹 Deleting ${cacheNames.length} caches...`);
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        setStatus(`🔧 Unregistering ${registrations.length} service workers...`);
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // Clear localStorage
      localStorage.clear();
      
      setStatus('✅ All caches cleared! Reloading in 2 seconds...');
      
      // Force reload from server
      setTimeout(() => {
        window.location.href = '/?t=' + Date.now();
      }, 2000);
    } catch (err) {
      setStatus('❌ Error: ' + (err as Error).message);
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
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ⚠️ Seeing a blank screen or errors?
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This recovery page will fix cache issues by:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Deleting all cached files</li>
                <li>Removing problematic service workers</li>
                <li>Clearing local storage</li>
                <li>Force reloading fresh content</li>
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
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            size="lg"
          >
            {loading ? 'Clearing...' : '🔄 Fix App Now'}
          </Button>

          <div className="text-center text-xs text-stone-500 dark:text-stone-400">
            Or visit: <code className="bg-stone-200 dark:bg-slate-700 px-2 py-1 rounded">/clear-cache?auto=true</code>
            <br />
            for automatic clearing
          </div>

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
