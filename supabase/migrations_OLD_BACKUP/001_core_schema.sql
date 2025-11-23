-- ============================================================================
-- CORE SCHEMA MIGRATION
-- Description: Core tables for users, teachers, students, and parents
-- Version: 1.0
-- Created: 2025-11-23
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'parent');
CREATE TYPE student_type AS ENUM ('online_school', 'spoken_english');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    
    -- Personal Information
    full_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    gender gender_type,
    profile_pic TEXT,
    
    -- Contact Information
    mobile TEXT,
    whatsapp TEXT,
    
    -- Address Information
    country TEXT,
    state TEXT,
    city TEXT,
    address TEXT,
    postal_code TEXT,
    
    -- Identification
    id_card_type TEXT,
    id_card_url TEXT,
    
    -- Account Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    account_status TEXT DEFAULT 'pending_verification' 
        CHECK (account_status IN ('pending_verification', 'pending_review', 'active', 'suspended', 'rejected')),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    verification_requested_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEACHERS TABLE
-- ============================================================================

CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Professional Information
    qualifications TEXT,
    field_of_study TEXT,
    experience_years INTEGER DEFAULT 0,
    subjects TEXT[],
    bio TEXT,
    resume_url TEXT,
    
    -- Approval Status
    is_approved BOOLEAN DEFAULT FALSE,
    approval_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PARENTS TABLE
-- ============================================================================

CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Parent Information
    relationship TEXT,
    occupation TEXT,
    linked_students UUID[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDENTS TABLE
-- ============================================================================

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Student Information
    student_type student_type NOT NULL DEFAULT 'online_school',
    previous_school TEXT,
    grade_level TEXT,
    academic_year TEXT,
    english_level TEXT,
    purpose TEXT,
    learning_schedule TEXT,
    
    -- Parent Link
    parent_id UUID REFERENCES parents(id),
    
    -- Enrollment
    enrollment_date DATE DEFAULT CURRENT_DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VERIFICATION HISTORY TABLE
-- ============================================================================

CREATE TABLE verification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('requested', 'approved', 'rejected', 'email_verified')),
    performed_by UUID REFERENCES users(id),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Teachers indexes
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_is_approved ON teachers(is_approved);
CREATE INDEX idx_teachers_subjects ON teachers USING GIN(subjects);

-- Students indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_students_student_type ON students(student_type);
CREATE INDEX idx_students_grade_level ON students(grade_level);

-- Parents indexes
CREATE INDEX idx_parents_user_id ON parents(user_id);
CREATE INDEX idx_parents_linked_students ON parents USING GIN(linked_students);

-- Verification history indexes
CREATE INDEX idx_verification_history_user_id ON verification_history(user_id);
CREATE INDEX idx_verification_history_action ON verification_history(action);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Teachers policies
CREATE POLICY "Teachers can view their own profile" ON teachers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can update their own profile" ON teachers
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all teachers" ON teachers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Students policies
CREATE POLICY "Students can view their own profile" ON students
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can update their own profile" ON students
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Parents can view their linked students" ON students
    FOR SELECT USING (
        parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all students" ON students
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Parents policies
CREATE POLICY "Parents can view their own profile" ON parents
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Parents can update their own profile" ON parents
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all parents" ON parents
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Verification history policies
CREATE POLICY "Users can view their own verification history" ON verification_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all verification history" ON verification_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can insert verification history" ON verification_history
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Core user table extending Supabase auth.users';
COMMENT ON TABLE teachers IS 'Teacher-specific profile information';
COMMENT ON TABLE students IS 'Student-specific profile information';
COMMENT ON TABLE parents IS 'Parent-specific profile information';
COMMENT ON TABLE verification_history IS 'Audit trail for user verification actions';

COMMENT ON COLUMN users.account_status IS 'Current account verification status';
COMMENT ON COLUMN users.verification_requested_at IS 'When verification was first requested';
COMMENT ON COLUMN teachers.is_approved IS 'Whether teacher has been approved by admin';
COMMENT ON COLUMN students.student_type IS 'Type of student program (online_school or spoken_english)';
COMMENT ON COLUMN parents.linked_students IS 'Array of student IDs linked to this parent';

