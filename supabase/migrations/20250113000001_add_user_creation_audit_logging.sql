-- Extend audit_logs table to support user creation and management actions
-- This migration adds user creation audit logging for the admin direct user creation feature

-- Drop the existing constraint to add new actions
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS valid_action;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS valid_resource_type;

-- Add new constraint with user management actions
ALTER TABLE audit_logs ADD CONSTRAINT valid_action CHECK (action IN (
  -- Existing course actions
  'course_created',
  'course_updated',
  'course_deleted',
  'course_published',
  'course_unpublished',
  'teacher_assigned',
  'teacher_unassigned',
  'permission_updated',
  'permission_granted',
  'permission_revoked',
  -- New user management actions
  'user_created',
  'user_updated',
  'user_deleted',
  'user_suspended',
  'user_activated',
  'user_verified',
  'password_generated',
  'credentials_emailed'
));

-- Add new constraint with user resource type
ALTER TABLE audit_logs ADD CONSTRAINT valid_resource_type CHECK (resource_type IN (
  -- Existing resource types
  'course',
  'course_assignment',
  'permission',
  -- New resource types
  'user',
  'user_profile',
  'user_credentials'
));

-- Create index for user creation queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_creation 
  ON audit_logs(action, created_at DESC) 
  WHERE action IN ('user_created', 'user_updated', 'user_deleted');

-- Create function specifically for logging user creation events
CREATE OR REPLACE FUNCTION log_user_creation_event(
  p_admin_id UUID,
  p_admin_email TEXT,
  p_created_user_id UUID,
  p_user_type TEXT,
  p_user_email TEXT,
  p_account_status TEXT,
  p_is_verified BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
  v_admin_role TEXT;
BEGIN
  -- Get admin role
  SELECT role INTO v_admin_role
  FROM users
  WHERE id = p_admin_id;
  
  -- Log the user creation event
  INSERT INTO audit_logs (
    user_id,
    user_email,
    user_role,
    action,
    resource_type,
    resource_id,
    new_values,
    ip_address,
    metadata
  ) VALUES (
    p_admin_id,
    p_admin_email,
    COALESCE(v_admin_role::TEXT, 'admin'),
    'user_created',
    'user',
    p_created_user_id::TEXT,
    jsonb_build_object(
      'user_type', p_user_type,
      'email', p_user_email,
      'account_status', p_account_status,
      'is_verified', p_is_verified,
      'created_at', NOW()
    ),
    p_ip_address,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create function for logging password generation events
CREATE OR REPLACE FUNCTION log_password_generation_event(
  p_admin_id UUID,
  p_admin_email TEXT,
  p_user_id UUID,
  p_user_email TEXT,
  p_was_emailed BOOLEAN,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
  v_admin_role TEXT;
BEGIN
  -- Get admin role
  SELECT role INTO v_admin_role
  FROM users
  WHERE id = p_admin_id;
  
  -- Log the password generation event (never log the actual password)
  INSERT INTO audit_logs (
    user_id,
    user_email,
    user_role,
    action,
    resource_type,
    resource_id,
    new_values,
    ip_address,
    metadata
  ) VALUES (
    p_admin_id,
    p_admin_email,
    COALESCE(v_admin_role::TEXT, 'admin'),
    'password_generated',
    'user_credentials',
    p_user_id::TEXT,
    jsonb_build_object(
      'user_email', p_user_email,
      'was_emailed', p_was_emailed,
      'generated_at', NOW()
    ),
    p_ip_address,
    jsonb_build_object(
      'note', 'Password was generated but not stored in audit log for security'
    )
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create function for logging failed user creation attempts
CREATE OR REPLACE FUNCTION log_user_creation_failure(
  p_admin_id UUID,
  p_admin_email TEXT,
  p_attempted_email TEXT,
  p_user_type TEXT,
  p_error_message TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
  v_admin_role TEXT;
BEGIN
  -- Get admin role
  SELECT role INTO v_admin_role
  FROM users
  WHERE id = p_admin_id;
  
  -- Log the failed attempt
  INSERT INTO audit_logs (
    user_id,
    user_email,
    user_role,
    action,
    resource_type,
    resource_id,
    new_values,
    ip_address,
    metadata
  ) VALUES (
    p_admin_id,
    p_admin_email,
    COALESCE(v_admin_role::TEXT, 'admin'),
    'user_created',
    'user',
    'failed_attempt',
    jsonb_build_object(
      'attempted_email', p_attempted_email,
      'user_type', p_user_type,
      'error', p_error_message,
      'attempted_at', NOW()
    ),
    p_ip_address,
    jsonb_build_object(
      'success', false,
      'error_message', p_error_message
    )
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Update the audit_log_summary view to include user actions
DROP VIEW IF EXISTS audit_log_summary;
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

-- Create a view specifically for user creation audit logs
CREATE OR REPLACE VIEW user_creation_audit_logs AS
SELECT 
  al.id,
  al.created_at,
  al.user_id as admin_id,
  al.user_email as admin_email,
  al.user_role as admin_role,
  al.resource_id as created_user_id,
  al.new_values->>'user_type' as user_type,
  al.new_values->>'email' as created_user_email,
  al.new_values->>'account_status' as account_status,
  (al.new_values->>'is_verified')::BOOLEAN as is_verified,
  al.ip_address,
  al.metadata,
  CASE 
    WHEN al.metadata->>'success' = 'false' THEN false
    ELSE true
  END as success
FROM audit_logs al
WHERE al.action = 'user_created'
ORDER BY al.created_at DESC;

-- Grant permissions
GRANT SELECT ON user_creation_audit_logs TO authenticated;

-- Add comments
COMMENT ON FUNCTION log_user_creation_event IS 'Logs successful user creation events by admins';
COMMENT ON FUNCTION log_password_generation_event IS 'Logs password generation events without storing the actual password';
COMMENT ON FUNCTION log_user_creation_failure IS 'Logs failed user creation attempts for security monitoring';
COMMENT ON VIEW user_creation_audit_logs IS 'View of all user creation audit logs with parsed details';
