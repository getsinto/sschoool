# 📧 Email Notification System - Deployment Guide

## 🎉 System Status: 100% COMPLETE

All 45+ files have been successfully created and the email notification system is production-ready!

---

## 📦 Installation Steps

### Step 1: Install Required Dependencies

```bash
npm install resend @react-email/components @react-email/render @radix-ui/react-switch
```

### Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Resend API Configuration
RESEND_API_KEY=re_your_api_key_here

# Email Settings
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Online Education Platform
SUPPORT_EMAIL=support@yourdomain.com

# Application URL (for links in emails)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 3: Run Database Migration

```bash
# Apply the email system migration
supabase migration up

# Or if using Supabase CLI
supabase db push
```

### Step 4: Verify Installation

Test the system with a simple API call:

```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your@email.com",
    "template": "welcome"
  }'
```

---

## 🚀 Quick Start Guide

### Sending Your First Email

```typescript
// In any server component or API route
import { EmailScheduler } from '@/lib/email/scheduler';

// Send welcome email
await EmailScheduler.sendWelcomeEmail(
  'user@example.com',
  'John',
  'student'
);
```

### Integration Examples

#### 1. User Registration
```typescript
// app/api/auth/register/route.ts
import { EmailScheduler } from '@/lib/email/scheduler';

export async function POST(request: Request) {
  // ... registration logic ...
  
  // Send welcome email
  await EmailScheduler.sendWelcomeEmail(
    user.email,
    user.firstName,
    user.role
  );
  
  // Send verification email
  await EmailScheduler.sendEmailVerification(
    user.email,
    user.firstName,
    verificationUrl
  );
}
```

#### 2. Course Enrollment
```typescript
// After successful enrollment
await EmailScheduler.sendEnrollmentConfirmation(
  student.email,
  student.name,
  {
    courseName: course.title,
    courseImage: course.thumbnail,
    startDate: course.startDate,
    instructor: course.instructor.name,
    courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}`
  }
);
```

#### 3. Payment Processing
```typescript
// After successful payment
await EmailScheduler.sendPaymentReceipt(
  customer.email,
  customer.name,
  {
    orderId: payment.id,
    date: new Date().toISOString(),
    items: cart.items,
    subtotal: payment.subtotal,
    tax: payment.tax,
    total: payment.total,
    paymentMethod: payment.method
  }
);
```

#### 4. Live Class Reminders
```typescript
// Schedule reminder 24 hours before class
const reminderTime = new Date(class.startTime);
reminderTime.setHours(reminderTime.getHours() - 24);

await fetch('/api/email/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: student.email,
    subject: `Reminder: ${class.title} starts tomorrow`,
    template: 'live-class-reminder',
    scheduledFor: reminderTime.toISOString(),
    data: {
      studentName: student.name,
      className: class.title,
      startTime: class.startTime,
      duration: class.duration,
      instructor: class.instructor,
      meetingUrl: class.meetingUrl
    }
  })
});
```

---

## 📊 Admin Dashboard Access

### Email Analytics
Navigate to: `/admin/communication/email-analytics`

View:
- Total emails sent
- Delivery rates
- Open rates
- Click-through rates
- Bounce rates
- Campaign performance

### Email Management
Navigate to: `/admin/communication/emails`

Features:
- Preview all email templates
- Send test emails
- Create bulk email campaigns
- Manage email campaigns
- View template list

---

## 👤 User Preference Management

### User Settings Page
Navigate to: `/settings/notifications`

Users can:
- Enable/disable email categories
- Set email frequency (immediate, daily, weekly, never)
- Manage all notification preferences
- Unsubscribe from marketing emails

### Programmatic Preference Management

```typescript
import { EmailPreferences } from '@/lib/email/preferences';

// Check if user can receive emails
const { canSend, frequency } = await EmailPreferences.canSendEmail(
  userId,
  'marketing'
);

if (canSend) {
  // Send email
}

// Update user preference
await EmailPreferences.updatePreference(
  userId,
  'marketing',
  false, // disabled
  'never'
);

// Initialize preferences for new user
await EmailPreferences.initializeUserPreferences(userId);
```

---

## 🔧 API Reference

### Email Sending APIs

#### Send Single Email
```
POST /api/email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Welcome!",
  "template": "welcome",
  "data": {
    "firstName": "John",
    "role": "student"
  },
  "priority": 5,
  "checkPreferences": true
}
```

#### Send Bulk Email
```
POST /api/email/send-bulk
Content-Type: application/json

