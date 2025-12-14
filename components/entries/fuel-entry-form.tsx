import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addFuelEntry, getFuelEntries, updateFuelEntry } from '@/lib/services';
import { hapticSuccess, hapticError } from '@/lib/haptic';
import { toast } from '@/components/ui/toast';
import { SuccessAnimation } from '@/components/ui/animations';
import type { FuelEntry } from '@/lib/types';

interface FuelEntryFormProps {
  vehicleId?: string;
  onSuccess: () => void;
  editEntry?: FuelEntry | null;
  standalone?: boolean;
}

export default function FuelEntryForm({ vehicleId, onSuccess, editEntry, standalone = false }: FuelEntryFormProps) {
  const [odo, setOdo] = useState('');
  const [petrolPrice, setPetrolPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [distance, setDistance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastOdo, setLastOdo] = useState<number | null>(null);

  useEffect(() => {
    if (editEntry) {
      // Pre-fill form with existing entry data
      setOdo(editEntry.odo.toString());
      setPetrolPrice(editEntry.petrol_price.toString());
      setAmount(editEntry.amount.toString());
      setDistance(editEntry.distance.toString());
    } else {
      loadLastOdometer();
    }
  }, [vehicleId, editEntry]);

  const loadLastOdometer = async () => {
    try {
      const entries = await getFuelEntries(vehicleId, 1);
      if (entries.length > 0) {
        setLastOdo(entries[0].odo);
      }
    } catch (err) {
      console.error('Failed to load last odometer:', err);
    }
  };

  useEffect(() => {
    if (odo && lastOdo) {
      const calculatedDistance = (parseFloat(odo) - lastOdo).toFixed(1);
      setDistance(calculatedDistance);
    }
  }, [odo, lastOdo]);

  const fuelUsed = amount && petrolPrice ? (parseFloat(amount) / parseFloat(petrolPrice)).toFixed(2) : '0.00';
  const efficiency = fuelUsed && distance ? (parseFloat(distance) / parseFloat(fuelUsed)).toFixed(2) : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      setError('No vehicle selected');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (editEntry) {
        // Update existing entry
        await updateFuelEntry(
          editEntry.id,
          parseFloat(odo),
          parseFloat(petrolPrice),
          parseFloat(amount),
          parseFloat(distance)
        );
      } else {
        // Add new entry
        await addFuelEntry(
          vehicleId,
          parseFloat(odo),
          parseFloat(petrolPrice),
          parseFloat(amount),
          parseFloat(distance)
        );
      }
      
      setOdo('');
      setPetrolPrice('');
      setAmount('');
      setDistance('');
      hapticSuccess();
      toast.success(editEntry ? 'Entry updated successfully!' : 'Entry added successfully!');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
      hapticError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
      >
        <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Odometer (km)</label>
          <Input 
            type="number" 
            step="0.1" 
            value={odo} 
            onChange={(e) => setOdo(e.target.value)} 
            placeholder="Current odometer reading"
            className="transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
            required 
          />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Petrol Price (₹/L)</label>
          <Input 
            type="number" 
            step="0.01" 
            value={petrolPrice} 
            onChange={(e) => setPetrolPrice(e.target.value)} 
            placeholder="Price per liter"
            className="transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
            required 
          />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Amount (₹)</label>
          <Input 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Total amount spent"
            className="transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
            required 
          />
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Distance (km)</label>
          <div className="relative">
            <Input 
              type="number" 
              step="0.1" 
              value={distance} 
              readOnly
              placeholder="Auto-calculated"
              className="bg-stone-100 dark:bg-slate-800 cursor-not-allowed transition-all duration-300 ease-in-out"
            />
            {lastOdo && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 dark:text-green-400 font-medium">
                Auto
              </span>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Display */}
      <motion.div 
        className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-stone-200 dark:border-slate-700"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.2,
            },
          },
        }}
      >
        <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
          <p className="text-xs text-stone-600 dark:text-stone-400">Fuel Used</p>
          <p className="text-lg font-semibold text-stone-900 dark:text-white">{fuelUsed} L</p>
        </motion.div>
        <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
          <p className="text-xs text-stone-600 dark:text-stone-400">Efficiency</p>
          <p className="text-lg font-semibold text-stone-900 dark:text-white">{efficiency} km/l</p>
        </motion.div>
      </motion.div>

      {error && (
        <motion.div 
          className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 text-sm"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            {editEntry ? 'Updating...' : 'Adding...'}
          </span>
        ) : (
          editEntry ? 'Update Fuel Entry' : 'Add Fuel Entry'
        )}
      </Button>
    </motion.div>
    </form>
  );
}
