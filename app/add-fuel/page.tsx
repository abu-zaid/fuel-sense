'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FuelEntryForm from '@/components/entries/fuel-entry-form';
import { useEffect, useState } from 'react';
import { getVehicles } from '@/lib/services';
import type { Vehicle } from '@/lib/types';
import { getDefaultVehicle } from '@/lib/profile';

export default function AddFuelPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
      if (data.length > 0) {
        try {
          const defaultVehicleId = await getDefaultVehicle();
          if (defaultVehicleId) {
            const defaultVehicle = data.find(v => v.id === defaultVehicleId);
            setSelectedVehicle(defaultVehicle || data[0]);
          } else {
            setSelectedVehicle(data[0]);
          }
        } catch {
          setSelectedVehicle(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleSuccess = () => {
    router.push('/');
  };

  if (loading || loadingVehicles) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-stone-100 to-stone-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-stone-300 dark:border-slate-600 border-t-blue-500 dark:border-t-blue-400 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <motion.div 
        className="sticky top-0 z-10 backdrop-blur-2xl bg-gradient-to-b from-stone-50/95 via-stone-100/90 to-stone-100/85 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/85 border-b border-stone-200/60 dark:border-slate-700/60 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="rounded-full hover:bg-stone-200/50 dark:hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Add Fuel Entry</h1>
              <p className="text-sm text-stone-600 dark:text-slate-400">Record your fuel consumption</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {vehicles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-600 dark:text-slate-400 text-lg font-medium">No vehicles found</p>
              <p className="text-stone-400 dark:text-slate-500 text-sm mt-2">Please add a vehicle first</p>
              <Button
                onClick={() => router.push('/')}
                className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Go Back
              </Button>
            </div>
          ) : (
            <FuelEntryForm
              vehicleId={selectedVehicle?.id}
              onSuccess={handleSuccess}
              standalone
            />
          )}
        </motion.div>
      </main>
    </div>
  );
}
