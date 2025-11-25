# Registration Schema Mismatch - Complete Fix

## Critical Issue Found

The registration form sends a `confirmPassword` field that the API schema doesn't expect, which could cause validation errors.

## Schema Comparison

### Frontend Types (types/registration.ts)
```typescript
export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string  // ❌ NOT in API schema
  mobileNumber: string
  whatsappNumber?: string
  sameAsMobile: boolean     // ❌ NOT in API schema
  dateOfBirth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
}
```

### API Schema (app/api/auth/register/route.ts)
```typescript
personalInfo: z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  whatsappNumber: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
}),
```

## Mismatches Found

1. ❌ `confirmPassword` - Present in frontend, NOT in API schema
2. ❌ `sameAsMobile` - Present in frontend, NOT in API schema

## Solution

The API schema should be updated to accept these fields but not require them, OR the frontend should strip them before sending.

### Option 1: Update API Schema (Recommended)
Add these fields as optional to the API schema:

```typescript
personalInfo: z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().optional(), // Add this
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  whatsappNumber: z.string().optional(),
  sameAsMobile: z.boolean().optional(), // Add this
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
}),
```

### Option 2: Strip Fields in Frontend
Modify the submit function to remove these fields before sending.

## Database Schema Verification

### Users Table Columns (from migration)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    profile_pic TEXT,
    mobile TEXT,
    whatsapp TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    address TEXT,
    postal_code TEXT,
    id_card_type TEXT,
    id_card_url TEXT,
    account_status account_status_type DEFAULT 'pending_verification',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    token_expires_at TIMESTAMPTZ,
    verification_requested_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Mapping Verification

| Frontend Field | API Field | Database Column | Status |
|---|---|---|---|
| firstName | firstName | full_name (part) | ✅ Mapped |
| lastName | lastName | last_name | ✅ Mapped |
| email | email | email | ✅ Direct |
| password | password | (auth.users) | ✅ Supabase Auth |
| confirmPassword | ❌ Missing | N/A | ⚠️ Not in API |
| mobileNumber | mobileNumber | mobile | ✅ Direct |
| whatsappNumber | whatsappNumber | whatsapp | ✅ Direct |
| sameAsMobile | ❌ Missing | N/A | ⚠️ Not in API |
| dateOfBirth | dateOfBirth | date_of_birth | ✅ Direct |
| gender | gender | gender | ✅ Mapped |
| country | country | country | ✅ Direct |
| state | state | state | ✅ Direct |
| city | city | city | ✅ Direct |
| address | address | address | ✅ Direct |
| postalCode | postalCode | postal_code | ✅ Direct |
| idType | idType | id_card_type | ✅ Direct |
| idNumber | idNumber | (not stored) | ⚠️ Not stored |
| idFrontUrl | idFrontUrl | id_card_url | ✅ Direct |
| idBackUrl | idBackUrl | (not stored) | ⚠️ Not stored |
| profilePhotoUrl | profilePhotoUrl | profile_pic | ✅ Direct |
| selfieWithIdUrl | selfieWithIdUrl | (not stored) | ⚠️ Not stored |

## Recommended Fix

Update the API schema to be more permissive and ignore extra fields:

```typescript
const registerSchema = z.object({
  userType: z.enum(['student', 'teacher', 'parent', 'spoken_english']),
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().optional(), // Allow but ignore
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    whatsappNumber: z.string().optional(),
    sameAsMobile: z.boolean().optional(), // Allow but ignore
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  }),
  addressInfo: z.object({
    country: z.string().min(1, 'Country is required'),
    state: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  categorySpecific: z.any(),
  idVerification: z.object({
    idType: z.string().min(1, 'ID type is required'),
    idNumber: z.string().min(1, 'ID number is required'),
    idFrontUrl: z.string().min(1, 'ID front image is required'),
    idBackUrl: z.string().optional(),
    profilePhotoUrl: z.string().optional(),
    selfieWithIdUrl: z.string().optional(),
  }),
  consents: z.object({
    termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
    privacyAccepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted'),
    gdprConsent: z.boolean().optional(),
    coppaConsent: z.boolean().optional(),
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    whatsappNotifications: z.boolean(),
    dataSharing: z.boolean().refine(val => val === true, 'Data sharing consent is required'),
  }),
  currentStep: z.number().optional(), // Allow but ignore
}).passthrough() // ✅ This allows extra fields to pass through without error
```

## Implementation

Apply this fix to `app/api/auth/register/route.ts`
