-- Fix any triggers or functions that reference 'phone' instead of 'mobile'
-- This migration ensures all database objects use the correct field name

-- Drop any existing problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Drop any existing problematic functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate the handle_new_user function with correct field names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table when a new auth user is created
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    mobile,
    whatsapp,
    is_active,
    is_verified,
    email_verified,
    account_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name'),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_role, 'student'::user_role),
    NEW.raw_user_meta_data->>'mobile_number',
    NEW.raw_user_meta_data->>'whatsapp_number',
    true,
    false,
    false,
    'pending_verification'::account_status_type,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user profile when a new auth user is created';
