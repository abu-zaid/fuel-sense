import { supabase } from './supabase';

// Sample data generator - creates weekly fuel fill entries
export async function generateSampleData() {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Create a sample vehicle
    console.log('Creating sample vehicle...');
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        user_id: user.id,
        name: 'Sample Car',
        type: 'car',
      })
      .select()
      .single();

    if (vehicleError) {
      console.error('Error creating vehicle:', vehicleError);
      return;
    }

    const vehicleId = vehicleData.id;
    console.log('Vehicle created:', vehicleData);

    // Generate fuel entries for the past 8 weeks (weekly intervals)
    const entries = [];
    let currentOdo = 45000; // Starting odometer reading
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 1); // Start from yesterday

    for (let i = 0; i < 8; i++) {
      // Go back in time (weeks)
      const entryDate = new Date(baseDate);
      entryDate.setDate(entryDate.getDate() - i * 7);

      const distance = 150 + Math.random() * 100; // 150-250 km per week
      const petrolPrice = 100; // ₹100 per liter
      const fuelUsed = distance / (12 + Math.random() * 4); // 12-16 km/l efficiency
      const amount = fuelUsed * petrolPrice;
      const odo = currentOdo;

      currentOdo += distance; // Update for next iteration

      entries.push({
        user_id: user.id,
        vehicle_id: vehicleId,
        odo: Math.round(odo * 10) / 10,
        petrol_price: petrolPrice,
        amount: Math.round(amount * 100) / 100,
        distance: Math.round(distance * 10) / 10,
        fuel_used: Math.round(fuelUsed * 100) / 100,
        efficiency: Math.round((distance / fuelUsed) * 100) / 100,
        created_at: entryDate.toISOString(),
        updated_at: entryDate.toISOString(),
      });
    }

    // Insert all entries
    console.log('Inserting fuel entries...');
    const { data: entriesData, error: entriesError } = await supabase
      .from('fuel_entries')
      .insert(entries)
      .select();

    if (entriesError) {
      console.error('Error creating entries:', entriesError);
      return;
    }

    console.log('✅ Sample data created successfully!');
    console.log(`- Vehicle: ${vehicleData.name}`);
    console.log(`- Fuel entries: ${entriesData.length}`);
    console.log(`- Date range: ${new Date(baseDate).toLocaleDateString()} to ${new Date(baseDate.getTime() - 7 * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
    console.log(`- Odometer range: ${Math.round(45000)} to ${Math.round(currentOdo)} km`);

    return { vehicle: vehicleData, entries: entriesData };
  } catch (error) {
    console.error('Error:', error);
  }
}

// Clean up function to remove all data for current user
export async function clearSampleData() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    console.log('Clearing sample data...');

    // Delete fuel entries
    const { error: entriesError } = await supabase
      .from('fuel_entries')
      .delete()
      .eq('user_id', user.id);

    if (entriesError) {
      console.error('Error deleting entries:', entriesError);
      return;
    }

    // Delete vehicles
    const { error: vehiclesError } = await supabase
      .from('vehicles')
      .delete()
      .eq('user_id', user.id);

    if (vehiclesError) {
      console.error('Error deleting vehicles:', vehiclesError);
      return;
    }

    console.log('✅ Sample data cleared successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}
