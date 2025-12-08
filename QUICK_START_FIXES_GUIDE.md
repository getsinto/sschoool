# Quick Start Guide - Critical Fixes
## St Haroon Online School Platform

**For:** Developers starting implementation  
**Time:** 5 minutes to understand, 12 hours to implement critical fixes

---

## 🚨 START HERE

### What You Need to Know

Your platform is **functionally complete** but has **5 critical security issues** that must be fixed before production:

1. ❌ Custom JWT (should use Supabase Auth)
2. ❌ No rate limiting (brute force vulnerability)
3. ❌ Missing RLS policies (data exposure)
4. ❌ SQL injection vulnerabilities
5. ❌ Sensitive data in API responses

---

## 📁 Files to Read (In Order)

1. **PRODUCTION_FIXES_SUMMARY.md** (5 min) - Overview
2. **.kiro/specs/production-optimization-fixes/requirements.md** (15 min) - What to build
3. **.kiro/specs/production-optimization-fixes/design.md** (20 min) - How to build it
4. **.kiro/specs/production-optimization-fixes/tasks.md** (10 min) - Step-by-step plan

---

## ⚡ Quick Implementation Path

### Step 1: Set Up Infrastructure (30 min)

```bash
# Install dependencies
npm install @upstash/ratelimit @upstash/redis zod

# Create accounts
# 1. Upstash Redis: https://upstash.com
# 2. Sentry: https://sentry.io

# Add to .env.local
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
SENTRY_DSN=your_dsn
```

### Step 2: Fix Authentication (2 hours)

```typescript
// BEFORE: app/api/auth/login/route.ts
const token = jwt.sign({ userId }, JWT_SECRET)

// AFTER: Use Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

**Files to modify:**
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `hooks/useAuth.ts`
- `middleware.ts`

### Step 3: Add Rate Limiting (1 hour)

```typescript
// lib/rate-limit/limiter.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
})

// In API route:
const { success } = await authRateLimit.limit(ip)
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
}
```

### Step 4: Add RLS Policies (3 hours)

```sql
-- supabase/migrations/20250108000002_add_rls_policies.sql

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Admin policy
CREATE POLICY "admins_all_access"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Teacher policy
CREATE POLICY "teachers_own_courses"
  ON courses FOR ALL
  USING (created_by = auth.uid());

-- Student policy
CREATE POLICY "students_enrolled_courses"
  ON courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = courses.id
      AND enrollments.student_id = auth.uid()
    )
  );
```

### Step 5: Fix SQL Injection (2 hours)

```typescript
// BEFORE (Vulnerable):
const query = `SELECT * FROM users WHERE email = '${email}'`

// AFTER (Secure):
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single()
```

**Search for these patterns:**
- Raw SQL queries
- String concatenation in queries
- `.rpc()` calls with user input

### Step 6: Add Data Sanitization (2 hours)

```typescript
// lib/dto/user.dto.ts
export interface UserDTO {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export function sanitizeUser(user: any): UserDTO {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
  }
}

// In API route:
const { data: users } = await supabase
  .from('users')
  .select('id, email, first_name, last_name, role')

return NextResponse.json({ users: users.map(sanitizeUser) })
```

### Step 7: Add Environment Validation (1 hour)

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
})

export const env = envSchema.parse(process.env)
```

### Step 8: Test Everything (1 hour)

```bash
# Run tests
npm run test

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test rate limiting (should fail after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Test SQL injection (should return error, not data)
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com OR 1=1--"}'
```

---

## 📋 Checklist

### Critical Fixes (12 hours)
- [ ] Replace custom JWT with Supabase Auth (2h)
- [ ] Add rate limiting to auth endpoints (1h)
- [ ] Enable RLS on all tables (3h)
- [ ] Fix SQL injection vulnerabilities (2h)
- [ ] Implement data sanitization (2h)
- [ ] Add environment validation (1h)
- [ ] Test all fixes (1h)

### Verification
- [ ] All authentication uses Supabase Auth
- [ ] Rate limiting works (test with 10 requests)
- [ ] RLS policies prevent unauthorized access
- [ ] SQL injection attempts fail
- [ ] No password hashes in API responses
- [ ] Missing env vars cause startup failure

---

## 🧪 Testing Commands

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Lint
npm run lint

# Type check
npm run type-check

# Build
npm run build
```

---

## 🚀 Deployment

```bash
# 1. Create feature branch
git checkout -b fix/critical-security-issues

# 2. Implement fixes
# (Follow steps above)

# 3. Run tests
npm run test
npm run build

# 4. Create migration
supabase migration new add_rls_policies
# Add SQL from Step 4

# 5. Push to staging
git push origin fix/critical-security-issues
# Create PR and deploy to staging

# 6. Test on staging
# Run all tests against staging URL

# 7. Deploy to production
# Merge PR and deploy
```

---

## 📊 Success Criteria

### Before Fixes
- ❌ Custom JWT authentication
- ❌ No rate limiting
- ❌ 40% RLS coverage
- ❌ 15 SQL injection vulnerabilities
- ❌ 23 endpoints exposing sensitive data

### After Fixes
- ✅ Supabase Auth
- ✅ Rate limiting on all endpoints
- ✅ 100% RLS coverage
- ✅ 0 SQL injection vulnerabilities
- ✅ 0 endpoints exposing sensitive data

---

## 🆘 Common Issues

### Issue: Supabase Auth not working
**Solution:** Check environment variables are set correctly
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Issue: Rate limiting not working
**Solution:** Verify Upstash Redis connection
```typescript
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
await redis.ping() // Should return "PONG"
```

### Issue: RLS policies blocking queries
**Solution:** Check auth.uid() returns correct value
```sql
SELECT auth.uid(); -- Should return user ID
SELECT * FROM users WHERE id = auth.uid(); -- Should return current user
```

### Issue: Tests failing
**Solution:** Check test database is set up
```bash
supabase start
supabase db reset
npm run test
```

---

## 📞 Need Help?

### Documentation
- [Full Spec](.kiro/specs/production-optimization-fixes/)
- [Detailed Audit](COMPREHENSIVE_PRODUCTION_AUDIT_DEC_2025.md)
- [Action Plan](IMMEDIATE_CRITICAL_FIXES_ACTION_PLAN.md)

### External Resources
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

---

## ⏱️ Time Estimates

| Task | Time | Priority |
|------|------|----------|
| Authentication Fix | 2h | CRITICAL |
| Rate Limiting | 1h | CRITICAL |
| RLS Policies | 3h | CRITICAL |
| SQL Injection Fix | 2h | CRITICAL |
| Data Sanitization | 2h | CRITICAL |
| Env Validation | 1h | HIGH |
| Testing | 1h | HIGH |
| **Total** | **12h** | |

---

## ✅ Next Steps

1. **Read this guide** (5 min)
2. **Set up infrastructure** (30 min)
3. **Follow implementation steps** (12 hours)
4. **Run tests** (1 hour)
5. **Deploy to staging** (30 min)
6. **Test on staging** (1 hour)
7. **Deploy to production** (30 min)

**Total Time:** ~16 hours from start to production

---

**Created:** December 8, 2025  
**Status:** Ready to implement  
**Priority:** CRITICAL - Start immediately
