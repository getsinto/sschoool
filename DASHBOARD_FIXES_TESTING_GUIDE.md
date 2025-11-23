# Dashboard Fixes - Testing Guide

## Quick Testing Checklist

### 1. Test Notification Fix

**Expected Behavior:** "Successfully signed in!" should show ONLY ONCE at login

#### Steps:
1. ✅ **Login Test**
   - Go to login page
   - Enter credentials and login
   - ✅ Should see "Successfully signed in!" notification ONCE
   
2. ✅ **Tab Switch Test**
   - After logging in, switch to another browser tab
   - Wait 5 seconds
   - Switch back to the dashboard tab
   - ❌ Should NOT see "Successfully signed in!" notification
   
3. ✅ **Tab Close/Reopen Test**
   - Close the dashboard tab
   - Open a new tab and navigate to dashboard
   - ❌ Should NOT see "Successfully signed in!" notification
   - (Should just load the dashboard silently)

4. ✅ **Session Refresh Test**
   - Stay on dashboard for 5+ minutes
   - Click around the dashboard
   - ❌ Should NOT see "Successfully signed in!" notification

### 2. Test Role-Based Access Control

**Expected Behavior:** Users can ONLY access their role-specific dashboard

#### Test as Admin:
1. Login as admin user
2. Try to access: `http://localhost:3000/teacher`
   - ✅ Should redirect to `/admin`
3. Try to access: `http://localhost:3000/student`
   - ✅ Should redirect to `/admin`
4. Try to access: `http://localhost:3000/parent`
   - ✅ Should redirect to `/admin`
5. Access: `http://localhost:3000/admin`
   - ✅ Should work normally

#### Test as Teacher:
1. Login as teacher user
2. Try to access: `http://localhost:3000/admin`
   - ✅ Should redirect to `/teacher`
3. Try to access: `http://localhost:3000/student`
   - ✅ Should redirect to `/teacher`
4. Try to access: `http://localhost:3000/parent`
   - ✅ Should redirect to `/teacher`
5. Access: `http://localhost:3000/teacher`
   - ✅ Should work normally

#### Test as Student:
1. Login as student user
2. Try to access: `http://localhost:3000/admin`
   - ✅ Should redirect to `/student`
3. Try to access: `http://localhost:3000/teacher`
   - ✅ Should redirect to `/student`
4. Try to access: `http://localhost:3000/parent`
   - ✅ Should redirect to `/student`
5. Access: `http://localhost:3000/student`
   - ✅ Should work normally

#### Test as Parent:
1. Login as parent user
2. Try to access: `http://localhost:3000/admin`
   - ✅ Should redirect to `/parent`
3. Try to access: `http://localhost:3000/teacher`
   - ✅ Should redirect to `/parent`
4. Try to access: `http://localhost:3000/student`
   - ✅ Should redirect to `/parent`
5. Access: `http://localhost:3000/parent`
   - ✅ Should work normally

### 3. Test Generic Dashboard Route

**Expected Behavior:** `/dashboard` should redirect to role-specific dashboard

1. Login as admin → Navigate to `/dashboard` → Should redirect to `/admin`
2. Login as teacher → Navigate to `/dashboard` → Should redirect to `/teacher`
3. Login as student → Navigate to `/dashboard` → Should redirect to `/student`
4. Login as parent → Navigate to `/dashboard` → Should redirect to `/parent`

## Common Issues & Solutions

### Issue: Notification still showing multiple times
**Solution:** 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### Issue: Redirects not working
**Solution:**
- Verify user has `role` column in database
- Check middleware is running (add console.log)
- Verify API endpoint `/api/user/role` is accessible

### Issue: Getting 401 errors
**Solution:**
- User might not be properly authenticated
- Check Supabase session is valid
- Try logging out and back in

### Issue: Infinite redirect loop
**Solution:**
- Check user role matches one of: admin, teacher, student, parent
- Verify role value in database is lowercase
- Check middleware logic for typos

## Browser Console Tests

### Check User Role:
```javascript
fetch('/api/user/role')
  .then(r => r.json())
  .then(console.log)
// Should return: { role: 'admin', userId: '...' }
```

### Check Current Path:
```javascript
console.log(window.location.pathname)
// Should match your role: /admin, /teacher, /student, or /parent
```

## Database Verification

### Check User Roles in Database:
```sql
SELECT id, email, role FROM users;
```

Expected roles: `admin`, `teacher`, `student`, `parent`

### Fix Invalid Roles:
```sql
-- If user has wrong role
UPDATE users SET role = 'teacher' WHERE email = 'teacher@example.com';
```

## Performance Testing

### Measure Redirect Time:
1. Open browser DevTools → Network tab
2. Try accessing wrong dashboard
3. Check redirect time (should be < 200ms)

### Check API Response Time:
1. Open browser DevTools → Network tab
2. Look for `/api/user/role` request
3. Response time should be < 100ms

## Security Testing

### Try to Bypass Protection:
1. ✅ Manually change URL in address bar
2. ✅ Use browser back button to wrong dashboard
3. ✅ Open wrong dashboard in new tab
4. ✅ Bookmark wrong dashboard and try to access
5. ✅ Use browser history to access wrong dashboard

**All attempts should redirect to correct dashboard**

## Success Criteria

### Notification Fix:
- ✅ Login shows notification once
- ✅ Tab switching doesn't trigger notification
- ✅ Session refresh doesn't trigger notification
- ✅ No console errors

### Role-Based Access:
- ✅ Users can only access their dashboard
- ✅ Wrong dashboard access redirects correctly
- ✅ No 404 errors
- ✅ No infinite redirect loops
- ✅ Fast redirect performance (< 200ms)
- ✅ No console errors

## Troubleshooting Commands

### Check if middleware is running:
```bash
# Add this to middleware.ts temporarily
console.log('Middleware running for:', request.nextUrl.pathname)
```

### Check if role API is working:
```bash
curl http://localhost:3000/api/user/role
```

### Check browser storage:
```javascript
// In browser console
console.log('LocalStorage:', localStorage)
console.log('SessionStorage:', sessionStorage)
```

## Report Issues

If you find any issues during testing:

1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check network tab for failed requests
4. Note your user role and attempted URL
5. Take screenshots if helpful

---

**Testing Status:** Ready for QA  
**Priority:** High (Security Fix)  
**Estimated Testing Time:** 15-20 minutes
