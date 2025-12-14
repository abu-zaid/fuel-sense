/**
 * Performance optimization utilities
 */

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll handlers
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load images with IntersectionObserver
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    if (placeholder) {
      img.src = placeholder;
    }
    
    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = src;
  }
}

// Memoization helper for expensive computations
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
}

// Batch multiple state updates
export function batchUpdates<T>(
  updates: Array<() => void>,
  delay: number = 0
): void {
  if (delay > 0) {
    setTimeout(() => {
      updates.forEach((update) => update());
    }, delay);
  } else {
    updates.forEach((update) => update());
  }
}

// Virtual scrolling helper - calculate visible range
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);
  
  return { start, end };
}

// Check if element is in viewport
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Preload critical resources
export function preloadResource(url: string, as: 'image' | 'script' | 'style' | 'font'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

// Request idle callback polyfill
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback) => setTimeout(callback, 1);

export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : clearTimeout;

// Optimize expensive calculations during idle time
export function scheduleIdleTask(task: () => void): number {
  return requestIdleCallback(
    (deadline) => {
      if (deadline.timeRemaining() > 0) {
        task();
      } else {
        scheduleIdleTask(task);
      }
    },
    { timeout: 1000 }
  );
}

// Calculate bundle size impact
export function logBundleSize(componentName: string, size: number): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Bundle Analysis] ${componentName}: ${(size / 1024).toFixed(2)} KB`);
  }
}
