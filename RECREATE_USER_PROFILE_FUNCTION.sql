-- Recreate the create_user_profile function that was deleted
-- This function creates a user profile without referencing non-existent fields

CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_last_name TEXT,
  p_role TEXT,
  p_mobile TEXT,
  p_whatsapp TEXT,
  p_date_of_birth TEXT,
  p_gender TEXT,
  p_country TEXT,
  p_state TEXT,
  p_city TEXT,
  p_address TEXT,
  p_postal_code TEXT,
  p_id_card_type TEXT,
  p_id_card_url TEXT,
  p_profile_pic TEXT,
  p_account_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (
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
    created_at,
    updated_at
  ) VALUES (
    p_id,
    p_email,
    p_full_name,
    p_last_name,
    p_role::user_role,
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
    p_account_status::account_status_type,
    NOW(),
    NOW()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO service_role;
