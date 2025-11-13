# Registration System Fixes Needed

## Issues Found

### 1. File Upload Error (500)
**Error**: `POST https://sschoool.vercel.app/api/auth/upload-file 500 (Internal Server Error)`

**Root Cause**: The Supabase storage buckets referenced in the upload API don't exist:
- `id-verification` bucket
- `documents` bucket

**Fix Required**:
Create these storage buckets in Supabase:

```sql
-- Run in Supabase SQL Editor
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('id-verification', 'id-verification', true),
  ('documents', 'documents', true);

-- Set up storage policies for id-verification bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'id-verification');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'id-verification' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow users to update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'id-verification' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Set up storage policies for documents bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow users to update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Alternative**: Update the API to use a single existing bucket or create buckets via Supabase Dashboard:
1. Go to Storage in Supabase Dashboard
2. Create new bucket: `id-verification` (Public)
3. Create new bucket: `documents` (Public)

### 2. Lesson Duration Validation Error
**Error**: `Expected '30' | '45' | '60' | '90', received number`

**Root Cause**: The form is sending lesson duration as a number, but the validation expects a string.

**Location**: This appears to be in the student/teacher registration form where lesson preferences are collected.

**Fix**: Need to ensure the Select component value is converted to string or the validation schema accepts numbers.

### 3. CSP Warning
**Warning**: Content Security Policy blocks 'eval' in JavaScript

**Impact**: Low priority - this is a warning, not blocking functionality

**Fix** (Optional): Update `next.config.js` to add CSP headers if needed:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
        }
      ]
    }
  ]
}
```

## Immediate Actions Required

1. **Create Supabase Storage Buckets** (CRITICAL)
   - Go to your Supabase project dashboard
   - Navigate to Storage
   - Create `id-verification` bucket (public)
   - Create `documents` bucket (public)
   - Set appropriate RLS policies

2. **Test File Upload**
   - After creating buckets, test the registration flow
   - Upload an ID document
   - Verify the file appears in Supabase Storage

3. **Fix Lesson Duration** (if applicable)
   - Search for where lesson duration field is defined
   - Ensure Select component returns string values
   - Or update validation to accept numbers and convert

## Testing Checklist

- [ ] Storage buckets created in Supabase
- [ ] File upload works without 500 error
- [ ] ID verification documents upload successfully
- [ ] Resume/CV uploads work (for teachers)
- [ ] Registration completes without validation errors
- [ ] Files are accessible via public URLs
