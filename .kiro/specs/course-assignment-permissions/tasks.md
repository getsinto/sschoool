# Implementation Plan

- [x] 1. Create database migration for course assignment system



  - Create migration file `supabase/migrations/20250102000002_course_assignment_permissions.sql`
  - Add role_level column to users table with default values
  - Add teacher_type column to teachers table
  - Add created_by and created_by_role columns to courses table
  - Create course_assignments table with all required columns
  - Create indexes for performance optimization
  - Create trigger function to ensure single primary teacher per course
  - Create notification trigger for teacher assignments



  - _Requirements: 1.1, 1.4, 2.1, 2.3, 2.5, 10.1_

- [x] 2. Implement RLS policies for permission enforcement


  - Create RLS policy: Only admins (role_level >= 4) can INSERT courses
  - Create RLS policy: Only admins can UPDATE course basic details
  - Create RLS policy: Only admins can DELETE courses
  - Create RLS policy: Anyone can SELECT published courses
  - Create RLS policy: Assigned teachers can SELECT their courses


  - Create RLS policy: Admins can manage all course_assignments
  - Create RLS policy: Teachers can view their own assignments
  - Create database functions: can_manage_course_content(), can_create_courses()
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_



- [x] 3. Create permission checking library
  - Create `lib/permissions/coursePermissions.ts` file
  - Implement User and CourseAssignment interfaces
  - Implement canCreateCourse() function
  - Implement canEditCourseDetails() function
  - Implement canManageCourseContent() async function
  - Implement canPublishCourse() function
  - Implement canDeleteCourse() function





  - Implement canAssignTeachers() function
  - Implement canGradeStudents() async function
  - Implement canCommunicateWithStudents() async function


  - _Requirements: 1.1, 1.2, 4.4, 4.5, 5.3, 6.3, 8.3, 9.3_

- [x] 3.1 Write property test for admin-only course creation

  - **Property 1: Admin-only course creation**
  - **Validates: Requirements 1.1, 1.2, 1.3**



- [x] 4. Implement assignment management functions
  - Implement getUserAssignedCourses() function

  - Implement getCourseAssignments() function



  - Implement assignTeacherToCourse() function with permission validation
  - Implement removeTeacherFromCourse() function

  - Implement updateTeacherPermissions() function
  - Implement hasAnyCoursePermission() function
  - Implement getUserCourseRole() function
  - _Requirements: 2.1, 2.2, 3.1, 7.1, 7.2, 7.3_

- [x] 4.1 Write property test for assignment uniqueness
  - **Property 3: Assignment uniqueness**






  - **Validates: Requirements 2.1, 7.5**

- [x] 4.2 Write property test for single primary teacher
  - **Property 4: Single primary teacher**
  - **Validates: Requirements 2.3**

- [x] 5. Create admin course creation API
  - Create `app/api/admin/courses/create/route.ts`

  - Implement POST handler with permission check using canCreateCourse()
  - Validate required fields (title, description, subject, grade_level)
  - Create course with created_by and created_by_role tracking
  - Handle optional teacher assignments during creation
  - Return course with assignment details
  - Implement GET handler for form data (teachers, subjects, grade levels)
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.5_

- [x] 5.1 Write property test for course creator tracking
  - **Property 2: Course creator tracking**
  - **Validates: Requirements 1.4**

- [x] 6. Block teacher course creation endpoint
  - Create `app/api/teacher/courses/create/route.ts`
  - Implement POST handler that returns 403 Forbidden










  - Provide helpful error message directing to admin
  - Implement GET, PUT, PATCH, DELETE handlers with 403/405 responses
  - Include redirect_url in error response
  - _Requirements: 1.2, 1.3_



- [x] 7. Create teacher content management API

  - Create `app/api/teacher/courses/[id]/content/route.ts`




  - Implement GET handler with canManageCourseContent() check


  - Return course content with user's permissions
  - Implement PATCH handler for content updates only
  - Define allowed content fields (modules, lessons, materials, resources)
  - Block updates to course details (title, price, status)
  - Implement POST handler for adding new content items
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7.1 Write property test for content management permission enforcement
  - **Property 8: Content management permission enforcement**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 7.2 Write property test for course details immutability
  - **Property 9: Course details immutability for teachers**
  - **Validates: Requirements 4.5**


- [x] 8. Create teacher assigned courses API
  - Create `app/api/teacher/courses/assigned/route.ts`

  - Implement GET handler using getUserAssignedCourses()
  - Fetch course statistics (student count, lesson count, etc.)
  - Return courses with assignment details and permissions
  - Calculate primary vs secondary course counts
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8.1 Write property test for teacher course visibility
  - **Property 6: Teacher course visibility**
  - **Validates: Requirements 3.1, 3.2**

- [x] 8.2 Write property test for non-assigned course access denial
  - **Property 7: Non-assigned course access denial**
  - **Validates: Requirements 3.4**

