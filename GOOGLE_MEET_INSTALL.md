# Google Meet Integration - Installation Commands

## Quick Install (Copy & Paste)

### Step 1: Install Dependencies
```bash
npm install googleapis google-auth-library
```

### Step 2: Add Environment Variables
Add to `.env.local`:
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-meet/callback
```

### Step 3: Run Database Migration
```bash
# Using Supabase CLI
supabase db push

# Or manually run this SQL in Supabase Dashboard:
# supabase/migrations/011_google_meet_integration.sql
```

### Step 4: Restart Development Server
```bash
npm run dev
```

---

## Get Google OAuth Credentials

1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/google-meet/callback`
   - Production: `https://yourdomain.com/api/google-meet/callback`
7. Copy Client ID and Client Secret to `.env.local`

---

## Verify Installation

### Check Dependencies
```bash
npm list googleapis google-auth-library
```

### Check Environment Variables
```bash
# Windows (PowerShell)
Get-Content .env.local | Select-String "GOOGLE"

# Linux/Mac
grep GOOGLE .env.local
```

### Check Database Migration
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_integrations';

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'live_classes' 
AND column_name = 'google_event_id';
```

---

## Test Installation

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/dashboard/teacher/settings`
3. Look for "Google Meet Integration" section
4. Click "Connect Google Meet"
5. Complete OAuth flow
6. Verify "Connected" status

---

## Production Deployment

### Update Environment Variables
```bash
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-meet/callback
```

### Update Google Cloud Console
1. Add production redirect URI
2. Verify OAuth consent screen
3. Publish app (if needed)

### Deploy
```bash
npm run build
npm run start
```

---

## Troubleshooting

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
```bash
# Restart development server
# Ctrl+C to stop
npm run dev
```

### Database Migration Failed
```bash
# Check Supabase connection
supabase status

# Reset and retry
supabase db reset
supabase db push
```

---

## Files Created

All necessary files have been created:

**Core Library** (5 files)
- `lib/google-meet/client.ts`
- `lib/google-meet/auth.ts`
- `lib/google-meet/meetings.ts`
- `lib/google-meet/sync.ts`
- `types/google-meet.ts`

**API Routes** (6 files)
- `app/api/google-meet/auth/route.ts`
- `app/api/google-meet/callback/route.ts`
- `app/api/google-meet/disconnect/route.ts`
- `app/api/google-meet/status/route.ts`
- `app/api/google-meet/meetings/route.ts`
- `app/api/google-meet/meetings/[eventId]/route.ts`

**Components** (4 files)
- `components/google-meet/GoogleMeetConnect.tsx`
- `components/google-meet/GoogleMeetSelector.tsx`
- `components/live-classes/PlatformSelector.tsx`
- `hooks/useGoogleMeet.ts`

**Database** (1 file)
- `supabase/migrations/011_google_meet_integration.sql`

**Documentation** (4 files)
- `GOOGLE_MEET_COMPLETE.md`
- `GOOGLE_MEET_QUICK_START.md`
- `GOOGLE_MEET_FINAL_SUMMARY.md`
- `GOOGLE_MEET_INSTALL.md` (this file)

---

## Next Steps

After installation:

1. ✅ Connect Google account in teacher settings
2. ✅ Create test live class with Google Meet
3. ✅ Verify calendar event created
4. ✅ Test student join experience
5. ✅ Deploy to production

---

## Support

For issues or questions:
- Check: `GOOGLE_MEET_COMPLETE.md` for full documentation
- Check: `GOOGLE_MEET_QUICK_START.md` for quick guide
- Check: `GOOGLE_MEET_FINAL_SUMMARY.md` for overview

---

**Installation Status**: ✅ READY TO INSTALL
