-- ============================================================================
-- Course Materials & Resources System Migration
-- Version: 20250107000001
-- Description: Comprehensive materials management including worksheets,
--              enhanced PDFs, quizzes, assignments, and resources
-- ============================================================================

-- ============================================================================
-- 1. WORKSHEETS SYSTEM
-- ============================================================================

-- Worksheets table
CREATE TABLE IF NOT EXISTS worksheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Difficulty and timing
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  estimated_minutes INTEGER CHECK (estimated_minutes > 0),
  
  -- Files
  worksheet_file_url TEXT NOT NULL,
  worksheet_file_type TEXT, -- 'pdf', 'doc', 'docx', 'image'
  worksheet_file_size BIGINT,
  answer_key_url TEXT,
  answer_key_file_type TEXT,
  
  -- Settings
  requires_submission BOOLEAN DEFAULT FALSE,
  download_allowed BOOLEAN DEFAULT TRUE,
  print_allowed BOOLEAN DEFAULT TRUE,
  max_grade DECIMAL(5,2) DEFAULT 100,
  
  -- Organization
  display_order INTEGER DEFAULT 0,
  tags TEXT[],
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_file_url CHECK (worksheet_file_url IS NOT NULL AND worksheet_file_url != ''),
  CONSTRAINT valid_max_grade CHECK (max_grade > 0)
);

-- Worksheet submissions table
CREATE TABLE IF NOT EXISTS worksheet_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worksheet_id UUID NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Submission
  submission_file_url TEXT,
  submission_file_type TEXT,
  submission_file_size BIGINT,
  submission_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Grading
  grade DECIMAL(5,2),
  max_grade DECIMAL(5,2) DEFAULT 100,
  teacher_feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmit_requested', 'late')),
  
  -- Grading metadata
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Resubmission tracking
  resubmission_count INTEGER DEFAULT 0,
  is_late BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_student_worksheet UNIQUE(worksheet_id, student_id),
  CONSTRAINT valid_grade CHECK (grade IS NULL OR (grade >= 0 AND grade <= max_grade)),
  CONSTRAINT valid_status_transition CHECK (
    (status = 'submitted' AND grade IS NULL) OR
    (status = 'graded' AND grade IS NOT NULL) OR
    (status = 'resubmit_requested')
  )
);

-- ============================================================================
-- 2. COURSE RESOURCES LIBRARY
-- ============================================================================

-- Course resources table
CREATE TABLE IF NOT EXISTS course_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  
  -- Resource type and category
  resource_type TEXT NOT NULL CHECK (resource_type IN ('link', 'file', 'reference', 'tool', 'video', 'document')),
  resource_category TEXT CHECK (resource_category IN ('required', 'optional', 'supplementary', 'reference')),
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  
  -- Resource location
  resource_url TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  
  -- External resource metadata
  external_platform TEXT, -- 'youtube', 'github', 'google_drive', etc.
  thumbnail_url TEXT,
  
  -- Access control
  download_allowed BOOLEAN DEFAULT TRUE,
  requires_enrollment BOOLEAN DEFAULT TRUE,
  
  -- Organization
  display_order INTEGER DEFAULT 0,
  tags TEXT[],
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT has_url CHECK (resource_url IS NOT NULL OR file_url IS NOT NULL)
);

-- ============================================================================
-- 3. ENHANCED ASSIGNMENTS
-- ============================================================================

