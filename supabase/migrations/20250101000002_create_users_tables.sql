-- ============================================================================
-- USERS TABLES - Core user management
-- Version: 1.0.0
-- Description: Users, teachers, students, parents tables
-- ============================================================================

-- Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    
    -- Personal Information
    full_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    profile_pic TEXT,
    
    -- Contact Information
    mobile TEXT,
    whatsapp TEXT,
    
    -- Address
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
    account_status account_status_type DEFAULT 'pending_verification',
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

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Professional Information
    qualifications TEXT,
    field_of_study TEXT,
    experience_years INTEGER DEFAULT 0,
    subjects TEXT[],
    bio TEXT,
    resume_url TEXT,
    
    -- Approval
    is_approved BOOLEAN DEFAULT FALSE,
    approval_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    parent_id UUID,
    
    -- Enrollment
    enrollment_date DATE DEFAULT CURRENT_DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parents Table
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Parent Information
    relationship TEXT,
    occupation TEXT,
    linked_students UUID[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for parent_id after parents table is created
ALTER TABLE students ADD CONSTRAINT fk_students_parent 
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL;

-- Verification History Table
CREATE TABLE IF NOT EXISTS verification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('requested', 'approved', 'rejected', 'email_verified')),
    performed_by UUID REFERENCES users(id),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_user_id ON verification_history(user_id);

-- Comments
COMMENT ON TABLE users IS 'Core user table extending Supabase auth';
COMMENT ON TABLE teachers IS 'Teacher-specific profile information';
COMMENT ON TABLE students IS 'Student-specific profile information';
COMMENT ON TABLE parents IS 'Parent-specific profile information';
COMMENT ON TABLE verification_history IS 'Audit trail for user verification';
