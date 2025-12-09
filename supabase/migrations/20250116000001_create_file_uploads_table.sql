-- Create file_uploads table for tracking uploaded files
-- Requirement: 3.4, 3.10, 3.11

CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_status ON file_uploads(status);
CREATE INDEX idx_file_uploads_created_at ON file_uploads(created_at DESC);

-- Enable RLS
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own files
CREATE POLICY "Users can view own files"
  ON file_uploads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own files
CREATE POLICY "Users can insert own files"
  ON file_uploads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own files
CREATE POLICY "Users can update own files"
  ON file_uploads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON file_uploads
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all files
CREATE POLICY "Admins can view all files"
  ON file_uploads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_file_uploads_updated_at
  BEFORE UPDATE ON file_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE file_uploads IS 'Tracks all file uploads with metadata and storage information';
