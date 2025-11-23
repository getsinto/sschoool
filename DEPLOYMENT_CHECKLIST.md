# ✅ Database Deployment Checklist

Use this checklist to ensure a smooth deployment of your reorganized Supabase migrations.

---

## 📋 Pre-Deployment

### 1. Review Documentation
- [ ] Read `DATABASE_REORGANIZATION_COMPLETE.md`
- [ ] Read `supabase/DEPLOY_MIGRATIONS.md`
- [ ] Read `supabase/migrations/MIGRATION_GUIDE.md`
- [ ] Understand the migration sequence (000-018)

### 2. Backup Current Database
- [ ] Create database backup via Supabase dashboard
  - Go to Database → Backups → Create Backup
- [ ] Or use CLI: `supabase db dump -f backup_$(date +%Y%m%d).sql`
- [ ] Verify backup file exists and is not empty
- [ ] Store backup in safe location
- [ ] Test backup restoration process (optional but recommended)

### 3. Test Locally
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Start local Supabase: `supabase start`
- [ ] Apply migrations: `supabase db reset`
- [ ] Test your application: `npm run dev`
- [ ] Verify all features work correctly
- [ ] Check for console errors
- [ ] Test user authentication
- [ ] Test course enrollment
- [ ] Test payment processing
- [ ] Test live classes
- [ ] Test notifications

### 4. Prepare Environment
- [ ] Get your Supabase project reference ID
  - Dashboard → Settings → General → Reference ID
- [ ] Ensure you have database password
- [ ] Check Supabase CLI is installed: `supabase --version`
- [ ] Verify you're logged in: `supabase login`

### 5. Schedule Deployment
- [ ] Choose low-traffic time window
- [ ] Notify team members
- [ ] Notify users (if needed)
- [ ] Have rollback plan ready
- [ ] Ensure team is available for support

---

## 🚀 Deployment Steps

### Step 1: Link to Project
```bash
supabase link --project-ref your-project-ref-here
```
- [ ] Command executed successfully
- [ ] Entered database password
- [ ] Connection confirmed

### Step 2: Review Pending Migrations
```bash
supabase db diff
```
- [ ] Reviewed list of pending migrations
- [ ] Confirmed all 18 migrations are listed
- [ ] No unexpected migrations appear

### Step 3: Apply Migrations
```bash
supabase db push
```
- [ ] Command started successfully
- [ ] Watched output for errors
- [ ] All migrations applied without errors
- [ ] Received success confirmation

### Step 4: Verify Migration Status
```bash
supabase migration list
```
- [ ] All 18 migrations show as applied
- [ ] No migrations show as pending
- [ ] Timestamps are correct

---

## 🔍 Post-Deployment Verification

### 1. Database Structure
Run these queries in Supabase SQL Editor:

#### Check Tables
```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
- [ ] Result shows 40+ tables
- [ ] All expected tables exist

#### Check Indexes
```sql
SELECT COUNT(*) as index_count 
FROM pg_indexes 
WHERE schemaname = 'public';
```
- [ ] Result shows 50+ indexes
- [ ] Performance indexes are created

#### Check RLS Policies
```sql
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public';
```
- [ ] Result shows 100+ policies
- [ ] Security policies are active

#### Check Functions
```sql
SELECT COUNT(*) as function_count 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```
- [ ] Result shows 20+ functions
- [ ] Utility functions exist

#### Check Triggers
```sql
SELECT COUNT(*) as trigger_count 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```
- [ ] Result shows 30+ triggers
- [ ] Automated triggers are active

### 2. Application Testing

#### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Password reset works
- [ ] Email verification works

#### User Roles
- [ ] Admin dashboard accessible
- [ ] Teacher dashboard accessible
- [ ] Student dashboard accessible
- [ ] Parent dashboard accessible
- [ ] Role-based permissions work

#### Core Features
- [ ] Course browsing works
- [ ] Course enrollment works
- [ ] Lesson viewing works
- [ ] Quiz taking works
- [ ] Assignment submission works
- [ ] Progress tracking works

#### Payments
- [ ] Payment processing works
- [ ] Coupon application works
- [ ] Invoice generation works
- [ ] Refund processing works

#### Live Classes
- [ ] Class scheduling works
- [ ] Zoom integration works
- [ ] Google Meet integration works
- [ ] Attendance tracking works
- [ ] Recording access works

#### Notifications
- [ ] In-app notifications work
- [ ] Push notifications work
- [ ] Email notifications work
- [ ] Notification preferences work

#### Support
- [ ] Ticket creation works
- [ ] Ticket replies work
- [ ] Chatbot responses work
- [ ] File attachments work

#### Content Library
- [ ] File upload works
- [ ] File browsing works
- [ ] File categorization works
- [ ] File sharing works

### 3. Performance Check
- [ ] Page load times are acceptable
- [ ] Database queries are fast
- [ ] No slow query warnings
- [ ] API responses are quick

### 4. Error Monitoring
- [ ] Check Supabase logs for errors
- [ ] Check application logs for errors
- [ ] Check browser console for errors
- [ ] Monitor error tracking service (if any)

---

## 📊 Health Check Queries

Run these to ensure everything is working:

### Check Recent Activity
```sql
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
LIMIT 10;
```
- [ ] Tables show activity
- [ ] No unexpected patterns

### Check Table Sizes
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```
- [ ] Sizes are reasonable
- [ ] No unexpectedly large tables

