# Course Assignment Permissions - Quick Reference Guide

## 🚀 Quick Start

The Course Assignment and Permission System enforces strict role-based access control where only admins can create courses, and teachers can only manage content for courses explicitly assigned to them.

## 🔑 Key Concepts

### Roles
- **Admin** (role_level >= 4): Can create courses, assign teachers, publish/unpublish, delete
- **Teacher** (role_level 1-3): Can only manage assigned courses
- **Student/Parent** (role_level 0): Read-only access to published courses

### Permissions
Each teacher assignment has three permission flags:
- `can_manage_content`: Edit lessons, modules, materials, quizzes
- `can_grade`: Grade student submissions
- `can_communicate`: Message students, create announcements

### Assignment Types
- **Primary Teacher**: Main instructor (one per course)
- **Content Manager**: Additional teachers with specific permissions

## 📚 Common Use Cases

### Admin: Create a Course
```typescript
// POST /api/admin/courses/create
{
  "title": "Introduction to React",
  "description": "Learn React fundamentals",
  "subject_id": "uuid",
  "grade_level": "Grade 10"
}
```

### Admin: Assign Teacher to Course
```typescript
// POST /api/admin/courses/[courseId]/assign-teachers
{
  "teacher_id": "uuid",
  "permissions": {
    "can_manage_content": true,
    "can_grade": true,
    "can_communicate": true,
    "is_primary_teacher": false
  }
}
```

### Admin: Update Teacher Permissions
```typescript
// PATCH /api/admin/courses/[courseId]/assign-teachers
{
  "assignment_id": "uuid",
  "permissions": {
    "can_grade": false  // Remove grading permission
  }
}
```

### Teacher: View Assigned Courses
```typescript
// GET /api/teacher/courses/assigned
// Returns only courses where teacher has an active assignment
```

### Teacher: Manage Course Content
```typescript
// PATCH /api/teacher/courses/[courseId]/content
{
  "modules": [...],
  "lessons": [...],
  "materials": [...]
}
// Note: Cannot update title, price, or status
```

## 🔒 Permission Checking

### In Code
```typescript
import { 
  canCreateCourses, 
  canManageCourseContent,
  canGradeCourse,
  canCommunicateInCourse 
} from '@/lib/permissions/coursePermissions';

// Check if user can create courses
const result = await canCreateCourses(userId);
if (result.hasPermission) {
  // Allow course creation
}

// Check if user can manage content
const contentResult = await canManageCourseContent(userId, courseId);
if (contentResult.hasPermission) {
  // Allow content editing
}
```

### In API Routes
```typescript
import { canCreateCourses } from '@/lib/permissions/coursePermissions';

export async function POST(request: Request) {
  const session = await getServerSession();
  
  // Check permission
  const permissionCheck = await canCreateCourses(session.user.id);
  if (!permissionCheck.hasPermission) {
    return NextResponse.json(
      { error: 'Only administrators can create courses' },
      { status: 403 }
    );
  }
  
  // Proceed with course creation
}
```

## 🎨 UI Components

### Admin Components
```typescript
// Teacher Assignment Component
import { TeacherAssignment } from '@/components/admin/courses/TeacherAssignment';

<TeacherAssignment 
  courseId={courseId}
  onAssignmentComplete={() => refetch()}
/>

// Assignment Table
import { AssignmentTable } from '@/components/admin/courses/AssignmentTable';

<AssignmentTable 
  courseId={courseId}
  assignments={assignments}
  onUpdate={handleUpdate}
/>
```

### Teacher Components
```typescript
// Permission Badge
import { PermissionBadge } from '@/components/teacher/courses/PermissionBadge';

<PermissionBadge 
  permission="can_manage_content"
  granted={true}
/>

// Role Badge
import { RoleBadge } from '@/components/teacher/courses/RoleBadge';

<RoleBadge isPrimary={true} />
```

## 🗄️ Database Queries

