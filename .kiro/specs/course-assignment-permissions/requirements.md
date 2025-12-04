# Requirements Document

## Introduction

This specification defines the Course Assignment and Permission System for the online school platform. The system enforces a strict hierarchical permission model where only administrators can create courses, and teachers can only manage content for courses explicitly assigned to them by administrators.

## Glossary

- **System**: The online school learning management platform
- **Admin**: User with administrative privileges (role_level >= 4)
- **Super Admin**: Highest level administrator (role_level = 5)
- **Teacher**: Instructor user who can manage assigned course content
- **Course Teacher**: Teacher type who manages regular courses
- **Tuition Teacher**: Teacher type who manages tutoring courses
- **Senior Teacher**: Experienced teacher with additional privileges (but cannot create courses)
- **Course Assignment**: The relationship linking a teacher to a specific course with defined permissions
- **Primary Teacher**: The main instructor for a course (one per course)
- **Content Management**: Creating and editing lessons, modules, materials, quizzes, and assignments
- **Course Details**: Basic course information including title, description, price, and visibility

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want exclusive control over course creation, so that I can maintain quality standards and proper course organization across the platform.

#### Acceptance Criteria

1. WHEN a user with admin role (role_level >= 4) attempts to create a course THEN the System SHALL allow the course creation and record the admin as the creator
2. WHEN a user with teacher role attempts to create a course THEN the System SHALL reject the request with a 403 Forbidden error
3. WHEN a user with student or parent role attempts to create a course THEN the System SHALL reject the request with a 403 Forbidden error
4. WHEN a course is created THEN the System SHALL record the creator's user ID and role level in the course record
5. WHEN a course is created THEN the System SHALL set the initial status to 'draft'

### Requirement 2

**User Story:** As an administrator, I want to assign teachers to courses with specific permissions, so that teachers can manage course content while I maintain control over course structure.

#### Acceptance Criteria

1. WHEN an admin assigns a teacher to a course THEN the System SHALL create a course_assignment record linking the teacher to the course
2. WHEN an admin assigns multiple teachers to a course THEN the System SHALL allow multiple assignments with different permission levels
3. WHEN an admin designates a primary teacher THEN the System SHALL ensure only one primary teacher exists per course
4. WHEN an admin sets teacher permissions THEN the System SHALL store can_manage_content, can_grade, and can_communicate flags
5. WHEN a teacher is assigned to a course THEN the System SHALL send a notification to the teacher with assignment details

### Requirement 3

**User Story:** As a teacher, I want to see only courses assigned to me, so that I can focus on managing my specific teaching responsibilities.

#### Acceptance Criteria

1. WHEN a teacher views their course list THEN the System SHALL display only courses where they have an active assignment
2. WHEN a teacher views an assigned course THEN the System SHALL display their role (Primary Teacher or Content Manager)
3. WHEN a teacher views an assigned course THEN the System SHALL display their specific permissions
4. WHEN a teacher attempts to view a non-assigned course THEN the System SHALL deny access with appropriate error message
5. WHEN a teacher's course list is empty THEN the System SHALL display a message directing them to contact an administrator

### Requirement 4

**User Story:** As a teacher, I want to manage content for my assigned courses, so that I can create engaging learning materials for my students.

#### Acceptance Criteria

1. WHEN a teacher with can_manage_content permission adds a module THEN the System SHALL save the module to the assigned course
2. WHEN a teacher with can_manage_content permission uploads a video THEN the System SHALL process and store the video for the assigned course
3. WHEN a teacher with can_manage_content permission creates a quiz THEN the System SHALL save the quiz to the assigned course
4. WHEN a teacher without can_manage_content permission attempts content changes THEN the System SHALL reject the request
5. WHEN a teacher attempts to modify course details (title, price) THEN the System SHALL reject the request regardless of permissions

### Requirement 5

**User Story:** As a teacher, I want to grade students in my assigned courses, so that I can provide feedback and track student progress.

#### Acceptance Criteria

1. WHEN a teacher with can_grade permission submits a grade THEN the System SHALL record the grade for the student
2. WHEN a teacher with can_grade permission views submissions THEN the System SHALL display all student submissions for assigned courses
3. WHEN a teacher without can_grade permission attempts to grade THEN the System SHALL reject the request
4. WHEN a teacher grades a student THEN the System SHALL record the teacher ID and timestamp
5. WHEN a teacher views the gradebook THEN the System SHALL display only students enrolled in their assigned courses

### Requirement 6

