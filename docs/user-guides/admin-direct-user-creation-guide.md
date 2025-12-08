# Admin Direct User Creation Guide

## Overview

The Admin Direct User Creation feature allows administrators to create user accounts directly from the admin dashboard without redirecting to the public registration page. This streamlined workflow supports creating students, teachers, parents, and administrators with role-specific fields and automatic credential generation.

## Table of Contents

1. [Accessing the Feature](#accessing-the-feature)
2. [Creating Users](#creating-users)
3. [User Types](#user-types)
4. [Account Settings](#account-settings)
5. [Managing Credentials](#managing-credentials)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Accessing the Feature

1. Log in to the admin dashboard
2. Navigate to **Users** → **User Management**
3. Click the **Add User** button in the top right corner
4. The user creation modal will open

## Creating Users

The user creation process follows a 5-step wizard:

### Step 1: Select User Type

Choose the type of user you want to create:

- **Student**: For learners enrolling in courses
- **Teacher**: For instructors who will teach courses
- **Parent**: For guardians monitoring student progress
- **Administrator**: For staff with system management access

Click on the appropriate card to proceed.

### Step 2: Personal Information

Fill in the user's basic information:

**Required Fields:**
- First Name
- Last Name
- Email Address (must be unique)
- Mobile Number
- Date of Birth
- Gender
- Country
- City
- Address
- Postal Code

**Optional Fields:**
- WhatsApp Number
- State/Province

**Email Validation:**
- The system automatically checks if the email is already registered
- You'll see a green checkmark if the email is available
- A red error message appears if the email is already in use

### Step 3: Role-Specific Details

Depending on the user type selected, you'll see different fields:

#### For Students:
- **Student Type**: Online School or Spoken English
- **Grade Level**: Current grade (for online school students)
- **Academic Year**: Current academic year
- **English Level**: Proficiency level (for spoken English students)
- **Learning Goals**: Student's objectives
- **Learning Schedule**: Preferred schedule

#### For Teachers:
- **Qualifications**: Educational background
- **Field of Study**: Area of expertise
- **Years of Experience**: Teaching experience
- **Subjects**: Areas they can teach
- **Bio**: Professional description
- **Pre-Approval**: Check to approve immediately

#### For Parents:
- **Relationship**: Relationship to student
- **Occupation**: Parent's profession
- **Linked Students**: Connect to existing student accounts

#### For Administrators:
- **Permissions**: Select specific admin permissions
- **Department**: Admin's department
- **Access Level**: Full or Limited access

### Step 4: Account Settings

Configure the new account:

**Account Status:**
- **Active**: User can log in immediately
- **Inactive**: Account created but login disabled
- **Suspended**: Account temporarily disabled

**Verification Options:**
- **Skip Email Verification**: Allow immediate login without email confirmation
- **Send Welcome Email**: Automatically send welcome message
- **Require Password Change**: Force password change on first login

### Step 5: Review and Confirm

Review all entered information:

- All details are displayed in organized sections
- Click **Edit** next to any section to make changes
- Review the confirmation notice
- Click **Create User** to complete the process

## User Types

### Student Accounts

**Purpose**: For learners who will enroll in and complete courses

**Key Features:**
- Course enrollment
- Assignment submission
- Quiz participation
- Progress tracking
- Certificate earning

**Best For:**
- Individual learners
- School students
- Spoken English learners

### Teacher Accounts

**Purpose**: For instructors who create and teach courses

**Key Features:**
- Course creation and management
- Student grading
- Live class hosting
- Content management
- Analytics access

**Best For:**
- Subject matter experts
- Professional instructors
- Course creators

### Parent Accounts

**Purpose**: For guardians monitoring student progress

**Key Features:**
- View linked student progress
- Access performance reports
- Receive notifications
- Communicate with teachers
- Manage payments

**Best For:**
- Parents of students
- Legal guardians
- Educational supervisors

### Administrator Accounts

**Purpose**: For staff managing the platform

**Key Features:**
- User management
- Course oversight
- Payment management
- System configuration
- Analytics and reporting

**Best For:**
- School administrators
- Platform managers
- Support staff

## Account Settings

### Account Status Options

**Active:**
- User can log in immediately
- All features accessible
- Recommended for most users

**Inactive:**
- Account exists but login disabled
- Useful for pre-creating accounts
- Can be activated later

**Suspended:**
- Temporarily disabled account
- Used for disciplinary actions
- Can be reactivated

### Verification Settings

**Skip Email Verification:**
- ✅ **Enabled**: User can log in immediately
- ❌ **Disabled**: User must verify email first

**Recommendation**: Enable for admin-created accounts to avoid verification delays

**Send Welcome Email:**
- ✅ **Enabled**: Automatic welcome message sent
- ❌ **Disabled**: No welcome email

**Recommendation**: Enable for better user onboarding

**Require Password Change:**
- ✅ **Enabled**: User must change password on first login
- ❌ **Disabled**: User can keep temporary password

**Recommendation**: Always enable for security

## Managing Credentials

### After User Creation

Once a user is created successfully, you'll see:

1. **User Details**: Name, email, role, and user ID
2. **Temporary Password**: Securely generated password
3. **Action Buttons**: Copy, email, or hide password

### Sharing Credentials

**Option 1: Email Credentials**
- Click **Email Credentials to User**
- System sends secure email with login details
- Email includes security reminders
- Recommended for most cases

**Option 2: Copy and Share Manually**
- Click the **Copy** button
- Share via secure channel (phone, encrypted message)
- Use for sensitive accounts

**Option 3: Show/Hide Password**
- Click the eye icon to toggle visibility
- Useful when sharing in person

### Security Reminders

⚠️ **Important:**
- Temporary passwords should be changed immediately
- Never share passwords via insecure channels
- Don't store passwords in plain text
- Users will be required to change password on first login

## Best Practices

### Before Creating Users

1. **Verify Information**: Ensure all details are accurate
2. **Check Email**: Confirm email address is correct
3. **Choose Appropriate Role**: Select the correct user type
4. **Plan Access**: Decide on account status and permissions

### During Creation

1. **Fill All Required Fields**: Don't skip mandatory information
2. **Use Real Email Addresses**: Avoid placeholder emails
3. **Set Appropriate Status**: Choose active for immediate access
4. **Enable Verification Skip**: For admin-created accounts
5. **Review Before Submitting**: Check all details in review step

### After Creation

1. **Share Credentials Securely**: Use email or secure channel
2. **Verify User Received Info**: Confirm they got the credentials
3. **Monitor First Login**: Ensure user can access the system
4. **Provide Support**: Be available for login issues

### Security Best Practices

1. **Always Require Password Change**: Enable this setting
2. **Use Strong Temporary Passwords**: System generates secure ones
3. **Don't Reuse Passwords**: Each user gets unique password
4. **Delete Credential Emails**: After password is changed
5. **Monitor Audit Logs**: Review user creation activities

## Troubleshooting

### Common Issues

**Issue: Email Already Exists**
- **Cause**: Email is already registered
- **Solution**: Use a different email or check existing users

**Issue: Invalid Email Format**
- **Cause**: Email doesn't match required format
- **Solution**: Ensure email follows standard format (user@domain.com)

**Issue: Form Won't Submit**
- **Cause**: Missing required fields or validation errors
- **Solution**: Check for red error messages and fill all required fields

**Issue: Email Not Sent**
- **Cause**: Email service error or invalid email address
- **Solution**: Copy password manually and share via alternative method

**Issue: User Can't Log In**
- **Cause**: Account status is inactive or suspended
- **Solution**: Check account status and update if needed

### Getting Help

If you encounter issues:

1. **Check Error Messages**: Read any displayed error messages
2. **Review Form Fields**: Ensure all required fields are filled
3. **Verify Email**: Confirm email address is valid and unique
4. **Contact Support**: Reach out to technical support if issues persist

## Audit Trail

All user creation activities are logged for security and compliance:

- **Who**: Admin who created the user
- **When**: Timestamp of creation
- **What**: User type and details
- **Result**: Success or failure
- **IP Address**: Location of creation

Access audit logs in: **Admin Dashboard** → **Settings** → **Audit Logs**

## Frequently Asked Questions

**Q: Can I create multiple users at once?**
A: Currently, users must be created one at a time. Bulk import feature is planned for future release.

**Q: Can users change their email after creation?**
A: Yes, users can update their email in their profile settings.

**Q: What happens if I forget to send credentials?**
A: You can resend credentials from the user management page or reset the user's password.

**Q: Can I edit user details after creation?**
A: Yes, navigate to the user's profile in user management to edit details.

**Q: How long are temporary passwords valid?**
A: Temporary passwords don't expire, but users are required to change them on first login.

**Q: Can I create users without email addresses?**
A: No, email is required for authentication and communication.

## Related Documentation

- [User Management Guide](./user-management-guide.md)
- [Role-Based Access Control](./rbac-guide.md)
- [Security Best Practices](./security-guide.md)
- [Audit Logging](./audit-logging-guide.md)

## Support

For additional help:
- **Email**: support@st-haroon.com
- **Documentation**: [docs.st-haroon.com](https://docs.st-haroon.com)
- **Support Portal**: [support.st-haroon.com](https://support.st-haroon.com)

---

*Last Updated: January 2025*
*Version: 1.0*
