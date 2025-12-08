# Design Document: Admin Direct User Creation

## Overview

This feature enables administrators to create user accounts directly from the admin dashboard through a modal interface, eliminating the need to redirect to the public registration page. The system will provide a streamlined workflow for creating users of all types (student, teacher, parent, admin) with role-specific fields, validation, and automatic credential generation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard UI                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         User Management Page                          │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │     User Creation Modal (Multi-Step Form)      │  │  │
│  │  │  1. User Type Selection                        │  │  │
│  │  │  2. Personal Information                       │  │  │
│  │  │  3. Role-Specific Details                      │  │  │
│  │  │  4. Account Settings                           │  │  │
│  │  │  5. Review & Confirm                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
│  POST /api/admin/users/create                               │
│  - Validation                                                │
│  - Duplicate checking                                        │
│  - Password generation                                       │
│  - User creation                                             │
│  - Profile creation                                          │
│  - Audit logging                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database Layer                              │
│  - Supabase Auth (auth.users)                               │
│  - User Profiles (public.users)                             │
│  - Role-Specific Tables (teachers, students, parents)       │
│  - Audit Logs (audit_logs)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```
components/admin/users/
├── CreateUserModal.tsx          # Main modal container
├── UserTypeSelector.tsx         # Step 1: User type selection
├── PersonalInfoForm.tsx         # Step 2: Personal information
├── RoleSpecificForm.tsx         # Step 3: Role-specific fields
│   ├── StudentFields.tsx
│   ├── TeacherFields.tsx
│   ├── ParentFields.tsx
│   └── AdminFields.tsx
├── AccountSettingsForm.tsx      # Step 4: Account settings
├── ReviewStep.tsx               # Step 5: Review and confirm
└── PasswordDisplay.tsx          # Success: Display generated password
```

## Components and Interfaces

### 1. CreateUserModal Component

**Purpose**: Main container for the user creation workflow

**Props**:
```typescript
interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: CreatedUser) => void
}
```

**State Management**:
```typescript
interface CreateUserState {
  currentStep: number
  userType: UserRole | null
  formData: Partial<UserCreationData>
  errors: Record<string, string>
  isSubmitting: boolean
  generatedPassword: string | null
}
```

**Features**:
- Multi-step form navigation
- Progress indicator
- Form state persistence
- Error handling
- Success confirmation

### 2. UserTypeSelector Component

**Purpose**: Allow admin to select the type of user to create

**Interface**:
```typescript
interface UserTypeOption {
  value: UserRole
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

const userTypes: UserTypeOption[] = [
  {
    value: 'student',
    label: 'Student',
    description: 'Create a student account for course enrollment',
    icon: <GraduationCap />,
    color: 'blue'
  },
  {
    value: 'teacher',
    label: 'Teacher',
    description: 'Create a teacher account for course instruction',
    icon: <BookOpen />,
    color: 'green'
  },
  {
    value: 'parent',
    label: 'Parent',
    description: 'Create a parent account for student monitoring',
    icon: <Users />,
    color: 'purple'
  },
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Create an admin account with full system access',
    icon: <Shield />,
    color: 'red'
  }
]
```

### 3. PersonalInfoForm Component

**Purpose**: Collect basic personal information

**Fields**:
```typescript
interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  whatsappNumber?: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  country: string
  state?: string
  city: string
  address: string
  postalCode: string
}
```

**Validation Rules**:
- Email: Valid format, real-time duplicate check
- Mobile: Valid phone number format
- Date of Birth: Valid date, age restrictions based on user type
- All required fields must be filled

### 4. RoleSpecificForm Component

**Purpose**: Collect role-specific information based on user type

#### Student Fields
```typescript
interface StudentSpecificData {
  studentType: 'online_school' | 'spoken_english'
  gradeLevel?: string
  previousSchool?: string
  academicYear?: string
  englishLevel?: string
  purpose?: string
  learningSchedule?: string
  parentId?: string // Optional link to parent
}
```

#### Teacher Fields
```typescript
interface TeacherSpecificData {
  qualifications: string
  fieldOfStudy: string
  experienceYears: number
  subjects: string[]
  bio: string
  resumeUrl?: string
  isApproved: boolean // Admin can pre-approve
}
```

