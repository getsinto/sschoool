# Notifications System - Quick Reference Guide

Quick reference for developers working with the notification system.

---

## Quick Setup (5 minutes)

```bash
# 1. Install package
npm install web-push

# 2. Generate VAPID keys
npx web-push generate-vapid-keys

# 3. Add to .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your_public_key>
VAPID_PRIVATE_KEY=<your_private_key>
VAPID_SUBJECT=mailto:admin@yourdomain.com

# 4. Run migration
supabase db push
```

---

## Common Usage

### Send Notification with Template
```typescript
import { NotificationDelivery } from '@/lib/notifications/delivery';

await NotificationDelivery.sendFromTemplate(
  'assignment.new',  // Template key
  userId,            // Recipient
  {                  // Template data
    assignmentTitle: 'Math Homework',
    courseName: 'Math 101',
    dueDate: '2025-11-25',
    assignmentId: 'abc123',
    courseId: 'course123'
  }
);
```

### Send Custom Notification
```typescript
await NotificationDelivery.send({
  user_id: userId,
  type: 'course',
  title: 'New Lesson',
  message: 'Check out the new lesson',
  priority: 'normal',
  action_url: '/student/courses/123'
});
```

### Send to Multiple Users
```typescript
await NotificationDelivery.sendBulk(
  [userId1, userId2, userId3],
  {
    type: 'announcement',
    title: 'System Update',
    message: 'New features available',
    priority: 'normal'
  }
);
```

---

## Available Templates

### Course
- `course.new_lesson` - New lesson published
- `course.updated` - Course updated
- `course.completed` - Course completed

### Assignment
- `assignment.new` - New assignment
- `assignment.due_soon` - Due in 24 hours
- `assignment.graded` - Assignment graded
- `assignment.late` - Late reminder

### Quiz
- `quiz.available` - New quiz
- `quiz.graded` - Results posted
- `quiz.failed` - Retake available

### Grade
- `grade.posted` - New grade
- `grade.updated` - Grade updated
- `grade.alert` - Performance alert

### Live Class
- `live_class.starting_soon` - Starting in 15 min
- `live_class.rescheduled` - Class rescheduled
- `live_class.recording_available` - Recording ready

### Payment
- `payment.success` - Payment successful
- `payment.failed` - Payment failed
- `payment.refund` - Refund processed

### Message
- `message.teacher` - Message from teacher
- `message.admin` - Message from admin

### Announcement
- `announcement.new` - New announcement

### System
- `system.account_verified` - Account verified
- `system.profile_updated` - Profile updated
- `system.certificate_earned` - Certificate earned
- `system.badge_unlocked` - Badge unlocked

---

## Template Data Requirements

### assignment.new
```typescript
{
  assignmentTitle: string;
  courseName: string;
  dueDate: string;
  assignmentId: string;
  courseId: string;
}
```

### grade.posted
```typescript
{
  itemName: string;
  grade: string;
}
```

### live_class.starting_soon
```typescript
{
  className: string;
  classId: string;
}
```

### course.new_lesson
```typescript
{
  lessonTitle: string;
  courseName: string;
  lessonId: string;
  courseId: string;
}
```

---

## Priority Levels

```typescript
type Priority = 'low' | 'normal' | 'high' | 'urgent';
```

- **low** - Gray badge, no special handling
- **normal** - Blue badge, standard delivery
- **high** - Orange badge, prominent display
- **urgent** - Red badge, requires interaction

---

## UI Components

### Add Notification Bell to Header
```typescript
import NotificationBell from '@/components/notifications/NotificationBell';

<header>
  <NotificationBell />
</header>
```

### Use Notifications Hook
```typescript
import { useNotifications } from '@/hooks/useNotifications';

const {
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = useNotifications();
```

---

## API Endpoints

```typescript
// Get notifications
GET /api/notifications?type=course&read=false&limit=50

// Get single notification
GET /api/notifications/[id]

// Delete notification
DELETE /api/notifications/[id]

// Mark as read
POST /api/notifications/mark-read
Body: { notificationId: string }

// Mark all as read
POST /api/notifications/mark-all-read

// Get preferences
GET /api/notifications/preferences

// Update preferences
POST /api/notifications/preferences
Body: { email_notifications: boolean, ... }

// Get stats
GET /api/notifications/stats

// Send notification
POST /api/notifications/send
Body: { type, title, message, priority }

// Subscribe to push
POST /api/notifications/subscribe-push
Body: { subscription: PushSubscription }
```

---

## Database Queries

### Get unread count
```sql
SELECT get_unread_notification_count('user-id');
```

### Mark all as read
```sql
SELECT mark_all_notifications_read('user-id');
```

### Clean old notifications
```sql
SELECT cleanup_old_notifications();
SELECT cleanup_expired_notifications();
```

### Get recent notifications
```sql
SELECT * FROM notifications
WHERE user_id = 'user-id'
AND read = false
ORDER BY created_at DESC
LIMIT 10;
```

