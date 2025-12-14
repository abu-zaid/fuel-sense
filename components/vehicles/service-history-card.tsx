'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Pencil, Trash2, Calendar, DollarSign, Gauge } from 'lucide-react';
import type { ServiceHistory } from '@/lib/types';

interface ServiceHistoryCardProps {
  service: ServiceHistory;
  onEdit: (service: ServiceHistory) => void;
  onDelete: (id: string) => void;
}

const ServiceHistoryCard = memo(({ service, onEdit, onDelete }: ServiceHistoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-slate-800 dark:to-slate-900/50">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 dark:text-white">
                  {service.service_type}
                </h4>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {service.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(service)}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(service.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Date</p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {new Date(service.service_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">Cost</p>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                ₹{(service.cost ?? 0).toFixed(0)}
              </p>
            </div>
            <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
              <Gauge className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Mileage</p>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {(service.mileage ?? 0).toFixed(0)} km
              </p>
            </div>
          </div>

          {service.next_service_due && (
            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-slate-700">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Next service due:{' '}
                <span className="font-semibold text-stone-900 dark:text-white">
                  {new Date(service.next_service_due).toLocaleDateString()}
                </span>
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.service.id === nextProps.service.id &&
    prevProps.service.cost === nextProps.service.cost &&
    prevProps.service.mileage === nextProps.service.mileage
  );
});

ServiceHistoryCard.displayName = 'ServiceHistoryCard';

export default ServiceHistoryCard;
