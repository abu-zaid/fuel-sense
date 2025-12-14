'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hapticButton } from '@/lib/haptic';
import { toast } from '@/components/ui/toast';

interface PrintButtonProps {
  className?: string;
}

export function PrintButton({ className }: PrintButtonProps) {
  const handlePrint = () => {
    hapticButton();
    
    // Add print date to document
    const printDate = document.createElement('div');
    printDate.className = 'print-only print-date';
    printDate.setAttribute('data-date', new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }));
    document.body.appendChild(printDate);
    
    // Trigger print
    window.print();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(printDate);
    }, 100);
  };

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      className={`flex items-center gap-2 ${className || ''}`}
    >
      <Printer className="w-4 h-4" />
      <span>Print Report</span>
    </Button>
  );
}

// Wrapper component for print-friendly sections
export function PrintSection({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="print-section page-break-inside-avoid">
      {title && (
        <h2 className="text-xl font-bold mb-4 text-stone-900 dark:text-white print:text-black">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

// Vehicle info component for print
export function PrintVehicleInfo({ vehicle }: { vehicle: any }) {
  return (
    <div className="vehicle-info print-only">
      <h2 className="text-2xl font-bold mb-2">{vehicle.name}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Make & Model</p>
          <p className="font-semibold">{vehicle.make} {vehicle.model}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Year</p>
          <p className="font-semibold">{vehicle.year}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Type</p>
          <p className="font-semibold capitalize">{vehicle.type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Fuel Type</p>
          <p className="font-semibold capitalize">{vehicle.fuel_type}</p>
        </div>
      </div>
    </div>
  );
}