---

## Push Notifications

### Subscribe User
```typescript
import { subscribeToPushNotifications } from '@/lib/notifications/push';

const subscription = await subscribeToPushNotifications();
if (subscription) {
  await fetch('/api/notifications/subscribe-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription })
  });
}
```

### Check Support
```typescript
import { isPushNotificationSupported } from '@/lib/notifications/push';

if (isPushNotificationSupported()) {
  // Show push notification option
}
```

---

## Real-Time Updates

### Subscribe to Real-Time
```typescript
import { NotificationRealtime } from '@/lib/notifications/realtime';

// Subscribe
NotificationRealtime.subscribe(userId);

// Listen for notifications
const unsubscribe = NotificationRealtime.onNotification((notification) => {
  console.log('New notification:', notification);
});

// Listen for count changes
const unsubscribeCount = NotificationRealtime.onUnreadCountChange((count) => {
  console.log('Unread count:', count);
});

// Cleanup
unsubscribe();
unsubscribeCount();
NotificationRealtime.unsubscribe();
```

---

## Testing

### Send Test Notification
```bash
curl -X POST "http://localhost:3000/api/notifications/send" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "system",
    "title": "Test",
    "message": "Test notification",
    "priority": "normal"
  }'
```

### Check Database
```sql
-- Check notifications
SELECT * FROM notifications WHERE user_id = 'user-id' LIMIT 5;

-- Check preferences
SELECT * FROM notification_preferences WHERE user_id = 'user-id';

-- Check push subscriptions
SELECT * FROM push_subscriptions WHERE user_id = 'user-id';
```

---

## Troubleshooting

### Push Not Working
1. Check VAPID keys in .env
2. Verify service worker registered
3. Check browser permission
4. Look for console errors

### Real-Time Not Working
1. Check Supabase Realtime enabled
2. Verify WebSocket connection
3. Check authentication
4. Look for network errors

### Notifications Not Appearing
1. Check database for notification
2. Verify RLS policies
3. Check user authentication
4. Look for API errors

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Already configured
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## File Locations

### Core Files
- Templates: `lib/notifications/templates.ts`
- Delivery: `lib/notifications/delivery.ts`
- Push: `lib/notifications/push.ts`
- Real-time: `lib/notifications/realtime.ts`

### Components
- Bell: `components/notifications/NotificationBell.tsx`
- Dropdown: `components/notifications/NotificationDropdown.tsx`
- Item: `components/notifications/NotificationItem.tsx`
- List: `components/notifications/NotificationList.tsx`

### Pages
- Notifications: `app/(dashboard)/notifications/page.tsx`
- Settings: `app/(dashboard)/settings/notifications/page.tsx`

### API
- Main: `app/api/notifications/route.ts`
- Single: `app/api/notifications/[id]/route.ts`
- Preferences: `app/api/notifications/preferences/route.ts`
- Push: `app/api/notifications/subscribe-push/route.ts`

---

## Common Patterns

### Notify on Assignment Creation
```typescript
// In your assignment creation handler
const assignment = await createAssignment(data);

// Notify all students
const studentIds = await getEnrolledStudents(courseId);
await NotificationDelivery.sendBulk(
  studentIds,
  {
    type: 'assignment',
    title: `New Assignment: ${assignment.title}`,
    message: `Due: ${assignment.dueDate}`,
    priority: 'normal',
    action_url: `/student/assignments/${assignment.id}`
  }
);
```

### Notify on Grade Posted
```typescript
// In your grading handler
await NotificationDelivery.sendFromTemplate(
  'grade.posted',
  studentId,
  {
    itemName: assignment.title,
    grade: `${score}/${maxScore}`
  }
);
```

### Notify Before Live Class
```typescript
// In your scheduler (15 minutes before)
await NotificationDelivery.sendFromTemplate(
  'live_class.starting_soon',
  studentId,
  {
    className: liveClass.title,
    classId: liveClass.id
  }
);
```

---

## Performance Tips

1. **Use bulk sending** for multiple users
2. **Use templates** for consistency
3. **Set appropriate priorities** to avoid spam
4. **Clean old notifications** regularly
5. **Monitor delivery logs** for issues

---

## Security Notes

1. **Never expose VAPID private key** in client code
2. **Always validate user authentication** before sending
3. **Use RLS policies** for database access
4. **Sanitize notification content** if user-generated
5. **Rate limit** notification creation if needed

---

## Links

- Setup Guide: `PUSH_NOTIFICATIONS_SETUP_GUIDE.md`
- Testing Guide: `PUSH_NOTIFICATIONS_TESTING_GUIDE.md`
- Full Documentation: `PUSH_NOTIFICATIONS_IMPLEMENTATION_COMPLETE.md`

---

**Quick Reference Version:** 1.0  
**Last Updated:** November 20, 2025
