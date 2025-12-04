-- Create audit_logs table for tracking permission-sensitive operations
-- This migration adds comprehensive audit logging for the course assignment permission system

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Actor information
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_role TEXT NOT NULL,
  
  -- Action details
  action TEXT NOT NULL, -- 'course_created', 'teacher_assigned', 'permission_updated', 'course_deleted', etc.
  resource_type TEXT NOT NULL, -- 'course', 'course_assignment', etc.
  resource_id TEXT NOT NULL,
  
  -- Change tracking
  old_values JSONB,
  new_values JSONB,
  
  -- Additional context
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Indexing
  CONSTRAINT valid_action CHECK (action IN (
    'course_created',
    'course_updated',
    'course_deleted',
    'course_published',
    'course_unpublished',
    'teacher_assigned',
    'teacher_unassigned',
    'permission_updated',
    'permission_granted',
    'permission_revoked'
  )),
  CONSTRAINT valid_resource_type CHECK (resource_type IN (
    'course',
    'course_assignment',
    'permission'
  ))
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_user_role ON audit_logs(user_role);

-- Create composite index for common queries
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id, created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role_level >= 4
    )
  );

-- System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No updates or deletes allowed (audit logs are immutable)
CREATE POLICY "Audit logs are immutable"
  ON audit_logs
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Audit logs cannot be deleted"
  ON audit_logs
  FOR DELETE
  TO authenticated
  USING (false);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_user_email TEXT,
  p_user_role TEXT,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    user_email,
    user_role,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_user_email,
    p_user_role,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    p_ip_address,
    p_user_agent,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create view for audit log summary
CREATE OR REPLACE VIEW audit_log_summary AS
SELECT 
  action,
  resource_type,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence
FROM audit_logs
GROUP BY action, resource_type;

-- Grant permissions
GRANT SELECT ON audit_log_summary TO authenticated;

-- Add comment
COMMENT ON TABLE audit_logs IS 'Audit trail for all permission-sensitive operations in the course assignment system';
COMMENT ON FUNCTION log_audit_event IS 'Helper function to create audit log entries with proper validation';
