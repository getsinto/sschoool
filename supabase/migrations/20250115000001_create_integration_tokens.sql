-- ============================================================================
-- INTEGRATION TOKENS - OAuth tokens for third-party integrations
-- Version: 1.0.0
-- Description: Store OAuth tokens for Zoom, Google Meet, and other integrations
-- ============================================================================

-- Integration Tokens Table
CREATE TABLE IF NOT EXISTS integration_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('zoom', 'google_meet', 'google_calendar')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    token_type TEXT DEFAULT 'Bearer',
    scope TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_tokens_user_id ON integration_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_provider ON integration_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_expires_at ON integration_tokens(expires_at);

-- RLS Policies
ALTER TABLE integration_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tokens
CREATE POLICY "Users can view own integration tokens"
    ON integration_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can insert own integration tokens"
    ON integration_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update own integration tokens"
    ON integration_tokens
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete own integration tokens"
    ON integration_tokens
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE integration_tokens IS 'OAuth tokens for third-party integrations';
COMMENT ON COLUMN integration_tokens.provider IS 'Integration provider (zoom, google_meet, google_calendar)';
COMMENT ON COLUMN integration_tokens.access_token IS 'OAuth access token';
COMMENT ON COLUMN integration_tokens.refresh_token IS 'OAuth refresh token for renewing access';
COMMENT ON COLUMN integration_tokens.expires_at IS 'When the access token expires';
