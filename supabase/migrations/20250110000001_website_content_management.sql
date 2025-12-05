-- Website Content Management System Migration
-- Date: 2025-01-10
-- Description: Admin-only content management for global website content

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. BROCHURES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS brochures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  total_pages INTEGER,
  version TEXT,
  brochure_type TEXT CHECK (brochure_type IN ('online_school', 'spoken_english', 'tuition', 'general')),
  is_current BOOLEAN DEFAULT TRUE,
  allow_download BOOLEAN DEFAULT TRUE,
  require_email BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. TESTIMONIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_name TEXT NOT NULL,
  person_type TEXT NOT NULL CHECK (person_type IN ('parent', 'student')),
  person_photo_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  student_name TEXT,
  student_grade TEXT,
  course_program TEXT,
  video_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 3. PLATFORM FEATURES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS platform_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon_name TEXT, -- lucide icon name
  icon_url TEXT, -- or custom icon upload
  icon_color TEXT DEFAULT '#3B82F6',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  details TEXT,
  feature_image_url TEXT,
  category TEXT CHECK (category IN ('teaching', 'learning', 'platform', 'student_benefits', 'parent_benefits')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. WEBSITE CONTENT TABLE (Hero, About, Contact, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS website_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_key TEXT UNIQUE NOT NULL,
  content_value TEXT,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'image', 'video', 'json', 'url')),
  section TEXT, -- 'hero', 'about', 'contact', 'faq', etc.
  metadata JSONB, -- additional settings
  last_updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. FAQS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT CHECK (category IN ('admissions', 'courses', 'payments', 'technical', 'general')),
  display_order INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. HOMEPAGE SECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_name TEXT UNIQUE NOT NULL,
  section_title TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  settings JSONB, -- section-specific settings (background, padding, etc.)
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. BROCHURE DOWNLOADS TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS brochure_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brochure_id UUID REFERENCES brochures(id) ON DELETE CASCADE,
  user_email TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. TEAM MEMBERS TABLE (For About Us section)
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  email TEXT,
  social_links JSONB, -- {facebook, twitter, linkedin, etc.}
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Brochures indexes
CREATE INDEX idx_brochures_type ON brochures(brochure_type);
CREATE INDEX idx_brochures_active ON brochures(is_active);
CREATE INDEX idx_brochures_current ON brochures(is_current);

-- Testimonials indexes
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX idx_testimonials_order ON testimonials(display_order);
CREATE INDEX idx_testimonials_type ON testimonials(person_type);

-- Platform features indexes
CREATE INDEX idx_features_category ON platform_features(category);
CREATE INDEX idx_features_active ON platform_features(is_active);
CREATE INDEX idx_features_order ON platform_features(display_order);

-- Website content indexes
CREATE INDEX idx_content_section ON website_content(section);
CREATE INDEX idx_content_key ON website_content(content_key);

-- FAQs indexes
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_active ON faqs(is_active);
CREATE INDEX idx_faqs_order ON faqs(display_order);

-- Homepage sections indexes
CREATE INDEX idx_homepage_sections_order ON homepage_sections(display_order);
CREATE INDEX idx_homepage_sections_enabled ON homepage_sections(is_enabled);

-- Brochure downloads indexes
CREATE INDEX idx_downloads_brochure ON brochure_downloads(brochure_id);
CREATE INDEX idx_downloads_date ON brochure_downloads(downloaded_at);

-- Team members indexes
CREATE INDEX idx_team_active ON team_members(is_active);
CREATE INDEX idx_team_order ON team_members(display_order);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE brochures ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE brochure_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Brochures policies
CREATE POLICY "Public can view active brochures" ON brochures
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage brochures" ON brochures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Testimonials policies
CREATE POLICY "Public can view active testimonials" ON testimonials
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Platform features policies
CREATE POLICY "Public can view active features" ON platform_features
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage features" ON platform_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Website content policies
CREATE POLICY "Public can view website content" ON website_content
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage website content" ON website_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- FAQs policies
CREATE POLICY "Public can view active FAQs" ON faqs
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage FAQs" ON faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Homepage sections policies
CREATE POLICY "Public can view enabled sections" ON homepage_sections
  FOR SELECT USING (is_enabled = TRUE);

CREATE POLICY "Admins can manage sections" ON homepage_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Brochure downloads policies
CREATE POLICY "Users can view their own downloads" ON brochure_downloads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert downloads" ON brochure_downloads
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all downloads" ON brochure_downloads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Team members policies
CREATE POLICY "Public can view active team members" ON team_members
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to increment brochure download count
CREATE OR REPLACE FUNCTION increment_brochure_downloads()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE brochures
  SET download_count = download_count + 1
  WHERE id = NEW.brochure_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for brochure downloads
