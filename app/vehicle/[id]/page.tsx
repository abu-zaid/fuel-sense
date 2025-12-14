'use client';

import { use } from 'react';
import VehicleManagement from '@/components/vehicles/vehicle-management';

export default function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <VehicleManagement vehicleId={id} />;
}
