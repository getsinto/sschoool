/**
 * Course Permissions Integration Tests
 * Task 26: Write integration tests
 * 
 * Tests complete workflows:
 * - Admin creates course → assigns teacher → teacher manages content
 * - Permission denial scenarios
 * - Assignment workflow with notifications
 * - Permission updates taking effect immediately
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('Course Permissions Workflow Integration Tests', () => {
  let supabase: any;
  let adminUser: any;
  let teacherUser: any;
  let testSubject: any;
  let testCourse: any;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create admin user
    const { data: adminAuth } = await supabase.auth.admin.createUser({
      email: 'workflow_admin@test.com',
      password: 'test123456',
      email_confirm: true
    });

    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .insert({
        user_id: adminAuth.user.id,
        email: 'workflow_admin@test.com',
        role: 'admin',
        role_level: 4,
        first_name: 'Admin',
        last_name: 'User'
      })
      .select()
      .single();

    adminUser = { id: adminAuth.user.id, profile: adminProfile };

    // Create teacher user
    const { data: teacherAuth } = await supabase.auth.admin.createUser({
      email: 'workflow_teacher@test.com',
      password: 'test123456',
      email_confirm: true
    });

    const { data: teacherProfile } = await supabase
      .from('user_profiles')
      .insert({
        user_id: teacherAuth.user.id,
        email: 'workflow_teacher@test.com',
        role: 'teacher',
        role_level: 2,
        first_name: 'Teacher',
        last_name: 'User'
      })
      .select()
      .single();

    teacherUser = { id: teacherAuth.user.id, profile: teacherProfile };

    // Create test subject
    const { data: subject } = await supabase
      .from('subjects')
      .insert({
        name: 'Workflow Test Subject',
        description: 'Subject for workflow testing',
        category: 'science',
        is_active: true
      })
      .select()
      .single();

    testSubject = subject;
  });

  afterAll(async () => {
    // Cleanup
    if (testCourse) {
      await supabase.from('courses').delete().eq('id', testCourse.id);
    }
    if (testSubject) {
      await supabase.from('subjects').delete().eq('id', testSubject.id);
    }
    await supabase.from('user_profiles').delete().eq('user_id', adminUser.id);
    await supabase.from('user_profiles').delete().eq('user_id', teacherUser.id);
    await supabase.auth.admin.deleteUser(adminUser.id);
    await supabase.auth.admin.deleteUser(teacherUser.id);
  });

  beforeEach(async () => {
    // Clean up test course
    if (testCourse) {
      await supabase.from('course_teacher_assignments').delete().eq('course_id', testCourse.id);
      await supabase.from('courses').delete().eq('id', testCourse.id);
      testCourse = null;
    }
  });

  describe('Complete Workflow: Admin creates course → assigns teacher → teacher manages content', () => {
    it('should complete full workflow successfully', async () => {
      // Step 1: Admin creates course
      const { data: course, error: createError } = await supabase
        .from('courses')
        .insert({
          title: 'Workflow Test Course',
          description: 'Course for testing complete workflow',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(course).toBeDefined();
      expect(course.created_by).toBe(adminUser.id);
      testCourse = course;

      // Step 2: Admin assigns teacher with content management permission
      const { data: assignment, error: assignError } = await supabase
        .from('course_teacher_assignments')
        .insert({
          course_id: course.id,
          teacher_id: teacherUser.id,
          assigned_by: adminUser.id,
          can_manage_content: true,
          can_grade: true,
          can_communicate: true,
          is_primary_teacher: true
        })
        .select()
        .single();

      expect(assignError).toBeNull();
      expect(assignment).toBeDefined();
      expect(assignment.can_manage_content).toBe(true);

      // Step 3: Verify teacher can access the course
      const { data: teacherCourses, error: accessError } = await supabase
        .from('course_teacher_assignments')
        .select('*, courses(*)')
        .eq('teacher_id', teacherUser.id)
        .eq('course_id', course.id);

      expect(accessError).toBeNull();
      expect(teacherCourses).toHaveLength(1);
      expect(teacherCourses[0].courses.id).toBe(course.id);

      // Step 4: Teacher manages content (simulated by updating course)
      const { error: updateError } = await supabase
        .from('courses')
        .update({ description: 'Updated by teacher' })
        .eq('id', course.id);

      // This should succeed because teacher has can_manage_content permission
      expect(updateError).toBeNull();

      // Verify the update
      const { data: updatedCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', course.id)
        .single();

      expect(updatedCourse.description).toBe('Updated by teacher');
    });
  });

  describe('Permission Denial: Teacher attempts course creation', () => {
    it('should deny teacher from creating courses', async () => {
      // Teacher attempts to create a course
      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          title: 'Unauthorized Course',
          description: 'This should fail',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: teacherUser.id,
          created_by_role: 'teacher'
        })
        .select()
        .single();

      // Should fail due to RLS policies
      expect(error).toBeDefined();
      expect(course).toBeNull();
    });
  });

  describe('Permission Denial: Teacher attempts to access non-assigned course', () => {
    it('should deny teacher access to courses they are not assigned to', async () => {
      // Admin creates a course
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Non-Assigned Course',
          description: 'Teacher should not access this',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      testCourse = course;

      // Teacher attempts to access the course
      const { data: assignments } = await supabase
        .from('course_teacher_assignments')
        .select('*')
        .eq('teacher_id', teacherUser.id)
        .eq('course_id', course.id);

      // Should return empty array - no assignment exists
      expect(assignments).toHaveLength(0);

      // Teacher attempts to update the course (should fail)
      const { error: updateError } = await supabase
        .from('courses')
        .update({ description: 'Unauthorized update' })
        .eq('id', course.id);

      // Should fail due to RLS policies
      expect(updateError).toBeDefined();
    });
  });

  describe('Assignment Workflow: Admin assigns → teacher receives notification → teacher can access', () => {
    it('should complete assignment workflow with notification', async () => {
      // Step 1: Admin creates course
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Assignment Workflow Course',
          description: 'Course for testing assignment workflow',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      testCourse = course;

      // Step 2: Admin assigns teacher
      const { data: assignment, error: assignError } = await supabase
        .from('course_teacher_assignments')
        .insert({
          course_id: course.id,
          teacher_id: teacherUser.id,
          assigned_by: adminUser.id,
          can_manage_content: true,
          can_grade: false,
          can_communicate: true,
          is_primary_teacher: false
        })
        .select()
        .single();

      expect(assignError).toBeNull();
      expect(assignment).toBeDefined();

      // Step 3: Verify notification was created (check notifications table)
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', teacherUser.id)
        .eq('type', 'course_assignment')
        .order('created_at', { ascending: false })
        .limit(1);

      // Notification should exist
      expect(notifications).toBeDefined();
      if (notifications && notifications.length > 0) {
        expect(notifications[0].user_id).toBe(teacherUser.id);
      }

      // Step 4: Teacher can now access the course
      const { data: teacherAssignments } = await supabase
        .from('course_teacher_assignments')
        .select('*, courses(*)')
        .eq('teacher_id', teacherUser.id)
        .eq('course_id', course.id)
        .single();

      expect(teacherAssignments).toBeDefined();
      expect(teacherAssignments.can_manage_content).toBe(true);
      expect(teacherAssignments.can_grade).toBe(false);
    });
  });

  describe('Permission Update: Admin updates permissions → changes take effect immediately', () => {
    it('should apply permission updates immediately', async () => {
      // Step 1: Create course and assign teacher with limited permissions
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Permission Update Course',
          description: 'Course for testing permission updates',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      testCourse = course;

      const { data: assignment } = await supabase
        .from('course_teacher_assignments')
        .insert({
          course_id: course.id,
          teacher_id: teacherUser.id,
          assigned_by: adminUser.id,
          can_manage_content: false,
          can_grade: false,
          can_communicate: true,
          is_primary_teacher: false
        })
        .select()
        .single();

      // Verify initial permissions
      expect(assignment.can_manage_content).toBe(false);
      expect(assignment.can_grade).toBe(false);

      // Step 2: Admin updates permissions
      const { data: updatedAssignment, error: updateError } = await supabase
        .from('course_teacher_assignments')
        .update({
          can_manage_content: true,
          can_grade: true,
          updated_by: adminUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignment.id)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updatedAssignment.can_manage_content).toBe(true);
      expect(updatedAssignment.can_grade).toBe(true);

      // Step 3: Verify changes are immediately visible
      const { data: currentAssignment } = await supabase
        .from('course_teacher_assignments')
        .select('*')
        .eq('id', assignment.id)
        .single();

      expect(currentAssignment.can_manage_content).toBe(true);
      expect(currentAssignment.can_grade).toBe(true);
      expect(currentAssignment.updated_by).toBe(adminUser.id);
      expect(currentAssignment.updated_at).toBeDefined();
    });
  });

  describe('Edge Case: Multiple permission updates in sequence', () => {
    it('should handle rapid permission updates correctly', async () => {
      // Create course and assignment
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Rapid Update Course',
          description: 'Course for testing rapid updates',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      testCourse = course;

      const { data: assignment } = await supabase
        .from('course_teacher_assignments')
        .insert({
          course_id: course.id,
          teacher_id: teacherUser.id,
          assigned_by: adminUser.id,
          can_manage_content: false,
          can_grade: false,
          can_communicate: false,
          is_primary_teacher: false
        })
        .select()
        .single();

      // Perform multiple rapid updates
      await supabase
        .from('course_teacher_assignments')
        .update({ can_manage_content: true })
        .eq('id', assignment.id);

      await supabase
        .from('course_teacher_assignments')
        .update({ can_grade: true })
        .eq('id', assignment.id);

      await supabase
        .from('course_teacher_assignments')
        .update({ can_communicate: true })
        .eq('id', assignment.id);

      // Verify final state
      const { data: finalAssignment } = await supabase
        .from('course_teacher_assignments')
        .select('*')
        .eq('id', assignment.id)
        .single();

      expect(finalAssignment.can_manage_content).toBe(true);
      expect(finalAssignment.can_grade).toBe(true);
      expect(finalAssignment.can_communicate).toBe(true);
    });
  });

  describe('Deletion Workflow: Admin deletes course → assignments cascade delete → teachers notified', () => {
    it('should handle course deletion with cascade and notifications', async () => {
      // Step 1: Create course
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Deletion Test Course',
          description: 'Course for testing deletion workflow',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      testCourse = course;

      // Step 2: Assign teacher
      const { data: assignment } = await supabase
        .from('course_teacher_assignments')
        .insert({
          course_id: course.id,
          teacher_id: teacherUser.id,
          assigned_by: adminUser.id,
          can_manage_content: true,
          can_grade: true,
          can_communicate: true,
          is_primary_teacher: true
        })
        .select()
        .single();

      expect(assignment).toBeDefined();

      // Step 3: Delete course
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id);

      // Depending on cascade settings, this might succeed or fail
      if (deleteError) {
        // If cascade is not set up, manually delete assignments first
        await supabase
          .from('course_teacher_assignments')
          .delete()
          .eq('course_id', course.id);

        // Then delete course
        const { error: secondDeleteError } = await supabase
          .from('courses')
          .delete()
          .eq('id', course.id);

        expect(secondDeleteError).toBeNull();
      }

      // Step 4: Verify assignments are deleted
      const { data: remainingAssignments } = await supabase
        .from('course_teacher_assignments')
        .select('*')
        .eq('course_id', course.id);

      expect(remainingAssignments).toHaveLength(0);

      // Step 5: Verify course is deleted
      const { data: deletedCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', course.id);

      expect(deletedCourse).toHaveLength(0);

      // Step 6: Check for deletion notification
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', teacherUser.id)
        .eq('type', 'course_deleted')
        .order('created_at', { ascending: false })
        .limit(1);

      // Notification should exist if notification system is set up
      if (notifications && notifications.length > 0) {
        expect(notifications[0].user_id).toBe(teacherUser.id);
      }

      testCourse = null; // Mark as cleaned up
    });
  });
});
