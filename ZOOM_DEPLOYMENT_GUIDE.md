# Zoom Integration - Deployment Guide

## 🚀 Quick Start Guide

This guide will help you deploy the Zoom integration for your online education platform.

---

## 📋 Prerequisites

- Zoom account (Pro or higher for cloud recording)
- Supabase project
- Next.js application deployed
- Public domain with HTTPS

---

## 🔧 Step-by-Step Setup

### Step 1: Create Zoom Apps

#### A. Server-to-Server OAuth App

1. Go to [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Click "Develop" → "Build App"
3. Choose "Server-to-Server OAuth"
4. Fill in app information:
   - App Name: "Your Platform Live Classes"
   - Company Name: Your company
   - Developer Contact: Your email

5. **App Credentials** (save these):
   - Account ID
   - Client ID
   - Client Secret

6. **Add Scopes**:
   ```
   meeting:write:admin
   meeting:read:admin
   recording:write:admin
   recording:read:admin
   user:read:admin
   report:read:admin
   dashboard:read:admin
   ```

7. **Activate** the app

#### B. Meeting SDK App

1. Create another app → "Meeting SDK"
2. Fill in app information
3. **Get Credentials** (save these):
   - SDK Key
   - SDK Secret

4. **Add Domain** to whitelist:
   - Your production domain
   - localhost:3000 (for development)

5. **Publish** the app

### Step 2: Configure Webhooks

1. In your Server-to-Server OAuth app
2. Go to "Feature" → "Event Subscriptions"
3. **Enable Event Subscriptions**
4. **Event notification endpoint URL**:
   ```
   https://yourdomain.com/api/webhooks/zoom
   ```

5. **Subscribe to Events**:
   - All Meetings
     - Meeting has been created
     - Meeting has been updated
     - Meeting has been deleted
     - Meeting has started
     - Meeting has ended
   - All Recordings
     - Recording completed
     - Recording transcript completed
   - Participant/Host
     - Participant joined meeting
     - Participant left meeting

6. **Save** and verify endpoint

### Step 3: Environment Variables

Add to `.env.local`:

```env
# Zoom Server-to-Server OAuth
ZOOM_ACCOUNT_ID=your_account_id_here
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here

# Zoom Meeting SDK
ZOOM_API_KEY=your_sdk_key_here
ZOOM_API_SECRET=your_sdk_secret_here
```

### Step 4: Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create meeting participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  participant_id TEXT,
  join_time TIMESTAMPTZ,
  leave_time TIMESTAMPTZ,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create class attendance table
CREATE TABLE IF NOT EXISTS class_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  meeting_id TEXT,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')),
  join_time TIMESTAMPTZ,
  leave_time TIMESTAMPTZ,
  duration INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id, meeting_id)
);

-- Update live_classes table
ALTER TABLE live_classes 
  ADD COLUMN IF NOT EXISTS meeting_id TEXT,
  ADD COLUMN IF NOT EXISTS meeting_password TEXT,
  ADD COLUMN IF NOT EXISTS join_url TEXT,
  ADD COLUMN IF NOT EXISTS start_url TEXT,
  ADD COLUMN IF NOT EXISTS recording_url TEXT,
  ADD COLUMN IF NOT EXISTS recording_duration INTEGER,
  ADD COLUMN IF NOT EXISTS recording_processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attendance_synced BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS attendance_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id 
  ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_class_id 
  ON class_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_student_id 
  ON class_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_meeting_id 
  ON live_classes(meeting_id);
```

### Step 5: Supabase Storage

Create storage bucket for recordings:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('zoom-recordings', 'zoom-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for recordings
CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'zoom-recordings');

CREATE POLICY "Users can view recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'zoom-recordings');

CREATE POLICY "Admins can delete recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'zoom-recordings' AND
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);
```

### Step 6: Test the Integration

#### A. Test Webhook Endpoint

```bash
curl -X GET https://yourdomain.com/api/webhooks/zoom
```

Expected response:
```json
{"message":"Zoom webhook endpoint"}
```

#### B. Test Meeting Creation

```bash
curl -X POST https://yourdomain.com/api/zoom/create-meeting \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "topic": "Test Meeting",
    "start_time": "2024-01-20T10:00:00Z",
    "duration": 30
  }'
```

