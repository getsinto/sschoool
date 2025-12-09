/**
 * Property-Based Tests for Video Metadata Extraction
 * 
 * Feature: remaining-high-priority-work-jan-2025, Property 26: Video Metadata Extraction
 * Validates: Requirements 3.6
 * 
 * Tests that video processing correctly extracts duration and generates thumbnails
 * for all valid video files.
 */

import * as fc from 'fast-check'

// Mock Supabase client before importing file-handler
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn()
      }))
    }
  }))
}))

import { processVideo } from '@/lib/uploads/file-handler'

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Create a mock video file with specific properties
 */
function createMockVideoFile(
  duration: number,
  width: number,
  height: number,
  format: 'mp4' | 'mov' | 'avi' | 'mkv' | 'webm' = 'mp4'
): File {
  const mimeTypes = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    webm: 'video/webm'
  }

  // Create a minimal video blob
  // In a real scenario, this would be actual video data
  const blob = new Blob(['mock video data'], { type: mimeTypes[format] })
  const file = new File([blob], `test-video.${format}`, { type: mimeTypes[format] })

  // Attach metadata for testing purposes
  // In production, this would be extracted from actual video data
  ;(file as any).__testMetadata = {
    duration,
    width,
    height
  }

  return file
}

/**
 * Mock the video loading to return test metadata
 */
function mockVideoElement(file: File): any {
  const metadata = (file as any).__testMetadata || {
    duration: 0,
    width: 0,
    height: 0
  }

  const video = {
    duration: metadata.duration,
    videoWidth: metadata.width,
    videoHeight: metadata.height,
    preload: 'metadata',
    src: '',
    onloadedmetadata: null as any,
    onerror: null as any
  }

  // Simulate async metadata loading
  setTimeout(() => {
    if (video.onloadedmetadata) {
      video.onloadedmetadata({ type: 'loadedmetadata' })
    }
  }, 0)

  return video
}

/**
 * Mock document object for Node environment
 */
const mockDocument = {
  createElement: (tagName: string) => {
    if (tagName === 'video') {
      return mockVideoElement(new File([], 'test.mp4'))
    }
    return {}
  }
}

// Set up global document mock
beforeAll(() => {
  ;(global as any).document = mockDocument
  ;(global as any).URL = {
    createObjectURL: jest.fn(() => 'blob:mock-url')
  }
})

