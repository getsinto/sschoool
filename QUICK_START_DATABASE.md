# 🚀 Quick Start - Database Migration

## TL;DR - Deploy in 3 Steps

```bash
# 1. Link to your Supabase project
supabase link --project-ref your-project-ref

# 2. Apply all migrations
supabase db push

# 3. Verify
supabase migration list
```

**Done! ✅** Your database is now fully set up.

---

## 📁 What You Have Now

### **18 Clean Migration Files**
```
000_extensions.sql          → PostgreSQL extensions
001_core_schema.sql         → Users, teachers, students, parents
002_courses_curriculum.sql  → Courses, sections, lessons
003_assessments.sql         → Quizzes, assignments
004_enrollments_progress.sql → Enrollments & progress
005_payments_billing.sql    → Payment system
006_live_classes.sql        → Live classes
007_certificates.sql        → Certificates
008_notifications.sql       → Notifications
009_support_chatbot.sql     → Support & chatbot
010_content_library.sql     → Media files
011_subject_management.sql  → Teacher subjects
012_course_visibility.sql   → Visibility controls
013_integrations.sql        → Zoom, Google Meet
014_email_system.sql        → Email system
015_indexes.sql             → Performance indexes
016_rls_policies.sql        → Security policies
017_functions.sql           → Database functions
018_triggers.sql            → Automated triggers
```

### **Complete Documentation**
- `supabase/migrations/MIGRATION_GUIDE.md` - How to use migrations
- `supabase/DEPLOY_MIGRATIONS.md` - Step-by-step deployment
- `DATABASE_REORGANIZATION_COMPLETE.md` - What changed
- `SUPABASE_MIGRATION_REORGANIZATION.md` - Detailed overview

---

## 🎯 Common Tasks

### Deploy to Production
```bash
# Backup first!
supabase db dump -f backup.sql

# Deploy
supabase link --project-ref prod-ref
supabase db push
```

### Test Locally
```bash
supabase start
supabase db reset
npm run dev
```

### Check Migration Status
```bash
supabase migration list
```

### Rollback (if needed)
```bash
# Restore from backup
psql "connection-string" < backup.sql
```

---

## 📊 Verify Deployment

### Quick Check
```sql
-- Count tables (should be ~40+)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

### Full Verification
See `supabase/DEPLOY_MIGRATIONS.md` → "Verification Queries" section

---

## 🆘 Need Help?

### Quick Fixes

**Error: "relation already exists"**
→ Safe to ignore, migrations are idempotent

**Error: "permission denied"**
→ Ensure you're connected as database owner

**Error: "foreign key violation"**
→ Apply migrations in order (000 → 001 → 002...)

### Full Troubleshooting
See `supabase/DEPLOY_MIGRATIONS.md` → "Troubleshooting" section

---

## 📚 Learn More

1. **Start here:** `DATABASE_REORGANIZATION_COMPLETE.md`
2. **Deployment:** `supabase/DEPLOY_MIGRATIONS.md`
3. **Usage:** `supabase/migrations/MIGRATION_GUIDE.md`

---

## ✅ What's Different Now?

**Before:**
- 23+ scattered files
- Duplicates and conflicts
- Out of sequence
- Hard to maintain

**After:**
- 18 organized files
- No duplicates
- Properly sequenced
- Easy to maintain
- Production-ready

---

**Ready to deploy?** Run the 3 commands at the top! 🚀

**Questions?** Check the documentation files listed above.

**Status:** ✅ Complete and ready for production
