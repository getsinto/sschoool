# Deploy Supabase Migrations - Step by Step Guide

## 🚀 Quick Start

### Prerequisites
- Supabase CLI installed
- Access to your Supabase project
- Database backup completed

### Fastest Method (Recommended)
```bash
# 1. Link to your project
supabase link --project-ref your-project-ref

# 2. Apply all migrations
supabase db push

# Done! ✅
```

---

## 📋 Detailed Deployment Options

### Option 1: Supabase CLI (Recommended for Production)

#### Step 1: Install Supabase CLI
```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or via npm
npm install -g supabase
```

#### Step 2: Link Your Project
```bash
# Get your project ref from Supabase dashboard (Settings → General)
supabase link --project-ref your-project-ref-here

# You'll be prompted for your database password
```

#### Step 3: Review Pending Migrations
```bash
# See what migrations will be applied
supabase db diff
```

#### Step 4: Apply Migrations
```bash
# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase db push --file supabase/migrations/001_core_schema.sql
```

#### Step 5: Verify
```bash
# Check migration status
supabase migration list

# Test database connection
supabase db remote commit
```

---

### Option 2: Supabase Dashboard (Manual)

#### Step 1: Access SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor**

#### Step 2: Apply Migrations in Order
Copy and paste each file's content in this exact order:

```sql
-- 1. Extensions
-- Copy content from: 000_extensions.sql
-- Click "Run"

-- 2. Core Schema
-- Copy content from: 001_core_schema.sql
-- Click "Run"

-- 3. Courses & Curriculum
-- Copy content from: 002_courses_curriculum.sql
-- Click "Run"

-- Continue for all files in sequence...
```

#### Step 3: Verify Each Migration
After each migration:
- Check for errors in the output panel
- Verify tables were created: **Database** → **Tables**
- Test a simple query

---

### Option 3: Direct Database Connection

#### Step 1: Get Connection String
From Supabase Dashboard:
1. Go to **Settings** → **Database**
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your actual password

#### Step 2: Connect via psql
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres"
```

#### Step 3: Apply Migrations
```sql
-- Apply each migration file
\i supabase/migrations/000_extensions.sql
\i supabase/migrations/001_core_schema.sql
\i supabase/migrations/002_courses_curriculum.sql
-- ... continue in order
```

---

## 🔍 Pre-Deployment Checklist

### Before You Start
- [ ] **Backup your database**
  ```bash
  # Via Supabase CLI
  supabase db dump -f backup_$(date +%Y%m%d).sql
  
  # Or via dashboard: Database → Backups → Create Backup
  ```

- [ ] **Test locally first**
  ```bash
  # Start local Supabase
  supabase start
  
  # Apply migrations locally
  supabase db reset
  
  # Test your application
  npm run dev
  ```

- [ ] **Review migration files**
  - Check for syntax errors
  - Verify table names match your code
  - Ensure RLS policies are correct

- [ ] **Check dependencies**
  - Verify foreign key references
  - Ensure required extensions are available
  - Confirm enum types are defined

### During Deployment
- [ ] **Monitor for errors**
  - Watch the output carefully
  - Note any warnings or errors
  - Don't proceed if errors occur

- [ ] **Verify each step**
  - Check tables are created
  - Verify indexes exist
  - Test RLS policies

### After Deployment
- [ ] **Test application**
  - Login/logout functionality
  - CRUD operations
  - Role-based access
  - API endpoints

- [ ] **Check performance**
  - Query execution times
  - Index usage
  - Connection pool

- [ ] **Monitor logs**
  - Check for errors
  - Review slow queries
  - Monitor resource usage

---

## 🛠️ Troubleshooting

### Common Errors

#### Error: "relation already exists"
```sql
-- Solution: Migrations use IF NOT EXISTS, safe to continue
-- Or drop and recreate:
DROP TABLE IF EXISTS table_name CASCADE;
```

#### Error: "column already exists"
```sql
-- Solution: Use conditional column addition
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name TYPE;
```

#### Error: "foreign key constraint violation"
```sql
-- Solution: Apply migrations in correct order
-- Check that referenced tables exist first
```

#### Error: "permission denied"
```sql
-- Solution: Ensure you're connected as owner
-- Or grant permissions:
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

#### Error: "type already exists"
```sql
-- Solution: Use conditional type creation
DO $ BEGIN
    CREATE TYPE type_name AS ENUM ('value1', 'value2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;
```

### Rollback Procedure

If something goes wrong:

1. **Stop immediately**
   ```bash
   # Cancel current operation
   Ctrl+C
   ```

2. **Restore from backup**
   ```bash
   # Via Supabase dashboard
   Database → Backups → Restore
   
   # Or via psql
   psql "connection-string" < backup_YYYYMMDD.sql
   ```

3. **Investigate the issue**
   - Review error messages
   - Check migration file
   - Verify dependencies

4. **Fix and retry**
   - Correct the migration file
   - Test locally first
   - Reapply carefully

---

## 📊 Verification Queries

After deployment, run these queries to verify:

### Check All Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Verify Indexes
```sql
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

### Check RLS Policies
```sql
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Verify Foreign Keys
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Check Functions
```sql
SELECT 
    routine_name, 
    routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

---

## 🎯 Post-Deployment Tasks

### 1. Update Application Code
- Verify all table names match
- Check column names are correct
- Update TypeScript types if needed

### 2. Test All Features
- User registration/login
- Course enrollment
- Payment processing
- Live classes
- Notifications
- Support tickets

### 3. Monitor Performance
```sql
-- Check slow queries
SELECT 
    query, 
    calls, 
    total_time, 
    mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
    schemaname, 
    tablename, 
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 4. Set Up Monitoring
- Enable Supabase monitoring
- Set up alerts for errors
- Monitor database metrics
- Track API usage

---

## 📞 Support & Resources

### Documentation
- [Supabase Migrations Guide](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

### Getting Help
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues
- Stack Overflow: Tag `supabase`

### Emergency Contacts
- Development Team: [your-team-email]
- Database Admin: [dba-email]
- DevOps: [devops-email]

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ All migrations applied without errors
- ✅ All tables exist and have correct structure
- ✅ Indexes are created and being used
- ✅ RLS policies are active and working
- ✅ Foreign keys are enforcing relationships
- ✅ Application connects and functions correctly
- ✅ No errors in Supabase logs
- ✅ Performance is acceptable

---

**Ready to deploy?** Start with Option 1 (Supabase CLI) for the smoothest experience!

**Questions?** Review the MIGRATION_GUIDE.md file or contact the development team.

**Good luck! 🚀**