### Check Index Usage
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 10;
```
- [ ] Indexes are being used
- [ ] No unused indexes

---

## 🐛 Troubleshooting

### If Errors Occur

#### Error: "relation already exists"
- [ ] This is normal - migrations are idempotent
- [ ] Continue with deployment
- [ ] Verify table structure is correct

#### Error: "column already exists"
- [ ] Check if migration was partially applied
- [ ] Review migration file
- [ ] May need to manually fix

#### Error: "foreign key constraint violation"
- [ ] Ensure migrations applied in order
- [ ] Check referenced tables exist
- [ ] May need to reapply in sequence

#### Error: "permission denied"
- [ ] Verify database password
- [ ] Check user permissions
- [ ] May need superuser access

### If Application Breaks
1. [ ] Check Supabase logs
2. [ ] Check application logs
3. [ ] Check browser console
4. [ ] Review recent changes
5. [ ] Consider rollback if critical

---

## 🔄 Rollback Procedure

### If You Need to Rollback

#### Option 1: Restore from Backup
```bash
# Via Supabase Dashboard
# Go to Database → Backups → Restore

# Or via CLI
psql "your-connection-string" < backup_YYYYMMDD.sql
```
- [ ] Backup restored successfully
- [ ] Application tested
- [ ] Users notified

#### Option 2: Manual Rollback
- [ ] Identify problematic migration
- [ ] Create rollback SQL
- [ ] Test rollback locally
- [ ] Apply to production
- [ ] Verify application works

---

## 📝 Post-Deployment Tasks

### 1. Documentation
- [ ] Update deployment log
- [ ] Document any issues encountered
- [ ] Note any manual steps taken
- [ ] Update team wiki/docs

### 2. Monitoring
- [ ] Set up database monitoring
- [ ] Configure error alerts
- [ ] Monitor performance metrics
- [ ] Track user activity

### 3. Communication
- [ ] Notify team of successful deployment
- [ ] Update status page (if any)
- [ ] Inform users deployment is complete
- [ ] Thank team for support

### 4. Cleanup
- [ ] Archive old migration files (optional)
- [ ] Clean up local test databases
- [ ] Update documentation
- [ ] Close deployment ticket

---

## ✅ Final Verification

### All Systems Go?
- [ ] Database is healthy
- [ ] Application is working
- [ ] Users can access system
- [ ] No critical errors
- [ ] Performance is good
- [ ] Team is informed
- [ ] Documentation is updated

### Success Criteria Met?
- [ ] All 18 migrations applied
- [ ] All tables created
- [ ] All indexes active
- [ ] All RLS policies enforced
- [ ] All functions available
- [ ] All triggers working
- [ ] Application fully functional
- [ ] No data loss
- [ ] No downtime (or minimal)
- [ ] Users satisfied

---

## 🎉 Deployment Complete!

If all checkboxes are checked, congratulations! Your database migration is complete and successful.

### Next Steps
1. Monitor for 24-48 hours
2. Gather user feedback
3. Address any issues promptly
4. Plan next improvements

### Resources
- `DATABASE_REORGANIZATION_COMPLETE.md` - Overview
- `supabase/DEPLOY_MIGRATIONS.md` - Detailed guide
- `supabase/migrations/MIGRATION_GUIDE.md` - Usage guide
- `QUICK_START_DATABASE.md` - Quick reference

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Status:** ⬜ Success  ⬜ Partial  ⬜ Failed
**Notes:** _______________________________________________

---

**Good luck with your deployment! 🚀**
