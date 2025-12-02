# Requirements Document

## Introduction

This document specifies the requirements for implementing a hierarchical role-based access control (RBAC) system for the online education platform. The system will replace the current flat role structure (Admin, Teacher, Student, Parent) with a hierarchical permission model that provides granular control over course management operations based on teacher roles and assignments.

## Glossary

- **RBAC System**: Role-Based Access Control System - a security mechanism that restricts system access based on user roles
- **Role Level**: A numeric value (1-5) indicating the hierarchical position and authority level of a user role
- **Super Admin**: The highest authority user (Level 5) with unrestricted access to all system functions
- **Admin**: System administrator (Level 4) with full access to platform management
- **Senior Teacher**: Head of Department or experienced teacher (Level 3) with elevated course management privileges
- **Course Teacher**: Regular teacher (Level 2) assigned to specific courses or grade levels
- **Tuition Teacher**: Entry-level teacher (Level 1) providing tutoring for specific subjects or students
- **Course Approval Workflow**: A process requiring lower-level teachers to submit courses for administrative review before publication
- **Assigned Grades**: Specific grade levels (e.g., Grade 1, 2, 3) that a teacher is authorized to create courses for
- **Assigned Subjects**: Specific subject areas (e.g., Mathematics, Science) that a teacher is authorized to teach
- **Approval Status**: The current state of a course in the approval workflow (draft, pending_approval, approved, rejected)
- **Permission Check**: A validation process that determines whether a user has authorization to perform a specific action
- **Teacher Assignment**: The process of linking teachers to specific grades, subjects, and setting their permission levels

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to assign hierarchical role levels to users, so that I can control access permissions based on organizational structure.

#### Acceptance Criteria

1. WHEN a user account is created THEN the System SHALL assign a default role level of 1
2. WHEN an administrator updates a user's role level THEN the System SHALL validate the new level is between 1 and 5
3. WHEN a user's role level is modified THEN the System SHALL update the role_level field in the users table
4. WHEN a user's role level is set to 3 or higher THEN the System SHALL allow setting the can_approve_courses flag
5. WHEN a user's department is assigned THEN the System SHALL store the department value in the users table

### Requirement 2

**User Story:** As a system administrator, I want to configure teacher-specific attributes, so that I can control what types of courses teachers can create and manage.

#### Acceptance Criteria

1. WHEN a teacher profile is created THEN the System SHALL allow setting teacher_type as 'course_teacher', 'tuition_teacher', or 'senior_teacher'
2. WHEN a teacher is assigned to grades THEN the System SHALL store the grade assignments as an array in assigned_grades
3. WHEN a teacher is assigned to subjects THEN the System SHALL store the subject assignments as an array in assigned_subjects
4. WHEN a teacher's permissions are configured THEN the System SHALL set can_create_courses and requires_course_approval flags appropriately
5. WHEN a tuition_teacher or course_teacher is configured THEN the System SHALL set requires_course_approval to TRUE by default

### Requirement 3

**User Story:** As a course teacher, I want to create courses within my assigned scope, so that I can develop educational content for my designated grades and subjects.

#### Acceptance Criteria

1. WHEN a teacher creates a course THEN the System SHALL verify the teacher has can_create_courses permission
2. WHEN a course_teacher or tuition_teacher creates a course THEN the System SHALL set approval_status to 'pending_approval'
3. WHEN a senior_teacher or admin creates a course THEN the System SHALL set approval_status to 'draft'
4. WHEN a teacher creates a course THEN the System SHALL record the creator's role in created_by_role field
5. WHEN a teacher attempts to create a course outside assigned grades or subjects THEN the System SHALL reject the creation request

### Requirement 4

**User Story:** As a teacher, I want to edit courses I have created or been assigned to, so that I can update and improve course content.

#### Acceptance Criteria

1. WHEN a teacher attempts to edit a course THEN the System SHALL verify the teacher owns the course OR has permission to edit any course
2. WHEN a super_admin or admin edits any course THEN the System SHALL allow the modification
3. WHEN a senior_teacher edits a course in their assigned area THEN the System SHALL allow the modification
4. WHEN a course_teacher or tuition_teacher edits their own course THEN the System SHALL allow the modification
5. WHEN a teacher attempts to edit a course outside their permissions THEN the System SHALL deny access with an appropriate error message

### Requirement 5

**User Story:** As a teacher, I want to delete courses based on my permission level, so that I can remove outdated or incorrect content.

#### Acceptance Criteria

1. WHEN a super_admin or admin deletes any course THEN the System SHALL allow the deletion
2. WHEN a senior_teacher deletes a draft course THEN the System SHALL allow the deletion
3. WHEN a senior_teacher attempts to delete a published course THEN the System SHALL deny the deletion
4. WHEN a course_teacher or tuition_teacher deletes their own draft course THEN the System SHALL allow the deletion
5. WHEN a course_teacher or tuition_teacher attempts to delete a published course THEN the System SHALL deny the deletion

### Requirement 6

**User Story:** As a teacher, I want to publish courses based on my permission level, so that students can access approved educational content.

#### Acceptance Criteria

1. WHEN a super_admin or admin publishes any course THEN the System SHALL change the course status to published
2. WHEN a senior_teacher publishes their own course THEN the System SHALL change the course status to published
3. WHEN a course_teacher or tuition_teacher attempts to publish a course THEN the System SHALL set approval_status to 'pending_approval' instead
4. WHEN a course requires approval THEN the System SHALL display a "Submit for Approval" button instead of "Publish"
5. WHEN a course is submitted for approval THEN the System SHALL notify administrators

### Requirement 7

**User Story:** As an administrator, I want to review and approve pending courses, so that I can ensure content quality before publication.

