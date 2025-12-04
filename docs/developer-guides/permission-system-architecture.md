# Permission System Architecture

## Overview
This document describes the architecture of the Course Assignment Permissions system in St. Haroon Online School. The system implements a hierarchical role-based access control (RBAC) model with multi-layer enforcement.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Permission Model](#permission-model)
3. [Enforcement Layers](#enforcement-layers)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Admin UI   │  │  Teacher UI  │  │  Student UI  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │   Admin    │  │  Teacher   │  │  Student   │    │  │
│  │  │    APIs    │  │    APIs    │  │    APIs    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Permission Checking Library                   │  │
│  │  - canCreateCourse()                                  │  │
│  │  - canAssignTeachers()                                │  │
│  │  - canManageContent()                                 │  │
│  │  - canGrade()                                         │  │
│  │  - canCommunicate()                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase Client                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Row Level Security (RLS) Policies             │  │
│  │  - course_select_policy                               │  │
│  │  - course_insert_policy                               │  │
│  │  - course_update_policy                               │  │
│  │  - assignment_policies                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │  - user_profiles                                      │  │
│  │  - courses                                            │  │
│  │  - course_teacher_assignments                         │  │
│  │  - audit_logs                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Client Layer:**
- Renders UI based on user permissions
- Hides/disables features user cannot access
- Provides immediate feedback
- First line of defense (UX-focused)

**Application Layer:**
- Validates all requests
- Enforces business logic
- Checks permissions before operations
- Logs all permission-related actions
- Second line of defense (business logic)

**Data Layer:**
- Enforces permissions at database level
- Prevents unauthorized data access
- Automatic filtering based on user context
- Final line of defense (data integrity)

---

## Permission Model

### Hierarchical RBAC

The system uses a hierarchical role-based access control model with four role levels:

```
Level 4: Super Admin (role_level = 4)
   │
   ├─ Full system access
   ├─ Can create/delete courses
   ├─ Can assign/remove teachers
   └─ Can modify all permissions
   
Level 3: Admin (role_level = 3)
   │
   ├─ Can create/delete courses
   ├─ Can assign/remove teachers
   └─ Can modify permissions
   
Level 2: Teacher (role_level = 2)
   │
   ├─ Can access assigned courses
   ├─ Permissions vary by assignment:
   │  ├─ Content Management
   │  ├─ Grading
   │  └─ Communication
   └─ Cannot create courses
   
Level 1: Student (role_level = 1)
   │
   ├─ Can access enrolled courses
   ├─ Can view content
   └─ Can submit assignments
```

### Permission Types

**Course-Level Permissions:**
1. **CREATE_COURSE**: Create new courses (Admin only)
2. **DELETE_COURSE**: Delete courses (Admin only)
3. **ASSIGN_TEACHERS**: Assign teachers to courses (Admin only)
4. **MANAGE_CONTENT**: Create/edit/delete course materials
5. **GRADE**: Grade assignments and manage gradebook
6. **COMMUNICATE**: Message students and post announcements

**Permission Inheritance:**
- Super Admin inherits all Admin permissions
- Admin inherits no permissions from Teacher
- Primary Teacher typically has all three teacher permissions
- Assistant Teacher may have subset of permissions

---

## Enforcement Layers

### Layer 1: UI Enforcement

**Purpose**: Improve UX by hiding unavailable features

**Implementation**:
```typescript
// Example: Conditional rendering based on permissions
{canCreateCourse(userId) && (
  <Button onClick={handleCreateCourse}>
    Create Course
  </Button>
)}
```

**Characteristics**:
- Fast (no server round-trip)
- User-friendly
- NOT secure (can be bypassed)
- Should always be backed by server-side checks

### Layer 2: API Enforcement

**Purpose**: Enforce business logic and permissions

**Implementation**:
```typescript
// Example: API route with permission check
export async function POST(request: Request) {
  const session = await getSession();
  const userId = session.user.id;
  
  // Check permission
  const canCreate = await canCreateCourse(userId);
  if (!canCreate) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    );
  }
  
  // Proceed with operation
  // ...
}
```

**Characteristics**:
- Validates all requests
- Enforces business rules
- Logs actions
- Secure against client-side bypass

### Layer 3: Database Enforcement (RLS)

**Purpose**: Final security layer, prevents data leaks

**Implementation**:
```sql
-- Example: RLS policy for course access
CREATE POLICY "course_select_policy" ON courses
FOR SELECT
USING (
  -- Admins can see all courses
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role IN ('admin', 'super_admin')
  )
  OR
  -- Teachers can see assigned courses
  EXISTS (
    SELECT 1 FROM course_teacher_assignments
    WHERE course_teacher_assignments.course_id = courses.id
    AND course_teacher_assignments.teacher_id = auth.uid()
  )
);
```

**Characteristics**:
- Automatic enforcement
- Cannot be bypassed
- Filters data at source
- Performance impact (optimized with indexes)

---

## Database Schema

### Core Tables

#### user_profiles
```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'teacher', 'student', 'parent')),
  role_level INTEGER NOT NULL CHECK (role_level BETWEEN 1 AND 4),
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_role_level ON user_profiles(role_level);
```

#### courses
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id),
  grade_level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES user_profiles(user_id),
  created_by_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_subject_id ON courses(subject_id);
```

#### course_teacher_assignments
```sql
CREATE TABLE course_teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES user_profiles(user_id),
  can_manage_content BOOLEAN DEFAULT FALSE,
  can_grade BOOLEAN DEFAULT FALSE,
  can_communicate BOOLEAN DEFAULT TRUE,
  is_primary_teacher BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, teacher_id)
);

