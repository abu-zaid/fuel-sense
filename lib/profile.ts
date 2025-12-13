import { supabase } from './supabase';
import type { Vehicle } from './types';

// Get all vehicles for the current user
export async function getUserVehicles() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Vehicle[];
}

// Get the default vehicle for the current user
export async function getDefaultVehicle() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('default_vehicle_id')
    .eq('id', user.id)
    .single();

  // If profile doesn't exist yet, return empty string
  if (error && error.code === 'PGRST116') {
    return '';
  }
  
  if (error) throw error;
  return data?.default_vehicle_id || '';
}

// Set the default vehicle for the current user
export async function setDefaultVehicle(vehicleId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!existingProfile) {
    // Profile doesn't exist, create it
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id, default_vehicle_id: vehicleId });
    
    if (insertError) throw insertError;
  } else {
    // Profile exists, update it
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ default_vehicle_id: vehicleId })
      .eq('id', user.id);

    if (updateError) throw updateError;
  }

  return true;
}
