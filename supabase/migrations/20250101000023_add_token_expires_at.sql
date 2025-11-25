-- Add token_expires_at column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'token_expires_at'
    ) THEN
        ALTER TABLE users ADD COLUMN token_expires_at TIMESTAMPTZ;
        
        COMMENT ON COLUMN users.token_expires_at IS 'Expiration timestamp for verification token';
    END IF;
END $$;
