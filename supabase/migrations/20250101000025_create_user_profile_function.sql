-- Create function to insert user profile (bypasses RLS)
CREATE OR REPLACE FUNCTION create_user_profile(
  p_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_last_name TEXT,
  p_role user_role,
  p_mobile TEXT,
  p_whatsapp TEXT,
  p_date_of_birth DATE,
  p_gender gender_type,
  p_country TEXT,
  p_state TEXT DEFAULT NULL,
  p_city TEXT,
  p_address TEXT,
  p_postal_code TEXT,
  p_id_card_type TEXT,
  p_id_card_url TEXT,
  p_profile_pic TEXT DEFAULT NULL,
  p_account_status account_status DEFAULT 'pending_verification'
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
    p_date_of_birth,
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
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION create_user_profile TO service_role;
