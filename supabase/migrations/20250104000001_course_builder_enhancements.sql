-- ============================================================================
-- COURSE BUILDER ENHANCEMENTS
-- Version: 1.0.0
-- Description: Add new fields for enhanced course information
-- Date: 2025-01-04
-- ============================================================================

-- Add new columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS age_groups TEXT[],
ADD COLUMN IF NOT EXISTS student_types TEXT[],
ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS outcomes TEXT[];

-- Add constraints for new fields
ALTER TABLE courses
ADD CONSTRAINT check_subtitle_length CHECK (
  subtitle IS NULL OR (char_length(subtitle) >= 10 AND char_length(subtitle) <= 150)
);

ALTER TABLE courses
ADD CONSTRAINT check_language_valid CHECK (
  language IN ('English', 'Urdu', 'Arabic', 'Hindi', 'Other') OR language IS NULL
);

ALTER TABLE courses
ADD CONSTRAINT check_age_groups_valid CHECK (
  age_groups IS NULL OR 
  age_groups <@ ARRAY['3-5 years', '6-8 years', '9-12 years', '13-15 years', '16-18 years', 'Adults']::TEXT[]
);

ALTER TABLE courses
ADD CONSTRAINT check_student_types_valid CHECK (
  student_types IS NULL OR 
  student_types <@ ARRAY['online_school', 'spoken_english', 'tuition']::TEXT[]
);

-- Create course_categories table
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_categories_active ON course_categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_course_categories_slug ON course_categories(slug);
CREATE INDEX IF NOT EXISTS idx_courses_language ON courses(language);
CREATE INDEX IF NOT EXISTS idx_courses_age_groups ON courses USING GIN(age_groups);
CREATE INDEX IF NOT EXISTS idx_courses_student_types ON courses USING GIN(student_types);
CREATE INDEX IF NOT EXISTS idx_courses_highlights ON courses USING GIN(highlights);

-- Create trigger for updated_at on course_categories
CREATE OR REPLACE FUNCTION update_course_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_categories_updated_at
  BEFORE UPDATE ON course_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_course_categories_updated_at();

-- Seed initial categories from existing course data
INSERT INTO course_categories (name, slug, description, color, display_order, is_active)
SELECT DISTINCT
  CASE 
    WHEN category::TEXT = 'online_school' THEN 'Online School'
    WHEN category::TEXT = 'spoken_english' THEN 'Spoken English'
    WHEN category::TEXT = 'tuition' THEN 'Tuition'
    ELSE INITCAP(REPLACE(category::TEXT, '_', ' '))
  END as name,
  category::TEXT as slug,
  CASE 
    WHEN category::TEXT = 'online_school' THEN 'Comprehensive online school curriculum'
    WHEN category::TEXT = 'spoken_english' THEN 'English language learning courses'
    WHEN category::TEXT = 'tuition' THEN 'Personalized tutoring sessions'
    ELSE 'Course category'
  END as description,
  CASE 
    WHEN category::TEXT = 'online_school' THEN '#3B82F6'
    WHEN category::TEXT = 'spoken_english' THEN '#10B981'
    WHEN category::TEXT = 'tuition' THEN '#F59E0B'
    ELSE '#6B7280'
  END as color,
  ROW_NUMBER() OVER (ORDER BY category::TEXT) as display_order,
  TRUE as is_active
FROM courses
WHERE category IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- Set default values for existing courses
UPDATE courses 
SET 
  language = 'English',
  age_groups = ARRAY[]::TEXT[],
  student_types = ARRAY[]::TEXT[],
  highlights = '[]'::jsonb,
  outcomes = ARRAY[]::TEXT[]
WHERE language IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN courses.subtitle IS 'Short tagline for the course (10-150 characters)';
COMMENT ON COLUMN courses.language IS 'Primary language of instruction';
COMMENT ON COLUMN courses.age_groups IS 'Target age ranges for the course';
COMMENT ON COLUMN courses.student_types IS 'Types of students this course targets';
COMMENT ON COLUMN courses.highlights IS 'Key features/benefits as JSON array with text and optional icon';
COMMENT ON COLUMN courses.outcomes IS 'Skills students will gain upon completion';
COMMENT ON TABLE course_categories IS 'Dynamic course categories with metadata';

-- Grant permissions (adjust based on your RLS policies)
-- These are examples - adjust according to your security requirements
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active categories
CREATE POLICY "Allow authenticated users to read active categories"
  ON course_categories
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Allow admins to manage categories
CREATE POLICY "Allow admins to manage categories"
  ON course_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Migration complete
-- Version: 1.0.0
-- Date: 2025-01-04
