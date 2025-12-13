import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AddVehicleDialog from '@/components/vehicles/add-vehicle-dialog';
import type { Vehicle } from '@/lib/types';
import { ChevronDown, Plus, Bike, Car } from 'lucide-react';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selected: Vehicle | null;
  onSelect: (vehicle: Vehicle) => void;
  onVehiclesChange: () => void;
}

export default function VehicleSelector({
  vehicles,
  selected,
  onSelect,
  onVehiclesChange,
}: VehicleSelectorProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {vehicles.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 min-w-max transition-all duration-300 ease-in-out hover:shadow-md hover:border-blue-300 rounded-xl"
            >
              {selected?.type === 'car' ? <Car className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
              {selected?.name}
              <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl">
            {vehicles.map((vehicle, index) => (
              <DropdownMenuItem 
                key={vehicle.id} 
                onClick={() => onSelect(vehicle)}
                className="cursor-pointer transition-all duration-300 ease-in-out hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
              >
                {vehicle.type === 'car' ? <Car className="w-4 h-4 mr-2" /> : <Bike className="w-4 h-4 mr-2" />}
                {vehicle.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button 
        onClick={() => setShowAddDialog(true)} 
        variant="ghost" 
        size="sm" 
        className="gap-2 transition-all duration-300 ease-in-out hover:bg-blue-50 dark:hover:bg-slate-800 hover:scale-105 rounded-xl"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Vehicle</span>
      </Button>

      <AddVehicleDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={onVehiclesChange} />
    </div>
  );
}