- [x] 9. Create admin teacher assignment API


  - Create `app/api/admin/courses/[id]/assign-teachers/route.ts`
  - Implement GET handler to fetch current assignments and available teachers
  - Implement POST handler to assign multiple teachers with permissions
  - Validate teacher exists and has teacher role
  - Use assignTeacherToCourse() for each assignment
  - Implement PATCH handler to update teacher permissions
  - Implement DELETE handler to remove teacher from course
  - Return detailed success/error information for batch operations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2, 7.3, 7.4_

- [x] 9.1 Write property test for assignment notification delivery
  - **Property 5: Assignment notification delivery**
  - **Validates: Requirements 2.5, 11.1, 11.2**

- [x] 9.2 Write property test for permission update immediacy
  - **Property 12: Permission update immediacy**
  - **Validates: Requirements 7.1**

- [x] 9.3 Write property test for assignment removal notification
  - **Property 13: Assignment removal notification**
  - **Validates: Requirements 7.2**





- [x] 10. Create email notification templates



  - Create `emails/TeacherAssigned.tsx` component
  - Include course details, role, permissions, and action link
  - Create `emails/TeacherUnassigned.tsx` component






  - Include course name and removal reason
  - Create `emails/PermissionsUpdated.tsx` component
  - Show old vs new permissions comparison
  - _Requirements: 2.5, 7.2, 11.1, 11.2, 11.3, 11.4_




- [x] 11. Update admin course creation UI
  - Update `app/(dashboard)/admin/courses/create/page.tsx`
  - Keep "Create New Course" button visible
  - Add teacher assignment section to form
  - Implement multi-select teacher dropdown
  - Add permission toggles for each teacher
  - Add primary teacher radio selector
  - Call POST /api/admin/courses/create with assignments

  - Show success message with assignment details
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4_

- [x] 12. Create admin teacher assignment UI
  - Create `app/(dashboard)/admin/courses/[id]/assign-teachers/page.tsx`
  - Implement teacher search and filter functionality
  - Display teacher cards with photo, name, subjects, experience
  - Add multi-select checkboxes for teachers
  - Add primary teacher radio selector
  - Add permission toggles (can_manage_content, can_grade, can_communicate)
  - Implement "Assign Teachers" button with API call
  - Show success/error messages for each assignment
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 13. Create admin assignment management components



  - Create `components/admin/courses/TeacherAssignment.tsx`
  - Implement teacher search with filters (type, subject)
  - Create teacher card component with selection
  - Add permission toggle components
  - Create `components/admin/courses/AssignmentTable.tsx`
  - Display current assignments with permissions
  - Add edit/remove action buttons
  - Show primary teacher indicator





  - _Requirements: 7.3, 7.4, 12.1, 12.2, 12.3_

- [x] 14. Update admin course detail page
  - Update `app/(dashboard)/admin/courses/[id]/page.tsx`
  - Add "Teachers" tab to course details
  - Display current teacher assignments table

  - Show teacher name, role, permissions, assigned date
  - Add "Assign More Teachers" button
  - Add "Edit Permissions" action per teacher
  - Add "Remove Teacher" action per teacher



  - Add "Change Primary Teacher" functionality
  - _Requirements: 7.3, 7.4, 12.1, 12.4_

- [x] 15. Update teacher courses list UI



  - Update `app/(dashboard)/teacher/courses/page.tsx`
  - Remove "Create New Course" button completely
  - Change page title to "My Assigned Courses"
  - Display only assigned courses using GET /api/teacher/courses/assigned
  - Show role badge (Primary Teacher / Content Manager)
  - Display permission indicators for each course
  - Add "Manage Content" button for each course
  - Show empty state with message to contact admin



  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 16. Create teacher content management UI
  - Create `app/(dashboard)/teacher/courses/[id]/content/page.tsx`
  - Implement tabbed interface (Content Management, Course Details, Students, Analytics)
  - Make Course Details tab read-only
  - Create content editor for modules, lessons, materials
  - Add video upload functionality
  - Add document upload functionality
  - Add quiz builder integration

  - Add assignment builder integration



  - Add "Save" button with PATCH /api/teacher/courses/[id]/content
  - Show permission indicators throughout
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 17. Create teacher permission badge components



  - Create `components/teacher/courses/PermissionBadge.tsx`
  - Display visual indicators for each permission type
  - Add tooltips explaining each permission
  - Use color coding (green=granted, gray=not granted)
  - Create `components/teacher/courses/RoleBadge.tsx`
  - Show "Primary Teacher" or "Content Manager" badge


  - Add icon and styling
  - _Requirements: 3.2, 3.3_

- [x] 18. Update course publishing controls





  - Update admin course detail page with publish/unpublish buttons
  - Add permission check using canPublishCourse()
  - Hide publish controls from teacher UI
  - Create API endpoint for course status updates (admin only)
  - Send notifications to enrolled students on publish
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_






