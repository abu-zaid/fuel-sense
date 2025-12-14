'use client';

import { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getFuelEntries, deleteFuelEntry } from '@/lib/services';
import { exportToCSV } from '@/lib/csv';
import { hapticDelete, hapticButton, hapticToggle, hapticSuccess } from '@/lib/haptic';
import { toast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';
import type { FuelEntry, Vehicle } from '@/lib/types';
import { Download, Trash2, History, Edit, Search, Filter, TrendingUp, TrendingDown, Calendar, DollarSign, Fuel, ArrowUpDown } from 'lucide-react';
import FuelEntryModal from './fuel-entry-modal';

interface FuelHistoryProps {
  vehicleId?: string;
  vehicle: Vehicle | null;
  onDataChange: () => void;
}

export default function FuelHistory({
  vehicleId,
  vehicle,
  onDataChange,
}: FuelHistoryProps) {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'efficiency'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [displayCount, setDisplayCount] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...entries];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.amount.toString().includes(query) ||
        entry.odo.toString().includes(query) ||
        entry.efficiency.toString().includes(query) ||
        new Date(entry.created_at).toLocaleDateString().toLowerCase().includes(query)
      );
    }

    // Filter by period
    if (filterPeriod !== 'all') {
      const now = new Date();
      const daysAgo = filterPeriod === '7days' ? 7 : filterPeriod === '30days' ? 30 : 90;
      const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
      filtered = filtered.filter(entry => new Date(entry.created_at) >= cutoffDate);
    }

    // Sort entries
    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'amount':
          compareValue = a.amount - b.amount;
          break;
        case 'efficiency':
          compareValue = a.efficiency - b.efficiency;
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [entries, searchQuery, sortBy, sortOrder, filterPeriod]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (filteredAndSortedEntries.length === 0) {
      return {
        totalEntries: 0,
        totalSpent: 0,
        totalDistance: 0,
        totalFuel: 0,
        avgEfficiency: 0,
        bestEfficiency: 0,
        worstEfficiency: 0,
      };
    }

    const totalSpent = filteredAndSortedEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalDistance = filteredAndSortedEntries.reduce((sum, e) => sum + e.distance, 0);
    const totalFuel = filteredAndSortedEntries.reduce((sum, e) => sum + e.fuel_used, 0);
    const avgEfficiency = filteredAndSortedEntries.reduce((sum, e) => sum + e.efficiency, 0) / filteredAndSortedEntries.length;
    const efficiencies = filteredAndSortedEntries.map(e => e.efficiency);
    const bestEfficiency = Math.max(...efficiencies);
    const worstEfficiency = Math.min(...efficiencies);

    return {
      totalEntries: filteredAndSortedEntries.length,
      totalSpent,
      totalDistance,
      totalFuel,
      avgEfficiency,
      bestEfficiency,
      worstEfficiency,
    };
  }, [filteredAndSortedEntries]);

  const loadEntries = async () => {
    if (!vehicleId) return;
    try {
      const { entries } = await getFuelEntries(vehicleId);
      setEntries(entries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadEntries();
  };

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    
    hapticDelete();
    try {
      await deleteFuelEntry(deleteConfirm);
      hapticSuccess();
      toast.success('Entry deleted successfully');
      loadEntries();
      onDataChange();
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast.error('Failed to delete entry');
    } finally {
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, onDataChange]);

  const handleExport = useCallback(() => {
    if (!vehicle) return;
    hapticButton();
    exportToCSV(
      filteredAndSortedEntries,
      vehicle,
      `fuel-tracker-${vehicle.name}-${Date.now()}.csv`
    );
  }, [vehicle, filteredAndSortedEntries]);

  const handleSort = useCallback((field: 'date' | 'amount' | 'efficiency') => {
    hapticToggle();
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    loadEntries();
  }, [vehicleId]);

  // Infinite scroll: load more when bottom is in view
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const timer = setTimeout(() => {
        setDisplayCount(prev => {
          const newCount = prev + 20;
          if (newCount >= filteredAndSortedEntries.length) {
            setHasMore(false);
          }
          return newCount;
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [inView, hasMore, loading, filteredAndSortedEntries.length]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20);
    setHasMore(filteredAndSortedEntries.length > 20);
  }, [searchQuery, sortBy, sortOrder, filterPeriod, filteredAndSortedEntries.length]);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm p-8">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
        {/* Statistics Cards */}
        {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Spent</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">₹{statistics.totalSpent.toFixed(0)}</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 dark:bg-green-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Avg Efficiency</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{statistics.avgEfficiency.toFixed(1)} km/l</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 dark:bg-purple-600 flex items-center justify-center">
                <Fuel className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Total Fuel</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{statistics.totalFuel.toFixed(1)} L</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 dark:bg-amber-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Total Distance</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{statistics.totalDistance.toFixed(0)} km</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Search, Filter and Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col md:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <Input
            type="text"
            placeholder="Search by amount, odometer, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-0 shadow-lg bg-white dark:bg-slate-800 rounded-xl"
          />
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          {(['all', '7days', '30days', '90days'] as const).map((period) => (
            <Button
              key={period}
              onClick={() => setFilterPeriod(period)}
              variant={filterPeriod === period ? 'default' : 'outline'}
              size="sm"
              className={filterPeriod === period 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'border-stone-200 dark:border-slate-700'
              }
            >
              {period === 'all' ? 'All' : period === '7days' ? '7D' : period === '30days' ? '30D' : '90D'}
            </Button>
          ))}
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </motion.div>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-12 text-center border-0 shadow-lg rounded-3xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <History className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-semibold text-lg text-stone-900 dark:text-stone-100">No fuel entries yet</p>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
              Add your first entry to see the history
            </p>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-stone-200 dark:border-slate-700">
                        <TableHead 
                          className="font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => handleSort('date')}
                        >
                          <div className="flex items-center gap-1">
                            Date
                            {sortBy === 'date' && (
                              <ArrowUpDown className="w-3 h-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">Odo</TableHead>
                        <TableHead 
                          className="font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => handleSort('amount')}
                        >
                          <div className="flex items-center gap-1">
                            Amount
                            {sortBy === 'amount' && (
                              <ArrowUpDown className="w-3 h-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">Distance</TableHead>
                        <TableHead className="font-semibold">Fuel Used</TableHead>
                        <TableHead 
                          className="font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => handleSort('efficiency')}
                        >
                          <div className="flex items-center gap-1">
                            Efficiency
                            {sortBy === 'efficiency' && (
                              <ArrowUpDown className="w-3 h-3" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="w-20 font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredAndSortedEntries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="py-2">
                              <EmptyState
                                icon={entries.length === 0 ? Fuel : Search}
                                title={entries.length === 0 ? "No Fuel Entries Yet" : "No Matches Found"}
                                description={
                                  entries.length === 0
                                    ? "Start tracking your fuel consumption by adding your first fuel entry."
                                    : "Try adjusting your search query or filters to find what you're looking for."
                                }
                                action={
                                  entries.length === 0
                                    ? {
                                        label: 'Add First Entry',
                                        onClick: onDataChange,
                                      }
                                    : undefined
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAndSortedEntries.slice(0, displayCount).map((entry, index) => (
                          <motion.tr
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            className="border-stone-100 dark:border-slate-700/50 hover:bg-stone-50 dark:hover:bg-slate-700/30 transition-colors"
                          >
                            <TableCell className="font-medium">
                              {new Date(entry.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </TableCell>
                            <TableCell>{entry.odo.toFixed(1)} km</TableCell>
                            <TableCell className="font-semibold">₹{entry.amount.toFixed(2)}</TableCell>
                            <TableCell>{entry.distance.toFixed(2)} km</TableCell>
                            <TableCell>{entry.fuel_used.toFixed(2)} L</TableCell>
                            <TableCell className="font-bold text-blue-600 dark:text-blue-400">
                              {entry.efficiency.toFixed(2)} km/l
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingEntry(entry)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    hapticButton();
                                    setDeleteConfirm(entry.id);
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredAndSortedEntries.length === 0 ? (
              <EmptyState
                icon={entries.length === 0 ? Fuel : Search}
                title={entries.length === 0 ? "No Fuel Entries Yet" : "No Matches Found"}
                description={
                  entries.length === 0
                    ? "Start tracking your fuel consumption by adding your first fuel entry."
                    : "Try adjusting your search query or filters to find what you're looking for."
                }
                action={
                  entries.length === 0
                    ? {
                        label: 'Add First Entry',
                        onClick: onDataChange,
                      }
                    : undefined
                }
              />
            ) : (
              <>
              <AnimatePresence>
                {filteredAndSortedEntries.slice(0, displayCount).map((entry, index) => (
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
                ))}
              </AnimatePresence>
              
              {/* Load More Indicator */}
              {hasMore && displayCount < filteredAndSortedEntries.length && (
                <div ref={loadMoreRef} className="py-8 flex justify-center">
                  <div className="animate-spin">
                    <div className="w-8 h-8 border-3 border-stone-300 dark:border-slate-600 border-t-blue-500 rounded-full" />
                  </div>
                </div>
              )}
              </>
            )}
          </div>

          {/* Load More Indicator for Desktop */}
          <div className="hidden md:block">
            {hasMore && displayCount < filteredAndSortedEntries.length && (
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-stone-600 dark:text-stone-400"
                >
                  <div className="animate-spin">
                    <div className="w-8 h-8 border-3 border-stone-300 dark:border-slate-600 border-t-blue-500 rounded-full" />
                  </div>
                  <span className="text-sm font-medium">Loading more entries...</span>
                </motion.div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingEntry && (
        <FuelEntryModal
          vehicleId={vehicleId}
          editEntry={editingEntry}
          isEditMode={true}
          onEditClose={() => setEditingEntry(null)}
          onSuccess={() => {
            loadEntries();
            onDataChange();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-2 text-stone-900 dark:text-slate-100">
                Delete Entry
              </h3>
              <p className="text-stone-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete this fuel entry? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
