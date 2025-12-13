-- Complete SQL script to insert sample data for zaid.abu@outlook.com
-- This script creates a vehicle and 8 fuel entries in a single transaction

BEGIN;

-- Insert vehicle and capture the ID
WITH new_vehicle AS (
  INSERT INTO vehicles (user_id, name, type, created_at, updated_at)
  VALUES (
    (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
    'Sample Car',
    'car',
    NOW(),
    NOW()
  )
  RETURNING id, user_id
)
-- Insert all fuel entries for the newly created vehicle
INSERT INTO fuel_entries (user_id, vehicle_id, odo, petrol_price, amount, distance, fuel_used, efficiency, created_at, updated_at)
SELECT
  nv.user_id,
  nv.id,
  odo,
  petrol_price,
  amount,
  distance,
  fuel_used,
  efficiency,
  created_at,
  updated_at
FROM new_vehicle nv,
LATERAL (
  VALUES
    -- Entry 1: Yesterday (0 days ago)
    (45246.5, 100, 1524.31, 188.4, 15.24, 12.37, NOW() - INTERVAL '0 days', NOW() - INTERVAL '0 days'),
    -- Entry 2: 7 days ago
    (45058.1, 100, 1397.85, 163.2, 13.98, 11.66, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    -- Entry 3: 14 days ago
    (44894.9, 100, 1521.74, 175.6, 15.22, 11.54, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    -- Entry 4: 21 days ago
    (44719.3, 100, 1349.44, 160.5, 13.49, 11.89, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
    -- Entry 5: 28 days ago
    (44558.8, 100, 1608.23, 195.7, 16.08, 12.18, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
    -- Entry 6: 35 days ago
    (44363.1, 100, 1432.19, 169.9, 14.32, 11.87, NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
    -- Entry 7: 42 days ago
    (44193.2, 100, 1651.45, 205.3, 16.51, 12.43, NOW() - INTERVAL '42 days', NOW() - INTERVAL '42 days'),
    -- Entry 8: 49 days ago
    (43987.9, 100, 1389.56, 160.2, 13.90, 11.52, NOW() - INTERVAL '49 days', NOW() - INTERVAL '49 days')
  ) AS data(odo, petrol_price, amount, distance, fuel_used, efficiency, created_at, updated_at);

COMMIT;
