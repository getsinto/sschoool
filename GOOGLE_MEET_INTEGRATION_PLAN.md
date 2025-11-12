# Google Meet Integration - Implementation Plan

## Overview
Implement Google Meet as an alternative video conferencing platform for live classes, providing teachers with flexibility to choose between Zoom and Google Meet.

## Key Differences from Zoom
- Uses Google Calendar API to create events with Meet links
- OAuth 2.0 flow for teacher authentication
- No native attendance API (manual tracking required)
- Recording stored in Google Drive (Workspace only)
- Simpler setup, no meeting passwords
- Free tier: 100 participants, 60-minute limit
- Workspace: 250 participants, unlimited time

## Implementation Structure

### Core Library Files (5 files)
1. `lib/google-meet/client.ts` - Google API client & OAuth
2. `lib/google-meet/auth.ts` - OAuth flow management
3. `lib/google-meet/meetings.ts` - Calendar event CRUD
4. `lib/google-meet/recordings.ts` - Google Drive integration
5. `lib/google-meet/utils.ts` - Utility functions

### API Routes (8 endpoints)
1. `POST /api/google-meet/auth` - Initiate OAuth
2. `GET /api/google-meet/callback` - OAuth callback
3. `POST /api/google-meet/create-meeting` - Create event
4. `PATCH /api/google-meet/update-meeting/[id]` - Update event
5. `DELETE /api/google-meet/delete-meeting/[id]` - Delete event
6. `GET /api/google-meet/recordings/[eventId]` - List recordings
7. `POST /api/google-meet/calendar-sync` - Sync calendar
8. `GET /api/google-meet/status` - Check connection status

### UI Components (4 components)
1. `components/google-meet/MeetButton.tsx` - Join button
2. `components/google-meet/CalendarSync.tsx` - Calendar integration
3. `components/google-meet/AttendanceManual.tsx` - Manual attendance
4. `components/google-meet/ConnectionStatus.tsx` - OAuth status

### Pages (3 pages)
1. `app/(dashboard)/teacher/integrations/google/page.tsx` - OAuth setup
2. `app/(dashboard)/student/live-classes/join-meet/[id]/page.tsx` - Join page
3. `app/(dashboard)/settings/calendar-sync/page.tsx` - Calendar settings

### Database Updates
- Add `google_event_id` column to `live_classes`
- Add `google_refresh_token` to user settings
- Add `preferred_platform` (zoom/google_meet) to teacher profile

### Environment Variables
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_CALENDAR_API_KEY=
```

## Features to Implement

### Phase 1: Core Integration ✅
- [x] Google OAuth setup
- [x] Calendar API client
- [x] Create/update/delete events
- [x] Generate Meet links
- [x] Basic join flow

### Phase 2: Teacher Experience ✅
- [x] OAuth connection page
- [x] Platform selector (Zoom/Meet)
- [x] Meeting creation with Meet
- [x] Calendar sync settings

### Phase 3: Student Experience ✅
- [x] Join Meet meetings
- [x] Calendar integration
- [x] Mobile-friendly join

### Phase 4: Advanced Features
- [ ] Google Drive recordings
- [ ] Manual attendance tracking
- [ ] Calendar conflict detection
- [ ] Bulk calendar sync

## Implementation Priority
1. Core library and OAuth (HIGH)
2. Meeting creation/management (HIGH)
3. Join flow for students (HIGH)
4. Calendar sync (MEDIUM)
5. Recording management (LOW - Workspace only)
6. Advanced features (LOW)

## Notes
- Google Meet has limited API compared to Zoom
- Focus on simplicity and ease of use
- Leverage existing notification/email systems
- Maintain consistency with Zoom integration patterns

## Estimated Files: ~25 files
- 5 library files
- 8 API routes
- 4 UI components
- 3 pages
- 2 hooks
- 1 type definition
- 1 database migration
- 1 documentation

Let's begin implementation!
