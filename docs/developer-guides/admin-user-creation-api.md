# Admin User Creation API - Developer Guide

## Overview

This guide provides technical documentation for the Admin Direct User Creation feature, including API endpoints, data models, component architecture, and integration examples.

## Table of Contents

1. [Architecture](#architecture)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Components](#components)
5. [Database Schema](#database-schema)
6. [Security](#security)
7. [Testing](#testing)
8. [Integration Examples](#integration-examples)

## Architecture

### High-Level Flow

```
┌─────────────────┐
│  Admin UI       │
│  (Modal)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Layer      │
│  /api/admin/    │
│  users/create   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Auth  │
│  + Database     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Audit Logging  │
└─────────────────┘
```

### Component Hierarchy

```
CreateUserModal (Container)
├── UserTypeSelector (Step 1)
├── PersonalInfoForm (Step 2)
├── RoleSpecificForm (Step 3)
│   ├── StudentFields
│   ├── TeacherFields
│   ├── ParentFields
│   └── AdminFields
├── AccountSettingsForm (Step 4)
├── ReviewStep (Step 5)
└── PasswordDisplay (Success)
```

## API Endpoints

### 1. Create User

**Endpoint**: `POST /api/admin/users/create`

**Authentication**: Required (Admin only)

**Request Body**:
```typescript
{
  userType: 'student' | 'teacher' | 'parent' | 'admin'
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    mobileNumber: string
    whatsappNumber?: string
    dateOfBirth: string // ISO 8601 format
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
    country: string
    state?: string
    city: string
    address: string
    postalCode: string
  }
  roleSpecific: StudentData | TeacherData | ParentData | AdminData
  accountSettings: {
    accountStatus: 'active' | 'inactive' | 'suspended'
    isVerified: boolean
    skipEmailVerification: boolean
    sendWelcomeEmail: boolean
    requirePasswordChange: boolean
  }
}
```

**Response** (201 Created):
```typescript
{
  success: true
  message: "User created successfully"
  user: {
    id: string
    email: string
    fullName: string
    role: string
    accountStatus: string
    isVerified: boolean
    createdAt: string
  }
  temporaryPassword: string
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data
```typescript
{
  success: false
  error: "Validation failed"
  details: {
    field: "error message"
  }
}
```

- `401 Unauthorized`: Not authenticated
```typescript
{
  success: false
  error: "Unauthorized"
}
```

- `403 Forbidden`: Not an admin
```typescript
{
  success: false
  error: "Forbidden: Admin access required"
}
```

- `409 Conflict`: Email already exists
```typescript
{
  success: false
  error: "Email already registered"
  existingUser: {
    id: string
    email: string
    role: string
  }
}
```

- `500 Internal Server Error`: Server error
```typescript
{
  success: false
  error: "An unexpected error occurred"
}
```

**Example Request**:
```typescript
const response = await fetch('/api/admin/users/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userType: 'student',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobileNumber: '+1234567890',
      dateOfBirth: '2010-01-01',
      gender: 'male',
      country: 'United States',
      city: 'New York',
      address: '123 Main St',
      postalCode: '10001',
    },
    roleSpecific: {
      studentType: 'online_school',
      gradeLevel: '8',
      academicYear: '2024-2025',
    },
    accountSettings: {
      accountStatus: 'active',
      isVerified: true,
      skipEmailVerification: true,
      sendWelcomeEmail: true,
      requirePasswordChange: true,
    },
  }),
})

const data = await response.json()
```

### 2. Check Email Availability

**Endpoint**: `POST /api/admin/users/check-email`

**Authentication**: Required (Admin only)

**Request Body**:
```typescript
{
  email: string
}
```

**Response** (200 OK):
```typescript
{
  available: boolean
  message: string
  existingUser?: {
    id: string
    email: string
    fullName: string
    role: string
  }
}
```

**Example Request**:
```typescript
const response = await fetch('/api/admin/users/check-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
  }),
})

