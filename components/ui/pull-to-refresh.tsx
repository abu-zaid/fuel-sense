'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const pullY = useMotionValue(0);
  const touchStartY = useRef(0);
  const pullThreshold = 80;

  // Transform pull distance to rotation for icon
  const rotation = useTransform(pullY, [0, pullThreshold], [0, 360]);
  const opacity = useTransform(pullY, [0, pullThreshold], [0, 1]);
  const scale = useTransform(pullY, [0, pullThreshold], [0.5, 1]);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Only allow pull-to-refresh if we're at the top of the page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    // Only allow pulling down
    if (diff > 0) {
      // Add resistance to the pull
      const resistance = Math.min(diff * 0.5, pullThreshold * 1.5);
      pullY.set(resistance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);
    const currentPull = pullY.get();

    if (currentPull >= pullThreshold && !isRefreshing) {
      // Trigger refresh
      setIsRefreshing(true);
      
      // Animate to refresh position
      await animate(pullY, pullThreshold, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });

      try {
        await onRefresh();
      } finally {
        // Animate back
        await animate(pullY, 0, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        });
        setIsRefreshing(false);
      }
    } else {
      // Animate back without refreshing
      animate(pullY, 0, {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      });
    }
  };

  useEffect(() => {
    const element = document.body;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, disabled]);

  return (
    <div className="relative">
      {/* Pull indicator */}
      <motion.div
        style={{ y: pullY, opacity, scale }}
        className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none z-50"
      >
        <div className="mt-4 bg-white dark:bg-slate-800 rounded-full p-3 shadow-xl border-2 border-blue-500 dark:border-blue-400">
          <motion.div style={{ rotate: rotation }}>
            <RefreshCw
              className={`w-6 h-6 ${
                isRefreshing
                  ? 'text-blue-600 dark:text-blue-400 animate-spin'
                  : 'text-blue-500 dark:text-blue-400'
              }`}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Content with transform */}
      <motion.div style={{ y: pullY }}>
        {children}
      </motion.div>
    </div>
  );
}

// Hook for easier usage
export function usePullToRefresh(refreshFn: () => Promise<void>) {
  return {
    PullToRefreshWrapper: ({ children }: { children: React.ReactNode }) => (
      <PullToRefresh onRefresh={refreshFn}>{children}</PullToRefresh>
    ),
  };
}
