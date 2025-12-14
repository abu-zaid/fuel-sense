'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle } from '@/lib/types';
import { updateVehicleDetails, deleteVehicle } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Car, Bike, Calendar, FileText, Shield, Pencil, Save, Trash2 } from 'lucide-react';
import { hapticSuccess, hapticError, hapticButton } from '@/lib/haptic';
import { toast } from '@/components/ui/toast';

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onUpdate: () => void;
}

export default function VehicleDetails({ vehicle, onUpdate }: VehicleDetailsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: vehicle.name,
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    insurance_expiry: vehicle.insurance_expiry || '',
    registration_expiry: vehicle.registration_expiry || '',
    puc_expiry: vehicle.puc_expiry || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateVehicleDetails(vehicle.id, {
        name: formData.name,
        make: formData.make || undefined,
        model: formData.model || undefined,
        year: formData.year ? Number(formData.year) : undefined,
        insurance_expiry: formData.insurance_expiry || undefined,
        registration_expiry: formData.registration_expiry || undefined,
        puc_expiry: formData.puc_expiry || undefined,
      });
      hapticSuccess();
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      hapticError();
      console.error('Failed to update vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteVehicle(vehicle.id);
      hapticSuccess();
      router.push('/');
    } catch (error) {
      hapticError();
      console.error('Failed to delete vehicle:', error);
      toast.error('Failed to delete vehicle. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const isExpiringSoon = (date?: string) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate <= thirtyDaysFromNow;
  };

  const isExpired = (date?: string) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const now = new Date();
    return expiryDate < now;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getExpiryClass = (date?: string) => {
    if (!date) return 'text-stone-500';
    if (isExpired(date)) return 'text-red-600 font-semibold';
    if (isExpiringSoon(date)) return 'text-orange-500 font-semibold';
    return 'text-stone-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {vehicle.type === 'car' ? (
              <Car className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            ) : (
              <Bike className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-white">{vehicle.name}</h2>
              {vehicle.make && vehicle.model && (
                <p className="text-stone-600 dark:text-stone-400">
                  {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                </p>
              )}
            </div>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  hapticButton();
                  setIsEditing(true);
                }}
                variant="outline"
                size="sm"
                className="gap-2 border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-700"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
              <Button
                onClick={() => {
                  hapticButton();
                  setShowDeleteConfirm(true);
                }}
                variant="outline"
                size="sm"
                className="gap-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Vehicle Name</label>
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                className="bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-600"
              />
            ) : (
              <p className="text-stone-800 dark:text-white py-2">{vehicle.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Type</label>
            <p className="text-stone-800 dark:text-white py-2 capitalize">{vehicle.type}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Make</label>
            {isEditing ? (
              <Input
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="e.g., Honda, Toyota"
                disabled={loading}
                className="bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-600"
              />
            ) : (
              <p className="text-stone-800 dark:text-white py-2">{vehicle.make || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Model</label>
            {isEditing ? (
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g., Civic, Corolla"
                disabled={loading}
                className="bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-600"
              />
            ) : (
              <p className="text-stone-800 dark:text-white py-2">{vehicle.model || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Year</label>
            {isEditing ? (
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="e.g., 2020"
                min="1900"
                max="2100"
                disabled={loading}
                className="bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-600"
              />
            ) : (
              <p className="text-stone-800 dark:text-white py-2">{vehicle.year || 'Not set'}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: vehicle.name,
                  make: vehicle.make || '',
                  model: vehicle.model || '',
                  year: vehicle.year || '',
                  insurance_expiry: vehicle.insurance_expiry || '',
                  registration_expiry: vehicle.registration_expiry || '',
                  puc_expiry: vehicle.puc_expiry || '',
                });
              }}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>

      {/* Document Expiry Tracking */}
      <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-800 dark:to-slate-900">
        <h3 className="text-lg font-semibold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          Document Expiry Tracking
        </h3>

        <div className="space-y-4">
          {/* Insurance Expiry */}
          <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <div>
                <p className="font-medium text-stone-800 dark:text-white">Insurance</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.insurance_expiry}
                    onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                    disabled={loading}
                    className="mt-1"
                  />
                ) : (
                  <p className={getExpiryClass(vehicle.insurance_expiry)}>
                    {formatDate(vehicle.insurance_expiry)}
                  </p>
                )}
              </div>
            </div>
            {!isEditing && isExpired(vehicle.insurance_expiry) && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Expired</span>
            )}
            {!isEditing && !isExpired(vehicle.insurance_expiry) && isExpiringSoon(vehicle.insurance_expiry) && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Expiring Soon</span>
            )}
          </div>

          {/* Registration Expiry */}
          <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-500 dark:text-green-400" />
              <div>
                <p className="font-medium text-stone-800 dark:text-white">Registration</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.registration_expiry}
                    onChange={(e) => setFormData({ ...formData, registration_expiry: e.target.value })}
                    disabled={loading}
                    className="mt-1"
                  />
                ) : (
                  <p className={getExpiryClass(vehicle.registration_expiry)}>
                    {formatDate(vehicle.registration_expiry)}
                  </p>
                )}
              </div>
            </div>
            {!isEditing && isExpired(vehicle.registration_expiry) && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Expired</span>
            )}
            {!isEditing && !isExpired(vehicle.registration_expiry) && isExpiringSoon(vehicle.registration_expiry) && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Expiring Soon</span>
            )}
          </div>

          {/* PUC Expiry */}
          <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <div>
                <p className="font-medium text-stone-800 dark:text-white">PUC Certificate</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.puc_expiry}
                    onChange={(e) => setFormData({ ...formData, puc_expiry: e.target.value })}
                    disabled={loading}
                    className="mt-1"
                  />
                ) : (
                  <p className={getExpiryClass(vehicle.puc_expiry)}>
                    {formatDate(vehicle.puc_expiry)}
                  </p>
                )}
              </div>
            </div>
            {!isEditing && isExpired(vehicle.puc_expiry) && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Expired</span>
            )}
            {!isEditing && !isExpired(vehicle.puc_expiry) && isExpiringSoon(vehicle.puc_expiry) && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Expiring Soon</span>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{vehicle.name}</strong>? This action cannot be undone.
              All fuel entries and service history associated with this vehicle will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Deleting...' : 'Delete Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
