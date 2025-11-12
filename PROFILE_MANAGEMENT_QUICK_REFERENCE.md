# User Profile Management - Quick Reference Guide

## 📚 Table of Contents
1. [Components](#components)
2. [API Routes](#api-routes)
3. [Database Tables](#database-tables)
4. [Common Tasks](#common-tasks)
5. [Troubleshooting](#troubleshooting)

---

## Components

### ProfileForm
**Path:** `components/profile/ProfileForm.tsx`
**Usage:** General profile management for all users
```tsx
import ProfileForm from '@/components/profile/ProfileForm'

<ProfileForm />
```

### IDVerification
**Path:** `components/profile/IDVerification.tsx`
**Usage:** ID document upload and verification
```tsx
import IDVerification from '@/components/profile/IDVerification'

<IDVerification />
```

### TeacherProfile
**Path:** `components/profile/TeacherProfile.tsx`
**Usage:** Teacher-specific profile management
```tsx
import TeacherProfile from '@/components/profile/TeacherProfile'

<TeacherProfile />
```

### StudentProfile
**Path:** `components/profile/StudentProfile.tsx`
**Usage:** Student-specific profile management
```tsx
import StudentProfile from '@/components/profile/StudentProfile'

<StudentProfile />
```

### ParentProfile
**Path:** `components/profile/ParentProfile.tsx`
**Usage:** Parent-specific profile management
```tsx
import ParentProfile from '@/components/profile/ParentProfile'

<ParentProfile />
```

---

## API Routes

### Profile Management

#### Update Profile
```typescript
POST /api/profile/update
Body: {
  profileData?: { /* user fields */ },
  notificationSettings?: { /* notification prefs */ },
  privacySettings?: { /* privacy prefs */ }
}
```

#### Get Profile
```typescript
GET /api/profile/update
Returns: {
  profile: UserProfile,
  roleProfile: TeacherProfile | StudentProfile | ParentProfile,
  settings: { notifications, privacy }
}
```

### Photo Management

#### Upload Photo
```typescript
POST /api/profile/upload-photo
Body: FormData with 'file'
Returns: { url: string }
```

#### Delete Photo
```typescript
DELETE /api/profile/upload-photo
```

### Security

#### Change Password
```typescript
POST /api/profile/change-password
Body: {
  currentPassword: string,
  newPassword: string
}
```

#### Delete Account
```typescript
POST /api/profile/delete-account
Body: {
  password: string,
  reason?: string
}
```

### Document Management

#### Upload Document
```typescript
POST /api/profile/upload-document
Body: FormData with:
  - file: File
  - type: 'front' | 'back' | 'resume'
  - documentType: 'id_verification' | 'resume'
Returns: { url: string, type: string }
```

#### Delete Document
```typescript
DELETE /api/profile/upload-document?url={documentUrl}&type={documentType}
```

### Parent-Student Linking

#### Link Parent (Student initiates)
```typescript
POST /api/profile/link-parent
Body: { parentEmail: string }
```

#### Link Student (Parent initiates)
```typescript
POST /api/profile/link-student
Body: { studentEmail: string }
```

#### Unlink Parent (Student initiates)
```typescript
POST /api/profile/unlink-parent
```

#### Unlink Student (Parent initiates)
```typescript
POST /api/profile/unlink-student
Body: { studentId: string }
```

### Communication Preferences

#### Save Preferences
```typescript
POST /api/profile/communication-preferences
Body: {
  emailNotifications: boolean,
  smsNotifications: boolean,
  progressReports: boolean,
  assignmentAlerts: boolean,
  behaviorReports: boolean,
  eventNotifications: boolean
}
```

#### Get Preferences
```typescript
GET /api/profile/communication-preferences
Returns: { preferences: CommunicationPreferences }
```

---

## Database Tables

### parent_link_requests
```sql
id UUID PRIMARY KEY
student_id UUID (FK to users)
parent_id UUID (FK to users)
status VARCHAR(20) -- 'pending', 'approved', 'rejected'
requested_at TIMESTAMP
responded_at TIMESTAMP
response_note TEXT
```

### account_deletions
```sql
id UUID PRIMARY KEY
user_id UUID (FK to users)
user_email VARCHAR(255)
user_name VARCHAR(255)
user_role VARCHAR(50)
reason TEXT
requested_at TIMESTAMP
status VARCHAR(20) -- 'pending', 'approved', 'rejected', 'completed'
processed_at TIMESTAMP
processed_by UUID (FK to users)
admin_notes TEXT
```

---

## Common Tasks

### 1. Update User Profile
```typescript
import { useUser } from '@/hooks/useUser'

const { updateProfile } = useUser()

await updateProfile({
  full_name: 'John Doe',
  mobile: '+1234567890',
  country: 'US'
})
```

### 2. Upload Profile Photo
```typescript
const formData = new FormData()
formData.append('file', photoFile)

const response = await fetch('/api/profile/upload-photo', {
  method: 'POST',
  body: formData
})

const { url } = await response.json()
```

### 3. Change Password
```typescript
const response = await fetch('/api/profile/change-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    currentPassword: 'oldpass123',
    newPassword: 'NewPass123!'
  })
})
```

### 4. Link Parent Account (Student)
```typescript
const response = await fetch('/api/profile/link-parent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parentEmail: 'parent@example.com'
  })
})
```

### 5. Update Teacher Profile
```typescript
import { useUser } from '@/hooks/useUser'

const { updateTeacherProfile } = useUser()

await updateTeacherProfile({
  qualifications: 'M.Ed in Mathematics',
  field_of_study: 'Mathematics Education',
  experience_years: 5,
  subjects: ['Mathematics', 'Physics'],
  bio: 'Experienced math teacher...'
})
```

### 6. Upload ID Verification
```typescript
const formData = new FormData()
formData.append('file', idCardFile)
formData.append('type', 'front')
formData.append('documentType', 'id_verification')

const response = await fetch('/api/profile/upload-document', {
  method: 'POST',
  body: formData
})
```

### 7. Approve Parent Link Request
```typescript
// Using the helper function
SELECT approve_parent_link_request('request-uuid-here');

// Or manually
UPDATE parent_link_requests
SET status = 'approved', responded_at = NOW()
WHERE id = 'request-uuid-here';

UPDATE students
SET parent_id = 'parent-uuid-here'
WHERE user_id = 'student-uuid-here';
```

---

## Troubleshooting

### Issue: Profile photo not uploading

**Check:**
1. File size < 5MB
2. File type is JPEG or PNG
3. User is authenticated
4. Storage bucket 'avatars' exists

**Solution:**
```typescript
// Validate before upload
if (file.size > 5 * 1024 * 1024) {
  throw new Error('File too large')
}
if (!['image/jpeg', 'image/png'].includes(file.type)) {
  throw new Error('Invalid file type')
}
```

### Issue: Password change fails

**Check:**
1. Current password is correct
2. New password meets requirements (8+ chars, uppercase, lowercase, number)
3. User is authenticated

**Solution:**
```typescript
// Validate password strength
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
if (!passwordRegex.test(newPassword)) {
  throw new Error('Password does not meet requirements')
}
```

### Issue: Parent link request not working

**Check:**
1. Parent email exists in database
2. Parent user has role 'parent'
3. Student doesn't already have a parent linked
4. Table 'parent_link_requests' exists

**Solution:**
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'parent_link_requests'
);

-- If not, run migration
-- supabase/migrations/014_profile_management_tables.sql
```

### Issue: Document upload fails

**Check:**
1. File size within limits (5MB for IDs, 10MB for resumes)
2. File type is allowed
3. Storage bucket 'documents' exists
4. User has permission

**Solution:**
```typescript
// Check file constraints
const maxSize = documentType === 'resume' ? 10 * 1024 * 1024 : 5 * 1024 * 1024
if (file.size > maxSize) {
  throw new Error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`)
}
```

### Issue: RLS policy blocking access

**Check:**
1. User is authenticated
2. User has correct role
3. RLS policies are enabled
4. User owns the resource

**Solution:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'parent_link_requests';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE parent_link_requests DISABLE ROW LEVEL SECURITY;
```

---

## File Size Limits

| Document Type | Max Size | Allowed Formats |
|--------------|----------|-----------------|
| Profile Photo | 5MB | JPEG, PNG |
| ID Verification | 5MB | JPEG, PNG, PDF |
| Resume/CV | 10MB | PDF, DOC, DOCX |

---

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- No maximum length

---

## Notification Types

### For All Users
- Email Notifications
- SMS Notifications
- Marketing Emails
- Course Updates
- Assignment Reminders

### For Parents Only
- Progress Reports
- Assignment Alerts
- Behavior Reports
- Event Notifications

---

## Privacy Settings

- **Profile Visibility:** Public, Friends Only, Private
- **Show Email:** Yes/No
- **Show Phone:** Yes/No
- **Allow Messages:** Yes/No

---

## Support

For issues or questions:
1. Check this guide first
2. Review the complete audit: `USER_PROFILE_MANAGEMENT_COMPLETE.md`
3. Check API route implementations
4. Verify database migrations are applied
5. Check Supabase logs for errors

---

**Last Updated:** November 12, 2025
**Version:** 1.0.0
