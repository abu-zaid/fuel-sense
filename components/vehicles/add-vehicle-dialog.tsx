import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Car, Bike } from 'lucide-react';
import { addVehicle } from '@/lib/services';
import { hapticSuccess, hapticError, hapticToggle } from '@/lib/haptic';

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddVehicleDialog({ open, onOpenChange, onSuccess }: AddVehicleDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'car' | 'bike'>('car');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const vehicle = await addVehicle(name, type);
      
      // Update with additional details if provided
      if (make || model || year) {
        const { updateVehicleDetails } = await import('@/lib/services');
        await updateVehicleDetails(vehicle.id, {
          make: make || undefined,
          model: model || undefined,
          year: year ? Number(year) : undefined,
        });
      }
      
      hapticSuccess();
      setName('');
      setType('car');
      setMake('');
      setModel('');
      setYear('');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      hapticError();
      setError(err instanceof Error ? err.message : 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>Add a vehicle to track fuel consumption</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Vehicle Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Car, Bike 1"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Vehicle Type</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between gap-2">
                  {type === 'car' ? <Car className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                  {type === 'car' ? 'Car' : 'Bike'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => {
                  hapticToggle();
                  setType('car');
                }} className="gap-2 cursor-pointer">
                  <Car className="w-4 h-4" />
                  Car
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  hapticToggle();
                  setType('bike');
                }} className="gap-2 cursor-pointer">
                  <Bike className="w-4 h-4" />
                  Bike
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Make</label>
              <Input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g., Honda, Toyota"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Model</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., Civic, Corolla"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Year</label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2020"
              min="1900"
              max="2100"
              disabled={loading}
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding...' : 'Add Vehicle'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
