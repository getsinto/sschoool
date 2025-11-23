-- ============================================================================
-- CONTENT LIBRARY TABLES - Media file management
-- Version: 1.0.0
-- Description: Content folders, files, categories
-- ============================================================================

-- Content Folders Table
CREATE TABLE IF NOT EXISTS content_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES content_folders(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    type TEXT DEFAULT 'custom',
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Files Table
CREATE TABLE IF NOT EXISTS content_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    folder_id UUID REFERENCES content_folders(id) ON DELETE SET NULL,
    folder_path TEXT,
    category TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0,
    used_in_courses TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    shareable_link TEXT,
    share_expiry TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Categories Table
CREATE TABLE IF NOT EXISTS content_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content File Shares Table
CREATE TABLE IF NOT EXISTS content_file_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES content_files(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    max_downloads INTEGER,
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_folders_parent_id ON content_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_files_folder_id ON content_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_content_files_type ON content_files(type);
CREATE INDEX IF NOT EXISTS idx_content_files_category ON content_files(category);
CREATE INDEX IF NOT EXISTS idx_content_files_uploaded_by ON content_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_content_files_archived ON content_files(is_archived);
CREATE INDEX IF NOT EXISTS idx_content_files_tags ON content_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_file_shares_file_id ON content_file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_content_file_shares_token ON content_file_shares(share_token);

-- Insert default categories
INSERT INTO content_categories (name, slug, description, icon, color, display_order) VALUES
    ('Hero Banners', 'hero-banner', 'Large banners for homepage', 'image', 'blue', 1),
    ('Mini Banners', 'mini-banner', 'Small promotional banners', 'image', 'purple', 2),
    ('Testimonials', 'testimonial', 'Student and parent testimonials', 'users', 'green', 3),
    ('Brochures', 'brochure', 'PDF brochures and documents', 'file-text', 'orange', 4),
    ('Platform Features', 'platform-feature', 'Feature showcase media', 'star', 'yellow', 5),
    ('Course Content', 'course-content', 'Course materials', 'book-open', 'indigo', 6),
    ('General', 'general', 'General purpose files', 'folder', 'gray', 7)
ON CONFLICT (slug) DO NOTHING;

-- Comments
COMMENT ON TABLE content_folders IS 'Folder structure for organizing content';
COMMENT ON TABLE content_files IS 'Uploaded media files';
COMMENT ON TABLE content_categories IS 'Categories for organizing content';
COMMENT ON TABLE content_file_shares IS 'Shared file links with access control';
