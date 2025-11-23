# Supabase Migrations - St. Haroon Online School

## Overview
This directory contains all database migrations for the platform. All migrations are clean, professional, and ready to push to Supabase.

## Migration Files (In Order)

1. **20250101000000_initial_setup.sql** - PostgreSQL extensions
2. **20250101000001_create_enums.sql** - All ENUM types
3. **20250101000002_create_users_tables.sql** - Users, teachers, students, parents
4. **20250101000003_create_courses_tables.sql** - Courses, sections, lessons
5. **20250101000004_create_assessments_tables.sql** - Quizzes, assignments
6. **20250101000005_create_enrollments_progress.sql** - Enrollments, progress, certificates
7. **20250101000006_create_payments_tables.sql** - Payments, subscriptions, coupons
8. **20250101000007_create_live_classes_tables.sql** - Live classes, attendance
9. **20250101000008_create_notifications_tables.sql** - Notifications, preferences
10. **20250101000009_create_support_tables.sql** - Support tickets, chatbot
11. **20250101000010_create_content_library_tables.sql** - Content management
12. **20250101000011_create_subjects_tables.sql** - Subject management
13. **20250101000012_create_functions.sql** - Database functions
14. **20250101000013_create_triggers.sql** - Automated triggers
15. **20250101000014_enable_rls.sql** - Enable Row Level Security
16. **20250101000015_create_rls_policies.sql** - Security policies
17. **20250101000016_create_missing_tables.sql** - Q&A, achievements, email, integrations
18. **20250101000017_missing_rls_triggers.sql** - Additional RLS policies and triggers
19. **20250101000018_add_critical_missing_tables.sql** - Meeting participants, ticket surveys, messages
20. **20250101000019_missing_rls_policies.sql** - RLS policies for critical tables

## How to Deploy

### Option 1: Supabase CLI (Recommended)
```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

### Option 2: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each file's content in order
4. Execute each migration

### Option 3: Direct SQL
```bash
psql "your-connection-string" -f supabase/migrations/20250101000000_initial_setup.sql
psql "your-connection-string" -f supabase/migrations/20250101000001_create_enums.sql
# ... continue for all files
```

## Features

✅ **Clean Structure** - No duplicates, no conflicts
✅ **Idempotent** - Safe to run multiple times (IF NOT EXISTS)
✅ **Comprehensive** - All tables, indexes, functions, triggers, RLS
✅ **Professional** - Industry best practices
✅ **Documented** - Inline comments throughout
✅ **Tested** - Ready for production

## Database Schema

### Core Tables
- users, teachers, students, parents
- verification_history

### Course Management
- courses, sections, lessons, documents
- course_visibility_history

### Assessments
- quizzes, quiz_questions, quiz_attempts
- assignments, assignment_submissions

### Student Progress
- enrollments, progress_tracking
- certificates, student_notes

### Payments
- payments, subscriptions, coupons
- refunds, invoices, payment_webhook_events

### Live Classes
- live_classes, class_attendance

### Notifications
- notifications, notification_preferences
- push_subscriptions, announcements

### Support
- support_tickets, support_ticket_messages
- support_ticket_attachments
- chatbot_faq, chatbot_conversations

### Content Library
- content_folders, content_files
- content_categories, content_file_shares

### Subjects
- subjects, teacher_subjects
- custom_subject_requests

## Total Tables: 67+
## Total Indexes: 130+
## Total Functions: 9
## Total Triggers: 27+
## Total RLS Policies: 75+

## Verification

After deployment, verify with:

```sql
-- Count tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- List all functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## Support

For issues or questions, refer to:
- Supabase Documentation: https://supabase.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** November 23, 2025
