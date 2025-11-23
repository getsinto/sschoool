-- ============================================================================
-- LIVE CLASSES TABLES - Live class scheduling and management
-- Version: 1.0.0
-- Description: Live classes, attendance, recordings
-- ============================================================================

-- Live Classes Table
CREATE TABLE IF NOT EXISTS live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    title TEXT NOT NULL,
    description TEXT,
    platform platform_type NOT NULL,
    meeting_url TEXT,
    meeting_id TEXT,
    meeting_password TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    recording_url TEXT,
    attendance_count INTEGER DEFAULT 0,
    status class_status DEFAULT 'scheduled',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class Attendance Table
CREATE TABLE IF NOT EXISTS class_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    was_present BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_live_classes_course_id ON live_classes(course_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_teacher_id ON live_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_scheduled_at ON live_classes(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes(status);
CREATE INDEX IF NOT EXISTS idx_class_attendance_class_id ON class_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_student_id ON class_attendance(student_id);

-- Comments
COMMENT ON TABLE live_classes IS 'Live class sessions';
COMMENT ON TABLE class_attendance IS 'Student attendance for live classes';
