-- ============================================================================
-- COURSE MEDIA ENHANCEMENTS MIGRATION
-- ============================================================================
-- Description: Adds comprehensive media support for courses including:
--   - Multiple banner sizes (desktop, mobile, card, featured)
--   - Enhanced promotional video fields
--   - Course media gallery table
--   - Demo/preview lessons support
-- ============================================================================

-- Add new media columns to courses table
ALTER TABLE courses 
  ADD COLUMN IF NOT EXISTS banner_desktop_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_mobile_url TEXT,
  ADD COLUMN IF NOT EXISTS card_banner_url TEXT,
  ADD COLUMN IF NOT EXISTS featured_banner_url TEXT,
  ADD COLUMN IF NOT EXISTS promo_video_url TEXT,
  ADD COLUMN IF NOT EXISTS promo_video_thumbnail TEXT,
  ADD COLUMN IF NOT EXISTS promo_video_title TEXT,
  ADD COLUMN IF NOT EXISTS promo_video_description TEXT,
  ADD COLUMN IF NOT EXISTS promo_video_duration INTEGER,
  ADD COLUMN IF NOT EXISTS promo_video_provider TEXT DEFAULT 'upload' CHECK (promo_video_provider IN ('upload', 'youtube', 'vimeo', 'wistia', 'google_drive'));

-- Add comments for documentation
COMMENT ON COLUMN courses.banner_desktop_url IS 'Desktop banner image URL (1920x600px recommended)';
COMMENT ON COLUMN courses.banner_mobile_url IS 'Mobile banner image URL (800x400px recommended)';
COMMENT ON COLUMN courses.card_banner_url IS 'Course card banner URL (400x250px recommended)';
COMMENT ON COLUMN courses.featured_banner_url IS 'Featured card banner URL (600x400px recommended)';
COMMENT ON COLUMN courses.promo_video_url IS 'Main promotional video URL or embed code';
COMMENT ON COLUMN courses.promo_video_thumbnail IS 'Custom thumbnail for promotional video';
COMMENT ON COLUMN courses.promo_video_title IS 'Promotional video title for SEO';
COMMENT ON COLUMN courses.promo_video_description IS 'Promotional video description for SEO';
COMMENT ON COLUMN courses.promo_video_duration IS 'Video duration in seconds';
COMMENT ON COLUMN courses.promo_video_provider IS 'Video hosting provider';

-- ============================================================================
-- CREATE COURSE MEDIA GALLERY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_media_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'demo_video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  caption TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT FALSE,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  CONSTRAINT valid_display_order CHECK (display_order >= 0),
  CONSTRAINT valid_duration CHECK (duration_seconds IS NULL OR duration_seconds > 0),
  CONSTRAINT valid_file_size CHECK (file_size_bytes IS NULL OR file_size_bytes > 0),
  CONSTRAINT valid_dimensions CHECK (
    (width IS NULL AND height IS NULL) OR 
    (width > 0 AND height > 0)
  )
);

-- Add comments
COMMENT ON TABLE course_media_gallery IS 'Stores additional media for courses (images, videos, demo lessons)';
COMMENT ON COLUMN course_media_gallery.media_type IS 'Type of media: image, video, or demo_video';
COMMENT ON COLUMN course_media_gallery.is_free_preview IS 'Whether this media is available as free preview';
COMMENT ON COLUMN course_media_gallery.display_order IS 'Order for displaying media (0-based)';
COMMENT ON COLUMN course_media_gallery.duration_seconds IS 'Duration for video content';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_media_course_id ON course_media_gallery(course_id);
CREATE INDEX IF NOT EXISTS idx_course_media_type ON course_media_gallery(media_type);
CREATE INDEX IF NOT EXISTS idx_course_media_free_preview ON course_media_gallery(is_free_preview) WHERE is_free_preview = TRUE;
CREATE INDEX IF NOT EXISTS idx_course_media_display_order ON course_media_gallery(course_id, display_order);

-- ============================================================================
-- CREATE UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_course_media_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_media_gallery_updated_at
  BEFORE UPDATE ON course_media_gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_course_media_gallery_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE course_media_gallery ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view media for published courses
