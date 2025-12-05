-- Course Visibility and SEO Enhancements Migration
-- This migration adds comprehensive visibility controls and SEO optimization features

-- ============================================================================
-- 1. ADD VISIBILITY AND STATUS COLUMNS TO COURSES TABLE
-- ============================================================================

-- Add status column with enum-like constraint
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE courses ADD CONSTRAINT courses_status_check 
  CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'scheduled', 'hidden', 'archived', 'deprecated'));

-- Add scheduling and visibility columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'everyone';
ALTER TABLE courses ADD CONSTRAINT courses_visibility_check 
  CHECK (visibility IN ('everyone', 'logged_in', 'specific_roles', 'specific_grades', 'invite_only'));

-- Add access control columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS allowed_roles TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS allowed_grades TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_codes TEXT[];

-- Add geography restrictions
ALTER TABLE courses ADD COLUMN IF NOT EXISTS allowed_countries TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS excluded_countries TEXT[];

-- Add time-based visibility
ALTER TABLE courses ADD COLUMN IF NOT EXISTS visible_from DATE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS visible_until DATE;

-- Add featured flag
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT 0;

-- ============================================================================
-- 2. ADD SEO OPTIMIZATION COLUMNS
-- ============================================================================

-- Basic SEO fields
ALTER TABLE courses ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];

-- URL slug (must be unique)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS url_slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_url_slug ON courses(url_slug) WHERE url_slug IS NOT NULL;

-- Open Graph tags for social media
ALTER TABLE courses ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Twitter card support
ALTER TABLE courses ADD COLUMN IF NOT EXISTS twitter_card_type TEXT DEFAULT 'summary_large_image';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS twitter_title TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS twitter_description TEXT;

-- Canonical URL and robots meta
ALTER TABLE courses ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS robots_meta TEXT DEFAULT 'index,follow';

-- ============================================================================
-- 3. ADD DISCOVERY AND LABELING COLUMNS
-- ============================================================================

-- Tags and categories
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subcategories TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS custom_labels TEXT[];

-- SEO metrics
ALTER TABLE courses ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS last_indexed_at TIMESTAMPTZ;

-- Popularity metrics
ALTER TABLE courses ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;

-- Course replacement (for deprecated courses)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS replaced_by_course_id UUID REFERENCES courses(id) ON DELETE SET NULL;

-- Approval workflow
ALTER TABLE courses ADD COLUMN IF NOT EXISTS submitted_for_approval_at TIMESTAMPTZ;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- ============================================================================
-- 4. CREATE COURSE LABELS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label_name TEXT NOT NULL UNIQUE,
  label_slug TEXT NOT NULL UNIQUE,
  label_color TEXT DEFAULT '#3B82F6',
  label_icon TEXT,
  label_description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default labels
INSERT INTO course_labels (label_name, label_slug, label_color, label_icon, display_order) VALUES
  ('Featured', 'featured', '#F59E0B', 'star', 1),
  ('New', 'new', '#10B981', 'sparkles', 2),
  ('Bestseller', 'bestseller', '#EF4444', 'fire', 3),
  ('Hot', 'hot', '#F97316', 'trending-up', 4),
  ('Limited Seats', 'limited-seats', '#DC2626', 'users', 5),
  ('Closing Soon', 'closing-soon', '#B91C1C', 'clock', 6),
  ('Early Bird', 'early-bird', '#8B5CF6', 'zap', 7),
  ('Certificate Included', 'certificate', '#06B6D4', 'award', 8),
  ('Free Resources', 'free-resources', '#14B8A6', 'gift', 9),
  ('Lifetime Access', 'lifetime-access', '#6366F1', 'infinity', 10)
ON CONFLICT (label_slug) DO NOTHING;

-- ============================================================================
-- 5. CREATE COURSE VIEWS TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country_code TEXT,
  device_type TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_views_course_id ON course_views(course_id);
