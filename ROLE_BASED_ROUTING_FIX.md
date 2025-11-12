# Role-Based Routing Fix

## Issues Fixed
1. ✅ Logout functionality added to dashboard layout
2. ✅ All sidebar links updated to use correct paths
3. ✅ Layout now detects role from URL path
4. ✅ Created test user creation endpoint
5. ✅ Created debug endpoint to check user role

## Testing Instructions

### Step 1: Create Test Users
Run this command in your browser console or use a tool like Postman:

```bash
POST http://localhost:3000/api/create-role-users
```

This will create 4 test users:
- `student@test.com` / `password123` (Student role)
- `teacher@test.com` / `password123` (Teacher role)
- `parent@test.com` / `password123` (Parent role)
- `admin@test.com` / `password123` (Admin role)

### Step 2: Test Login for Each Role

1. **Test Student Login:**
   - Email: `student@test.com`
   - Password: `password123`
   - Should redirect to: `http://localhost:3000/student`
   - Should see: Student Portal sidebar

2. **Test Teacher Login:**
   - Email: `teacher@test.com`
   - Password: `password123`
   - Should redirect to: `http://localhost:3000/teacher`
   - Should see: Teacher Portal sidebar

3. **Test Parent Login:**
   - Email: `parent@test.com`
   - Password: `password123`
   - Should redirect to: `http://localhost:3000/parent`
   - Should see: Parent Portal sidebar

4. **Test Admin Login:**
   - Email: `admin@test.com`
   - Password: `password123`
   - Should redirect to: `http://localhost:3000/admin`
   - Should see: Admin Panel sidebar

### Step 3: Debug User Role
If you're still seeing issues, check what role is being detected:

```bash
GET http://localhost:3000/api/debug-user
```

This will show you:
- Current user's email
- Detected role from metadata
- Full user_metadata object
- Full app_metadata object

### Step 4: Test Logout
1. Click on the profile dropdown in the top right
2. Click "Logout"
3. Should redirect to login page
4. Session should be cleared

## Common Issues

### Issue: All users redirect to `/student`
**Cause:** User metadata doesn't have `user_type` field set

**Solution:** 
1. Check the debug endpoint: `GET /api/debug-user`
2. If `detected_role` is `null` or `undefined`, the user was created without the role
3. Recreate users using the `/api/create-role-users` endpoint

### Issue: Middleware not detecting role
**Cause:** The middleware reads from `session.user.user_metadata.user_type`

**Check:**
```javascript
// In middleware, this line gets the role:
const userRole = session.user.user_metadata?.user_type || session.user.app_metadata?.role
```

### Issue: Layout showing wrong sidebar
**Cause:** Layout detects role from URL path, not from user session

**How it works:**
```javascript
const isTeacher = pathname.startsWith('/teacher')
const isAdmin = pathname.startsWith('/admin')
const isStudent = pathname.startsWith('/student')
const isParent = pathname.startsWith('/parent')
```

This means if the middleware redirects correctly, the layout will show the right sidebar.

## How It Works

### 1. Login Flow
```
User logs in
  ↓
Login page reads user_metadata.user_type
  ↓
Redirects to role-specific dashboard:
  - student → /student
  - teacher → /teacher
  - parent → /parent
  - admin → /admin
```

### 2. Middleware Protection
```
User tries to access /admin
  ↓
Middleware checks user_metadata.user_type
  ↓
If not admin, redirects to their role dashboard
```

### 3. Layout Detection
```
User lands on /student
  ↓
Layout checks pathname.startsWith('/student')
  ↓
Shows student sidebar and "Student Portal" title
```

## Files Modified

1. **app/(dashboard)/layout.tsx**
   - Added logout functionality
   - Updated all sidebar links
   - Fixed role detection from pathname

2. **middleware.ts**
   - Already updated to use correct paths

3. **hooks/useUser.ts**
   - Already updated getDashboardUrl()

4. **app/auth/login/page.tsx**
   - Already updated getDashboardUrl()

## New Files Created

1. **app/api/create-role-users/route.ts**
   - Creates test users for all roles

2. **app/api/debug-user/route.ts**
   - Debug endpoint to check user role detection

## Next Steps

If you're still having issues:

1. Clear browser cache and cookies
2. Stop and restart the dev server
3. Use the debug endpoint to verify role detection
4. Check browser console for any errors
5. Verify test users were created correctly
