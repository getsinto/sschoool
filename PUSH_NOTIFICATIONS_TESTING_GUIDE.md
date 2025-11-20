# Push Notifications System - Testing Guide

## Complete Testing Checklist

This guide provides step-by-step instructions to test every aspect of the notification system.

---

## Pre-Testing Setup

### 1. Verify Installation
- [ ] `web-push` package installed
- [ ] VAPID keys generated and in `.env.local`
- [ ] Database migration run successfully
- [ ] All tables exist in database
- [ ] Service worker file exists at `public/sw.js`

### 2. Check Environment Variables
```bash
# Verify these are set
echo $NEXT_PUBLIC_VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY
echo $VAPID_SUBJECT
```

---

## Phase 1: Database Testing

### Test 1.1: Verify Tables Exist
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'notifications',
  'notification_preferences',
  'push_subscriptions',
  'notification_delivery_log'
);
```

**Expected Result:** All 4 tables listed

### Test 1.2: Test RLS Policies
```sql
-- Should return empty (no notifications yet)
SELECT * FROM notifications LIMIT 5;

-- Should return default preferences or empty
SELECT * FROM notification_preferences LIMIT 5;
```

**Expected Result:** Queries execute without errors

### Test 1.3: Test Database Functions
```sql
-- Test unread count function
SELECT get_unread_notification_count('your-user-id-here');

-- Test mark all read function
SELECT mark_all_notifications_read('your-user-id-here');
```

**Expected Result:** Functions execute and return integers

---

## Phase 2: UI Component Testing

### Test 2.1: Notification Bell Component
1. Navigate to your dashboard
2. Look for bell icon in header
3. Verify unread count badge (should be 0 initially)
4. Click bell icon
5. Verify dropdown opens
6. Verify "No notifications yet" message appears

**Expected Result:** ✅ Bell icon visible, dropdown works, shows empty state

### Test 2.2: Notifications Page
1. Navigate to `/notifications`
2. Verify page loads without errors
3. Check tabs: All, Unread, Read
4. Verify stats cards show: Total (0), Unread (0), Read (0)
5. Verify filters are visible
6. Verify "All caught up!" message appears

**Expected Result:** ✅ Page loads, all UI elements present

### Test 2.3: Notification Settings Page
1. Navigate to `/settings/notifications`
2. Verify page loads without errors
3. Check all sections:
   - Delivery Methods (Email, Push, SMS)
   - Notification Types (9 types)
   - Additional Settings (Sound, Quiet Hours)
4. Toggle some switches
5. Click "Save Preferences"
6. Verify success message

**Expected Result:** ✅ Page loads, all controls work, saves successfully

---

## Phase 3: API Route Testing

### Test 3.1: GET Notifications
```bash
curl -X GET "http://localhost:3000/api/notifications" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:** Returns `{ notifications: [] }`

### Test 3.2: GET Notification Stats
```bash
curl -X GET "http://localhost:3000/api/notifications/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:** Returns `{ unread: 0, total: 0 }`

### Test 3.3: GET Preferences
```bash
curl -X GET "http://localhost:3000/api/notifications/preferences" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:** Returns default preferences object

### Test 3.4: POST Preferences
```bash
curl -X POST "http://localhost:3000/api/notifications/preferences" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_notifications": true,
    "push_notifications": false,
    "notification_sound": true
  }'
```

**Expected Result:** Returns `{ success: true }`

---

## Phase 4: Push Notification Testing

### Test 4.1: Check Browser Support
1. Open browser console
2. Run:
```javascript
console.log('Service Worker:', 'serviceWorker' in navigator);
console.log('Push Manager:', 'PushManager' in window);
console.log('Notifications:', 'Notification' in window);
```

**Expected Result:** All three should be `true`

### Test 4.2: Register Service Worker
1. Open DevTools → Application → Service Workers
2. Verify `/sw.js` is registered
3. Check status is "activated"

**Expected Result:** ✅ Service worker registered and active

### Test 4.3: Request Notification Permission
1. Go to `/settings/notifications`
2. Toggle "Push Notifications" ON
3. Browser should prompt for permission
4. Click "Allow"

**Expected Result:** ✅ Permission granted, toggle stays ON

### Test 4.4: Subscribe to Push
1. After enabling push (Test 4.3)
2. Check browser console for subscription object
3. Verify no errors

**Expected Result:** ✅ Subscription created successfully

### Test 4.5: Verify Subscription in Database
```sql
SELECT * FROM push_subscriptions 
WHERE user_id = 'your-user-id-here';
```

**Expected Result:** One row with endpoint, p256dh, and auth keys

### Test 4.6: Send Test Push Notification
1. In `/settings/notifications`
2. Click "Send Test Notification"
3. Wait a few seconds
4. Check for push notification

**Expected Result:** ✅ Push notification appears with test message

---

## Phase 5: Real-Time Notification Testing

### Test 5.1: Create Test Notification via API
```bash
curl -X POST "http://localhost:3000/api/notifications/send" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "system",
    "title": "Test Notification",
    "message": "This is a test notification",
    "priority": "normal"
  }'
```

