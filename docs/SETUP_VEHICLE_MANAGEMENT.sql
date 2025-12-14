-- ============================================================================
-- QUICK SETUP GUIDE FOR VEHICLE MANAGEMENT
-- Follow these steps in order
-- ============================================================================

-- ============================================================================
-- STEP 1: Run the main migration script
-- ============================================================================
-- Copy and execute the entire VEHICLE_MANAGEMENT_MIGRATION.sql file
-- Location: docs/VEHICLE_MANAGEMENT_MIGRATION.sql

-- ============================================================================
-- STEP 2: VERIFICATION QUERIES
-- ============================================================================

-- Verify vehicles table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
AND column_name IN ('make', 'model', 'year', 'insurance_expiry', 'registration_expiry', 'puc_expiry');

-- Verify service_history table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_history';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('vehicles', 'service_history');

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Add sample vehicle with details
-- Note: Replace {user_id} with your actual user ID from auth.users
INSERT INTO vehicles (user_id, name, type, make, model, year, insurance_expiry, registration_expiry, puc_expiry)
VALUES 
  ('{user_id}', 'My Honda City', 'car', 'Honda', 'City', 2020, '2025-06-15', '2025-08-30', '2025-03-20');

-- Add sample service history
-- Note: Replace {user_id} and {vehicle_id} with actual IDs
INSERT INTO service_history (user_id, vehicle_id, service_date, service_type, description, cost, mileage, next_service_due, service_provider)
VALUES 
  ('{user_id}', '{vehicle_id}', '2024-12-01', 'Oil Change', 'Regular oil change and filter replacement', 2500, 15000, '2025-06-01', 'ABC Motors');

-- ============================================================================
-- CLEANUP (if you need to remove everything)
-- ============================================================================

-- DROP TABLE IF EXISTS service_history CASCADE;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS make;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS model;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS year;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS insurance_expiry;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS registration_expiry;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS puc_expiry;
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS updated_at;
