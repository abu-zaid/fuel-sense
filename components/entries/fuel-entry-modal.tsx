'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FuelEntryForm from '@/components/entries/fuel-entry-form';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FuelEntryModalProps {
  vehicleId?: string;
  onSuccess: () => void;
}

export default function FuelEntryModal({ vehicleId, onSuccess }: FuelEntryModalProps) {
  const [open, setOpen] = useState(false);

  if (!vehicleId) return null;

  return (
    <>
      {/* Plus Button - Mobile and Desktop */}
      <motion.div 
        className="fixed bottom-32 right-4 md:bottom-24 md:right-8 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="rounded-full h-16 w-16 shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 ease-in-out bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 group"
          >
            <motion.div
              animate={{ rotate: [0, 90, 360] }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="w-8 h-8" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
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
                <DialogTitle className="text-xl font-bold">Add Fuel Entry</DialogTitle>
                <DialogDescription className="text-stone-600 dark:text-stone-400">
                  Record your fuel refill details with automatic distance calculation
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
                onSuccess={() => {
                  setOpen(false);
                  onSuccess();
                }}
              />
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