### Get User's Assigned Courses
```sql
SELECT c.*, ca.can_manage_content, ca.can_grade, ca.can_communicate
FROM courses c
JOIN course_assignments ca ON c.id = ca.course_id
WHERE ca.teacher_id = $1;
```

### Get Course Assignments
```sql
SELECT ca.*, u.full_name, u.email
FROM course_assignments ca
JOIN users u ON ca.teacher_id = u.id
WHERE ca.course_id = $1
ORDER BY ca.is_primary_teacher DESC;
```

### Check Permission
```sql
SELECT can_manage_course_content($1, $2);  -- userId, courseId
```

## 🧪 Testing

### Run Property Tests
```bash
npm test -- coursePermissions.property.test.ts
```

### Test Coverage
- Admin-only course creation: 7 properties × 100 iterations
- Assignment uniqueness: 4 properties × 100 iterations
- Single primary teacher: 5 properties × 100 iterations
- Teacher visibility: 8 properties × 100 iterations
- Access denial: 10 properties × 100 iterations

## 🚨 Common Errors

### 403 Forbidden - Insufficient Permissions
```json
{
  "error": "Forbidden",
  "message": "Only administrators can create courses",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```
**Solution**: User must be admin with role_level >= 4

### 403 Forbidden - Not Assigned
```json
{
  "error": "Forbidden",
  "message": "You are not assigned to this course",
  "code": "NOT_ASSIGNED"
}
```
**Solution**: Admin must assign teacher to course first

### 409 Conflict - Duplicate Assignment
```json
{
  "error": "Conflict",
  "message": "Teacher is already assigned to this course",
  "code": "DUPLICATE_ASSIGNMENT"
}
```
**Solution**: Update existing assignment instead of creating new one

## 📊 Monitoring

### Key Metrics to Track
- Course creation rate by admin
- Teacher assignment rate
- Permission check failures
- RLS policy violations
- API 403 error rate

### Database Functions
```sql
-- Check if user can create courses
SELECT can_create_courses('user-uuid');

-- Check if user can manage content
SELECT can_manage_course_content('user-uuid', 'course-uuid');

-- Check if user can grade
SELECT can_grade_students('user-uuid', 'course-uuid');

-- Check if user can communicate
SELECT can_communicate_with_students('user-uuid', 'course-uuid');
```

## 🔗 Related Files

### Core Files
- `lib/permissions/coursePermissions.ts` - Permission checking library
- `supabase/migrations/20250102000002_course_assignment_permissions.sql` - Database schema
- `supabase/migrations/20250102000004_course_assignment_rls_functions.sql` - RLS policies

### API Routes
- `app/api/admin/courses/create/route.ts` - Course creation
- `app/api/admin/courses/[id]/assign-teachers/route.ts` - Teacher assignment
- `app/api/teacher/courses/assigned/route.ts` - Teacher's courses
- `app/api/teacher/courses/create/route.ts` - Blocked endpoint

### UI Pages
- `app/(dashboard)/admin/courses/[id]/assign-teachers/page.tsx` - Assignment UI
- `app/(dashboard)/admin/courses/assignments/page.tsx` - Overview
- `app/(dashboard)/teacher/courses/page.tsx` - Teacher's courses

### Tests
- `lib/permissions/__tests__/coursePermissions.property.test.ts` - Property tests

## 💡 Best Practices

1. **Always check permissions** at both API and UI levels
2. **Use RLS policies** as the final enforcement layer
3. **Log permission-sensitive operations** for audit trails
4. **Test with property-based tests** for comprehensive coverage
5. **Provide clear error messages** to guide users
6. **Cache permission checks** for performance (5-minute TTL)
7. **Invalidate cache** immediately on permission updates

## 📞 Support

For issues or questions:
1. Check design document: `.kiro/specs/course-assignment-permissions/design.md`
2. Review requirements: `.kiro/specs/course-assignment-permissions/requirements.md`
3. See complete summary: `COURSE_ASSIGNMENT_PERMISSIONS_FINAL_COMPLETE.md`

---

**Last Updated**: 2025-01-02
**Version**: 1.0.0
**Status**: Production Ready ✅
