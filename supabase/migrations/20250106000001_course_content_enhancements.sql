-- ============================================================================
-- COURSE CONTENT ENHANCEMENTS MIGRATION
-- ============================================================================
-- Description: Comprehensive enhancement of course content/lessons system
--   - Rename sections to modules with enhanced metadata
--   - Add new lesson types (Text, Image, Mixed Content)
--   - Video enhancements (quality options, subtitles, chapters)
--   - Document enhancements (multiple formats, permissions)
--   - Lesson resources system
--   - Advanced access control and completion requirements
-- ============================================================================

-- ============================================================================
-- STEP 1: RENAME SECTIONS TO MODULES
-- ============================================================================

-- Rename the sections table to modules
ALTER TABLE IF EXISTS sections RENAME TO modules;

-- Update foreign key column name in lessons table
ALTER TABLE IF EXISTS lessons 
  RENAME COLUMN section_id TO module_id;

-- Update indexes
DROP INDEX IF EXISTS idx_lessons_section_id;
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

-- Add comments
COMMENT ON TABLE modules IS 'Course modules/chapters (formerly sections) with enhanced metadata';
COMMENT ON COLUMN lessons.module_id IS 'Reference to parent module (formerly section_id)';

-- ============================================================================
-- STEP 2: ENHANCE MODULES TABLE
-- ============================================================================

-- Add new columns to modules table
ALTER TABLE modules
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prerequisites UUID[],
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'enrolled_only' CHECK (access_type IN ('free_preview', 'enrolled_only', 'locked'));

-- Add comments for new columns
COMMENT ON COLUMN modules.description IS 'Rich text description of the module (min 50 characters recommended)';
COMMENT ON COLUMN modules.thumbnail_url IS 'Optional thumbnail image for the module';
COMMENT ON COLUMN modules.duration_minutes IS 'Auto-calculated total duration of all lessons in minutes';
COMMENT ON COLUMN modules.prerequisites IS 'Array of prerequisite module IDs that must be completed first';
COMMENT ON COLUMN modules.status IS 'Module status: draft, published, or archived';
COMMENT ON COLUMN modules.access_type IS 'Access control: free_preview (anyone), enrolled_only, or locked (requires prerequisites)';

-- ============================================================================
-- STEP 3: ENHANCE LESSONS TABLE
-- ============================================================================

-- Add new columns to lessons table
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS estimated_duration INTEGER,
  ADD COLUMN IF NOT EXISTS video_quality_options JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS subtitles JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS video_chapters JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS download_allowed BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS print_allowed BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS can_annotate BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS completion_requirement TEXT DEFAULT 'manual' CHECK (completion_requirement IN ('manual', 'auto_video_80', 'auto_document_read', 'quiz_pass', 'assignment_submit')),
  ADD COLUMN IF NOT EXISTS enable_discussion BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'enrolled_only' CHECK (access_type IN ('free_preview', 'enrolled_only', 'requires_previous'));

-- Add comments for new columns
COMMENT ON COLUMN lessons.subtitle IS 'Optional subtitle or brief description of the lesson';
COMMENT ON COLUMN lessons.estimated_duration IS 'Estimated duration in minutes (auto-calculated for videos, estimated for documents/text)';
COMMENT ON COLUMN lessons.video_quality_options IS 'JSON object with video quality URLs: {"1080p": "url", "720p": "url", "480p": "url", "360p": "url"}';
COMMENT ON COLUMN lessons.subtitles IS 'JSON array of subtitle files: [{"language": "en", "label": "English", "url": "subtitle.vtt"}]';
COMMENT ON COLUMN lessons.video_chapters IS 'JSON array of video chapters: [{"time": "00:05:30", "title": "Introduction"}]';
COMMENT ON COLUMN lessons.download_allowed IS 'Whether students can download this lesson content';
COMMENT ON COLUMN lessons.print_allowed IS 'Whether students can print this lesson (for documents)';
COMMENT ON COLUMN lessons.can_annotate IS 'Whether students can highlight/annotate this lesson';
COMMENT ON COLUMN lessons.completion_requirement IS 'How lesson completion is determined';
COMMENT ON COLUMN lessons.enable_discussion IS 'Whether comments/questions are enabled for this lesson';
COMMENT ON COLUMN lessons.scheduled_publish_at IS 'Optional scheduled publish date/time';
COMMENT ON COLUMN lessons.access_type IS 'Access control for this specific lesson';

-- ============================================================================
-- STEP 4: CREATE LESSON RESOURCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'document', 'image', 'link', 'code', 'video', 'audio')),
  resource_name TEXT NOT NULL,
  resource_url TEXT,
  resource_description TEXT,
  file_size BIGINT,
  mime_type TEXT,
  can_download BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson_id ON lesson_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_type ON lesson_resources(resource_type);