CREATE INDEX idx_assignments_course ON course_teacher_assignments(course_id);
CREATE INDEX idx_assignments_teacher ON course_teacher_assignments(teacher_id);
CREATE INDEX idx_assignments_primary ON course_teacher_assignments(is_primary_teacher);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### RLS Helper Functions

```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = $1
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can manage course content
CREATE OR REPLACE FUNCTION can_manage_course_content(user_id UUID, course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM course_teacher_assignments
    WHERE teacher_id = $1
    AND course_teacher_assignments.course_id = $2
    AND can_manage_content = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can grade in course
CREATE OR REPLACE FUNCTION can_grade_course(user_id UUID, course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM course_teacher_assignments
    WHERE teacher_id = $1
    AND course_teacher_assignments.course_id = $2
    AND can_grade = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## API Design

### Permission Checking Library

Location: `lib/permissions/coursePermissions.ts`

```typescript
/**
 * Check if user can create courses
 * Only admins can create courses
 */
export async function canCreateCourse(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, role_level')
    .eq('user_id', userId)
    .single();
  
  return profile?.role_level >= 3; // Admin or Super Admin
}

/**
 * Check if user can assign teachers to a course
 * Only admins can assign teachers
 */
export async function canAssignTeachers(
  userId: string,
  courseId: string
): Promise<boolean> {
  const supabase = createClient();
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, role_level')
    .eq('user_id', userId)
    .single();
  
  return profile?.role_level >= 3;
}

/**
 * Check if user can manage content in a course
 * Admins or teachers with content permission
 */
