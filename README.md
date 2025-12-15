# 🚗 FuelSense v2.0.0

> Smart Fuel Tracking & Analytics Platform

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/abu-zaid/fuel-sense)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-blue)](https://reactjs.org/)

## 🌟 Overview

FuelSense is a modern, production-ready Progressive Web App (PWA) for tracking and analyzing vehicle fuel consumption. Built with Next.js 16, React 19, and TypeScript, offering seamless cross-device experience with offline support and real-time analytics.

## ✨ Features

### Core Capabilities
- 🚙 **Multi-Vehicle Support** - Track cars and bikes
- ⛽ **Smart Fuel Logging** - Quick entry with auto-calculations  
- 📊 **Advanced Analytics** - Comprehensive charts and insights
- 💰 **Cost Tracking** - Monitor spending patterns
- 📈 **Trend Analysis** - Historical data visualization
- 🎯 **Efficiency Metrics** - Optimize fuel consumption

### Technical Highlights
- 📱 **Progressive Web App** - Install on any device
- 🌙 **Dark Mode** - System-aware theming
- 🔒 **Secure Auth** - Supabase authentication
- ⚡ **Blazing Fast** - Optimized performance
- 🎨 **Smooth Animations** - Framer Motion
- 📤 **Data Export** - CSV functionality
- 🔍 **Global Search** - Quick data access

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/abu-zaid/fuel-sense.git
cd fuel-sense

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 Prerequisites

- Node.js 20+ 
- npm/yarn/pnpm
- Supabase account (free tier)

## 🗄️ Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your dashboard
3. Run the setup script: `docs/database/SUPABASE_SCHEMA.sql`

This creates all tables, RLS policies, indexes, and triggers.

## 🔧 Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🛠️ Development

```bash
npm run dev          # Development server
npm run build        # Production build  
npm run start        # Production server
npm run lint         # Run linter
npm run analyze      # Bundle analysis
```

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abu-zaid/fuel-sense)

1. Click deploy button
2. Add environment variables
3. Deploy!

### Manual

```bash
npm run build
npm run start
```

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup
- [API Docs](docs/API.md) - API reference
- [Database Schema](docs/database/SUPABASE_SCHEMA.sql) - Database structure
- [Deployment](docs/DEPLOYMENT_CHECKLIST.md) - Production checklist
- [Performance](docs/PERFORMANCE_OPTIMIZATIONS.md) - Optimization guide

## 🛠️ Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Framer Motion  
**Backend:** Supabase (PostgreSQL, Auth, Real-time)  
**UI:** Radix UI, Recharts, Lucide Icons  
**PWA:** Service Workers, Offline Support

## 📊 Performance

- ⚡ Lighthouse: 95+ Performance
- 🎨 FCP: < 1.5s
- 📦 Bundle: ~390 KB gzipped
- 🚀 TTI: < 3s

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push and open PR

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 👨‍💻 Author

**Abu Zaid**  
GitHub: [@abu-zaid](https://github.com/abu-zaid)

## 🙏 Acknowledgments

Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

- 🐛 [Issues](https://github.com/abu-zaid/fuel-sense/issues)
- 💬 [Discussions](https://github.com/abu-zaid/fuel-sense/discussions)

---

<p align="center">Made with ❤️ • ⭐ Star if helpful!</p>
