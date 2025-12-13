'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FuelEntryForm from '@/components/entries/fuel-entry-form';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FuelEntry } from '@/lib/types';

interface FuelEntryModalProps {
  vehicleId?: string;
  onSuccess: () => void;
  editEntry?: FuelEntry | null;
  isEditMode?: boolean;
  onEditClose?: () => void;
}

export default function FuelEntryModal({ vehicleId, onSuccess, editEntry, isEditMode, onEditClose }: FuelEntryModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isEditMode !== undefined) {
      setOpen(true);
    }
  }, [isEditMode, editEntry]);

  const handleClose = (value: boolean) => {
    setOpen(value);
    if (!value && onEditClose) {
      onEditClose();
    }
  };

  if (!vehicleId) return null;

  return (
    <>
      {/* Modal */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editEntry ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
            </DialogTitle>
            <DialogDescription>
              {editEntry 
                ? 'Update your fuel entry details'
                : 'Record your fuel refill details with automatic distance calculation'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <FuelEntryForm
              vehicleId={vehicleId}
              editEntry={editEntry}
              onSuccess={() => {
                setOpen(false);
                onSuccess();
                if (onEditClose) onEditClose();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
