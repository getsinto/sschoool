# Design Document

## Overview

The Course Assignment and Permission System implements a hierarchical role-based access control (RBAC) model that strictly separates course creation privileges (admin-only) from course content management (assigned teachers). The system uses database-level enforcement through Row Level Security (RLS) policies, a dedicated course_assignments junction table, and comprehensive permission checking functions to ensure security cannot be bypassed.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Admin UI     │  │ Teacher UI   │  │ Student UI   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Admin Routes │  │ Teacher      │  │ Student      │      │
│  │ /api/admin/  │  │ Routes       │  │ Routes       │      │
│  │ courses      │  │ /api/teacher/│  │ /api/student/│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Permission Layer                                │
│  ┌──────────────────────────────────────────────────┐       │
│  │  lib/permissions/coursePermissions.ts            │       │
│  │  - canCreateCourse()                             │       │
│  │  - canManageCourseContent()                      │       │
│  │  - canAssignTeachers()                           │       │
│  │  - canPublishCourse()                            │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database Layer (Supabase)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ users        │  │ courses      │  │ course_      │      │
│  │ - role       │  │ - created_by │  │ assignments  │      │
│  │ - role_level │  │ - status     │  │ - teacher_id │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  RLS Policies (Database-Level Security)          │       │
│  │  - Only admins can INSERT courses                │       │
│  │  - Only admins can UPDATE course details         │       │
│  │  - Only assigned teachers can UPDATE content     │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Security Layers

The system implements defense-in-depth with three security layers:

1. **UI Layer**: Conditional rendering based on user role
2. **API Layer**: Permission checks before processing requests
3. **Database Layer**: RLS policies that enforce permissions at data level

## Components and Interfaces

### 1. Database Schema

#### users table (modifications)
```sql
ALTER TABLE users ADD COLUMN role_level INTEGER DEFAULT 1;
/*
  5: Super Admin (full access)
  4: Admin (full access)
  3: Senior Teacher (manage assigned courses only)
  2: Course Teacher (manage assigned courses only)
  1: Tuition Teacher (manage assigned courses only)
  0: Student, Parent (no course management)
*/
```

#### teachers table (modifications)
```sql
ALTER TABLE teachers ADD COLUMN teacher_type TEXT;
-- Values: 'senior_teacher', 'course_teacher', 'tuition_teacher'
```

#### courses table (modifications)
```sql
ALTER TABLE courses 
  ADD COLUMN created_by UUID REFERENCES users(id) NOT NULL,
  ADD COLUMN created_by_role TEXT NOT NULL;
-- created_by_role: 'super_admin' or 'admin'
```

#### course_assignments table (new)
```sql
CREATE TABLE course_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES users(id) NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  can_manage_content BOOLEAN DEFAULT TRUE,
  can_grade BOOLEAN DEFAULT TRUE,
  can_communicate BOOLEAN DEFAULT TRUE,
  is_primary_teacher BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, teacher_id)
);

CREATE INDEX idx_course_assignments_course ON course_assignments(course_id);
CREATE INDEX idx_course_assignments_teacher ON course_assignments(teacher_id);
CREATE INDEX idx_course_assignments_primary ON course_assignments(course_id, is_primary_teacher) 
  WHERE is_primary_teacher = TRUE;
```

### 2. Permission Functions

#### lib/permissions/coursePermissions.ts

