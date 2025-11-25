-- ============================================================================
-- FINAL REGISTRATION FIX
-- This migration removes the automatic trigger and relies on explicit RPC calls
-- ============================================================================

-- Drop the automatic trigger that creates conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Drop the old trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Ensure the create_user_profile function exists with correct signature
DROP FUNCTION IF EXISTS create_user_profile CASCADE;

CREATE OR REPLACE FUNCTION create_user_profile(
  p_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_last_name TEXT,
  p_role user_role,
  p_mobile TEXT,
  p_whatsapp TEXT,
  p_date_of_birth DATE,
  p_gender TEXT,
  p_country TEXT,
  p_city TEXT,
  p_address TEXT,
  p_postal_code TEXT,
  p_id_card_type TEXT,
  p_id_card_url TEXT,
  p_state TEXT DEFAULT NULL,
  p_profile_pic TEXT DEFAULT NULL,
  p_account_status account_status_type DEFAULT 'pending_verification'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Insert the user profile
  INSERT INTO users (
    id,
    email,
    full_name,
    last_name,
    role,
    mobile,
    whatsapp,
    date_of_birth,
    gender,
    country,
    state,
    city,
    address,
    postal_code,
    id_card_type,
    id_card_url,
    profile_pic,
    account_status,
    is_verified,
    is_active,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    p_id,
    p_email,
    p_full_name,
    p_last_name,
    p_role,
    p_mobile,
    p_whatsapp,
    p_date_of_birth::DATE,
    p_gender,
    p_country,
    p_state,
    p_city,
    p_address,
    p_postal_code,
    p_id_card_type,
    p_id_card_url,
    p_profile_pic,
    p_account_status,
    false,
    true,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    mobile = EXCLUDED.mobile,
    whatsapp = EXCLUDED.whatsapp,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    country = EXCLUDED.country,
    state = EXCLUDED.state,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code,
    id_card_type = EXCLUDED.id_card_type,
    id_card_url = EXCLUDED.id_card_url,
    profile_pic = EXCLUDED.profile_pic,
    account_status = EXCLUDED.account_status,
    updated_at = NOW()
  RETURNING json_build_object(
    'id', id,
    'email', email,
    'full_name', full_name,
    'role', role,
    'account_status', account_status
  ) INTO v_result;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create user profile: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_profile TO service_role;
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO anon;

COMMENT ON FUNCTION create_user_profile IS 'Creates or updates a user profile - called explicitly from registration API';
