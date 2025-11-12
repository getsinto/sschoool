-- Migration: Registration System Support
-- Description: Add columns and tables needed for the multi-step registration system
-- Created: 2024-11-12

-- Add registration-related columns to profiles table if they don't exist
DO $$ 
BEGIN
  -- Add category_specific_data column for storing user type-specific information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'category_specific_data'
  ) THEN
    ALTER TABLE profiles ADD COLUMN category_specific_data JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add consent_data column for storing user consents
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'consent_data'
  ) THEN
    ALTER TABLE profiles ADD COLUMN consent_data JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add verification_token column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_token'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_token TEXT;
  END IF;

  -- Add token_expires_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'token_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add registration_completed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'registration_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_completed BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add email_verified column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add account_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status TEXT DEFAULT 'pending';
  END IF;

  -- Add ID verification columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_type TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_number TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_front_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_front_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_back_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_back_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'selfie_with_id_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN selfie_with_id_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_photo_url TEXT;
  END IF;

END $$;

-- Create index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_verification_token 
ON profiles(verification_token) 
WHERE verification_token IS NOT NULL;

-- Create index on email_verified for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified 
ON profiles(email_verified);

-- Create index on account_status for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_account_status 
ON profiles(account_status);

-- Add check constraint for account_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_account_status_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_account_status_check 
    CHECK (account_status IN ('pending', 'pending_verification', 'pending_review', 'active', 'suspended', 'rejected'));
  END IF;
END $$;

-- Create storage buckets for registration files if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('id-verification', 'id-verification', false),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for id-verification bucket
CREATE POLICY IF NOT EXISTS "Users can upload their own ID verification files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'id-verification' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Users can view their own ID verification files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-verification' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Admins can view all ID verification files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-verification' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Set up storage policies for documents bucket
CREATE POLICY IF NOT EXISTS "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY IF NOT EXISTS "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create function to clean up expired verification tokens
CREATE OR REPLACE FUNCTION clean_expired_verification_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    verification_token = NULL,
    token_expires_at = NULL
  WHERE 
    verification_token IS NOT NULL
    AND token_expires_at < NOW();
END;
$$;

-- Create a scheduled job to clean up expired tokens (runs daily)
-- Note: This requires pg_cron extension which may need to be enabled
-- If pg_cron is not available, this can be run manually or via a cron job
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'clean-expired-tokens',
      '0 2 * * *', -- Run at 2 AM daily
      'SELECT clean_expired_verification_tokens();'
    );
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN profiles.category_specific_data IS 'Stores user type-specific information (student, teacher, parent, spoken_english)';
COMMENT ON COLUMN profiles.consent_data IS 'Stores user consent preferences (GDPR, COPPA, notifications, etc.)';
COMMENT ON COLUMN profiles.verification_token IS 'Token for email verification';
COMMENT ON COLUMN profiles.token_expires_at IS 'Expiration timestamp for verification token';
COMMENT ON COLUMN profiles.registration_completed IS 'Whether user has completed the full registration process';
COMMENT ON COLUMN profiles.email_verified IS 'Whether user has verified their email address';
COMMENT ON COLUMN profiles.account_status IS 'Current status of the account (pending, active, suspended, etc.)';
COMMENT ON COLUMN profiles.id_type IS 'Type of ID document uploaded (Aadhaar, Passport, etc.)';
COMMENT ON COLUMN profiles.id_number IS 'ID document number';
COMMENT ON COLUMN profiles.id_front_url IS 'URL to front of ID document';
COMMENT ON COLUMN profiles.id_back_url IS 'URL to back of ID document';
COMMENT ON COLUMN profiles.selfie_with_id_url IS 'URL to selfie with ID for verification';
COMMENT ON COLUMN profiles.profile_photo_url IS 'URL to user profile photo';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION clean_expired_verification_tokens() TO service_role;
