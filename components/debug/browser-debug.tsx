'use client';

import { useEffect } from 'react';
import { getBrowserInfo, isMobile, isIOS, isAndroid, browserSupport } from '@/lib/browser-compat';

/**
 * Debug component to help troubleshoot browser compatibility issues
 * Only renders in development mode or when ?debug=true query param is present
 */
export default function BrowserDebugInfo() {
  useEffect(() => {
    // Check if we should show debug info
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = process.env.NODE_ENV === 'development' || urlParams.get('debug') === 'true';

    if (!debugMode) return;

    const browserInfo = getBrowserInfo();
    
    console.group('🔍 Browser Debug Information');
    console.log('Browser:', `${browserInfo.name} ${browserInfo.version}`);
    console.log('Mobile:', isMobile);
    console.log('iOS:', isIOS);
    console.log('Android:', isAndroid);
    console.log('Screen size:', `${window.innerWidth}x${window.innerHeight}`);
    console.log('User agent:', navigator.userAgent);
    console.groupEnd();

    console.group('✅ Feature Support');
    console.log('Service Worker:', browserSupport.serviceWorker);
    console.log('Intersection Observer:', browserSupport.intersection);
    console.log('LocalStorage:', typeof Storage !== 'undefined');
    console.log('WebP:', browserSupport.webp);
    console.log('AVIF:', browserSupport.avif);
    console.groupEnd();

    // Test for common issues
    const issues = [];
    
    if (!browserSupport.serviceWorker) {
      issues.push('❌ Service Worker not supported - PWA features disabled');
    }
    
    if (!navigator.onLine) {
      issues.push('⚠️ Browser is offline');
    }

    if (typeof localStorage === 'undefined') {
      issues.push('❌ LocalStorage not available - session persistence may fail');
    }

    if (issues.length > 0) {
      console.group('⚠️ Potential Issues');
      issues.forEach(issue => console.warn(issue));
      console.groupEnd();
    } else {
      console.log('✅ All critical features supported');
    }

    // Test Supabase connection
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing');
    
  }, []);

  return null; // This component doesn't render anything
}