CREATE POLICY "Anyone can view media for published courses"
  ON course_media_gallery
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_media_gallery.course_id
      AND courses.status = 'published'
    )
  );

-- Policy: Enrolled students can view all media for their courses
CREATE POLICY "Enrolled students can view course media"
  ON course_media_gallery
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = course_media_gallery.course_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Policy: Course creators can manage their course media
CREATE POLICY "Course creators can manage media"
  ON course_media_gallery
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_media_gallery.course_id
      AND courses.created_by = auth.uid()
    )
  );

-- Policy: Assigned teachers can manage course media
CREATE POLICY "Assigned teachers can manage media"
  ON course_media_gallery
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM course_assignments
      WHERE course_assignments.course_id = course_media_gallery.course_id
      AND course_assignments.teacher_id = auth.uid()
      AND course_assignments.can_manage_content = TRUE
    )
  );

-- Policy: Admins can manage all media
CREATE POLICY "Admins can manage all media"
  ON course_media_gallery
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.role_level >= 4
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get course media count
CREATE OR REPLACE FUNCTION get_course_media_count(p_course_id UUID)
RETURNS TABLE (
  total_media INTEGER,
  images INTEGER,
  videos INTEGER,
  demo_videos INTEGER,
  free_previews INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_media,
    COUNT(*) FILTER (WHERE media_type = 'image')::INTEGER AS images,
    COUNT(*) FILTER (WHERE media_type = 'video')::INTEGER AS videos,
    COUNT(*) FILTER (WHERE media_type = 'demo_video')::INTEGER AS demo_videos,
    COUNT(*) FILTER (WHERE is_free_preview = TRUE)::INTEGER AS free_previews
  FROM course_media_gallery
  WHERE course_id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reorder media items
CREATE OR REPLACE FUNCTION reorder_course_media(
  p_course_id UUID,
  p_media_ids UUID[]
)
RETURNS BOOLEAN AS $$
DECLARE
  v_index INTEGER := 0;
  v_media_id UUID;
BEGIN
  -- Validate that all media items belong to the course
  IF EXISTS (
    SELECT 1 FROM course_media_gallery
    WHERE id = ANY(p_media_ids)
    AND course_id != p_course_id
  ) THEN
    RAISE EXCEPTION 'Some media items do not belong to this course';
  END IF;

  -- Update display order
  FOREACH v_media_id IN ARRAY p_media_ids
  LOOP
    UPDATE course_media_gallery
    SET display_order = v_index
    WHERE id = v_media_id;
    
    v_index := v_index + 1;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get free preview media
CREATE OR REPLACE FUNCTION get_free_preview_media(p_course_id UUID)
RETURNS TABLE (
  id UUID,
  media_type TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  duration_seconds INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cmg.id,
    cmg.media_type,
    cmg.media_url,
    cmg.thumbnail_url,
    cmg.title,
    cmg.description,
    cmg.duration_seconds
  FROM course_media_gallery cmg
  WHERE cmg.course_id = p_course_id
  AND cmg.is_free_preview = TRUE
  ORDER BY cmg.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Note: Storage policies should be configured in Supabase dashboard or via API
-- Recommended bucket structure:
--   courses/
--     [course-id]/
--       thumbnail/
--       banners/
--       videos/
--       demos/
--       gallery/

-- ============================================================================
-- DATA MIGRATION (if needed)
-- ============================================================================

-- Migrate existing thumbnail_url to new structure (if applicable)
-- This is a placeholder - adjust based on your existing data structure

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT ON course_media_gallery TO authenticated;
GRANT ALL ON course_media_gallery TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_course_media_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reorder_course_media(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_free_preview_media(UUID) TO authenticated, anon;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify new columns exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_name = 'courses' 
          AND column_name IN ('banner_desktop_url', 'banner_mobile_url', 'card_banner_url')) = 3,
         'New banner columns not created';
  
  ASSERT (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_name = 'course_media_gallery') = 1,
         'course_media_gallery table not created';
  
  RAISE NOTICE 'Course media enhancements migration completed successfully';
END $$;
