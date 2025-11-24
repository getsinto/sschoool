# 🚀 QUICK DEPLOYMENT COMMANDS

## ONE-LINE DEPLOYMENT

```bash
supabase db push
```

That's it! This single command will deploy all 20 migration files.

---

## FULL DEPLOYMENT SEQUENCE

```bash
# 1. Check if Supabase CLI is installed
supabase --version

# 2. Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# 3. Check connection
supabase status

# 4. Deploy all migrations
supabase db push

# 5. Verify deployment
# (Run the verification queries in Supabase SQL Editor)
```

---

## VERIFICATION QUERIES

Copy and paste into Supabase SQL Editor after deployment:

```sql
-- Quick verification (all in one)
SELECT 
    'Tables' as check_type,
    COUNT(*)::text as count,
    CASE WHEN COUNT(*) >= 50 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.tables 
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'Enums' as check_type,
    COUNT(*)::text as count,
    CASE WHEN COUNT(*) >= 20 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_type 
WHERE typtype = 'e'

UNION ALL

SELECT 
    'RLS Enabled' as check_type,
    COUNT(*)::text as count,
    CASE WHEN COUNT(*) >= 50 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true

UNION ALL

SELECT 
    'Policies' as check_type,
    COUNT(*)::text as count,
    CASE WHEN COUNT(*) >= 50 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## IF YOU GET ERRORS

### Error: "type already exists"
```bash
# Reset and redeploy
supabase db reset
supabase db push
```

### Error: "not linked to any project"
```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### Error: "permission denied"
```bash
# Check your credentials
supabase link --project-ref YOUR_PROJECT_REF
# Make sure you're using the correct project
```

---

## ALTERNATIVE: Manual Deployment via Dashboard

If CLI doesn't work, use Supabase Dashboard:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste each migration file content (in order)
6. Click **Run** for each file

**Order:**
1. `20250101000000_initial_setup.sql`
2. `20250101000001_create_enums.sql`
3. `20250101000002_create_users_tables.sql`
4. ... (continue in numerical order)
5. `20250101000021_final_rls_policies.sql`

---

## WHAT TO EXPECT

**Deployment time:** 2-5 minutes  
**Files processed:** 20 migration files  
**Tables created:** 50+  
**Enums created:** 20+  
**Policies created:** 50+  

**Success message:**
```
Finished supabase db push.
```

---

## NEXT STEPS AFTER DEPLOYMENT

1. ✅ Run verification queries
2. ✅ Test user registration
3. ✅ Test course creation
4. ✅ Update environment variables in your app
5. ✅ Deploy your Next.js application

---

## 🆘 NEED HELP?

If you encounter any errors:
1. Copy the **entire error message**
2. Note which **migration file** failed
3. Share with me and I'll provide the fix immediately

---

**Ready? Run this now:**

```bash
supabase db push
```
