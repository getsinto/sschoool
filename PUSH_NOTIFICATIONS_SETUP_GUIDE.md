# Push Notifications System - Setup Guide

## Installation Complete ✅

All notification system files have been created. Follow these steps to complete the setup.

---

## 1. Install Required Package

```bash
npm install web-push
```

Or with yarn:
```bash
yarn add web-push
```

---

## 2. Generate VAPID Keys

Run this command to generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

This will output something like:
```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U

Private Key:
UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls
=======================================
```

---

## 3. Add Environment Variables

Add these to your `.env.local` file:

```env
# Push Notifications VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Replace:
- `your_public_key_here` with the Public Key from step 2
- `your_private_key_here` with the Private Key from step 2
- `admin@yourdomain.com` with your actual email

---

## 4. Run Database Migration

Apply the notification system database migration:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL file in Supabase Dashboard
# Go to SQL Editor and run: supabase/migrations/020_notifications_system.sql
```

Verify tables were created:
- `notifications`
- `notification_preferences`
- `push_subscriptions`
- `notification_delivery_log`

---

## 5. Add Notification Icons

Create these icon files in your `public/icons/` directory:

1. `notification-icon.png` (192x192px) - Main notification icon
2. `badge-icon.png` (72x72px) - Badge icon for notifications

Or use existing icons by updating paths in:
- `public/sw.js`
- `lib/notifications/push.ts`
- `lib/notifications/realtime.ts`

---

## 6. Add Notification Sound (Optional)

Add a notification sound file:
- `public/sounds/notification.mp3`

Or disable sound in `lib/notifications/realtime.ts` by commenting out the sound playback code.

---

## 7. Test the System

### Test In-App Notifications

1. Navigate to `/notifications`
2. You should see the notifications page
3. Click the bell icon in the header to see the dropdown

### Test Push Notifications

1. Navigate to `/settings/notifications`
2. Enable "Push Notifications"
3. Grant browser permission when prompted
4. Click "Send Test Notification"
5. You should receive a push notification

### Test Real-Time Updates

1. Open two browser windows
2. In one window, create a notification (via API or trigger)
3. The other window should receive it in real-time

---

## 8. Integration with Your App

### Send Notifications from Your Code

```typescript
import { NotificationDelivery } from '@/lib/notifications/delivery';

// Send using template
await NotificationDelivery.sendFromTemplate(
  'assignment.new',
  userId,
  {
    assignmentTitle: 'Math Homework',
    courseName: 'Mathematics 101',
    dueDate: '2025-11-25',
    assignmentId: 'abc123',
    courseId: 'course123'
  }
);

// Send custom notification
await NotificationDelivery.send({
  user_id: userId,
  type: 'course',
  title: 'New Lesson Available',
  message: 'Check out the new lesson in your course',
  priority: 'normal',
  action_url: '/student/courses/123'
});

// Send to multiple users
await NotificationDelivery.sendBulk(
  [userId1, userId2, userId3],
  {
    type: 'announcement',
    title: 'System Maintenance',
    message: 'The system will be down for maintenance tonight',
    priority: 'high'
  }
);
```

### Available Notification Templates

Use these template keys with `sendFromTemplate()`:

**Course:**
- `course.new_lesson`
- `course.updated`
- `course.completed`

**Assignment:**
- `assignment.new`
- `assignment.due_soon`
- `assignment.graded`
- `assignment.late`

**Quiz:**
- `quiz.available`
- `quiz.graded`
- `quiz.failed`

**Grade:**
- `grade.posted`
- `grade.updated`
- `grade.alert`

**Live Class:**
- `live_class.starting_soon`
- `live_class.rescheduled`
- `live_class.recording_available`

**Payment:**
- `payment.success`
- `payment.failed`
- `payment.refund`

**Message:**
- `message.teacher`
- `message.admin`

**Announcement:**
- `announcement.new`