CREATE INDEX IF NOT EXISTS idx_course_views_date ON course_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_course_views_user_id ON course_views(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- 6. CREATE SEO AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_seo_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  seo_score INTEGER NOT NULL,
  issues JSONB DEFAULT '[]',
  suggestions JSONB DEFAULT '[]',
  meta_data JSONB DEFAULT '{}',
  audited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_seo_audits_course_id ON course_seo_audits(course_id);
CREATE INDEX IF NOT EXISTS idx_course_seo_audits_date ON course_seo_audits(audited_at);

-- ============================================================================
-- 7. CREATE FUNCTIONS
-- ============================================================================

-- Function to auto-generate URL slug from title
CREATE OR REPLACE FUNCTION generate_course_slug(course_title TEXT, course_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to slug format
  base_slug := lower(regexp_replace(course_title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Limit length
  base_slug := substring(base_slug from 1 for 100);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (
    SELECT 1 FROM courses 
    WHERE url_slug = final_slug 
    AND (course_id IS NULL OR id != course_id)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to update course view count
CREATE OR REPLACE FUNCTION increment_course_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses 
  SET view_count = view_count + 1
  WHERE id = NEW.course_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-publish scheduled courses
CREATE OR REPLACE FUNCTION auto_publish_scheduled_courses()
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET status = 'published',
      published_at = NOW()
  WHERE status = 'scheduled'
    AND scheduled_publish_at IS NOT NULL
    AND scheduled_publish_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to mark new courses
CREATE OR REPLACE FUNCTION is_course_new(created_date TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN created_date >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate SEO score
CREATE OR REPLACE FUNCTION calculate_course_seo_score(course_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  course_record RECORD;
BEGIN
  SELECT * INTO course_record FROM courses WHERE id = course_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Title (20 points)
  IF course_record.title IS NOT NULL AND length(course_record.title) BETWEEN 30 AND 60 THEN
    score := score + 20;
  ELSIF course_record.title IS NOT NULL AND length(course_record.title) > 0 THEN
    score := score + 10;
  END IF;
  
  -- Meta title (10 points)
  IF course_record.meta_title IS NOT NULL AND length(course_record.meta_title) BETWEEN 50 AND 60 THEN
    score := score + 10;
  ELSIF course_record.meta_title IS NOT NULL THEN
    score := score + 5;
  END IF;
  
  -- Description (15 points)
  IF course_record.description IS NOT NULL AND length(course_record.description) BETWEEN 120 AND 160 THEN
    score := score + 15;
  ELSIF course_record.description IS NOT NULL AND length(course_record.description) > 50 THEN
    score := score + 8;
  END IF;
  
  -- Meta description (10 points)
  IF course_record.meta_description IS NOT NULL AND length(course_record.meta_description) BETWEEN 120 AND 160 THEN
    score := score + 10;
  ELSIF course_record.meta_description IS NOT NULL THEN
    score := score + 5;
  END IF;
  
  -- URL slug (10 points)
  IF course_record.url_slug IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  -- Keywords (10 points)
  IF course_record.seo_keywords IS NOT NULL AND array_length(course_record.seo_keywords, 1) BETWEEN 3 AND 10 THEN
    score := score + 10;
  ELSIF course_record.seo_keywords IS NOT NULL AND array_length(course_record.seo_keywords, 1) > 0 THEN
    score := score + 5;
  END IF;
  
  -- Thumbnail (10 points)
  IF course_record.thumbnail IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  -- Open Graph tags (10 points)
  IF course_record.og_title IS NOT NULL AND course_record.og_description IS NOT NULL THEN
    score := score + 10;
  ELSIF course_record.og_title IS NOT NULL OR course_record.og_description IS NOT NULL THEN
    score := score + 5;
  END IF;
  
  -- Category (5 points)
  IF course_record.category IS NOT NULL THEN
    score := score + 5;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. CREATE TRIGGERS
-- ============================================================================

-- Trigger to increment view count
DROP TRIGGER IF EXISTS trigger_increment_course_views ON course_views;
CREATE TRIGGER trigger_increment_course_views
  AFTER INSERT ON course_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_course_views();

-- Trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION auto_generate_course_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.url_slug IS NULL OR NEW.url_slug = '' THEN
    NEW.url_slug := generate_course_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON courses;
CREATE TRIGGER trigger_auto_generate_slug
  BEFORE INSERT OR UPDATE OF title ON courses
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_course_slug();

-- Trigger to update SEO score
CREATE OR REPLACE FUNCTION update_course_seo_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.seo_score := calculate_course_seo_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_seo_score ON courses;
CREATE TRIGGER trigger_update_seo_score
  BEFORE INSERT OR UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_course_seo_score();

-- ============================================================================
-- 9. UPDATE RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view published courses" ON courses;
DROP POLICY IF EXISTS "Users can view courses based on visibility" ON courses;

-- Policy for viewing courses based on status and visibility
CREATE POLICY "Users can view courses based on visibility and status"
  ON courses FOR SELECT
  USING (
    -- Admins can see all courses
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
    OR
    -- Teachers can see their own courses in any status
    (
      created_by = auth.uid() 
      AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'teacher'
      )
    )
    OR
    -- Published courses with visibility rules
    (
      status = 'published'
      AND (
        -- Everyone can see if visibility is 'everyone'
        visibility = 'everyone'
        OR
        -- Logged-in users can see if visibility is 'logged_in'
        (visibility = 'logged_in' AND auth.uid() IS NOT NULL)
        OR
        -- Specific roles
        (
          visibility = 'specific_roles' 
          AND EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = ANY(allowed_roles)
          )
        )
      )
      -- Time-based visibility
      AND (visible_from IS NULL OR visible_from <= CURRENT_DATE)
      AND (visible_until IS NULL OR visible_until >= CURRENT_DATE)
    )
  );

-- Policy for course views
CREATE POLICY "Anyone can insert course views"
  ON course_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own course views"
  ON course_views FOR SELECT
  USING (user_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM users WHERE role IN ('admin', 'teacher')
  ));

-- Policy for course labels
CREATE POLICY "Anyone can view active course labels"
  ON course_labels FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage course labels"
  ON course_labels FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- ============================================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_visibility ON courses(visibility);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_courses_scheduled_publish ON courses(scheduled_publish_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_courses_visible_dates ON courses(visible_from, visible_until);
CREATE INDEX IF NOT EXISTS idx_courses_seo_score ON courses(seo_score DESC);
CREATE INDEX IF NOT EXISTS idx_courses_view_count ON courses(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_courses_trending ON courses(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_courses_keywords ON courses USING GIN(seo_keywords);

-- ============================================================================
-- 11. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN courses.status IS 'Course publication status: draft, pending_approval, approved, published, scheduled, hidden, archived, deprecated';
COMMENT ON COLUMN courses.visibility IS 'Who can see this course: everyone, logged_in, specific_roles, specific_grades, invite_only';
COMMENT ON COLUMN courses.url_slug IS 'SEO-friendly URL slug, auto-generated from title';
COMMENT ON COLUMN courses.seo_score IS 'Auto-calculated SEO quality score (0-100)';
COMMENT ON COLUMN courses.is_featured IS 'Whether course is featured on homepage';
COMMENT ON COLUMN courses.replaced_by_course_id IS 'For deprecated courses, points to the replacement course';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