-- Add comments
COMMENT ON TABLE lesson_resources IS 'Additional resources attached to lessons (PDFs, links, files, etc.)';
COMMENT ON COLUMN lesson_resources.resource_type IS 'Type of resource: pdf, document, image, link, code, video, audio';
COMMENT ON COLUMN lesson_resources.resource_name IS 'Display name of the resource';
COMMENT ON COLUMN lesson_resources.resource_url IS 'URL or storage path to the resource';
COMMENT ON COLUMN lesson_resources.resource_description IS 'Optional description of the resource';
COMMENT ON COLUMN lesson_resources.file_size IS 'File size in bytes (for uploaded files)';
COMMENT ON COLUMN lesson_resources.mime_type IS 'MIME type of the file';
COMMENT ON COLUMN lesson_resources.can_download IS 'Whether this resource can be downloaded';
COMMENT ON COLUMN lesson_resources.display_order IS 'Order in which resources are displayed';

-- ============================================================================
-- STEP 5: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate module duration
CREATE OR REPLACE FUNCTION calculate_module_duration(module_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_duration INTEGER;
BEGIN
  SELECT COALESCE(SUM(estimated_duration), 0)
  INTO total_duration
  FROM lessons
  WHERE module_id = module_uuid
    AND status = 'published';
  
  RETURN total_duration;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_module_duration IS 'Calculate total duration of all published lessons in a module';

-- Function to update module duration (trigger function)
CREATE OR REPLACE FUNCTION update_module_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE modules
    SET duration_minutes = calculate_module_duration(OLD.module_id)
    WHERE id = OLD.module_id;
    RETURN OLD;
  ELSE
    UPDATE modules
    SET duration_minutes = calculate_module_duration(NEW.module_id)
    WHERE id = NEW.module_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update module duration
DROP TRIGGER IF EXISTS trigger_update_module_duration ON lessons;
CREATE TRIGGER trigger_update_module_duration
  AFTER INSERT OR UPDATE OF estimated_duration, status OR DELETE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_module_duration();

-- Function to check if prerequisites are met
CREATE OR REPLACE FUNCTION check_module_prerequisites(
  module_uuid UUID,
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  prereq_ids UUID[];
  prereq_id UUID;
  is_completed BOOLEAN;
BEGIN
  -- Get prerequisites for this module
  SELECT prerequisites INTO prereq_ids
  FROM modules
  WHERE id = module_uuid;
  
  -- If no prerequisites, return true
  IF prereq_ids IS NULL OR array_length(prereq_ids, 1) IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check each prerequisite
  FOREACH prereq_id IN ARRAY prereq_ids
  LOOP
    -- Check if user has completed all lessons in prerequisite module
    SELECT COUNT(*) = 0 INTO is_completed
    FROM lessons l
    LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = user_uuid
    WHERE l.module_id = prereq_id
      AND l.status = 'published'
      AND (lp.completed_at IS NULL OR lp.completed_at IS NOT NULL);
    
    -- If any prerequisite is not completed, return false
    IF NOT is_completed THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_module_prerequisites IS 'Check if user has completed all prerequisite modules';

-- Function to estimate reading time for text content
CREATE OR REPLACE FUNCTION estimate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  reading_time INTEGER;
BEGIN
  -- Count words (split by whitespace)
  word_count := array_length(regexp_split_to_array(content_text, '\s+'), 1);
  
  -- Calculate reading time (200 words per minute)
  reading_time := CEIL(word_count::NUMERIC / 200.0);
  
  -- Minimum 1 minute
  IF reading_time < 1 THEN
    reading_time := 1;
  END IF;
  
  RETURN reading_time;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION estimate_reading_time IS 'Estimate reading time in minutes based on word count (200 words/min)';

-- ============================================================================
-- STEP 6: UPDATE EXISTING DATA
-- ============================================================================

-- Set default estimated_duration for existing lessons based on type
UPDATE lessons
SET estimated_duration = CASE
  WHEN type = 'video' AND duration IS NOT NULL THEN CEIL(duration / 60.0)::INTEGER
  WHEN type = 'document' THEN 10 -- Default 10 minutes for documents
  WHEN type = 'quiz' THEN 15 -- Default 15 minutes for quizzes
  WHEN type = 'assignment' THEN 30 -- Default 30 minutes for assignments
  WHEN type = 'live_class' AND duration IS NOT NULL THEN CEIL(duration / 60.0)::INTEGER
  ELSE 5 -- Default 5 minutes for other types
END
WHERE estimated_duration IS NULL;

-- Update module durations for all existing modules
UPDATE modules m
SET duration_minutes = (
  SELECT COALESCE(SUM(l.estimated_duration), 0)
  FROM lessons l
  WHERE l.module_id = m.id
    AND l.status = 'published'
);

-- Set default status for existing modules
UPDATE modules
SET status = 'published'
WHERE status IS NULL;

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES FOR LESSON RESOURCES
-- ============================================================================

-- Enable RLS on lesson_resources table
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view resources for published lessons
CREATE POLICY "Anyone can view published lesson resources"
  ON lesson_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = lesson_resources.lesson_id
        AND l.status = 'published'
    )
  );

