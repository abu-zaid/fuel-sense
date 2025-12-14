'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Car, Fuel, BarChart3, Zap, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { hapticButton, hapticSuccess } from '@/lib/haptic';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    icon: <Car className="w-16 h-16 text-blue-600" />,
    title: 'Welcome to FuelSense',
    description: 'Track your vehicle fuel consumption with ease and gain insights into your driving habits.',
    features: [
      'Multiple vehicle support',
      'Automatic efficiency calculations',
      'Beautiful analytics and charts',
      'Offline-first PWA',
    ],
  },
  {
    icon: <Fuel className="w-16 h-16 text-green-600" />,
    title: 'Add Fuel Entries',
    description: 'Quickly log your fuel fill-ups with automatic distance and efficiency calculations.',
    features: [
      'Simple form with smart defaults',
      'Automatic calculations',
      'Edit or delete anytime',
      'Export to CSV',
    ],
  },
  {
    icon: <BarChart3 className="w-16 h-16 text-purple-600" />,
    title: 'Track Your Stats',
    description: 'Get detailed insights into your fuel consumption patterns and spending.',
    features: [
      'Real-time efficiency tracking',
      'Monthly cost analysis',
      'Interactive charts',
      'Trend visualization',
    ],
  },
  {
    icon: <Zap className="w-16 h-16 text-orange-600" />,
    title: 'Ready to Start',
    description: "Let's get your first vehicle set up and start tracking your fuel consumption!",
    features: [
      'Add your first vehicle',
      'Log your first entry',
      'Watch your stats grow',
      'Improve your efficiency',
    ],
  },
];

interface OnboardingProps {
  open: boolean;
  onComplete: () => void;
}

export function Onboarding({ open, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const isLastStep = currentStep === onboardingSteps.length - 1;
  const currentStepData = onboardingSteps[currentStep];

  const handleNext = () => {
    hapticButton();
    if (isLastStep) {
      hapticSuccess();
      onComplete();
    } else {
      setDirection('forward');
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    hapticButton();
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    hapticButton();
    onComplete();
  };

  const variants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl p-0 gap-0 overflow-hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-stone-200 dark:bg-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>

        {/* Content */}
        <div className="relative overflow-hidden p-8 md:p-12">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="space-y-6"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2,
                }}
                className="flex justify-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border-2 border-stone-200 dark:border-slate-700 shadow-lg">
                  {currentStepData.icon}
                </div>
              </motion.div>

              {/* Title */}
              <div className="text-center space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-stone-600 dark:text-slate-400 text-base md:text-lg max-w-md mx-auto">
                  {currentStepData.description}
                </p>
              </div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto"
              >
                {currentStepData.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.4 + index * 0.1,
                      type: 'spring',
                      stiffness: 300,
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 dark:bg-slate-800/50 border border-stone-200 dark:border-slate-700"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-stone-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            {onboardingSteps.map((_, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  scale: currentStep === index ? 1 : 0.8,
                  opacity: currentStep === index ? 1 : 0.3,
                }}
                className={`h-2 rounded-full transition-all ${
                  currentStep >= index
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-stone-300 dark:bg-slate-600'
                } ${currentStep === index ? 'w-8' : 'w-2'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!isLastStep && (
              <Button variant="ghost" onClick={handleSkip} size="sm">
                Skip
              </Button>
            )}
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious} size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} size="sm" className="gap-2">
              {isLastStep ? (
                <>
                  Get Started
                  <Zap className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}
