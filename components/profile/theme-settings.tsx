'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useThemeCustomization } from '@/lib/theme-customization';
import { Palette, Layout, Zap, Check } from 'lucide-react';

export default function ThemeSettings() {
  const {
    accentColor,
    density,
    reduceMotion,
    setAccentColor,
    setDensity,
    setReduceMotion,
  } = useThemeCustomization();

  const accentColors = [
    { name: 'Blue', value: 'blue' as const, color: 'bg-blue-500' },
    { name: 'Green', value: 'green' as const, color: 'bg-green-500' },
    { name: 'Purple', value: 'purple' as const, color: 'bg-purple-500' },
    { name: 'Orange', value: 'orange' as const, color: 'bg-orange-500' },
    { name: 'Pink', value: 'pink' as const, color: 'bg-pink-500' },
    { name: 'Red', value: 'red' as const, color: 'bg-red-500' },
  ];

  const densityOptions = [
    { name: 'Compact', value: 'compact' as const, description: 'More content, less space' },
    { name: 'Comfortable', value: 'comfortable' as const, description: 'Balanced spacing' },
    { name: 'Spacious', value: 'spacious' as const, description: 'More space, easier reading' },
  ];

  return (
    <div className="space-y-6">
      {/* Accent Color */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">Accent Color</h3>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          Choose your preferred accent color for the app
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {accentColors.map((color) => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                accentColor === color.value
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-stone-200 dark:border-slate-700 hover:border-stone-300 dark:hover:border-slate-600'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full ${color.color} flex items-center justify-center`}
              >
                {accentColor === color.value && (
                  <Check className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-xs font-medium text-stone-900 dark:text-white">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Density */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layout className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">Layout Density</h3>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          Adjust spacing and content density
        </p>
        <div className="space-y-2">
          {densityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDensity(option.value)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                density === option.value
                  ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'border-stone-200 dark:border-slate-700 hover:border-stone-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="text-left">
                <p className="font-medium text-stone-900 dark:text-white">{option.name}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {option.description}
                </p>
              </div>
              {density === option.value && (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Reduce Motion */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white">Motion</h3>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          Reduce animations for better accessibility
        </p>
        <button
          onClick={() => setReduceMotion(!reduceMotion)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
            reduceMotion
              ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
              : 'border-stone-200 dark:border-slate-700 hover:border-stone-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="text-left">
            <p className="font-medium text-stone-900 dark:text-white">Reduce Motion</p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Minimize animations and transitions
            </p>
          </div>
          {reduceMotion && (
            <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          )}
        </button>
      </Card>

      {/* Preview */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900 p-6">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Preview</h3>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
          className={`p-4 bg-white dark:bg-slate-700 rounded-xl`}
        >
          <p className="text-stone-900 dark:text-white font-medium mb-2">Sample Card</p>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            This is how your cards will look with the current settings.
          </p>
        </motion.div>
      </Card>
    </div>
  );
}
