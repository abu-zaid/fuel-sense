'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers';
import { getVehicles, getFuelEntries } from '@/lib/services';
import type { Vehicle, FuelEntry } from '@/lib/types';
import Header from '@/components/layout/header';
import VehicleSelector from '@/components/vehicles/vehicle-selector';
import StatCards from '@/components/dashboard/stat-cards';
import DashboardUI from './dashboard-ui';
import FuelHistory from '@/components/entries/fuel-history';
import FuelEntryModal from '@/components/entries/fuel-entry-modal';
import { BarChart3, Zap, History } from 'lucide-react';

// Lazy load heavy chart components
const EfficiencyChart = lazy(() => import('@/components/charts/efficiency-chart'));
const CostChart = lazy(() => import('@/components/charts/cost-chart'));

// Loading fallback for charts
const ChartSkeleton = () => (
  <div className="h-[320px] rounded-3xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-slate-800 dark:to-slate-900 animate-pulse" />
);

export default function Dashboard() {
  const { signOut } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      loadEntries();
    }
  }, [selectedVehicle]);

  const loadVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
      if (data.length > 0) {
        setSelectedVehicle(data[0]);
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    if (!selectedVehicle) return;
    try {
      const data = await getFuelEntries(selectedVehicle.id);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-stone-300 border-t-blue-500 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 pb-24 md:pb-32">
      <Header onLogout={signOut} vehicles={vehicles} onImportSuccess={loadVehicles} />

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-safe">
        <VehicleSelector vehicles={vehicles} selected={selectedVehicle} onSelect={setSelectedVehicle} onVehiclesChange={loadVehicles} />

        {vehicles.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <p className="text-stone-600 text-lg font-medium">No vehicles added yet</p>
            <p className="text-stone-400 text-sm mt-2">Add your first vehicle to get started</p>
          </div>
        ) : (
          <>
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Suspense fallback={<ChartSkeleton />}>
                    <EfficiencyChart vehicleId={selectedVehicle?.id} compact />
                  </Suspense>
                </motion.div>
              )}

              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <StatCards vehicleId={selectedVehicle?.id} />
                </motion.div>
              )}

              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <DashboardUI vehicleId={selectedVehicle?.id} onEntryAdded={loadEntries} />
                </motion.div>
              )}

              {activeTab === 'charts' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Suspense fallback={<ChartSkeleton />}>
                      <EfficiencyChart vehicleId={selectedVehicle?.id} />
                    </Suspense>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <Suspense fallback={<ChartSkeleton />}>
                      <CostChart vehicleId={selectedVehicle?.id} />
                    </Suspense>
                  </motion.div>
                </>
              )}

              {activeTab === 'history' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <FuelHistory vehicleId={selectedVehicle?.id} vehicle={selectedVehicle} onDataChange={loadEntries} />
                </motion.div>
              )}
            </motion.div>

            {/* Mobile Fuel Entry Modal */}
            <FuelEntryModal vehicleId={selectedVehicle?.id} onSuccess={loadEntries} />
          </>
        )}
      </main>

      {/* Bottom iOS-style Navigation */}
      {vehicles.length > 0 && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="relative">
            {/* Glassmorphism background with blur */}
            <div className="absolute inset-0 backdrop-blur-2xl bg-gradient-to-t from-white/95 via-white/90 to-white/85 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/85 border-t border-stone-200/60 dark:border-slate-700/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)]" />
            
            {/* Content */}
            <div className="relative max-w-7xl mx-auto">
              <div className="grid grid-cols-3 gap-2 p-3 px-4 pb-safe">
                <motion.button
                  onClick={() => setActiveTab('overview')}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 ease-in-out group touch-manipulation ${
                    activeTab === 'overview'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {activeTab === 'overview' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-100/90 to-blue-50/90 dark:from-blue-900/30 dark:to-blue-800/20 shadow-lg shadow-blue-500/10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={`relative mb-1.5 transition-all duration-300 ease-in-out ${
                    activeTab === 'overview' 
                      ? 'scale-110' 
                      : 'group-active:scale-110 group-hover:scale-105'
                  }`}>
                    <BarChart3 className={`w-6 h-6 ${activeTab === 'overview' ? 'drop-shadow-sm' : ''}`} />
                  </div>
                  <span className={`relative text-xs font-semibold transition-all duration-300 ${
                    activeTab === 'overview' ? 'scale-105' : ''
                  }`}>
                    Overview
                  </span>
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveTab('charts')}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 ease-in-out group touch-manipulation ${
                    activeTab === 'charts'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {activeTab === 'charts' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-100/90 to-blue-50/90 dark:from-blue-900/30 dark:to-blue-800/20 shadow-lg shadow-blue-500/10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={`relative mb-1.5 transition-all duration-300 ease-in-out ${
                    activeTab === 'charts' 
                      ? 'scale-110' 
                      : 'group-active:scale-110 group-hover:scale-105'
                  }`}>
                    <Zap className={`w-6 h-6 ${activeTab === 'charts' ? 'drop-shadow-sm' : ''}`} />
                  </div>
                  <span className={`relative text-xs font-semibold transition-all duration-300 ${
                    activeTab === 'charts' ? 'scale-105' : ''
                  }`}>
                    Analytics
                  </span>
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveTab('history')}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 ease-in-out group touch-manipulation ${
                    activeTab === 'history'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {activeTab === 'history' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-100/90 to-blue-50/90 dark:from-blue-900/30 dark:to-blue-800/20 shadow-lg shadow-blue-500/10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={`relative mb-1.5 transition-all duration-300 ease-in-out ${
                    activeTab === 'history' 
                      ? 'scale-110' 
                      : 'group-active:scale-110 group-hover:scale-105'
                  }`}>
                    <History className={`w-6 h-6 ${activeTab === 'history' ? 'drop-shadow-sm' : ''}`} />
                  </div>
                  <span className={`relative text-xs font-semibold transition-all duration-300 ${
                    activeTab === 'history' ? 'scale-105' : ''
                  }`}>
                    History
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
