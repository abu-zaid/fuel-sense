# Fuel Tracker - Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fuel-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and anon key from Project Settings > API

4. **Create database schema**
   - Go to Supabase Dashboard > SQL Editor
   - Create a new query and paste the contents of `docs/SUPABASE_SCHEMA.sql`
   - Execute the query

5. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. **Enable authentication in Supabase**
   - Go to Authentication > Providers
   - Enable Email/Password authentication
   - Configure auth settings as needed

7. **Run development server**
   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## Project Structure

```
fuel-tracker/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main page with auth check
│   ├── providers.tsx        # Auth context provider
│   ├── register-sw.ts       # Service worker registration
│   └── globals.css          # Global styles
├── components/
│   ├── auth/
│   │   └── auth-page.tsx    # Sign up/in UI
│   ├── dashboard/
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── dashboard-ui.tsx # Dashboard content
│   │   └── stat-cards.tsx   # Statistics cards
│   ├── entries/
│   │   ├── fuel-entry-form.tsx # Form to add entries
│   │   └── fuel-history.tsx    # History and export
│   ├── vehicles/
│   │   ├── vehicle-selector.tsx  # Vehicle switcher
│   │   └── add-vehicle-dialog.tsx # Add vehicle form
│   ├── charts/
│   │   ├── efficiency-chart.tsx # Efficiency trend
│   │   └── cost-chart.tsx       # Monthly costs
│   ├── layout/
│   │   └── header.tsx        # Header with user menu
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── services.ts          # Database operations
│   ├── csv.ts               # CSV export utilities
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Helper functions
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service worker
│   └── icons/               # App icons
└── docs/
    ├── SETUP.md             # This file
    ├── SUPABASE_SCHEMA.sql  # Database schema
    └── API.md               # API documentation
```

## Database Schema

The application uses three main tables:

### vehicles
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `name` (text)
- `type` (car | bike)
- `created_at` (timestamp)

### fuel_entries
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `vehicle_id` (UUID, FK)
- `odo` (numeric)
- `petrol_price` (numeric)
- `amount` (numeric)
- `distance` (numeric)
- `fuel_used` (computed: amount / petrol_price)
- `efficiency` (computed: distance / fuel_used)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### reminders
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `vehicle_id` (UUID, FK)
- `type` (distance | time)
- `value` (numeric)
- `last_triggered_at` (timestamp)
- `is_active` (boolean)
- `created_at` (timestamp)

## Features

### ✅ Authentication
- Email/password signup and login
- Persistent sessions
- Protected routes
- User isolation (RLS)

### ✅ Vehicle Management
- Add/edit/delete vehicles
- Support for cars and bikes
- Vehicle switcher dropdown

### ✅ Fuel Tracking
- Add fuel entries with auto-calculated fields
- View fuel history
- Edit/delete entries
- CSV export per vehicle

### ✅ Analytics
- Dashboard with key statistics
- Efficiency trend chart (line)
- Monthly cost chart (bar)
- Mobile-responsive design

### ✅ PWA Support
- Installable web app
- Offline read support
- Service worker caching
- App manifest

### ✅ Design
- Mobile-first responsive layout
- Apple Health-inspired UI
- Soft cards with rounded corners
- Smooth animations
- Clean, minimal color palette

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Format code
npm run format
```

## Customization

### Theme Colors
Edit `app/globals.css` to customize Tailwind colors:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Icons
- UI icons: Lucide React (https://lucide.dev)
- Update icon imports in components as needed

### Charts
- Efficiency and cost charts use Recharts
- Customize in `components/charts/`

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `.next` directory to your hosting platform

### Environment Variables
Remember to set environment variables on your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Auth not working
- Check Supabase project URL and anon key
- Verify Email/Password authentication is enabled in Supabase

### No data showing
- Ensure database schema is correctly created
- Check RLS policies are enabled
- Verify user is logged in

### Styling issues
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm install`

## Security

- All database queries use RLS for user isolation
- Sensitive operations are protected
- Auth tokens managed by Supabase
- Never commit `.env.local` to git

## Performance

- Optimized images and fonts
- Caching strategy in service worker
- Lazy loading components
- Efficient database queries

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check Next.js documentation
4. Create an issue in the repository

---

Happy tracking! 🚗⛽
