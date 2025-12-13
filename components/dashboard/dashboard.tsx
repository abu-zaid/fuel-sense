'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers';
import { getVehicles, getFuelEntries } from '@/lib/services';
import type { Vehicle, FuelEntry } from '@/lib/types';
import Header from '@/components/layout/header';
import VehicleSelector from '@/components/vehicles/vehicle-selector';
import StatCards from '@/components/dashboard/stat-cards';
import DashboardUI from './dashboard-ui';
import FuelHistory from '@/components/entries/fuel-history';
import EfficiencyChart from '@/components/charts/efficiency-chart';
import CostChart from '@/components/charts/cost-chart';
import FuelEntryModal from '@/components/entries/fuel-entry-modal';
import { BarChart3, Zap, History } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 pb-32">
      <Header onLogout={signOut} vehicles={vehicles} onImportSuccess={loadVehicles} />

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
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
                  <EfficiencyChart vehicleId={selectedVehicle?.id} compact />
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
                    <EfficiencyChart vehicleId={selectedVehicle?.id} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <CostChart vehicleId={selectedVehicle?.id} />
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
          className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-t border-stone-200/50 dark:border-slate-700/50"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-1 p-2 px-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all duration-300 ease-in-out group ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-br from-blue-100/80 to-blue-50/80 text-blue-600 shadow-md'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`mb-1 transition-all duration-300 ease-in-out ${activeTab === 'overview' ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all duration-300 ease-in-out group ${
                  activeTab === 'charts'
                    ? 'bg-gradient-to-br from-blue-100/80 to-blue-50/80 text-blue-600 shadow-md'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`mb-1 transition-all duration-300 ease-in-out ${activeTab === 'charts' ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all duration-300 ease-in-out group ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-br from-blue-100/80 to-blue-50/80 text-blue-600 shadow-md'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`mb-1 transition-all duration-300 ease-in-out ${activeTab === 'history' ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <History className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">History</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
