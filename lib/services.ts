import { supabase } from './supabase';
import type { Vehicle, FuelEntry, Reminder, DashboardStats, MonthlyCost, EfficiencyData } from './types';

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
    .select('amount, distance, petrol_price, fuel_used, efficiency');

  if (vehicleId) {
    query = query.eq('vehicle_id', vehicleId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const entries = data as FuelEntry[];

  const totalFuelCost = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalDistance = entries.reduce((sum, entry) => sum + entry.distance, 0);
  const totalFuelUsed = entries.reduce((sum, entry) => sum + entry.fuel_used, 0);
  const averageEfficiency = entries.length > 0 ? totalDistance / totalFuelUsed : 0;

  return {
    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
    totalDistance: Math.round(totalDistance * 100) / 100,
    averageEfficiency: Math.round(averageEfficiency * 100) / 100,
    totalFuelUsed: Math.round(totalFuelUsed * 100) / 100,
    entriesCount: entries.length,
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