-- Check if assignments table exists and add new columns
DO $$ 
BEGIN
  -- Add assignment_type if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'assignment_type'
  ) THEN
    ALTER TABLE assignments ADD COLUMN assignment_type TEXT DEFAULT 'file' 
      CHECK (assignment_type IN ('file', 'text', 'video', 'audio', 'project', 'link'));
  END IF;

  -- Add rubric if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'rubric'
  ) THEN
    ALTER TABLE assignments ADD COLUMN rubric JSONB;
  END IF;

  -- Add peer review settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'enable_peer_review'
  ) THEN
    ALTER TABLE assignments ADD COLUMN enable_peer_review BOOLEAN DEFAULT FALSE;
    ALTER TABLE assignments ADD COLUMN peer_review_count INTEGER DEFAULT 2 CHECK (peer_review_count >= 1);
    ALTER TABLE assignments ADD COLUMN peer_review_deadline TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add group assignment settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'is_group_assignment'
  ) THEN
    ALTER TABLE assignments ADD COLUMN is_group_assignment BOOLEAN DEFAULT FALSE;
    ALTER TABLE assignments ADD COLUMN group_size INTEGER CHECK (group_size >= 2);
    ALTER TABLE assignments ADD COLUMN group_formation TEXT DEFAULT 'teacher' 
      CHECK (group_formation IN ('teacher', 'student', 'random'));
  END IF;

  -- Add late submission settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'allow_late_submission'
  ) THEN
    ALTER TABLE assignments ADD COLUMN allow_late_submission BOOLEAN DEFAULT TRUE;
    ALTER TABLE assignments ADD COLUMN late_penalty_percentage DECIMAL(5,2) DEFAULT 10 
      CHECK (late_penalty_percentage >= 0 AND late_penalty_percentage <= 100);
    ALTER TABLE assignments ADD COLUMN late_deadline TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add file requirements
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'allowed_file_types'
  ) THEN
    ALTER TABLE assignments ADD COLUMN allowed_file_types TEXT[];
    ALTER TABLE assignments ADD COLUMN max_file_size BIGINT DEFAULT 10485760; -- 10MB default
    ALTER TABLE assignments ADD COLUMN max_files INTEGER DEFAULT 5;
  END IF;
END $$;

-- Assignment groups table (for group assignments)
CREATE TABLE IF NOT EXISTS assignment_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  
  -- Group members
  member_ids UUID[] NOT NULL,
  group_leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Submission
  submission_id UUID,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_assignment_group_name UNIQUE(assignment_id, group_name)
);

-- Peer reviews table
CREATE TABLE IF NOT EXISTS peer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Review content
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  rubric_scores JSONB, -- Scores for each rubric criterion
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  is_anonymous BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_peer_review UNIQUE(submission_id, reviewer_id)
);

-- ============================================================================
-- 4. ENHANCED QUIZZES
-- ============================================================================

-- Check if quizzes table exists and add new columns
DO $$ 
BEGIN
  -- Add question bank mode
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quizzes' AND column_name = 'question_bank_mode'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN question_bank_mode BOOLEAN DEFAULT FALSE;
    ALTER TABLE quizzes ADD COLUMN questions_per_attempt INTEGER;
    ALTER TABLE quizzes ADD COLUMN randomize_questions BOOLEAN DEFAULT FALSE;
    ALTER TABLE quizzes ADD COLUMN randomize_options BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add negative marking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quizzes' AND column_name = 'enable_negative_marking'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN enable_negative_marking BOOLEAN DEFAULT FALSE;
    ALTER TABLE quizzes ADD COLUMN negative_marks_value DECIMAL(3,2) DEFAULT 0.25 
      CHECK (negative_marks_value >= 0 AND negative_marks_value <= 1);
  END IF;

  -- Add partial credit
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quizzes' AND column_name = 'enable_partial_credit'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN enable_partial_credit BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add timed sections
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quizzes' AND column_name = 'enable_timed_sections'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN enable_timed_sections BOOLEAN DEFAULT FALSE;
    ALTER TABLE quizzes ADD COLUMN sections JSONB; -- [{name, time_limit, question_ids}]
  END IF;
END $$;

-- Check if quiz_questions table exists and add new columns
DO $$ 
BEGIN
  -- Add question weight
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_questions' AND column_name = 'question_weight'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN question_weight DECIMAL(5,2) DEFAULT 1.0 
      CHECK (question_weight > 0);
  END IF;

  -- Add media support
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_questions' AND column_name = 'media_url'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN media_url TEXT;
    ALTER TABLE quiz_questions ADD COLUMN media_type TEXT 
      CHECK (media_type IN ('image', 'audio', 'video'));
  END IF;

  -- Add question subtype
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_questions' AND column_name = 'question_subtype'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN question_subtype TEXT DEFAULT 'standard'
      CHECK (question_subtype IN ('standard', 'image_based', 'audio', 'hotspot', 'matching', 'ordering', 'fill_blank'));
  END IF;

  -- Add additional data for complex question types
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_questions' AND column_name = 'additional_data'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN additional_data JSONB;
    -- For matching: {pairs: [{left, right}]}
    -- For ordering: {correct_order: [item1, item2, ...]}
    -- For hotspot: {image_url, hotspots: [{x, y, radius}]}
    -- For fill_blank: {blanks: [{position, correct_answers}]}
  END IF;
