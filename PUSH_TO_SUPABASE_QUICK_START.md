# 🚀 Push to Supabase - Quick Start

## ⚡ Fastest Method (2 Minutes)

### 1. Open Supabase Dashboard
```
https://supabase.com/dashboard
```

### 2. Go to SQL Editor
- Select your project
- Click "SQL Editor" in sidebar

### 3. Copy & Run SQL
- Open: `FIX_NOTIFICATIONS_PERMISSIONS_NOW.sql`
- Copy all (Ctrl+A, Ctrl+C)
- Paste in SQL Editor (Ctrl+V)
- Click "Run" (or Ctrl+Enter)

### 4. Verify
```sql
SELECT COUNT(*) FROM notifications;
```
Should return a count without errors ✅

---

## 🔧 Alternative: Use CLI

```powershell
# Install CLI (if needed)
npm install -g supabase

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push

# Verify
supabase db remote list
```

---

## 📜 Or Use Script

```powershell
.\scripts\push-database-migration.ps1
```

---

## ✅ What Gets Fixed

- ✅ Notifications permission denied errors
- ✅ RLS policies recreated properly
- ✅ Performance indexes added
- ✅ Chatbot 404 errors resolved
- ✅ All notification tables secured

---

## 📚 Full Documentation

See `PUSH_DATABASE_TO_SUPABASE_GUIDE.md` for:
- Detailed instructions
- Troubleshooting
- Verification steps
- Post-deployment testing

---

## 🎯 Recommended

**Use Method 1** (SQL Editor) - fastest and most reliable!

Time: 2 minutes | Difficulty: Easy ⭐
