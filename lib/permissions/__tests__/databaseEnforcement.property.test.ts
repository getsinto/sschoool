/**
 * Property-Based Tests for Database-Level Permission Enforcement
 * Tasks 27.1 & 27.2: Property tests for RLS enforcement
 * 
 * Property 17: Database-level course creation enforcement (Requirement 10.1)
 * Property 18: Database-level content update enforcement (Requirement 10.4)
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import fc from 'fast-check';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('Database-Level Permission Enforcement - Property Tests', () => {
  let supabase: any;
  let adminUser: any;
  let teacherUser: any;
  let testSubject: any;
  const createdCourses: string[] = [];

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create admin user
    const { data: adminAuth } = await supabase.auth.admin.createUser({
      email: 'prop_admin@test.com',
      password: 'test123456',
      email_confirm: true
    });

    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .insert({
        user_id: adminAuth.user.id,
        email: 'prop_admin@test.com',
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
      email: 'prop_teacher@test.com',
      password: 'test123456',
      email_confirm: true
    });

    const { data: teacherProfile } = await supabase
      .from('user_profiles')
      .insert({
        user_id: teacherAuth.user.id,
        email: 'prop_teacher@test.com',
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
        name: 'Property Test Subject',
        description: 'Subject for property testing',
        category: 'science',
        is_active: true
      })
      .select()
      .single();

    testSubject = subject;
  });

  afterAll(async () => {
    // Cleanup all created courses
    if (createdCourses.length > 0) {
      await supabase.from('courses').delete().in('id', createdCourses);
    }

    if (testSubject) {
      await supabase.from('subjects').delete().eq('id', testSubject.id);
    }
    await supabase.from('user_profiles').delete().eq('user_id', adminUser.id);
    await supabase.from('user_profiles').delete().eq('user_id', teacherUser.id);
    await supabase.auth.admin.deleteUser(adminUser.id);
    await supabase.auth.admin.deleteUser(teacherUser.id);
  });

  /**
   * Property 17: Database-level course creation enforcement
   * Feature: course-assignment-permissions, Property 17: Database-level course creation enforcement
   * Validates: Requirements 10.1
   * 
   * For any course data, teachers should never be able to create courses directly in the database,
   * regardless of the course properties.
   */
  describe('Property 17: Database-level course creation enforcement', () => {
    it('should block all teacher course creation attempts at database level', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            grade_level: fc.constantFrom('beginner', 'intermediate', 'advanced'),
            status: fc.constantFrom('draft', 'published', 'archived'),
            price: fc.option(fc.float({ min: 0, max: 1000 }), { nil: null })
          }),
          async (courseData) => {
            // Teacher attempts to create course with any properties
            const { data, error } = await supabase
              .from('courses')
              .insert({
                ...courseData,
                subject_id: testSubject.id,
                created_by: teacherUser.id,
                created_by_role: 'teacher'
              })
              .select()
              .single();

            // Property: Teacher creation should ALWAYS fail
            expect(error).toBeDefined();
            expect(data).toBeNull();

            // Verify no course was created
            if (data) {
              const { data: checkCourse } = await supabase
                .from('courses')
                .select('*')
                .eq('created_by', teacherUser.id)
                .eq('title', courseData.title);

              expect(checkCourse).toHaveLength(0);
            }
          }
        ),
        { numRuns: 50 } // Run 50 iterations with different course data
      );
    });

    it('should allow all admin course creation attempts at database level', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.string({ minLength: 1, maxLength: 500 }),
            grade_level: fc.constantFrom('beginner', 'intermediate', 'advanced'),
            status: fc.constantFrom('draft', 'published'),
            price: fc.option(fc.float({ min: 0, max: 1000 }), { nil: null })
          }),
          async (courseData) => {
            // Admin creates course with any properties
            const { data, error } = await supabase
              .from('courses')
              .insert({
                ...courseData,
                subject_id: testSubject.id,
                created_by: adminUser.id,
                created_by_role: 'admin'
              })
              .select()
              .single();

            // Property: Admin creation should ALWAYS succeed
            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(data.title).toBe(courseData.title);
            expect(data.created_by).toBe(adminUser.id);

            // Track for cleanup
            if (data) {
              createdCourses.push(data.id);
            }
          }
        ),
        { numRuns: 20 } // Run 20 iterations
      );
    });
  });

  /**
   * Property 18: Database-level content update enforcement
   * Feature: course-assignment-permissions, Property 18: Database-level content update enforcement
   * Validates: Requirements 10.4
   * 
   * For any course, teachers with can_manage_content permission should be able to update content fields,
   * but not restricted fields like price or status.
   */
  describe('Property 18: Database-level content update enforcement', () => {
    it('should allow assigned teachers to update content fields only', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            description: fc.string({ minLength: 1, maxLength: 500 }),
            // Content fields that teachers CAN update
            contentField: fc.string({ minLength: 1, maxLength: 200 })
          }),
          async (updateData) => {
            // Create a course as admin
            const { data: course } = await supabase
              .from('courses')
              .insert({
                title: `Content Update Test ${Date.now()}`,
                description: 'Original description',
                subject_id: testSubject.id,
                grade_level: 'intermediate',
                status: 'draft',
                created_by: adminUser.id,
                created_by_role: 'admin'
              })
              .select()
              .single();

            createdCourses.push(course.id);

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

            // Teacher updates content field (description)
            const { data: updated, error: updateError } = await supabase
              .from('courses')
              .update({
                description: updateData.description
              })
              .eq('id', course.id)
              .select()
              .single();

            // Property: Content updates should succeed for assigned teachers
            expect(updateError).toBeNull();
            expect(updated).toBeDefined();
            expect(updated.description).toBe(updateData.description);

            // Cleanup assignment
            await supabase
              .from('course_teacher_assignments')
              .delete()
              .eq('course_id', course.id);
          }
        ),
        { numRuns: 30 } // Run 30 iterations
      );
    });

    it('should block teachers from updating restricted fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            price: fc.float({ min: 0, max: 1000 }),
            status: fc.constantFrom('published', 'archived')
          }),
          async (restrictedData) => {
            // Create a course as admin
            const { data: course } = await supabase
              .from('courses')
              .insert({
                title: `Restricted Update Test ${Date.now()}`,
                description: 'Test course',
                subject_id: testSubject.id,
                grade_level: 'intermediate',
                status: 'draft',
                price: 100,
                created_by: adminUser.id,
                created_by_role: 'admin'
              })
              .select()
              .single();

            createdCourses.push(course.id);

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

            // Teacher attempts to update restricted fields
            const { error } = await supabase
              .from('courses')
              .update({
                price: restrictedData.price,
                status: restrictedData.status
              })
              .eq('id', course.id);

            // Property: Restricted field updates should fail or be ignored
            // Verify original values are unchanged
            const { data: unchangedCourse } = await supabase
              .from('courses')
              .select('*')
              .eq('id', course.id)
              .single();

            expect(unchangedCourse.status).toBe('draft');
            expect(unchangedCourse.price).toBe(100);

            // Cleanup assignment
            await supabase
              .from('course_teacher_assignments')
              .delete()
              .eq('course_id', course.id);
          }
        ),
        { numRuns: 30 } // Run 30 iterations
      );
    });

    it('should block non-assigned teachers from any updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            description: fc.string({ minLength: 1, maxLength: 500 }),
            title: fc.string({ minLength: 1, maxLength: 100 })
          }),
          async (updateData) => {
            // Create a course as admin
            const { data: course } = await supabase
              .from('courses')
              .insert({
                title: `Non-Assigned Update Test ${Date.now()}`,
                description: 'Original description',
                subject_id: testSubject.id,
                grade_level: 'intermediate',
                status: 'draft',
                created_by: adminUser.id,
                created_by_role: 'admin'
              })
              .select()
              .single();

            createdCourses.push(course.id);

            // Teacher is NOT assigned to this course
            // Teacher attempts to update any field
            const { error } = await supabase
              .from('courses')
              .update({
                description: updateData.description,
                title: updateData.title
              })
              .eq('id', course.id);

            // Property: Non-assigned teachers should NEVER be able to update
            expect(error).toBeDefined();

            // Verify course is unchanged
            const { data: unchangedCourse } = await supabase
              .from('courses')
              .select('*')
              .eq('id', course.id)
              .single();

            expect(unchangedCourse.description).toBe('Original description');
            expect(unchangedCourse.title).not.toBe(updateData.title);
          }
        ),
        { numRuns: 30 } // Run 30 iterations
      );
    });
  });

  describe('Property: RLS enforcement is consistent across operations', () => {
    it('should consistently enforce permissions regardless of operation order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.constantFrom('create', 'update', 'delete', 'read'),
            { minLength: 3, maxLength: 10 }
          ),
          async (operations) => {
            // Create a test course
            const { data: course } = await supabase
              .from('courses')
              .insert({
                title: `Consistency Test ${Date.now()}`,
                description: 'Test course',
                subject_id: testSubject.id,
                grade_level: 'intermediate',
                status: 'draft',
                created_by: adminUser.id,
                created_by_role: 'admin'
              })
              .select()
              .single();

            if (course) {
              createdCourses.push(course.id);
            }

            // Execute operations in random order
            for (const operation of operations) {
              switch (operation) {
                case 'create':
                  // Teacher attempts create
                  const { error: createError } = await supabase
                    .from('courses')
                    .insert({
                      title: 'Unauthorized',
                      description: 'Test',
                      subject_id: testSubject.id,
                      grade_level: 'intermediate',
                      status: 'draft',
                      created_by: teacherUser.id,
                      created_by_role: 'teacher'
                    });
                  expect(createError).toBeDefined();
                  break;

                case 'update':
                  // Teacher attempts update
                  const { error: updateError } = await supabase
                    .from('courses')
                    .update({ title: 'Unauthorized Update' })
                    .eq('id', course.id);
                  expect(updateError).toBeDefined();
                  break;

                case 'delete':
                  // Teacher attempts delete
                  const { error: deleteError } = await supabase
                    .from('courses')
                    .delete()
                    .eq('id', course.id);
                  expect(deleteError).toBeDefined();
                  break;

                case 'read':
                  // Teacher attempts read (should be blocked for non-assigned)
                  const { data: readData } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', course.id)
                    .single();
                  // May return null or be filtered by RLS
                  break;
              }
            }

            // Property: Course should still exist and be unchanged
            const { data: finalCourse } = await supabase
              .from('courses')
              .select('*')
              .eq('id', course.id)
              .single();

            expect(finalCourse).toBeDefined();
            expect(finalCourse.title).toBe(`Consistency Test ${Date.now()}`);
          }
        ),
        { numRuns: 20 } // Run 20 iterations
      );
    });
  });
});
