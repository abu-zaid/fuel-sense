'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle } from '@/lib/types';
import { getVehicles } from '@/lib/services';
import VehicleDetails from '@/components/vehicles/vehicle-details';
import ServiceHistoryList from '@/components/vehicles/service-history-list';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Car, Bike } from 'lucide-react';
import { hapticButton } from '@/lib/haptic';

interface VehicleManagementProps {
  vehicleId: string;
}

export default function VehicleManagement({ vehicleId }: VehicleManagementProps) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      const vehicles = await getVehicles();
      const found = vehicles.find((v) => v.id === vehicleId);
      setVehicle(found || null);
    } catch (error) {
      console.error('Failed to load vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
            <p className="text-stone-500 dark:text-stone-400">Loading vehicle...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
            <Car className="w-16 h-16 mx-auto text-stone-400 dark:text-stone-600 mb-3" />
            <p className="text-stone-600 dark:text-stone-400 mb-4">Vehicle not found</p>
            <Button onClick={() => router.push('/')} variant="outline" className="border-stone-300 dark:border-slate-600">
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          onClick={() => {
            hapticButton();
            router.push('/');
          }}
          variant="ghost"
          className="gap-2 text-stone-900 dark:text-white hover:bg-stone-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Vehicle Details */}
        <VehicleDetails vehicle={vehicle} onUpdate={loadVehicle} />

        {/* Service History */}
        <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
          <ServiceHistoryList vehicleId={vehicle.id} />
        </Card>
      </div>
    </div>
  );
}
