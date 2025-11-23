# Supabase Migration Guide

## Overview
This directory contains all database migrations for the St. Haroon Online School platform. Migrations are organized sequentially and should be applied in order.

## Migration Structure

### Core Schema (000-009)
- `000_extensions.sql` - PostgreSQL extensions
- `001_core_schema.sql` - Core tables (users, teachers, students, parents)
- `002_courses_curriculum.sql` - Course structure (courses, sections, lessons)
- `003_assessments.sql` - Quizzes, assignments, and grading
- `004_enrollments_progress.sql` - Student enrollments and progress tracking
- `005_payments_billing.sql` - Payment system and subscriptions
- `006_live_classes.sql` - Live class scheduling and management
- `007_certificates_achievements.sql` - Certificates and student achievements
- `008_indexes_performance.sql` - Database indexes for performance
- `009_rls_policies.sql` - Row Level Security policies

### Feature Modules (010-029)
- `010_notifications_system.sql` - In-app and push notifications
- `011_support_chatbot.sql` - Support tickets and chatbot
- `012_content_library.sql` - Media file management
- `013_verification_system.sql` - User verification workflow
- `014_subject_management.sql` - Teacher subject management
- `015_course_visibility.sql` - Course visibility controls
- `016_zoom_integration.sql` - Zoom meeting integration
- `017_google_meet_integration.sql` - Google Meet integration
- `018_email_system.sql` - Email notifications and templates
- `019_analytics_reporting.sql` - Analytics and reporting tables

### Functions & Triggers (030-039)
- `030_database_functions.sql` - Utility functions
- `031_triggers.sql` - Database triggers
- `032_views.sql` - Database views for common queries

## How to Apply Migrations

### Using Supabase CLI
```bash
# Apply all pending migrations
supabase db push

# Reset database and apply all migrations
supabase db reset

# Create a new migration
supabase migration new migration_name
```

### Using Supabase Dashboard
1. Go to your project dashboard
2. Navigate to Database > Migrations
3. Copy the SQL content from each file
4. Execute in order (000 → 001 → 002, etc.)

### Manual Application
```bash
# Connect to your database
psql -h your-db-host -U postgres -d postgres

# Apply migrations in order
\i supabase/migrations/000_extensions.sql
\i supabase/migrations/001_core_schema.sql
# ... continue in order
```

## Migration Best Practices

1. **Never modify existing migrations** - Create new ones instead
2. **Test locally first** - Use `supabase db reset` to test
3. **Backup before production** - Always backup before applying to production
4. **Apply in order** - Migrations must be applied sequentially
5. **Document changes** - Add comments explaining complex logic

## Rollback Strategy

If you need to rollback a migration:
1. Create a new migration that reverses the changes
2. Name it clearly (e.g., `040_rollback_feature_x.sql`)
3. Test thoroughly before applying to production

## Common Issues

### Duplicate Objects
If you see "already exists" errors:
- Check if the migration was partially applied
- Use `IF NOT EXISTS` clauses
- Consider using `DROP ... IF EXISTS` before CREATE

### Permission Errors
- Ensure you're connected as a superuser
- Check RLS policies aren't blocking operations
- Verify role permissions

### Dependency Errors
- Ensure migrations are applied in order
- Check foreign key references exist
- Verify required extensions are enabled

## Migration Checklist

Before applying to production:
- [ ] Tested locally with `supabase db reset`
- [ ] Reviewed all SQL for syntax errors
- [ ] Checked for naming conflicts
- [ ] Verified RLS policies are correct
- [ ] Backed up production database
- [ ] Documented any manual steps required
- [ ] Tested rollback procedure

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review migration logs in Supabase dashboard
- Contact development team

---

**Last Updated:** November 23, 2025
**Database Version:** PostgreSQL 15.x
**Supabase Version:** Latest
