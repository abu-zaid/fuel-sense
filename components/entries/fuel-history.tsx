'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import type { FuelEntry, Vehicle } from '@/lib/types';
import { Download, Trash2, History } from 'lucide-react';

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

  useEffect(() => {
    loadEntries();
  }, [vehicleId]);

  const loadEntries = async () => {
    if (!vehicleId) return;
    try {
      const data = await getFuelEntries(vehicleId);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteFuelEntry(id);
      loadEntries();
      onDataChange();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleExport = () => {
    if (!vehicle) return;
    exportToCSV(
      entries,
      vehicle,
      `fuel-tracker-${vehicle.name}-${Date.now()}.csv`
    );
  };

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
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={handleExport}
          className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </motion.div>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-12 text-center border-0 shadow-lg rounded-3xl bg-gradient-to-br from-stone-50 to-white dark:from-slate-800 dark:to-slate-900">
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
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Odo</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Distance</TableHead>
                        <TableHead className="font-semibold">Fuel Used</TableHead>
                        <TableHead className="font-semibold">Efficiency</TableHead>
                        <TableHead className="w-20 font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {entries.map((entry, index) => (
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-white to-stone-50/50 dark:from-slate-800 dark:to-slate-900/50 backdrop-blur-sm">
                    <div className="p-4">
                      {/* Header with Date and Delete */}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
          </div>
        </>
      )}
    </div>
  );
}