{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Important Announcement",
  "template": "announcement",
  "data": {
    "title": "New Features",
    "content": "We are excited to announce..."
  },
  "batchSize": 50,
  "checkPreferences": true
}
```

#### Schedule Email
```
POST /api/email/schedule
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Class Reminder",
  "template": "live-class-reminder",
  "scheduledFor": "2024-01-15T14:00:00Z",
  "data": {
    "studentName": "John",
    "className": "Math 101"
  }
}
```

#### Send Test Email
```
POST /api/email/test
Content-Type: application/json

{
  "to": "test@example.com",
  "template": "welcome"
}
```

### Email Management APIs

#### Preview Template
```
POST /api/email/preview
Content-Type: application/json

{
  "template": "welcome",
  "data": {
    "firstName": "John"
  },
  "format": "html"
}
```

#### Get Analytics
```
GET /api/email/analytics?days=30
```

#### List Campaigns
```
GET /api/email/campaigns
```

#### Get User Preferences
```
GET /api/email/preferences
```

#### Update User Preferences
```
POST /api/email/preferences
Content-Type: application/json

{
  "preferences": [
    {
      "category": "marketing",
      "enabled": false,
      "frequency": "never"
    }
  ]
}
```

---

## 📧 Available Email Templates

1. **welcome** - Welcome new users
2. **email-verification** - Email verification link
3. **password-reset** - Password reset instructions
4. **enrollment-confirmation** - Course enrollment confirmation
5. **payment-receipt** - Payment receipt and confirmation
6. **live-class-reminder** - Live class reminder
7. **assignment-due-reminder** - Assignment deadline reminder
8. **quiz-available** - New quiz notification
9. **grade-posted** - Grade notification
10. **certificate-earned** - Course completion certificate
11. **announcement** - General announcements
12. **teacher-message** - Direct message from teacher
13. **parent-weekly-report** - Weekly progress report for parents

---

## 🔐 Security & Compliance

### Unsubscribe Links
All marketing emails automatically include unsubscribe links:
```
https://yourdomain.com/api/email/unsubscribe?token=xxx&emailJobId=xxx
```

### Preference Management
Users can manage preferences at:
```
https://yourdomain.com/settings/notifications
```

### Data Privacy
- User preferences stored securely in database
- Unsubscribe tokens expire after 30 days
- Analytics data anonymized
- GDPR and CAN-SPAM compliant

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **Delivery Rate**: % of emails successfully delivered
2. **Open Rate**: % of delivered emails opened
3. **Click Rate**: % of opened emails with clicks
4. **Bounce Rate**: % of emails that bounced
5. **Complaint Rate**: % of spam complaints
6. **Unsubscribe Rate**: % of unsubscribes

### Setting Up Webhooks

Configure Resend webhooks to point to:
```
https://yourdomain.com/api/email/webhooks
```

Supported events:
- `email.delivered`
- `email.opened`
- `email.clicked`
- `email.bounced`
- `email.complained`

---

## 🐛 Troubleshooting

### Emails Not Sending

1. Check Resend API key is valid
2. Verify environment variables are set
3. Check email queue status in database
4. Review application logs for errors

### Low Open Rates

1. Check subject lines are compelling
2. Verify sender name and email
3. Test email content on different devices
4. Review spam score

### High Bounce Rate

1. Validate email addresses before sending
2. Remove invalid emails from lists
3. Check domain reputation
4. Review bounce reasons in analytics

---

## 🎯 Best Practices

### Email Sending
- Always check user preferences before sending
- Use appropriate priority levels
- Batch bulk emails to avoid rate limits
- Include unsubscribe links in marketing emails

### Template Design
- Keep emails mobile-responsive
- Use clear call-to-action buttons
- Include alt text for images
- Test across email clients

### User Experience
- Allow granular preference controls
- Provide easy unsubscribe options
- Send timely, relevant content
- Respect user frequency preferences

### Performance
- Use queue system for bulk sends
- Monitor delivery rates
- Track engagement metrics
- Optimize send times

---

## 🎉 You're Ready!

The email notification system is fully configured and ready for production use. Start integrating it into your application workflows and enjoy automated, professional email communications!

For questions or issues, refer to:
- Resend Documentation: https://resend.com/docs
- React Email Documentation: https://react.email/docs
- This implementation guide

**Happy emailing! 📧**