const data = await response.json()
if (data.available) {
  console.log('Email is available')
} else {
  console.log('Email already exists:', data.existingUser)
}
```

### 3. Send Credentials Email

**Endpoint**: `POST /api/admin/users/send-credentials`

**Authentication**: Required (Admin only)

**Request Body**:
```typescript
{
  userId: string
  userEmail: string
  userName: string
  temporaryPassword: string
  userRole: 'student' | 'teacher' | 'parent' | 'admin'
}
```

**Response** (200 OK):
```typescript
{
  success: true
  message: "Credentials email sent successfully"
  emailId: string
}
```

**Example Request**:
```typescript
const response = await fetch('/api/admin/users/send-credentials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user-uuid',
    userEmail: 'user@example.com',
    userName: 'John Doe',
    temporaryPassword: 'TempPass123!',
    userRole: 'student',
  }),
})

const data = await response.json()
```

## Data Models

### User Creation Data

```typescript
interface UserCreationData {
  userType: UserRole
  personalInfo: PersonalInfo
  roleSpecific: RoleSpecificData
  accountSettings: AccountSettings
}

type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

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

type RoleSpecificData = 
  | StudentSpecificData 
  | TeacherSpecificData 
  | ParentSpecificData 
  | AdminSpecificData

interface StudentSpecificData {
  studentType: 'online_school' | 'spoken_english'
  gradeLevel?: string
  previousSchool?: string
  academicYear?: string
  englishLevel?: string
  purpose?: string
  learningSchedule?: string
  parentId?: string
}

interface TeacherSpecificData {
  qualifications: string
  fieldOfStudy: string
  experienceYears: number
  subjects: string[]
  bio: string
  resumeUrl?: string
  isApproved: boolean
}

interface ParentSpecificData {
  relationship: string
  occupation?: string
  linkedStudents?: string[]
}

interface AdminSpecificData {
  permissions: string[]
  department?: string
  accessLevel: 'full' | 'limited'
}

interface AccountSettings {
  accountStatus: 'active' | 'inactive' | 'suspended'
  isVerified: boolean
  skipEmailVerification: boolean
  sendWelcomeEmail: boolean
  requirePasswordChange: boolean
}
```

### Created User Response

```typescript
interface CreatedUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  accountStatus: string
  isVerified: boolean
  createdAt: string
}

interface UserCreationResponse {
  success: boolean
  message: string
  user: CreatedUser
  temporaryPassword: string
}
```

## Components

### CreateUserModal

**Location**: `components/admin/users/CreateUserModal.tsx`

**Props**:
```typescript
interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: CreatedUser) => void
}
```

**Usage**:
```tsx
import CreateUserModal from '@/components/admin/users/CreateUserModal'

function UserManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSuccess = (user: CreatedUser) => {
    console.log('User created:', user)
    // Refresh user list
    refreshUsers()
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Add User
      </Button>
      
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}
```

### Password Generator Utility

**Location**: `lib/utils/password-generator.ts`

**Functions**:

```typescript
// Generate secure random password
function generateSecurePassword(length?: number): string

// Validate password against requirements
function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
}

// Calculate password strength (0-100)
function calculatePasswordStrength(password: string): {
  score: number
  level: 'weak' | 'medium' | 'strong'
}
```

**Usage**:
```typescript
import {
  generateSecurePassword,
  validatePassword,
  calculatePasswordStrength,
} from '@/lib/utils/password-generator'

// Generate password
const password = generateSecurePassword(16)

// Validate password
const validation = validatePassword(password)
if (!validation.isValid) {
  console.error('Invalid password:', validation.errors)
}

