# Vehicle Management Feature

## Overview
Comprehensive vehicle management system with detailed vehicle information, document tracking, and complete service history.

## Features Implemented

### ✅ 1. Vehicle Details
- **Make, Model, Year**: Store complete vehicle identification
- **Inline Editing**: Edit vehicle details directly from the management page

### ✅ 2. Document Expiry Tracking
Track and monitor important document expiration dates:
- **Insurance Expiry**: Track insurance policy expiration
- **Registration Expiry**: Monitor vehicle registration renewal
- **PUC Certificate**: Track Pollution Under Control certificate validity

**Features**:
- Visual indicators (Expired/Expiring Soon badges)
- Color-coded dates (red for expired, orange for expiring within 30 days)
- Easy date updates through edit mode

### ✅ 3. Service History Management
Complete service and maintenance tracking system:

**Service Record Fields**:
- Service Date (required)
- Service Type (required) - e.g., Oil Change, General Service, Tire Rotation
- Description - Brief description of work done
- Cost - Service cost in ₹
- Mileage - Odometer reading at time of service
- Service Provider - Workshop or service center name
- Next Service Due - Date for next scheduled service
- Next Service Mileage - Odometer reading for next service
- Notes - Additional observations or recommendations

**Service History Features**:
- View all service records chronologically
- Edit existing service records
- Delete service records
- Upcoming service alerts (services due within 30 days)
- Cost tracking for maintenance expenses
- Mileage-based service tracking

## Database Schema

### Updated `vehicles` Table
```sql
ALTER TABLE vehicles
ADD COLUMN make TEXT,
ADD COLUMN model TEXT,
ADD COLUMN year INTEGER,
ADD COLUMN insurance_expiry DATE,
ADD COLUMN registration_expiry DATE,
ADD COLUMN puc_expiry DATE,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
```

### New `service_history` Table
```sql
CREATE TABLE service_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  cost NUMERIC,
  mileage NUMERIC,
  next_service_due DATE,
  next_service_mileage NUMERIC,
  service_provider TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Run Database Migration
Execute the migration script in your Supabase SQL editor:
```bash
# File location: docs/VEHICLE_MANAGEMENT_MIGRATION.sql
```

### 2. Environment Variables
Ensure your `.env.local` includes:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### Access Vehicle Management
1. From dashboard, click on vehicle dropdown
2. Select "Manage Vehicle" option
3. Or navigate to `/vehicle/[vehicle-id]`

### Add Vehicle with Details
When adding a new vehicle, you can now provide:
- Vehicle name (required)
- Vehicle type: Car or Bike (required)
- Make (e.g., Honda, Toyota)
- Model (e.g., Civic, Corolla)
- Year (e.g., 2020)

### Update Vehicle Details
1. Navigate to vehicle management page
2. Click "Edit" button
3. Update any fields including:
   - Basic details (make, model, year)
   - Document expiry dates
4. Click "Save Changes"

### Manage Service History
1. Navigate to vehicle management page
2. Scroll to "Service History" section
3. Click "Add Service" to create a new record
4. Fill in service details:
   - Service date and type are required
   - All other fields are optional
5. Click "Add Service" to save
6. Edit or delete existing records using the icons

### View Expiry Alerts
Documents expiring within 30 days are highlighted:
- **Red badge + red text**: Already expired
- **Orange badge + orange text**: Expiring within 30 days
- **Gray text**: Not set or valid for 30+ days

## API Functions

### Vehicle Details
```typescript
// Update vehicle details
updateVehicleDetails(id, { make, model, year, insurance_expiry, ... })

// Get expiry alerts
getVehicleExpiryAlerts(vehicleId?)
```

### Service History
```typescript
// Get service history
getServiceHistory(vehicleId?)

// Add service record
addServiceHistory({ vehicle_id, service_date, service_type, ... })

// Update service record
updateServiceHistory(id, { service_date, cost, ... })

// Delete service record
deleteServiceHistory(id)

// Get upcoming services (due within 30 days)
getUpcomingServices(vehicleId?)
```

## Components

### New Components
- `components/vehicles/vehicle-details.tsx` - Vehicle information management
- `components/vehicles/service-history-list.tsx` - Service history CRUD operations
- `components/vehicles/vehicle-management.tsx` - Main vehicle management container
- `app/vehicle/[id]/page.tsx` - Vehicle management page route

### Updated Components
- `components/vehicles/add-vehicle-dialog.tsx` - Enhanced with make, model, year fields
- `components/vehicles/vehicle-selector.tsx` - Added "Manage Vehicle" option

## Security

### Row Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only view/edit their own vehicles
- Users can only view/edit service history for their vehicles

## Future Enhancements
- [ ] Push notifications for expiring documents
- [ ] Service cost analytics and trends
- [ ] Service reminders based on mileage
- [ ] Export service history to PDF
- [ ] Multiple photos per vehicle
- [ ] Service receipt attachments
- [ ] Integration with calendar for service appointments
- [ ] Maintenance cost forecasting

## Troubleshooting

### Service History Not Loading
- Verify `service_history` table exists
- Check RLS policies are enabled
- Ensure user is authenticated

### Expiry Dates Not Saving
- Verify date format is correct (YYYY-MM-DD)
- Check column types in database are DATE
- Ensure year constraint allows valid range (1900-2100)

## Files Created/Modified

### New Files
- `docs/VEHICLE_MANAGEMENT_MIGRATION.sql`
- `components/vehicles/vehicle-details.tsx`
- `components/vehicles/service-history-list.tsx`
- `components/vehicles/vehicle-management.tsx`
- `app/vehicle/[id]/page.tsx`
- `docs/VEHICLE_MANAGEMENT.md`

### Modified Files
- `lib/types.ts` - Added ServiceHistory interface, updated Vehicle interface
- `lib/services.ts` - Added vehicle details and service history functions
- `components/vehicles/add-vehicle-dialog.tsx` - Added make, model, year fields
- `components/vehicles/vehicle-selector.tsx` - Added "Manage Vehicle" option
