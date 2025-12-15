# FuelSense ⛽

A beautiful, production-ready fuel tracking web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**.

Track your vehicle fuel consumption, costs, and efficiency with a modern, Apple Health-inspired interface.

## 🌟 Features

### 🔐 Authentication
- Email & password authentication
- Persistent sessions with Supabase Auth
- Protected routes and user isolation
- Row-Level Security (RLS) for data privacy

### 🚗 Vehicle Management
- Add, edit, and delete multiple vehicles
- Support for cars and bikes
- Quick vehicle switcher
- Per-vehicle tracking

### ⛽ Fuel Tracking
- Add fuel entries with automatic calculations
- Track odometer readings, fuel amount, price
- Auto-calculated metrics:
  - **Fuel Used** = Amount / Price per liter
  - **Efficiency** = Distance / Fuel Used
- Edit and delete entries
- CSV export functionality

### 📊 Analytics & Insights
- Dashboard with key statistics:
  - Total fuel cost
  - Total distance traveled
  - Average fuel efficiency
  - Total fuel consumed
- Efficiency trend chart (line graph)
- Monthly fuel cost analysis (bar chart)
- Real-time data refresh

### 📱 Mobile-First Design
- Responsive layout for all devices
- Apple Health-inspired UI
- Soft, rounded cards
- Clean typography and spacing
- Smooth animations
- Bottom navigation (mobile)
- Sidebar navigation (desktop)

### 📦 PWA Support
- Installable as a standalone app
- Offline read support
- Service worker caching
- App manifest and icons
- Update detection

### 🔒 Security
- Row-Level Security (RLS) policies
- User data isolation
- Secure Supabase authentication
- No sensitive data in frontend

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion (optional)
- **PWA**: Service Worker, Web Manifest

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier available)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd fuel-tracker
npm install
```

### 2. Set Up Supabase

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your **Project URL** and **Anon Key**

### 3. Create Database Schema

1. Go to Supabase Dashboard > SQL Editor
2. Create a new query
3. Copy and paste the SQL from `docs/SUPABASE_SCHEMA.sql`
4. Execute the query

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Enable Email Authentication

In Supabase Dashboard:
- Go to Authentication > Providers
- Enable Email/Password authentication
- Configure sign-up settings as needed

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
fuel-tracker/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── providers.tsx           # Auth context
│   ├── register-sw.ts          # Service worker setup
│   └── globals.css             # Global styles
├── components/
│   ├── auth/                   # Authentication
│   ├── dashboard/              # Main dashboard
│   ├── entries/                # Fuel entry management
│   ├── vehicles/               # Vehicle management
│   ├── charts/                 # Analytics charts
│   ├── layout/                 # Layout components
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── services.ts            # Database operations
│   ├── csv.ts                 # CSV export
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Utilities
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # App icons
└── docs/
    ├── SETUP.md               # Setup guide
    ├── SUPABASE_SCHEMA.sql    # Database schema
    └── API.md                 # API documentation
```

## 🗄️ Database Schema

### vehicles
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- name: text
- type: car | bike
- created_at: timestamp
```

### fuel_entries
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- vehicle_id: UUID (FK)
- odo: numeric
- petrol_price: numeric
- amount: numeric
- distance: numeric
- fuel_used: numeric (calculated)
- efficiency: numeric (calculated)
- created_at: timestamp
- updated_at: timestamp
```

### reminders
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- vehicle_id: UUID (FK)
- type: distance | time
- value: numeric
- last_triggered_at: timestamp
- is_active: boolean
- created_at: timestamp
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Background**: Stone (#f8f6f1)
- **Text**: Stone (#1c1917)

### Components
All UI components from **shadcn/ui**:
- Card
- Button
- Input
- DropdownMenu
- Sheet
- Tabs
- Dialog
- Table

### Icons
**Lucide React** icons throughout the application

## 📱 Key Screens

### Login/Register
- Email and password authentication
- Toggle between sign up and sign in
- Error handling

### Dashboard
- Vehicle selector dropdown
- Statistics cards
- Fuel entry form
- Analytics charts
- Fuel history

### Fuel History
- Card-based list (mobile)
- Table view (desktop)
- Edit and delete actions
- CSV export

### Vehicle Management
- Add new vehicle dialog
- Edit vehicle information
- Delete vehicles
- Vehicle type selection (car/bike)

## 🔄 Data Flow

```
User Login
    ↓
Load Vehicles
    ↓
Select Vehicle
    ↓
Load Fuel Entries
    ↓
Calculate Statistics & Charts
    ↓
Display Dashboard
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

1. Build: `npm run build`
2. Deploy the `.next` directory
3. Set environment variables on platform

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🛡️ Security

- ✅ Row-Level Security (RLS) enabled
- ✅ User data isolation at database level
- ✅ Secure Supabase authentication
- ✅ No sensitive data in frontend
- ✅ HTTPS recommended for deployment

## 📊 Features in Detail

### Calculations
All calculations match spreadsheet logic:
```
fuel_used = amount / petrol_price
efficiency = distance / fuel_used
```

Values rounded to 2 decimal places.

### CSV Export
Export fuel entries as CSV with:
- Vehicle name and type
- Date, odometer, amount, price
- Distance, fuel used, efficiency
- Export timestamp

### Charts
- **Efficiency Trend**: Line chart showing fuel efficiency over time
- **Monthly Cost**: Bar chart showing fuel expenses by month

### Vehicle Switching
Quick switcher allows instant view of different vehicle stats.

## 🧪 Testing

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code quality
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🆘 Troubleshooting

### Auth not working?
- Verify Supabase URL and anon key
- Check Email/Password provider is enabled
- Clear browser cache and cookies

### No data showing?
- Ensure database schema is created
- Check RLS policies are enabled
- Verify you're logged in

### Styling issues?
- Clear `.next`: `rm -rf .next`
- Reinstall deps: `npm install`

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org)

## 🎯 Roadmap

- [ ] Distance-based refuel reminders
- [ ] Time-based reminders
- [ ] Browser notifications
- [ ] Dark mode support
- [ ] Multiple user support per account
- [ ] Fuel entry photos
- [ ] Advanced filtering
- [ ] Budget tracking

## 📞 Support

For issues or questions:
1. Check the [SETUP.md](docs/SETUP.md) guide
2. Review [Supabase docs](https://supabase.com/docs)
3. Check [Next.js docs](https://nextjs.org/docs)
4. Create an issue in the repository

---

**Built with ❤️ for fuel tracking enthusiasts**

⛽ Track • Analyze • Optimize 📈