#### Parent Fields
```typescript
interface ParentSpecificData {
  relationship: string
  occupation?: string
  linkedStudents?: string[] // Can link existing students
}
```

#### Admin Fields
```typescript
interface AdminSpecificData {
  permissions: string[]
  department?: string
  accessLevel: 'full' | 'limited'
}
```

### 5. AccountSettingsForm Component

**Purpose**: Configure account status and verification

**Fields**:
```typescript
interface AccountSettings {
  accountStatus: 'active' | 'inactive' | 'suspended'
  isVerified: boolean
  skipEmailVerification: boolean
  sendWelcomeEmail: boolean
  sendCredentialsEmail: boolean
  requirePasswordChange: boolean
}
```

### 6. ReviewStep Component

**Purpose**: Display all entered information for final review

**Features**:
- Organized display of all form data
- Edit buttons for each section
- Clear visual hierarchy
- Confirmation checkbox

### 7. PasswordDisplay Component

**Purpose**: Display generated temporary password after successful creation

**Features**:
- Large, readable password display
- Copy to clipboard button
- Email credentials button
- Security reminder
- Option to create another user

## Data Models

### UserCreationData Interface

```typescript
interface UserCreationData {
  // Personal Information
  personalInfo: PersonalInfo
  
  // Role-specific data
  roleSpecific: StudentSpecificData | TeacherSpecificData | ParentSpecificData | AdminSpecificData
  
  // Account settings
  accountSettings: AccountSettings
  
  // Metadata
  userType: UserRole
  createdBy: string
  createdAt: string
}
```

### CreatedUser Response

```typescript
interface CreatedUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  temporaryPassword: string
  accountStatus: string
  isVerified: boolean
  createdAt: string
}
```

### API Request/Response

**Request**: `POST /api/admin/users/create`
```typescript
{
  userType: UserRole
  personalInfo: PersonalInfo
  roleSpecific: RoleSpecificData
  accountSettings: AccountSettings
}
```

**Success Response**: `201 Created`
```typescript
{
  success: true
  message: "User created successfully"
  user: CreatedUser
  temporaryPassword: string
}
```

**Error Response**: `400/409/500`
```typescript
{
  success: false
  error: string
  details?: Record<string, string>
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Modal display triggers correctly
*For any* admin user action to add a user, clicking the "Add User" button should display the user creation modal within the dashboard without navigation
**Validates: Requirements 1.1**

### Property 2: Form completeness validation
*For any* user creation attempt, all required fields for the selected user type must be filled before submission is allowed
**Validates: Requirements 3.3**

### Property 3: Email uniqueness enforcement
*For any* email address entered, if the email already exists in the system, the form should prevent submission and display an error
**Validates: Requirements 3.2**

### Property 4: Role-specific field display
*For any* user type selection, the form should display only the fields relevant to that specific role
**Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 5: Password generation security
*For any* successful user creation, the system should generate a secure random password meeting minimum security requirements (8+ characters, mixed case, numbers, special characters)
**Validates: Requirements 5.1**

### Property 6: Account status application
*For any* user created with a specific account status, that user's account should immediately reflect the chosen status (active, inactive, or suspended)
**Validates: Requirements 4.1, 4.4**

### Property 7: Verification bypass
*For any* user created with the "verified" flag set, the user should be able to log in without email verification
**Validates: Requirements 4.2, 4.3**

### Property 8: User list refresh
*For any* successful user creation, the user management list should update to include the newly created user
**Validates: Requirements 1.5**

### Property 9: Audit log creation
*For any* user creation attempt (successful or failed), an audit log entry should be created with admin identifier, timestamp, and action details
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 10: Form validation real-time
*For any* field with validation rules, entering invalid data should trigger immediate feedback without form submission
**Validates: Requirements 3.1, 3.4**

## Error Handling

### Validation Errors

```typescript
interface ValidationError {
  field: string
  message: string
  code: string
}

// Example validation errors
const validationErrors = {
  EMAIL_INVALID: 'Please enter a valid email address',
  EMAIL_EXISTS: 'This email is already registered',
  PHONE_INVALID: 'Please enter a valid phone number',
  PASSWORD_WEAK: 'Password must be at least 8 characters',
  REQUIRED_FIELD: 'This field is required',
  AGE_RESTRICTION: 'User must be at least 13 years old'
}
```

### API Errors

```typescript
enum ErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

