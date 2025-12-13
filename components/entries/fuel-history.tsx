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
import { Download, Trash2 } from 'lucide-react';

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
          className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white"
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
          <Card className="p-12 text-center border-0 shadow-sm rounded-2xl">
            <p className="font-medium">No fuel entries yet</p>
            <p className="text-sm opacity-70 mt-1">
              Add your first entry to see the history
            </p>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-0 shadow-sm overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Odo</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Fuel Used</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead className="w-20">Action</TableHead>
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
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <TableCell>
                          {new Date(entry.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{entry.odo} km</TableCell>
                        <TableCell>₹{entry.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          {entry.distance.toFixed(2)} km
                        </TableCell>
                        <TableCell>
                          {entry.fuel_used.toFixed(2)} L
                        </TableCell>
                        <TableCell className="font-semibold">
                          {entry.efficiency.toFixed(2)} km/l
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="text-red-600"
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
      )}
    </div>
  );
}
