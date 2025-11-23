-- Content Library System Migration
-- This migration creates tables for managing media files, folders, and categories

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content Folders Table
CREATE TABLE IF NOT EXISTS content_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES content_folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'custom', -- 'videos', 'documents', 'images', 'audio', 'custom'
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Files Table
CREATE TABLE IF NOT EXISTS content_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(500) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'video', 'document', 'image', 'audio'
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL, -- File size in bytes
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  folder_id UUID REFERENCES content_folders(id) ON DELETE SET NULL,
  folder_path TEXT,
  
  -- NEW: Categorization fields
  category VARCHAR(100), -- 'hero-banner', 'mini-banner', 'testimonial', 'brochure', 'platform-feature', 'course-content', 'general'
  tags TEXT[], -- Array of tags for better organization
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- duration, dimensions, pages, etc.
  
  -- Upload info
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Usage tracking
  usage_count INT DEFAULT 0,
  used_in_courses TEXT[], -- Array of course IDs
  
  -- Sharing
  is_public BOOLEAN DEFAULT false,
  shareable_link TEXT,
  share_expiry TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Categories Table (for managing available categories)
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Icon name for UI
  color VARCHAR(50), -- Color code for UI
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO content_categories (name, slug, description, icon, color, display_order, is_active) VALUES
  ('Hero Banners', 'hero-banner', 'Large banners for homepage hero sections', 'image', 'blue', 1, true),
  ('Mini Banners', 'mini-banner', 'Small banners for sections and promotions', 'image', 'purple', 2, true),
  ('Testimonials', 'testimonial', 'Happy parents and students photos/videos', 'users', 'green', 3, true),
  ('Brochures', 'brochure', 'PDF brochures and informational documents', 'file-text', 'orange', 4, true),
  ('Platform Features', 'platform-feature', 'Platform feature showcase media', 'star', 'yellow', 5, true),
  ('Course Content', 'course-content', 'Videos, documents, and materials for courses', 'book-open', 'indigo', 6, true),
  ('General', 'general', 'General purpose media files', 'folder', 'gray', 7, true)
ON CONFLICT (slug) DO NOTHING;

-- File Shares Table (for tracking shared links)
CREATE TABLE IF NOT EXISTS content_file_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES content_files(id) ON DELETE CASCADE,
  share_token VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT, -- Optional password protection
  max_downloads INT, -- Optional download limit
  download_count INT DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Usage Tracking Table
CREATE TABLE IF NOT EXISTS content_file_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES content_files(id) ON DELETE CASCADE,
  used_in_type VARCHAR(50) NOT NULL, -- 'course', 'lesson', 'assignment', 'landing_page', etc.
  used_in_id UUID NOT NULL,
  used_in_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_folders_parent_id ON content_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_folders_path ON content_folders(path);
CREATE INDEX IF NOT EXISTS idx_content_folders_type ON content_folders(type);

CREATE INDEX IF NOT EXISTS idx_content_files_folder_id ON content_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_content_files_type ON content_files(type);
CREATE INDEX IF NOT EXISTS idx_content_files_category ON content_files(category);
CREATE INDEX IF NOT EXISTS idx_content_files_uploaded_by ON content_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_content_files_is_archived ON content_files(is_archived);
CREATE INDEX IF NOT EXISTS idx_content_files_tags ON content_files USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_content_file_shares_file_id ON content_file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_content_file_shares_token ON content_file_shares(share_token);

CREATE INDEX IF NOT EXISTS idx_content_file_usage_file_id ON content_file_usage(file_id);
CREATE INDEX IF NOT EXISTS idx_content_file_usage_used_in ON content_file_usage(used_in_type, used_in_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_content_folders_updated_at ON content_folders;
CREATE TRIGGER update_content_folders_updated_at
    BEFORE UPDATE ON content_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_files_updated_at ON content_files;
CREATE TRIGGER update_content_files_updated_at
    BEFORE UPDATE ON content_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_categories_updated_at ON content_categories;
CREATE TRIGGER update_content_categories_updated_at
    BEFORE UPDATE ON content_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE content_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_file_usage ENABLE ROW LEVEL SECURITY;

-- Content Folders Policies
CREATE POLICY "Users can view all folders" ON content_folders
  FOR SELECT USING (true);

CREATE POLICY "Admins and teachers can create folders" ON content_folders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can update folders" ON content_folders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete folders" ON content_folders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Content Files Policies
CREATE POLICY "Users can view non-archived files" ON content_files
  FOR SELECT USING (is_archived = false OR uploaded_by = auth.uid());

CREATE POLICY "Admins and teachers can upload files" ON content_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can update files" ON content_files
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete files" ON content_files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Content Categories Policies
CREATE POLICY "Everyone can view active categories" ON content_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON content_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- File Shares Policies
CREATE POLICY "Users can view their own shares" ON content_file_shares
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create shares" ON content_file_shares
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own shares" ON content_file_shares
  FOR DELETE USING (created_by = auth.uid());

-- File Usage Policies
CREATE POLICY "Everyone can view file usage" ON content_file_usage
  FOR SELECT USING (true);

CREATE POLICY "System can track file usage" ON content_file_usage
  FOR INSERT WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE content_folders IS 'Stores folder structure for organizing content files';
COMMENT ON TABLE content_files IS 'Stores all uploaded media files with metadata and categorization';
COMMENT ON TABLE content_categories IS 'Defines available categories for organizing content';
COMMENT ON TABLE content_file_shares IS 'Tracks shared file links with expiration and access control';
COMMENT ON TABLE content_file_usage IS 'Tracks where files are being used across the platform';

COMMENT ON COLUMN content_files.category IS 'Category for organizing files (hero-banner, mini-banner, testimonial, brochure, platform-feature, course-content, general)';
COMMENT ON COLUMN content_files.tags IS 'Array of tags for flexible categorization and search';
COMMENT ON COLUMN content_files.metadata IS 'JSON object storing file-specific metadata (duration, dimensions, pages, etc.)';
COMMENT ON COLUMN content_files.used_in_courses IS 'Array of course IDs where this file is used';

-- Create a function to increment usage count
CREATE OR REPLACE FUNCTION increment_file_usage(file_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE content_files
  SET usage_count = usage_count + 1
  WHERE id = file_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get storage statistics
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
  total_files BIGINT,
  total_size BIGINT,
  videos_count BIGINT,
  videos_size BIGINT,
  documents_count BIGINT,
  documents_size BIGINT,
  images_count BIGINT,
  images_size BIGINT,
  audio_count BIGINT,
  audio_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_files,
    COALESCE(SUM(size), 0)::BIGINT as total_size,
    COUNT(*) FILTER (WHERE type = 'video')::BIGINT as videos_count,
    COALESCE(SUM(size) FILTER (WHERE type = 'video'), 0)::BIGINT as videos_size,
    COUNT(*) FILTER (WHERE type = 'document')::BIGINT as documents_count,
    COALESCE(SUM(size) FILTER (WHERE type = 'document'), 0)::BIGINT as documents_size,
    COUNT(*) FILTER (WHERE type = 'image')::BIGINT as images_count,
    COALESCE(SUM(size) FILTER (WHERE type = 'image'), 0)::BIGINT as images_size,
    COUNT(*) FILTER (WHERE type = 'audio')::BIGINT as audio_count,
    COALESCE(SUM(size) FILTER (WHERE type = 'audio'), 0)::BIGINT as audio_size
  FROM content_files
  WHERE is_archived = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