- [x] 18.1 Write property test for admin-only publishing
  - **Property 14: Admin-only publishing**
  - **Validates: Requirements 8.1, 8.2, 8.3**






- [x] 19. Update course deletion controls
  - Update admin course detail page with delete button
  - Add permission check using canDeleteCourse()





  - Hide delete controls from teacher UI


  - Add confirmation dialog for deletion
  - Notify assigned teachers on course deletion

  - Handle cascade deletion of assignments









  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_



- [x] 19.1 Write property test for admin-only deletion

  - **Property 15: Admin-only deletion**





  - **Validates: Requirements 9.1, 9.3**

- [x] 19.2 Write property test for cascade deletion
  - **Property 16: Cascade deletion of assignments**





  - **Validates: Requirements 9.1**





- [x] 20. Create admin assignment overview page
  - Create `app/(dashboard)/admin/courses/assignments/page.tsx`
  - Display all course assignments across platform
  - Add filters (by teacher, by course, by permission)
  - Show assignment statistics (total, primary, content managers)
  - Add export functionality for assignment data
  - Display teacher workload distribution
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 20.1 Write property test for assignment visibility
  - **Property 19: Assignment visibility for admins**
  - **Validates: Requirements 12.1, 12.2, 12.3**

- [x] 20.2 Write property test for workload calculation
  - **Property 20: Teacher workload calculation accuracy**
  - **Validates: Requirements 12.4**

- [x] 21. Implement grading permission checks
  - Update grading API routes with canGradeStudents() checks
  - Update teacher gradebook UI to show only assigned courses
  - Add permission indicators in grading interface
  - Block grading attempts for non-assigned courses
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 21.1 Write property test for grading permission enforcement
  - **Property 10: Grading permission enforcement**
  - **Validates: Requirements 5.1, 5.3**

- [x] 22. Implement communication permission checks
  - Update messaging API routes with canCommunicateWithStudents() checks
  - Update teacher messaging UI to show only assigned courses
  - Add permission indicators in communication interface
  - Block messaging attempts for non-assigned courses
  - Update live class creation with permission checks
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 22.1 Write property test for communication permission enforcement
  - **Property 11: Communication permission enforcement**
  - **Validates: Requirements 6.1, 6.3**

- [x] 23. Add audit logging for permission operations
  - Create audit_logs table for tracking permission-sensitive operations
  - Log course creation with admin details
  - Log teacher assignments with assigner details
  - Log permission changes with before/after values
  - Log course deletions with admin details
  - Create admin audit log viewer UI
  - _Requirements: All requirements (audit trail)_

- [x] 24. Implement rate limiting
  - Add rate limiting middleware for course creation (10/hour per admin)
  - Add rate limiting for teacher assignments (50/hour per admin)
  - Add rate limiting for permission updates (100/hour per admin)
  - Return 429 Too Many Requests with retry-after header
  - _Security requirement_

- [x] 25. Create monitoring and alerting
  - Set up metrics tracking for course creation rate
  - Set up metrics for teacher assignment rate
  - Set up metrics for permission check failures
  - Set up metrics for RLS policy violations
  - Configure alerts for high error rates
  - Configure alerts for RLS violations
  - _Monitoring requirement_

- [x] 26. Write integration tests

  - Test complete workflow: admin creates course → assigns teacher → teacher manages content
  - Test permission denial: teacher attempts course creation
  - Test permission denial: teacher attempts to access non-assigned course
  - Test assignment workflow: admin assigns → teacher receives notification → teacher can access
  - Test permission update: admin updates permissions → changes take effect immediately
  - Test deletion workflow: admin deletes course → assignments cascade delete → teachers notified
  - _Requirements: All requirements (integration testing)_


- [x] 27. Write database RLS policy tests



  - Test RLS blocks teacher course INSERT
  - Test RLS blocks teacher course UPDATE on details
  - Test RLS allows teacher course UPDATE on content (with assignment)
  - Test RLS blocks teacher course DELETE
  - Test RLS allows admin all operations
  - Test RLS blocks access to non-assigned courses
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


- [x] 27.1 Write property test for database-level course creation enforcement
  - **Property 17: Database-level course creation enforcement**
  - **Validates: Requirements 10.1**




- [x] 27.2 Write property test for database-level content update enforcement
  - **Property 18: Database-level content update enforcement**
  - **Validates: Requirements 10.4**

- [x] 28. Create user documentation
  - Write admin guide: "How to Create Courses and Assign Teachers"



  - Write teacher guide: "Understanding Your Assigned Courses"
  - Write FAQ document for common permission questions
  - Create video tutorial for admin course creation workflow
  - Create video tutorial for teacher content management
  - _Documentation requirement_




- [x] 29. Create developer documentation
  - Document permission system architecture
  - Document all API endpoints with examples
  - Document database schema changes
  - Document testing guidelines
  - Create OpenAPI/Swagger specifications
  - _Documentation requirement_

- [x] 30. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
