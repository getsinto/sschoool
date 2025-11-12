# Supabase Database Setup Guide

This guide will help you set up the complete database schema for St Haroon English Medium Online School.

## Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the Supabase CLI
   ```bash
   npm install -g supabase
   ```

## Setup Steps

### 1. Create a New Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: St Haroon Online School
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

After project creation, go to **Settings > API** and copy:
- **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
- **Anon Public Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

### 3. Update Environment Variables

Update your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste each migration file content in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_indexes.sql`
   - `supabase/migrations/003_triggers.sql`
   - `supabase/migrations/004_functions.sql`
   - `supabase/migrations/005_rls_policies.sql`
3. Run each migration by clicking "Run"

#### Option B: Using Supabase CLI (Advanced)

1. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

2. Link to your remote project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Push migrations:
   ```bash
   supabase db push
   ```

### 5. Seed Sample Data (Optional)

To add sample data for testing:

1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste content from `supabase/seed/001_sample_data.sql`
3. Click "Run"

### 6. Generate TypeScript Types

Run this command to generate updated TypeScript types:
```bash
npm run db:generate
```

Or manually:
```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

### 7. Configure Row Level Security (RLS)

RLS policies are automatically applied through the migration files. Verify in **Authentication > Policies** that all tables have appropriate policies.

### 8. Set Up Storage Buckets

Create storage buckets for file uploads:

1. Go to **Storage** in Supabase dashboard
2. Create the following buckets:
   - `avatars` (for user profile pictures)
   - `course-thumbnails` (for course images)
   - `course-content` (for lesson videos/documents)
   - `assignments` (for assignment files)
   - `certificates` (for generated certificates)
   - `documents` (for ID cards, resumes, etc.)

3. Set appropriate policies for each bucket based on user roles.

## Database Schema Overview

### Core Tables

- **users**: Extended user profiles with role-based access
- **teachers**: Teacher-specific information and qualifications
- **students**: Student profiles with academic details
- **parents**: Parent profiles linked to students
- **courses**: Course catalog with pricing and metadata
- **sections**: Course sections for organization
- **lessons**: Individual lessons with content
- **enrollments**: Student course enrollments
- **payments**: Payment transactions and history

### Learning Management

- **progress_tracking**: Student progress through lessons
- **quizzes**: Quiz definitions and settings
- **quiz_questions**: Individual quiz questions
- **quiz_attempts**: Student quiz submissions
- **assignments**: Assignment definitions
- **assignment_submissions**: Student assignment submissions
- **live_classes**: Scheduled live sessions

### System Features

- **notifications**: User notifications
- **announcements**: System-wide announcements
- **support_tickets**: Customer support system
- **certificates**: Course completion certificates
- **coupons**: Discount codes and promotions
- **chatbot_faqs**: AI chatbot knowledge base

## Key Features

### 1. Multi-Role Authentication
- Admin, Teacher, Student, Parent roles
- Role-based access control with RLS policies

### 2. Course Management
- Hierarchical course structure (Course > Section > Lesson)
- Multiple lesson types (video, document, quiz, assignment, live class)
- Progress tracking and completion certificates

### 3. Payment System
- Multiple payment gateways support
- Coupon system with validation
- Payment history and refund tracking

### 4. Learning Analytics
- Student progress tracking
- Course completion statistics
- Teacher performance metrics

### 5. Communication
- Notification system
- Support ticket system
- Live class scheduling

## Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Secure file storage with access policies
- Audit trails with timestamps

## Performance Optimizations

- Comprehensive indexing strategy
- Full-text search capabilities
- Optimized queries for dashboard statistics
- Efficient foreign key relationships

## Maintenance

### Regular Tasks

1. **Monitor Performance**: Check slow queries in Supabase dashboard
2. **Update Statistics**: Run `ANALYZE` on large tables periodically
3. **Backup Data**: Set up automated backups
4. **Monitor Storage**: Keep track of file storage usage
5. **Review Logs**: Check error logs and authentication logs

### Scaling Considerations

- Consider read replicas for high traffic
- Implement caching for frequently accessed data
- Monitor connection pool usage
- Plan for storage growth

## Troubleshooting

### Common Issues

1. **Migration Errors**: Check for syntax errors and run migrations in order
2. **RLS Policy Issues**: Verify user roles and policy conditions
3. **Type Errors**: Regenerate TypeScript types after schema changes
4. **Performance Issues**: Check indexes and query execution plans

### Support

- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- Community Support: [supabase.com/community](https://supabase.com/community)
- GitHub Issues: [github.com/supabase/supabase](https://github.com/supabase/supabase)

## Next Steps

After setting up the database:

1. Test authentication flows
2. Implement course creation and enrollment
3. Set up payment processing
4. Configure email notifications
5. Deploy to production

Your database is now ready for the St Haroon English Medium Online School platform!