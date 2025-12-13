import { Card } from '@/components/ui/card';
import FuelEntryForm from '@/components/entries/fuel-entry-form';

interface DashboardUIProps {
  vehicleId?: string;
  onEntryAdded?: () => void;
}

export default function DashboardUI({ vehicleId, onEntryAdded }: DashboardUIProps) {
  if (!vehicleId) return null;

  return null;
}