**Expected Result:** Returns `{ success: true, notificationId: "..." }`

### Test 5.2: Verify Notification Appears
1. Check bell icon - unread count should be 1
2. Click bell - notification should appear in dropdown
3. Go to `/notifications` - notification should be in list

**Expected Result:** ✅ Notification appears in all places

### Test 5.3: Test Real-Time Updates
1. Open two browser windows side by side
2. In Window 1, stay on `/notifications`
3. In Window 2, send a test notification (Test 5.1)
4. Watch Window 1 for real-time update

**Expected Result:** ✅ Notification appears instantly in Window 1

### Test 5.4: Test Notification Sound
1. Ensure sound is enabled in settings
2. Send a test notification
3. Listen for notification sound

**Expected Result:** ✅ Sound plays (or error if sound file missing)

### Test 5.5: Test Browser Notification
1. Ensure push notifications enabled
2. Send a test notification
3. Check for browser notification popup

**Expected Result:** ✅ Browser notification appears

---

## Phase 6: Notification Actions Testing

### Test 6.1: Mark as Read
1. Create a test notification
2. Click on the notification
3. Verify it's marked as read (no blue dot)
4. Check unread count decreases

**Expected Result:** ✅ Notification marked as read

### Test 6.2: Mark All as Read
1. Create multiple test notifications
2. Click "Mark all as read" button
3. Verify all notifications marked as read
4. Verify unread count is 0

**Expected Result:** ✅ All notifications marked as read

### Test 6.3: Delete Notification
1. Hover over a notification
2. Click delete button
3. Verify notification removed from list
4. Verify count updates

**Expected Result:** ✅ Notification deleted

### Test 6.4: Bulk Delete
1. Create multiple notifications
2. Select multiple notifications (if implemented)
3. Click bulk delete
4. Verify all selected notifications deleted

**Expected Result:** ✅ Multiple notifications deleted

---

## Phase 7: Notification Template Testing

### Test 7.1: Course Notification
```typescript
await NotificationDelivery.sendFromTemplate(
  'course.new_lesson',
  userId,
  {
    lessonTitle: 'Introduction to React',
    courseName: 'Web Development 101',
    lessonId: 'lesson123',
    courseId: 'course123'
  }
);
```

**Expected Result:** ✅ Notification created with correct title and message

### Test 7.2: Assignment Notification
```typescript
await NotificationDelivery.sendFromTemplate(
  'assignment.due_soon',
  userId,
  {
    assignmentTitle: 'Math Homework',
    assignmentId: 'assign123'
  }
);
```

**Expected Result:** ✅ High priority notification with urgent styling

### Test 7.3: Grade Notification
```typescript
await NotificationDelivery.sendFromTemplate(
  'grade.posted',
  userId,
  {
    itemName: 'Midterm Exam',
    grade: '95/100'
  }
);
```

**Expected Result:** ✅ Notification with grade information

### Test 7.4: Test All Templates
Create a test script to send one of each template type and verify they all work.

---

## Phase 8: Filter and Search Testing

### Test 8.1: Filter by Type
1. Create notifications of different types
2. Use type filter dropdown
3. Select "Assignment"
4. Verify only assignment notifications shown

**Expected Result:** ✅ Filter works correctly

### Test 8.2: Filter by Read Status
1. Mark some notifications as read
2. Use read status filter
3. Select "Unread only"
4. Verify only unread notifications shown

**Expected Result:** ✅ Filter works correctly

### Test 8.3: Filter by Priority
1. Create notifications with different priorities
2. Use priority filter
3. Select "High"
4. Verify only high priority notifications shown

**Expected Result:** ✅ Filter works correctly

---

## Phase 9: Preference Testing

### Test 9.1: Disable Email Notifications
1. Go to settings
2. Disable email notifications
3. Save preferences
4. Send test notification
5. Verify no email sent (check email)

**Expected Result:** ✅ No email received

### Test 9.2: Disable Notification Type
1. Go to settings
2. Disable "Course" notifications
3. Save preferences
4. Send course notification
5. Verify notification not created

**Expected Result:** ✅ Notification not created

### Test 9.3: Quiet Hours
1. Go to settings
2. Enable quiet hours (set to current time range)
3. Save preferences
4. Send test notification
5. Verify notification queued or not sent

**Expected Result:** ✅ Notification respects quiet hours

---

## Phase 10: Error Handling Testing

### Test 10.1: Invalid Notification Data
```bash
curl -X POST "http://localhost:3000/api/notifications/send" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid_type"
  }'
```

**Expected Result:** Returns error message

### Test 10.2: Unauthorized Access
```bash
curl -X GET "http://localhost:3000/api/notifications"
```

**Expected Result:** Returns 401 Unauthorized

### Test 10.3: Invalid Push Subscription
Try subscribing with invalid data and verify error handling.

**Expected Result:** Error handled gracefully

---

## Phase 11: Performance Testing

### Test 11.1: Load Many Notifications
1. Create 100+ test notifications
2. Navigate to `/notifications`
3. Check page load time
4. Verify pagination works
5. Check for performance issues

