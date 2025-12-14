// Database types
export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  type: 'car' | 'bike';
  created_at: string;
}

export interface FuelEntry {
  id: string;
  user_id: string;
  vehicle_id: string;
  odo: number;
  petrol_price: number;
  amount: number;
  distance: number;
  fuel_used: number;
  efficiency: number;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  vehicle_id: string;
  type: 'distance' | 'time';
  value: number | null;
  last_triggered_at: string | null;
  is_active: boolean;
  created_at: string;
}

// User profile
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

// Statistics
export interface DashboardStats {
  totalFuelCost: number;
  totalDistance: number;
  averageEfficiency: number;
  totalFuelUsed: number;
  costPerKm: number;
  entriesCount: number;
  costChange?: number; // percentage change vs last month
  distanceChange?: number;
  costPerKmChange?: number;
  efficiencyChange?: number;
  fuelChange?: number;
}

export interface MonthlyCost {
  month: string;
  cost: number;
}

export interface EfficiencyData {
  date: string;
  efficiency: number;
  distance: number;
  fuel_used: number;
}