END $$;

-- Quiz analytics table
CREATE TABLE IF NOT EXISTS quiz_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  
  -- Analytics data
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  incorrect_attempts INTEGER DEFAULT 0,
  average_time_seconds DECIMAL(10,2),
  difficulty_score DECIMAL(3,2), -- 0-1, calculated from success rate
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_quiz_question_analytics UNIQUE(quiz_id, question_id)
);

-- ============================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Worksheets indexes
CREATE INDEX IF NOT EXISTS idx_worksheets_course_id ON worksheets(course_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_module_id ON worksheets(module_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_lesson_id ON worksheets(lesson_id);
CREATE INDEX IF NOT EXISTS idx_worksheets_created_by ON worksheets(created_by);
CREATE INDEX IF NOT EXISTS idx_worksheets_difficulty ON worksheets(difficulty_level);

-- Worksheet submissions indexes
CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_worksheet_id ON worksheet_submissions(worksheet_id);
CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_student_id ON worksheet_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_status ON worksheet_submissions(status);
CREATE INDEX IF NOT EXISTS idx_worksheet_submissions_graded_by ON worksheet_submissions(graded_by);

-- Course resources indexes
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_module_id ON course_resources(module_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_type ON course_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_course_resources_category ON course_resources(resource_category);

-- Assignment groups indexes
CREATE INDEX IF NOT EXISTS idx_assignment_groups_assignment_id ON assignment_groups(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_groups_leader ON assignment_groups(group_leader_id);

-- Peer reviews indexes
CREATE INDEX IF NOT EXISTS idx_peer_reviews_assignment_id ON peer_reviews(assignment_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_submission_id ON peer_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewer_id ON peer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_status ON peer_reviews(status);

-- Quiz analytics indexes
CREATE INDEX IF NOT EXISTS idx_quiz_analytics_quiz_id ON quiz_analytics(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_analytics_question_id ON quiz_analytics(question_id);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheet_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_analytics ENABLE ROW LEVEL SECURITY;

-- Worksheets policies
CREATE POLICY "Teachers can manage worksheets for their courses"
  ON worksheets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM course_assignments ca
      WHERE ca.course_id = worksheets.course_id
      AND ca.teacher_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = worksheets.course_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view worksheets for enrolled courses"
  ON worksheets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = worksheets.course_id
      AND e.student_id = auth.uid()
      AND e.status = 'active'
    )
  );

-- Worksheet submissions policies
CREATE POLICY "Students can manage their own submissions"
  ON worksheet_submissions FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view and grade submissions for their courses"
  ON worksheet_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM worksheets w
      JOIN course_assignments ca ON ca.course_id = w.course_id
      WHERE w.id = worksheet_submissions.worksheet_id
      AND ca.teacher_id = auth.uid()
    )
  );

-- Course resources policies
CREATE POLICY "Teachers can manage resources for their courses"
  ON course_resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM course_assignments ca
      WHERE ca.course_id = course_resources.course_id
      AND ca.teacher_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_resources.course_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view resources for enrolled courses"
  ON course_resources FOR SELECT
  USING (
    (NOT requires_enrollment) OR
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = course_resources.course_id
      AND e.student_id = auth.uid()
      AND e.status = 'active'
    )
  );

-- Assignment groups policies
CREATE POLICY "Group members can view their groups"
  ON assignment_groups FOR SELECT
  USING (auth.uid() = ANY(member_ids));

CREATE POLICY "Teachers can manage assignment groups"
  ON assignment_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN course_assignments ca ON ca.course_id = a.course_id
      WHERE a.id = assignment_groups.assignment_id
      AND ca.teacher_id = auth.uid()
    )
  );

-- Peer reviews policies
CREATE POLICY "Reviewers can manage their reviews"
  ON peer_reviews FOR ALL
  USING (reviewer_id = auth.uid());

