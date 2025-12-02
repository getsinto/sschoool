-- ============================================================================
-- SIMPLE AND DIRECT FIX FOR PHONE FIELD ERROR
-- This version avoids all aggregate function issues
-- ============================================================================

-- STEP 1: Drop ALL triggers on auth.users (no diagnostics, just action)
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'auth.users'::regclass
          AND NOT tgisinternal
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', trigger_rec.tgname);
        RAISE NOTICE 'Dropped trigger: %', trigger_rec.tgname;
    END LOOP;
END $$;

-- STEP 2: Drop the problematic handle_new_user function if it exists
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 3: Drop and recreate create_user_profile function
DROP FUNCTION IF EXISTS create_user_profile CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;

CREATE OR REPLACE FUNCTION public.create_user_profile(
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
  INSERT INTO public.users (
    id, email, full_name, last_name, role, mobile, whatsapp,
    date_of_birth, gender, country, state, city, address,
    postal_code, id_card_type, id_card_url, profile_pic,
    account_status, is_verified, is_active, email_verified,
    created_at, updated_at
  ) VALUES (
    p_id, p_email, p_full_name, p_last_name, p_role, p_mobile, p_whatsapp,
    p_date_of_birth, p_gender, p_country, p_state, p_city, p_address,
    p_postal_code, p_id_card_type, p_id_card_url, p_profile_pic,
    p_account_status, false, true, false, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW()
  RETURNING json_build_object(
    'id', id,
    'email', email,
    'full_name', full_name,
    'role', role
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile TO service_role;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;

-- STEP 4: Verify the fix
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger 
  WHERE tgrelid = 'auth.users'::regclass
    AND NOT tgisinternal;
  
  RAISE NOTICE '=== CLEANUP COMPLETE ===';
  RAISE NOTICE 'Remaining triggers on auth.users: %', trigger_count;
  
  IF trigger_count = 0 THEN
    RAISE NOTICE 'SUCCESS: All triggers removed from auth.users!';
    RAISE NOTICE 'The phone field error should now be resolved.';
  ELSE
    RAISE WARNING 'Warning: % triggers still exist on auth.users', trigger_count;
  END IF;
END $$;
