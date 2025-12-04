# Permission System FAQ

## Frequently Asked Questions About Course Assignment Permissions

---

## Table of Contents
1. [General Permission Questions](#general-permission-questions)
2. [Admin-Specific Questions](#admin-specific-questions)
3. [Teacher-Specific Questions](#teacher-specific-questions)
4. [Technical Questions](#technical-questions)
5. [Security and Privacy](#security-and-privacy)
6. [Troubleshooting](#troubleshooting)

---

## General Permission Questions

### What is the permission system?
The permission system controls who can perform specific actions in courses. It ensures that only authorized users can create courses, manage content, grade assignments, and communicate with students.

### Who can create courses?
**Only administrators** can create new courses. Teachers cannot create courses but can be assigned to manage existing courses with specific permissions.

### What are the different permission types?
There are three main permission types for teachers:
1. **Content Management** - Create, edit, and delete course materials
2. **Grading** - Grade assignments and manage the gradebook
3. **Communication** - Message students and post announcements

### Can permissions be changed after assignment?
Yes, administrators can update teacher permissions at any time. Teachers will be notified via email when their permissions change.

### How do I know what permissions I have?
Check your course dashboard. Each assigned course displays permission badges showing your capabilities:
- 🎨 Content Management
- ✏️ Grading
- 💬 Communication
- ⭐ Primary Teacher

---

## Admin-Specific Questions

### How do I assign a teacher to a course?
1. Navigate to the course detail page
2. Click "Assign Teachers"
3. Select the teacher
4. Choose their permissions
5. Click "Assign Teacher"

The teacher will receive an email notification immediately.

### Can I assign multiple teachers to one course?
Yes, you can assign multiple teachers to a single course. Each teacher can have different permissions based on their role.

### What's the difference between Primary and Assistant teachers?
- **Primary Teacher**: Main instructor, typically has all permissions, overall course responsibility
- **Assistant Teacher**: Supporting role, may have limited permissions, works under primary teacher

### Can I remove a teacher from a course?
Yes, navigate to the course's "Assigned Teachers" tab and click the remove icon next to the teacher's name. They will lose access immediately and receive a notification.

### What happens if I delete a course?
All teacher assignments are removed, and teachers are notified. Students lose access to the course. This action cannot be undone, so use with caution.

### Can I bulk assign teachers to multiple courses?
Currently, teachers must be assigned individually to each course. This ensures proper permission configuration for each assignment.

### How do I monitor teacher assignments?
Use the **Teacher Assignments Overview** dashboard at Courses > Teacher Assignments. You can filter by course, teacher, or permission type.

### Can teachers see each other's permissions?
Teachers can see who else is assigned to their courses and their roles (Primary/Assistant), but not the specific permission details of other teachers.

---

## Teacher-Specific Questions

### Why can't I create a new course?
Only administrators can create courses. If you need a new course, contact your administrator or department head.

### I'm assigned to a course but can't edit content. Why?
You don't have Content Management permission for that course. Contact the administrator to request this permission if needed for your role.

### Can I grade assignments if I'm an assistant teacher?
Only if you have Grading permission. Check your permission badges on the course page. If you need this permission, request it from the administrator.

### How do I request additional permissions?
Contact the course administrator or your department head. Explain why you need the additional permissions and they can update your assignment.

### Can I decline a course assignment?
Contact the administrator who assigned you. They can remove the assignment if you're unable to fulfill the role.

### What if I disagree with my assigned permissions?
Discuss with the administrator or department head. They can adjust permissions based on your actual responsibilities.

### Can I assign other teachers to my course?
No, only administrators can assign teachers to courses. If you need additional help, request it from your administrator.

### Will I be notified when my permissions change?
Yes, you'll receive an email notification immediately when your permissions are updated.

---

## Technical Questions

### How are permissions enforced?
Permissions are enforced at multiple levels:
1. **Application Level**: UI elements are hidden/disabled based on permissions
2. **API Level**: Server validates permissions before processing requests
3. **Database Level**: Row Level Security (RLS) policies enforce permissions

### What is Row Level Security (RLS)?
RLS is a database feature that automatically filters data based on user permissions. Even if someone bypasses the application, the database won't return unauthorized data.

### Can permissions be bypassed?
No. The multi-layer permission system (UI, API, and database) prevents unauthorized access even if one layer is compromised.

### How quickly do permission changes take effect?
Permission changes are immediate. Users may need to refresh their browser to see UI updates, but API and database permissions update instantly.

### Are permission changes logged?
Yes, all permission changes are logged in the audit log with:
- Who made the change
- When it was made
- What changed
- Previous and new values

### Can I see the audit log?
Administrators can view the complete audit log at Admin > Audit Logs. Teachers can see logs related to their own assignments.

### What happens if there's a permission conflict?
The system uses the principle of least privilege. If there's any doubt, access is denied. Contact an administrator to resolve conflicts.

### Are permissions cached?
Permissions are cached briefly (a few minutes) for performance. If changes don't appear immediately, refresh your browser or wait a few minutes.

---

## Security and Privacy

### Who can see my course assignments?
- **Administrators**: Can see all assignments
- **Primary Teachers**: Can see all teachers assigned to their courses
- **Assistant Teachers**: Can see other teachers on the same course
- **Students**: Can see their assigned teachers

### Can teachers access student data?
Teachers can only access data for students in their assigned courses. The level of access depends on their permissions:
- **With Grading**: Can see grades and submissions
- **With Communication**: Can see contact information
- **Without permissions**: Can only see basic student list

### How is sensitive data protected?
- All data is encrypted in transit (HTTPS)
- Database uses Row Level Security
- Access is logged and monitored
- Regular security audits are performed

### Can administrators see everything?
Yes, administrators have full access to all courses, assignments, and data. This is necessary for system management and support.

### What if I suspect unauthorized access?
Report immediately to:
- Email: security@stharoonschool.com
- Phone: [Security Hotline]
- Or use the "Report Security Issue" button in your dashboard

### Are passwords stored securely?
Yes, passwords are hashed using industry-standard algorithms. Even administrators cannot see your password.

### Can I use two-factor authentication?
Yes, two-factor authentication (2FA) is available and recommended for all users, especially administrators and teachers.

---

## Troubleshooting

### I can't see a course I was assigned to
**Try these steps:**
1. Log out and log back in
2. Clear your browser cache
3. Check your email for assignment notification
4. Verify with administrator that assignment was completed
5. Contact support if issue persists

### Permission badges aren't showing
**Solutions:**
1. Refresh the page (F5 or Ctrl+R)
2. Clear browser cache
3. Try a different browser
4. Check if you're logged in correctly
5. Contact support if problem continues

### I have permission but can't perform an action
**Troubleshooting:**
1. Verify you have the correct permission (check badges)
2. Refresh the page
3. Try logging out and back in
4. Check if the course is archived or deleted
5. Verify your account is active
6. Contact support with specific details

### Changes I made aren't saving
**Check these:**
1. Ensure you have the required permission
2. Check your internet connection
3. Look for error messages
4. Try again in a few minutes
5. Clear browser cache
6. Contact support if issue persists

### I received a permission error message
**What to do:**
1. Note the exact error message
2. Check your current permissions
3. Verify you're in the correct course
4. Try refreshing the page
5. Contact administrator if you believe you should have access
6. Report to support with error details

### Email notifications aren't arriving
**Solutions:**
1. Check spam/junk folder
2. Verify email address in your profile
3. Check notification settings
4. Wait a few minutes (emails may be delayed)
5. Contact support to verify email system

### Mobile app shows different permissions
**Try:**
1. Update the mobile app to latest version
2. Log out and log back in
3. Clear app cache
4. Reinstall the app if necessary
5. Use web browser as alternative

---

## Common Scenarios

### Scenario 1: New Teacher Assignment
**Q: I'm a new teacher. What should I expect?**

A: When assigned to a course:
1. You'll receive an email notification
2. Course appears in your dashboard
3. Permission badges show your capabilities
4. You can access course immediately
5. Contact primary teacher for coordination

### Scenario 2: Mid-Semester Permission Change
**Q: My permissions changed during the semester. What now?**

A: When permissions change:
1. You'll receive email notification
2. New permissions take effect immediately
3. Some features may become available/unavailable
4. Coordinate with primary teacher
5. Contact administrator if you have concerns

### Scenario 3: Multiple Course Assignments
**Q: I'm assigned to many courses with different permissions. How do I manage?**

A: Best practices:
1. Use dashboard filters to organize courses
2. Check permission badges before taking action
3. Keep track of your role in each course
4. Communicate with primary teachers
5. Request permission standardization if needed

### Scenario 4: Permission Denied Error
**Q: I got a "Permission Denied" error. What should I do?**

A: Steps to resolve:
1. Verify you have the required permission
2. Check if you're in the correct course
3. Refresh the page
4. Log out and back in
5. Contact administrator if you should have access

### Scenario 5: Temporary Permission Need
**Q: I need temporary access to grade while another teacher is away.**

A: Process:
1. Contact administrator
2. Explain the temporary need
3. Administrator grants temporary permission
4. Complete the required tasks
5. Administrator revokes permission when done

---

## Best Practices

### For Administrators
✅ **Do:**
- Grant minimum necessary permissions
- Assign at least one primary teacher per course
- Document permission decisions
- Review assignments regularly
- Communicate changes to affected teachers

❌ **Don't:**
- Grant all permissions by default
- Leave courses without primary teachers
- Change permissions without notification
- Ignore permission requests

### For Teachers
✅ **Do:**
- Check your permissions before starting work
- Request appropriate permissions for your role
- Communicate with primary teacher
- Report permission issues promptly
- Respect permission boundaries

❌ **Don't:**
- Attempt to bypass permissions
- Share account credentials
- Assume you have all permissions
- Ignore permission error messages

---

## Getting Help

### Support Channels

**For Permission Questions:**
- Email: permissions@stharoonschool.com
- Help Center: help.stharoonschool.com/permissions
- Live Chat: Available in dashboard

**For Technical Issues:**
- Email: support@stharoonschool.com
- Phone: [Support Number]
- Submit ticket: support.stharoonschool.com

**For Security Concerns:**
- Email: security@stharoonschool.com
- Phone: [Security Hotline]
- Emergency: Use "Report Security Issue" button

### Additional Resources
- [Admin Guide: Course Creation](./admin-course-creation-guide.md)
- [Teacher Guide: Assigned Courses](./teacher-assigned-courses-guide.md)
- [Video Tutorials](https://help.stharoonschool.com/videos)
- [Developer Documentation](../developer-guides/api-documentation.md)

---

## Glossary

**Administrator**: User with full system access who can create courses and assign teachers

**Assignment**: The connection between a teacher and a course with specific permissions

**Content Management Permission**: Ability to create, edit, and delete course materials

**Grading Permission**: Ability to grade assignments and manage gradebook

**Communication Permission**: Ability to message students and post announcements

**Primary Teacher**: Main instructor with overall course responsibility

**Assistant Teacher**: Supporting instructor with specific permissions

**RLS (Row Level Security)**: Database-level permission enforcement

**Audit Log**: Record of all permission-related actions and changes

**Permission Badge**: Visual indicator of user capabilities

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Feedback**: Send suggestions to docs@stharoonschool.com