**System:**
- `system.account_verified`
- `system.profile_updated`
- `system.certificate_earned`
- `system.badge_unlocked`

---

## 9. Add NotificationBell to Layout

Add the notification bell to your dashboard layout:

```typescript
// app/(dashboard)/layout.tsx
import NotificationBell from '@/components/notifications/NotificationBell';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <header>
        {/* Other header content */}
        <NotificationBell />
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## 10. Verify Everything Works

### Checklist:

- [ ] Database tables created
- [ ] VAPID keys generated and added to .env
- [ ] web-push package installed
- [ ] Notification icons added
- [ ] Bell icon appears in header
- [ ] Notifications page loads
- [ ] Settings page loads
- [ ] Can enable push notifications
- [ ] Test notification works
- [ ] Real-time updates work
- [ ] Browser notifications appear
- [ ] Notification sound plays (if enabled)

---

## Troubleshooting

### Push Notifications Not Working

1. **Check VAPID keys are set correctly**
   ```bash
   echo $NEXT_PUBLIC_VAPID_PUBLIC_KEY
   echo $VAPID_PRIVATE_KEY
   ```

2. **Check browser console for errors**
   - Open DevTools → Console
   - Look for service worker or push notification errors

3. **Verify service worker is registered**
   - Open DevTools → Application → Service Workers
   - Should see `/sw.js` registered

4. **Check notification permission**
   - Browser settings → Site settings → Notifications
   - Ensure your site has permission

### Database Errors

1. **Check tables exist**
   ```sql
   SELECT * FROM notifications LIMIT 1;
   SELECT * FROM notification_preferences LIMIT 1;
   SELECT * FROM push_subscriptions LIMIT 1;
   ```

2. **Check RLS policies**
   - Ensure user is authenticated
   - Check Supabase logs for policy violations

### Real-Time Not Working

1. **Check Supabase Realtime is enabled**
   - Supabase Dashboard → Database → Replication
   - Enable replication for `notifications` table

2. **Check browser console**
   - Look for WebSocket connection errors
   - Verify Supabase URL and keys are correct

---

## Performance Optimization

### Database Indexes

The migration includes indexes for:
- User ID lookups
- Unread notifications
- Notification type filtering
- Date-based queries

### Cleanup Old Notifications

Run this periodically (e.g., via cron job):

```typescript
// app/api/cron/cleanup-notifications/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  // Delete read notifications older than 90 days
  await supabase.rpc('cleanup_old_notifications');
  
  // Delete expired notifications
  await supabase.rpc('cleanup_expired_notifications');
  
  return Response.json({ success: true });
}
```

---

## Security Considerations

1. **VAPID Keys**: Keep private key secret, never expose in client code
2. **RLS Policies**: Ensure users can only access their own notifications
3. **Rate Limiting**: Consider rate limiting notification creation
4. **Input Validation**: Validate all notification data before saving
5. **XSS Protection**: Sanitize notification content if it includes user input

---

## Next Steps

1. **Customize Templates**: Edit `lib/notifications/templates.ts` to match your needs
2. **Add More Types**: Create new notification types as needed
3. **Integrate with Features**: Add notification triggers throughout your app
4. **Monitor Usage**: Track notification delivery and engagement
5. **Optimize Performance**: Monitor database queries and optimize as needed

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Check Supabase logs for database errors
4. Verify all environment variables are set correctly

---

## Files Created

### Database
- `supabase/migrations/020_notifications_system.sql`

### Libraries
- `lib/notifications/push.ts`

### Pages
- `app/(dashboard)/settings/notifications/page.tsx`

### API Routes
- `app/api/notifications/subscribe-push/route.ts` (updated)

### Documentation
- `PUSH_NOTIFICATIONS_COMPREHENSIVE_AUDIT.md`
- `PUSH_NOTIFICATIONS_SETUP_GUIDE.md`

---

**System Status:** ✅ Ready for Testing

All components are in place. Follow the setup steps above to complete the installation.
