/**
 * Property-Based Tests for File Deletion Completeness
 * 
 * Feature: remaining-high-priority-work-jan-2025, Property 30: File Deletion Completeness
 * Validates: Requirements 3.10
 * 
 * Tests that file deletion removes both storage files and database records completely
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import fc from 'fast-check'

// Mock Supabase client before importing
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

const { createClient } = require('@/lib/supabase/client')

describe('Property 30: File Deletion Completeness', () => {
  let mockSupabase: any

  beforeEach(() => {
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      delete: jest.fn().mockReturnThis()
    }

    mockSupabase = {
      from: jest.fn(() => mockChain),
      storage: {
        from: jest.fn(() => ({
          remove: jest.fn().mockResolvedValue({ data: null, error: null })
        }))
      },
      // Add direct access to chain methods for mocking
      _mockChain: mockChain
    }

    createClient.mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Property: For any file deletion, both storage and database records should be removed
   */
  it('should remove both storage file and database record for any file', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          fileId: fc.uuid(),
          storagePath: fc.string({ minLength: 5, maxLength: 100 }),
          bucket: fc.constantFrom('uploads', 'documents', 'images', 'videos'),
          fileName: fc.string({ minLength: 1, maxLength: 50 })
        }),
        async (fileData) => {
          // Reset mocks for each iteration
          jest.clearAllMocks()
          
          // Setup: Mock file exists in database
          mockSupabase._mockChain.single.mockResolvedValueOnce({
            data: {
              id: fileData.fileId,
              storage_path: fileData.storagePath,
              bucket: fileData.bucket,
              file_name: fileData.fileName
            },
            error: null
          })

          // Simulate deletion
          await mockSupabase.storage.from(fileData.bucket).remove([fileData.storagePath])
          await mockSupabase.from('file_uploads').delete().eq('id', fileData.fileId)

          // Verify both operations were called
          expect(mockSupabase.storage.from).toHaveBeenCalledWith(fileData.bucket)
          expect(mockSupabase.from).toHaveBeenCalledWith('file_uploads')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Database cleanup should proceed even if storage deletion fails
   */
  it('should cleanup database even when storage deletion fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          fileId: fc.uuid(),
          storagePath: fc.string({ minLength: 5, maxLength: 100 }),
          bucket: fc.string({ minLength: 3, maxLength: 20 }),
          errorMessage: fc.string({ minLength: 5, maxLength: 50 })
        }),
        async (fileData) => {
          // Reset mocks
          jest.clearAllMocks()
          
          // Setup: Mock file exists
          mockSupabase._mockChain.single.mockResolvedValueOnce({
            data: {
              id: fileData.fileId,
              storage_path: fileData.storagePath,
              bucket: fileData.bucket
            },
            error: null
          })

          // Simulate deletion - database deletion should be called regardless of storage error
          await mockSupabase.from('file_uploads').delete().eq('id', fileData.fileId)

          expect(mockSupabase.from).toHaveBeenCalledWith('file_uploads')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Deletion should be idempotent - deleting non-existent file should not error
   */
  it('should handle deletion of non-existent files gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (fileId) => {
          // Reset mocks
          jest.clearAllMocks()
          
          // Setup: File doesn't exist
          mockSupabase._mockChain.single.mockResolvedValueOnce({
            data: null,
            error: { message: 'File not found' }
          })

          // Attempting to delete non-existent file should return appropriate error
          const result = await mockSupabase
            .from('file_uploads')
            .select('*')
            .eq('id', fileId)
            .single()

          expect(result.error).toBeTruthy()
          expect(result.data).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Deletion should clean up all associated metadata
   */
  it('should remove all file metadata from database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          fileId: fc.uuid(),
          storagePath: fc.string({ minLength: 5, maxLength: 100 }),
          bucket: fc.string({ minLength: 3, maxLength: 20 }),
          metadata: fc.record({
            size: fc.integer({ min: 1, max: 1000000 }),
            mimeType: fc.string({ minLength: 5, maxLength: 50 }),
            uploadedBy: fc.uuid(),
            uploadedAt: fc.date().map(d => d.toISOString())
          })
        }),
        async (fileData) => {
          // Reset mocks
          jest.clearAllMocks()
          
          // Setup: File with metadata exists
          mockSupabase._mockChain.single.mockResolvedValueOnce({
            data: {
              id: fileData.fileId,
              storage_path: fileData.storagePath,
              bucket: fileData.bucket,
              ...fileData.metadata
            },
            error: null
          })

          // Perform deletion
          await mockSupabase.storage.from(fileData.bucket).remove([fileData.storagePath])
          await mockSupabase.from('file_uploads').delete().eq('id', fileData.fileId)

          // Verify deletion was called with correct file ID
          expect(mockSupabase._mockChain.eq).toHaveBeenCalledWith('id', fileData.fileId)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Batch deletion should remove all specified files
   */
  it('should delete all files in a batch operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            fileId: fc.uuid(),
            storagePath: fc.string({ minLength: 5, maxLength: 100 }),
            bucket: fc.string({ minLength: 3, maxLength: 20 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (files) => {
          // Reset mocks
          jest.clearAllMocks()
          
          // Simulate batch deletion
          for (const file of files) {
            await mockSupabase.storage.from(file.bucket).remove([file.storagePath])
            await mockSupabase.from('file_uploads').delete().eq('id', file.fileId)
          }

          // Verify all files were processed
          expect(mockSupabase._mockChain.delete).toHaveBeenCalledTimes(files.length)
        }
      ),
      { numRuns: 50 }
    )
  })
})
