-- Migration: Profile Management Support Tables
-- Description: Creates tables for parent-student linking and account deletion tracking
-- Date: 2025-11-12

-- =====================================================
-- Parent Link Requests Table
-- =====================================================
-- Tracks requests to link parent and student accounts

CREATE TABLE IF NOT EXISTS parent_link_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMP,
  response_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_pending_link UNIQUE (student_id, parent_id, status),
  CONSTRAINT different_users CHECK (student_id != parent_id)
);

-- Indexes for parent_link_requests
CREATE INDEX idx_parent_link_requests_student ON parent_link_requests(student_id);
CREATE INDEX idx_parent_link_requests_parent ON parent_link_requests(parent_id);
CREATE INDEX idx_parent_link_requests_status ON parent_link_requests(status);
CREATE INDEX idx_parent_link_requests_requested_at ON parent_link_requests(requested_at DESC);

-- Comments for parent_link_requests
COMMENT ON TABLE parent_link_requests IS 'Tracks requests to link parent and student accounts';
COMMENT ON COLUMN parent_link_requests.student_id IS 'ID of the student user';
COMMENT ON COLUMN parent_link_requests.parent_id IS 'ID of the parent user';
COMMENT ON COLUMN parent_link_requests.status IS 'Status of the link request: pending, approved, rejected';
COMMENT ON COLUMN parent_link_requests.requested_at IS 'When the link request was created';
COMMENT ON COLUMN parent_link_requests.responded_at IS 'When the request was approved or rejected';
COMMENT ON COLUMN parent_link_requests.response_note IS 'Optional note about the response';

-- =====================================================
-- Account Deletions Table
-- =====================================================
-- Tracks account deletion requests for admin review

CREATE TABLE IF NOT EXISTS account_deletions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  reason TEXT,
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES users(id),
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for account_deletions
CREATE INDEX idx_account_deletions_user ON account_deletions(user_id);
CREATE INDEX idx_account_deletions_status ON account_deletions(status);
CREATE INDEX idx_account_deletions_requested_at ON account_deletions(requested_at DESC);
CREATE INDEX idx_account_deletions_processed_by ON account_deletions(processed_by);

-- Comments for account_deletions
COMMENT ON TABLE account_deletions IS 'Tracks account deletion requests for admin review and processing';
COMMENT ON COLUMN account_deletions.user_id IS 'ID of the user requesting deletion';
COMMENT ON COLUMN account_deletions.user_email IS 'Email of the user (stored for record keeping)';
COMMENT ON COLUMN account_deletions.user_name IS 'Name of the user (stored for record keeping)';
COMMENT ON COLUMN account_deletions.user_role IS 'Role of the user (stored for record keeping)';
COMMENT ON COLUMN account_deletions.reason IS 'User-provided reason for account deletion';
COMMENT ON COLUMN account_deletions.requested_at IS 'When the deletion was requested';
COMMENT ON COLUMN account_deletions.status IS 'Status: pending, approved, rejected, completed';
COMMENT ON COLUMN account_deletions.processed_at IS 'When the request was processed by admin';
COMMENT ON COLUMN account_deletions.processed_by IS 'Admin user who processed the request';
COMMENT ON COLUMN account_deletions.admin_notes IS 'Admin notes about the deletion';

-- =====================================================
-- Triggers for updated_at
-- =====================================================

-- Trigger for parent_link_requests
CREATE OR REPLACE FUNCTION update_parent_link_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parent_link_requests_updated_at
  BEFORE UPDATE ON parent_link_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_link_requests_updated_at();

-- Trigger for account_deletions
CREATE OR REPLACE FUNCTION update_account_deletions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_deletions_updated_at
  BEFORE UPDATE ON account_deletions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_deletions_updated_at();

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE parent_link_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

-- Parent Link Requests Policies

-- Students can view their own link requests
CREATE POLICY "Students can view their link requests"
  ON parent_link_requests
  FOR SELECT
  USING (
    auth.uid() = student_id
  );

-- Parents can view their link requests
CREATE POLICY "Parents can view their link requests"
  ON parent_link_requests
  FOR SELECT
  USING (
    auth.uid() = parent_id
  );

-- Students can create link requests
CREATE POLICY "Students can create link requests"
  ON parent_link_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
  );

-- Parents can create link requests
CREATE POLICY "Parents can create link requests"
  ON parent_link_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = parent_id
  );

-- Students can update their link requests (approve/reject)
CREATE POLICY "Students can respond to link requests"
  ON parent_link_requests
  FOR UPDATE
  USING (
    auth.uid() = student_id
  );

-- Parents can update their link requests (approve/reject)
CREATE POLICY "Parents can respond to link requests"
  ON parent_link_requests
  FOR UPDATE
  USING (
    auth.uid() = parent_id
  );

-- Admins can view all link requests
CREATE POLICY "Admins can view all link requests"
  ON parent_link_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Account Deletions Policies

-- Users can view their own deletion requests
CREATE POLICY "Users can view their deletion requests"
  ON account_deletions
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Users can create deletion requests
CREATE POLICY "Users can create deletion requests"
  ON account_deletions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Admins can view all deletion requests
CREATE POLICY "Admins can view all deletion requests"
  ON account_deletions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update deletion requests
CREATE POLICY "Admins can update deletion requests"
  ON account_deletions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to approve parent link request
CREATE OR REPLACE FUNCTION approve_parent_link_request(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_student_id UUID;
  v_parent_id UUID;
BEGIN
  -- Get request details
  SELECT student_id, parent_id INTO v_student_id, v_parent_id
  FROM parent_link_requests
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update request status
  UPDATE parent_link_requests
  SET status = 'approved',
      responded_at = NOW()
  WHERE id = request_id;
  
  -- Link student to parent
  UPDATE students
  SET parent_id = v_parent_id,
      updated_at = NOW()
  WHERE user_id = v_student_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject parent link request
CREATE OR REPLACE FUNCTION reject_parent_link_request(request_id UUID, note TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE parent_link_requests
  SET status = 'rejected',
      responded_at = NOW(),
      response_note = note
  WHERE id = request_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Sample Data (for development/testing)
-- =====================================================

-- Note: Sample data should only be inserted in development environments
-- Uncomment the following lines if needed for testing

/*
-- Sample parent link request
INSERT INTO parent_link_requests (student_id, parent_id, status)
SELECT 
  (SELECT id FROM users WHERE role = 'student' LIMIT 1),
  (SELECT id FROM users WHERE role = 'parent' LIMIT 1),
  'pending'
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'student')
  AND EXISTS (SELECT 1 FROM users WHERE role = 'parent');
*/

-- =====================================================
-- Grants
-- =====================================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON parent_link_requests TO authenticated;
GRANT SELECT, INSERT ON account_deletions TO authenticated;
GRANT UPDATE ON account_deletions TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION approve_parent_link_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_parent_link_request(UUID, TEXT) TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Add migration record
INSERT INTO schema_migrations (version, name, executed_at)
VALUES ('014', 'profile_management_tables', NOW())
ON CONFLICT (version) DO NOTHING;
