/**
 * Browser compatibility utilities
 */

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Check browser support for modern features
export const browserSupport = {
  serviceWorker: isBrowser && 'serviceWorker' in navigator,
  intersection: isBrowser && 'IntersectionObserver' in window,
  webp: false, // Will be checked dynamically
  avif: false, // Will be checked dynamically
};

// Check image format support
if (isBrowser) {
  // Check WebP support
  const webpTest = new Image();
  webpTest.onload = webpTest.onerror = function () {
    browserSupport.webp = webpTest.height === 1;
  };
  webpTest.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

  // Check AVIF support
  const avifTest = new Image();
  avifTest.onload = avifTest.onerror = function () {
    browserSupport.avif = avifTest.height === 1;
  };
  avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
}

// Detect if user prefers reduced motion
export const prefersReducedMotion = isBrowser
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Get browser name and version
export function getBrowserInfo() {
  if (!isBrowser) return { name: 'server', version: '0' };

  const ua = navigator.userAgent;
  let name = 'unknown';
  let version = '0';

  if (ua.includes('Firefox/')) {
    name = 'firefox';
    version = ua.split('Firefox/')[1].split(' ')[0];
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    name = 'chrome';
    version = ua.split('Chrome/')[1].split(' ')[0];
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    name = 'safari';
    version = ua.split('Version/')[1]?.split(' ')[0] || '0';
  } else if (ua.includes('Edg/')) {
    name = 'edge';
    version = ua.split('Edg/')[1].split(' ')[0];
  }

  return { name, version };
}

// Check if browser is mobile
export const isMobile = isBrowser && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Check if iOS
export const isIOS = isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent);

// Check if Android
export const isAndroid = isBrowser && /Android/.test(navigator.userAgent);

// Log browser info for debugging
if (isBrowser && process.env.NODE_ENV === 'development') {
  const info = getBrowserInfo();
  console.log('Browser:', info.name, info.version);
  console.log('Mobile:', isMobile);
  console.log('Service Worker support:', browserSupport.serviceWorker);
  console.log('Prefers reduced motion:', prefersReducedMotion);
}
