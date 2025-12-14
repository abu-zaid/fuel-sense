'use client';

import { useState, useEffect } from 'react';
import { ServiceHistory } from '@/lib/types';
import {
  getServiceHistory,
  addServiceHistory,
  updateServiceHistory,
  deleteServiceHistory,
} from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Wrench, Plus, Pencil, Trash2, Calendar, DollarSign, Gauge } from 'lucide-react';
import { hapticSuccess, hapticError, hapticButton } from '@/lib/haptic';

interface ServiceHistoryListProps {
  vehicleId: string;
}

export default function ServiceHistoryList({ vehicleId }: ServiceHistoryListProps) {
  const [services, setServices] = useState<ServiceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<ServiceHistory | null>(null);
  const [formData, setFormData] = useState({
    service_date: '',
    service_type: '',
    description: '',
    cost: '',
    mileage: '',
    next_service_due: '',
    next_service_mileage: '',
    service_provider: '',
    notes: '',
  });

  useEffect(() => {
    loadServices();
  }, [vehicleId]);

  const loadServices = async () => {
    try {
      const data = await getServiceHistory(vehicleId);
      setServices(data);
    } catch (error) {
      console.error('Failed to load service history:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      service_date: '',
      service_type: '',
      description: '',
      cost: '',
      mileage: '',
      next_service_due: '',
      next_service_mileage: '',
      service_provider: '',
      notes: '',
    });
    setEditingService(null);
  };

  const handleAdd = () => {
    hapticButton();
    resetForm();
    setShowDialog(true);
  };

  const handleEdit = (service: ServiceHistory) => {
    hapticButton();
    setEditingService(service);
    setFormData({
      service_date: service.service_date.split('T')[0],
      service_type: service.service_type,
      description: service.description || '',
      cost: service.cost?.toString() || '',
      mileage: service.mileage?.toString() || '',
      next_service_due: service.next_service_due?.split('T')[0] || '',
      next_service_mileage: service.next_service_mileage?.toString() || '',
      service_provider: service.service_provider || '',
      notes: service.notes || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        vehicle_id: vehicleId,
        service_date: formData.service_date,
        service_type: formData.service_type,
        description: formData.description || undefined,
        cost: formData.cost ? Number(formData.cost) : undefined,
        mileage: formData.mileage ? Number(formData.mileage) : undefined,
        next_service_due: formData.next_service_due || undefined,
        next_service_mileage: formData.next_service_mileage ? Number(formData.next_service_mileage) : undefined,
        service_provider: formData.service_provider || undefined,
        notes: formData.notes || undefined,
      };

      if (editingService) {
        await updateServiceHistory(editingService.id, serviceData);
      } else {
        await addServiceHistory(serviceData);
      }

      hapticSuccess();
      setShowDialog(false);
      resetForm();
      loadServices();
    } catch (error) {
      hapticError();
      console.error('Failed to save service:', error);
      alert('Failed to save service record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service record?')) return;

    setLoading(true);
    try {
      await deleteServiceHistory(id);
      hapticSuccess();
      loadServices();
    } catch (error) {
      hapticError();
      console.error('Failed to delete service:', error);
      alert('Failed to delete service record');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-800 dark:text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          Service History
        </h3>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {loading && services.length === 0 ? (
        <Card className="p-8 text-center bg-stone-50 dark:bg-slate-800/50 border-stone-200 dark:border-slate-700">
          <p className="text-stone-500 dark:text-stone-400">Loading service history...</p>
        </Card>
      ) : services.length === 0 ? (
        <Card className="p-8 text-center bg-stone-50 dark:bg-slate-800/50 border-stone-200 dark:border-slate-700">
          <Wrench className="w-12 h-12 mx-auto text-stone-400 dark:text-stone-600 mb-3" />
          <p className="text-stone-600 dark:text-stone-400 mb-4">No service records yet</p>
          <Button onClick={handleAdd} variant="outline" className="gap-2 border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-700">
            <Plus className="w-4 h-4" />
            Add First Service
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service.id} className="p-4 hover:shadow-md transition-shadow bg-stone-50 dark:bg-slate-800/50 border-stone-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-stone-800 dark:text-white">{service.service_type}</h4>
                    {service.cost && (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(service.cost)}
                      </span>
                    )}
                  </div>

                  {service.description && (
                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">{service.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(service.service_date)}
                    </div>
                    {service.mileage && (
                      <div className="flex items-center gap-1">
                        <Gauge className="w-4 h-4" />
                        {service.mileage.toLocaleString()} km
                      </div>
                    )}
                    {service.service_provider && (
                      <div className="text-stone-600 dark:text-stone-400">
                        @ {service.service_provider}
                      </div>
                    )}
                  </div>

                  {service.next_service_due && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Next Service:</strong> {formatDate(service.next_service_due)}
                        {service.next_service_mileage && ` at ${service.next_service_mileage.toLocaleString()} km`}
                      </p>
                    </div>
                  )}

                  {service.notes && (
                    <div className="mt-2 p-2 bg-stone-100 dark:bg-slate-700/50 rounded text-sm text-stone-600 dark:text-stone-400">
                      {service.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service Record' : 'Add Service Record'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Update service record details' : 'Record a new service or maintenance activity'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Service Date *
                </label>
                <Input
                  type="date"
                  value={formData.service_date}
                  onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Service Type *
                </label>
                <Input
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  placeholder="e.g., Oil Change, General Service"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of service"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Cost (₹)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Mileage (km)
                </label>
                <Input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  placeholder="Current odometer reading"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Service Provider
                </label>
                <Input
                  value={formData.service_provider}
                  onChange={(e) => setFormData({ ...formData, service_provider: e.target.value })}
                  placeholder="e.g., Workshop name"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Next Service Due
                </label>
                <Input
                  type="date"
                  value={formData.next_service_due}
                  onChange={(e) => setFormData({ ...formData, next_service_due: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Next Service Mileage (km)
                </label>
                <Input
                  type="number"
                  value={formData.next_service_mileage}
                  onChange={(e) => setFormData({ ...formData, next_service_mileage: e.target.value })}
                  placeholder="Expected mileage for next service"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or observations"
                  disabled={loading}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-stone-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
