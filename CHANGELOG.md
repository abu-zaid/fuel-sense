# Changelog

All notable changes to FuelSense will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-15

### Added
- 🚀 **Production-Ready Release** - Complete refactor for production deployment
- 📊 **Enhanced Analytics** - Comprehensive charts and insights
- 📁 **Documentation Organization** - All docs moved to docs/ folder
- 🗄️ **Database Consolidation** - All SQL queries organized in docs/database/
- ✨ **New Vehicle Dialog** - Direct add vehicle from dashboard for new users
- 🎨 **Fuel Pump Icon** - Updated app icon to match landing page design
- 📚 **Comprehensive README** - Production-ready documentation
- 🔧 **Better Error Handling** - Improved error boundaries and logging

### Changed
- 📦 **Version Bump** - Updated to v2.0.0 in package.json and manifest.json
- 🎯 **UX Improvements** - Enhanced user onboarding flow
- ⚡ **Performance** - Optimized bundle size and load times
- 🎨 **Auth UI** - Improved login and register pages

### Fixed
- 🐛 **New User Flow** - Fixed issue where new users couldn't add vehicles
- 🔄 **Pull-to-Refresh** - Removed non-working mobile features
- 🎨 **Theme Customization** - Removed non-functional customization options
- 🔗 **Share/Download** - Removed buggy share and download features

### Removed
- ❌ **Swipe Actions** - Removed non-working swipe-to-edit/delete
- ❌ **Theme Customization** - Removed density and reduce motion settings
- ❌ **Share Buttons** - Removed share/download from stat cards
- ❌ **Root Clutter** - Moved all docs to docs/ folder

### Performance
- ⚡ **Pagination** - Added pagination to database queries
- 🎯 **Memoization** - Memoized list item components
- 📦 **Code Splitting** - Aggressive dynamic imports
- 📊 **Bundle Analysis** - Added bundle analyzer script

## [0.1.0] - 2024

### Initial Release
- Initial FuelSense application
- Basic fuel tracking functionality
- Vehicle management
- Simple analytics
- PWA support
- Dark mode
- Supabase integration

---

For more details, visit the [GitHub repository](https://github.com/abu-zaid/fuel-sense).
