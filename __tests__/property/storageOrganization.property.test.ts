/**
 * Property-Based Test: Storage Organization
 * Feature: remaining-high-priority-work-jan-2025, Property 24: Storage Organization
 * 
 * Property: For any file being stored, it should be uploaded to the correct Supabase Storage bucket
 * Validates: Requirements 3.4
 */

import fc from 'fast-check'
import { uploadFile } from '@/lib/uploads/file-handler'

// Create mock functions that we can track
let mockFrom: jest.Mock
let mockUpload: jest.Mock
let mockGetPublicUrl: jest.Mock

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => {
    mockUpload = jest.fn().mockResolvedValue({ error: null })
    mockGetPublicUrl = jest.fn((path: string) => ({
      data: { publicUrl: `https://storage.example.com/bucket/${path}` }
    }))
    mockFrom = jest.fn((bucket: string) => ({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    }))
    
    return {
      storage: {
        from: mockFrom
      }
    }
  })
}))

describe('Property 24: Storage Organization', () => {
  beforeEach(() => {
    // Initialize mocks before each test
    jest.clearAllMocks()
    
    // Trigger the mock creation by requiring the module
    const { createClient } = require('@/lib/supabase/client')
    createClient()
  })
  
  // Arbitraries for generating test data
  const fileTypeArb = fc.constantFrom('image', 'video', 'document') as fc.Arbitrary<'image' | 'video' | 'document'>
  
  const userIdArb = fc.uuid()
  
  const imageFileArb = fc.record({
    name: fc.constantFrom('test.jpg', 'photo.png', 'image.gif', 'pic.webp'),
    type: fc.constantFrom('image/jpeg', 'image/png', 'image/gif', 'image/webp'),
    size: fc.integer({ min: 1000, max: 5 * 1024 * 1024 }) // 1KB to 5MB
  }).map(props => {
    const blob = new Blob(['fake image data'], { type: props.type })
    return new File([blob], props.name, { type: props.type })
  })
  
  const videoFileArb = fc.record({
    name: fc.constantFrom('video.mp4', 'clip.mov', 'movie.avi', 'recording.webm'),
    type: fc.constantFrom('video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'),
    size: fc.integer({ min: 1000, max: 100 * 1024 * 1024 }) // 1KB to 100MB
  }).map(props => {
    const blob = new Blob(['fake video data'], { type: props.type })
    return new File([blob], props.name, { type: props.type })
  })
  
  const documentFileArb = fc.record({
    name: fc.constantFrom('doc.pdf', 'file.docx', 'presentation.pptx', 'sheet.xlsx'),
    type: fc.constantFrom(
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ),
    size: fc.integer({ min: 1000, max: 20 * 1024 * 1024 }) // 1KB to 20MB
  }).map(props => {
    const blob = new Blob(['fake document data'], { type: props.type })
    return new File([blob], props.name, { type: props.type })
  })

  /**
   * Property: Files should be uploaded to the correct bucket based on type
   */
  it('should upload images to course-images bucket', async () => {
    await fc.assert(
      fc.asyncProperty(
        imageFileArb,
        userIdArb,
        async (file, userId) => {
          // Reset mock calls
          mockFrom.mockClear()
          mockUpload.mockClear()
          
          // Upload the file
          const result = await uploadFile(file, 'image', userId)
          
          // Verify success
          expect(result.success).toBe(true)
          
          // Verify the correct bucket was used
          expect(mockFrom).toHaveBeenCalledWith('course-images')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should upload videos to course-videos bucket', async () => {
    await fc.assert(
      fc.asyncProperty(
        videoFileArb,
        userIdArb,
        async (file, userId) => {
          mockFrom.mockClear()
          mockUpload.mockClear()
          
          const result = await uploadFile(file, 'video', userId)
          
          expect(result.success).toBe(true)
          expect(mockFrom).toHaveBeenCalledWith('course-videos')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should upload documents to course-documents bucket', async () => {
    await fc.assert(
      fc.asyncProperty(
        documentFileArb,
        userIdArb,
        async (file, userId) => {
          mockFrom.mockClear()
          mockUpload.mockClear()
          
          const result = await uploadFile(file, 'document', userId)
          
          expect(result.success).toBe(true)
          expect(mockFrom).toHaveBeenCalledWith('course-documents')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Custom bucket option should override default bucket
   */
  it('should use custom bucket when provided in options', async () => {
    await fc.assert(
      fc.asyncProperty(
        imageFileArb,
        userIdArb,
        fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-z0-9-_]+$/.test(s)),
        async (file, userId, customBucket) => {
          mockFrom.mockClear()
          mockUpload.mockClear()
          
          const result = await uploadFile(file, 'image', userId, {
            bucket: customBucket
          })
          
          expect(result.success).toBe(true)
          expect(mockFrom).toHaveBeenCalledWith(customBucket)
          
          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Storage path should include user ID for organization
   */
  it('should organize files by user ID in storage path', async () => {
    await fc.assert(
      fc.asyncProperty(
        imageFileArb,
        userIdArb,
        async (file, userId) => {
          mockFrom.mockClear()
          mockUpload.mockClear()
          
          const result = await uploadFile(file, 'image', userId)
          
          // Only check if upload succeeded
          if (!result.success) {
            return true // Skip validation failures
          }
          
          // Verify upload was called
          expect(mockUpload).toHaveBeenCalled()
          
          // Get the storage path from the upload call
          const uploadCall = mockUpload.mock.calls[0]
          const storagePath = uploadCall[0] as string
          
          // Verify path starts with user ID
          expect(storagePath).toMatch(new RegExp(`^${userId}/`))
          
          // Verify path is returned in result
          expect(result.path).toBe(storagePath)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: File type validation should prevent uploads to wrong buckets
   */
  it('should reject files that do not match the specified type', async () => {
    await fc.assert(
      fc.asyncProperty(
        imageFileArb,
        userIdArb,
        async (file, userId) => {
          // Try to upload an image as a video
          const result = await uploadFile(file, 'video', userId)
          
          // Should fail validation
          expect(result.success).toBe(false)
          expect(result.error).toBeDefined()
          
          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Bucket selection should be deterministic based on file type
   */
  it('should always use the same bucket for the same file type', async () => {
    await fc.assert(
      fc.asyncProperty(
        imageFileArb,
        userIdArb,
        fc.integer({ min: 2, max: 5 }),
        async (file, userId, uploadCount) => {
          const buckets: string[] = []
          
          // Upload the same file type multiple times
          for (let i = 0; i < uploadCount; i++) {
            mockFrom.mockClear()
            mockUpload.mockClear()
            
            await uploadFile(file, 'image', userId)
            
            // Get the bucket from the mock call
            if (mockFrom.mock.calls.length > 0) {
              const bucket = mockFrom.mock.calls[0][0]
              buckets.push(bucket)
            }
          }
          
          // All buckets should be the same
          const uniqueBuckets = new Set(buckets)
          expect(uniqueBuckets.size).toBe(1)
          expect(buckets[0]).toBe('course-images')
          
          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})
