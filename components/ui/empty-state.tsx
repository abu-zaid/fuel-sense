'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {/* Animated Icon Background */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          delay: 0.1,
        }}
        className="relative mb-6"
      >
        {/* Pulsing background circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full blur-xl"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.25, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 dark:from-purple-600/15 dark:to-blue-600/15 rounded-full blur-lg"
        />

        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
          className="relative w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-stone-100 to-stone-200 dark:from-slate-800 dark:to-slate-900 border-2 border-stone-200 dark:border-slate-700 shadow-lg"
        >
          <Icon className="w-12 h-12 text-stone-600 dark:text-slate-400" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md space-y-3"
      >
        <h3 className="text-xl font-bold text-stone-900 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-stone-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          {action && (
            <Button
              onClick={action.onClick}
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
