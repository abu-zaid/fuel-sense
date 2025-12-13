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
    if (isEditMode && editEntry) {
      setOpen(true);
    }
  }, [isEditMode, editEntry]);

  const handleClose = (value: boolean) => {
    setOpen(value);
    if (!value && isEditMode && onEditClose) {
      onEditClose();
    }
  };

  if (!vehicleId) return null;

  return (
    <>
      {/* Plus Button - Mobile and Desktop */}
      <motion.div 
        className="fixed bottom-28 right-4 md:bottom-24 md:right-8 z-40 safe-area-inset-bottom"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.5rem)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
      >
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 ease-in-out bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 group touch-manipulation"
          type="button"
        >
          <motion.div
            animate={{ rotate: [0, 90, 360] }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Plus className="w-8 h-8" />
          </motion.div>
        </Button>
      </motion.div>

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
