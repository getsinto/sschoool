-- ============================================================================
-- COURSES TABLES - Course structure and curriculum
-- Version: 1.0.0
-- Description: Courses, sections, lessons, documents
-- ============================================================================

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category course_category NOT NULL,
    grade_level TEXT,
    subject TEXT,
    
    -- Media
    thumbnail_url TEXT,
    intro_video_url TEXT,
    
    -- Course Details
    learning_objectives TEXT[],
    duration_minutes INTEGER DEFAULT 0,
    difficulty difficulty_level,
    
    -- Pricing
    price DECIMAL(10,2) DEFAULT 0,
    payment_model payment_model DEFAULT 'one_time',
    enrollment_limit INTEGER,
    validity_days INTEGER DEFAULT 365,
    
    -- Visibility
    is_published BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    archived_by UUID REFERENCES users(id),
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    enrollments_count INTEGER DEFAULT 0,
    
    -- Ownership
    created_by UUID NOT NULL REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections Table
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    lesson_type lesson_type NOT NULL,
    
    -- Content
    content_url TEXT,
    embed_url TEXT,
    embed_platform TEXT,
    
    -- Settings
    duration_minutes INTEGER DEFAULT 0,
    is_free_preview BOOLEAN DEFAULT FALSE,
    allow_download BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, order_index)
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Visibility History
CREATE TABLE IF NOT EXISTS course_visibility_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('published', 'unpublished', 'hidden', 'visible', 'archived', 'unarchived')),
    performed_by UUID NOT NULL REFERENCES users(id),
    reason TEXT,
    previous_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published, is_visible, is_archived);
CREATE INDEX IF NOT EXISTS idx_sections_course_id ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_documents_lesson_id ON documents(lesson_id);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_courses_title_search ON courses USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_courses_description_search ON courses USING GIN(to_tsvector('english', COALESCE(description, '')));

-- Comments
COMMENT ON TABLE courses IS 'Course catalog and information';
COMMENT ON TABLE sections IS 'Course sections for organizing lessons';
COMMENT ON TABLE lessons IS 'Individual lessons within sections';
COMMENT ON TABLE documents IS 'Downloadable documents attached to lessons';
