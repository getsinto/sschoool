/**
 * Property-Based Tests for Communication Permission Enforcement
 * Feature: course-assignment-permissions, Property 11: Communication permission enforcement
 * Validates: Requirements 6.1, 6.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { canCommunicateWithStudents } from '../coursePermissions';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  })),
  auth: {
    getUser: vi.fn()
  }
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('Communication Permission Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Property 11: Communication permission enforcement', () => {
    it('should always return false for non-existent course assignments', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // userId
          fc.string({ minLength: 1 }), // courseId
          async (userId, courseId) => {
            // Mock no assignment found
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' }
            });

            const result = await canCommunicateWithStudents(userId, courseId);
            
            expect(result.hasPermission).toBe(false);
            expect(result.reason).toContain('not assigned');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return true only when can_communicate is explicitly true', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // userId
          fc.string({ minLength: 1 }), // courseId
          fc.boolean(), // can_communicate value
          async (userId, courseId, canCommunicate) => {
            // Mock assignment with specific can_communicate value
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: {
                id: 'assignment_1',
                teacher_id: userId,
                course_id: courseId,
                can_manage_content: false,
                can_grade: false,
                can_communicate: canCommunicate,
                is_primary_teacher: false
              },
              error: null
            });

            const result = await canCommunicateWithStudents(userId, courseId);
            
            expect(result.hasPermission).toBe(canCommunicate);
            if (canCommunicate) {
              expect(result.reason).toBe('Has communication permission');
            } else {
              expect(result.reason).toContain('does not have communication permission');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be consistent for the same inputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // userId
          fc.string({ minLength: 1 }), // courseId
          fc.boolean(), // can_communicate value
          async (userId, courseId, canCommunicate) => {
            // Mock consistent response
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: {
                id: 'assignment_1',
                teacher_id: userId,
                course_id: courseId,
                can_manage_content: false,
                can_grade: false,
                can_communicate: canCommunicate,
                is_primary_teacher: false
              },
              error: null
            });

            const result1 = await canCommunicateWithStudents(userId, courseId);
            const result2 = await canCommunicateWithStudents(userId, courseId);
            
            expect(result1.hasPermission).toBe(result2.hasPermission);
            expect(result1.reason).toBe(result2.reason);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle database errors gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // userId
          fc.string({ minLength: 1 }), // courseId
          async (userId, courseId) => {
            // Mock database error
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: null,
              error: { code: 'CONNECTION_ERROR', message: 'Database connection failed' }
            });

            const result = await canCommunicateWithStudents(userId, courseId);
            
            expect(result.hasPermission).toBe(false);
            expect(result.reason).toContain('Error checking');
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should validate input parameters', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(fc.constant(''), fc.constant(null), fc.constant(undefined)), // invalid userId
          fc.string({ minLength: 1 }), // valid courseId
          async (invalidUserId, courseId) => {
            const result = await canCommunicateWithStudents(invalidUserId as any, courseId);
            
            expect(result.hasPermission).toBe(false);
            expect(result.reason).toContain('Invalid');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should respect permission hierarchy - primary teachers should have communication permission', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // userId
          fc.string({ minLength: 1 }), // courseId
          fc.boolean(), // is_primary_teacher
          fc.boolean(), // explicit can_communicate
          async (userId, courseId, isPrimary, explicitCommunicate) => {
            // Mock assignment
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: {
                id: 'assignment_1',
                teacher_id: userId,
                course_id: courseId,
                can_manage_content: isPrimary,
                can_grade: isPrimary,
                can_communicate: isPrimary || explicitCommunicate, // Primary teachers should have communication
                is_primary_teacher: isPrimary
              },
              error: null
            });

            const result = await canCommunicateWithStudents(userId, courseId);
            
            if (isPrimary) {
              // Primary teachers should always have communication permission
              expect(result.hasPermission).toBe(true);
            } else {
              // Non-primary teachers depend on explicit permission
              expect(result.hasPermission).toBe(explicitCommunicate);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle all possible permission combinations correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // userId
          fc.string({ minLength: 1 }), // courseId
          fc.boolean(), // can_manage_content
          fc.boolean(), // can_grade
          fc.boolean(), // can_communicate
          fc.boolean(), // is_primary_teacher
          async (userId, courseId, canManage, canGrade, canCommunicate, isPrimary) => {
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: {
                id: 'assignment_1',
                teacher_id: userId,
                course_id: courseId,
                can_manage_content: canManage,
                can_grade: canGrade,
                can_communicate: canCommunicate,
                is_primary_teacher: isPrimary
              },
              error: null
            });

            const result = await canCommunicateWithStudents(userId, courseId);
            
            // Communication permission should only depend on can_communicate flag
            expect(result.hasPermission).toBe(canCommunicate);
            
            // Verify the result is deterministic
            const result2 = await canCommunicateWithStudents(userId, courseId);
            expect(result.hasPermission).toBe(result2.hasPermission);
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should handle special characters in IDs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }).filter(s => s.includes('-') || s.includes('_')), // userId with special chars
          fc.string({ minLength: 1 }).filter(s => s.includes('-') || s.includes('_')), // courseId with special chars
          async (userId, courseId) => {
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: {
                id: 'assignment_1',
                teacher_id: userId,
                course_id: courseId,
                can_manage_content: false,
                can_grade: false,
                can_communicate: true,
                is_primary_teacher: false
              },
              error: null
            });

            const result = await canCommunicateWithStudents(userId, courseId);
            
            expect(result.hasPermission).toBe(true);
            expect(typeof result.reason).toBe('string');
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should handle very long ID strings', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 100, maxLength: 1000 }), // very long userId
          fc.string({ minLength: 100, maxLength: 1000 }), // very long courseId
          async (userId, courseId) => {
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: {
                id: 'assignment_1',
                teacher_id: userId,
                course_id: courseId,
                can_manage_content: false,
                can_grade: false,
                can_communicate: true,
                is_primary_teacher: false
              },
              error: null
            });

            const result = await canCommunicateWithStudents(userId, courseId);
            
            expect(result.hasPermission).toBe(true);
            expect(result.reason).toBe('Has communication permission');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should enforce permission independence - communication permission is independent of other permissions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // userId
          fc.string({ minLength: 1 }), // courseId
          fc.boolean(), // can_manage_content
          fc.boolean(), // can_grade
          async (userId, courseId, canManage, canGrade) => {
            // Test with communication permission false
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: {
                id: 'assignment_1',
                teacher_id: userId,
                course_id: courseId,
                can_manage_content: canManage,
                can_grade: canGrade,
                can_communicate: false,
                is_primary_teacher: false
              },
              error: null
            });

            const result = await canCommunicateWithStudents(userId, courseId);
            
            // Should be false regardless of other permissions
            expect(result.hasPermission).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle concurrent permission checks correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // userId
          fc.string({ minLength: 1 }), // courseId
          fc.boolean(), // can_communicate
          async (userId, courseId, canCommunicate) => {
            mockSupabase.from().select().eq().single.mockResolvedValue({
              data: {
                id: 'assignment_1',
                teacher_id: userId,
                course_id: courseId,
                can_manage_content: false,
                can_grade: false,
                can_communicate: canCommunicate,
                is_primary_teacher: false
              },
              error: null
            });

            // Make multiple concurrent calls
            const results = await Promise.all([
              canCommunicateWithStudents(userId, courseId),
              canCommunicateWithStudents(userId, courseId),
              canCommunicateWithStudents(userId, courseId)
            ]);

            // All results should be identical
            results.forEach(result => {
              expect(result.hasPermission).toBe(canCommunicate);
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
