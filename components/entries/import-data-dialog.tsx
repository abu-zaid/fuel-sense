'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { addFuelEntry, addVehicle } from '@/lib/services';
import type { Vehicle } from '@/lib/types';

interface ImportDataDialogProps {
  onSuccess: () => void;
  vehicles: Vehicle[];
}

export default function ImportDataDialog({ onSuccess, vehicles }: ImportDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importStats, setImportStats] = useState({ vehicles: 0, entries: 0 });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());

      let vehicleIndex = -1;
      let currentVehicle: { name: string; type: 'car' | 'bike' } | null = null;
      let entriesCount = 0;
      let vehiclesCount = 0;

      for (const line of lines) {
        // Skip header and metadata rows
        if (
          line.startsWith('Vehicle:') ||
          line.startsWith('Type:') ||
          line.startsWith('Export Date:') ||
          line.startsWith('Date,') ||
          line === ''
        ) {
          const vehicleMatch = line.match(/Vehicle:\s*(.+)/);
          if (vehicleMatch) {
            const vehicleName = vehicleMatch[1].trim();
            currentVehicle = {
              name: vehicleName,
              type: 'car', // default type, will update if Type line is found
            };
          }

          const typeMatch = line.match(/Type:\s*(.+)/);
          if (typeMatch && currentVehicle) {
            const type = typeMatch[1].trim().toLowerCase();
            currentVehicle.type = (type === 'car' || type === 'bike' ? type : 'car') as 'car' | 'bike';
          }

          continue;
        }

        const parts = line.split(',').map((p) => p.trim());

        // Check if this is a data row (has at least 7 columns for vehicle-specific export)
        if (parts.length >= 7 && !isNaN(parseFloat(parts[1]))) {
          if (!currentVehicle) {
            setError('Invalid CSV format: Vehicle information missing');
            setLoading(false);
            return;
          }

          // Find or create vehicle
          let vehicleId = vehicles.find((v) => v.name === currentVehicle?.name)?.id;

          if (!vehicleId) {
            const newVehicle = await addVehicle(currentVehicle.name, currentVehicle.type);
            vehicleId = newVehicle.id;
            vehiclesCount++;
          }

          // Parse entry data
          const odo = parseFloat(parts[1]);
          const amount = parseFloat(parts[2]);
          const petrolPrice = parseFloat(parts[3]);
          const distance = parseFloat(parts[4]);

          if (!isNaN(odo) && !isNaN(amount) && !isNaN(petrolPrice) && !isNaN(distance)) {
            await addFuelEntry(vehicleId, odo, petrolPrice, amount, distance);
            entriesCount++;
          }
        } else if (parts.length >= 8) {
          // Multi-vehicle export format (has vehicle name in first column)
          const vehicleName = parts[0];
          let vehicleId = vehicles.find((v) => v.name === vehicleName)?.id;

          if (!vehicleId) {
            const newVehicle = await addVehicle(vehicleName, 'car');
            vehicleId = newVehicle.id;
            vehiclesCount++;
          }

          const odo = parseFloat(parts[2]);
          const amount = parseFloat(parts[3]);
          const petrolPrice = parseFloat(parts[4]);
          const distance = parseFloat(parts[5]);

          if (!isNaN(odo) && !isNaN(amount) && !isNaN(petrolPrice) && !isNaN(distance)) {
            await addFuelEntry(vehicleId, odo, petrolPrice, amount, distance);
            entriesCount++;
          }
        }
      }

      setImportStats({ vehicles: vehiclesCount, entries: entriesCount });
      setSuccess(`Successfully imported ${entriesCount} fuel entries${vehiclesCount > 0 ? ` and ${vehiclesCount} vehicle(s)` : ''}`);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Fuel Data</DialogTitle>
          <DialogDescription>Upload a CSV file exported from this app or a compatible format</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer block">
              <Upload className="w-8 h-8 mx-auto mb-2 text-stone-400" />
              <p className="text-sm font-medium text-stone-700">Click to upload or drag and drop</p>
              <p className="text-xs text-stone-500 mt-1">CSV files only</p>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="text-xs text-stone-600 space-y-2">
            <p className="font-medium">Expected CSV Format:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Vehicle name/type headers (optional)</li>
              <li>Columns: Date, Odometer, Fuel Amount, Price/L, Distance, Fuel Used, Efficiency</li>
              <li>Or: Vehicle, Date, Odometer, Fuel Amount, Price/L, Distance, Fuel Used, Efficiency</li>
            </ul>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin">
                <div className="w-6 h-6 border-2 border-stone-300 border-t-blue-500 rounded-full" />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