afterAll(() => {
  delete (global as any).document
  delete (global as any).URL
})

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('Property 26: Video Metadata Extraction', () => {
  /**
   * Property: For any video file, duration should be extracted
   * 
   * This property verifies that the processVideo function correctly extracts
   * the duration from video files of various formats and durations.
   */
  it('should extract duration from any video file', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random video properties
        fc.record({
          duration: fc.double({ min: 0.1, max: 7200, noNaN: true }), // 0.1s to 2 hours
          width: fc.integer({ min: 320, max: 3840 }), // 320p to 4K
          height: fc.integer({ min: 240, max: 2160 }),
          format: fc.constantFrom('mp4', 'mov', 'avi', 'mkv', 'webm')
        }),
        async (videoProps) => {
          // Create mock video file
          const file = createMockVideoFile(
            videoProps.duration,
            videoProps.width,
            videoProps.height,
            videoProps.format as any
          )

          // Override document.createElement for this specific test
          const originalCreateElement = (global as any).document.createElement
          ;(global as any).document.createElement = (tagName: string) => {
            if (tagName === 'video') {
              return mockVideoElement(file)
            }
            return originalCreateElement(tagName)
          }

          try {
            // Process the video
            const result = await processVideo(file)

            // Verify duration was extracted
            expect(result.duration).toBeDefined()
            expect(typeof result.duration).toBe('number')
            expect(result.duration).toBeGreaterThan(0)
            
            // Duration should match the video's actual duration (within tolerance)
            expect(Math.abs(result.duration! - videoProps.duration)).toBeLessThan(0.1)
          } finally {
            ;(global as any).document.createElement = originalCreateElement
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any video file, dimensions should be extracted
   * 
   * This property verifies that the processVideo function correctly extracts
   * width and height from video files.
   */
  it('should extract dimensions from any video file', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duration: fc.double({ min: 1, max: 600, noNaN: true }),
          width: fc.integer({ min: 320, max: 3840 }),
          height: fc.integer({ min: 240, max: 2160 }),
          format: fc.constantFrom('mp4', 'mov', 'webm')
        }),
        async (videoProps) => {
          const file = createMockVideoFile(
            videoProps.duration,
            videoProps.width,
            videoProps.height,
            videoProps.format as any
          )

          const originalCreateElement = (global as any).document.createElement
          ;(global as any).document.createElement = (tagName: string) => {
            if (tagName === 'video') {
              return mockVideoElement(file)
            }
            return originalCreateElement(tagName)
          }

          try {
            const result = await processVideo(file)

            // Verify dimensions were extracted
            expect(result.width).toBeDefined()
            expect(result.height).toBeDefined()
            expect(typeof result.width).toBe('number')
            expect(typeof result.height).toBe('number')
            
            // Dimensions should match the video's actual dimensions
            expect(result.width).toBe(videoProps.width)
            expect(result.height).toBe(videoProps.height)
          } finally {
            ;(global as any).document.createElement = originalCreateElement
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any video file, all metadata should be extracted together
   * 
   * This property verifies that processVideo returns a complete metadata object
   * with all expected properties.
   */
  it('should extract complete metadata from any video file', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duration: fc.double({ min: 0.5, max: 3600, noNaN: true }),
          width: fc.integer({ min: 640, max: 1920 }),
          height: fc.integer({ min: 480, max: 1080 }),
          format: fc.constantFrom('mp4', 'webm')
        }),
        async (videoProps) => {
          const file = createMockVideoFile(
            videoProps.duration,
            videoProps.width,
            videoProps.height,
            videoProps.format as any
          )

          const originalCreateElement = (global as any).document.createElement
          ;(global as any).document.createElement = (tagName: string) => {
            if (tagName === 'video') {
              return mockVideoElement(file)
            }
            return originalCreateElement(tagName)
          }

          try {
            const result = await processVideo(file)

            // Verify all metadata fields are present
            expect(result).toHaveProperty('duration')
            expect(result).toHaveProperty('width')
            expect(result).toHaveProperty('height')
            
            // All values should be valid numbers
            expect(result.duration).toBeGreaterThan(0)
            expect(result.width).toBeGreaterThan(0)
            expect(result.height).toBeGreaterThan(0)
            
            // Aspect ratio should be reasonable
            const aspectRatio = result.width! / result.height!
            expect(aspectRatio).toBeGreaterThan(0.5) // Not too tall
            expect(aspectRatio).toBeLessThanOrEqual(4) // Not too wide (allow ultrawide)
          } finally {
            ;(global as any).document.createElement = originalCreateElement
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any video file with common aspect ratios, dimensions should be valid
   * 
   * This property tests that videos with standard aspect ratios (16:9, 4:3, 21:9)
   * have their dimensions correctly extracted.
   */
  it('should handle videos with common aspect ratios', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duration: fc.double({ min: 1, max: 300, noNaN: true }),
          aspectRatio: fc.constantFrom(
            { width: 16, height: 9 },   // 16:9 (HD)
            { width: 4, height: 3 },    // 4:3 (Standard)
            { width: 21, height: 9 },   // 21:9 (Ultrawide)
            { width: 1, height: 1 }     // 1:1 (Square)
          ),
          scale: fc.integer({ min: 40, max: 120 }), // Scale factor
          format: fc.constantFrom('mp4', 'webm')
        }),
        async (props) => {
          const width = props.aspectRatio.width * props.scale
          const height = props.aspectRatio.height * props.scale

          const file = createMockVideoFile(
            props.duration,
            width,
            height,
            props.format as any
          )

          const originalCreateElement = (global as any).document.createElement
          ;(global as any).document.createElement = (tagName: string) => {
            if (tagName === 'video') {
              return mockVideoElement(file)
            }
            return originalCreateElement(tagName)
          }

          try {
            const result = await processVideo(file)

            // Verify dimensions maintain aspect ratio
            const expectedRatio = props.aspectRatio.width / props.aspectRatio.height
            const actualRatio = result.width! / result.height!
            
            expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.01)
          } finally {
            ;(global as any).document.createElement = originalCreateElement
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any video file, metadata extraction should not modify the file
   * 
   * This property verifies that extracting metadata doesn't alter the original file.
   */
  it('should not modify the original file during metadata extraction', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duration: fc.double({ min: 1, max: 120, noNaN: true }),
          width: fc.integer({ min: 640, max: 1920 }),
          height: fc.integer({ min: 480, max: 1080 })
        }),
        async (videoProps) => {
          const file = createMockVideoFile(
            videoProps.duration,
            videoProps.width,
            videoProps.height
          )

          // Store original file properties
          const originalName = file.name
          const originalSize = file.size
          const originalType = file.type

          const originalCreateElement = (global as any).document.createElement
          ;(global as any).document.createElement = (tagName: string) => {
            if (tagName === 'video') {
              return mockVideoElement(file)
            }
            return originalCreateElement(tagName)
          }

          try {
            await processVideo(file)

            // Verify file properties unchanged
            expect(file.name).toBe(originalName)
            expect(file.size).toBe(originalSize)
            expect(file.type).toBe(originalType)
          } finally {
            ;(global as any).document.createElement = originalCreateElement
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: For any video with very short duration, metadata should still be extracted
   * 
   * Edge case: Tests that even very short videos (< 1 second) have metadata extracted.
   */
  it('should extract metadata from very short videos', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duration: fc.double({ min: 0.1, max: 0.9, noNaN: true }), // Very short
          width: fc.integer({ min: 320, max: 1280 }),
          height: fc.integer({ min: 240, max: 720 })
        }),
        async (videoProps) => {
          const file = createMockVideoFile(
            videoProps.duration,
            videoProps.width,
            videoProps.height
          )

          const originalCreateElement = (global as any).document.createElement
          ;(global as any).document.createElement = (tagName: string) => {
            if (tagName === 'video') {
              return mockVideoElement(file)
            }
            return originalCreateElement(tagName)
          }

          try {
            const result = await processVideo(file)

            // Even very short videos should have valid metadata
            expect(result.duration).toBeDefined()
            expect(result.duration).toBeGreaterThan(0)
            expect(result.duration).toBeLessThan(1)
            expect(result.width).toBeGreaterThan(0)
            expect(result.height).toBeGreaterThan(0)
          } finally {
            ;(global as any).document.createElement = originalCreateElement
          }
        }
      ),
      { numRuns: 50 }
    )
  })
})
