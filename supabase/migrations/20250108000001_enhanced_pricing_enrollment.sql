-- ============================================================================
-- ENHANCED PRICING & ENROLLMENT SYSTEM
-- Version: 1.0.0
-- Date: January 8, 2025
-- Description: Comprehensive pricing models, batch courses, bundles, waitlists
-- ============================================================================

-- ============================================================================
-- PART 1: UPDATE COURSES TABLE WITH NEW PRICING FIELDS
-- ============================================================================

-- Add new pricing model columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'one_time' 
  CHECK (pricing_model IN ('free', 'one_time', 'subscription', 'tiered', 'pay_what_you_want', 'bulk', 'early_bird', 'free_trial'));

-- Subscription pricing
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subscription_type TEXT 
  CHECK (subscription_type IN ('monthly', 'quarterly', 'yearly'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10,2);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT TRUE;

-- Payment plans
ALTER TABLE courses ADD COLUMN IF NOT EXISTS payment_plan_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS payment_plan_installments INTEGER CHECK (payment_plan_installments > 0);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS payment_plan_frequency TEXT 
  CHECK (payment_plan_frequency IN ('weekly', 'biweekly', 'monthly'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS payment_plan_down_payment DECIMAL(10,2);

-- Early bird pricing
ALTER TABLE courses ADD COLUMN IF NOT EXISTS early_bird_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS early_bird_price DECIMAL(10,2);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS early_bird_deadline TIMESTAMPTZ;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS regular_price DECIMAL(10,2);

-- Enrollment limits
ALTER TABLE courses ADD COLUMN IF NOT EXISTS min_students INTEGER CHECK (min_students >= 0);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS max_students INTEGER CHECK (max_students >= 0);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS current_enrollments INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enable_waitlist BOOLEAN DEFAULT FALSE;

-- Access duration
ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_duration_type TEXT DEFAULT 'lifetime' 
  CHECK (access_duration_type IN ('lifetime', 'time_limited', 'batch_duration', 'subscription_based'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_duration_days INTEGER CHECK (access_duration_days > 0);

-- Batch-based courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_batch_based BOOLEAN DEFAULT FALSE;

-- Pay what you want
ALTER TABLE courses ADD COLUMN IF NOT EXISTS min_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS suggested_price DECIMAL(10,2);

-- Free trial
ALTER TABLE courses ADD COLUMN IF NOT EXISTS free_trial_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS free_trial_days INTEGER CHECK (free_trial_days > 0);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS trial_requires_card BOOLEAN DEFAULT TRUE;

-- Tiered pricing (stored as JSONB)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pricing_tiers JSONB;

-- Currency
ALTER TABLE courses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Bundle reference
ALTER TABLE courses ADD COLUMN IF NOT EXISTS bundle_id UUID;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_courses_pricing_model ON courses(pricing_model);
CREATE INDEX IF NOT EXISTS idx_courses_early_bird_deadline ON courses(early_bird_deadline) WHERE early_bird_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_courses_batch_based ON courses(is_batch_based) WHERE is_batch_based = TRUE;
CREATE INDEX IF NOT EXISTS idx_courses_bundle_id ON courses(bundle_id) WHERE bundle_id IS NOT NULL;

-- ============================================================================
-- PART 2: CREATE COURSE_BATCHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Batch info
  batch_name TEXT NOT NULL,
  batch_number INTEGER,
  batch_description TEXT,
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_opens TIMESTAMPTZ NOT NULL,
  registration_closes TIMESTAMPTZ NOT NULL,
  
  -- Class schedule
  schedule_days TEXT[] DEFAULT '{}', -- ['monday', 'wednesday', 'friday']
  schedule_time TIME,
  timezone TEXT DEFAULT 'UTC',
  
  -- Enrollment
  max_students INTEGER,
  min_students INTEGER,
  current_enrollments INTEGER DEFAULT 0,
  spots_remaining INTEGER GENERATED ALWAYS AS (COALESCE(max_students, 999999) - current_enrollments) STORED,
  
  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled')),
  
  -- Pricing (can override course pricing)
  batch_price DECIMAL(10,2),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes for batches
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON course_batches(course_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON course_batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_registration ON course_batches(registration_opens, registration_closes);
CREATE INDEX IF NOT EXISTS idx_batches_dates ON course_batches(start_date, end_date);

-- ============================================================================
-- PART 3: CREATE COURSE_BUNDLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Bundle info
  bundle_name TEXT NOT NULL,
  bundle_slug TEXT UNIQUE NOT NULL,
  bundle_description TEXT,
  
  -- Pricing
  bundle_price DECIMAL(10,2) NOT NULL,
  regular_price DECIMAL(10,2), -- Sum of individual course prices
  savings_amount DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(regular_price, 0) - bundle_price) STORED,
  savings_percentage INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN COALESCE(regular_price, 0) > 0 
      THEN ROUND(((COALESCE(regular_price, 0) - bundle_price) / regular_price * 100)::numeric, 0)::integer
      ELSE 0 
    END
  ) STORED,
  currency TEXT DEFAULT 'USD',
  
  -- Courses in bundle
  course_ids UUID[] NOT NULL DEFAULT '{}',
  
  -- Access
  validity_days INTEGER, -- How long bundle access lasts
  
  -- Visibility
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bundles
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON course_bundles(bundle_slug);
CREATE INDEX IF NOT EXISTS idx_bundles_active ON course_bundles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_bundles_featured ON course_bundles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_bundles_course_ids ON course_bundles USING GIN(course_ids);

-- ============================================================================
-- PART 4: CREATE COURSE_WAITLIST TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS course_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES course_batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Waitlist info
  joined_waitlist_at TIMESTAMPTZ DEFAULT NOW(),
  position INTEGER, -- Position in waitlist
  priority INTEGER DEFAULT 0, -- Higher priority = moved up in list
  
  -- Notification
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  notification_expires_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'enrolled', 'expired', 'cancelled')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one waitlist entry per student per course/batch
  UNIQUE(course_id, batch_id, student_id)
);

-- Indexes for waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_course_id ON course_waitlist(course_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_batch_id ON course_waitlist(batch_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_student_id ON course_waitlist(student_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON course_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON course_waitlist(course_id, position) WHERE status = 'waiting';

-- ============================================================================
-- PART 5: UPDATE ENROLLMENTS TABLE
-- ============================================================================

-- Add new enrollment fields
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES course_batches(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES course_bundles(id);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS pricing_tier TEXT; -- For tiered pricing
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT FALSE;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS trial_converted BOOLEAN DEFAULT FALSE;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS payment_plan_id UUID;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS subscription_id TEXT; -- Stripe subscription ID
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS subscription_status TEXT 
  CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'paused'));
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS discount_applied DECIMAL(10,2);

-- Indexes for enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_bundle_id ON enrollments(bundle_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_trial ON enrollments(is_trial, trial_ends_at) WHERE is_trial = TRUE;
CREATE INDEX IF NOT EXISTS idx_enrollments_subscription ON enrollments(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enrollments_access_expires ON enrollments(access_expires_at) WHERE access_expires_at IS NOT NULL;

-- ============================================================================
-- PART 6: CREATE PAYMENT_PLANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Plan details
  total_amount DECIMAL(10,2) NOT NULL,
  down_payment DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL,
  installment_amount DECIMAL(10,2) NOT NULL,
  num_installments INTEGER NOT NULL,
  installments_paid INTEGER DEFAULT 0,
  
  -- Schedule
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  next_payment_date DATE,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment plans
CREATE INDEX IF NOT EXISTS idx_payment_plans_enrollment ON payment_plans(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_student ON payment_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON payment_plans(status);
CREATE INDEX IF NOT EXISTS idx_payment_plans_next_payment ON payment_plans(next_payment_date) WHERE status = 'active';

-- ============================================================================
-- PART 7: CREATE INSTALLMENT_PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS installment_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id),
  
  -- Payment details
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  
  -- Payment info
  payment_method TEXT,
  transaction_id TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'waived')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for installment payments
CREATE INDEX IF NOT EXISTS idx_installment_payments_plan ON installment_payments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_installment_payments_student ON installment_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_installment_payments_status ON installment_payments(status);
CREATE INDEX IF NOT EXISTS idx_installment_payments_due_date ON installment_payments(due_date) WHERE status = 'pending';

-- ============================================================================
-- PART 8: CREATE BUNDLE_ENROLLMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS bundle_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  bundle_id UUID NOT NULL REFERENCES course_bundles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Enrollment details
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Payment
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'refunded')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(bundle_id, student_id)
);

-- Indexes for bundle enrollments
CREATE INDEX IF NOT EXISTS idx_bundle_enrollments_bundle ON bundle_enrollments(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_enrollments_student ON bundle_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_bundle_enrollments_status ON bundle_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_bundle_enrollments_expires ON bundle_enrollments(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- PART 9: HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate current price (considering early bird)
CREATE OR REPLACE FUNCTION get_current_course_price(course_id_param UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  course_record RECORD;
  current_price DECIMAL(10,2);
BEGIN
  SELECT * INTO course_record FROM courses WHERE id = course_id_param;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Check if early bird pricing is active
  IF course_record.early_bird_enabled 
     AND course_record.early_bird_deadline > NOW() 
     AND course_record.early_bird_price IS NOT NULL THEN
    current_price := course_record.early_bird_price;
  ELSE
    current_price := COALESCE(course_record.regular_price, course_record.price);
  END IF;
  
  RETURN current_price;
END;
$$ LANGUAGE plpgsql;

-- Function to check if course has available spots
CREATE OR REPLACE FUNCTION has_available_spots(course_id_param UUID, batch_id_param UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  max_limit INTEGER;
  current_count INTEGER;
BEGIN
  IF batch_id_param IS NOT NULL THEN
    -- Check batch limit
    SELECT max_students, current_enrollments 
    INTO max_limit, current_count
    FROM course_batches 
    WHERE id = batch_id_param;
  ELSE
    -- Check course limit
    SELECT max_students, current_enrollments 
    INTO max_limit, current_count
    FROM courses 
    WHERE id = course_id_param;
  END IF;
  
  -- If no limit set, always return true
  IF max_limit IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RETURN current_count < max_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update enrollment counts
CREATE OR REPLACE FUNCTION update_enrollment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment course enrollment count
    UPDATE courses 
    SET current_enrollments = current_enrollments + 1 
    WHERE id = NEW.course_id;
    
    -- Increment batch enrollment count if applicable
    IF NEW.batch_id IS NOT NULL THEN
      UPDATE course_batches 
      SET current_enrollments = current_enrollments + 1 
      WHERE id = NEW.batch_id;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement course enrollment count
    UPDATE courses 
    SET current_enrollments = GREATEST(0, current_enrollments - 1) 
    WHERE id = OLD.course_id;
    
    -- Decrement batch enrollment count if applicable
    IF OLD.batch_id IS NOT NULL THEN
      UPDATE course_batches 
      SET current_enrollments = GREATEST(0, current_enrollments - 1) 
      WHERE id = OLD.batch_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update enrollment counts
DROP TRIGGER IF EXISTS trigger_update_enrollment_counts ON enrollments;
CREATE TRIGGER trigger_update_enrollment_counts
AFTER INSERT OR DELETE ON enrollments
FOR EACH ROW EXECUTE FUNCTION update_enrollment_counts();

-- Function to update waitlist positions
CREATE OR REPLACE FUNCTION update_waitlist_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate positions for the course/batch
  WITH ranked_waitlist AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        ORDER BY priority DESC, joined_waitlist_at ASC
      ) as new_position
    FROM course_waitlist
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
      AND (batch_id = COALESCE(NEW.batch_id, OLD.batch_id) OR (batch_id IS NULL AND COALESCE(NEW.batch_id, OLD.batch_id) IS NULL))
      AND status = 'waiting'
  )
  UPDATE course_waitlist w
  SET position = rw.new_position
  FROM ranked_waitlist rw
  WHERE w.id = rw.id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update waitlist positions
DROP TRIGGER IF EXISTS trigger_update_waitlist_positions ON course_waitlist;
CREATE TRIGGER trigger_update_waitlist_positions
AFTER INSERT OR UPDATE OR DELETE ON course_waitlist
FOR EACH ROW EXECUTE FUNCTION update_waitlist_positions();

-- Function to check and expire trials
CREATE OR REPLACE FUNCTION expire_trials()
RETURNS void AS $$
BEGIN
  UPDATE enrollments
  SET status = 'expired'
  WHERE is_trial = TRUE
    AND trial_ends_at < NOW()
    AND trial_converted = FALSE
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 10: RLS POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE course_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_enrollments ENABLE ROW LEVEL SECURITY;

-- Course Batches Policies
CREATE POLICY "Anyone can view active batches"
  ON course_batches FOR SELECT
  USING (status IN ('upcoming', 'registration_open', 'in_progress'));

CREATE POLICY "Teachers can manage their course batches"
  ON course_batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_batches.course_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all batches"
  ON course_batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Course Bundles Policies
CREATE POLICY "Anyone can view active bundles"
  ON course_bundles FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage bundles"
  ON course_bundles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Waitlist Policies
CREATE POLICY "Students can view their own waitlist entries"
  ON course_waitlist FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can join waitlist"
  ON course_waitlist FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can cancel their waitlist entry"
  ON course_waitlist FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view waitlist for their courses"
  ON course_waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_waitlist.course_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all waitlists"
  ON course_waitlist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payment Plans Policies
CREATE POLICY "Students can view their own payment plans"
  ON payment_plans FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all payment plans"
  ON payment_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Installment Payments Policies
CREATE POLICY "Students can view their own installments"
  ON installment_payments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all installments"
  ON installment_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Bundle Enrollments Policies
CREATE POLICY "Students can view their own bundle enrollments"
  ON bundle_enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all bundle enrollments"
  ON bundle_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE course_batches IS 'Batch-based course scheduling and enrollment tracking';
COMMENT ON TABLE course_bundles IS 'Course bundles with discounted pricing';
COMMENT ON TABLE course_waitlist IS 'Waitlist for courses with enrollment limits';
COMMENT ON TABLE payment_plans IS 'Payment plan tracking for installment payments';
COMMENT ON TABLE installment_payments IS 'Individual installment payment records';
COMMENT ON TABLE bundle_enrollments IS 'Student enrollments in course bundles';

COMMENT ON COLUMN courses.pricing_model IS 'Pricing model: free, one_time, subscription, tiered, pay_what_you_want, bulk, early_bird, free_trial';
COMMENT ON COLUMN courses.access_duration_type IS 'Access duration: lifetime, time_limited, batch_duration, subscription_based';
COMMENT ON COLUMN courses.pricing_tiers IS 'JSON array of pricing tiers for tiered pricing model';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
