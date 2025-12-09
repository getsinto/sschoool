# File Upload Configuration Guide

## Overview

This guide covers the configuration and setup of server-side file upload handling, including validation, storage, processing, and security measures.

## Architecture

The file upload system consists of:
- **Client-side components**: Upload UI with progress indicators
- **Server-side validation**: Type, size, and malware checking
- **Storage**: Supabase Storage buckets
- **Processing**: Image optimization, video metadata extraction
- **Database**: File metadata and tracking

## Supabase Storage Setup

### Step 1: Create Storage Buckets

1. Log in to your Supabase dashboard
2. Navigate to Storage
3. Create the following buckets:

```sql
-- Course materials bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true);

-- User uploads bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', false);

-- Profile images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true);

-- Certificates bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true);
```

### Step 2: Configure Storage Policies

Apply Row Level Security (RLS) policies:

```sql
-- Allow authenticated users to upload to user-uploads
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow teachers to upload course materials
CREATE POLICY "Teachers can upload course materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-materials' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

-- Allow public read access to course materials
CREATE POLICY "Public can read course materials"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-materials');
```

## File Validation Configuration

### Allowed File Types

Configure in `lib/uploads/file-handler.ts`:

```typescript
const ALLOWED_FILE_TYPES = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  videos: ['.mp4', '.webm', '.mov'],
  documents: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'],
  audio: ['.mp3', '.wav', '.ogg']
};
```

### File Size Limits

```typescript
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,      // 10 MB
  video: 500 * 1024 * 1024,     // 500 MB
  document: 50 * 1024 * 1024,   // 50 MB
  audio: 20 * 1024 * 1024       // 20 MB
};
```

## Environment Variables

Add to `.env.local`:

```env
# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# File Upload Configuration
MAX_UPLOAD_SIZE=524288000  # 500 MB in bytes
UPLOAD_TIMEOUT=300000      # 5 minutes in milliseconds

# Malware Scanning (Optional - requires ClamAV or similar)
ENABLE_MALWARE_SCAN=false
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

## Image Processing

### Image Optimization

Images are automatically optimized into three sizes:

```typescript
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 800, height: 600 },
  large: { width: 1920, height: 1080 }
};
```

### Required Dependencies

```bash
npm install sharp
```

## Video Processing

### Video Metadata Extraction

Videos are processed to extract:
- Duration
- Resolution
- Codec information
- Thumbnail generation

### Required Dependencies

```bash
npm install fluent-ffmpeg
# Also requires ffmpeg installed on the system
```

### Install FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## Database Schema

The file uploads table tracks all uploaded files:

```sql
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'uploading',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_status ON file_uploads(status);
CREATE INDEX idx_file_uploads_created_at ON file_uploads(created_at);

-- Enable RLS
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own uploads"
ON file_uploads FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own uploads"
ON file_uploads FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
```

## API Endpoints

### Upload File

```
POST /api/upload/file
Content-Type: multipart/form-data

Body:
- file: File (required)
- bucket: string (optional, defaults to 'user-uploads')
- folder: string (optional)

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://...",
    "metadata": {
      "size": 1024,
      "type": "image/jpeg",
      "variants": {
        "thumbnail": "https://...",
        "medium": "https://...",
        "large": "https://..."
      }
    }
  }
}
```

### Delete File

```
DELETE /api/upload/file/[id]

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Client-Side Usage

### Image Upload Example

```typescript
import { useState } from 'react';

function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'course-materials');

    try {
      const response = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Upload successful:', result.data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      disabled={uploading}
    />
  );
}
```

## Malware Scanning (Optional)

### ClamAV Setup

1. Install ClamAV:
```bash
sudo apt-get install clamav clamav-daemon
```

2. Update virus definitions:
```bash
sudo freshclam
```

3. Start the daemon:
```bash
sudo systemctl start clamav-daemon
```

4. Enable in environment:
```env
ENABLE_MALWARE_SCAN=true
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
```

## Resumable Uploads

For large files, resumable uploads are supported using the tus protocol:

```typescript
import * as tus from 'tus-js-client';

const upload = new tus.Upload(file, {
  endpoint: '/api/upload/resumable',
  retryDelays: [0, 3000, 5000, 10000, 20000],
  metadata: {
    filename: file.name,
    filetype: file.type
  },
  onProgress: (bytesUploaded, bytesTotal) => {
    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
    console.log(percentage + '%');
  },
  onSuccess: () => {
    console.log('Upload complete!');
  }
});

upload.start();
```

## Monitoring and Logging

### Track Upload Metrics

Monitor in Sentry:
- Upload success rate
- Average upload time
- Failed uploads by error type
- Storage usage by bucket

### Log Important Events

```typescript
// Log successful uploads
logger.info('File uploaded', {
  userId,
  fileId,
  fileSize,
  fileType,
  duration
});

// Log failed uploads
logger.error('Upload failed', {
  userId,
  error,
  fileSize,
  fileType
});
```

## Troubleshooting

### Upload Fails with "File too large"

**Solution**: Check `MAX_UPLOAD_SIZE` environment variable and Supabase storage limits.

### Images Not Optimizing

**Solution**: Ensure `sharp` is installed and working. Check server logs for processing errors.

### Video Thumbnails Not Generating

**Solution**: Verify FFmpeg is installed and accessible. Check `ffmpeg -version`.

### Permission Denied Errors

**Solution**: Review RLS policies in Supabase. Ensure user has proper authentication.

## Security Best Practices

1. **Always validate file types**: Never trust client-side validation alone
2. **Scan for malware**: Enable ClamAV in production
3. **Limit file sizes**: Prevent abuse and storage overflow
4. **Use signed URLs**: For private files, generate time-limited signed URLs
5. **Implement rate limiting**: Prevent upload spam
6. **Monitor storage usage**: Set up alerts for unusual activity

## Performance Optimization

1. **Use CDN**: Configure Supabase Storage with CDN
2. **Lazy load images**: Use Next.js Image component
3. **Compress before upload**: Client-side compression for large files
4. **Batch processing**: Process multiple files in parallel
5. **Cache metadata**: Store processed metadata in database

## Next Steps

1. Test upload flow with various file types
2. Monitor storage usage and costs
3. Set up automated cleanup for abandoned uploads
4. Implement file versioning if needed
5. Configure backup strategy for critical files
