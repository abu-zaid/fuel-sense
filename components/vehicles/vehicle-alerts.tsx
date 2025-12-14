'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVehicleExpiryAlerts, getUpcomingServices } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Wrench, X, Bell } from 'lucide-react';
import { hapticButton } from '@/lib/haptic';

interface Alert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: string;
  message: string;
  daysUntil: number;
  severity: 'critical' | 'warning' | 'info';
}

export default function VehicleAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const [expiryAlerts, upcomingServices] = await Promise.all([
        getVehicleExpiryAlerts(),
        getUpcomingServices(),
      ]);

      const alertList: Alert[] = [];

      // Process expiry alerts
      expiryAlerts.forEach((alert) => {
        const typeLabel = alert.type === 'insurance' ? 'Insurance' 
                        : alert.type === 'registration' ? 'Registration' 
                        : 'PUC Certificate';
        
        const severity: 'critical' | 'warning' = alert.daysUntilExpiry < 0 ? 'critical' : 'warning';
        const message = alert.daysUntilExpiry < 0
          ? `${typeLabel} expired ${Math.abs(alert.daysUntilExpiry)} days ago`
          : `${typeLabel} expires in ${alert.daysUntilExpiry} days`;

        alertList.push({
          id: `expiry-${alert.vehicleId}-${alert.type}`,
          vehicleId: alert.vehicleId,
          vehicleName: alert.vehicleName,
          type: `expiry-${alert.type}`,
          message,
          daysUntil: alert.daysUntilExpiry,
          severity,
        });
      });

      // Process upcoming services
      upcomingServices.forEach((service) => {
        if (service.next_service_due) {
          const dueDate = new Date(service.next_service_due);
          const now = new Date();
          const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          const severity: 'critical' | 'warning' = daysUntil < 0 ? 'critical' : 'warning';
          const message = daysUntil < 0
            ? `${service.service_type} was due ${Math.abs(daysUntil)} days ago`
            : `${service.service_type} due in ${daysUntil} days`;

          alertList.push({
            id: `service-${service.id}`,
            vehicleId: service.vehicle_id,
            vehicleName: '', // We'd need to join with vehicles table
            type: 'service',
            message,
            daysUntil,
            severity,
          });
        }
      });

      // Sort by urgency (most urgent first)
      alertList.sort((a, b) => a.daysUntil - b.daysUntil);

      setAlerts(alertList);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissed(prev => new Set(prev).add(alertId));
  };

  const handleViewVehicle = (vehicleId: string) => {
    hapticButton();
    router.push(`/vehicle/${vehicleId}`);
  };

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  if (loading || visibleAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-stone-800 mb-3">Vehicle Alerts</h3>
          <div className="space-y-2">
            {visibleAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start justify-between p-3 rounded-lg ${
                  alert.severity === 'critical'
                    ? 'bg-red-100 border border-red-300'
                    : 'bg-orange-100 border border-orange-300'
                }`}
              >
                <div className="flex items-start gap-2 flex-1">
                  {alert.type.startsWith('service') ? (
                    <Wrench className={`w-4 h-4 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                  ) : (
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                  )}
                  <div>
                    {alert.vehicleName && (
                      <p className="text-xs font-medium text-stone-700 mb-1">
                        {alert.vehicleName}
                      </p>
                    )}
                    <p className={`text-sm ${
                      alert.severity === 'critical' ? 'text-red-800 font-medium' : 'text-orange-800'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {alert.vehicleId && (
                    <Button
                      onClick={() => handleViewVehicle(alert.vehicleId)}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      View
                    </Button>
                  )}
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="p-1 hover:bg-white/50 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-stone-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {visibleAlerts.length > 5 && (
            <p className="text-xs text-stone-600 mt-2">
              +{visibleAlerts.length - 5} more alerts
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
