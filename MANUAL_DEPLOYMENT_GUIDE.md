# 📝 MANUAL DEPLOYMENT GUIDE

## Why Manual?

The `supabase db reset` command needs Docker Desktop, which you don't have installed.  
**For cloud Supabase, manual deployment via Dashboard is actually easier!**

---

## 🎯 STEP-BY-STEP DEPLOYMENT

### Step 1: Open Supabase Dashboard

1. Go to: **https://app.supabase.com**
2. Login to your account
3. Select your project: **st-haroon-online-school**
4. Click on **SQL Editor** in the left sidebar

### Step 2: Clear Existing Schema (Optional)

If you want a fresh start, create a **New Query** and run:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Click **Run** (or press Ctrl+Enter)

### Step 3: Deploy Migration Files

For each file below, do this:
1. Click **New Query** in SQL Editor
2. Open the file from `supabase/migrations/` folder
3. Copy ALL the content
4. Paste into SQL Editor
5. Click **Run**
6. Wait for "Success" message
7. Move to next file

**Files in Order:**

```
✅ 1.  20250101000000_initial_setup.sql
✅ 2.  20250101000001_create_enums.sql
✅ 3.  20250101000002_create_users_tables.sql
✅ 4.  20250101000003_create_courses_tables.sql
✅ 5.  20250101000004_create_assessments_tables.sql
✅ 6.  20250101000005_create_enrollments_progress.sql
✅ 7.  20250101000006_create_payments_tables.sql
✅ 8.  20250101000007_create_live_classes_tables.sql
✅ 9.  20250101000008_create_notifications_tables.sql
✅ 10. 20250101000009_create_support_tables.sql
✅ 11. 20250101000010_create_content_library_tables.sql
✅ 12. 20250101000011_create_subjects_tables.sql
✅ 13. 20250101000012_create_functions.sql
✅ 14. 20250101000013_create_triggers.sql
✅ 15. 20250101000014_enable_rls.sql
✅ 16. 20250101000015_create_rls_policies.sql
✅ 17. 20250101000018_add_critical_missing_tables.sql
✅ 18. 20250101000019_missing_rls_policies.sql
✅ 19. 20250101000020_final_missing_tables.sql
✅ 20. 20250101000021_final_rls_policies.sql
```

### Step 4: Verify Deployment

After running all files, create a **New Query** and run:

```sql
-- Check table count
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should return 50+
```

---

## ⏱️ TIME ESTIMATE

- **Per file:** 30 seconds
- **Total time:** ~10-15 minutes
- **Difficulty:** Easy (just copy/paste)

---

## 🚨 IF YOU GET ERRORS

### Error: "type already exists"
**Solution:** You already have some schema. Run the reset SQL from Step 2 first.

### Error: "relation already exists"
**Solution:** Same as above - reset first.

### Error: "syntax error"
**Solution:** Make sure you copied the ENTIRE file content, including the first and last lines.

---

## ✅ SUCCESS INDICATORS

After all files are run, you should see:
- No error messages in SQL Editor
- "Success. No rows returned" or similar message
- Table count query returns 50+

---

## 📊 VERIFICATION QUERIES

Run these after deployment to verify everything worked:

```sql
-- 1. Count tables (should be 50+)
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- 2. List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Check RLS is enabled
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- 4. Check policies exist
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```

---

## 🎉 AFTER DEPLOYMENT

Once all migrations are deployed:

1. ✅ Your database is ready
2. ✅ All 50+ tables are created
3. ✅ RLS policies are active
4. ✅ Functions and triggers are working
5. ✅ Your Next.js app can connect

---

## 💡 PRO TIP

You can keep the SQL Editor tab open and just:
1. Open each migration file in VS Code
2. Copy content (Ctrl+A, Ctrl+C)
3. Paste in SQL Editor (Ctrl+V)
4. Run (Ctrl+Enter)
5. Repeat for next file

This makes it very fast!

---

**Ready to start? Open Supabase Dashboard and begin with file #1!** 🚀
