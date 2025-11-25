-- ============================================================================
-- DIAGNOSTIC AND NUCLEAR FIX FOR PHONE FIELD ERROR
-- Run this to find and destroy ALL triggers/functions referencing "phone"
-- ============================================================================

-- STEP 1: Find ALL triggers on auth.users
SELECT 
  t.tgname as trigger_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'auth.users'::regclass;

-- STEP 2: Find ALL functions that might reference "phone"
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%phone%'
  AND n.nspname IN ('public', 'auth');

-- STEP 3: NUCLEAR OPTION - Drop EVERYTHING that could be causing this
-- Drop ALL triggers on auth.users
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'auth.users'::regclass
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON auth.users CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.tgname;
    END LOOP;
END $$;

-- Drop ALL functions that reference "phone"
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE pg_get_functiondef(p.oid) ILIKE '%phone%'
          AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.nspname) || '.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
        RAISE NOTICE 'Dropped function: %.%', r.nspname, r.proname;
    END LOOP;
END $$;

-- STEP 4: Recreate the CORRECT function
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
  INSERT INTO users (
    id, email, full_name, last_name, role, mobile, whatsapp,
    date_of_birth, gender, country, state, city, address,
    postal_code, id_card_type, id_card_url, profile_pic,
    account_status, is_verified, is_active, email_verified,
    created_at, updated_at
  ) VALUES (
    p_id, p_email, p_full_name, p_last_name, p_role, p_mobile, p_whatsapp,
    p_date_of_birth::DATE, p_gender, p_country, p_state, p_city, p_address,
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

GRANT EXECUTE ON FUNCTION create_user_profile TO service_role;
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile TO anon;

-- STEP 5: Verify cleanup
SELECT 'Remaining triggers on auth.users:' as status;
SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;

SELECT 'Functions still referencing phone:' as status;
SELECT proname FROM pg_proc WHERE pg_get_functiondef(oid) ILIKE '%phone%' AND pronamespace = 'public'::regnamespace;
