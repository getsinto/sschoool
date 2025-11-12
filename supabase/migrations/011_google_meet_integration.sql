-- Google Meet Integration Migration
-- Adds support for Google Meet as a video conferencing platform

-- Add google_event_id column to live_classes if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'live_classes' AND column_name = 'google_event_id'
  ) THEN
    ALTER TABLE live_classes ADD COLUMN google_event_id TEXT;
    CREATE INDEX idx_live_classes_google_event_id ON live_classes(google_event_id);
  END IF;
END $$;

-- Update platform enum to include google_meet if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'google_meet' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'video_platform')
  ) THEN
    ALTER TYPE video_platform ADD VALUE IF NOT EXISTS 'google_meet';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- Create user_integrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'zoom', 'microsoft')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ NOT NULL,
  scopes TEXT,
  is_active BOOLEAN DEFAULT true,
  calendar_id TEXT,
  calendar_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create indexes for user_integrations
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider ON user_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_user_integrations_active ON user_integrations(is_active) WHERE is_active = true;

-- Add RLS policies for user_integrations
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own integrations
CREATE POLICY user_integrations_select_own ON user_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own integrations
CREATE POLICY user_integrations_insert_own ON user_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own integrations
CREATE POLICY user_integrations_update_own ON user_integrations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own integrations
CREATE POLICY user_integrations_delete_own ON user_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all integrations
CREATE POLICY user_integrations_admin_all ON user_integrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS user_integrations_updated_at ON user_integrations;
CREATE TRIGGER user_integrations_updated_at
  BEFORE UPDATE ON user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_integrations_updated_at();

-- Function to clean up expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_integrations()
RETURNS void AS $$
BEGIN
  UPDATE user_integrations
  SET is_active = false
  WHERE token_expiry < NOW() - INTERVAL '30 days'
  AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Add comment to table
COMMENT ON TABLE user_integrations IS 'Stores OAuth integrations for external services like Google Meet, Zoom, etc.';
COMMENT ON COLUMN user_integrations.provider IS 'The external service provider (google, zoom, microsoft)';
COMMENT ON COLUMN user_integrations.access_token IS 'OAuth access token for API calls';
COMMENT ON COLUMN user_integrations.refresh_token IS 'OAuth refresh token to get new access tokens';
COMMENT ON COLUMN user_integrations.token_expiry IS 'When the access token expires';
COMMENT ON COLUMN user_integrations.scopes IS 'OAuth scopes granted by the user';
COMMENT ON COLUMN user_integrations.is_active IS 'Whether the integration is currently active';
COMMENT ON COLUMN user_integrations.metadata IS 'Additional provider-specific data';
