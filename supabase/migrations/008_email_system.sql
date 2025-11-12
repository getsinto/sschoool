-- Email Notification System Tables

-- Email jobs table
CREATE TABLE IF NOT EXISTS email_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template VARCHAR(100) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email analytics table
CREATE TABLE IF NOT EXISTS email_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_job_id UUID REFERENCES email_jobs(id) ON DELETE CASCADE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_type VARCHAR(50),
  bounce_reason TEXT,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  complained_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency VARCHAR(50) NOT NULL DEFAULT 'immediate',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template VARCHAR(100) NOT NULL,
  segment VARCHAR(100) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  component VARCHAR(255) NOT NULL,
  description TEXT,
  variables JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_jobs_status ON email_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_jobs_scheduled_at ON email_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_jobs_recipient ON email_jobs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_jobs_created_at ON email_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_email_analytics_email_job_id ON email_analytics(email_job_id);
CREATE INDEX IF NOT EXISTS idx_email_analytics_delivered_at ON email_analytics(delivered_at);
CREATE INDEX IF NOT EXISTS idx_email_analytics_opened_at ON email_analytics(opened_at);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_category ON notification_preferences(category);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_email_jobs_updated_at
  BEFORE UPDATE ON email_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER update_email_analytics_updated_at
  BEFORE UPDATE ON email_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_updated_at();

-- Insert default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, category, enabled, frequency)
  VALUES
    (NEW.id, 'course-updates', true, 'immediate'),
    (NEW.id, 'live-class-reminders', true, 'immediate'),
    (NEW.id, 'assignment-reminders', true, 'immediate'),
    (NEW.id, 'grade-notifications', true, 'immediate'),
    (NEW.id, 'payment-receipts', true, 'immediate'),
    (NEW.id, 'announcements', true, 'immediate'),
    (NEW.id, 'messages', true, 'immediate'),
    (NEW.id, 'marketing', true, 'weekly');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Insert default email templates
INSERT INTO email_templates (name, type, subject, component, description, variables) VALUES
  ('welcome', 'transactional', 'Welcome to Our Learning Platform!', 'WelcomeEmail', 'Welcome email sent to new users', '["firstName", "role", "loginUrl"]'),
  ('email-verification', 'transactional', 'Verify Your Email Address', 'EmailVerification', 'Email verification link', '["firstName", "verificationUrl"]'),
  ('password-reset', 'transactional', 'Reset Your Password', 'PasswordReset', 'Password reset link', '["firstName", "resetUrl"]'),
  ('enrollment-confirmation', 'transactional', 'Course Enrollment Confirmation', 'EnrollmentConfirmation', 'Sent when student enrolls in a course', '["studentName", "courseTitle", "instructorName"]'),
  ('payment-receipt', 'transactional', 'Payment Receipt', 'PaymentReceipt', 'Payment confirmation and receipt', '["customerName", "amount", "transactionId"]'),
  ('live-class-reminder', 'transactional', 'Live Class Reminder', 'LiveClassReminder', 'Reminder before live class starts', '["studentName", "classTitle", "startTime"]'),
  ('assignment-due-reminder', 'transactional', 'Assignment Due Reminder', 'AssignmentDueReminder', 'Reminder before assignment due date', '["studentName", "assignmentTitle", "dueDate"]'),
  ('quiz-available', 'transactional', 'New Quiz Available', 'QuizAvailable', 'Notification when quiz becomes available', '["studentName", "quizTitle"]'),
  ('grade-posted', 'transactional', 'Grade Posted', 'GradePosted', 'Notification when grade is posted', '["studentName", "assessmentName", "grade"]'),
  ('certificate-earned', 'transactional', 'Certificate Earned', 'CertificateEarned', 'Congratulations on earning certificate', '["studentName", "courseName"]'),
  ('announcement', 'marketing', 'New Announcement', 'Announcement', 'Platform announcements', '["recipientName", "title", "content"]'),
  ('teacher-message', 'transactional', 'New Message from Teacher', 'TeacherMessage', 'Teacher message notification', '["studentName", "teacherName", "messagePreview"]'),
  ('parent-weekly-report', 'transactional', 'Weekly Progress Report', 'ParentWeeklyReport', 'Weekly report for parents', '["parentName", "childName", "weekStart", "weekEnd"]')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies
ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admin can manage all email data
CREATE POLICY "Admins can manage email jobs" ON email_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage email analytics" ON email_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Users can view and update their own notification preferences
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- Everyone can view email templates
CREATE POLICY "Anyone can view email templates" ON email_templates
  FOR SELECT USING (is_active = true);

-- Admins can manage email templates
CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
