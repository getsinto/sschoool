-- Migration: User Verification System, Teacher Subject Management, Course Visibility Toggle
-- Created: 2024-01-23

-- ============================================================================
-- 1. USER VERIFICATION SYSTEM (24-48 hours)
-- ============================================================================

-- Add verification fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending_verification' 
  CHECK (account_status IN ('pending_verification', 'pending_review', 'active', 'suspended', 'rejected'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create verification history table
CREATE TABLE IF NOT EXISTS verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('requested', 'approved', 'rejected', 'email_verified')),
  performed_by UUID REFERENCES users(id),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for verification queries
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_verification_history_user_id ON verification_history(user_id);

-- ============================================================================
-- 2. TEACHER SUBJECT MANAGEMENT
-- ============================================================================

-- Create subjects master table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teacher-subjects junction table
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER DEFAULT 0,
  certification_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id)
);

-- Create custom subject requests table
CREATE TABLE IF NOT EXISTS custom_subject_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  justification TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_subject_id UUID REFERENCES subjects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (name, description, category, is_active, is_custom) VALUES
  ('Mathematics', 'Mathematics and related topics', 'STEM', true, false),
  ('Physics', 'Physics and physical sciences', 'STEM', true, false),
  ('Chemistry', 'Chemistry and chemical sciences', 'STEM', true, false),
  ('Biology', 'Biology and life sciences', 'STEM', true, false),
  ('English', 'English language and literature', 'Languages', true, false),
  ('Urdu', 'Urdu language and literature', 'Languages', true, false),
  ('Arabic', 'Arabic language and Islamic studies', 'Languages', true, false),
  ('Computer Science', 'Programming and computer science', 'STEM', true, false),
  ('History', 'History and social studies', 'Social Sciences', true, false),
  ('Geography', 'Geography and earth sciences', 'Social Sciences', true, false),
  ('Islamic Studies', 'Islamic education and Quran', 'Religious Studies', true, false),
  ('Spoken English', 'Conversational English skills', 'Languages', true, false),
  ('Business Studies', 'Business and economics', 'Commerce', true, false),
  ('Accounting', 'Accounting and finance', 'Commerce', true, false)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for subject management
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_id ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject_id ON teacher_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_status ON teacher_subjects(status);
CREATE INDEX IF NOT EXISTS idx_custom_subject_requests_teacher_id ON custom_subject_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_custom_subject_requests_status ON custom_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON subjects(is_active);

-- ============================================================================
-- 3. COURSE VISIBILITY TOGGLE
-- ============================================================================

-- Add visibility fields to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES users(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS visibility_changed_at TIMESTAMPTZ;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS visibility_changed_by UUID REFERENCES users(id);

-- Create course visibility history table
CREATE TABLE IF NOT EXISTS course_visibility_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('published', 'unpublished', 'hidden', 'visible', 'archived', 'unarchived')),
  performed_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  previous_state JSONB,
  new_state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for visibility queries
