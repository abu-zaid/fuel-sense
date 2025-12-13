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
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DialogTitle className="text-xl font-bold">
                  {editEntry ? 'Edit Fuel Entry' : 'Add Fuel Entry'}
                </DialogTitle>
                <DialogDescription className="text-stone-600 dark:text-stone-400">
                  {editEntry 
                    ? 'Update your fuel entry details'
                    : 'Record your fuel refill details with automatic distance calculation'
                  }
                </DialogDescription>
              </motion.div>
            </DialogHeader>
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FuelEntryForm
                vehicleId={vehicleId}
                editEntry={editEntry}
                onSuccess={() => {
                  setOpen(false);
                  onSuccess();
                  if (onEditClose) onEditClose();
                }}
              />
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
