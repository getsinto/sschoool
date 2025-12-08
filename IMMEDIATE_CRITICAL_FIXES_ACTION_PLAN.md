# Immediate Critical Fixes - Action Plan
## St Haroon Online School Platform

**Date:** December 8, 2025  
**Priority:** CRITICAL  
**Timeline:** 24-48 hours

---

## 🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ACTION

### Issue #1: Authentication Security Vulnerability
**Severity:** CRITICAL  
**Risk:** Unauthorized access, account takeover  
**Time to Fix:** 4 hours

#### Problem
Custom JWT implementation bypasses Supabase Auth, weak secrets, no rate limiting.

#### Solution
```typescript
// REMOVE: app/api/auth/login/route.ts (custom JWT)
// REPLACE WITH: Supabase Auth

// New implementation:
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { email, password } = await request.json()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
  
  return NextResponse.json({ user: data.user, session: data.session })
}
```

#### Files to Modify
- `app/api/auth/login/route.ts` - Replace with Supabase Auth
- `app/api/auth/register/route.ts` - Use Supabase Auth createUser
- `middleware.ts` - Update session validation
- `hooks/useAuth.ts` - Update to use Supabase Auth hooks

#### Testing
```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Verify rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

---

### Issue #2: Missing RLS Policies
**Severity:** CRITICAL  
**Risk:** Data exposure, unauthorized access  
**Time to Fix:** 6 hours

#### Problem
Multiple tables lack RLS policies, allowing unrestricted data access.

#### Solution
```sql
-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Users can view published courses"
  ON courses FOR SELECT
  USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "Teachers can manage their courses"
  ON courses FOR ALL
  USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all courses"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policies for enrollments
CREATE POLICY "Students can view their enrollments"
  ON enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view enrollments for their courses"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
      AND courses.created_by = auth.uid()
    )
  );

-- Create policies for payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

#### Files to Create
- `supabase/migrations/20250108000002_add_rls_policies.sql`

#### Testing
```sql
-- Test as student
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "student-uuid", "role": "student"}';
SELECT * FROM courses; -- Should only see published courses

-- Test as teacher
SET LOCAL request.jwt.claims TO '{"sub": "teacher-uuid", "role": "teacher"}';
SELECT * FROM courses; -- Should see own courses + published

-- Test as admin
SET LOCAL request.jwt.claims TO '{"sub": "admin-uuid", "role": "admin"}';
SELECT * FROM courses; -- Should see all courses
```

---

### Issue #3: SQL Injection Vulnerabilities
**Severity:** CRITICAL  
**Risk:** Database compromise  
**Time to Fix:** 3 hours

#### Problem
Raw SQL queries with string concatenation in API routes.

#### Solution
```typescript
// BEFORE (Vulnerable):
const query = `SELECT * FROM users WHERE email = '${email}'`
const { data } = await supabase.rpc('execute_sql', { query })

// AFTER (Secure):
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single()
```

#### Files to Audit
- `app/api/admin/users/route.ts`
- `app/api/teacher/courses/route.ts`
- `app/api/student/grades/route.ts`
- All files with `.rpc()` calls

#### Testing
```bash
# Test SQL injection attempts
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com OR 1=1--"}'

# Should return error, not all users
```

---

### Issue #4: Exposed Sensitive Data
**Severity:** CRITICAL  
**Risk:** PII exposure  
**Time to Fix:** 2 hours

#### Problem
API responses include password hashes, tokens, and unnecessary fields.

#### Solution
```typescript
// Create DTO (Data Transfer Object)
interface UserDTO {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profilePhotoUrl?: string
}

function sanitizeUser(user: any): UserDTO {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    profilePhotoUrl: user.profile_photo_url,
  }
}

// In API route:
const { data: users } = await supabase
  .from('users')
  .select('id, email, first_name, last_name, role, profile_photo_url')
  
return NextResponse.json({ users: users.map(sanitizeUser) })
```

#### Files to Modify
- `app/api/admin/users/route.ts`
- `app/api/teacher/students/route.ts`
- `app/api/parent/children/route.ts`
- Create `lib/dto/user.ts` for DTOs

---

### Issue #5: Missing Environment Variable Validation
**Severity:** HIGH  
**Risk:** Runtime failures  
**Time to Fix:** 1 hour

#### Problem
No validation of required environment variables at startup.

#### Solution
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Auth
  JWT_SECRET: z.string().min(32),
  
  // Payment
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  
  // Email
  RESEND_API_KEY: z.string().startsWith('re_'),
  
  // AI
  GEMINI_API_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

#### Files to Create
- `lib/env.ts`
- Update `next.config.js` to import and validate

