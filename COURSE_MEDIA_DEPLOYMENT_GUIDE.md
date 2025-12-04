# Course Media Enhancement - Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Database Migration
- [ ] Review migration file: `supabase/migrations/20250105000001_course_media_enhancements.sql`
- [ ] Test migration on local Supabase instance
- [ ] Backup production database
- [ ] Run migration on staging environment
- [ ] Verify all tables and columns created
- [ ] Test RLS policies

### 2. Storage Configuration
- [ ] Verify `courses` bucket exists in Supabase Storage
- [ ] Configure storage policies for public read access
- [ ] Set up CDN caching rules (if applicable)
- [ ] Test file upload permissions
- [ ] Verify storage quota limits

### 3. Code Deployment
- [ ] All new files committed to repository
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds locally
- [ ] Environment variables configured

### 4. Testing
- [ ] Test banner upload flow
- [ ] Test video upload flow
- [ ] Test video embed flow
- [ ] Test API endpoints
- [ ] Test media deletion
- [ ] Test responsive image loading

## 🚀 Deployment Steps

### Step 1: Run Database Migration

#### Option A: Using Supabase CLI (Recommended)

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migration
supabase db push

# Verify migration
supabase db diff
```

#### Option B: Using Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20250105000001_course_media_enhancements.sql`
3. Paste and run the SQL
4. Verify no errors
5. Check that new columns exist in `courses` table
6. Check that `course_media_gallery` table exists

### Step 2: Configure Storage

#### Create Storage Bucket (if not exists)

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('courses', 'courses', true)
ON CONFLICT (id) DO NOTHING;
```

#### Configure Storage Policies

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload course media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'courses');

-- Allow authenticated users to update their uploads
CREATE POLICY "Users can update their course media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'courses');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Users can delete their course media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'courses');

-- Allow public read access
CREATE POLICY "Public can view course media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'courses');
```

### Step 3: Deploy Code

#### Using Vercel

```bash
# Commit all changes
git add .
git commit -m "feat: Add course media enhancement system"

# Push to repository
git push origin main

# Vercel will auto-deploy
# Or manually trigger: vercel --prod
```

#### Using Other Platforms

```bash
# Build the project
npm run build

# Deploy using your platform's CLI
# Example for other platforms:
# npm run deploy
```

### Step 4: Verify Deployment

1. **Check Build Logs**
   - No TypeScript errors
   - No build warnings
   - All routes compiled successfully

2. **Test API Endpoints**
   ```bash
   # Test GET media
   curl https://your-domain.com/api/courses/[course-id]/media
   
   # Test PATCH media (requires auth token)
   curl -X PATCH https://your-domain.com/api/courses/[course-id]/media \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"banners":{"desktop":"https://..."}}'
   ```

3. **Test UI Components**
   - Navigate to admin course creation
   - Upload a banner image
   - Verify all 4 sizes generated
   - Check images load correctly
   - Test video upload/embed

## 🔧 Configuration

### Environment Variables

No new environment variables required. The system uses existing Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Storage Limits

Default limits (adjust as needed):
- Image files: 5MB max
- Video files: 100MB max
- Gallery: 10 images max per course
- Demo videos: 3 max per course

To adjust limits, update validation in:
- `lib/media/optimize.ts` - `validateImageFile()` and `validateVideoFile()`
- `components/common/BannerUploader.tsx`
- `components/teacher/course-builder/VideoManager.tsx`

## 📊 Post-Deployment Monitoring

### 1. Database Monitoring

```sql
-- Check media usage
SELECT 
  COUNT(*) as total_courses_with_media,
  COUNT(CASE WHEN banner_desktop_url IS NOT NULL THEN 1 END) as courses_with_banners,
  COUNT(CASE WHEN promo_video_url IS NOT NULL THEN 1 END) as courses_with_videos
FROM courses;

-- Check gallery usage
SELECT 
  media_type,
  COUNT(*) as count,
  AVG(file_size_bytes) as avg_size
FROM course_media_gallery
GROUP BY media_type;
```