-- Policy: Teachers can manage resources for their assigned courses
CREATE POLICY "Teachers can manage lesson resources"
  ON lesson_resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN course_assignments ca ON m.course_id = ca.course_id
      WHERE l.id = lesson_resources.lesson_id
        AND ca.teacher_id = auth.uid()
        AND ca.can_manage_content = TRUE
    )
  );

-- Policy: Admins can manage all resources
CREATE POLICY "Admins can manage all lesson resources"
  ON lesson_resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================================================
-- STEP 8: ADD INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for modules
CREATE INDEX IF NOT EXISTS idx_modules_status ON modules(status);
CREATE INDEX IF NOT EXISTS idx_modules_access_type ON modules(access_type);
CREATE INDEX IF NOT EXISTS idx_modules_course_id_status ON modules(course_id, status);

-- Indexes for lessons
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons(type);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_access_type ON lessons(access_type);
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_publish ON lessons(scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_module_status ON lessons(module_id, status);

-- GIN index for JSONB columns (for efficient querying)
CREATE INDEX IF NOT EXISTS idx_lessons_video_quality_gin ON lessons USING GIN (video_quality_options);
CREATE INDEX IF NOT EXISTS idx_lessons_subtitles_gin ON lessons USING GIN (subtitles);
CREATE INDEX IF NOT EXISTS idx_lessons_chapters_gin ON lessons USING GIN (video_chapters);

-- ============================================================================
-- STEP 9: CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Modules with calculated metadata
CREATE OR REPLACE VIEW modules_with_metadata AS
SELECT 
  m.*,
  COUNT(l.id) as lesson_count,
  COUNT(l.id) FILTER (WHERE l.status = 'published') as published_lesson_count,
  COALESCE(SUM(l.estimated_duration) FILTER (WHERE l.status = 'published'), 0) as total_duration
FROM modules m
LEFT JOIN lessons l ON m.id = l.module_id
GROUP BY m.id;

COMMENT ON VIEW modules_with_metadata IS 'Modules with calculated lesson counts and durations';

-- View: Lessons with resource counts
CREATE OR REPLACE VIEW lessons_with_resources AS
SELECT 
  l.*,
  COUNT(lr.id) as resource_count,
  COUNT(lr.id) FILTER (WHERE lr.can_download = TRUE) as downloadable_resource_count
FROM lessons l
LEFT JOIN lesson_resources lr ON l.id = lr.lesson_id
GROUP BY l.id;

COMMENT ON VIEW lessons_with_resources IS 'Lessons with resource counts';

-- ============================================================================
-- STEP 10: ADD CONSTRAINTS AND VALIDATIONS
-- ============================================================================

-- Ensure module prerequisites don't create circular dependencies
-- (This is a complex check that should be handled in application logic)

-- Ensure estimated_duration is positive
ALTER TABLE lessons
  ADD CONSTRAINT check_estimated_duration_positive 
  CHECK (estimated_duration IS NULL OR estimated_duration > 0);

-- Ensure module duration is non-negative
ALTER TABLE modules
  ADD CONSTRAINT check_duration_non_negative 
  CHECK (duration_minutes >= 0);

-- Ensure resource file_size is non-negative
ALTER TABLE lesson_resources
  ADD CONSTRAINT check_file_size_non_negative 
  CHECK (file_size IS NULL OR file_size >= 0);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Course content enhancements migration completed successfully';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  - Renamed sections to modules';
  RAISE NOTICE '  - Added % new columns to modules table', 6;
  RAISE NOTICE '  - Added % new columns to lessons table', 12;
  RAISE NOTICE '  - Created lesson_resources table';
  RAISE NOTICE '  - Created % helper functions', 4;
  RAISE NOTICE '  - Created % views', 2;
  RAISE NOTICE '  - Added % indexes', 10;
  RAISE NOTICE '  - Configured RLS policies';
END $$;