CREATE TRIGGER trigger_increment_downloads
AFTER INSERT ON brochure_downloads
FOR EACH ROW
EXECUTE FUNCTION increment_brochure_downloads();

-- Function to increment FAQ views
CREATE OR REPLACE FUNCTION increment_faq_views(faq_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE faqs
  SET views_count = views_count + 1
  WHERE id = faq_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_brochures_updated_at BEFORE UPDATE ON brochures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON platform_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON website_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default homepage sections
INSERT INTO homepage_sections (section_name, section_title, is_enabled, display_order, settings) VALUES
  ('hero', 'Hero Section', TRUE, 1, '{"background": "gradient", "height": "large"}'),
  ('features', 'Platform Features', TRUE, 2, '{"columns": 3, "background": "white"}'),
  ('courses', 'Our Courses', TRUE, 3, '{"limit": 6, "background": "gray"}'),
  ('teachers', 'Our Teachers', TRUE, 4, '{"limit": 6, "background": "white"}'),
  ('testimonials', 'What Parents Say', TRUE, 5, '{"style": "carousel", "autoplay": true}'),
  ('brochure', 'Download Brochure', TRUE, 6, '{"background": "blue"}'),
  ('faq', 'Frequently Asked Questions', TRUE, 7, '{"columns": 1}'),
  ('cta', 'Get Started Today', TRUE, 8, '{"background": "gradient"}')
ON CONFLICT (section_name) DO NOTHING;

-- Insert default website content
INSERT INTO website_content (content_key, content_value, content_type, section) VALUES
  ('hero_heading', 'Discover Excellence at St Haroon Online School', 'text', 'hero'),
  ('hero_subheading', 'Quality education from the comfort of your home', 'text', 'hero'),
  ('hero_cta_text', 'Enroll Now', 'text', 'hero'),
  ('hero_cta_link', '/register', 'url', 'hero'),
  ('mission_statement', 'To provide world-class education accessible to everyone', 'text', 'about'),
  ('vision_statement', 'Empowering students globally through innovative online learning', 'text', 'about'),
  ('contact_email', 'info@stharoon.com', 'text', 'contact'),
  ('contact_phone', '+1234567890', 'text', 'contact'),
  ('contact_address', '123 Education Street, Learning City', 'text', 'contact')
ON CONFLICT (content_key) DO NOTHING;

-- Insert default FAQs
INSERT INTO faqs (question, answer, category, display_order, is_active) VALUES
  ('How do I enroll my child?', 'You can enroll by clicking the "Enroll Now" button and filling out the registration form.', 'admissions', 1, TRUE),
  ('What are the class timings?', 'Classes are scheduled flexibly based on your timezone and availability.', 'general', 2, TRUE),
  ('What payment methods do you accept?', 'We accept credit cards, debit cards, and online payment methods.', 'payments', 3, TRUE),
  ('Do you offer free trials?', 'Yes, we offer a 7-day free trial for all new students.', 'admissions', 4, TRUE),
  ('What if I face technical issues?', 'Our support team is available 24/7 to help with any technical issues.', 'technical', 5, TRUE)
ON CONFLICT DO NOTHING;

-- Insert default platform features
INSERT INTO platform_features (icon_name, icon_color, title, description, category, display_order, is_active) VALUES
  ('Video', '#3B82F6', 'Live Interactive Classes', 'Join live classes with expert teachers and interact in real-time', 'teaching', 1, TRUE),
  ('BookOpen', '#10B981', 'Comprehensive Curriculum', 'Access a complete curriculum aligned with international standards', 'learning', 2, TRUE),
  ('Users', '#8B5CF6', 'Expert Teachers', 'Learn from qualified and experienced educators', 'teaching', 3, TRUE),
  ('Award', '#F59E0B', 'Certificates', 'Earn recognized certificates upon course completion', 'student_benefits', 4, TRUE),
  ('Clock', '#EF4444', 'Flexible Schedule', 'Study at your own pace with flexible class timings', 'platform', 5, TRUE),
  ('Shield', '#06B6D4', 'Safe Learning Environment', 'Secure and monitored platform for student safety', 'parent_benefits', 6, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE brochures IS 'Stores school brochures for different programs';
COMMENT ON TABLE testimonials IS 'Stores parent and student testimonials';
COMMENT ON TABLE platform_features IS 'Stores platform features and benefits';
COMMENT ON TABLE website_content IS 'Stores dynamic website content (hero, about, contact, etc.)';
COMMENT ON TABLE faqs IS 'Stores frequently asked questions';
COMMENT ON TABLE homepage_sections IS 'Controls homepage section order and visibility';
COMMENT ON TABLE brochure_downloads IS 'Tracks brochure downloads for analytics';
COMMENT ON TABLE team_members IS 'Stores team member information for About Us section';