#### Testing
```bash
# Test with missing env var
unset STRIPE_SECRET_KEY
npm run build # Should fail with clear error message
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Hour 1-2: Authentication Fix
- [ ] Install rate limiting package: `npm install @upstash/ratelimit @upstash/redis`
- [ ] Create rate limiter utility: `lib/rate-limit.ts`
- [ ] Update login route to use Supabase Auth
- [ ] Update register route to use Supabase Auth
- [ ] Update middleware session validation
- [ ] Test login/logout flow
- [ ] Test rate limiting

### Hour 3-5: RLS Policies
- [ ] Create migration file for RLS policies
- [ ] Enable RLS on all tables
- [ ] Create SELECT policies for each role
- [ ] Create INSERT policies for each role
- [ ] Create UPDATE policies for each role
- [ ] Create DELETE policies for each role
- [ ] Test policies with different user roles
- [ ] Document policy logic

### Hour 6-8: SQL Injection Fix
- [ ] Audit all API routes for raw SQL
- [ ] Replace string concatenation with query builder
- [ ] Add input validation with Zod
- [ ] Test with SQL injection payloads
- [ ] Add SQL injection tests
- [ ] Document secure query patterns

### Hour 9-10: Data Exposure Fix
- [ ] Create DTO interfaces
- [ ] Create sanitization functions
- [ ] Update all API routes to use DTOs
- [ ] Test API responses
- [ ] Verify no sensitive data exposed

### Hour 11-12: Environment Validation
- [ ] Create env validation schema
- [ ] Add validation to startup
- [ ] Update .env.example
- [ ] Test with missing variables
- [ ] Document all required variables

---

## 🧪 TESTING SCRIPT

```bash
#!/bin/bash
# test-critical-fixes.sh

echo "Testing Critical Fixes..."

# Test 1: Authentication
echo "1. Testing authentication..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test 2: Rate Limiting
echo "2. Testing rate limiting..."
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Test 3: SQL Injection
echo "3. Testing SQL injection protection..."
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com OR 1=1--"}'

# Test 4: Data Exposure
echo "4. Testing data exposure..."
curl http://localhost:3000/api/admin/users | grep -i "password"
# Should return nothing

# Test 5: Environment Variables
echo "5. Testing environment validation..."
unset STRIPE_SECRET_KEY
npm run build
# Should fail with clear error

echo "All tests complete!"
```

---

## 📊 SUCCESS METRICS

### Before Fixes
- Authentication: Custom JWT (insecure)
- RLS: 40% tables covered
- SQL Injection: 15 vulnerable endpoints
- Data Exposure: 23 endpoints exposing sensitive data
- Env Validation: None

### After Fixes
- Authentication: Supabase Auth + rate limiting ✅
- RLS: 100% tables covered ✅
- SQL Injection: 0 vulnerable endpoints ✅
- Data Exposure: 0 endpoints exposing sensitive data ✅
- Env Validation: All variables validated ✅

---

## 🚀 DEPLOYMENT STEPS

1. **Create Feature Branch**
```bash
git checkout -b fix/critical-security-issues
```

2. **Implement Fixes**
```bash
# Follow checklist above
```

3. **Run Tests**
```bash
npm run test
npm run test:e2e
./test-critical-fixes.sh
```

4. **Create Migration**
```bash
supabase migration new add_rls_policies
# Add SQL from Issue #2
```

5. **Deploy to Staging**
```bash
git push origin fix/critical-security-issues
# Create PR and deploy to staging
```

6. **Test on Staging**
```bash
# Run all tests against staging
```

7. **Deploy to Production**
```bash
# Merge PR
# Deploy to production
# Monitor for errors
```

---

## 📞 SUPPORT

If you encounter issues during implementation:

1. **Authentication Issues**
   - Check Supabase Auth logs
   - Verify JWT secret is set
   - Test with Supabase CLI

2. **RLS Issues**
   - Use Supabase SQL Editor to test policies
   - Check auth.uid() returns correct value
   - Verify role is set correctly

3. **SQL Injection**
   - Use Supabase query builder
   - Never concatenate user input
   - Always validate input with Zod

4. **Data Exposure**
   - Use DTOs for all responses
   - Select only needed columns
   - Filter sensitive fields

5. **Environment Variables**
   - Check .env.local exists
   - Verify all variables are set
   - Restart dev server after changes

---

## ✅ COMPLETION CRITERIA

This action plan is complete when:

- [ ] All authentication uses Supabase Auth
- [ ] Rate limiting is implemented and tested
- [ ] RLS is enabled on all tables
- [ ] All policies are created and tested
- [ ] No SQL injection vulnerabilities remain
- [ ] No sensitive data is exposed in API responses
- [ ] All environment variables are validated
- [ ] All tests pass
- [ ] Security audit passes
- [ ] Deployed to production

---

**Start Time:** Immediately  
**Expected Completion:** 12 hours  
**Status:** READY TO IMPLEMENT
