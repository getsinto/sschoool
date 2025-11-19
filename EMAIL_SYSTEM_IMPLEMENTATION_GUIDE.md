# Email Notification System - Implementation Guide

## Overview
This guide provides step-by-step instructions for completing and deploying the email notification system.

## ✅ What Was Just Created

### 1. Admin Email Analytics Dashboard
**File:** `app/(dashboard)/admin/communication/email-analytics/page.tsx`

Features:
- Real-time email performance metrics
- Delivery, open, click, and bounce rates
- Performance by template
- Insights and recommendations
- Date range filtering (24h, 7d, 30d, 90d, all time)

### 2. Email Tracking Routes
**Files:**
- `app/api/email/track/open/route.ts` - 1x1 pixel for open tracking
- `app/api/email/track/click/route.ts` - Click tracking with redirect

### 3. Enhanced Analytics API
**File:** `app/api/email/analytics/route.ts`
- Added template-specific statistics
- Support for multiple date ranges
- Comprehensive metrics

### 4. Scheduled Email Processor
**File:** `app/api/cron/process-scheduled-emails/route.ts`
- Processes scheduled emails every 10 minutes
- Batch processing (50 emails per run)
- Error handling and retry logic

### 5. Vercel Cron Configuration
**File:** `vercel.json`
- Automated cron job configuration
- Runs every 10 minutes

## 🔧 Configuration Steps

### Step 1: Environment Variables
Add these to your `.env.local` and production environment:

```env
# Resend API Key (get from https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Platform Name
SUPPORT_EMAIL=support@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Cron Secret (generate a random string)
CRON_SECRET=your_random_secret_here
```

### Step 2: Resend Setup

1. **Sign up for Resend:**
   - Go to https://resend.com
   - Create an account
   - Verify your domain

2. **Get API Key:**
   - Navigate to API Keys section
   - Create a new API key
   - Copy and add to `RESEND_API_KEY`

3. **Configure Webhook:**
   - Go to Webhooks section
   - Add webhook URL: `https://yourdomain.com/api/email/webhooks`
   - Enable events:
     - `email.delivered`
     - `email.opened`
     - `email.clicked`
     - `email.bounced`
     - `email.complained`

### Step 3: Database Migration
The email system tables should already exist from migration `008_email_system.sql`. Verify:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('email_jobs', 'email_analytics', 'email_campaigns', 'notification_preferences');
```

If missing, run the migration:
```bash
supabase db push
```

### Step 4: Deploy to Vercel

1. **Push code to repository:**
   ```bash
   git add .
   git commit -m "Add email notification system"
   git push
   ```

2. **Deploy to Vercel:**
   - Vercel will automatically detect `vercel.json`
   - Cron job will be configured automatically

3. **Add environment variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all variables from Step 1

4. **Verify cron job:**
   - Go to Project Settings → Cron Jobs
   - Verify `/api/cron/process-scheduled-emails` is listed
   - Schedule: `*/10 * * * *` (every 10 minutes)

## 🔗 Integration Points

### Integrate Email Triggers into Existing APIs

#### 1. Course Enrollment
**File:** `app/api/student/courses/[id]/enroll/route.ts` (or similar)

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// After successful enrollment
await EmailScheduler.sendEnrollmentConfirmation(
  student.email,
  student.name,
  {
    title: course.title,
    instructor: course.instructor_name,
    thumbnail: course.thumbnail_url,
    startDate: course.start_date
  }
);
```

#### 2. Payment Success
**File:** `app/api/webhooks/stripe/route.ts` (or payment handler)

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// After successful payment
await EmailScheduler.sendPaymentReceipt(
  customer.email,
  customer.name,
  {
    amount: payment.amount,
    currency: payment.currency,
    transactionId: payment.id,
    courseName: course.title,
    invoiceUrl: invoiceUrl
  }
);
```

#### 3. Live Class Creation
**File:** `app/api/teacher/live-classes/route.ts`

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// After creating live class
const enrolledStudents = await getEnrolledStudents(courseId);

for (const student of enrolledStudents) {
  // Schedule 24-hour reminder
  await EmailScheduler.scheduleLiveClassReminder(
    student.email,
    student.name,
    {
      title: liveClass.title,
      courseName: course.title,
      startTime: new Date(liveClass.start_time),
      duration: liveClass.duration,
      meetingUrl: liveClass.meeting_url,
      meetingPassword: liveClass.meeting_password
    },
    24 // hours before
  );

  // Schedule 1-hour reminder
  await EmailScheduler.scheduleLiveClassReminder(
    student.email,
    student.name,
    {
      title: liveClass.title,
      courseName: course.title,
      startTime: new Date(liveClass.start_time),
      duration: liveClass.duration,
      meetingUrl: liveClass.meeting_url,
      meetingPassword: liveClass.meeting_password
    },
    1 // hour before
  );
}
```

