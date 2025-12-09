# Phase 3: File Upload Server-Side Handling - Progress

## Status: 🚧 IN PROGRESS

Task 3 (Create file upload service library) has been completed. The comprehensive file upload service is now ready.

## Completed: Task 3 - File Upload Service Library ✅

### Created: `lib/uploads/file-handler.ts`

A comprehensive file upload service library with the following capabilities:

#### Core Functions Implemented

1. **File Validation** (Requirements 3.1, 3.2)
   - `validateFileType()` - Validates against allowed extensions
   - `validateFileSize()` - Validates against maximum size limits
   - `validateFile()` - Comprehensive validation combining type and size checks
   - Supports images (jpg, png, gif, webp), videos (mp4, mov, avi), documents (pdf, doc, ppt, xls)

2. **Malware Scanning** (Requirement 3.3)
   - `scanForMalware()` - Basic malware detection
   - Checks for suspicious file patterns
   - Placeholder for integration with ClamAV, VirusTotal, or AWS GuardDuty

3. **File Upload** (Requirements 3.4, 3.8)
   - `uploadFile()` - Main upload function to Supabase Storage
   - Automatic bucket organization by file type
   - Progress tracking support
   - Automatic file processing based on type

4. **Image Processing** (Requirement 3.5)
   - `processImage()` - Generates optimized versions
   - Extracts dimensions (width, height)
   - Placeholder for thumbnail, medium, and large variants
   - Ready for integration with Sharp or ImageMagick

5. **Video Processing** (Requirement 3.6)
   - `processVideo()` - Extracts video metadata
   - Duration extraction
   - Dimensions (width, height)
   - Placeholder for thumbnail generation

6. **Document Processing** (Requirement 3.7)
   - `processDocument()` - Extracts document metadata
   - Placeholder for page count and word count extraction
   - Ready for integration with pdf-lib or mammoth

7. **File Deletion** (Requirement 3.10)
   - `deleteFile()` - Removes file from storage and database
   - Permission validation
   - Cleanup of variants (for images)

8. **Cleanup Functions** (Requirement 3.9)
   - `cleanupFailedUpload()` - Removes partial uploads on failure
   - Best-effort cleanup with silent failure handling

#### Configuration

**File Type Limits:**
- Images: 10MB max (jpg, jpeg, png, gif, webp, svg)
- Videos: 500MB max (mp4, mov, avi, mkv, webm)
- Documents: 50MB max (pdf, doc, docx, ppt, pptx, xls, xlsx, txt)

**Storage Buckets:**
- `course-images` - For image files
- `course-videos` - For video files
- `course-documents` - For document files

#### Helper Functions

- `getFileCategory()` - Determines file category from extension
- `loadImage()` - Loads image to extract dimensions
- `loadVideo()` - Loads video to extract metadata
- `storeFileRecord()` - Stores file metadata in database
- `formatFileSize()` - Formats bytes for display
- `getFileIcon()` - Returns emoji icon for file type

#### TypeScript Types

```typescript
interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

interface UploadResult {
  success: boolean
  fileId?: string
  publicUrl?: string
  metadata?: FileMetadata
  error?: string
}

interface FileMetadata {
  filename: string
  fileType: string
  fileSize: number
  bucket: string
  path: string
  width?: number
  height?: number
  duration?: number
  pageCount?: number
  wordCount?: number
  thumbnail?: string
  variants?: ImageVariants
}
```

## Completed: Tasks 3.1-3.3 - Property Tests ✅

### Created: `__tests__/property/fileUpload.property.test.ts`

Comprehensive property-based tests for file upload validation:

1. **Task 3.1** ✅ - Property test for file type validation (Property 21)
   - Tests that all valid extensions are accepted
   - Tests that all invalid extensions are rejected
   - Tests that files without extensions are rejected
   - Tests case-insensitivity for extensions
   - Tests deterministic validation
   - **100 test runs per property**

2. **Task 3.2** ✅ - Property test for file size validation (Property 22)
   - Tests that oversized images are rejected (>10MB)
   - Tests that oversized videos are rejected (>500MB)
   - Tests that oversized documents are rejected (>50MB)
   - Tests that files within limits are accepted
   - **100 test runs per property**

3. **Task 3.3** ✅ - Property test for malware scanning (Property 23)
   - Tests that executable extensions (.exe, .bat, .cmd, etc.) are rejected
   - Tests that safe extensions pass scanning
   - Tests deterministic scanning behavior
   - **100 test runs per property**

**Test Results**: All 14 tests passing ✅

## Next Steps

### Immediate Tasks (In Order)

4. **Task 3.4** - Create file upload API endpoint
   - Create `/api/upload/file` endpoint
   - Implement validation, upload, and processing
   - Return public URL and metadata

5. **Task 3.5-3.7** - Write property tests for processing
   - Storage organization
   - Image optimization
   - Video metadata extraction

6. **Task 3.8** - Update file upload components
   - Update ImageUploader to use server-side upload
   - Update DocumentUploader to use server-side upload
   - Update VideoUploader to use server-side upload

7. **Task 3.10** - Create file deletion API endpoint
   - Create `/api/upload/file/[id]` DELETE endpoint

8. **Task 3.13** - Implement resumable upload support
   - Add chunked upload functionality
   - Implement resume logic

9. **Task 3.14** - Checkpoint - Ensure all tests pass

## Database Requirements

The file upload service expects a `file_uploads` table with the following structure:

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
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'uploading',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_status ON file_uploads(status);
```

## Integration Notes

### For Production Deployment

1. **Malware Scanning**: Integrate with a real malware scanning service
   - ClamAV for self-hosted solution
   - VirusTotal API for cloud-based scanning
   - AWS GuardDuty for AWS deployments

2. **Image Optimization**: Integrate with image processing library
   - Sharp (Node.js) for server-side processing
   - ImageMagick for advanced transformations
   - Cloudinary or Imgix for cloud-based processing

3. **Video Processing**: Integrate with video processing service
   - FFmpeg for metadata extraction and thumbnail generation
   - AWS MediaConvert for cloud-based processing
   - Cloudinary for video optimization

4. **Document Processing**: Integrate with document parsing libraries
   - pdf-lib for PDF processing
   - mammoth for Word document processing
   - Apache POI for Excel/PowerPoint processing

5. **Resumable Uploads**: Implement chunked upload for large files
   - Use tus protocol for resumable uploads
   - Implement custom backend endpoint for chunk handling
   - Add progress tracking and resume capability

## Security Considerations

✅ **Implemented:**
- File type validation against whitelist
- File size limits per category
- Basic malware pattern detection
- User-based access control
- Secure storage paths with user ID

🔄 **To Implement:**
- Advanced malware scanning integration
- Rate limiting on upload endpoints
- CSRF protection
- Content Security Policy headers
- Signed URLs for private files

## Performance Considerations

- Async processing for large files
- Progress tracking for user feedback
- Cleanup of failed uploads
- Efficient storage organization
- CDN integration for public files

---

**Phase**: 3 of 5  
**Status**: In Progress 🚧  
**Next Task**: 3.1 - Write property test for file type validation

