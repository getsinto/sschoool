# Google Meet Integration - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get Google Credentials (2 minutes)

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable "Google Calendar API"
4. Create OAuth 2.0 Client ID
5. Add redirect URI: `https://yourdomain.com/api/google-meet/callback`
6. Copy Client ID and Secret

### Step 2: Add Environment Variables (1 minute)

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-meet/callback
```

### Step 3: Run Database Migration (1 minute)

```sql
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE,
  scopes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

ALTER TABLE live_classes 
ADD COLUMN google_event_id TEXT,
ADD COLUMN platform_data JSONB;
```

### Step 4: Deploy (1 minute)

```bash
git add .
git commit -m "feat: Add Google Meet integration"
git push origin main
```

### Step 5: Test (30 seconds)

1. Go to `/teacher/integrations/google`
2. Click "Connect Google Meet"
3. Authorize
4. Done! ✅

---

## 📁 What Was Created

### New Files (12):
- 7 API routes in `app/api/google-meet/`
- 2 pages (teacher integration, student join)
- 3 components (MeetButton, MeetEmbed, CalendarSync)

### Existing Files (8):
- 4 library files in `lib/google-meet/`
- 2 components (GoogleMeetConnect, GoogleMeetSelector)
- 1 hook (useGoogleMeet)
- 1 types file

---

## 🎯 How to Use

### For Teachers:

```typescript
// 1. Connect Google account
Navigate to: /teacher/integrations/google
Click: "Connect Google Meet"

// 2. Create live class with Google Meet
When creating class, select "Google Meet" as platform
Meeting auto-created, invites sent automatically

// 3. Manage meetings
Update class → Meeting auto-updates
Delete class → Meeting auto-deleted
```

### For Students:

```typescript
// 1. Receive calendar invite (automatic)
Check email for Google Calendar invite

// 2. Join class
Navigate to: /student/live-classes
Click on class
Click: "Join Google Meet"
Opens in new tab
```

### In Code:

```typescript
// Create meeting
import { createMeeting } from '@/lib/google-meet/meetings'

const meeting = await createMeeting(userId, {
  title: 'My Class',
  start_time: '2024-01-15T10:00:00Z',
  end_time: '2024-01-15T11:00:00Z',
  attendees: ['student@example.com']
})

console.log(meeting.meetLink) // https://meet.google.com/xxx-xxxx-xxx
```

---

## 🔧 Troubleshooting

### "OAuth failed"
- Check environment variables are set
- Verify redirect URI in Google Console matches exactly
- Ensure Google Calendar API is enabled

### "Failed to create meeting"
- Check user has connected Google account
- Verify tokens haven't expired (auto-refresh should handle this)
- Check Google Calendar API quota

### "Meeting not found"
- Verify `google_event_id` is stored in database
- Check meeting wasn't deleted in Google Calendar
- Ensure user has access to the calendar

---

## 📊 Features

✅ OAuth 2.0 authentication
✅ Auto-create meetings
✅ Calendar sync
✅ Auto-send invites
✅ Update meetings
✅ Delete meetings
✅ Token auto-refresh
✅ Student join page
✅ Attendance marking
✅ Mobile-friendly

---

## 🎉 That's It!

You now have a fully functional Google Meet integration. Teachers can create meetings with one click, and students can join seamlessly.

**Need more details?** See `GOOGLE_MEET_INTEGRATION_COMPLETE_AUDIT.md`

**Ready to deploy?** See `GOOGLE_MEET_DEPLOYMENT_READY.md`
