"use client";
import React, { useEffect, useState } from 'react';
import { getUserVehicles, setDefaultVehicle, getDefaultVehicle } from '@/lib/profile';
import { useRouter } from 'next/navigation';

import type { Vehicle } from '@/lib/types';

export default function ProfilePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [defaultVehicle, setDefault] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const userVehicles = await getUserVehicles();
        setVehicles(userVehicles);
        const def = await getDefaultVehicle();
        setDefault(def || '');
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDefaultChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setDefault(selected);
    try {
      await setDefaultVehicle(selected);
    } catch (err) {
      console.error('Error setting default vehicle:', err);
      setError(err instanceof Error ? err.message : 'Failed to set default vehicle');
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-stone-600 dark:text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-red-800 dark:text-red-400 font-semibold mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Default Vehicle</label>
        <select
          className="border rounded px-3 py-2 w-full dark:bg-slate-800 dark:border-slate-700"
          value={defaultVehicle}
          onChange={handleDefaultChange}
        >
          <option value="">Select a vehicle</option>
          {vehicles.map((v: any) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
