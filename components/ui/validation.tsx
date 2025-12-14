'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

interface UseValidationProps {
  rules?: ValidationRule[];
  required?: boolean;
  requiredMessage?: string;
}

export function useValidation({
  rules = [],
  required = false,
  requiredMessage = 'This field is required',
}: UseValidationProps = {}) {
  const validate = (value: any): { isValid: boolean; error?: string } => {
    // Check required
    if (required && (!value || value.toString().trim() === '')) {
      return { isValid: false, error: requiredMessage };
    }

    // Check custom rules
    for (const rule of rules) {
      if (!rule.validate(value)) {
        return { isValid: false, error: rule.message };
      }
    }

    return { isValid: true };
  };

  return { validate };
}

// Common validation rules
export const validationRules = {
  minLength: (min: number): ValidationRule => ({
    validate: (value: string) => !value || value.length >= min,
    message: `Must be at least ${min} characters`,
  }),
  maxLength: (max: number): ValidationRule => ({
    validate: (value: string) => !value || value.length <= max,
    message: `Must be at most ${max} characters`,
  }),
  minValue: (min: number): ValidationRule => ({
    validate: (value: any) => !value || Number(value) >= min,
    message: `Must be at least ${min}`,
  }),
  maxValue: (max: number): ValidationRule => ({
    validate: (value: any) => !value || Number(value) <= max,
    message: `Must be at most ${max}`,
  }),
  email: (): ValidationRule => ({
    validate: (value: string) =>
      !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Invalid email address',
  }),
  number: (): ValidationRule => ({
    validate: (value: any) => !value || !isNaN(Number(value)),
    message: 'Must be a valid number',
  }),
  positiveNumber: (): ValidationRule => ({
    validate: (value: any) => !value || Number(value) > 0,
    message: 'Must be a positive number',
  }),
  integer: (): ValidationRule => ({
    validate: (value: any) => !value || Number.isInteger(Number(value)),
    message: 'Must be a whole number',
  }),
  year: (): ValidationRule => ({
    validate: (value: any) => {
      if (!value) return true;
      const year = Number(value);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear + 1;
    },
    message: 'Invalid year',
  }),
  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    validate: (value: string) => !value || pattern.test(value),
    message,
  }),
};

interface ValidationMessageProps {
  error?: string;
  success?: boolean;
  className?: string;
}

export function ValidationMessage({
  error,
  success,
  className,
}: ValidationMessageProps) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-1', className)}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
      {success && !error && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-1', className)}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Looks good!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  showValidation?: boolean;
}

export function ValidatedInput({
  label,
  error,
  success,
  showValidation = true,
  className,
  ...props
}: ValidatedInputProps) {
  const hasError = !!error;
  const hasSuccess = success && !error;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={cn(
            'w-full px-3 py-2 border rounded-lg',
            'focus:outline-none focus:ring-2 transition-all',
            'bg-white dark:bg-slate-900',
            'text-stone-900 dark:text-white',
            'placeholder:text-stone-400 dark:placeholder:text-slate-500',
            hasError &&
              'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500',
            hasSuccess &&
              'border-green-300 dark:border-green-700 focus:ring-green-500/20 focus:border-green-500',
            !hasError &&
              !hasSuccess &&
              'border-stone-300 dark:border-slate-600 focus:ring-blue-500/20 focus:border-blue-500',
            className
          )}
        />
        {showValidation && (hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && <AlertCircle className="w-5 h-5 text-red-500" />}
            {hasSuccess && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </div>
        )}
      </div>
      {showValidation && <ValidationMessage error={error} success={success} />}
    </div>
  );
}
