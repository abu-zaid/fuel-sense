'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers';
import { useTheme } from '@/app/theme-provider';
import { getUserVehicles, getDefaultVehicle, setDefaultVehicle } from '@/lib/profile';
import { hapticToggle, hapticButton, hapticSuccess } from '@/lib/haptic';
import { LoadingSpinner } from '@/components/ui/animations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AddVehicleDialog from '@/components/vehicles/add-vehicle-dialog';
import ThemeSettings from './theme-settings';
import { LogOut, User, Mail, Car, Calendar, Check, Moon, Sun, Monitor, Settings, Plus, Bike } from 'lucide-react';
import type { Vehicle } from '@/lib/types';

interface ProfileContentProps {
  onLogout: () => Promise<void>;
  onDefaultVehicleChange?: () => void;
}

export default function ProfileContent({ onLogout, onDefaultVehicleChange }: ProfileContentProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [defaultVehicleId, setDefaultVehicleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [userVehicles, defaultId] = await Promise.all([
        getUserVehicles(),
        getDefaultVehicle(),
      ]);
      setVehicles(userVehicles);
      setDefaultVehicleId(defaultId || '');
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultVehicleChange = async (vehicleId: string) => {
    hapticToggle();
    setSaving(true);
    try {
      await setDefaultVehicle(vehicleId);
      setDefaultVehicleId(vehicleId);
      hapticSuccess();
      // Notify parent component to reload vehicles with new default
      if (onDefaultVehicleChange) {
        onDefaultVehicleChange();
      }
    } catch (err) {
      console.error('Error setting default vehicle:', err);
      setError(err instanceof Error ? err.message : 'Failed to set default vehicle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner message="Loading profile..." className="py-12" />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          <div className="relative p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Profile</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">Manage your account settings</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-50 dark:bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">{user?.email}</p>
                </div>
              </div>

              {/* Account Created */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-50 dark:bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Member Since</p>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Vehicle Management Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">Vehicle Management</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Manage your vehicles and set default</p>
                </div>
              </div>
            </div>

            {vehicles.length > 0 ? (
              <div className="space-y-2">
                {vehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                      defaultVehicleId === vehicle.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleDefaultVehicleChange(vehicle.id)}
                        disabled={saving}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          defaultVehicleId === vehicle.id 
                            ? 'bg-blue-500' 
                            : 'bg-stone-300 dark:bg-slate-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {vehicle.type === 'car' ? (
                              <Car className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                            ) : (
                              <Bike className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                            )}
                            <p className="font-semibold text-stone-900 dark:text-white">{vehicle.name}</p>
                          </div>
                          {vehicle.make && vehicle.model && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                            </p>
                          )}
                        </div>
                        {defaultVehicleId === vehicle.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <Check className="w-5 h-5 text-blue-500" />
                          </motion.div>
                        )}
                      </button>
                      <Button
                        onClick={() => {
                          hapticButton();
                          window.location.href = `/vehicle/${vehicle.id}`;
                        }}
                        variant="ghost"
                        size="sm"
                        className="ml-2 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-stone-400 dark:text-stone-600 mx-auto mb-3" />
                <p className="text-stone-600 dark:text-stone-400 mb-4">No vehicles added yet</p>
              </div>
            )}

            <Button
              onClick={() => {
                hapticButton();
                setShowAddDialog(true);
              }}
              variant="outline"
              className="w-full mt-4 gap-2 border-2 border-dashed border-stone-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="w-4 h-4" />
              Add New Vehicle
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Theme Selector Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-white" />
                ) : theme === 'light' ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Monitor className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Theme</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">Choose your preferred theme</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                onClick={() => {
                  hapticToggle();
                  setTheme('dark');
                }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                    : 'border-stone-200 dark:border-slate-700 hover:border-stone-300 dark:hover:border-slate-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-600 dark:text-stone-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-indigo-900 dark:text-indigo-300' : 'text-stone-700 dark:text-stone-300'}`}>
                    Dark
                  </span>
                  {theme === 'dark' && (
                    <motion.div
                      className="absolute top-2 right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-5 h-5 text-indigo-500" />
                    </motion.div>
                  )}
                </div>
              </motion.button>

              <motion.button
                onClick={() => {
                  hapticToggle();
                  setTheme('light');
                }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                    : 'border-stone-200 dark:border-slate-700 hover:border-stone-300 dark:hover:border-slate-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-600 dark:text-stone-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-indigo-900 dark:text-indigo-300' : 'text-stone-700 dark:text-stone-300'}`}>
                    Light
                  </span>
                  {theme === 'light' && (
                    <motion.div
                      className="absolute top-2 right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-5 h-5 text-indigo-500" />
                    </motion.div>
                  )}
                </div>
              </motion.button>

              <motion.button
                onClick={() => {
                  hapticToggle();
                  setTheme('system');
                }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  theme === 'system'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                    : 'border-stone-200 dark:border-slate-700 hover:border-stone-300 dark:hover:border-slate-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-600 dark:text-stone-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'system' ? 'text-indigo-900 dark:text-indigo-300' : 'text-stone-700 dark:text-stone-300'}`}>
                    System
                  </span>
                  {theme === 'system' && (
                    <motion.div
                      className="absolute top-2 right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-5 h-5 text-indigo-500" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Theme Customization Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Customization</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">Personalize your experience</p>
              </div>
            </div>
            <ThemeSettings />
          </div>
        </Card>
      </motion.div>

      {/* App Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
          <div className="p-6">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">About FuelSense</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-100 dark:bg-slate-700/50">
                <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Version</span>
                <span className="text-sm font-bold text-stone-900 dark:text-white">1.0.0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-100 dark:bg-slate-700/50">
                <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Total Vehicles</span>
                <span className="text-sm font-bold text-stone-900 dark:text-white">{vehicles.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-100 dark:bg-slate-700/50">
                <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Account Type</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">Free</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-slate-700">
              <p className="text-xs text-center text-stone-500 dark:text-stone-400">
                Track your vehicle fuel consumption efficiently
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Sign Out Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
          <div className="p-6">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-4">Account Actions</h3>
            <Button
              onClick={onLogout}
              variant="destructive"
              className="w-full gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </Card>
      </motion.div>
      {/* Add Vehicle Dialog */}
      <AddVehicleDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onSuccess={loadProfileData} 
      />
    </div>
  );
}