```typescript
export interface User {
  id: string;
  role: string;
  role_level?: number;
  email?: string;
}

export interface CourseAssignment {
  id: string;
  course_id: string;
  teacher_id: string;
  assigned_by: string;
  can_manage_content: boolean;
  can_grade: boolean;
  can_communicate: boolean;
  is_primary_teacher: boolean;
  assigned_at: string;
}

// Core permission functions
export function canCreateCourse(user: User): boolean;
export function canEditCourseDetails(user: User): boolean;
export async function canManageCourseContent(user: User, courseId: string): Promise<boolean>;
export function canPublishCourse(user: User): boolean;
export function canDeleteCourse(user: User): boolean;
export function canAssignTeachers(user: User): boolean;
export async function canGradeStudents(user: User, courseId: string): Promise<boolean>;
export async function canCommunicateWithStudents(user: User, courseId: string): Promise<boolean>;

// Assignment management functions
export async function getUserAssignedCourses(userId: string): Promise<any[]>;
export async function getCourseAssignments(courseId: string): Promise<CourseAssignment[]>;
export async function assignTeacherToCourse(
  adminUser: User,
  courseId: string,
  teacherId: string,
  permissions: object
): Promise<{ success: boolean; error?: string }>;
export async function removeTeacherFromCourse(
  adminUser: User,
  courseId: string,
  teacherId: string
): Promise<{ success: boolean; error?: string }>;
export async function updateTeacherPermissions(
  adminUser: User,
  assignmentId: string,
  permissions: object
): Promise<{ success: boolean; error?: string }>;
```

### 3. API Routes

#### Admin Routes

**POST /api/admin/courses/create**
- Creates new course (admin only)
- Records creator information
- Optionally assigns teachers during creation
- Returns course with assignment details

**GET /api/admin/courses/[id]/assign-teachers**
- Fetches current assignments
- Lists available teachers
- Returns assignment statistics

**POST /api/admin/courses/[id]/assign-teachers**
- Assigns one or more teachers to course
- Sets permissions for each teacher
- Sends notifications to assigned teachers

**PATCH /api/admin/courses/[id]/assign-teachers**
- Updates teacher permissions
- Modifies primary teacher designation

**DELETE /api/admin/courses/[id]/assign-teachers**
- Removes teacher from course
- Sends removal notification

#### Teacher Routes

**GET /api/teacher/courses/assigned**
- Returns only courses assigned to teacher
- Includes assignment details and permissions
- Provides course statistics

**GET /api/teacher/courses/[id]/content**
- Fetches course content for assigned course
- Returns user's specific permissions
- Denies access if not assigned

**PATCH /api/teacher/courses/[id]/content**
- Updates course content (modules, lessons, materials)
- Blocks updates to course details (title, price, etc.)
- Validates assignment and permissions

**POST /api/teacher/courses/[id]/content**
- Adds new content items (lessons, quizzes, etc.)
- Records creator information
- Validates assignment and permissions

**POST /api/teacher/courses/create** (BLOCKED)
- Returns 403 Forbidden
- Provides helpful error message
- Redirects to assigned courses

### 4. UI Components

#### Admin Components

**components/admin/courses/TeacherAssignment.tsx**
- Teacher search and filter
- Multi-select teacher cards
- Permission toggles per teacher
- Primary teacher selector
- Assignment confirmation

**components/admin/courses/AssignmentTable.tsx**
- Current assignments display
- Permission badges
- Edit/Remove actions
- Primary teacher indicator

#### Teacher Components

**components/teacher/courses/AssignedCoursesList.tsx**
- Displays only assigned courses
- Shows role (Primary/Content Manager)
- Permission indicators
- "Manage Content" action button

**components/teacher/courses/ContentEditor.tsx**
- Module/Lesson management
- Video/Document uploads
- Quiz/Assignment creation
- Read-only course details section

**components/teacher/courses/PermissionBadge.tsx**
- Visual permission indicators
- Tooltip with permission details
- Color-coded by permission type

## Data Models

### User Model (Extended)
```typescript
interface User {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  role_level: number; // 0-5
  created_at: string;
  updated_at: string;
}
```