CREATE POLICY "Students can view reviews of their submissions"
  ON peer_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignment_submissions asub
      WHERE asub.id = peer_reviews.submission_id
      AND asub.student_id = auth.uid()
    )
  );

-- Quiz analytics policies
CREATE POLICY "Teachers can view quiz analytics"
  ON quiz_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN course_assignments ca ON ca.course_id = q.course_id
      WHERE q.id = quiz_analytics.quiz_id
      AND ca.teacher_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update worksheet submission status
CREATE OR REPLACE FUNCTION update_worksheet_submission_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark as late if submitted after deadline
  IF NEW.submitted_at > (
    SELECT w.due_date FROM worksheets w WHERE w.id = NEW.worksheet_id
  ) THEN
    NEW.is_late := TRUE;
    NEW.status := 'late';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_worksheet_submission_status
  BEFORE INSERT OR UPDATE ON worksheet_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_worksheet_submission_status();

-- Function to update quiz analytics
CREATE OR REPLACE FUNCTION update_quiz_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics when a quiz attempt is completed
  INSERT INTO quiz_analytics (quiz_id, question_id, total_attempts, correct_attempts, incorrect_attempts)
  VALUES (NEW.quiz_id, NEW.question_id, 1, 
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CASE WHEN NOT NEW.is_correct THEN 1 ELSE 0 END
  )
  ON CONFLICT (quiz_id, question_id) 
  DO UPDATE SET
    total_attempts = quiz_analytics.total_attempts + 1,
    correct_attempts = quiz_analytics.correct_attempts + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    incorrect_attempts = quiz_analytics.incorrect_attempts + CASE WHEN NOT NEW.is_correct THEN 1 ELSE 0 END,
    difficulty_score = (quiz_analytics.correct_attempts::DECIMAL + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END) / 
                      (quiz_analytics.total_attempts + 1),
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would be added to quiz_attempts table if it exists
-- CREATE TRIGGER trigger_update_quiz_analytics
--   AFTER INSERT ON quiz_attempts
--   FOR EACH ROW
--   EXECUTE FUNCTION update_quiz_analytics();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER trigger_worksheets_updated_at
  BEFORE UPDATE ON worksheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_worksheet_submissions_updated_at
  BEFORE UPDATE ON worksheet_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_course_resources_updated_at
  BEFORE UPDATE ON course_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_assignment_groups_updated_at
  BEFORE UPDATE ON assignment_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. HELPER VIEWS
-- ============================================================================

-- View for worksheet statistics
CREATE OR REPLACE VIEW worksheet_statistics AS
SELECT 
  w.id as worksheet_id,
  w.course_id,
  w.title,
  COUNT(DISTINCT ws.student_id) as total_submissions,
  COUNT(DISTINCT CASE WHEN ws.status = 'graded' THEN ws.student_id END) as graded_submissions,
  AVG(CASE WHEN ws.status = 'graded' THEN ws.grade END) as average_grade,
  COUNT(DISTINCT CASE WHEN ws.is_late THEN ws.student_id END) as late_submissions
FROM worksheets w
LEFT JOIN worksheet_submissions ws ON ws.worksheet_id = w.id
GROUP BY w.id, w.course_id, w.title;

-- View for course resources summary
CREATE OR REPLACE VIEW course_resources_summary AS
SELECT 
  cr.course_id,
  cr.resource_type,
  cr.resource_category,
  COUNT(*) as resource_count,
  SUM(cr.file_size) as total_file_size
FROM course_resources cr
GROUP BY cr.course_id, cr.resource_type, cr.resource_category;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add comment to track migration
COMMENT ON TABLE worksheets IS 'Course Materials & Resources System - Worksheets (v20250107000001)';
COMMENT ON TABLE worksheet_submissions IS 'Course Materials & Resources System - Worksheet Submissions (v20250107000001)';
COMMENT ON TABLE course_resources IS 'Course Materials & Resources System - Resources Library (v20250107000001)';
COMMENT ON TABLE assignment_groups IS 'Course Materials & Resources System - Assignment Groups (v20250107000001)';
COMMENT ON TABLE peer_reviews IS 'Course Materials & Resources System - Peer Reviews (v20250107000001)';
COMMENT ON TABLE quiz_analytics IS 'Course Materials & Resources System - Quiz Analytics (v20250107000001)';