**User Story:** As a teacher, I want to communicate with students in my assigned courses, so that I can provide support and answer questions.

#### Acceptance Criteria

1. WHEN a teacher with can_communicate permission sends a message THEN the System SHALL deliver the message to enrolled students
2. WHEN a teacher with can_communicate permission creates an announcement THEN the System SHALL post the announcement to the course
3. WHEN a teacher without can_communicate permission attempts to message students THEN the System SHALL reject the request
4. WHEN a teacher views student messages THEN the System SHALL display only messages from students in assigned courses
5. WHEN a teacher creates a live class link THEN the System SHALL allow creation only for assigned courses with appropriate permissions

### Requirement 7

**User Story:** As an administrator, I want to modify teacher assignments and permissions, so that I can adapt to changing teaching needs and responsibilities.

#### Acceptance Criteria

1. WHEN an admin updates teacher permissions THEN the System SHALL apply the new permissions immediately
2. WHEN an admin removes a teacher from a course THEN the System SHALL delete the assignment and notify the teacher
3. WHEN an admin changes the primary teacher THEN the System SHALL update the primary flag and demote the previous primary teacher
4. WHEN an admin views course assignments THEN the System SHALL display all teachers assigned to the course with their permissions
5. WHEN an admin assigns a teacher already assigned to the course THEN the System SHALL reject the duplicate assignment

### Requirement 8

**User Story:** As an administrator, I want to publish and unpublish courses, so that I can control when courses become available to students.

#### Acceptance Criteria

1. WHEN an admin publishes a course THEN the System SHALL change the course status to 'published' and make it visible to students
2. WHEN an admin unpublishes a course THEN the System SHALL change the course status to 'draft' and hide it from students
3. WHEN a teacher attempts to publish a course THEN the System SHALL reject the request regardless of assignment
4. WHEN a course is published THEN the System SHALL send notifications to all enrolled students
5. WHEN a course status changes THEN the System SHALL record the admin who made the change and the timestamp

### Requirement 9

**User Story:** As an administrator, I want to delete courses, so that I can remove outdated or incorrect course content from the platform.

#### Acceptance Criteria

1. WHEN an admin deletes a course THEN the System SHALL remove the course and all associated assignments
2. WHEN an admin deletes a course THEN the System SHALL notify all assigned teachers of the deletion
3. WHEN a teacher attempts to delete a course THEN the System SHALL reject the request regardless of assignment
4. WHEN a course with enrollments is deleted THEN the System SHALL handle enrolled students according to platform policy
5. WHEN a course is deleted THEN the System SHALL maintain audit logs of the deletion

### Requirement 10

**User Story:** As a system, I want to enforce permission checks at the database level, so that security cannot be bypassed through API manipulation.

#### Acceptance Criteria

1. WHEN any user attempts to insert a course record THEN the database SHALL verify the user has admin role_level >= 4
2. WHEN any user attempts to update course basic details THEN the database SHALL verify the user has admin role_level >= 4
3. WHEN any user attempts to delete a course THEN the database SHALL verify the user has admin role_level >= 4
4. WHEN a teacher attempts to update course content THEN the database SHALL verify an active assignment with can_manage_content permission
5. WHEN permission checks fail THEN the database SHALL reject the operation and return an appropriate error

### Requirement 11

**User Story:** As a teacher, I want to receive notifications when assigned to courses, so that I am immediately aware of my new teaching responsibilities.

#### Acceptance Criteria

1. WHEN a teacher is assigned to a course THEN the System SHALL create an in-app notification
2. WHEN a teacher is assigned to a course THEN the System SHALL send an email notification with course details
3. WHEN a teacher's permissions are updated THEN the System SHALL notify the teacher of the changes
4. WHEN a teacher is removed from a course THEN the System SHALL send a notification explaining the removal
5. WHEN a teacher views notifications THEN the System SHALL display assignment details including course name and permissions

### Requirement 12

**User Story:** As an administrator, I want to view all course assignments, so that I can understand the teaching workload distribution across the platform.

#### Acceptance Criteria

1. WHEN an admin views the course assignments page THEN the System SHALL display all courses with their assigned teachers
2. WHEN an admin filters by teacher THEN the System SHALL display all courses assigned to that teacher
3. WHEN an admin filters by course THEN the System SHALL display all teachers assigned to that course
4. WHEN an admin views assignment statistics THEN the System SHALL display counts of primary teachers, content managers, and graders
5. WHEN an admin exports assignment data THEN the System SHALL generate a report with all assignment details