### Course Model (Extended)
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  price: number;
  currency: string;
  status: 'draft' | 'published' | 'archived';
  created_by: string; // User ID
  created_by_role: 'super_admin' | 'admin';
  created_at: string;
  updated_at: string;
  
  // Content fields (teacher-editable)
  modules?: any[];
  lessons?: any[];
  materials?: any[];
  resources?: any[];
  quizzes?: any[];
  assignments?: any[];
}
```

### CourseAssignment Model
```typescript
interface CourseAssignment {
  id: string;
  course_id: string;
  teacher_id: string;
  assigned_by: string; // Admin user ID
  assigned_at: string;
  can_manage_content: boolean;
  can_grade: boolean;
  can_communicate: boolean;
  is_primary_teacher: boolean;
  created_at: string;
  updated_at: string;
}
```

### Teacher Model (Extended)
```typescript
interface Teacher {
  id: string;
  user_id: string;
  teacher_type: 'senior_teacher' | 'course_teacher' | 'tuition_teacher';
  subjects: string[];
  experience_years: number;
  bio?: string;
  created_at: string;
  updated_at: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Admin-only course creation
*For any* user attempting to create a course, the operation should succeed if and only if the user has role='admin' AND role_level >= 4
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Course creator tracking
*For any* successfully created course, the created_by field should equal the creating admin's user ID AND created_by_role should match their role level
**Validates: Requirements 1.4**

### Property 3: Assignment uniqueness
*For any* course and teacher pair, at most one course_assignment record should exist
**Validates: Requirements 2.1, 7.5**

### Property 4: Single primary teacher
*For any* course, at most one course_assignment should have is_primary_teacher = TRUE
**Validates: Requirements 2.3**

### Property 5: Assignment notification delivery
*For any* new course_assignment record, a notification should be created for the assigned teacher
**Validates: Requirements 2.5, 11.1, 11.2**

### Property 6: Teacher course visibility
*For any* teacher viewing their course list, all returned courses should have an active assignment for that teacher
**Validates: Requirements 3.1, 3.2**

### Property 7: Non-assigned course access denial
*For any* teacher attempting to access a course without an assignment, the system should return a 403 Forbidden error
**Validates: Requirements 3.4**

### Property 8: Content management permission enforcement
*For any* teacher attempting to modify course content, the operation should succeed if and only if they have an active assignment with can_manage_content = TRUE
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 9: Course details immutability for teachers
*For any* teacher attempting to modify course details (title, price, status), the operation should fail regardless of their assignment permissions
**Validates: Requirements 4.5**

### Property 10: Grading permission enforcement
*For any* teacher attempting to grade a student, the operation should succeed if and only if they have an active assignment with can_grade = TRUE
**Validates: Requirements 5.1, 5.3**

### Property 11: Communication permission enforcement
*For any* teacher attempting to message students, the operation should succeed if and only if they have an active assignment with can_communicate = TRUE
**Validates: Requirements 6.1, 6.3**

### Property 12: Permission update immediacy
*For any* permission update on a course_assignment, subsequent permission checks should reflect the new permissions immediately
**Validates: Requirements 7.1**

### Property 13: Assignment removal notification
*For any* deleted course_assignment record, a notification should be sent to the removed teacher
**Validates: Requirements 7.2**

### Property 14: Admin-only publishing
*For any* user attempting to publish or unpublish a course, the operation should succeed if and only if the user has role='admin' AND role_level >= 4
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 15: Admin-only deletion
*For any* user attempting to delete a course, the operation should succeed if and only if the user has role='admin' AND role_level >= 4
**Validates: Requirements 9.1, 9.3**

### Property 16: Cascade deletion of assignments
*For any* deleted course, all associated course_assignment records should also be deleted
**Validates: Requirements 9.1**

### Property 17: Database-level course creation enforcement
*For any* INSERT operation on the courses table, the database should verify the user has role_level >= 4 before allowing the operation
**Validates: Requirements 10.1**

### Property 18: Database-level content update enforcement
*For any* UPDATE operation on course content fields, the database should verify an active assignment with appropriate permissions
**Validates: Requirements 10.4**

### Property 19: Assignment visibility for admins
*For any* admin viewing course assignments, all assignments across all courses should be visible
**Validates: Requirements 12.1, 12.2, 12.3**

### Property 20: Teacher workload calculation accuracy
*For any* teacher, the count of assigned courses should equal the number of course_assignment records for that teacher
**Validates: Requirements 12.4**

## Error Handling

### Permission Errors

**403 Forbidden - Insufficient Permissions**
```json
{
  "error": "Forbidden",
  "message": "Only administrators can create courses",
  "code": "INSUFFICIENT_PERMISSIONS",
  "required_role": "admin",
  "required_level": 4,
  "user_role": "teacher",
  "user_level": 2
}
```

**403 Forbidden - Not Assigned**
```json
{
  "error": "Forbidden",
  "message": "You are not assigned to this course",
  "code": "NOT_ASSIGNED",
  "course_id": "uuid",
  "action": "Contact an administrator to request course assignment"
}
```

### Assignment Errors

**409 Conflict - Duplicate Assignment**
```json
{
  "error": "Conflict",
  "message": "Teacher is already assigned to this course",
  "code": "DUPLICATE_ASSIGNMENT",
  "existing_assignment_id": "uuid"
}
```

**400 Bad Request - Invalid Permission Combination**
```json
{
  "error": "Bad Request",
  "message": "Cannot set is_primary_teacher without can_manage_content",
  "code": "INVALID_PERMISSIONS"
}
```

### Database Errors

**RLS Policy Violation**
```json
{
  "error": "Database Error",
  "message": "Row level security policy violation",
  "code": "RLS_VIOLATION",
  "hint": "User does not have permission to perform this operation"
}
```

## Testing Strategy

### Unit Testing

Unit tests will cover:
- Permission function logic (canCreateCourse, canManageCourseContent, etc.)
- Assignment creation and validation
- Error handling for invalid inputs
- Edge cases (null users, missing assignments, etc.)

**Testing Framework**: Jest with TypeScript

**Example Unit Tests**:
```typescript
describe('canCreateCourse', () => {
  it('should return true for admin with role_level 4', () => {
    const user = { id: '1', role: 'admin', role_level: 4 };
    expect(canCreateCourse(user)).toBe(true);
  });
  
  it('should return false for teacher regardless of role_level', () => {
    const user = { id: '1', role: 'teacher', role_level: 5 };
    expect(canCreateCourse(user)).toBe(false);
  });
});
```

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** library.

**Configuration**: Each property test will run a minimum of 100 iterations.

**Property Test Examples**:

```typescript
// Property 1: Admin-only course creation
/**
 * Feature: course-assignment-permissions, Property 1: Admin-only course creation
 * Validates: Requirements 1.1, 1.2, 1.3
 */
test('Property 1: Only admins with role_level >= 4 can create courses', () => {
  fc.assert(
    fc.property(
      fc.record({
        id: fc.uuid(),
        role: fc.constantFrom('admin', 'teacher', 'student', 'parent'),
        role_level: fc.integer({ min: 0, max: 5 })
      }),
      (user) => {
        const canCreate = canCreateCourse(user);
        const shouldCreate = user.role === 'admin' && user.role_level >= 4;
        return canCreate === shouldCreate;
      }
    ),
    { numRuns: 100 }
  );
});

// Property 3: Assignment uniqueness
/**
 * Feature: course-assignment-permissions, Property 3: Assignment uniqueness
 * Validates: Requirements 2.1, 7.5
 */
test('Property 3: Each teacher-course pair has at most one assignment', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.uuid(), // courseId
      fc.uuid(), // teacherId
      async (courseId, teacherId) => {
        const assignments = await getCourseAssignments(courseId);
        const teacherAssignments = assignments.filter(a => a.teacher_id === teacherId);
        return teacherAssignments.length <= 1;
      }
    ),
    { numRuns: 100 }
  );
});

// Property 4: Single primary teacher
/**
 * Feature: course-assignment-permissions, Property 4: Single primary teacher
 * Validates: Requirements 2.3
 */
test('Property 4: Each course has at most one primary teacher', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.uuid(), // courseId
      async (courseId) => {
        const assignments = await getCourseAssignments(courseId);
        const primaryTeachers = assignments.filter(a => a.is_primary_teacher);
        return primaryTeachers.length <= 1;
      }
    ),
    { numRuns: 100 }
  );
});

// Property 8: Content management permission enforcement
/**
 * Feature: course-assignment-permissions, Property 8: Content management permission enforcement
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 */
test('Property 8: Content updates require can_manage_content permission', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.record({
        id: fc.uuid(),
        role: fc.constant('teacher'),
        role_level: fc.integer({ min: 1, max: 3 })
      }),
      fc.uuid(), // courseId
      fc.boolean(), // has assignment
      fc.boolean(), // can_manage_content
      async (user, courseId, hasAssignment, canManageContent) => {
        // Mock assignment
        if (hasAssignment) {
          await mockAssignment(user.id, courseId, canManageContent);
        }
        
        const canManage = await canManageCourseContent(user, courseId);
        return canManage === (hasAssignment && canManageContent);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify:
- Complete API request/response cycles
- Database RLS policy enforcement
- Notification delivery on assignments
- Multi-step workflows (create course → assign teacher → manage content)

**Testing Framework**: Supertest with Jest

### Database Testing

Database tests will verify:
- RLS policies block unauthorized operations
- Triggers fire correctly (primary teacher enforcement, notifications)
- Cascade deletions work properly
- Indexes improve query performance

**Testing Framework**: Supabase Test Helpers

## Performance Considerations

### Database Indexes

- `idx_course_assignments_course`: Fast lookup of teachers for a course
- `idx_course_assignments_teacher`: Fast lookup of courses for a teacher
- `idx_course_assignments_primary`: Fast lookup of primary teacher

### Caching Strategy

- Cache user permissions for 5 minutes (reduces database queries)
- Invalidate cache on permission updates
- Cache course assignments per course (reduces joins)

### Query Optimization

- Use `SELECT` with specific columns instead of `SELECT *`
- Batch assignment operations when assigning multiple teachers
- Use database functions for complex permission checks

## Security Considerations

### Defense in Depth

1. **UI Layer**: Hide unauthorized actions
2. **API Layer**: Validate permissions before processing
3. **Database Layer**: RLS policies as final enforcement

### Audit Logging

All permission-sensitive operations should be logged:
- Course creation (who, when, what)
- Teacher assignments (who assigned whom, when)
- Permission changes (what changed, who changed it)
- Course deletions (who deleted, when)

### Rate Limiting

- Limit course creation to 10 per hour per admin
- Limit teacher assignments to 50 per hour per admin
- Limit permission updates to 100 per hour per admin

## Migration Strategy

### Phase 1: Database Schema
1. Add role_level column to users table
2. Add teacher_type column to teachers table
3. Add created_by and created_by_role to courses table
4. Create course_assignments table
5. Create indexes

### Phase 2: Data Migration
1. Set role_level for existing users based on role
2. Set teacher_type for existing teachers
3. Set created_by for existing courses (default to first admin)
4. Create initial assignments for existing teacher-course relationships

### Phase 3: RLS Policies
1. Create RLS policies for courses table
2. Create RLS policies for course_assignments table
3. Test policies with various user roles

### Phase 4: Application Code
1. Implement permission functions
2. Update API routes with permission checks
3. Block teacher course creation endpoint
4. Create admin assignment management endpoints

### Phase 5: UI Updates
1. Update admin UI with assignment management
2. Update teacher UI to show only assigned courses
3. Remove course creation from teacher UI
4. Add permission indicators throughout

### Phase 6: Testing & Deployment
1. Run all unit tests
2. Run all property-based tests
3. Run integration tests
4. Deploy to staging
5. User acceptance testing
6. Deploy to production

## Rollback Plan

If issues arise:
1. Disable new RLS policies (revert to old policies)
2. Re-enable teacher course creation endpoint
3. Hide assignment management UI
4. Investigate and fix issues
5. Re-deploy with fixes

## Monitoring & Alerts

### Metrics to Track
- Course creation rate by admin
- Teacher assignment rate
- Permission check failures
- RLS policy violations
- API 403 error rate

### Alerts
- Alert if RLS violations exceed 10 per hour
- Alert if permission check failures exceed 5% of requests
- Alert if course creation fails for admins
- Alert if teacher assignment operations fail

## Documentation Requirements

### Developer Documentation
- Permission system architecture
- API endpoint specifications
- Database schema documentation
- Testing guidelines

### User Documentation
- Admin guide: How to create courses and assign teachers
- Teacher guide: Understanding assigned courses and permissions
- FAQ: Common permission-related questions

### API Documentation
- OpenAPI/Swagger specifications for all endpoints
- Permission requirements for each endpoint
- Error response formats
- Example requests and responses