### 2. Storage Monitoring

```sql
-- Check storage usage
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_bytes
FROM storage.objects
WHERE bucket_id = 'courses'
GROUP BY bucket_id;
```

### 3. Performance Monitoring

Monitor these metrics:
- Upload success rate (target: >95%)
- Average upload time
- Image optimization time
- API response times
- Storage bandwidth usage

### 4. Error Monitoring

Check logs for:
- Upload failures
- Optimization errors
- API errors
- Storage quota exceeded
- Permission errors

## 🐛 Troubleshooting

### Issue: Migration Fails

**Symptoms**: Error when running migration

**Solutions**:
1. Check if columns already exist:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'courses' 
   AND column_name LIKE '%banner%';
   ```

2. If columns exist, migration is already applied
3. If partial migration, manually add missing columns
4. Check for conflicting constraints

### Issue: Upload Fails

**Symptoms**: "Upload failed" error in UI

**Solutions**:
1. Check storage bucket exists
2. Verify storage policies are configured
3. Check file size limits
4. Verify user authentication
5. Check browser console for errors
6. Verify Supabase storage quota

### Issue: Images Not Loading

**Symptoms**: Broken image links

**Solutions**:
1. Check storage bucket is public
2. Verify public read policy exists
3. Check CORS configuration
4. Verify URLs are correct
5. Check CDN caching

### Issue: Slow Upload

**Symptoms**: Upload takes too long

**Solutions**:
1. Reduce image quality setting
2. Implement chunked upload for large files
3. Use Web Workers for optimization
4. Check network connection
5. Consider CDN for uploads

## 📝 Rollback Plan

If issues occur after deployment:

### 1. Rollback Code

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in Vercel dashboard
```

### 2. Rollback Database (if needed)

```sql
-- Remove new columns (only if necessary)
ALTER TABLE courses
  DROP COLUMN IF EXISTS banner_desktop_url,
  DROP COLUMN IF EXISTS banner_mobile_url,
  DROP COLUMN IF EXISTS card_banner_url,
  DROP COLUMN IF EXISTS featured_banner_url,
  DROP COLUMN IF EXISTS promo_video_url,
  DROP COLUMN IF EXISTS promo_video_thumbnail,
  DROP COLUMN IF EXISTS promo_video_title,
  DROP COLUMN IF EXISTS promo_video_description,
  DROP COLUMN IF EXISTS promo_video_duration,
  DROP COLUMN IF EXISTS promo_video_provider;

-- Remove gallery table (only if necessary)
DROP TABLE IF EXISTS course_media_gallery;
```

**⚠️ Warning**: Only rollback database if absolutely necessary. Data will be lost.

## ✅ Success Criteria

Deployment is successful when:

- [ ] Migration runs without errors
- [ ] Storage bucket is accessible
- [ ] Banner upload generates all 4 sizes
- [ ] Images are optimized to WebP
- [ ] Video upload works
- [ ] Video embed works
- [ ] API endpoints respond correctly
- [ ] No console errors
- [ ] Images load on course pages
- [ ] Performance is acceptable (<2s load time)

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review error logs in Vercel/Supabase
3. Check browser console for client-side errors
4. Verify all configuration steps completed
5. Test in incognito mode to rule out caching

## 🎉 Post-Deployment Tasks

After successful deployment:

1. **Update Documentation**
   - Update user guides
   - Create video tutorials
   - Update API documentation

2. **Train Users**
   - Notify admins of new features
   - Provide training materials
   - Create example courses

3. **Monitor Usage**
   - Track upload success rates
   - Monitor storage usage
   - Collect user feedback

4. **Plan Next Phase**
   - Demo lesson selector
   - Gallery manager
   - Image cropper
   - Advanced features

---

**Deployment Checklist**: Use this guide step-by-step
**Estimated Time**: 30-60 minutes
**Risk Level**: Low (backward compatible)
**Last Updated**: January 5, 2025

