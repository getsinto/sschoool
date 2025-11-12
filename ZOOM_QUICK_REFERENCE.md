# Zoom Integration - Quick Reference Guide

## 🚀 Quick Start

### 1. Environment Setup
Add to `.env.local`:
```env
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
ZOOM_WEBHOOK_SECRET_TOKEN=your_webhook_secret
```

### 2. Create a Meeting (Teacher)
```typescript
import { useZoomMeeting } from '@/hooks/useZoomMeeting';

const { createMeeting, isLoading } = useZoomMeeting(null);

const handleCreate = async () => {
  await createMeeting({
    topic: "Math Class",
    start_time: "2024-01-15T10:00:00Z",
    duration: 60,
    courseId: "course123"
  });
};
```

### 3. Join a Meeting (Student)
```typescript
import { ZoomMeetingEmbed } from '@/components/zoom/ZoomMeetingEmbed';

<ZoomMeetingEmbed
  meetingId="123456789"
  userName="John Doe"
  userEmail="john@example.com"
  role="participant"
/>
```

### 4. Track Attendance (Teacher)
```typescript
import { AttendanceTracker } from '@/components/zoom/AttendanceTracker';

<AttendanceTracker
  meetingId="123456789"
  isHost={true}
/>
```

## 📁 File Structure

```
lib/zoom/
├── client.ts           # Zoom API client
├── meetings.ts         # Meeting operations
├── join-links.ts       # Join URL generation
├── recordings.ts       # Recording management
└── attendance.ts       # Attendance tracking

components/zoom/
├── ZoomMeetingEmbed.tsx    # Meeting interface
├── PreMeetingCheck.tsx     # Device testing
├── ZoomControls.tsx        # Meeting controls
├── AttendanceTracker.tsx   # Attendance panel
└── MeetingList.tsx         # Meeting list view

app/api/zoom/
├── create-meeting/route.ts
├── update-meeting/[id]/route.ts
├── delete-meeting/[id]/route.ts
├── attendance/[meetingId]/route.ts
├── participants/[meetingId]/route.ts
├── recording/start/[meetingId]/route.ts
├── recording/stop/[meetingId]/route.ts
└── webhooks/zoom/route.ts

hooks/
└── useZoomMeeting.ts       # Meeting management hook
```

## 🎯 Common Use Cases

### Create Scheduled Meeting
```typescript
const meetingData = {
  topic: "Weekly Review",
  type: 2, // Scheduled
  start_time: new Date("2024-01-15T10:00:00Z").toISOString(),
  duration: 60,
  settings: {
    waiting_room: true,
    mute_upon_entry: true,
    auto_recording: "cloud"
  }
};

await createMeeting(meetingData);
```

### Update Meeting
```typescript
const { updateMeeting } = useZoomMeeting(meetingId);

await updateMeeting(meetingId, {
  topic: "Updated Title",
  duration: 90
});
```

### Delete Meeting
```typescript
const { deleteMeeting } = useZoomMeeting(meetingId);

await deleteMeeting(meetingId, true); // true = send notification
```

### Start Recording
```typescript
const { startRecording } = useZoomMeeting(meetingId);

await startRecording(meetingId);
```

### Export Attendance
```typescript
// Automatically handled by AttendanceTracker component
// Or manually:
const response = await fetch(`/api/zoom/attendance/${meetingId}?format=csv`);
const blob = await response.blob();
// Download blob as CSV
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/zoom/create-meeting` | POST | Create new meeting |
| `/api/zoom/update-meeting/[id]` | PATCH | Update meeting |
| `/api/zoom/delete-meeting/[id]` | DELETE | Cancel meeting |
| `/api/zoom/attendance/[meetingId]` | GET | Get attendance report |
| `/api/zoom/participants/[meetingId]` | GET | Get live participants |
| `/api/zoom/recording/start/[meetingId]` | POST | Start recording |
| `/api/zoom/recording/stop/[meetingId]` | POST | Stop recording |
| `/api/webhooks/zoom` | POST | Zoom webhook handler |

## 🎨 UI Components

### ZoomMeetingEmbed
Full meeting interface with embedded Zoom.

