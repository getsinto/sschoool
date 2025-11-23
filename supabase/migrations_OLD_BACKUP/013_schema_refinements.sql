-- Migration: Schema Refinements
-- Description: Fix minor discrepancies to match complete schema requirements
-- Created: 2024-11-12

-- 1. Fix Students table - Change learning_schedule from TEXT to TEXT[]
ALTER TABLE students 
ALTER COLUMN learning_schedule TYPE TEXT[] USING 
  CASE 
    WHEN learning_schedule IS NULL THEN NULL
    WHEN learning_schedule = '' THEN '{}'::TEXT[]
    ELSE ARRAY[learning_schedule]::TEXT[]
  END;

-- Set default for learning_schedule
ALTER TABLE students 
ALTER COLUMN learning_schedule SET DEFAULT '{}';

-- 2. Add CHECK constraint to Parents table for relationship field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'parents_relationship_check'
  ) THEN
    ALTER TABLE parents 
    ADD CONSTRAINT parents_relationship_check 
    CHECK (relationship IN ('father', 'mother', 'guardian', 'other'));
  END IF;
END $$;

-- 3. Change Quiz_Questions points from INTEGER to DECIMAL(5,2)
ALTER TABLE quiz_questions 
ALTER COLUMN points TYPE DECIMAL(5,2);

-- 4. Change Assignments max_points from INTEGER to DECIMAL(5,2)
ALTER TABLE assignments 
ALTER COLUMN max_points TYPE DECIMAL(5,2);

-- Update default value
ALTER TABLE assignments 
ALTER COLUMN max_points SET DEFAULT 100.00;

-- 5. Change Assignment_Submissions grade from INTEGER to DECIMAL(5,2)
ALTER TABLE assignment_submissions 
ALTER COLUMN grade TYPE DECIMAL(5,2);

-- 6. Add updated_at column to Announcements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'announcements' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE announcements 
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 7. Create trigger for announcements updated_at
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at 
  BEFORE UPDATE ON announcements 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON COLUMN students.learning_schedule IS 'Array of preferred learning schedule times';
COMMENT ON COLUMN parents.relationship IS 'Relationship to student (father, mother, guardian, other)';
COMMENT ON COLUMN quiz_questions.points IS 'Points awarded for correct answer (supports decimal values)';
COMMENT ON COLUMN assignments.max_points IS 'Maximum points possible for assignment (supports decimal values)';
COMMENT ON COLUMN assignment_submissions.grade IS 'Grade received for submission (supports decimal values)';
COMMENT ON COLUMN announcements.updated_at IS 'Timestamp of last update to announcement';

-- Verify all changes
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verify students.learning_schedule is TEXT[]
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'students' 
    AND column_name = 'learning_schedule'
    AND data_type = 'ARRAY';
  
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Failed to update students.learning_schedule to TEXT[]';
  END IF;

  -- Verify parents.relationship constraint exists
  SELECT COUNT(*) INTO v_count
  FROM pg_constraint
  WHERE conname = 'parents_relationship_check';
  
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Failed to add parents.relationship constraint';
  END IF;

  -- Verify quiz_questions.points is DECIMAL
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'quiz_questions' 
    AND column_name = 'points'
    AND data_type = 'numeric';
  
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Failed to update quiz_questions.points to DECIMAL';
  END IF;

  -- Verify assignments.max_points is DECIMAL
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'assignments' 
    AND column_name = 'max_points'
    AND data_type = 'numeric';
  
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Failed to update assignments.max_points to DECIMAL';
  END IF;

  -- Verify assignment_submissions.grade is DECIMAL
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'assignment_submissions' 
    AND column_name = 'grade'
    AND data_type = 'numeric';
  
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Failed to update assignment_submissions.grade to DECIMAL';
  END IF;

  -- Verify announcements.updated_at exists
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'announcements' 
    AND column_name = 'updated_at';
  
  IF v_count = 0 THEN
    RAISE EXCEPTION 'Failed to add announcements.updated_at column';
  END IF;

  RAISE NOTICE 'All schema refinements completed successfully!';
END $$;