#### Acceptance Criteria

1. WHEN an administrator views pending courses THEN the System SHALL display all courses with approval_status 'pending_approval'
2. WHEN an administrator approves a course THEN the System SHALL set approval_status to 'approved' and record approved_by and approved_at
3. WHEN an administrator rejects a course THEN the System SHALL set approval_status to 'rejected' and store the rejection_reason
4. WHEN a course approval status changes THEN the System SHALL send a notification to the course creator
5. WHEN an administrator requests changes THEN the System SHALL notify the teacher with specific feedback

### Requirement 8

**User Story:** As a teacher, I want to manage course content based on my permissions, so that I can upload materials and create learning resources.

#### Acceptance Criteria

1. WHEN a teacher uploads videos to a course THEN the System SHALL verify the teacher has permission to manage that course's content
2. WHEN a teacher uploads documents to a course THEN the System SHALL verify the teacher has permission to manage that course's content
3. WHEN a teacher uploads images to a course THEN the System SHALL verify the teacher has permission to manage that course's content
4. WHEN a senior_teacher manages content for assigned courses THEN the System SHALL allow the operation
5. WHEN a course_teacher or tuition_teacher manages content for their own courses THEN the System SHALL allow the operation

### Requirement 9

**User Story:** As a teacher, I want to create live class sessions for my courses, so that I can conduct real-time instruction.

#### Acceptance Criteria

1. WHEN a teacher creates Zoom or Google Meet links THEN the System SHALL verify the teacher has permission to manage the course
2. WHEN a super_admin or admin creates meeting links THEN the System SHALL allow creation for any course
3. WHEN a senior_teacher creates meeting links for assigned courses THEN the System SHALL allow the creation
4. WHEN a course_teacher or tuition_teacher creates meeting links for their own courses THEN the System SHALL allow the creation
5. WHEN a teacher attempts to create meeting links for unauthorized courses THEN the System SHALL deny the request

### Requirement 10

**User Story:** As an administrator, I want to assign teachers to specific grades and subjects, so that I can control their course creation scope.

#### Acceptance Criteria

1. WHEN an administrator assigns a teacher to grades THEN the System SHALL update the assigned_grades array in the teachers table
2. WHEN an administrator assigns a teacher to subjects THEN the System SHALL update the assigned_subjects array in the teachers table
3. WHEN an administrator sets a teacher type THEN the System SHALL update the teacher_type field with a valid value
4. WHEN an administrator configures approval requirements THEN the System SHALL update the requires_course_approval flag
5. WHEN teacher assignments are modified THEN the System SHALL validate the assignments against existing courses

### Requirement 11

**User Story:** As a teacher, I want to view my course approval status, so that I can track the review process and respond to feedback.

#### Acceptance Criteria

1. WHEN a teacher views their courses THEN the System SHALL display status badges for each course (Draft, Pending Approval, Approved, Rejected)
2. WHEN a course is rejected THEN the System SHALL display the rejection_reason to the teacher
3. WHEN a teacher views a rejected course THEN the System SHALL provide a "Resubmit" button
4. WHEN a teacher resubmits a course THEN the System SHALL reset approval_status to 'pending_approval'
5. WHEN a course status changes THEN the System SHALL update the UI in real-time without requiring page refresh

### Requirement 12

**User Story:** As an administrator, I want to manage platform-wide features and settings, so that I can control system configuration.

#### Acceptance Criteria

1. WHEN a super_admin or admin manages testimonials THEN the System SHALL allow the operation
2. WHEN a super_admin or admin manages brochures THEN the System SHALL allow the operation
3. WHEN a super_admin or admin manages platform features THEN the System SHALL allow the operation
4. WHEN a teacher attempts to access platform management features THEN the System SHALL deny access
5. WHEN a student or parent attempts to access platform management features THEN the System SHALL deny access

### Requirement 13

**User Story:** As a system, I want to enforce permission checks on all course operations, so that unauthorized actions are prevented.

#### Acceptance Criteria

1. WHEN any course operation is requested THEN the System SHALL execute permission validation before processing
2. WHEN permission validation fails THEN the System SHALL return a 403 Forbidden error with a descriptive message
3. WHEN permission validation succeeds THEN the System SHALL proceed with the requested operation
4. WHEN a permission check involves assigned grades or subjects THEN the System SHALL verify the course matches the teacher's assignments
5. WHEN a permission check is performed THEN the System SHALL log the check result for audit purposes

### Requirement 14

**User Story:** As a teacher, I want to receive notifications about my course approval status, so that I can respond promptly to administrative decisions.

#### Acceptance Criteria

1. WHEN a teacher submits a course for approval THEN the System SHALL send notifications to all administrators
2. WHEN an administrator approves a course THEN the System SHALL send a notification to the course creator
3. WHEN an administrator rejects a course THEN the System SHALL send a notification to the course creator including the rejection reason
4. WHEN an administrator requests changes THEN the System SHALL send a notification to the course creator with specific feedback
5. WHEN a notification is sent THEN the System SHALL use both in-app and email notification channels

### Requirement 15

**User Story:** As an administrator, I want to perform bulk approval operations, so that I can efficiently manage multiple pending courses.

#### Acceptance Criteria

1. WHEN an administrator selects multiple pending courses THEN the System SHALL enable bulk action buttons
2. WHEN an administrator performs bulk approval THEN the System SHALL approve all selected courses simultaneously
3. WHEN an administrator performs bulk rejection THEN the System SHALL reject all selected courses with a common reason
4. WHEN bulk operations complete THEN the System SHALL send individual notifications to each affected teacher
5. WHEN bulk operations are performed THEN the System SHALL display a summary of successful and failed operations
