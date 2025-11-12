# Zoom Integration - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Zoom Credentials (2 min)

1. Go to https://marketplace.zoom.us/
2. Create **Server-to-Server OAuth** app
3. Copy: Account ID, Client ID, Client Secret
4. Create **Meeting SDK** app  
5. Copy: SDK Key, SDK Secret

### Step 2: Configure Environment (1 min)

Add to `.env.local`:
```env
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
ZOOM_API_KEY=your_sdk_key
ZOOM_API_SECRET=your_sdk_secret
```

### Step 3: Setup Database (1 min)

Run in Supabase SQL Editor:
```sql
-- Create tables
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  join_time TIMESTAMPTZ,
  leave_time TIMESTAMPTZ,
  duration INTEGER DEFAULT 0
);

CREATE TABLE class_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES live_classes(id),
  student_id UUID REFERENCES users(id),
  meeting_id TEXT,
  status TEXT,
  join_time TIMESTAMPTZ,
  leave_time TIMESTAMPTZ,
  duration INTEGER DEFAULT 0
);

-- Update live_classes
ALTER TABLE live_classes 
  ADD COLUMN meeting_id TEXT,
  ADD COLUMN meeting_password TEXT,
  ADD COLUMN join_url TEXT,
  ADD COLUMN start_url TEXT,
  ADD COLUMN recording_url TEXT;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('zoom-recordings', 'zoom-recordings', false);
```

### Step 4: Configure Webhooks (1 min)

1. In Zoom OAuth app → Event Subscriptions
2. Add endpoint: `https://yourdomain.com/api/webhooks/zoom`
3. Subscribe to:
   - Meeting Started
   - Meeting Ended
   - Recording Completed
   - Participant Joined/Left

### Step 5: Test (30 sec)

```bash
# Test webhook
curl https://yourdomain.com/api/webhooks/zoom

# Create test meeting
curl -X POST https://yourdomain.com/api/zoom/create-meeting \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"topic":"Test Meeting","start_time":"2024-01-20T10:00:00Z"}'
```

---

## 📝 Usage Examples

### Create Meeting
```typescript
import { createMeeting } from '@/lib/zoom/meetings';

const meeting = await createMeeting('me', {
  topic: 'Math Class',
  start_time: '2024-01-20T10:00:00Z',
  duration: 60,
  settings: {
    waiting_room: true,
    auto_recording: 'cloud'
  }
});
```

### Generate Join Link
```typescript
import { generateParticipantJoinUrl } from '@/lib/zoom/join-links';

const joinUrl = generateParticipantJoinUrl(
  meetingId,
  'John Doe',
  'john@example.com',
  password
);
```

### Get Attendance
```typescript
import { generateAttendanceReport } from '@/lib/zoom/attendance';

const { report, stats, csv } = await generateAttendanceReport(meetingId);
```

---

## 🎯 Key Features

✅ **Automatic Meeting Creation** - Create Zoom meetings when scheduling classes
✅ **One-Click Join** - Students join with pre-filled information
✅ **Cloud Recording** - Automatic recording and storage
✅ **Attendance Tracking** - Automatic attendance with CSV export
✅ **Webhook Integration** - Real-time event processing
✅ **Device Testing** - Pre-meeting audio/video check

---

## 📱 User Flows

**Teacher:**
Schedule → Meeting Created → Start → Students Join → End → Attendance Synced

**Student:**
View Classes → Join → Device Check → Attend → Leave → Access Recording

---

## 🔧 Troubleshooting

**Webhook not working?**
- Check URL is publicly accessible
- Verify signature verification
- Check Zoom app settings

**Can't join meeting?**
- Check credentials in .env
- Verify SDK app is published
- Check browser permissions

**Recording not processing?**
- Verify storage bucket exists
- Check webhook events
- Review application logs

---

## 📚 Documentation

- **Full Guide**: `ZOOM_INTEGRATION_COMPLETE.md`
- **Deployment**: `ZOOM_DEPLOYMENT_GUIDE.md`
- **Summary**: `ZOOM_INTEGRATION_FINAL_SUMMARY.md`
- **This Guide**: `ZOOM_QUICK_START.md`

---

## ✅ Files Created (17 total)

**Libraries (5):**
- lib/zoom/client.ts
- lib/zoom/meetings.ts
- lib/zoom/join-links.ts
- lib/zoom/recordings.ts
- lib/zoom/attendance.ts

**Components (3):**
- components/zoom/ZoomMeetingEmbed.tsx
- components/zoom/PreMeetingCheck.tsx
- app/(dashboard)/student/live-classes/join/[id]/page.tsx

**API Routes (6):**
- app/api/webhooks/zoom/route.ts
- app/api/zoom/create-meeting/route.ts
- app/api/zoom/generate-signature/route.ts
- app/api/zoom/recordings/[meetingId]/route.ts
- app/api/zoom/attendance/[meetingId]/route.ts

**Types & Docs (4):**
- types/zoom.ts
- ZOOM_INTEGRATION_COMPLETE.md
- ZOOM_DEPLOYMENT_GUIDE.md
- ZOOM_INTEGRATION_FINAL_SUMMARY.md
- ZOOM_QUICK_START.md

---

## 🎉 You're Ready!

Your Zoom integration is complete and ready to use. Just add your credentials and start scheduling live classes!

**Need Help?** Check the full documentation files for detailed guides.

---

**Status:** ✅ Complete
**Version:** 1.0.0
