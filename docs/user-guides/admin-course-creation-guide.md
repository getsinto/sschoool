# Admin Guide: How to Create Courses and Assign Teachers

## Overview
This guide explains how administrators can create courses and assign teachers with specific permissions in the St. Haroon Online School system.

---

## Table of Contents
1. [Creating a New Course](#creating-a-new-course)
2. [Assigning Teachers to Courses](#assigning-teachers-to-courses)
3. [Managing Teacher Permissions](#managing-teacher-permissions)
4. [Monitoring Course Assignments](#monitoring-course-assignments)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Creating a New Course

### Step 1: Access Course Creation
1. Log in to your admin dashboard
2. Navigate to **Courses** in the main menu
3. Click the **Create New Course** button

### Step 2: Fill in Course Details
Complete the following required fields:

**Basic Information:**
- **Course Title**: Enter a clear, descriptive title
- **Description**: Provide a comprehensive course overview
- **Subject**: Select from available subjects
- **Grade Level**: Choose the appropriate grade level
  - Beginner
  - Intermediate
  - Advanced

**Additional Settings:**
- **Status**: Set initial status (Draft/Published)
- **Enrollment Capacity**: Maximum number of students
- **Duration**: Course length in weeks

### Step 3: Review and Create
1. Review all entered information
2. Click **Create Course**
3. You'll be redirected to the course detail page

> **Note**: Only administrators can create courses. Teachers cannot create courses but can be assigned to manage existing ones.

---

## Assigning Teachers to Courses

### Step 1: Navigate to Course
1. Go to **Courses** > **All Courses**
2. Find the course you want to assign teachers to
3. Click on the course title or **View Details**

### Step 2: Access Teacher Assignment
1. On the course detail page, click the **Assign Teachers** tab
2. Or click the **Assign Teachers** button in the top right

### Step 3: Select Teacher
1. Click **Add Teacher Assignment**
2. Search for the teacher by name or email
3. Select the teacher from the dropdown list

### Step 4: Configure Permissions
Choose the appropriate permissions for this teacher:

**Content Management Permission:**
- ✅ **Can Manage Content**: Teacher can create, edit, and delete course materials
- ❌ **Cannot Manage Content**: Teacher can only view course materials

**Grading Permission:**
- ✅ **Can Grade**: Teacher can grade assignments and quizzes
- ❌ **Cannot Grade**: Teacher can only view grades

**Communication Permission:**
- ✅ **Can Communicate**: Teacher can message students and parents
- ❌ **Cannot Communicate**: Teacher cannot send messages

**Primary Teacher Status:**
- ✅ **Primary Teacher**: Main instructor with full oversight
- ❌ **Assistant Teacher**: Supporting role with limited permissions

### Step 5: Confirm Assignment
1. Review the selected permissions
2. Click **Assign Teacher**
3. The teacher will receive an email notification

---

## Managing Teacher Permissions

### Viewing Current Assignments
1. Navigate to the course detail page
2. Click the **Assigned Teachers** tab
3. View all teachers and their current permissions

### Updating Permissions
1. Find the teacher in the assignments list
2. Click the **Edit Permissions** icon (pencil)
3. Modify the permission checkboxes
4. Click **Update Permissions**
5. The teacher will be notified of the changes

### Removing a Teacher
1. Find the teacher in the assignments list
2. Click the **Remove** icon (trash)
3. Confirm the removal in the dialog
4. The teacher will be notified of the removal

> **Warning**: Removing a teacher will revoke all their access to the course immediately.

---

## Monitoring Course Assignments

### Assignment Overview Dashboard
Access the assignment overview at **Courses** > **Teacher Assignments**

**Available Filters:**
- Filter by course
- Filter by teacher
- Filter by permission type
- Filter by assignment date

**Metrics Displayed:**
- Total courses created
- Total teacher assignments
- Average teachers per course
- Permission distribution

### Viewing Assignment History
1. Navigate to **Admin** > **Audit Logs**
2. Filter by action type: "Teacher Assignment"
3. View detailed history including:
   - Who made the assignment
   - When it was made
   - What permissions were granted
   - Any subsequent changes

---

## Best Practices

### Course Creation
✅ **Do:**
- Use clear, descriptive course titles
- Provide comprehensive course descriptions
- Set appropriate grade levels
- Start courses in "Draft" status until ready

❌ **Don't:**
- Create duplicate courses
- Leave required fields empty
- Publish courses before content is ready

### Teacher Assignment
✅ **Do:**
- Assign at least one primary teacher per course
- Grant appropriate permissions based on role
- Communicate with teachers about their assignments
- Review assignments regularly

❌ **Don't:**
- Assign too many teachers to one course
- Grant all permissions to every teacher
- Forget to notify teachers of changes
- Remove teachers without communication

### Permission Management
✅ **Do:**
- Use the principle of least privilege
- Grant "Can Manage Content" to primary teachers
- Grant "Can Grade" to teachers responsible for assessment
- Designate one primary teacher per course

❌ **Don't:**
- Grant all permissions by default
- Change permissions without notifying teachers
- Remove critical permissions during active teaching

---

## Troubleshooting

### Common Issues

**Issue: Cannot create a course**
- **Solution**: Verify you're logged in as an administrator
- **Check**: Ensure all required fields are filled
- **Contact**: System administrator if issue persists

**Issue: Teacher not appearing in assignment list**
- **Solution**: Verify the teacher account is active
- **Check**: Ensure the teacher has completed registration
- **Contact**: Check with the teacher to confirm their account status

**Issue: Teacher cannot access assigned course**
- **Solution**: Verify the assignment was saved successfully
- **Check**: Confirm the teacher has the correct permissions
- **Refresh**: Ask the teacher to log out and log back in

**Issue: Permission changes not taking effect**
- **Solution**: Clear browser cache and refresh
- **Check**: Verify the changes were saved in the audit log
- **Wait**: Changes may take a few minutes to propagate

### Getting Help

**For Technical Issues:**
- Email: support@stharoonschool.com
- Phone: [Support Number]
- Live Chat: Available in admin dashboard

**For Training:**
- Video tutorials: Available in Help Center
- Webinars: Monthly admin training sessions
- Documentation: Complete guides at docs.stharoonschool.com

---

## Quick Reference

### Permission Matrix

| Permission | Primary Teacher | Assistant Teacher | Guest Teacher |
|-----------|----------------|-------------------|---------------|
| View Content | ✅ | ✅ | ✅ |
| Manage Content | ✅ | ✅ | ❌ |
| Grade Assignments | ✅ | ✅ | ❌ |
| Communicate | ✅ | ✅ | ⚠️ Limited |
| Delete Course | ❌ | ❌ | ❌ |

> **Note**: Only administrators can delete courses.

### Keyboard Shortcuts

- `Ctrl + N`: Create new course
- `Ctrl + S`: Save course changes
- `Ctrl + F`: Search courses
- `Esc`: Close dialogs

---

## Appendix

### Related Documentation
- [Teacher Guide: Understanding Your Assigned Courses](./teacher-assigned-courses-guide.md)
- [Permission System FAQ](./permission-faq.md)
- [API Documentation](../developer-guides/api-documentation.md)

### Glossary
- **Primary Teacher**: Main instructor with full course oversight
- **Assistant Teacher**: Supporting instructor with limited permissions
- **Course Assignment**: The act of linking a teacher to a course with specific permissions
- **RLS**: Row Level Security - Database-level permission enforcement

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Feedback**: Send suggestions to docs@stharoonschool.com