#### C. Test Signature Generation

```bash
curl -X POST https://yourdomain.com/api/zoom/generate-signature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "meetingNumber": "123456789",
    "role": 0
  }'
```

### Step 7: Verify Webhooks

1. Create a test meeting in Zoom
2. Start the meeting
3. Check your application logs for webhook events
4. Verify database updates

---

## 🔍 Verification Checklist

- [ ] Zoom OAuth app created and activated
- [ ] Meeting SDK app created and published
- [ ] Environment variables set correctly
- [ ] Database tables created
- [ ] Storage bucket created with RLS policies
- [ ] Webhook endpoint accessible
- [ ] Webhook events subscribed
- [ ] Test meeting created successfully
- [ ] Webhook events received
- [ ] Recording processing works
- [ ] Attendance tracking works

---

## 🐛 Troubleshooting

### Webhook Not Working

**Problem**: Webhooks not being received

**Solutions**:
1. Verify endpoint is publicly accessible (not localhost)
2. Check HTTPS is enabled
3. Verify webhook URL in Zoom app settings
4. Check application logs for errors
5. Test with Zoom's webhook validator

### Authentication Errors

**Problem**: "Invalid credentials" or "Unauthorized"

**Solutions**:
1. Verify all environment variables are set
2. Check credentials are from correct Zoom app
3. Ensure OAuth app is activated
4. Verify scopes are added
5. Check token expiration

### Recording Not Processing

**Problem**: Recordings not appearing after meeting

**Solutions**:
1. Verify cloud recording is enabled in Zoom account
2. Check storage bucket exists
3. Verify storage permissions
4. Check webhook for "recording.completed" event
5. Review application logs for errors

### Attendance Not Syncing

**Problem**: Attendance data not in database

**Solutions**:
1. Verify meeting has ended
2. Check "meeting.ended" webhook received
3. Verify participant emails match user emails
4. Check database constraints
5. Review sync function logs

---

## 📊 Monitoring

### Key Metrics to Track

1. **Meeting Creation Success Rate**
   - Track failed meeting creations
   - Monitor API response times

2. **Webhook Delivery**
   - Monitor webhook receipt
   - Track processing errors
   - Alert on missed events

3. **Recording Processing**
   - Track processing time
   - Monitor storage usage
   - Alert on failures

4. **Attendance Sync**
   - Monitor sync success rate
   - Track sync delays
   - Alert on failures

### Logging

Add logging for:
- Meeting creation/updates
- Webhook events received
- Recording processing steps
- Attendance sync operations
- API errors

---

## 🔒 Security Best Practices

1. **Webhook Security**
   - Always verify webhook signatures
   - Validate event timestamps
   - Log all webhook events

2. **Meeting Security**
   - Enable waiting rooms
   - Use unique passwords
   - Enable encryption
   - Limit screen sharing

3. **Data Protection**
   - Encrypt recordings at rest
   - Implement access controls
   - Regular security audits
   - GDPR/CCPA compliance

4. **API Security**
   - Rate limiting
   - Authentication required
   - Input validation
   - Error handling

---

## 📈 Performance Optimization

1. **Caching**
   - Cache meeting details
   - Cache user permissions
   - Cache recording URLs

2. **Async Processing**
   - Process recordings asynchronously
   - Queue webhook events
   - Background attendance sync

3. **Database Optimization**
   - Index frequently queried fields
   - Optimize attendance queries
   - Archive old data

---

## 🎯 Next Steps

After deployment:

1. **Monitor** for 24-48 hours
2. **Test** with real classes
3. **Gather** user feedback
4. **Optimize** based on usage
5. **Document** any issues
6. **Train** teachers on features

---

## 📞 Support

If you encounter issues:

1. Check [Zoom API Status](https://status.zoom.us/)
2. Review [Zoom API Documentation](https://marketplace.zoom.us/docs/api-reference/zoom-api)
3. Check application logs
4. Contact Zoom Developer Support

---

## ✅ Deployment Complete!

Your Zoom integration is now ready for production use. Teachers can:
- Schedule live classes
- Start meetings with one click
- Automatic recording
- Automatic attendance tracking
- Access recordings after class

Students can:
- Join classes easily
- View recordings
- Check attendance

---

**Last Updated:** $(date)
**Version:** 1.0.0
