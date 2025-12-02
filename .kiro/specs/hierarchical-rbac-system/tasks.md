# Implementation Plan

- [x] 1. Database schema updates and migrations



  - Create migration file for users table extensions (role_level, can_approve_courses, department)
  - Create migration file for teachers table extensions (teacher_type, assigned_grades, assigned_subjects, can_create_courses, requires_course_approval)
  - Create migration file for courses table extensions (created_by_role, approval_status, approved_by, approved_at, rejection_reason, submission_notes)
  - Create migration file for course_approval_history table
  - Add database indexes for performance optimization
  - Create RLS policies for permission enforcement


  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.4, 7.2, 7.3_

- [ ] 2. Implement core permission checking module
  - Create lib/permissions/coursePermissions.ts with TypeScript interfaces
  - Implement canCreateCourse function with role level and assignment checks
  - Implement canEditCourse function with ownership and permission validation
  - Implement canDeleteCourse function with status and role level checks
  - Implement canPublishCourse function with approval workflow logic
  - Implement canManageCourseContent function for content management permissions
  - Implement isAssignedToClass helper function for grade validation
  - Implement isAssignedToSubject helper function for subject validation
  - _Requirements: 3.1, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 2.1 Write property test for default role level assignment
  - **Property 1: Default role level assignment**
  - **Validates: Requirements 1.1**

- [ ] 2.2 Write property test for role level range validation
  - **Property 2: Role level range validation**
  - **Validates: Requirements 1.2**

- [ ] 2.3 Write property test for course creation permission check
  - **Property 3: Course creation permission check**
  - **Validates: Requirements 3.1**

- [ ] 2.4 Write property test for assignment scope enforcement
  - **Property 5: Assignment scope enforcement**
  - **Validates: Requirements 3.5**

- [ ] 2.5 Write property test for edit permission verification
  - **Property 6: Edit permission verification**
  - **Validates: Requirements 4.1**

- [ ] 2.6 Write property test for published course deletion restriction
  - **Property 7: Published course deletion restriction**
  - **Validates: Requirements 5.3**

- [ ] 2.7 Write property test for draft course deletion permission
  - **Property 8: Draft course deletion permission**
  - **Validates: Requirements 5.4**

- [ ] 2.8 Write property test for permission check precedence
  - **Property 11: Permission check precedence**
  - **Validates: Requirements 13.1**

- [ ] 2.9 Write property test for permission denial response format
  - **Property 12: Permission denial response format**
  - **Validates: Requirements 13.2**

- [ ] 3. Implement approval workflow module
  - Create lib/workflows/courseApproval.ts with workflow interfaces
  - Implement submitForApproval function to transition courses to pending state
  - Implement approveCourse function with state updates and audit trail
  - Implement rejectCourse function with rejection reason storage
  - Implement requestChanges function for admin feedback
  - Create course_approval_history record for each workflow action
  - _Requirements: 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 3.1 Write property test for automatic approval workflow enrollment
  - **Property 4: Automatic approval workflow enrollment**
  - **Validates: Requirements 3.2, 6.3**

- [ ] 3.2 Write property test for approval state transition completeness
  - **Property 9: Approval state transition completeness**
  - **Validates: Requirements 7.2**

- [ ] 3.3 Write property test for rejection state transition completeness
  - **Property 10: Rejection state transition completeness**
  - **Validates: Requirements 7.3**

