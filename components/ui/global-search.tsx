'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Car, Fuel, Calendar, TrendingUp, Loader } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getFuelEntries, getVehicles } from '@/lib/services';
import { useRouter } from 'next/navigation';
import type { FuelEntry, Vehicle } from '@/lib/types';
import { hapticButton } from '@/lib/haptic';

interface SearchResult {
  type: 'vehicle' | 'entry';
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data: Vehicle | FuelEntry;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export function GlobalSearch({ open, onOpenChange, userId }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !userId) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const vehicles = await getVehicles();
      const allEntriesArrays = await Promise.all(
        vehicles.map((v) => getFuelEntries(v.id))
      );
      const allEntries = allEntriesArrays.flat();

      const searchLower = searchQuery.toLowerCase();
      const searchResults: SearchResult[] = [];

      // Search vehicles
      vehicles.forEach((vehicle) => {
        const matchesName = vehicle.name.toLowerCase().includes(searchLower);
        const matchesMake = vehicle.make?.toLowerCase().includes(searchLower);
        const matchesModel = vehicle.model?.toLowerCase().includes(searchLower);
        const matchesYear = vehicle.year?.toString().includes(searchQuery);

        if (matchesName || matchesMake || matchesModel || matchesYear) {
          searchResults.push({
            type: 'vehicle',
            id: vehicle.id,
            title: vehicle.name,
            subtitle: [vehicle.make, vehicle.model, vehicle.year]
              .filter(Boolean)
              .join(' '),
            icon: <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
            data: vehicle,
          });
        }
      });

      // Search fuel entries
      allEntries.forEach((entry) => {
        const matchesAmount = entry.amount.toString().includes(searchQuery);
        const matchesOdo = entry.odo.toString().includes(searchQuery);
        const matchesEfficiency = entry.efficiency.toString().includes(searchQuery);
        const matchesDate = new Date(entry.created_at)
          .toLocaleDateString()
          .includes(searchQuery);

        if (matchesAmount || matchesOdo || matchesEfficiency || matchesDate) {
          const vehicle = vehicles.find((v) => v.id === entry.vehicle_id);
          searchResults.push({
            type: 'entry',
            id: entry.id,
            title: `₹${entry.amount.toFixed(0)} • ${entry.efficiency.toFixed(1)} km/l`,
            subtitle: `${vehicle?.name || 'Unknown'} • ${new Date(
              entry.created_at
            ).toLocaleDateString()}`,
            icon: <Fuel className="w-5 h-5 text-green-600 dark:text-green-400" />,
            data: entry,
          });
        }
      });

      setResults(searchResults.slice(0, 10)); // Limit to 10 results
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    hapticButton();
    onOpenChange(false);

    if (result.type === 'vehicle') {
      router.push(`/vehicle/${result.id}`);
    } else {
      // Navigate to dashboard and highlight entry
      router.push(`/?highlight=${result.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-stone-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-stone-400 dark:text-slate-500 flex-shrink-0" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search vehicles, entries, amounts..."
            className="border-0 focus-visible:ring-0 text-base"
          />
          {loading && (
            <Loader className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
          )}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-stone-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-stone-400" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query && !loading && results.length === 0 && (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-3 text-stone-300 dark:text-slate-700" />
              <p className="text-stone-600 dark:text-slate-400 font-medium">
                No results found
              </p>
              <p className="text-sm text-stone-500 dark:text-slate-500 mt-1">
                Try searching for a vehicle name, amount, or date
              </p>
            </div>
          )}

          {!query && (
            <div className="p-8 text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <Car className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-xs text-stone-600 dark:text-slate-400">Vehicles</p>
                  </div>
                  <div className="text-center">
                    <Fuel className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-xs text-stone-600 dark:text-slate-400">Entries</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-xs text-stone-600 dark:text-slate-400">Stats</p>
                  </div>
                </div>
                <p className="text-sm text-stone-500 dark:text-slate-500">
                  Start typing to search across all your data
                </p>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {results.map((result, index) => (
              <motion.button
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, delay: index * 0.02 }}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-4 p-4 border-b border-stone-100 dark:border-slate-800 transition-colors text-left ${
                  selectedIndex === index
                    ? 'bg-blue-50 dark:bg-blue-950/30'
                    : 'hover:bg-stone-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex-shrink-0">{result.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 dark:text-white truncate">
                    {result.title}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-slate-400 truncate">
                    {result.subtitle}
                  </p>
                </div>
                <div className="text-xs text-stone-400 dark:text-slate-600 capitalize">
                  {result.type}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Hint */}
        {results.length > 0 && (
          <div className="flex items-center justify-center gap-4 p-3 border-t border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900/50 text-xs text-stone-500 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded">Esc</kbd>
              Close
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