**Props:**
- `meetingId` (string) - Zoom meeting ID
- `userName` (string) - Participant name
- `userEmail` (string) - Participant email
- `role` ('host' | 'participant') - User role
- `password` (string, optional) - Meeting password

### PreMeetingCheck
Device testing before joining.

**Props:**
- `onComplete` (function) - Callback when checks pass
- `onSkip` (function) - Callback to skip checks

### ZoomControls
In-meeting control panel.

**Props:**
- `meetingId` (string) - Meeting ID
- `isHost` (boolean) - Is user the host
- `onEndMeeting` (function) - End meeting callback
- `onStartRecording` (function) - Start recording callback
- `onStopRecording` (function) - Stop recording callback

### AttendanceTracker
Live attendance monitoring panel.

**Props:**
- `meetingId` (string) - Meeting ID
- `isHost` (boolean) - Is user the host
- `onExportAttendance` (function) - Export callback

### MeetingList
Display list of meetings.

**Props:**
- `meetings` (Meeting[]) - Array of meetings
- `onEdit` (function) - Edit callback
- `onDelete` (function) - Delete callback
- `onCopyLink` (function) - Copy link callback
- `isLoading` (boolean) - Loading state

## 🔐 Security

### Role-Based Access
```typescript
// Only teachers and admins can create meetings
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

if (!['teacher', 'admin'].includes(profile.role)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Meeting Password
```typescript
// Set password when creating meeting
const meetingData = {
  topic: "Secure Class",
  password: "SecurePass123",
  settings: {
    waiting_room: true
  }
};
```

## 📊 Attendance Data Structure

```typescript
interface Participant {
  id: string;
  name: string;
  email: string;
  joinTime: string;
  leaveTime?: string;
  duration: number; // in seconds
  status: 'present' | 'left' | 'waiting';
}
```

## 🐛 Error Handling

```typescript
try {
  await createMeeting(meetingData);
} catch (error) {
  if (error.response?.status === 401) {
    // Invalid credentials
  } else if (error.response?.status === 429) {
    // Rate limit exceeded
  } else {
    // Other errors
  }
}
```

## 📱 Mobile Support

All components are mobile-responsive:
- Touch-friendly controls
- Responsive layouts
- Mobile-optimized video
- Adaptive UI elements

## ⚡ Performance Tips

1. **Lazy Load Components**
```typescript
const ZoomMeetingEmbed = dynamic(
  () => import('@/components/zoom/ZoomMeetingEmbed'),
  { ssr: false }
);
```

2. **Cache Meeting Data**
```typescript
// Use SWR or React Query for caching
const { data: meetings } = useSWR('/api/zoom/meetings', fetcher);
```

3. **Debounce Attendance Updates**
```typescript
// Update every 30 seconds instead of real-time
const interval = setInterval(fetchParticipants, 30000);
```

## 🧪 Testing

### Test Meeting Creation
```bash
curl -X POST http://localhost:3000/api/zoom/create-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test Meeting",
    "start_time": "2024-01-15T10:00:00Z",
    "duration": 60
  }'
```

### Test Webhook
```bash
curl -X POST http://localhost:3000/api/webhooks/zoom \
  -H "Content-Type: application/json" \
  -d '{
    "event": "meeting.started",
    "payload": {
      "object": {
        "id": "123456789"
      }
    }
  }'
```

## 📚 Additional Resources

- [Zoom API Docs](https://marketplace.zoom.us/docs/api-reference/zoom-api)
- [Zoom Meeting SDK](https://marketplace.zoom.us/docs/sdk/native-sdks/web)
- [OAuth Setup Guide](https://marketplace.zoom.us/docs/guides/build/server-to-server-oauth-app)

## 💡 Tips

1. Always test with a free Zoom account first
2. Enable waiting room for security
3. Use cloud recording for automatic storage
4. Export attendance after each class
5. Set up webhooks for real-time updates
6. Monitor API rate limits (varies by plan)
7. Use meaningful meeting topics for easy identification
8. Test on multiple devices and browsers

## 🎉 You're Ready!

The Zoom integration is fully functional. Start by:
1. Setting up environment variables
2. Creating your first meeting
3. Testing the join flow
4. Monitoring attendance

Happy teaching! 🚀
