/**
 * Property-Based Tests for Upload Failure Cleanup
 * 
 * Feature: remaining-high-priority-work-jan-2025, Property 29: Upload Failure Cleanup
 * Validates: Requirements 3.9
 * 
 * Tests that failed uploads are properly cleaned up from storage
 */

import * as fc from 'fast-check'
import { cleanupFailedUpload } from '@/lib/uploads/file-handler'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

describe('Property 29: Upload Failure Cleanup', () => {
  let mockSupabase: any
  let mockStorage: any
  let removedPaths: string[]
  const { createClient } = require('@/lib/supabase/client')

  beforeEach(() => {
    removedPaths = []
    
    mockStorage = {
      from: jest.fn((bucket: string) => ({
        upload: jest.fn(),
        remove: jest.fn((paths: string[]) => {
          removedPaths.push(...paths)
          return Promise.resolve({ data: null, error: null })
        }),
        getPublicUrl: jest.fn()
      }))
    }

    mockSupabase = {
      storage: mockStorage,
      auth: {
        getUser: jest.fn(() => Promise.resolve({
          data: { user: { id: 'test-user-id' } },
          error: null
        }))
      }
    }

    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
    removedPaths = []
  })

  /**
   * Property: For any failed upload, cleanup should remove the partial file from storage
   */
  it('should cleanup partial files when upload fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          bucket: fc.constantFrom('course-images', 'course-videos', 'course-documents'),
          path: fc.string({ minLength: 10, maxLength: 100 }).map(s => `uploads/${s}`),
          userId: fc.uuid()
        }),
        async ({ bucket, path, userId }) => {
          // Reset for each iteration
          removedPaths = []

          // Call cleanup
          await cleanupFailedUpload(bucket, path)

          // Verify the path was removed
          expect(removedPaths).toContain(path)
          expect(mockStorage.from).toHaveBeenCalledWith(bucket)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Cleanup should be idempotent - calling it multiple times should not cause errors
   */
  it('should be idempotent - multiple cleanup calls should not fail', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          bucket: fc.constantFrom('course-images', 'course-videos', 'course-documents'),
          path: fc.string({ minLength: 10, maxLength: 100 }).map(s => `uploads/${s}`),
          callCount: fc.integer({ min: 1, max: 5 })
        }),
        async ({ bucket, path, callCount }) => {
          // Reset for each iteration
          removedPaths = []

          // Call cleanup multiple times
          for (let i = 0; i < callCount; i++) {
            await cleanupFailedUpload(bucket, path)
          }

          // Should have been called callCount times
          expect(removedPaths.length).toBe(callCount)
          // All calls should be for the same path
          expect(removedPaths.every(p => p === path)).toBe(true)
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Cleanup should handle errors gracefully without throwing
   */
  it('should handle storage errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          bucket: fc.constantFrom('course-images', 'course-videos', 'course-documents'),
          path: fc.string({ minLength: 10, maxLength: 100 }).map(s => `uploads/${s}`),
          errorMessage: fc.string({ minLength: 5, maxLength: 50 })
        }),
        async ({ bucket, path, errorMessage }) => {
          // Mock storage to return error
          mockStorage.from = jest.fn(() => ({
            remove: jest.fn(() => Promise.reject(new Error(errorMessage)))
          }))

          // Cleanup should not throw even when storage fails
          await expect(cleanupFailedUpload(bucket, path)).resolves.not.toThrow()
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property: Cleanup should work for any valid bucket and path combination
   */
  it('should cleanup files from any valid bucket', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          bucket: fc.constantFrom('course-images', 'course-videos', 'course-documents'),
          userId: fc.uuid(),
          filename: fc.string({ minLength: 5, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9.-]/g, '_')),
          timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 })
        }),
        async ({ bucket, userId, filename, timestamp }) => {
          const path = `${userId}/${timestamp}-${filename}`
          removedPaths = []

          await cleanupFailedUpload(bucket, path)

          expect(removedPaths).toContain(path)
          expect(mockStorage.from).toHaveBeenCalledWith(bucket)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Cleanup should remove files regardless of their size or type
   */
  it('should cleanup files of any type from storage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          bucket: fc.constantFrom('course-images', 'course-videos', 'course-documents'),
          extension: fc.constantFrom('jpg', 'png', 'mp4', 'pdf', 'docx'),
          userId: fc.uuid(),
          timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 })
        }),
        async ({ bucket, extension, userId, timestamp }) => {
          const path = `${userId}/${timestamp}-file.${extension}`
          removedPaths = []

          await cleanupFailedUpload(bucket, path)

          expect(removedPaths).toContain(path)
        }
      ),
      { numRuns: 100 }
    )
  })
})
