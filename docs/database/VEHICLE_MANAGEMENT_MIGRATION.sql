-- ============================================================================
-- VEHICLE MANAGEMENT ENHANCEMENT MIGRATION
-- Adds vehicle details, document tracking, and service history
-- ============================================================================

-- ============================================================================
-- UPDATE VEHICLES TABLE
-- ============================================================================

-- Add vehicle details columns
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS make TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
ADD COLUMN IF NOT EXISTS registration_expiry DATE,
ADD COLUMN IF NOT EXISTS puc_expiry DATE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add check constraint for year
ALTER TABLE vehicles
ADD CONSTRAINT check_year_valid CHECK (year IS NULL OR (year >= 1900 AND year <= 2100));

-- Create index for expiry dates to quickly find vehicles with upcoming expirations
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance_expiry ON vehicles(insurance_expiry) WHERE insurance_expiry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_registration_expiry ON vehicles(registration_expiry) WHERE registration_expiry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_puc_expiry ON vehicles(puc_expiry) WHERE puc_expiry IS NOT NULL;

-- Add trigger for updated_at on vehicles
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CREATE SERVICE HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  cost NUMERIC,
  mileage NUMERIC,
  next_service_due DATE,
  next_service_mileage NUMERIC,
  service_provider TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SERVICE HISTORY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_service_history_user_id ON service_history(user_id);
CREATE INDEX IF NOT EXISTS idx_service_history_vehicle_id ON service_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_history_service_date ON service_history(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_service_history_next_service_due ON service_history(next_service_due) WHERE next_service_due IS NOT NULL;

-- ============================================================================
-- SERVICE HISTORY RLS POLICIES
-- ============================================================================

ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;

-- Users can view service history for their vehicles
CREATE POLICY "Users can view their own service history"
  ON service_history
  FOR SELECT
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = service_history.vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

-- Users can insert service history for their vehicles
CREATE POLICY "Users can create service history for their vehicles"
  ON service_history
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

-- Users can update their own service history
CREATE POLICY "Users can update their own service history"
  ON service_history
  FOR UPDATE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

-- Users can delete their own service history
CREATE POLICY "Users can delete their own service history"
  ON service_history
  FOR DELETE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM vehicles
      WHERE vehicles.id = vehicle_id
      AND vehicles.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SERVICE HISTORY TRIGGERS
-- ============================================================================

CREATE TRIGGER update_service_history_updated_at
BEFORE UPDATE ON service_history
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE service_history IS 'Tracks all service and maintenance history for vehicles';
COMMENT ON COLUMN vehicles.insurance_expiry IS 'Insurance policy expiration date';
COMMENT ON COLUMN vehicles.registration_expiry IS 'Vehicle registration expiration date';
COMMENT ON COLUMN vehicles.puc_expiry IS 'Pollution Under Control (PUC) certificate expiration date';
