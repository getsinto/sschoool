-- Drop all triggers on auth.users (each on separate line)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;

DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;
