'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'red';
type Density = 'compact' | 'comfortable' | 'spacious';
type ReduceMotion = boolean;

interface ThemeCustomization {
  accentColor: AccentColor;
  density: Density;
  reduceMotion: ReduceMotion;
}

interface ThemeCustomizationContextType extends ThemeCustomization {
  setAccentColor: (color: AccentColor) => void;
  setDensity: (density: Density) => void;
  setReduceMotion: (reduce: ReduceMotion) => void;
  getSpacing: () => { card: string; text: string; gap: string };
  getAccentColorClasses: () => {
    bg: string;
    text: string;
    border: string;
    hover: string;
  };
}

const ThemeCustomizationContext = createContext<ThemeCustomizationContextType | undefined>(undefined);

const ACCENT_COLORS = {
  blue: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500 dark:border-blue-600',
    hover: 'hover:bg-blue-600 dark:hover:bg-blue-700',
  },
  green: {
    bg: 'bg-green-500 dark:bg-green-600',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500 dark:border-green-600',
    hover: 'hover:bg-green-600 dark:hover:bg-green-700',
  },
  purple: {
    bg: 'bg-purple-500 dark:bg-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500 dark:border-purple-600',
    hover: 'hover:bg-purple-600 dark:hover:bg-purple-700',
  },
  orange: {
    bg: 'bg-orange-500 dark:bg-orange-600',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500 dark:border-orange-600',
    hover: 'hover:bg-orange-600 dark:hover:bg-orange-700',
  },
  pink: {
    bg: 'bg-pink-500 dark:bg-pink-600',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500 dark:border-pink-600',
    hover: 'hover:bg-pink-600 dark:hover:bg-pink-700',
  },
  red: {
    bg: 'bg-red-500 dark:bg-red-600',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500 dark:border-red-600',
    hover: 'hover:bg-red-600 dark:hover:bg-red-700',
  },
};

const DENSITY_SPACING = {
  compact: {
    card: 'p-3',
    text: 'text-sm',
    gap: 'gap-2',
  },
  comfortable: {
    card: 'p-4',
    text: 'text-base',
    gap: 'gap-3',
  },
  spacious: {
    card: 'p-6',
    text: 'text-lg',
    gap: 'gap-4',
  },
};

export function ThemeCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue');
  const [density, setDensityState] = useState<Density>('comfortable');
  const [reduceMotion, setReduceMotionState] = useState<ReduceMotion>(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme-customization');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAccentColorState(parsed.accentColor || 'blue');
        setDensityState(parsed.density || 'comfortable');
        setReduceMotionState(parsed.reduceMotion || false);
      } catch (error) {
        console.error('Failed to parse theme customization:', error);
      }
    }

    // Check system preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !saved) {
      setReduceMotionState(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      'theme-customization',
      JSON.stringify({ accentColor, density, reduceMotion })
    );

    // Apply CSS variables
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--density', density);
    
    // Apply reduce motion class
    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [accentColor, density, reduceMotion]);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  const setDensity = (newDensity: Density) => {
    setDensityState(newDensity);
  };

  const setReduceMotion = (reduce: ReduceMotion) => {
    setReduceMotionState(reduce);
  };

  const getSpacing = () => DENSITY_SPACING[density];

  const getAccentColorClasses = () => ACCENT_COLORS[accentColor];

  return (
    <ThemeCustomizationContext.Provider
      value={{
        accentColor,
        density,
        reduceMotion,
        setAccentColor,
        setDensity,
        setReduceMotion,
        getSpacing,
        getAccentColorClasses,
      }}
    >
      {children}
    </ThemeCustomizationContext.Provider>
  );
}

export function useThemeCustomization() {
  const context = useContext(ThemeCustomizationContext);
  if (!context) {
    throw new Error('useThemeCustomization must be used within ThemeCustomizationProvider');
  }
  return context;
}

// Hook for animations that respects reduce motion preference
export function useAnimationConfig() {
  const { reduceMotion } = useThemeCustomization();

  return {
    transition: reduceMotion
      ? { duration: 0 }
      : { type: 'spring', stiffness: 300, damping: 30 },
    initial: reduceMotion ? {} : { opacity: 0, y: 20 },
    animate: reduceMotion ? {} : { opacity: 1, y: 0 },
    exit: reduceMotion ? {} : { opacity: 0, scale: 0.95 },
  };
}
