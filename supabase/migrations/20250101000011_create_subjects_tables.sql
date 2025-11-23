-- ============================================================================
-- SUBJECTS TABLES - Teacher subject management
-- Version: 1.0.0
-- Description: Subjects, teacher subjects, custom subject requests
-- ============================================================================

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_custom BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher Subjects Junction Table
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER DEFAULT 0,
    certification_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, subject_id)
);

-- Custom Subject Requests Table
CREATE TABLE IF NOT EXISTS custom_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    justification TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_subject_id UUID REFERENCES subjects(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(is_active);
CREATE INDEX IF NOT EXISTS idx_subjects_category ON subjects(category);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_id ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject_id ON teacher_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_status ON teacher_subjects(status);
CREATE INDEX IF NOT EXISTS idx_custom_subject_requests_teacher_id ON custom_subject_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_custom_subject_requests_status ON custom_subject_requests(status);

-- Insert default subjects
INSERT INTO subjects (name, description, category, is_active, is_custom) VALUES
    ('Mathematics', 'Mathematics and related topics', 'STEM', true, false),
    ('Physics', 'Physics and physical sciences', 'STEM', true, false),
    ('Chemistry', 'Chemistry and chemical sciences', 'STEM', true, false),
    ('Biology', 'Biology and life sciences', 'STEM', true, false),
    ('English', 'English language and literature', 'Languages', true, false),
    ('Urdu', 'Urdu language and literature', 'Languages', true, false),
    ('Arabic', 'Arabic language and Islamic studies', 'Languages', true, false),
    ('Computer Science', 'Programming and computer science', 'STEM', true, false),
    ('History', 'History and social studies', 'Social Sciences', true, false),
    ('Geography', 'Geography and earth sciences', 'Social Sciences', true, false),
    ('Islamic Studies', 'Islamic education and Quran', 'Religious Studies', true, false),
    ('Spoken English', 'Conversational English skills', 'Languages', true, false),
    ('Business Studies', 'Business and economics', 'Commerce', true, false),
    ('Accounting', 'Accounting and finance', 'Commerce', true, false)
ON CONFLICT (name) DO NOTHING;

-- Comments
COMMENT ON TABLE subjects IS 'Master list of subjects';
COMMENT ON TABLE teacher_subjects IS 'Junction table linking teachers to subjects';
COMMENT ON TABLE custom_subject_requests IS 'Requests from teachers to add new subjects';
