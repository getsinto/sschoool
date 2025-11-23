-- ============================================================================
-- INITIAL SETUP - Extensions and Base Configuration
-- Version: 1.0.0
-- Description: Enable required PostgreSQL extensions
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Comments
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for text search';
