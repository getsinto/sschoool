# Notifications System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Generate VAPID Keys
```bash
# Run in Node.js console or create a script
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"
```

### Step 2: Add Environment Variables
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
VAPID_SUBJECT=mailto:admin@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 3: Deploy
```bash
npm run build
# Deploy to your hosting platform
```

---

## 📱 How to Use

### For Users

#### Enable Notifications
1. Click the bell icon in the header
2. Go to Settings → Notifications
3. Enable desired notification channels
4. Click "Enable Push Notifications" for browser alerts

#### View Notifications
- **Quick View**: Click bell icon → See recent 10 notifications
- **Full View**: Click "View all notifications" → See complete list
- **Mark as Read**: Click checkmark icon
- **Delete**: Click X icon

---

## 👨‍💻 For Developers

### Send a Simple Notification
```typescript
import { notificationDeliveryService } from '@/lib/notifications/delivery';

await notificationDeliveryService.deliverNotification(userId, {
  type: 'system',
  title: 'Welcome!',
  message: 'Welcome to our platform',
  data: {},
  read: false
});
```

### Send Using Templates
```typescript
import { createAssignmentNotification } from '@/lib/notifications/templates';
import { notificationDeliveryService } from '@/lib/notifications/delivery';

const notification = createAssignmentNotification({
  assignmentTitle: 'Chapter 5 Quiz',
  courseName: 'Mathematics 101',
  dueDate: '2025-01-15'
});

await notificationDeliveryService.deliverNotification(userId, {
  type: 'assignment',
  ...notification,
  data: { assignmentId: '123', courseId: '456' },
  read: false
});
```

### Send to Multiple Users
```typescript
await notificationDeliveryService.bulkDeliverNotifications(
  [userId1, userId2, userId3],
  {
    type: 'announcement',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday',
    data: {},
    read: false
  }
);
```

### Use in React Components
```typescript
import { useNotifications } from '@/lib/notifications/hooks';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification,
    markAllAsRead 
  } = useNotifications();

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(n => (
        <div key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <button onClick={() => markAsRead(n.id)}>Mark Read</button>
          <button onClick={() => deleteNotification(n.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Common Use Cases

### 1. New Assignment Posted
```typescript
await notificationDeliveryService.deliverNotification(studentId, {
  type: 'assignment',
  title: 'New Assignment Posted',
  message: `Assignment "${assignmentTitle}" has been posted in ${courseName}`,
  data: {
    assignmentId: assignment.id,
    courseId: course.id,
    dueDate: assignment.due_date
  },
  read: false
});
```

### 2. Grade Posted
```typescript
await notificationDeliveryService.deliverNotification(studentId, {
  type: 'grade',
  title: 'Grade Posted',
  message: `Your grade for "${itemName}" has been posted: ${grade}`,
  data: {
    gradeId: grade.id,
    itemId: item.id,
    courseId: course.id
  },
  read: false
});
```

### 3. Live Class Reminder (15 minutes before)
```typescript
await notificationDeliveryService.deliverNotification(studentId, {
  type: 'live-class',
  title: 'Live Class Starting Soon',
  message: `Your class "${className}" starts in 15 minutes`,
  data: {
    classId: liveClass.id,
    meetingLink: liveClass.meeting_link,
    startTime: liveClass.start_time
  },
  read: false
});
```

### 4. Payment Confirmation
```typescript
await notificationDeliveryService.deliverNotification(userId, {
  type: 'payment',
  title: 'Payment Successful',
  message: `Payment of $${amount} for ${courseName} was successful`,
  data: {
    paymentId: payment.id,
    courseId: course.id,
    amount: payment.amount
  },
  read: false
});
```

---

## 🔔 Notification Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `course` | 📚 | Blue | Course updates, new content |
| `assignment` | 📝 | Orange | New assignments, deadlines |
| `grade` | 🎓 | Green | Grade postings, feedback |
| `live-class` | 🎥 | Purple | Class reminders, recordings |
| `payment` | 💳 | Emerald | Payment confirmations |
| `message` | 💬 | Indigo | Direct messages |
| `announcement` | 📢 | Red | Important announcements |
| `system` | ⚙️ | Gray | System notifications |

---

## ⚙️ User Preferences

Each user can control notifications per type:

```typescript
// Get user preferences
const { preferences } = useNotificationPreferences();

// Update preference
await updatePreference('assignment', {
  in_app_enabled: true,
  email_enabled: true,
  push_enabled: true,
  sms_enabled: false
});
```

---

## 🧪 Testing

### Test Push Notifications
```typescript
import { sendTestPushNotification } from '@/lib/notifications/push';

// Get user's push subscription
const subscription = await getCurrentPushSubscription();

// Send test
if (subscription) {
  await sendTestPushNotification(subscription);
}
```

### Test In-App Notifications
```typescript
// Create test notification
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user-id',
    type: 'system',
    title: 'Test Notification',
    message: 'This is a test',
    data: {}
  })
});
```

---

## 🐛 Troubleshooting

### Push Notifications Not Working
1. Check VAPID keys are set in environment variables
2. Verify service worker is registered (`/sw.js` accessible)
3. Check browser notification permission is granted
4. Ensure HTTPS is enabled (required for push)

### Notifications Not Appearing
1. Check user is authenticated
2. Verify notification was created in database
3. Check real-time subscription is active
4. Verify user preferences allow the notification type

### Unread Count Not Updating
1. Check real-time subscription is connected
2. Verify WebSocket connection is active
3. Check browser console for errors

---

## 📚 API Reference

### Notification Object
```typescript
interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  updated_at: string;
}
```

### API Endpoints
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/[id]` - Get single notification
- `PATCH /api/notifications/[id]` - Update notification
- `DELETE /api/notifications/[id]` - Delete notification
- `POST /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/preferences` - Get preferences
- `POST /api/notifications/preferences` - Update preferences
- `POST /api/notifications/subscribe-push` - Subscribe to push
- `POST /api/notifications/send` - Send notification (admin)

---

## 🎨 Customization

### Custom Notification Template
```typescript
// Add to lib/notifications/templates.ts
export function createCustomNotification(data: {
  title: string;
  message: string;
  customField: string;
}) {
  return {
    title: data.title,
    message: data.message,
    priority: 'normal' as const
  };
}
```

### Custom Notification Icon
```typescript
// Add to components/notifications/NotificationItem.tsx
const notificationIcons = {
  // ... existing icons
  'custom-type': CustomIcon,
};
```

---

## 📊 Analytics

### Track Notification Engagement
```typescript
// Get delivery stats
const stats = await notificationDeliveryService.getDeliveryStats(notificationId);
console.log(stats); // { total, delivered, failed, pending }
```

---

## 🔒 Security

- ✅ All notifications are user-scoped (RLS enforced)
- ✅ VAPID keys are encrypted
- ✅ Push subscriptions are securely stored
- ✅ API routes require authentication
- ✅ Service worker is served over HTTPS

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review the complete documentation (PUSH_NOTIFICATIONS_IN_APP_COMPLETE.md)
3. Check browser console for errors
4. Verify database schema is up to date

---

**Quick Links**:
- [Complete Documentation](./PUSH_NOTIFICATIONS_IN_APP_COMPLETE.md)
- [Component Reference](./components/notifications/)
- [API Reference](./app/api/notifications/)
- [Library Reference](./lib/notifications/)
