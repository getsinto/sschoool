/**
 * Comprehensive Integration Tests for Course Assignment Permissions
 * Tests complete workflows with real database interactions
 * 
 * Task 25: Create comprehensive integration tests
 * Requirements: All requirements (integration testing)
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { 
  canCreateCourse, 
  assignTeacherToCourse, 
  canAssignTeachers,
  updateTeacherPermissions,
  removeTeacherFromCourse,
  getCourseAssignments
} from '@/lib/permissions/coursePermissions';

// Test database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('Course Assignment Permissions - Integration Tests', () => {
  let supabase: any;
  let testUsers: any = {};
  let testCourse: any;
  let testSubject: any;

  beforeAll(async () => {
    // Initialize Supabase client with service role key for testing
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create test users with different roles
    const users = [
      { email: 'integration_admin@test.com', role: 'admin', role_level: 4 },
      { email: 'integration_teacher@test.com', role: 'teacher', role_level: 2 }
    ];

    for (const userData of users) {
      const { data: authUser } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: 'test123456',
        email_confirm: true
      });

      const { data: profile } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authUser.user.id,
          email: userData.email,
          role: userData.role,
          role_level: userData.role_level,
          first_name: userData.role,
          last_name: 'Test'
        })
        .select()
        .single();

      testUsers[userData.role] = {
        id: authUser.user.id,
        email: userData.email,
        profile
      };
    }

    // Create test subject
    const { data: subject } = await supabase
      .from('subjects')
      .insert({
        name: 'Integration Test Subject',
        description: 'Subject for integration testing',
        category: 'science',
        is_active: true
      })
      .select()
      .single();

    testSubject = subject;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testCourse) {
      await supabase.from('courses').delete().eq('id', testCourse.id);
    }
    if (testSubject) {
      await supabase.from('subjects').delete().eq('id', testSubject.id);
    }
    
    // Delete test users
    for (const user of Object.values(testUsers) as any[]) {
      await supabase.from('user_profiles').delete().eq('user_id', user.id);
      await supabase.auth.admin.deleteUser(user.id);
    }
  });

  beforeEach(async () => {
    // Clean up any existing test course
    if (testCourse) {
      await supabase.from('course_teacher_assignments').delete().eq('course_id', testCourse.id);
      await supabase.from('courses').delete().eq('id', testCourse.id);
    }
  });

  describe('Complete Course Creation Workflow', () => {
    it('should allow admin to create course with full workflow', async () => {
      const adminUser = testUsers.admin;
      
      // Step 1: Check if admin can create course
      const canCreate = await canCreateCourse(adminUser.id);
      expect(canCreate).toBe(true);
      
      // Step 2: Create course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: 'Integration Test Course',
          description: 'Course created during integration testing',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: adminUser.id,
          created_by_role: 'admin'
        })
        .select()
        .single();

      expect(courseError).toBeNull();
      expect(course).toBeDefined();
      testCourse = course;
      
      // Step 3: Verify course was created with correct permissions
      const { data: createdCourse } = await supabase
        .from('courses')
        .select('*')
        .eq('id', course.id)
        .single();

      expect(createdCourse.created_by).toBe(adminUser.id);
      expect(createdCourse.status).toBe('draft');
    });
  });

  describe('Teacher Assignment Workflow', () => {
    beforeEach(async () => {
      // Create a test course for each test
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: 'Assignment Test Course',
          description: 'Course for testing teacher assignments',
          subject_id: testSubject.id,
          grade_level: 'intermediate',
          status: 'draft',
          created_by: testUsers.admin.id,
          created_by_role: 'admin'
        })
        .select()
        .single();
      
      testCourse = course;
    });

    it('should allow admin to assign teacher with permissions', async () => {
      const adminUser = testUsers.admin;
      const teacherUser = testUsers.teacher;
      
      // Check if admin can assign teachers
      const canAssign = await canAssignTeachers(adminUser.id, testCourse.id);
      expect(canAssign).toBe(true);
      
      // Assign teacher with specific permissions
      const assignmentResult = await assignTeacherToCourse(
        testCourse.id,
        teacherUser.id,
        adminUser.id,
        {
          can_manage_content: true,
          can_grade: true,
          can_communicate: true,
          is_primary_teacher: true
        }
      );

      expect(assignmentResult.success).toBe(true);
      expect(assignmentResult.assignment).toBeDefined();
      
      // Verify assignment was created correctly
      const { data: assignment } = await supabase
        .from('course_teacher_assignments')
        .select('*')
        .eq('course_id', testCourse.id)
        .eq('teacher_id', teacherUser.id)
        .single();

      expect(assignment.can_manage_content).toBe(true);
      expect(assignment.can_grade).toBe(true);
      expect(assignment.assigned_by).toBe(adminUser.id);
    });
  });
});
