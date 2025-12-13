# Fuel Tracker API Documentation

## Overview

This document describes all the data models, database operations, and calculations used in the Fuel Tracker application.

## Data Models

### User

Users are managed by Supabase Auth. Each user has:
- `id`: UUID (primary key)
- `email`: string
- `created_at`: timestamp
- `last_sign_in_at`: timestamp

### Vehicle

Represents a vehicle owned by a user.

```typescript
interface Vehicle {
  id: string;           // UUID
  user_id: string;      // FK to auth.users
  name: string;         // e.g., "My Car", "Bike 1"
  type: 'car' | 'bike'; // Vehicle type
  created_at: string;   // ISO timestamp
}
```

**Endpoints:**
- `getVehicles()` - Get all vehicles for current user
- `addVehicle(name, type)` - Create new vehicle
- `updateVehicle(id, name, type)` - Update vehicle
- `deleteVehicle(id)` - Delete vehicle

### FuelEntry

Represents a single fuel entry for a vehicle.

```typescript
interface FuelEntry {
  id: string;          // UUID
  user_id: string;     // FK to auth.users
  vehicle_id: string;  // FK to vehicles
  odo: number;         // Odometer reading (km)
  petrol_price: number;// Price per liter (₹)
  amount: number;      // Amount paid (₹)
  distance: number;    // Distance covered (km)
  fuel_used: number;   // Calculated: amount / petrol_price
  efficiency: number;  // Calculated: distance / fuel_used
  created_at: string;  // ISO timestamp
  updated_at: string;  // ISO timestamp
}
```

**Endpoints:**
- `getFuelEntries(vehicleId?, limit)` - Get entries
- `addFuelEntry(vehicleId, odo, petrolPrice, amount, distance)` - Create entry
- `updateFuelEntry(id, odo, petrolPrice, amount, distance)` - Update entry
- `deleteFuelEntry(id)` - Delete entry

### Reminder

Represents a refuel reminder for a vehicle.

```typescript
interface Reminder {
  id: string;               // UUID
  user_id: string;          // FK to auth.users
  vehicle_id: string;       // FK to vehicles
  type: 'distance' | 'time'; // Reminder type
  value: number;            // Distance (km) or days
  last_triggered_at: string; // ISO timestamp
  is_active: boolean;       // Active/inactive
  created_at: string;       // ISO timestamp
}
```

**Endpoints:**
- `getReminders(vehicleId?)` - Get reminders
- `addReminder(vehicleId, type, value)` - Create reminder
- `updateReminder(id, isActive)` - Update active status
- `deleteReminder(id)` - Delete reminder

## Calculations

### Fuel Used
```
fuel_used = amount / petrol_price
```
Represents liters of fuel consumed in the entry.

**Example:**
- Amount: ₹500
- Price: ₹100 per liter
- Fuel Used: 500 / 100 = 5 liters

### Efficiency (Fuel Efficiency)
```
efficiency = distance / fuel_used
```
Represents kilometers traveled per liter of fuel.

**Example:**
- Distance: 250 km
- Fuel Used: 5 liters
- Efficiency: 250 / 5 = 50 km/l

### Rounding
All calculations are rounded to 2 decimal places:
```typescript
Math.round(value * 100) / 100
```

## Statistics

### DashboardStats

```typescript
interface DashboardStats {
  totalFuelCost: number;     // Sum of all amounts
  totalDistance: number;     // Sum of all distances
  averageEfficiency: number; // Total distance / total fuel used
  totalFuelUsed: number;     // Sum of all fuel used
  entriesCount: number;      // Number of entries
}
```

**Calculation:**
```typescript
totalFuelCost = sum(fuel_entries.amount)
totalDistance = sum(fuel_entries.distance)
totalFuelUsed = sum(fuel_entries.fuel_used)
averageEfficiency = totalDistance / totalFuelUsed
entriesCount = count(fuel_entries)
```

**Endpoint:**
- `getDashboardStats(vehicleId?)` - Get statistics

### Monthly Costs

```typescript
interface MonthlyCost {
  month: string;  // "YYYY-MM"
  cost: number;   // Sum of amounts in month
}
```

**Endpoint:**
- `getMonthlyCosts(vehicleId?)` - Get monthly costs

### Efficiency Data

```typescript
interface EfficiencyData {
  date: string;      // Formatted date
  efficiency: number; // Fuel efficiency
}
```

**Endpoint:**
- `getEfficiencyData(vehicleId?)` - Get efficiency trend

## Authentication

### Sign Up
```typescript
const { data, error } = await signUp(email, password)
```

### Sign In
```typescript
const { data, error } = await signIn(email, password)
```

### Sign Out
```typescript
await signOut()
```

### Get Current User
```typescript
const user = await getCurrentUser()
```

### Get Session
```typescript
const session = await getSession()
```

## Database Operations

### Get All Vehicles

```typescript
const vehicles = await getVehicles()
// Returns: Vehicle[]
```

### Create Vehicle

```typescript
const vehicle = await addVehicle('My Car', 'car')
// Returns: Vehicle
// Throws: Error if name already exists for user
```

### Update Vehicle

```typescript
const vehicle = await updateVehicle(vehicleId, 'New Name', 'bike')
// Returns: Vehicle
```

