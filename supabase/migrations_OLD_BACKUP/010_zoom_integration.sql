-- Zoom Integration Tables and Functions
-- This migration adds support for Zoom live classes

-- Add Zoom-specific columns to live_classes table if not exists
ALTER TABLE live_classes 
ADD COLUMN IF NOT EXISTS meeting_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS join_url TEXT,
ADD COLUMN IF NOT EXISTS start_url TEXT,
ADD COLUMN IF NOT EXISTS password VARCHAR(50),
ADD COLUMN IF NOT EXISTS recording_status VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS zoom_settings JSONB DEFAULT '{}';

-- Create index on meeting_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_live_classes_meeting_id ON live_classes(meeting_id);

-- Create meeting_participants table for attendance tracking
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255),
  join_time TIMESTAMP WITH TIME ZONE NOT NULL,
  leave_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0, -- in seconds
  status VARCHAR(50) DEFAULT 'present', -- present, left, waiting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for meeting_participants
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_join_time ON meeting_participants(join_time);

-- Create meeting_recordings table
CREATE TABLE IF NOT EXISTS meeting_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id VARCHAR(255) NOT NULL,
  recording_id VARCHAR(255) UNIQUE NOT NULL,
  recording_start TIMESTAMP WITH TIME ZONE NOT NULL,
  recording_end TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0, -- in seconds
  file_size BIGINT DEFAULT 0, -- in bytes
  play_url TEXT,
  download_url TEXT,
  recording_type VARCHAR(100), -- shared_screen_with_speaker_view, etc.
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for meeting_recordings
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_recording_id ON meeting_recordings(recording_id);

-- Function to update participant duration
CREATE OR REPLACE FUNCTION update_participant_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.leave_time IS NOT NULL AND NEW.join_time IS NOT NULL THEN
    NEW.duration := EXTRACT(EPOCH FROM (NEW.leave_time - NEW.join_time))::INTEGER;
    NEW.status := 'left';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for participant duration
DROP TRIGGER IF EXISTS trigger_update_participant_duration ON meeting_participants;
CREATE TRIGGER trigger_update_participant_duration
  BEFORE UPDATE ON meeting_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_duration();

-- Function to get meeting attendance summary
CREATE OR REPLACE FUNCTION get_meeting_attendance_summary(p_meeting_id VARCHAR)
RETURNS TABLE (
  total_participants INTEGER,
  present_count INTEGER,
  left_count INTEGER,
  average_duration INTEGER,
  total_duration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_participants,
    COUNT(*) FILTER (WHERE status = 'present')::INTEGER as present_count,
    COUNT(*) FILTER (WHERE status = 'left')::INTEGER as left_count,
    AVG(duration)::INTEGER as average_duration,
    SUM(duration)::INTEGER as total_duration
  FROM meeting_participants
  WHERE meeting_id = p_meeting_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for meeting_participants
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- Teachers and admins can view all participants
CREATE POLICY meeting_participants_select_policy ON meeting_participants
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('teacher', 'admin')
    )
  );

-- System can insert participant records
CREATE POLICY meeting_participants_insert_policy ON meeting_participants
  FOR INSERT
  WITH CHECK (true);

-- System can update participant records
CREATE POLICY meeting_participants_update_policy ON meeting_participants
  FOR UPDATE
  USING (true);

-- RLS Policies for meeting_recordings
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

-- Teachers, admins, and enrolled students can view recordings
CREATE POLICY meeting_recordings_select_policy ON meeting_recordings
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('teacher', 'admin')
    )
    OR
    auth.uid() IN (
      SELECT user_id FROM enrollments 
      WHERE course_id IN (
        SELECT course_id FROM live_classes WHERE meeting_id = meeting_recordings.meeting_id
      )
    )
  );

-- System can insert recording records
CREATE POLICY meeting_recordings_insert_policy ON meeting_recordings
  FOR INSERT
  WITH CHECK (true);

-- System can update recording records
CREATE POLICY meeting_recordings_update_policy ON meeting_recordings
  FOR UPDATE
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE meeting_participants IS 'Tracks participant attendance in Zoom meetings';
COMMENT ON TABLE meeting_recordings IS 'Stores Zoom meeting recording information';
COMMENT ON COLUMN live_classes.meeting_id IS 'Zoom meeting ID';
COMMENT ON COLUMN live_classes.recording_status IS 'Current recording status: none, recording, stopped, processing, completed';
COMMENT ON COLUMN live_classes.zoom_settings IS 'JSON object containing Zoom meeting settings';
