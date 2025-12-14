# Vehicle Management - Component Integration Guide

## How to Use the New Components

### 1. Add Vehicle Alerts to Dashboard

The `VehicleAlerts` component displays important notifications for expiring documents and upcoming services.

**Location:** `components/vehicles/vehicle-alerts.tsx`

**Integration:**
```tsx
// In your dashboard component (e.g., components/dashboard/dashboard.tsx)
import VehicleAlerts from '@/components/vehicles/vehicle-alerts';

export default function Dashboard() {
  return (
    <div>
      {/* Add at the top of your dashboard */}
      <VehicleAlerts />
      
      {/* Rest of your dashboard content */}
      <StatCards />
      <Charts />
      {/* ... */}
    </div>
  );
}
```

**Features:**
- Automatically loads and displays alerts
- Shows expired/expiring documents
- Shows upcoming/overdue services
- Dismissible alerts
- Direct navigation to vehicle management

### 2. Vehicle Management Page

**Route:** `/vehicle/[id]`
**Already configured!** Accessible via:
- Vehicle dropdown → "Manage Vehicle"
- Direct navigation: `router.push(\`/vehicle/\${vehicleId}\`)`

### 3. Enhanced Add Vehicle Dialog

**Location:** `components/vehicles/add-vehicle-dialog.tsx`
**Already integrated!** Now includes:
- Vehicle name (required)
- Vehicle type: Car/Bike (required)
- Make (optional)
- Model (optional)
- Year (optional)

No changes needed - existing implementation already uses this component.

### 4. Vehicle Selector Updates

**Location:** `components/vehicles/vehicle-selector.tsx`
**Already enhanced!** Now includes:
- "Manage Vehicle" option in dropdown
- Direct link to vehicle management page

No changes needed - existing implementation already uses this component.

## Component Hierarchy

```
Dashboard
├── VehicleAlerts (NEW - Add this!)
│   ├── Shows expiry alerts
│   ├── Shows service due alerts
│   └── Links to vehicle management
│
├── VehicleSelector (ENHANCED)
│   ├── Vehicle dropdown
│   ├── Add vehicle button
│   └── Manage vehicle link (NEW)
│
└── Other dashboard components

Vehicle Management Page (/vehicle/[id])
├── VehicleDetails
│   ├── Basic info display/edit
│   ├── Photo upload
│   └── Document expiry tracking
│
└── ServiceHistoryList
    ├── List of service records
    ├── Add service dialog
    ├── Edit service dialog
    └── Delete confirmation
```

## Quick Integration Steps

### Step 1: Add Alerts to Dashboard
```tsx
// File: components/dashboard/dashboard.tsx (or wherever your main dashboard is)

import VehicleAlerts from '@/components/vehicles/vehicle-alerts';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Add this at the top */}
      <VehicleAlerts />
      
      {/* Your existing dashboard content */}
      {/* ... */}
    </div>
  );
}
```

### Step 2: Test Navigation
1. Go to dashboard
2. Click vehicle dropdown
3. Click "Manage Vehicle"
4. Should navigate to `/vehicle/[id]`

### Step 3: Verify Alerts
1. Add a vehicle with expiry date within 30 days
2. Alerts should appear on dashboard
3. Click "View" to navigate to vehicle management
4. Click "X" to dismiss alert

## Component Props Reference

### VehicleAlerts
```tsx
// No props needed - completely self-contained
<VehicleAlerts />
```

### VehicleDetails
```tsx
interface VehicleDetailsProps {
  vehicle: Vehicle;        // Vehicle object from database
  onUpdate: () => void;    // Callback when vehicle is updated
}

<VehicleDetails 
  vehicle={selectedVehicle} 
  onUpdate={loadVehicle} 
/>
```

### ServiceHistoryList
```tsx
interface ServiceHistoryListProps {
  vehicleId: string;  // ID of the vehicle
}

<ServiceHistoryList vehicleId={vehicle.id} />
```

### VehicleManagement
```tsx
interface VehicleManagementProps {
  vehicleId: string;  // ID from route params
}

<VehicleManagement vehicleId={params.id} />
```

## Styling Notes

All components use:
- Tailwind CSS for styling
- Stone color palette (stone-50 to stone-900)
- Consistent border radius (rounded-lg, rounded-xl)
- Smooth transitions and animations
- Responsive design (mobile-first)

## State Management

Components handle their own state:
- **VehicleAlerts**: Auto-loads and manages alert dismissals
- **VehicleDetails**: Manages edit mode and form state
- **ServiceHistoryList**: Manages service CRUD operations
- **VehicleManagement**: Loads and manages vehicle data

No global state management needed!

## Error Handling

All components include:
- Try-catch blocks for API calls
- Console error logging
- User-friendly error messages
- Loading states
- Haptic feedback (success/error)

## Example: Complete Dashboard Integration

```tsx
'use client';

import { useState, useEffect } from 'react';
import VehicleSelector from '@/components/vehicles/vehicle-selector';
import VehicleAlerts from '@/components/vehicles/vehicle-alerts'; // NEW
import StatCards from '@/components/dashboard/stat-cards';
import { getVehicles } from '@/lib/services';
import type { Vehicle } from '@/lib/types';

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const data = await getVehicles();
    setVehicles(data);
    if (data.length > 0) setSelected(data[0]);
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Vehicle Selector */}
        <VehicleSelector
          vehicles={vehicles}
          selected={selected}
          onSelect={setSelected}
          onVehiclesChange={loadVehicles}
        />

        {/* NEW: Vehicle Alerts */}
        <VehicleAlerts />

        {/* Rest of Dashboard */}
        <StatCards vehicleId={selected?.id} />
        {/* ... other components */}
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

All components are mobile-optimized:
- **VehicleAlerts**: Stacks vertically on mobile
- **VehicleDetails**: Single column layout on mobile
- **ServiceHistoryList**: Compact cards on mobile
- **Photo Upload**: Touch-friendly on mobile

## Accessibility

Components include:
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus indicators
- Screen reader support

## Performance

Optimizations included:
- Lazy loading of images
- Efficient re-renders
- Optimistic UI updates
- Debounced search (if applicable)
- Minimal dependencies

## Next Steps

After integration:
1. Test all user flows
2. Add sample data for testing
3. Verify alerts appear correctly
4. Test photo upload
5. Test service history CRUD
6. Test on mobile devices
7. Run accessibility audit

## Common Customizations

### Change Alert Colors
```tsx
// In vehicle-alerts.tsx, modify the severity classes:
const getAlertClass = (severity) => {
  if (severity === 'critical') return 'bg-red-100 border-red-300';
  return 'bg-orange-100 border-orange-300';
}
```

### Modify Alert Threshold
```tsx
// In lib/services.ts, change the 30-day threshold:
const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
// Change 30 to your preferred number of days
```

### Customize Photo Size Limit
```tsx
// In vehicle-details.tsx:
if (file.size > 5 * 1024 * 1024) {  // Change 5 to your limit in MB
  alert('Image must be less than 5MB');
  return;
}
```

---

**That's it!** You now have a complete vehicle management system integrated into your fuel tracker app. 🚗✨
