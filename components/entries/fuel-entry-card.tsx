'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { FuelEntry } from '@/lib/types';

interface FuelEntryCardProps {
  entry: FuelEntry;
  index: number;
  onEdit: (entry: FuelEntry) => void;
  onDelete: (id: string) => void;
}

const FuelEntryCard = memo(({ entry, index, onEdit, onDelete }: FuelEntryCardProps) => {
  return (
    <motion.div
      key={entry.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-slate-800 dark:to-slate-900/50 backdrop-blur-sm">
        <div className="p-4">
          {/* Header with Date */}
          <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  {new Date(entry.created_at).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Amount</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">₹{entry.amount.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Distance</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{entry.distance.toFixed(2)} km</p>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Odometer</p>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{entry.odo.toFixed(1)} km</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Fuel Used</p>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{entry.fuel_used.toFixed(2)} L</p>
              </div>
              <div className="text-center bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg p-2">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Efficiency</p>
                <p className="text-base font-bold text-blue-700 dark:text-blue-300">{entry.efficiency.toFixed(2)}</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">km/l</p>
              </div>
            </div>
          </div>
        </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimization
  return (
    prevProps.entry.id === nextProps.entry.id &&
    prevProps.entry.amount === nextProps.entry.amount &&
    prevProps.entry.distance === nextProps.entry.distance &&
    prevProps.entry.efficiency === nextProps.entry.efficiency &&
    prevProps.index === nextProps.index
  );
});

FuelEntryCard.displayName = 'FuelEntryCard';

export default FuelEntryCard;