// Check strength
const strength = calculatePasswordStrength(password)
console.log(`Password strength: ${strength.level} (${strength.score}/100)`)
```

## Database Schema

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### Helper Functions

```sql
-- Log user creation
CREATE OR REPLACE FUNCTION log_user_creation(
  p_admin_id UUID,
  p_created_user_id UUID,
  p_user_type TEXT,
  p_ip_address TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
  VALUES (
    p_admin_id,
    'create_user',
    'user',
    p_created_user_id,
    jsonb_build_object('user_type', p_user_type),
    p_ip_address
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log password generation
CREATE OR REPLACE FUNCTION log_password_generation(
  p_admin_id UUID,
  p_user_id UUID,
  p_ip_address TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address)
  VALUES (
    p_admin_id,
    'generate_password',
    'user',
    p_user_id,
    p_ip_address
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log user creation failure
CREATE OR REPLACE FUNCTION log_user_creation_failure(
  p_admin_id UUID,
  p_user_type TEXT,
  p_email TEXT,
  p_error_message TEXT,
  p_ip_address TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, details, ip_address)
  VALUES (
    p_admin_id,
    'create_user_failed',
    'user',
    jsonb_build_object(
      'user_type', p_user_type,
      'email', p_email,
      'error', p_error_message
    ),
    p_ip_address
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Security

### Authentication

All endpoints require admin authentication:

```typescript
// Verify admin role
const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  )
}

const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') {
  return NextResponse.json(
    { success: false, error: 'Forbidden: Admin access required' },
    { status: 403 }
  )
}
```

### Input Validation

All inputs are validated using Zod schemas:

```typescript
import { z } from 'zod'

const createUserSchema = z.object({
  userType: z.enum(['student', 'teacher', 'parent', 'admin']),
  personalInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    // ... more fields
  }),
  // ... more validation
})

const validatedData = createUserSchema.parse(body)
```

### Password Security

- Passwords generated using cryptographically secure random values
- Minimum 12 characters with mixed case, numbers, and special characters
- Passwords never logged or stored in plain text
- Users required to change password on first login

### Audit Logging

All user creation attempts are logged:

```typescript
await supabase.rpc('log_user_creation', {
  p_admin_id: adminId,
  p_created_user_id: userId,
  p_user_type: userType,
  p_ip_address: ipAddress,
})
```

## Testing

### Unit Tests

```typescript
// Test password generation
import { generateSecurePassword } from '@/lib/utils/password-generator'

test('generates secure password', () => {
  const password = generateSecurePassword()
  expect(password.length).toBeGreaterThanOrEqual(12)
  expect(/[A-Z]/.test(password)).toBe(true)
  expect(/[a-z]/.test(password)).toBe(true)
  expect(/[0-9]/.test(password)).toBe(true)
  expect(/[!@#$%^&*]/.test(password)).toBe(true)
})
```

### Integration Tests

```typescript
// Test user creation flow
test('creates student user successfully', async () => {
  const response = await fetch('/api/admin/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData),
  })

  expect(response.status).toBe(201)
  const data = await response.json()
  expect(data.success).toBe(true)
  expect(data.user.role).toBe('student')
  expect(data.temporaryPassword).toBeDefined()
})
```

## Integration Examples

### React Hook for User Creation

```typescript
import { useState } from 'react'

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUser = async (data: UserCreationData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { createUser, isLoading, error }
}
```

### Email Validation Hook

```typescript
import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

export function useEmailValidation(email: string) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    if (!email || !email.includes('@')) {
      setIsAvailable(null)
      return
    }

    const checkEmail = debounce(async () => {
      setIsChecking(true)
      try {
        const response = await fetch('/api/admin/users/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        const data = await response.json()
        setIsAvailable(data.available)
      } catch (error) {
        console.error('Email check failed:', error)
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }, 500)

    checkEmail()

    return () => checkEmail.cancel()
  }, [email])

  return { isChecking, isAvailable }
}
```

## Error Handling

### Client-Side Error Handling

```typescript
try {
  const result = await createUser(formData)
  toast.success('User created successfully')
  onSuccess(result.user)
} catch (error) {
  if (error.response?.status === 409) {
    toast.error('Email already exists')
  } else if (error.response?.status === 400) {
    toast.error('Invalid form data')
  } else {
    toast.error('Failed to create user')
  }
}
```

### Server-Side Error Handling

```typescript
try {
  // User creation logic
} catch (error) {
  console.error('User creation error:', error)

  // Log failure
  await supabase.rpc('log_user_creation_failure', {
    p_admin_id: adminId,
    p_user_type: userType,
    p_email: email,
    p_error_message: error.message,
    p_ip_address: ipAddress,
  })

  return NextResponse.json(
    { success: false, error: 'Failed to create user' },
    { status: 500 }
  )
}
```

## Performance Considerations

- Email validation is debounced (500ms) to reduce API calls
- Modal components can be lazy-loaded
- Form state is memoized to prevent unnecessary re-renders
- Database operations use transactions for atomicity

## Related Documentation

- [User Management API](./user-management-api.md)
- [Authentication Guide](./authentication-guide.md)
- [Database Schema](./database-schema.md)
- [Security Best Practices](./security-guide.md)

---

*Last Updated: January 2025*
*Version: 1.0*
