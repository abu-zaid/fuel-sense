-- UPDATE query to revert fuel entries for "Pulsar NS400z" to original values
-- This query reverts the distance values to the original baseline state

UPDATE fuel_entries
SET distance = CASE odo
  -- Entry 1: odo 16 - revert to 0 (baseline)
  WHEN 16 THEN 0
  -- Entry 2: odo 173 - revert to 157
  WHEN 173 THEN 157
  -- Entry 3: odo 394 - revert to 221
  WHEN 394 THEN 221
  -- Entry 4: odo 564 - revert to 170
  WHEN 564 THEN 170
  -- Entry 5: odo 741 - revert to 177
  WHEN 741 THEN 177
  -- Entry 6: odo 831 - revert to 90
  WHEN 831 THEN 90
  -- Entry 7: odo 1066 - revert to 235
  WHEN 1066 THEN 235
  -- Entry 8: odo 1242 - revert to 176
  WHEN 1242 THEN 176
  -- Entry 9: odo 1423 - revert to 181
  WHEN 1423 THEN 181
  -- Entry 10: odo 1644 - revert to 221
  WHEN 1644 THEN 221
  -- Entry 11: odo 1865 - revert to 221
  WHEN 1865 THEN 221
  -- Entry 12: odo 2102 - revert to 237
  WHEN 2102 THEN 237
  -- Entry 13: odo 2338 - revert to 236
  WHEN 2338 THEN 236
  -- Entry 14: odo 2570 - revert to 232
  WHEN 2570 THEN 232
  -- Entry 15: odo 2777 - revert to 207
  WHEN 2777 THEN 207
  -- Entry 16: odo 2975 - revert to 198
  WHEN 2975 THEN 198
  -- Entry 17: odo 3206 - revert to 231
  WHEN 3206 THEN 231
  ELSE distance
END
WHERE vehicle_id = (
  SELECT id FROM vehicles 
  WHERE name = 'Pulsar NS400z' AND user_id = (
    SELECT id FROM auth.users WHERE email = 'zaid.abu@outlook.com'
  )
);
