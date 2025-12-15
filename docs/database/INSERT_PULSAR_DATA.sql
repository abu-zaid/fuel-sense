-- SQL script to insert actual fuel data for "Pulsar NS400z"
-- This script inserts 17 fuel entries with real data

INSERT INTO fuel_entries (user_id, vehicle_id, odo, petrol_price, amount, distance, created_at, updated_at)
SELECT
  v.user_id,
  v.id,
  data.odo,
  data.petrol_price,
  data.amount,
  data.distance,
  data.created_at,
  data.updated_at
FROM vehicles v,
LATERAL (
  VALUES
    -- Entry 1: 112 days ago (oldest) - first entry, skip distance calculation
    (16, 107.46, 1050, 0, NOW() - INTERVAL '112 days', NOW() - INTERVAL '112 days'),
    -- Entry 2: 105 days ago - distance from 16 to 173
    (173, 107.46, 780, 157, NOW() - INTERVAL '105 days', NOW() - INTERVAL '105 days'),
    -- Entry 3: 98 days ago - distance from 173 to 394
    (394, 107.46, 976, 221, NOW() - INTERVAL '98 days', NOW() - INTERVAL '98 days'),
    -- Entry 4: 91 days ago - distance from 394 to 564
    (564, 107.46, 939.2, 170, NOW() - INTERVAL '91 days', NOW() - INTERVAL '91 days'),
    -- Entry 5: 84 days ago - distance from 564 to 741
    (741, 107.46, 818.85, 177, NOW() - INTERVAL '84 days', NOW() - INTERVAL '84 days'),
    -- Entry 6: 77 days ago - distance from 741 to 831
    (831, 107.46, 456.7, 90, NOW() - INTERVAL '77 days', NOW() - INTERVAL '77 days'),
    -- Entry 7: 70 days ago - distance from 831 to 1066
    (1066, 107.46, 975, 235, NOW() - INTERVAL '70 days', NOW() - INTERVAL '70 days'),
    -- Entry 8: 63 days ago - distance from 1066 to 1242
    (1242, 107.46, 797, 176, NOW() - INTERVAL '63 days', NOW() - INTERVAL '63 days'),
    -- Entry 9: 56 days ago - distance from 1242 to 1423
    (1423, 114.68, 890, 181, NOW() - INTERVAL '56 days', NOW() - INTERVAL '56 days'),
    -- Entry 10: 49 days ago - distance from 1423 to 1644
    (1644, 107.46, 1048, 221, NOW() - INTERVAL '49 days', NOW() - INTERVAL '49 days'),
    -- Entry 11: 42 days ago - distance from 1644 to 1865
    (1865, 107.46, 1046, 221, NOW() - INTERVAL '42 days', NOW() - INTERVAL '42 days'),
    -- Entry 12: 35 days ago - distance from 1865 to 2102
    (2102, 107.46, 1189, 237, NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
    -- Entry 13: 28 days ago - distance from 2102 to 2338
    (2338, 107.39, 1002, 236, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
    -- Entry 14: 21 days ago - distance from 2338 to 2570
    (2570, 107.46, 1177, 232, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
    -- Entry 15: 14 days ago - distance from 2570 to 2777
    (2777, 107.46, 902, 207, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    -- Entry 16: 7 days ago - distance from 2777 to 2975
    (2975, 107.46, 901, 198, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    -- Entry 17: Yesterday (0 days ago) - newest - distance from 2975 to 3206
    (3206, 107.46, 1168, 231, NOW() - INTERVAL '0 days', NOW() - INTERVAL '0 days')
  ) AS data(odo, petrol_price, amount, distance, created_at, updated_at)
WHERE v.name = 'Pulsar NS400z' AND v.user_id = (SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com');
