# Vehicle Management - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] **Run Migration Script**
  - Go to Supabase Dashboard → SQL Editor
  - Copy entire contents of `docs/VEHICLE_MANAGEMENT_MIGRATION.sql`
  - Execute the script
  - Verify no errors in output

- [ ] **Verify Tables Created**
  ```sql
  -- Check vehicles table has new columns
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'vehicles' 
  AND column_name IN ('make', 'model', 'year', 'photo_url', 'insurance_expiry', 'registration_expiry', 'puc_expiry');
  -- Should return 7 rows

  -- Check service_history table exists
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_name = 'service_history';
  -- Should return 1
  ```

### 2. Storage Configuration
- [ ] **Create Storage Bucket**
  - Go to Supabase Dashboard → Storage
  - Click "Create bucket"
  - Name: `vehicle-photos`
  - Public: NO (keep private)
  - Click "Create bucket"

- [ ] **Add Storage Policies**
  - In Storage section, click on `vehicle-photos` bucket
  - Go to "Policies" tab
  - Copy and run each policy from `docs/SETUP_VEHICLE_MANAGEMENT.sql` (lines 15-55)
  - Verify 4 policies created (INSERT, SELECT, UPDATE, DELETE)

### 3. Environment Setup
- [ ] **Verify Environment Variables**
  ```bash
  # Check .env.local has:
  NEXT_PUBLIC_SUPABASE_URL=your_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  ```

### 4. Code Installation
- [ ] **Install Dependencies** (if any new packages)
  ```bash
  npm install
  # or
  pnpm install
  ```

- [ ] **Build Project**
  ```bash
  npm run build
  # Check for TypeScript errors
  ```

### 5. Testing
- [ ] **Test Vehicle Details**
  - Add new vehicle with make/model/year
  - Edit existing vehicle
  - Upload vehicle photo
  - Update document expiry dates

- [ ] **Test Service History**
  - Navigate to vehicle management page
  - Add service record
  - Edit service record
  - Delete service record
  - Verify list displays correctly

- [ ] **Test Alerts**
  - Add expiry date within 30 days
  - Verify alert appears
  - Test dismiss functionality
  - Test "View" navigation

- [ ] **Test Security**
  - Create second test user
  - Verify users can't see each other's data
  - Test photo upload permissions

## 🚀 Deployment Steps

### Option A: Vercel Deployment
```bash
# 1. Commit changes
git add .
git commit -m "Add vehicle management features"

# 2. Push to repository
git push origin main

# 3. Vercel auto-deploys (if connected)
# Or manually deploy:
vercel --prod
```

### Option B: Self-Hosted Deployment
```bash
# 1. Build production bundle
npm run build

# 2. Start production server
npm start

# 3. Or use PM2 for process management
pm2 start npm --name "fuel-tracker" -- start
```

## 📋 Post-Deployment Verification

### 1. Functionality Tests
- [ ] Navigate to `/` (dashboard)
- [ ] Add new vehicle with details
- [ ] Click "Manage Vehicle" from dropdown
- [ ] Upload vehicle photo
- [ ] Add document expiry dates
- [ ] Add service record
- [ ] Verify alerts appear

### 2. Performance Tests
- [ ] Check page load time < 3s
- [ ] Photo upload works smoothly
- [ ] Service history loads quickly
- [ ] No console errors

### 3. Mobile Testing
- [ ] Test on mobile device/emulator
- [ ] Verify responsive layouts
- [ ] Test photo upload on mobile
- [ ] Check touch interactions

### 4. Security Verification
- [ ] Test RLS policies with different users
- [ ] Verify photos are user-isolated
- [ ] Check unauthorized access attempts fail
- [ ] Verify API rate limits (if any)

## 🐛 Troubleshooting

### Issue: Migration Script Fails
**Solution:**
1. Check Supabase connection
2. Verify you have admin permissions
3. Run script in smaller chunks
4. Check for conflicting table names

### Issue: Photo Upload Fails
**Solution:**
1. Verify storage bucket exists: `vehicle-photos`
2. Check storage policies are applied
3. Verify file size < 5MB
4. Check browser console for errors
5. Ensure proper RLS policies on storage.objects

### Issue: Service History Not Loading
**Solution:**
1. Check `service_history` table exists
2. Verify RLS policies are enabled
3. Check browser console for API errors
4. Verify user authentication

### Issue: TypeScript Errors
**Solution:**
1. Run `npm run build` to see exact errors
2. Verify all imports are correct
3. Check type definitions in `lib/types.ts`
4. Ensure ServiceHistory type is exported

### Issue: Alerts Not Showing
**Solution:**
1. Add test data with expiry dates within 30 days
2. Check component is imported in dashboard
3. Verify API functions return data
4. Check browser console for errors

## 📞 Support

### Debug Information to Collect
When reporting issues, include:
- Browser console errors
- Network tab (failed requests)
- Supabase logs
- Database query results
- Environment (dev/prod)

### Quick Diagnostic Queries
```sql
-- Check data exists
SELECT COUNT(*) FROM vehicles;
SELECT COUNT(*) FROM service_history;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('vehicles', 'service_history');

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'vehicle-photos';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'vehicle-photos';
```

## ✅ Deployment Complete!

Once all items are checked:
- [ ] All database migrations successful
- [ ] Storage bucket configured
- [ ] All tests passing
- [ ] Application deployed
- [ ] Post-deployment verification complete

## 📚 Documentation References
- Setup Guide: `docs/VEHICLE_MANAGEMENT.md`
- API Reference: `docs/VEHICLE_MANAGEMENT_SUMMARY.md`
- SQL Scripts: `docs/VEHICLE_MANAGEMENT_MIGRATION.sql`
- Quick Setup: `docs/SETUP_VEHICLE_MANAGEMENT.sql`

---

**Note:** Keep this checklist for future deployments or when setting up new environments (staging, testing, etc.)