interface APIError {
  code: ErrorCode
  message: string
  details?: Record<string, any>
  timestamp: string
}
```

### Error Recovery

1. **Network Errors**: Retry mechanism with exponential backoff
2. **Validation Errors**: Highlight specific fields, allow correction
3. **Duplicate Email**: Suggest viewing existing user or using different email
4. **Database Errors**: Log error, show generic message, notify admin
5. **Permission Errors**: Redirect to login or show access denied

## Testing Strategy

### Unit Tests

1. **Form Validation Tests**
   - Test email format validation
   - Test phone number validation
   - Test required field validation
   - Test age restriction validation
   - Test password strength validation

2. **Component Tests**
   - Test modal open/close behavior
   - Test step navigation
   - Test form state persistence
   - Test error display
   - Test success confirmation

3. **API Tests**
   - Test user creation endpoint
   - Test duplicate email detection
   - Test password generation
   - Test audit logging
   - Test error responses

### Property-Based Tests

1. **Property Test: Email Uniqueness**
   - Generate random valid user data
   - Create user with email
   - Attempt to create another user with same email
   - Verify second attempt fails with duplicate error
   - **Feature: admin-direct-user-creation, Property 3: Email uniqueness enforcement**

2. **Property Test: Password Security**
   - Generate random user data
   - Create user
   - Verify generated password meets security requirements
   - Verify password is different for each user
   - **Feature: admin-direct-user-creation, Property 5: Password generation security**

3. **Property Test: Role-Specific Fields**
   - For each user type, generate random valid data
   - Create user
   - Verify role-specific table has correct data
   - Verify no data leaks to other role tables
   - **Feature: admin-direct-user-creation, Property 4: Role-specific field display**

4. **Property Test: Account Status**
   - Generate random user data with random status
   - Create user
   - Verify user's account status matches requested status
   - Verify login behavior matches status
   - **Feature: admin-direct-user-creation, Property 6: Account status application**

5. **Property Test: Audit Logging**
   - Generate random user data
   - Create user
   - Verify audit log entry exists
   - Verify audit log contains correct admin ID and timestamp
   - **Feature: admin-direct-user-creation, Property 9: Audit log creation**

### Integration Tests

1. **End-to-End User Creation Flow**
   - Open modal
   - Select user type
   - Fill all forms
   - Review and submit
   - Verify user created in database
   - Verify email sent (if enabled)
   - Verify audit log created

2. **Multi-User Creation**
   - Create multiple users in sequence
   - Verify all users created correctly
   - Verify no data mixing between users

3. **Error Recovery**
   - Simulate network failure
   - Verify retry mechanism
   - Verify form state preserved

## Security Considerations

### Authentication & Authorization

- Only authenticated admins can access user creation
- Verify admin role before allowing user creation
- Log all user creation attempts

### Data Validation

- Server-side validation for all inputs
- Sanitize all user inputs
- Prevent SQL injection
- Prevent XSS attacks

### Password Security

- Generate cryptographically secure random passwords
- Use bcrypt for password hashing
- Never log or store plain-text passwords
- Enforce password change on first login

### Audit Trail

- Log all user creation events
- Include admin identifier
- Include timestamp
- Include IP address
- Store immutable audit records

## Performance Considerations

### Frontend Optimization

- Lazy load modal components
- Debounce email validation API calls
- Cache country/state/city data
- Optimize form re-renders with React.memo

### Backend Optimization

- Use database transactions for user creation
- Implement connection pooling
- Cache validation rules
- Async email sending (don't block response)

### Target Performance Metrics

- Modal load time: < 500ms
- Form submission: < 2s
- Email validation: < 300ms
- User list refresh: < 1s

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- ARIA labels for all form fields
- Focus management in modal
- Error announcements
- High contrast mode support

## Future Enhancements

1. **Bulk User Import**: CSV/Excel upload for multiple users
2. **User Templates**: Save common user configurations
3. **Custom Fields**: Allow admins to add custom fields
4. **Integration**: SSO and LDAP integration
5. **Advanced Permissions**: Granular permission management
6. **User Invitation**: Send invitation emails instead of creating accounts directly
