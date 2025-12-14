'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastId = 0;
let addToastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const toast = {
  success: (message: string, duration = 3000) => {
    addToastFn?.({ type: 'success', message, duration });
  },
  error: (message: string, duration = 4000) => {
    addToastFn?.({ type: 'error', message, duration });
  },
  info: (message: string, duration = 3000) => {
    addToastFn?.({ type: 'info', message, duration });
  },
  warning: (message: string, duration = 3500) => {
    addToastFn?.({ type: 'warning', message, duration });
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${toastId++}`;
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 3000);
    };

    return () => {
      addToastFn = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/50 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-950/50 text-orange-900 dark:text-orange-100 border-orange-200 dark:border-orange-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800';
    }
  };

  const getIconColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md w-full px-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 40,
                mass: 1,
              }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${getColors(
                toast.type
              )}`}
            >
              <div className={getIconColor(toast.type)}>{getIcon(toast.type)}</div>
              <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
