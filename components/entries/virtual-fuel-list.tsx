'use client';

import { memo } from 'react';
// @ts-ignore - react-window types issue
import { FixedSizeList } from 'react-window';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { FuelEntry } from '@/lib/types';

interface VirtualFuelListProps {
  entries: FuelEntry[];
  onEdit: (entry: FuelEntry) => void;
  onDelete: (id: string) => void;
  height: number;
}

const FuelEntryRow = memo(({ 
  entry, 
  onEdit, 
  onDelete, 
  style 
}: { 
  entry: FuelEntry; 
  onEdit: (entry: FuelEntry) => void; 
  onDelete: (id: string) => void;
  style: React.CSSProperties;
}) => (
  <div style={style} className="px-2 py-1">
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-slate-800 dark:to-slate-900/50 backdrop-blur-sm">
      <div className="p-4">
        {/* Header with Date and Actions */}
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
          </div>
        </div>
      </div>
    </Card>
  </div>
));

FuelEntryRow.displayName = 'FuelEntryRow';

export default function VirtualFuelList({ entries, onEdit, onDelete, height }: VirtualFuelListProps) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const entry = entries[index];
    return <FuelEntryRow entry={entry} onEdit={onEdit} onDelete={onDelete} style={style} />;
  };

  return (
    <FixedSizeList
      height={height}
      itemCount={entries.length}
      itemSize={220}
      width="100%"
      className="scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
    >
      {Row}
    </FixedSizeList>
  );
}