**Expected Result:** ✅ Page loads quickly, no lag

### Test 11.2: Real-Time with Many Notifications
1. Have many notifications in database
2. Send new notification
3. Verify real-time update still fast

**Expected Result:** ✅ Real-time update instant

### Test 11.3: Database Query Performance
```sql
EXPLAIN ANALYZE
SELECT * FROM notifications
WHERE user_id = 'your-user-id'
AND read = false
ORDER BY created_at DESC
LIMIT 50;
```

**Expected Result:** Query uses indexes, executes quickly

---

## Phase 12: Cross-Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

For each browser, verify:
- [ ] UI renders correctly
- [ ] Push notifications work
- [ ] Service worker registers
- [ ] Real-time updates work
- [ ] Sounds play

---

## Phase 13: Mobile Testing

### Test on Mobile Devices
1. Open site on mobile device
2. Enable push notifications
3. Send test notification
4. Verify mobile push notification appears
5. Test notification actions on mobile

**Expected Result:** ✅ Works on mobile

---

## Common Issues and Solutions

### Issue: Push notifications not appearing
**Solution:**
- Check browser notification permission
- Verify VAPID keys are correct
- Check service worker is registered
- Look for errors in console

### Issue: Real-time not working
**Solution:**
- Check Supabase Realtime is enabled
- Verify WebSocket connection in Network tab
- Check for authentication errors

### Issue: Database errors
**Solution:**
- Verify migration ran successfully
- Check RLS policies
- Ensure user is authenticated

### Issue: Service worker not registering
**Solution:**
- Check `/sw.js` file exists
- Verify HTTPS (required for service workers)
- Clear browser cache and try again

---

## Test Results Template

Use this template to track your testing:

```
## Test Results - [Date]

### Phase 1: Database ✅ / ❌
- Tables exist: ✅
- RLS policies work: ✅
- Functions work: ✅

### Phase 2: UI Components ✅ / ❌
- Bell component: ✅
- Notifications page: ✅
- Settings page: ✅

### Phase 3: API Routes ✅ / ❌
- GET notifications: ✅
- GET stats: ✅
- POST preferences: ✅

### Phase 4: Push Notifications ✅ / ❌
- Browser support: ✅
- Service worker: ✅
- Permission request: ✅
- Subscription: ✅
- Test push: ✅

### Phase 5: Real-Time ✅ / ❌
- Create notification: ✅
- Appears in UI: ✅
- Real-time update: ✅
- Sound plays: ✅
- Browser notification: ✅

### Phase 6: Actions ✅ / ❌
- Mark as read: ✅
- Mark all read: ✅
- Delete: ✅
- Bulk delete: ✅

### Phase 7: Templates ✅ / ❌
- Course: ✅
- Assignment: ✅
- Grade: ✅
- All templates: ✅

### Phase 8: Filters ✅ / ❌
- By type: ✅
- By read status: ✅
- By priority: ✅

### Phase 9: Preferences ✅ / ❌
- Disable email: ✅
- Disable type: ✅
- Quiet hours: ✅

### Phase 10: Error Handling ✅ / ❌
- Invalid data: ✅
- Unauthorized: ✅
- Invalid subscription: ✅

### Phase 11: Performance ✅ / ❌
- Many notifications: ✅
- Real-time performance: ✅
- Query performance: ✅

### Phase 12: Cross-Browser ✅ / ❌
- Chrome: ✅
- Firefox: ✅
- Safari: ✅
- Mobile: ✅

### Issues Found:
1. [List any issues]

### Notes:
[Any additional notes]
```

---

## Automated Testing Script

Create this test file to automate some tests:

```typescript
// tests/notifications.test.ts
import { NotificationDelivery } from '@/lib/notifications/delivery';

describe('Notification System', () => {
  test('should create notification', async () => {
    const id = await NotificationDelivery.send({
      user_id: 'test-user',
      type: 'system',
      title: 'Test',
      message: 'Test message',
      priority: 'normal'
    });
    
    expect(id).toBeTruthy();
  });

  test('should use template', async () => {
    const id = await NotificationDelivery.sendFromTemplate(
      'course.new_lesson',
      'test-user',
      {
        lessonTitle: 'Test Lesson',
        courseName: 'Test Course',
        lessonId: '123',
        courseId: '456'
      }
    );
    
    expect(id).toBeTruthy();
  });

  // Add more tests...
});
```

---

## Final Checklist

Before marking the system as complete:

- [ ] All database tables created and working
- [ ] All UI components render correctly
- [ ] All API routes respond correctly
- [ ] Push notifications work in at least 2 browsers
- [ ] Real-time updates work
- [ ] Notification sounds work (or disabled)
- [ ] All notification templates tested
- [ ] Filters and search work
- [ ] Preferences save and apply correctly
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] Mobile testing complete
- [ ] Documentation complete
- [ ] No console errors
- [ ] No database errors

---

**Testing Status:** Ready to Begin

Follow this guide systematically to ensure complete test coverage of the notification system.
