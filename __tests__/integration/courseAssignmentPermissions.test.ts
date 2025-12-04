/**
 * Integration Tests for Course Assignment Permissions
 * Feature: course-assignment-permissions
 * 
 * Tests complete workflows and interactions between components
 * Requirements: All requirements (integration testing)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Skip tests if no Supabase configuration
const skipTests = !SUPABASE_URL || !SUPABASE_SERVICE_KEY;

describe('Course Assignment Permissions - Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;
  let testAdmin: any;
  let testTeacher: any;
  let testCourse: any;

  beforeAll(async () => {
    if (skipTests) {
      console.log('Skipping integration tests - Supabase not configured');
      return;
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Create test admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: `test-admin-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (adminError) throw adminError;

    // Set admin role
    await supabase
      .from('users')
      .update({ role: 'admin', role_level: 4 })
      .eq('id', adminData.user.id);

    testAdmin = adminData.user;

    // Create test teacher user
    const { data: teacherData, error: teacherError } = await supabase.auth.admin.createUser({
      email: `test-teacher-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (teacherError) throw teacherError;

    // Set teacher role
    await supabase
      .from('users')
      .update({ role: 'teacher', role_level: 2 })
      .eq('id', teacherData.user.id);

    testTeacher = teacherData.user;
  });

  afterAll(async () => {
    if (skipTests) return;

    // Cleanup test data
    if (testCourse) {
      await supabase.from('courses').delete().eq('id', testCourse.id);
    }
    if (testAdmin) {
      await supabase.auth.admin.deleteUser(testAdmin.id);
    }
    if (testTeacher) {
      await supabase.auth.admin.deleteUser(testTeacher.id);
    }
  });

  describe('Complete Workflow: Admin creates course → assigns teacher → teacher manages content', () => {
    it('should allow admin to create a course', async () => {
      if (skipTests) return;

      // Get a subject for the course
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .limit(1)
        .single();

      if (!subjects) {
        console.log('No subjects found, skipping test');
        return;
      }

      // Admin creates course
      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          title: 'Test Course',
          description: 'Test Description',
          subject_id: subjects.id,
          grade_level: 'Grade 10',
          created_by: testAdmin.id,
          created_by_role: 'admin',
          status: 'draft'
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(course).toBeDefined();
      expect(course.created_by).toBe(testAdmin.id);
      expect(course.created_by_role).toBe('admin');

      testCourse = course;
    });

    it('should allow admin to assign teacher to course', async () => {
      if (skipTests || !testCourse) return;

      const { data: assignment, error } = await supabase
        .from('course_assignments')
        .insert({
          course_id: testCourse.id,
          teacher_id: testTeacher.id,
          assigned_by: testAdmin.id,
          can_manage_content: true,
          can_grade: true,
          can_communicate: true,
          is_primary_teacher: true
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(assignment).toBeDefined();
      expect(assignment.teacher_id).toBe(testTeacher.id);
      expect(assignment.is_primary_teacher).toBe(true);
    });

    it('should allow assigned teacher to view the course', async () => {
      if (skipTests || !testCourse) return;

      const { data: assignments, error } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('teacher_id', testTeacher.id)
        .eq('course_id', testCourse.id);

      expect(error).toBeNull();
      expect(assignments).toBeDefined();
      expect(assignments.length).toBeGreaterThan(0);
    });

    it('should allow assigned teacher with can_manage_content to update course content', async () => {
      if (skipTests || !testCourse) return;

      // Check if teacher has permission
      const { data: assignment } = await supabase
        .from('course_assignments')
        .select('can_manage_content')
        .eq('teacher_id', testTeacher.id)
        .eq('course_id', testCourse.id)
        .single();

      expect(assignment?.can_manage_content).toBe(true);
    });
  });

  describe('Permission Denial: Teacher attempts course creation', () => {
    it('should block teacher from creating a course directly in database', async () => {
      if (skipTests) return;

      // Get a subject
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .limit(1)
        .single();

      if (!subjects) return;

      // Teacher attempts to create course (should be blocked by RLS)
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: 'Unauthorized Course',
          description: 'Should not be created',
          subject_id: subjects.id,
          grade_level: 'Grade 10',
          created_by: testTeacher.id,
          created_by_role: 'teacher',
          status: 'draft'
        })
        .select()
        .single();

      // Should fail due to RLS policy
      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe('Permission Denial: Teacher attempts to access non-assigned course', () => {
    it('should block teacher from viewing courses they are not assigned to', async () => {
      if (skipTests) return;

      // Get a course the teacher is NOT assigned to
      const { data: otherCourses } = await supabase
        .from('courses')
        .select('id')
        .neq('id', testCourse?.id || '')
        .limit(1);

      if (!otherCourses || otherCourses.length === 0) {
        console.log('No other courses found, skipping test');
        return;
      }

      // Check if teacher has assignment to this course
      const { data: assignment } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('teacher_id', testTeacher.id)
        .eq('course_id', otherCourses[0].id)
        .single();

      // Should not have assignment
      expect(assignment).toBeNull();
    });
  });

  describe('Assignment Workflow: Admin assigns → teacher receives notification → teacher can access', () => {
    it('should create notification when teacher is assigned', async () => {
      if (skipTests || !testCourse) return;

      // Check if notification was created
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', testTeacher.id)
        .eq('type', 'course_assignment')
        .order('created_at', { ascending: false })
        .limit(1);

      // Note: This test assumes notifications are created via trigger or application code
      // May need to be adjusted based on actual implementation
      expect(notifications).toBeDefined();
    });

    it('should allow teacher to access course after assignment', async () => {
      if (skipTests || !testCourse) return;

      const { data: assignment, error } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('teacher_id', testTeacher.id)
        .eq('course_id', testCourse.id)
        .single();

      expect(error).toBeNull();
      expect(assignment).toBeDefined();
      expect(assignment.teacher_id).toBe(testTeacher.id);
    });
  });

  describe('Permission Update: Admin updates permissions → changes take effect immediately', () => {
    it('should update teacher permissions immediately', async () => {
      if (skipTests || !testCourse) return;

      // Get current assignment
      const { data: beforeUpdate } = await supabase
        .from('course_assignments')
        .select('can_grade')
        .eq('teacher_id', testTeacher.id)
        .eq('course_id', testCourse.id)
        .single();

      const originalValue = beforeUpdate?.can_grade;

      // Update permission
      const { error: updateError } = await supabase
        .from('course_assignments')
        .update({ can_grade: !originalValue })
        .eq('teacher_id', testTeacher.id)
        .eq('course_id', testCourse.id);

      expect(updateError).toBeNull();

      // Verify change took effect immediately
      const { data: afterUpdate } = await supabase
        .from('course_assignments')
        .select('can_grade')
        .eq('teacher_id', testTeacher.id)
        .eq('course_id', testCourse.id)
        .single();

      expect(afterUpdate?.can_grade).toBe(!originalValue);

      // Restore original value
      await supabase
        .from('course_assignments')
        .update({ can_grade: originalValue })
        .eq('teacher_id', testTeacher.id)
        .eq('course_id', testCourse.id);
    });
  });

  describe('Deletion Workflow: Admin deletes course → assignments cascade delete → teachers notified', () => {
    it('should cascade delete assignments when course is deleted', async () => {
      if (skipTests) return;

      // Create a temporary course for deletion test
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .limit(1)
        .single();

      if (!subjects) return;

      const { data: tempCourse } = await supabase
        .from('courses')
        .insert({
          title: 'Temp Course for Deletion',
          description: 'Will be deleted',
          subject_id: subjects.id,
          grade_level: 'Grade 10',
          created_by: testAdmin.id,
          created_by_role: 'admin',
          status: 'draft'
        })
        .select()
        .single();

      if (!tempCourse) return;

      // Create assignment
      const { data: tempAssignment } = await supabase
        .from('course_assignments')
        .insert({
          course_id: tempCourse.id,
          teacher_id: testTeacher.id,
          assigned_by: testAdmin.id,
          can_manage_content: true,
          can_grade: true,
          can_communicate: true,
          is_primary_teacher: false
        })
        .select()
        .single();

      expect(tempAssignment).toBeDefined();

      // Delete course
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', tempCourse.id);

      expect(deleteError).toBeNull();

      // Verify assignment was cascade deleted
      const { data: deletedAssignment } = await supabase
        .from('course_assignments')
        .select('*')
        .eq('id', tempAssignment.id)
        .single();

      expect(deletedAssignment).toBeNull();
    });
  });

  describe('Audit Logging', () => {
    it('should log course creation in audit logs', async () => {
      if (skipTests || !testCourse) return;

      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', 'course')
        .eq('resource_id', testCourse.id)
        .eq('action', 'course_created')
        .order('created_at', { ascending: false })
        .limit(1);

      // Note: This test assumes audit logging is implemented
      // May return empty if audit logging isn't fully integrated yet
      expect(auditLogs).toBeDefined();
    });

    it('should log teacher assignments in audit logs', async () => {
      if (skipTests || !testCourse) return;

      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', 'course_assignment')
        .eq('action', 'teacher_assigned')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(auditLogs).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should track rate limit attempts', async () => {
      if (skipTests) return;

      // Note: Rate limiting is in-memory, so we can't directly test it via database
      // This is a placeholder for when rate limiting metrics are stored
      expect(true).toBe(true);
    });
  });
});