- [ ] 4. Implement teacher assignment module
  - Create lib/admin/teacherAssignments.ts with assignment interfaces
  - Implement assignTeacherToGrades function with validation
  - Implement assignTeacherToSubjects function with validation
  - Implement updateTeacherType function with permission updates
  - Implement setApprovalRequirement function
  - Add validation against existing course assignments
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 5. Implement notification integration
  - Create lib/notifications/approvalNotifications.ts
  - Implement notifyAdminsOfSubmission function
  - Implement notifyTeacherOfApproval function
  - Implement notifyTeacherOfRejection function with reason
  - Implement notifyTeacherOfChanges function with feedback
  - Integrate with existing notification system
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 6. Update course creation API routes
  - Update app/api/teacher/courses/route.ts POST handler
  - Add permission check using canCreateCourse before processing
  - Set created_by_role based on user's role level
  - Set approval_status based on requires_course_approval flag
  - Trigger notification if status is pending_approval
  - Return appropriate error messages for permission failures
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. Update course editing API routes
  - Update app/api/teacher/courses/[id]/route.ts PUT handler
  - Add permission check using canEditCourse
  - Verify assigned grades/subjects match course category
  - Prevent editing of approved courses by lower-level teachers
  - Return 403 with descriptive error for permission failures
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 8. Update course deletion API routes
  - Update app/api/teacher/courses/[id]/route.ts DELETE handler
  - Add permission check using canDeleteCourse
  - Check course approval_status before allowing deletion
  - Enforce role-based deletion restrictions
  - Return appropriate error messages
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9. Create course approval API routes
  - Create app/api/admin/courses/[id]/approve/route.ts
  - Implement POST handler for approving courses
  - Implement PUT handler for requesting changes
  - Implement DELETE handler for rejecting courses
  - Update approval_status, approved_by, and approved_at fields
  - Store rejection_reason when rejecting
  - Create approval history records
  - Trigger appropriate notifications
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Create bulk approval API routes
  - Create app/api/admin/courses/bulk-approve/route.ts
  - Implement bulk approval for multiple courses
  - Implement bulk rejection with common reason
  - Return summary of successful and failed operations
  - Send individual notifications to affected teachers
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 11. Update content management API routes
  - Update app/api/teacher/courses/upload-video/route.ts
  - Update app/api/teacher/courses/upload-document/route.ts
  - Update app/api/teacher/courses/upload-image/route.ts
  - Add permission check using canManageCourseContent
  - Verify teacher has permission for the specific course
  - Return 403 for unauthorized content management attempts
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Update live class creation API routes
  - Update app/api/teacher/live-classes/route.ts POST handler
  - Add permission check for creating meeting links
  - Verify teacher has permission to manage the course
  - Allow creation for assigned courses only
  - Return appropriate error messages
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 13. Create teacher assignment API routes
  - Create app/api/admin/teachers/[id]/assignments/route.ts
  - Implement GET handler to retrieve current assignments
  - Implement PUT handler to update grade assignments
  - Implement PUT handler to update subject assignments
  - Implement PUT handler to update teacher type
  - Implement PUT handler to update approval requirements
  - Validate assignments against existing courses
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 14. Update teacher course creation UI
  - Update app/(dashboard)/teacher/courses/create/page.tsx
  - Show approval notice if teacher requires approval
  - Disable "Publish" button if needs approval
  - Show "Submit for Approval" button instead of "Publish"
  - Add submission_notes textarea for approval requests
  - Display teacher's assigned grades and subjects
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 15. Update teacher courses list UI
  - Update app/(dashboard)/teacher/courses/page.tsx
  - Add status badges for Draft, Pending Approval, Approved, Rejected
  - Show rejection_reason if course is rejected
  - Add "Resubmit" button for rejected courses
  - Filter courses by approval status
  - Display approval workflow history
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 16. Create admin course approvals page
  - Create app/(dashboard)/admin/courses/approvals/page.tsx
  - List all courses with approval_status='pending_approval'
  - Show course details, teacher info, and submission notes
  - Add quick approve/reject buttons for each course
  - Implement bulk selection with checkboxes
  - Add bulk approve and bulk reject actions
  - Filter by teacher, subject, and grade
  - Show approval history for each course
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 17. Create teacher assignment management page
  - Create app/(dashboard)/admin/teachers/[id]/assignments/page.tsx
  - Display current teacher assignments
  - Add multi-select for assigning grades
  - Add multi-select for assigning subjects
  - Add dropdown for teacher type selection
  - Add toggle for can_create_courses permission
  - Add toggle for requires_course_approval setting
  - Show validation warnings for assignment conflicts
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 18. Create reusable UI components
  - Create components/admin/courses/ApprovalStatusBadge.tsx
  - Create components/admin/courses/ApprovalActionButtons.tsx
  - Create components/admin/courses/BulkApprovalControls.tsx
  - Create components/admin/teachers/AssignmentForm.tsx
  - Create components/teacher/courses/SubmissionNotice.tsx
  - Create components/teacher/courses/RejectionFeedback.tsx
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 19. Implement notification templates
  - Create email template for course submission notification
  - Create email template for course approval notification
  - Create email template for course rejection notification
  - Create email template for changes requested notification
  - Create in-app notification templates for all workflow events
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 20. Update middleware for permission enforcement
  - Update middleware.ts to load role_level for all authenticated users
  - Add permission check middleware for course routes
  - Log all permission decisions for audit trail
  - Return consistent error responses for permission failures
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 21. Create data migration scripts
  - Create script to set default role_level for existing users
  - Create script to set teacher_type for existing teachers
  - Create script to initialize can_create_courses flags
  - Create script to set requires_course_approval based on teacher level
  - Create script to backfill created_by_role for existing courses
  - _Requirements: 1.1, 2.1, 2.4, 2.5_

- [ ] 22. Update TypeScript type definitions
  - Update types/database.ts with new table columns
  - Create types/permissions.ts for permission interfaces
  - Create types/approval.ts for approval workflow types
  - Update existing course types with new fields
  - Export all new types from types/index.ts
  - _Requirements: All_

- [ ] 23. Create admin documentation
  - Document role hierarchy and permission levels
  - Document teacher assignment process
  - Document course approval workflow
  - Create troubleshooting guide for common permission issues
  - Document bulk approval operations
  - _Requirements: All_

- [ ] 24. Write integration tests
  - Test end-to-end course creation with permission checks
  - Test approval workflow from submission to approval
  - Test approval workflow from submission to rejection
  - Test teacher assignment updates
  - Test notification delivery for workflow events
  - Test bulk approval operations
  - _Requirements: All_

- [ ] 25. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