#### 4. Assignment Creation
**File:** `app/api/teacher/assignments/route.ts`

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// After creating assignment
const enrolledStudents = await getEnrolledStudents(courseId);

for (const student of enrolledStudents) {
  // Schedule 3-day reminder
  await EmailScheduler.scheduleAssignmentReminder(
    student.email,
    student.name,
    {
      title: assignment.title,
      courseName: course.title,
      dueDate: new Date(assignment.due_date),
      submissionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/student/assignments/${assignment.id}`
    },
    3 // days before
  );

  // Schedule 1-day reminder
  await EmailScheduler.scheduleAssignmentReminder(
    student.email,
    student.name,
    {
      title: assignment.title,
      courseName: course.title,
      dueDate: new Date(assignment.due_date),
      submissionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/student/assignments/${assignment.id}`
    },
    1 // day before
  );
}
```

#### 5. Grade Posted
**File:** `app/api/teacher/grading/route.ts`

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// After posting grade
await EmailScheduler.sendGradePosted(
  student.email,
  student.name,
  {
    assessmentName: assignment.title,
    courseName: course.title,
    grade: grade.score,
    percentage: grade.percentage,
    passed: grade.passed,
    feedback: grade.feedback,
    viewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/student/grades/${grade.id}`
  }
);
```

#### 6. Certificate Earned
**File:** `app/api/student/certificates/route.ts`

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// After generating certificate
await EmailScheduler.sendCertificateEarned(
  student.email,
  student.name,
  {
    courseName: course.title,
    completionDate: new Date(),
    certificateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/student/certificates/${certificate.id}`,
    certificatePreview: certificate.preview_url
  }
);
```

#### 7. Quiz Published
**File:** `app/api/teacher/quizzes/route.ts`

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// After publishing quiz
const enrolledStudents = await getEnrolledStudents(courseId);

for (const student of enrolledStudents) {
  await EmailScheduler.sendQuizAvailable(
    student.email,
    student.name,
    {
      title: quiz.title,
      courseName: course.title,
      availableUntil: quiz.available_until ? new Date(quiz.available_until) : undefined,
      quizUrl: `${process.env.NEXT_PUBLIC_APP_URL}/student/quizzes/${quiz.id}`
    }
  );
}
```

#### 8. Announcement Published
**File:** `app/api/admin/communication/announcements/route.ts`

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// After publishing announcement
const recipients = await getAnnouncementRecipients(announcement.target_audience);

