import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SuccessAnimationProps {
  icon?: LucideIcon;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SuccessAnimation({ icon: Icon, message, size = 'md' }: SuccessAnimationProps) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{
          duration: 0.6,
          times: [0, 0.6, 1],
          ease: 'easeOut',
        }}
        className={`${sizes[size]} rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl`}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.2,
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }}
        >
          {Icon ? (
            <Icon className="w-8 h-8 text-white" />
          ) : (
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  delay: 0.3,
                  duration: 0.5,
                  ease: 'easeOut',
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </motion.div>
      </motion.div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-semibold text-stone-900 dark:text-white"
        >
          {message}
        </motion.p>
      )}

      {/* Ripple effect */}
      <motion.div
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{
          duration: 1,
          ease: 'easeOut',
        }}
        className={`absolute ${sizes[size]} rounded-full bg-green-400`}
      />
    </motion.div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', message, className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className || ''}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`${sizes[size]} border-stone-300 dark:border-slate-600 border-t-blue-500 dark:border-t-blue-400 rounded-full`}
      />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-stone-600 dark:text-stone-400"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export function ProgressBar({ progress, color = 'blue', size = 'md', showPercentage = false }: ProgressBarProps) {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="w-full space-y-2">
      <div className={`w-full bg-stone-200 dark:bg-slate-700 rounded-full overflow-hidden ${heights[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
          }}
          className={`h-full ${colors[color]} relative`}
        >
          <motion.div
            animate={{
              x: ['0%', '100%'],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
      {showPercentage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-center text-stone-600 dark:text-stone-400 font-medium"
        >
          {Math.round(progress)}%
        </motion.p>
      )}
    </div>
  );
}

export function PulseLoader() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
          className="w-2 h-2 rounded-full bg-blue-500"
        />
      ))}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave';
}

export function Skeleton({ className = '', variant = 'rectangular', animation = 'pulse' }: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-lg',
  };

  return (
    <div className={`${variants[variant]} ${className} bg-stone-200 dark:bg-slate-700 relative overflow-hidden`}>
      {animation === 'wave' && (
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-300 dark:via-slate-600 to-transparent"
        />
      )}
      {animation === 'pulse' && (
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0"
        />
      )}
    </div>
  );
}