CREATE INDEX IF NOT EXISTS idx_courses_is_visible ON courses(is_visible);
CREATE INDEX IF NOT EXISTS idx_courses_is_archived ON courses(is_archived);
CREATE INDEX IF NOT EXISTS idx_courses_visibility_status ON courses(is_published, is_visible, is_archived);
CREATE INDEX IF NOT EXISTS idx_course_visibility_history_course_id ON course_visibility_history(course_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check verification time elapsed
CREATE OR REPLACE FUNCTION check_verification_time_elapsed(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  verification_time TIMESTAMPTZ;
  user_role TEXT;
  hours_elapsed NUMERIC;
BEGIN
  SELECT verification_requested_at, role INTO verification_time, user_role
  FROM users WHERE id = user_id;
  
  IF verification_time IS NULL THEN
    RETURN FALSE;
  END IF;
  
  hours_elapsed := EXTRACT(EPOCH FROM (NOW() - verification_time)) / 3600;
  
  -- Different verification times for different roles
  CASE user_role
    WHEN 'teacher' THEN
      RETURN hours_elapsed >= 48; -- 48 hours for teachers
    WHEN 'student', 'parent' THEN
      RETURN hours_elapsed >= 24; -- 24 hours for students/parents
    ELSE
      RETURN hours_elapsed >= 24;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending verifications count
CREATE OR REPLACE FUNCTION get_pending_verifications_count()
RETURNS TABLE(
  total_pending BIGINT,
  pending_teachers BIGINT,
  pending_students BIGINT,
  pending_parents BIGINT,
  overdue_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE account_status IN ('pending_verification', 'pending_review')) as total_pending,
    COUNT(*) FILTER (WHERE role = 'teacher' AND account_status IN ('pending_verification', 'pending_review')) as pending_teachers,
    COUNT(*) FILTER (WHERE role = 'student' AND account_status IN ('pending_verification', 'pending_review')) as pending_students,
    COUNT(*) FILTER (WHERE role = 'parent' AND account_status IN ('pending_verification', 'pending_review')) as pending_parents,
    COUNT(*) FILTER (WHERE 
      account_status IN ('pending_verification', 'pending_review') AND
      check_verification_time_elapsed(id)
    ) as overdue_count
  FROM users;
END;
$$ LANGUAGE plpgsql;

-- Function to get teacher subjects with details
CREATE OR REPLACE FUNCTION get_teacher_subjects(p_teacher_id UUID)
RETURNS TABLE(
  subject_id UUID,
  subject_name TEXT,
  subject_category TEXT,
  is_primary BOOLEAN,
  proficiency_level TEXT,
  years_experience INTEGER,
  status TEXT,
  approved_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.category,
    ts.is_primary,
    ts.proficiency_level,
    ts.years_experience,
    ts.status,
    ts.approved_at
  FROM teacher_subjects ts
  JOIN subjects s ON s.id = ts.subject_id
  WHERE ts.teacher_id = p_teacher_id
  ORDER BY ts.is_primary DESC, s.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_visibility_history ENABLE ROW LEVEL SECURITY;

-- Verification history policies
CREATE POLICY "Users can view their own verification history" ON verification_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all verification history" ON verification_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert verification history" ON verification_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Subjects policies
CREATE POLICY "Everyone can view active subjects" ON subjects
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subjects" ON subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Teacher subjects policies
CREATE POLICY "Teachers can view their own subjects" ON teacher_subjects
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own subjects" ON teacher_subjects
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own pending subjects" ON teacher_subjects
  FOR UPDATE USING (teacher_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all teacher subjects" ON teacher_subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Custom subject requests policies
CREATE POLICY "Teachers can view their own requests" ON custom_subject_requests
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create requests" ON custom_subject_requests
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all requests" ON custom_subject_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Course visibility history policies
CREATE POLICY "Teachers can view their course visibility history" ON course_visibility_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND created_by = auth.uid())
  );

CREATE POLICY "Admins can view all visibility history" ON course_visibility_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins and teachers can insert visibility history" ON course_visibility_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );

-- Update courses RLS policy to include visibility
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
CREATE POLICY "Anyone can view published and visible courses" ON courses
  FOR SELECT USING (
    is_published = true AND 
    is_visible = true AND 
    is_archived = false
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_subjects_updated_at BEFORE UPDATE ON teacher_subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_subject_requests_updated_at BEFORE UPDATE ON custom_subject_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE verification_history IS 'Tracks all verification actions for audit purposes';
COMMENT ON TABLE subjects IS 'Master list of subjects that can be taught';
COMMENT ON TABLE teacher_subjects IS 'Junction table linking teachers to subjects they can teach';
COMMENT ON TABLE custom_subject_requests IS 'Requests from teachers to add new subjects';
COMMENT ON TABLE course_visibility_history IS 'Audit trail for course visibility changes';

COMMENT ON COLUMN users.account_status IS 'Current account verification status';
COMMENT ON COLUMN users.verification_requested_at IS 'When verification was first requested';
COMMENT ON COLUMN courses.is_visible IS 'Whether course is visible to students (independent of published status)';
COMMENT ON COLUMN courses.is_archived IS 'Whether course is archived (hidden from all lists)';