for (const recipient of recipients) {
  await EmailScheduler.sendAnnouncement(
    recipient.email,
    recipient.name,
    {
      title: announcement.title,
      content: announcement.content,
      author: announcement.author_name,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/announcements/${announcement.id}`
    }
  );
}
```

#### 9. Teacher Message
**File:** `app/api/teacher/messages/route.ts`

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// After sending message
await EmailScheduler.sendTeacherMessage(
  student.email,
  student.name,
  {
    teacherName: teacher.name,
    subject: message.subject,
    preview: message.content.substring(0, 150),
    messageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/student/messages/${message.id}`
  }
);
```

#### 10. Parent Weekly Report
**File:** Create a new cron job or scheduled task

```typescript
import { EmailScheduler } from '@/lib/email/scheduler';

// Run every Sunday evening
const parents = await getActiveParents();

for (const parent of parents) {
  const children = await getParentChildren(parent.id);
  
  for (const child of children) {
    const reportData = await generateWeeklyReport(child.id);
    
    await EmailScheduler.scheduleParentWeeklyReport(
      parent.email,
      parent.name,
      {
        childName: child.name,
        weekStart: reportData.weekStart,
        weekEnd: reportData.weekEnd,
        coursesProgress: reportData.coursesProgress,
        grades: reportData.grades,
        attendance: reportData.attendance,
        upcomingSchedule: reportData.upcomingSchedule,
        teacherComments: reportData.teacherComments,
        reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/parent/reports/${reportData.id}`
      }
    );
  }
}
```

## 🧪 Testing

### Test Individual Templates
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "template": "welcome"
  }'
```

### Test All Templates
Create a test script:

```typescript
// scripts/test-emails.ts
const templates = [
  'welcome',
  'email-verification',
  'password-reset',
  'enrollment-confirmation',
  'payment-receipt',
  'live-class-reminder',
  'assignment-due-reminder',
  'quiz-available',
  'grade-posted',
  'certificate-earned',
  'announcement',
  'teacher-message',
  'parent-weekly-report'
];

for (const template of templates) {
  await fetch('http://localhost:3000/api/email/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'your-email@example.com',
      template
    })
  });
  
  console.log(`✓ Sent ${template}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### Test Scheduled Emails
```typescript
// Schedule an email for 2 minutes from now
const scheduledTime = new Date(Date.now() + 2 * 60 * 1000);

await fetch('http://localhost:3000/api/email/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'your-email@example.com',
    subject: 'Test Scheduled Email',
    template: 'welcome',
    data: { firstName: 'Test' },
    scheduledFor: scheduledTime.toISOString()
  })
});

// Wait 3 minutes and check if email was sent
```

### Test Cron Job Manually
```bash
curl -X POST http://localhost:3000/api/cron/process-scheduled-emails \
  -H "Authorization: Bearer your_cron_secret"
```

## 📊 Monitoring

### Check Email Analytics
Visit: `https://yourdomain.com/admin/communication/email-analytics`

### Check Queue Status
```typescript
import { emailQueue } from '@/lib/email/queue';

const status = emailQueue.getQueueStatus();
console.log(status);
// { pending: 5, processing: 2, total: 7 }
```

### Check Scheduled Emails
```bash
curl http://localhost:3000/api/email/schedule?status=scheduled
```

### Monitor Resend Dashboard
- Go to https://resend.com/emails
- View sent emails, delivery status, opens, clicks
- Check for bounces and complaints

## 🚨 Troubleshooting

### Emails Not Sending
1. Check Resend API key is correct
2. Verify domain is verified in Resend
3. Check email queue status
4. Review server logs for errors

### Scheduled Emails Not Processing
1. Verify cron job is running (check Vercel logs)
2. Check `CRON_SECRET` is set correctly
3. Manually trigger: `POST /api/cron/process-scheduled-emails`
4. Check database for scheduled emails

### Low Open Rates
1. Check spam score of emails
2. Verify tracking pixel is included
3. Review subject lines
4. Check send times

### High Bounce Rate
1. Clean email list
2. Verify email addresses before sending
3. Check for typos in email addresses
4. Review Resend bounce reports

## 📈 Best Practices

### Email Frequency
- Don't send too many emails (respect user preferences)
- Batch notifications into digests when appropriate
- Allow users to control frequency

### Subject Lines
- Keep under 50 characters
- Be clear and specific
- Avoid spam trigger words
- Personalize when possible

### Content
- Mobile-first design
- Clear call-to-action
- Personalize with user data
- Include unsubscribe link

### Deliverability
- Maintain clean email list
- Monitor bounce and complaint rates
- Use verified domain
- Authenticate emails (SPF, DKIM, DMARC)

## 🎯 Next Steps

1. ✅ Configure environment variables
2. ✅ Set up Resend account and webhook
3. ✅ Deploy to Vercel
4. ✅ Test all email templates
5. ✅ Integrate email triggers into APIs
6. ✅ Monitor analytics dashboard
7. ✅ Optimize based on performance data

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Email Deliverability Best Practices](https://sendgrid.com/blog/email-deliverability-best-practices/)

## Support

For issues or questions:
1. Check server logs
2. Review Resend dashboard
3. Check email analytics
4. Contact support team