### Delete Vehicle

```typescript
await deleteVehicle(vehicleId)
// Cascades to fuel_entries and reminders
```

### Get Fuel Entries

```typescript
const entries = await getFuelEntries(vehicleId, 100)
// Returns: FuelEntry[] (ordered by created_at DESC)
// vehicleId: Optional, if provided filters by vehicle
// limit: Optional, defaults to 100
```

### Add Fuel Entry

```typescript
const entry = await addFuelEntry(
  vehicleId,
  2500.5,    // odo
  100,       // petrol_price
  500,       // amount
  250        // distance
)
// Returns: FuelEntry with calculated fuel_used and efficiency
```

### Update Fuel Entry

```typescript
const entry = await updateFuelEntry(
  entryId,
  2500.5,    // odo
  100,       // petrol_price
  500,       // amount
  250        // distance
)
// Returns: Updated FuelEntry
```

### Delete Fuel Entry

```typescript
await deleteFuelEntry(entryId)
```

## CSV Export

### Export Single Vehicle

```typescript
exportToCSV(entries, vehicle, 'filename.csv')
```

**CSV Format:**
```
Vehicle: Vehicle Name
Type: car
Export Date: 12/13/2024

Date,Odometer,Fuel Amount,Petrol Price,Distance,Fuel Used,Efficiency (km/l)
12/13/2024,2500.50,500.00,100.00,250.00,5.00,50.00
```

### Export All Vehicles

```typescript
exportAllVehiclesToCSV(entriesByVehicle, 'filename.csv')
```

**CSV Format:**
```
Export Date: 12/13/2024

Vehicle,Date,Odometer,Fuel Amount,Petrol Price,Distance,Fuel Used,Efficiency (km/l)
My Car,12/13/2024,2500.50,500.00,100.00,250.00,5.00,50.00
Bike,12/13/2024,1000.25,200.00,95.00,150.00,2.11,71.09
```

## Error Handling

All service functions throw errors that should be caught:

```typescript
try {
  const vehicle = await addVehicle('Car', 'car')
} catch (error) {
  console.error(error.message)
  // Handle error
}
```

### Common Errors

- `Not authenticated` - User not logged in
- `Failed to create vehicle` - Database error
- `Vehicle not found` - Vehicle ID doesn't exist
- `Unauthorized` - User doesn't own resource

## Row-Level Security (RLS) Policies

All tables have RLS policies:

### vehicles
- Users can SELECT their own vehicles
- Users can INSERT vehicles with their user_id
- Users can UPDATE their own vehicles
- Users can DELETE their own vehicles

### fuel_entries
- Users can SELECT entries for vehicles they own
- Users can INSERT entries for their vehicles
- Users can UPDATE entries for their vehicles
- Users can DELETE entries for their vehicles

### reminders
- Users can SELECT reminders for vehicles they own
- Users can INSERT reminders for their vehicles
- Users can UPDATE reminders for their vehicles
- Users can DELETE reminders for their vehicles

## Rate Limiting

No explicit rate limiting is implemented. Supabase applies default rate limits:
- 200 requests per second per project
- Contact Supabase for higher limits

## Timestamps

All timestamps use ISO 8601 format:
```
2024-12-13T10:30:00.000Z
```

Timestamps are in UTC. Frontend should convert to local timezone as needed.

## Numeric Precision

All numeric fields use PostgreSQL `numeric` type with:
- Precision: 10 digits
- Scale: 2 decimal places

This allows values up to 99,999,999.99

## Best Practices

1. **Always use transactions** for related operations
2. **Cache vehicle list** to avoid repeated queries
3. **Validate inputs** before sending to server
4. **Handle RLS errors** gracefully in UI
5. **Use indexes** for frequently queried fields
6. **Monitor query performance** in Supabase dashboard

## Examples

### Add Complete Fuel Entry Flow

```typescript
// 1. Get vehicles
const vehicles = await getVehicles()
const vehicle = vehicles[0]

// 2. Add fuel entry
const entry = await addFuelEntry(
  vehicle.id,
  2500.5,    // odometer
  100,       // price per liter
  500,       // amount paid
  250        // distance
)

// 3. Get updated stats
const stats = await getDashboardStats(vehicle.id)
console.log(`Efficiency: ${stats.averageEfficiency} km/l`)

// 4. Export data
const allEntries = await getFuelEntries(vehicle.id)
exportToCSV(allEntries, vehicle, 'fuel-data.csv')
```

### Track Multiple Vehicles

```typescript
// Get all vehicles
const vehicles = await getVehicles()

// Get entries for all vehicles
const allEntries = await getFuelEntries()

// Group by vehicle
const entriesByVehicle = new Map()
vehicles.forEach(vehicle => {
  entriesByVehicle.set(
    vehicle.id,
    allEntries.filter(e => e.vehicle_id === vehicle.id)
  )
})

// Export all
exportAllVehiclesToCSV(
  new Map(
    vehicles.map(v => [
      v.id,
      { vehicle: v, entries: entriesByVehicle.get(v.id) }
    ])
  ),
  'all-vehicles.csv'
)
```

---

For more information, see:
- [Database Schema](SUPABASE_SCHEMA.sql)
- [Setup Guide](SETUP.md)
- [Main README](../README.md)
