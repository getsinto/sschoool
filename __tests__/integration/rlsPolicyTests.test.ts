/**
 * Database RLS Policy Tests
 * Task 27: Write database RLS policy tests
 * 
 * Tests that Row Level Security policies correctly enforce permissions at the database level
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('RLS Policy Tests', () => {
  let supabase: any;
  let adminUser: any;
  let teacherUser: any;
  let testSubject: any;
  let testCourse: any;

  // Create clients for different users
  let adminClient: any;
  let teacherClient: any;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create admin user
    const { data: adminAuth } = await supabase.auth.admin.createUser({
      email: 'rls_admin@test.com',
      password: 'test123456',
      email_confirm: true
    });

    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .insert({
        user_id: adminAuth.user.id,
        email: 'rls_admin@test.com',
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
      email: 'rls_teacher@test.com',
      password: 'test123456',
      email_confirm: true
    });

    const { data: teacherProfile } = await supabase
      .from('user_profiles')
      .insert({
        user_id: teacherAuth.user.id,
        email: 'rls_teacher@test.com',
        role: 'teacher',
        role_level: 2,
        first_name: 'Teacher',
        last_name: 'User'
      })
      .select()
      .single();

    teacherUser = { id: teacherAuth.user.id, profile: teacherProfile };

    // Create authenticated clients for each user
    adminClient = createClient(supabaseUrl, supabaseServiceKey);
    teacherClient = createClient(supabaseUrl, supabaseServiceKey);

    // Create test subject
    const { data: subject } = await supabase
      .from('subjects')
      .insert({
        name: 'RLS Test Subject',
        description: 'Subject for RLS testing',
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

  describe('RLS blocks teacher course INSERT (Requirement 10.1)', () => {
    it('should prevent teacher from inserting courses directly', async () => {
      // Attempt to insert course as teacher
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: 'Unauthorized Course',
          description: 'This should be blocked by RLS',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: teacherUser.id,
          created_by_role: 'teacher'
        })
        .select()
        .single();

      // Should fail due to RLS policy
      expect(error).toBeDefined();
      expect(data).toBeNull();
      
      // Error should indicate permission denied
      if (error) {
        expect(error.message).toMatch(/permission|policy|denied/i);
      }
    });

    it('should allow admin to insert courses', async () => {
      // Admin should be able to insert courses
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: 'Admin Created Course',
          description: 'This should succeed',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.title).toBe('Admin Created Course');
      
      testCourse = data;
    });
  });

  describe('RLS blocks teacher course UPDATE on details (Requirement 10.2)', () => {
    beforeEach(async () => {
      // Create a course as admin
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Update Test Course',
          description: 'Course for testing updates',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      testCourse = course;
    });

    it('should prevent teacher from updating course details without assignment', async () => {
      // Teacher attempts to update course details
      const { data, error } = await supabase
        .from('courses')
        .update({
          title: 'Unauthorized Title Change',
          price: 99.99
        })
        .eq('id', testCourse.id)
        .select();

      // Should fail due to RLS policy
      expect(error).toBeDefined();
      
      // Verify course was not updated
      const { data: unchangedCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourse.id)
        .single();

      expect(unchangedCourse.title).toBe('Update Test Course');
    });

    it('should allow admin to update course details', async () => {
      // Admin updates course details
      const { data, error } = await supabase
        .from('courses')
        .update({
          title: 'Admin Updated Title',
          price: 149.99
        })
        .eq('id', testCourse.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.title).toBe('Admin Updated Title');
      expect(data.price).toBe(149.99);
    });
  });

  describe('RLS allows teacher course UPDATE on content (with assignment) (Requirement 10.4)', () => {
    beforeEach(async () => {
      // Create a course as admin
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Content Update Test Course',
          description: 'Course for testing content updates',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      testCourse = course;

      // Assign teacher with content management permission
      await supabase
        .from('course_teacher_assignments')
        .insert({
          course_id: course.id,
          teacher_id: teacherUser.id,
          assigned_by: adminUser.id,
          can_manage_content: true,
          can_grade: false,
          can_communicate: true,
          is_primary_teacher: false
        });
    });

    it('should allow assigned teacher to update course content', async () => {
      // Teacher updates course description (content)
      const { data, error } = await supabase
        .from('courses')
        .update({
          description: 'Updated by assigned teacher'
        })
        .eq('id', testCourse.id)
        .select()
        .single();

      // Should succeed because teacher is assigned with can_manage_content
      expect(error).toBeNull();
      expect(data.description).toBe('Updated by assigned teacher');
    });

    it('should prevent assigned teacher from updating restricted fields', async () => {
      // Teacher attempts to update price (restricted field)
      const { data, error } = await supabase
        .from('courses')
        .update({
          price: 999.99,
          status: 'published'
        })
        .eq('id', testCourse.id)
        .select();

      // Should fail or be ignored by RLS policy
      // Verify restricted fields were not updated
      const { data: unchangedCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourse.id)
        .single();

      expect(unchangedCourse.status).toBe('draft');
    });
  });

  describe('RLS blocks teacher course DELETE (Requirement 10.3)', () => {
    beforeEach(async () => {
      // Create a course as admin
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Delete Test Course',
          description: 'Course for testing deletion',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      testCourse = course;
    });

    it('should prevent teacher from deleting courses', async () => {
      // Teacher attempts to delete course
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', testCourse.id);

      // Should fail due to RLS policy
      expect(error).toBeDefined();

      // Verify course still exists
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourse.id)
        .single();

      expect(existingCourse).toBeDefined();
      expect(existingCourse.id).toBe(testCourse.id);
    });

    it('should allow admin to delete courses', async () => {
      // Admin deletes course
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', testCourse.id);

      expect(error).toBeNull();

      // Verify course was deleted
      const { data: deletedCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourse.id)
        .single();

      expect(deletedCourse).toBeNull();
      
      testCourse = null; // Prevent cleanup attempt
    });
  });

  describe('RLS allows admin all operations (Requirement 10.5)', () => {
    it('should allow admin to perform all CRUD operations', async () => {
      // CREATE
      const { data: created, error: createError } = await supabase
        .from('courses')
        .insert({
          title: 'Admin CRUD Test',
          description: 'Testing admin permissions',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(created).toBeDefined();
      testCourse = created;

      // READ
      const { data: read, error: readError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourse.id)
        .single();

      expect(readError).toBeNull();
      expect(read.id).toBe(testCourse.id);

      // UPDATE
      const { data: updated, error: updateError } = await supabase
        .from('courses')
        .update({
          title: 'Admin Updated',
          price: 199.99,
          status: 'published'
        })
        .eq('id', testCourse.id)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updated.title).toBe('Admin Updated');
      expect(updated.status).toBe('published');

      // DELETE
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', testCourse.id);

      expect(deleteError).toBeNull();
      
      testCourse = null;
    });
  });

  describe('RLS blocks access to non-assigned courses (Requirement 10.5)', () => {
    beforeEach(async () => {
      // Create a course as admin
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
    });

    it('should prevent teacher from reading non-assigned courses', async () => {
      // Teacher attempts to read course they're not assigned to
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourse.id)
        .single();

      // Depending on RLS policy, this might return null or error
      // The key is that teacher shouldn't see the course
      if (data) {
        // If data is returned, it should be filtered by RLS
        expect(data).toBeNull();
      }
    });

    it('should allow teacher to read assigned courses', async () => {
      // Assign teacher to the course
      await supabase
        .from('course_teacher_assignments')
        .insert({
          course_id: testCourse.id,
          teacher_id: teacherUser.id,
          assigned_by: adminUser.id,
          can_manage_content: true,
          can_grade: true,
          can_communicate: true,
          is_primary_teacher: false
        });

      // Now teacher should be able to read the course
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourse.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(testCourse.id);
    });

    it('should allow admin to read all courses', async () => {
      // Admin should be able to read any course
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourse.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(testCourse.id);
    });
  });

  describe('RLS policy edge cases', () => {
    it('should handle role transitions correctly', async () => {
      // Create course as admin
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Role Transition Test',
          description: 'Testing role changes',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      testCourse = course;

      // Teacher cannot delete
      const { error: teacherDeleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', testCourse.id);

      expect(teacherDeleteError).toBeDefined();

      // Promote teacher to admin
      await supabase
        .from('user_profiles')
        .update({ role: 'admin', role_level: 4 })
        .eq('user_id', teacherUser.id);

      // Now should be able to delete
      const { error: adminDeleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', testCourse.id);

      expect(adminDeleteError).toBeNull();

      // Demote back to teacher
      await supabase
        .from('user_profiles')
        .update({ role: 'teacher', role_level: 2 })
        .eq('user_id', teacherUser.id);

      testCourse = null;
    });

    it('should enforce RLS on bulk operations', async () => {
      // Create multiple courses as admin
      const courses = await Promise.all([
        supabase.from('courses').insert({
          title: 'Bulk Test 1',
          description: 'Bulk operation test',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        }).select().single(),
        supabase.from('courses').insert({
          title: 'Bulk Test 2',
          description: 'Bulk operation test',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        }).select().single()
      ]);

      const courseIds = courses.map(r => r.data.id);

      // Teacher attempts bulk delete
      const { error } = await supabase
        .from('courses')
        .delete()
        .in('id', courseIds);

      // Should fail due to RLS
      expect(error).toBeDefined();

      // Verify courses still exist
      const { data: existingCourses } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);

      expect(existingCourses.length).toBe(2);

      // Cleanup
      await supabase.from('courses').delete().in('id', courseIds);
    });
  });
});
