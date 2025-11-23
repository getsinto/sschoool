-- ============================================================================
-- ASSESSMENTS TABLES - Quizzes and Assignments
-- Version: 1.0.0
-- Description: Quizzes, questions, attempts, assignments, submissions
-- ============================================================================

-- Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    passing_score DECIMAL(5,2) DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    allow_retake BOOLEAN DEFAULT TRUE,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    order_index INTEGER NOT NULL,
    UNIQUE(quiz_id, order_index)
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    attempt_number INTEGER NOT NULL,
    time_taken_seconds INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    instructions TEXT,
    due_date TIMESTAMPTZ,
    max_points INTEGER DEFAULT 100,
    submission_type submission_type DEFAULT 'both',
    allowed_file_types TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_file_url TEXT,
    submission_text TEXT,
    grade INTEGER,
    teacher_feedback TEXT,
    status submission_status DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    UNIQUE(assignment_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);

-- Comments
COMMENT ON TABLE quizzes IS 'Quiz assessments for lessons';
COMMENT ON TABLE quiz_questions IS 'Questions within quizzes';
COMMENT ON TABLE quiz_attempts IS 'Student quiz attempt records';
COMMENT ON TABLE assignments IS 'Assignment tasks for students';
COMMENT ON TABLE assignment_submissions IS 'Student assignment submissions';
