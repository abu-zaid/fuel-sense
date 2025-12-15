-- Insert sample fuel tracker data for user zaid.abu@outlook.com
-- This script creates a sample vehicle and 8 weekly fuel entries

-- First, get the user ID (replace with actual user ID from auth.users)
-- You can find this by running: SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'

-- Insert vehicle
INSERT INTO vehicles (user_id, name, type, created_at, updated_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
  'Sample Car',
  'car',
  NOW(),
  NOW()
)
RETURNING id;

-- Insert fuel entries (8 entries, weekly intervals, starting from yesterday)
-- Run this after getting the vehicle_id from above query
-- Replace {VEHICLE_ID} with the actual vehicle ID from the previous insert

INSERT INTO fuel_entries (user_id, vehicle_id, odo, petrol_price, amount, distance, fuel_used, efficiency, created_at, updated_at)
VALUES
  (
    (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
    '{VEHICLE_ID}',
    45246.5,
    100,
    1524.31,
    188.4,
    15.24,
    12.37,
    NOW() - INTERVAL '0 days',
    NOW() - INTERVAL '0 days'
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
    '{VEHICLE_ID}',
    45058.1,
    100,
    1397.85,
    163.2,
    13.98,
    11.66,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
    '{VEHICLE_ID}',
    44894.9,
    100,
    1521.74,
    175.6,
    15.22,
    11.54,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
    '{VEHICLE_ID}',
    44719.3,
    100,
    1349.44,
    160.5,
    13.49,
    11.89,
    NOW() - INTERVAL '21 days',
    NOW() - INTERVAL '21 days'
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
    '{VEHICLE_ID}',
    44558.8,
    100,
    1608.23,
    195.7,
    16.08,
    12.18,
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '28 days'
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
    '{VEHICLE_ID}',
    44363.1,
    100,
    1432.19,
    169.9,
    14.32,
    11.87,
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '35 days'
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
    '{VEHICLE_ID}',
    44193.2,
    100,
    1651.45,
    205.3,
    16.51,
    12.43,
    NOW() - INTERVAL '42 days',
    NOW() - INTERVAL '42 days'
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'),
    '{VEHICLE_ID}',
    43987.9,
    100,
    1389.56,
    160.2,
    13.90,
    11.52,
    NOW() - INTERVAL '49 days',
    NOW() - INTERVAL '49 days'
  );