export async function canManageContent(
  userId: string,
  courseId: string
): Promise<boolean> {
  const supabase = createClient();
  
  // Check if admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role_level')
    .eq('user_id', userId)
    .single();
  
  if (profile?.role_level >= 3) return true;
  
  // Check if teacher with permission
  const { data: assignment } = await supabase
    .from('course_teacher_assignments')
    .select('can_manage_content')
    .eq('course_id', courseId)
    .eq('teacher_id', userId)
    .single();
  
  return assignment?.can_manage_content === true;
}
```

### API Endpoints

#### Create Course
```typescript
// POST /api/admin/courses/create
export async function POST(request: Request) {
  const session = await getSession();
  const userId = session.user.id;
  
  // Permission check
  if (!await canCreateCourse(userId)) {
    return NextResponse.json(
      { error: 'Only administrators can create courses' },
      { status: 403 }
    );
  }
  
  const body = await request.json();
  
  // Create course
  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      ...body,
      created_by: userId,
      created_by_role: 'admin'
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Log action
  await logAudit({
    userId,
    action: 'course_created',
    resourceType: 'course',
    resourceId: course.id,
    metadata: { title: course.title }
  });
  
  return NextResponse.json({ course }, { status: 201 });
}
```

#### Assign Teacher
```typescript
// POST /api/admin/courses/[id]/assign-teachers
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  const userId = session.user.id;
  const courseId = params.id;
  
  // Permission check
  if (!await canAssignTeachers(userId, courseId)) {
    return NextResponse.json(
      { error: 'Only administrators can assign teachers' },
      { status: 403 }
    );
  }
  
  const { teacherId, permissions } = await request.json();
  
  // Create assignment
  const { data: assignment, error } = await supabase
    .from('course_teacher_assignments')
    .insert({
      course_id: courseId,
      teacher_id: teacherId,
      assigned_by: userId,
      ...permissions
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Send notification
  await sendTeacherAssignmentEmail(teacherId, courseId, permissions);
  
  // Log action
  await logAudit({
    userId,
    action: 'teacher_assigned',
    resourceType: 'assignment',
    resourceId: assignment.id,
    metadata: { courseId, teacherId, permissions }
  });
  
  return NextResponse.json({ assignment }, { status: 201 });
}
```

---

## Security Considerations

### Defense in Depth
The system implements multiple security layers:
1. UI-level hiding (UX)
2. API-level validation (business logic)
3. Database-level enforcement (data integrity)

### Principle of Least Privilege
- Users receive minimum permissions needed
- Permissions are explicit, not implicit
- Default is deny, not allow

### Audit Logging
All permission-related actions are logged:
- Course creation/deletion
- Teacher assignments/removals
- Permission updates
- Failed permission checks

### SQL Injection Prevention
- Use parameterized queries
- Supabase client handles escaping
- RLS policies use safe functions

### CSRF Protection
- Next.js built-in CSRF protection
- API routes validate session tokens
- Same-site cookie policy

---

## Performance Optimization

### Caching Strategy
```typescript
// Cache user permissions for 5 minutes
const permissionCache = new Map<string, {
  permissions: any;
  timestamp: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedPermissions(userId: string) {
  const cached = permissionCache.get(userId);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
  }
  
  const permissions = await fetchPermissions(userId);
  permissionCache.set(userId, {
    permissions,
    timestamp: Date.now()
  });
  
  return permissions;
}
```

### Database Indexes
Critical indexes for performance:
- `user_profiles(role, role_level)`
- `courses(created_by, status)`
- `course_teacher_assignments(course_id, teacher_id)`
- `audit_logs(user_id, created_at)`

### Query Optimization
- Use selective queries (only fetch needed columns)
- Batch operations when possible
- Use database functions for complex checks
- Implement pagination for large result sets

---

## Testing Strategy

### Unit Tests
Test individual permission functions:
```typescript
describe('canCreateCourse', () => {
  it('returns true for admin users', async () => {
    const result = await canCreateCourse(adminUserId);
    expect(result).toBe(true);
  });
  
  it('returns false for teacher users', async () => {
    const result = await canCreateCourse(teacherUserId);
    expect(result).toBe(false);
  });
});
```

### Integration Tests
Test complete workflows:
```typescript
describe('Course Creation Workflow', () => {
  it('allows admin to create course and assign teacher', async () => {
    // Create course as admin
    const course = await createCourse(adminUserId, courseData);
    expect(course).toBeDefined();
    
    // Assign teacher
    const assignment = await assignTeacher(
      adminUserId,
      course.id,
      teacherId,
      permissions
    );
    expect(assignment).toBeDefined();
    
    // Verify teacher can access
    const canAccess = await canAccessCourse(teacherId, course.id);
    expect(canAccess).toBe(true);
  });
});
```

### RLS Policy Tests
Test database-level enforcement:
```sql
-- Test admin can see all courses
SELECT set_config('request.jwt.claims', '{"sub": "admin-user-id"}', true);
SELECT COUNT(*) FROM courses; -- Should return all courses

-- Test teacher can only see assigned courses
SELECT set_config('request.jwt.claims', '{"sub": "teacher-user-id"}', true);
SELECT COUNT(*) FROM courses; -- Should return only assigned courses
```

---

## Deployment Considerations

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Migration Strategy
1. Run database migrations in order
2. Test RLS policies in staging
3. Verify permission checks work correctly
4. Monitor audit logs after deployment

### Monitoring
- Track permission check failures
- Monitor RLS policy performance
- Alert on unusual permission patterns
- Review audit logs regularly

---

## Related Documentation
- [API Documentation](./api-documentation.md)
- [Database Schema](./database-schema.md)
- [Testing Guidelines](./testing-guidelines.md)
- [Admin Guide](../user-guides/admin-course-creation-guide.md)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team
