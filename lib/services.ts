import { supabase } from './supabase';
import type { Vehicle, FuelEntry, Reminder, DashboardStats, MonthlyCost, EfficiencyData, ServiceHistory } from './types';

// ============================================================================
// VEHICLES
// ============================================================================

export async function getVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Vehicle[];
}

export async function addVehicle(name: string, type: 'car' | 'bike') {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      user_id: user.id,
      name,
      type,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export async function updateVehicle(id: string, name: string, type: 'car' | 'bike') {
  const { data, error } = await supabase
    .from('vehicles')
    .update({ name, type })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// FUEL ENTRIES
// ============================================================================

export async function getFuelEntries(vehicleId?: string, limit = 100) {
  let query = supabase
    .from('fuel_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId);
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) throw error;
  return data as FuelEntry[];
}

export async function addFuelEntry(
  vehicleId: string,
  odo: number,
  petrolPrice: number,
  amount: number,
  distance: number
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('fuel_entries')
    .insert({
      user_id: user.id,
      vehicle_id: vehicleId,
      odo,
      petrol_price: petrolPrice,
      amount,
      distance,
    })
    .select()
    .single();

  if (error) throw error;
  return data as FuelEntry;
}

export async function updateFuelEntry(
  id: string,
  odo: number,
  petrolPrice: number,
  amount: number,
  distance: number
) {
  const { data, error } = await supabase
    .from('fuel_entries')
    .update({
      odo,
      petrol_price: petrolPrice,
      amount,
      distance,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as FuelEntry;
}

export async function deleteFuelEntry(id: string) {
  const { error } = await supabase
    .from('fuel_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

export async function getDashboardStats(vehicleId?: string): Promise<DashboardStats> {
  let query = supabase
    .from('fuel_entries')
    .select('amount, distance, petrol_price, fuel_used, efficiency, created_at');

  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const entries = data as FuelEntry[];

  // All-time totals
  const totalFuelCost = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalDistance = entries.reduce((sum, entry) => sum + entry.distance, 0);
  const totalFuelUsed = entries.reduce((sum, entry) => sum + entry.fuel_used, 0);
  const averageEfficiency = entries.length > 0 ? totalDistance / totalFuelUsed : 0;
  const costPerKm = totalDistance > 0 ? totalFuelCost / totalDistance : 0;

  // Calculate last 30 days vs previous 30 days for comparison
  const now = new Date();
  const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previous30DaysStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const previous30DaysEnd = last30DaysStart;

  const last30DaysEntries = entries.filter(e => new Date(e.created_at) >= last30DaysStart);
  const previous30DaysEntries = entries.filter(e => {
    const date = new Date(e.created_at);
    return date >= previous30DaysStart && date < previous30DaysEnd;
  });

  // Last 30 days totals
  const recentCost = last30DaysEntries.reduce((sum, e) => sum + e.amount, 0);
  const recentDistance = last30DaysEntries.reduce((sum, e) => sum + e.distance, 0);
  const recentFuel = last30DaysEntries.reduce((sum, e) => sum + e.fuel_used, 0);
  const recentEfficiency = recentFuel > 0 ? recentDistance / recentFuel : 0;
  const recentCostPerKm = recentDistance > 0 ? recentCost / recentDistance : 0;

  // Previous 30 days totals
  const prevCost = previous30DaysEntries.reduce((sum, e) => sum + e.amount, 0);
  const prevDistance = previous30DaysEntries.reduce((sum, e) => sum + e.distance, 0);
  const prevFuel = previous30DaysEntries.reduce((sum, e) => sum + e.fuel_used, 0);
  const prevEfficiency = prevFuel > 0 ? prevDistance / prevFuel : 0;
  const prevCostPerKm = prevDistance > 0 ? prevCost / prevDistance : 0;

  // Calculate percentage changes (recent vs previous period)
  const calculateChange = (recent: number, previous: number) => {
    if (previous === 0) return recent > 0 ? 100 : 0;
    return ((recent - previous) / previous) * 100;
  };

  return {
    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
    totalDistance: Math.round(totalDistance * 100) / 100,
    averageEfficiency: Math.round(averageEfficiency * 100) / 100,
    totalFuelUsed: Math.round(totalFuelUsed * 100) / 100,
    costPerKm: Math.round(costPerKm * 100) / 100,
    entriesCount: entries.length,
    costChange: Math.round(calculateChange(recentCost, prevCost) * 10) / 10,
    distanceChange: Math.round(calculateChange(recentDistance, prevDistance) * 10) / 10,
    efficiencyChange: Math.round(calculateChange(recentEfficiency, prevEfficiency) * 10) / 10,
    fuelChange: Math.round(calculateChange(recentFuel, prevFuel) * 10) / 10,
    costPerKmChange: Math.round(calculateChange(recentCostPerKm, prevCostPerKm) * 10) / 10,
  };
}

export async function getMonthlyCosts(vehicleId?: string): Promise<MonthlyCost[]> {
  let query = supabase
    .from('fuel_entries')
    .select('amount, created_at')
    .order('created_at', { ascending: true });

  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const entries = data as FuelEntry[];
  const monthlyCosts = new Map<string, number>();

  entries.forEach((entry) => {
    const date = new Date(entry.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyCosts.set(monthKey, (monthlyCosts.get(monthKey) || 0) + entry.amount);
  });

  return Array.from(monthlyCosts.entries()).map(([month, cost]) => ({
    month,
    cost: Math.round(cost * 100) / 100,
  }));
}

export async function getEfficiencyData(vehicleId?: string): Promise<EfficiencyData[]> {
  let query = supabase
    .from('fuel_entries')
    .select('efficiency, distance, fuel_used, created_at')
    .order('created_at', { ascending: true });

  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const entries = data as FuelEntry[];

  return entries.map((entry) => ({
    date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    efficiency: Math.round(entry.efficiency * 100) / 100,
    distance: entry.distance,
    fuel_used: entry.fuel_used,
  }));
}

// ============================================================================
// REMINDERS
// ============================================================================

export async function getReminders(vehicleId?: string) {
  let query = supabase
    .from('reminders')
    .select('*');

  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Reminder[];
}

export async function addReminder(
  vehicleId: string,
  type: 'distance' | 'time',
  value: number
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: user.id,
      vehicle_id: vehicleId,
      type,
      value,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Reminder;
}

export async function updateReminder(
  id: string,
  isActive: boolean
) {
  const { data, error } = await supabase
    .from('reminders')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Reminder;
}

export async function deleteReminder(id: string) {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// VEHICLE DETAILS
// ============================================================================

export async function updateVehicleDetails(
  id: string,
  details: {
    name?: string;
    type?: 'car' | 'bike';
    make?: string;
    model?: string;
    year?: number;
    insurance_expiry?: string;
    registration_expiry?: string;
    puc_expiry?: string;
  }
) {
  const { data, error } = await supabase
    .from('vehicles')
    .update(details)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Vehicle;
}

export async function getVehicleExpiryAlerts(vehicleId?: string) {
  let query = supabase
    .from('vehicles')
    .select('*');

  if (vehicleId) {
    query = query.eq('id', vehicleId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const vehicles = data as Vehicle[];
  const alerts: Array<{
    vehicleId: string;
    vehicleName: string;
    type: 'insurance' | 'registration' | 'puc';
    expiryDate: string;
    daysUntilExpiry: number;
  }> = [];

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  vehicles.forEach((vehicle) => {
    const checkExpiry = (date: string | undefined, type: 'insurance' | 'registration' | 'puc') => {
      if (!date) return;
      const expiryDate = new Date(date);
      if (expiryDate <= thirtyDaysFromNow) {
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          type,
          expiryDate: date,
          daysUntilExpiry,
        });
      }
    };

    checkExpiry(vehicle.insurance_expiry, 'insurance');
    checkExpiry(vehicle.registration_expiry, 'registration');
    checkExpiry(vehicle.puc_expiry, 'puc');
  });

  return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

// ============================================================================
// SERVICE HISTORY
// ============================================================================

export async function getServiceHistory(vehicleId?: string) {
  let query = supabase
    .from('service_history')
    .select('*')
    .order('service_date', { ascending: false });

  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ServiceHistory[];
}

export async function addServiceHistory(entry: {
  vehicle_id: string;
  service_date: string;
  service_type: string;
  description?: string;
  cost?: number;
  mileage?: number;
  next_service_due?: string;
  next_service_mileage?: number;
  service_provider?: string;
  notes?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('service_history')
    .insert({
      user_id: user.id,
      ...entry,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ServiceHistory;
}

export async function updateServiceHistory(id: string, entry: {
  service_date?: string;
  service_type?: string;
  description?: string;
  cost?: number;
  mileage?: number;
  next_service_due?: string;
  next_service_mileage?: number;
  service_provider?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('service_history')
    .update(entry)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ServiceHistory;
}

export async function deleteServiceHistory(id: string) {
  const { error } = await supabase
    .from('service_history')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getUpcomingServices(vehicleId?: string) {
  let query = supabase
    .from('service_history')
    .select('*')
    .not('next_service_due', 'is', null)
    .order('next_service_due', { ascending: true });

  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const services = data as ServiceHistory[];
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Filter to only show upcoming services in the next 30 days or overdue
  return services.filter((service) => {
    if (!service.next_service_due) return false;
    const dueDate = new Date(service.next_service_due);
    return dueDate <= thirtyDaysFromNow;
  });
}
