# Google Meet Integration - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies

```bash
npm install googleapis google-auth-library
```

### Step 2: Get Google OAuth Credentials

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add redirect URIs:
   - Development: `http://localhost:3000/api/google-meet/callback`
   - Production: `https://yourdomain.com/api/google-meet/callback`
7. Copy Client ID and Client Secret

### Step 3: Configure Environment Variables

Add to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-meet/callback
```

### Step 4: Run Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard
# Run: supabase/migrations/011_google_meet_integration.sql
```

### Step 5: Start Development Server

```bash
npm run dev
```

---

## 📱 Usage

### For Teachers

1. **Connect Google Account**
   - Go to Settings → Integrations
   - Click "Connect Google Meet"
   - Authorize access

2. **Create Live Class with Google Meet**
   - Go to Live Classes → Create New
   - Select "Google Meet" as platform
   - Fill in class details
   - Click Create

3. **Meeting Created!**
   - Google Calendar event created automatically
   - Meet link generated
   - Calendar invites sent to students

### For Students

1. **View Live Classes**
   - Go to Live Classes
   - See upcoming Google Meet sessions
   - Click "Join" to open meeting

2. **Calendar Integration**
   - Receive calendar invite via email
   - Add to personal calendar
   - Get reminders before class

---

## 🔧 Integration Points

### Teacher Settings Page

Add Google Meet connection UI:

```tsx
import { GoogleMeetConnect } from '@/components/google-meet/GoogleMeetConnect';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1>Integration Settings</h1>
      <GoogleMeetConnect />
    </div>
  );
}
```

### Live Class Creation Form

Add platform selector and Google Meet integration:

```tsx
import { GoogleMeetSelector } from '@/components/google-meet/GoogleMeetSelector';
import { useState } from 'react';

export default function CreateLiveClass() {
  const [platform, setPlatform] = useState<'zoom' | 'google_meet'>('zoom');
  const [meetingData, setMeetingData] = useState(null);

  return (
    <form>
      {/* Platform Selection */}
      <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
        <option value="zoom">Zoom</option>
        <option value="google_meet">Google Meet</option>
      </select>

      {/* Google Meet Integration */}
      {platform === 'google_meet' && (
        <GoogleMeetSelector
          title={formData.title}
          description={formData.description}
          startTime={formData.startTime}
          endTime={formData.endTime}
          attendees={studentEmails}
          onMeetingCreated={(meetLink, eventId) => {
            setMeetingData({ meetLink, eventId });
            // Save to database
          }}
        />
      )}
    </form>
  );
}
```

### Using the Hook Directly

```tsx
import { useGoogleMeet } from '@/hooks/useGoogleMeet';

export default function MyComponent() {
  const { status, createMeeting, listMeetings } = useGoogleMeet();

  const handleCreate = async () => {
    const meeting = await createMeeting({
      title: 'Math Class',
      start_time: '2024-01-15T10:00:00Z',
      end_time: '2024-01-15T11:00:00Z',
      attendees: ['student@example.com']
    });
    console.log('Join URL:', meeting.meetLink);
  };

  return (
    <div>
      {status?.connected ? (
        <button onClick={handleCreate}>Create Meeting</button>
      ) : (
        <p>Please connect Google Meet first</p>
      )}
    </div>
  );
}
```

---

## 🧪 Testing

### Test OAuth Flow

1. Navigate to `/dashboard/teacher/settings`
2. Click "Connect Google Meet"
3. Authorize with Google account
4. Verify connection status shows "Connected"

### Test Meeting Creation

1. Go to Live Classes → Create New
2. Select "Google Meet" platform
3. Fill in details
4. Click "Create Google Meet"
5. Verify:
   - Meeting created successfully
   - Join URL displayed
   - Calendar event created
   - Invites sent

### Test Calendar Sync

1. Open Google Calendar
2. Find the created event
3. Verify:
   - Event details correct
   - Meet link present
   - Attendees listed

---

## 🐛 Common Issues

### "Google Meet not configured"

**Solution**: Check environment variables are set correctly

```bash
# Verify in .env.local
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

### "OAuth callback failed"

**Solution**: Verify redirect URI matches Google Cloud Console

```
Development: http://localhost:3000/api/google-meet/callback
Production: https://yourdomain.com/api/google-meet/callback
```

### "Failed to create meeting"

**Solution**: 
1. Check Google Calendar API is enabled
2. Verify OAuth scopes include calendar access
3. Check token hasn't expired

### "Token refresh failed"

**Solution**: User needs to reconnect their Google account

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/google-meet/auth` | POST | Initiate OAuth |
| `/api/google-meet/callback` | GET | OAuth callback |
| `/api/google-meet/status` | GET | Check status |
| `/api/google-meet/disconnect` | POST | Disconnect |
| `/api/google-meet/meetings` | GET | List meetings |
| `/api/google-meet/meetings` | POST | Create meeting |
| `/api/google-meet/meetings/[id]` | GET | Get meeting |
| `/api/google-meet/meetings/[id]` | PATCH | Update meeting |
| `/api/google-meet/meetings/[id]` | DELETE | Delete meeting |

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure Google OAuth
3. ✅ Set environment variables
4. ✅ Run database migration
5. ✅ Test OAuth flow
6. ✅ Create test meeting
7. ✅ Integrate into live classes UI
8. ✅ Deploy to production

---

## 📚 Additional Resources

- [Full Documentation](./GOOGLE_MEET_COMPLETE.md)
- [Google Calendar API Docs](https://developers.google.com/calendar/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

---

## ✨ Features

- ✅ OAuth 2.0 authentication
- ✅ Automatic token refresh
- ✅ Calendar event creation
- ✅ Attendee management
- ✅ Email invitations
- ✅ Time conflict detection
- ✅ Multi-user support
- ✅ Seamless Zoom/Google Meet switching

**Status**: Ready to use! 🎉
