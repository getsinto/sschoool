# Production Optimization & Critical Fixes - Design Document

## Overview

This design document outlines the architecture and implementation strategy for addressing critical security vulnerabilities, performance bottlenecks, and production readiness issues in the St Haroon Online School platform. The fixes are prioritized based on severity and impact, with critical security issues taking precedence.

## Architecture

### Current Architecture Issues

1. **Authentication Layer**
   - Custom JWT implementation bypasses Supabase Auth
   - Weak session management
   - No rate limiting
   - Missing 2FA support

2. **Data Access Layer**
   - Incomplete RLS policies
   - SQL injection vulnerabilities
   - Inefficient queries (N+1 problems)
   - Missing indexes

3. **API Layer**
   - Inconsistent error handling
   - Exposed sensitive data
   - No request validation
   - Missing CSRF protection

4. **Frontend Layer**
   - Large bundle sizes
   - Unoptimized images
   - No code splitting
   - Memory leaks

### Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │ React Query  │  │  Zustand     │     │
│  │   Pages      │  │   Caching    │  │   State      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Middleware Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Rate Limit   │  │ Auth Check   │  │ CSRF Token   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Input Valid  │  │  DTO Layer   │  │ Error Handle │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Supabase     │  │  RLS         │  │  Caching     │     │
│  │ Client       │  │  Policies    │  │  Layer       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│                    PostgreSQL + RLS                          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Authentication System

#### Current Implementation
```typescript
// PROBLEMATIC: Custom JWT in app/api/auth/login/route.ts
const token = jwt.sign({ userId, email }, JWT_SECRET)
```

#### New Implementation
```typescript
// lib/auth/supabase-auth.ts
export class SupabaseAuthService {
  async signIn(email: string, password: string) {
    const supabase = createClient()
    return await supabase.auth.signInWithPassword({ email, password })
  }
  
  async signUp(email: string, password: string, metadata: UserMetadata) {
    const supabase = createClient()
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
  }
  
  async signOut() {
    const supabase = createClient()
    return await supabase.auth.signOut()
  }
}
```


### 2. Rate Limiting System

#### Interface
```typescript
// lib/rate-limit/types.ts
export interface RateLimitConfig {
  requests: number
  window: string // e.g., "1m", "1h"
  identifier: (req: NextRequest) => string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}
```

#### Implementation
```typescript
// lib/rate-limit/limiter.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  analytics: true,
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
})
```

### 3. Row Level Security (RLS) System

#### Policy Structure
```sql
-- Template for all tables
CREATE POLICY "policy_name"
  ON table_name
  FOR operation -- SELECT, INSERT, UPDATE, DELETE, ALL
  USING (condition) -- Row visibility condition
  WITH CHECK (condition); -- Row modification condition
```

#### Role-Based Policies
```sql
-- Admin: Full access to all data
CREATE POLICY "admins_all_access"
  ON {table_name}
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Teacher: Access to assigned courses
CREATE POLICY "teachers_assigned_courses"
  ON courses
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM course_assignments
      WHERE course_assignments.course_id = courses.id
      AND course_assignments.teacher_id = auth.uid()
    )
  );

-- Student: Access to enrolled courses
CREATE POLICY "students_enrolled_courses"
  ON courses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = courses.id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

-- Parent: Access to children's data
CREATE POLICY "parents_children_data"
  ON students
  FOR SELECT
  USING (
    parent_id IN (
      SELECT id FROM parents
      WHERE user_id = auth.uid()
    )
  );
```

### 4. Input Validation System

#### Validation Schemas
```typescript
// lib/validations/schemas.ts
import { z } from 'zod'

export const emailSchema = z.string().email().toLowerCase()

export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character')

export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['student', 'teacher', 'parent']),
  dateOfBirth: z.string().datetime(),
  mobile: z.string().regex(/^\+?[1-9]\d{1,14}$/),
})

export const courseCreationSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(['online_school', 'spoken_english', 'tuition']),
  price: z.number().min(0),
  duration: z.number().min(1),
})
```

### 5. Data Transfer Objects (DTOs)

#### User DTOs
```typescript
// lib/dto/user.dto.ts
export interface UserDTO {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profilePhotoUrl?: string
  createdAt: string
}

export interface TeacherDTO extends UserDTO {
  qualifications: string
  experience: number
  subjects: string[]
  bio: string
  isApproved: boolean
}

export interface StudentDTO extends UserDTO {
  gradeLevel: string
  enrollmentDate: string
  parentId?: string
}

export function sanitizeUser(user: any): UserDTO {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    profilePhotoUrl: user.profile_photo_url,
    createdAt: user.created_at,
  }
}
```

### 6. Error Handling System

#### Standard Error Response
```typescript
// lib/errors/types.ts
export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    requestId: string
  }
}

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```

#### Error Handler Middleware
```typescript
// lib/errors/handler.ts
export function handleError(error: unknown, requestId: string): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId,
      }
    }
  }
  
  if (error instanceof z.ZodError) {
    return {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.errors,
        timestamp: new Date().toISOString(),
        requestId,
      }
    }
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error)
  
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId,
    }
  }
}
```

## Data Models

### Enhanced User Model
```typescript
interface User {
  id: string
  email: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  
  // Personal Info
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: 'male' | 'female' | 'other'
  profilePhotoUrl?: string
  
  // Contact
  mobile: string
  whatsapp?: string
  
  // Address
  country: string
  state?: string
  city: string
  address: string
  postalCode: string
  
  // Account Status
  accountStatus: 'pending_verification' | 'pending_review' | 'active' | 'suspended'
  emailVerified: boolean
  isActive: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
}
```

### Security Audit Log Model
```typescript
interface SecurityAuditLog {
  id: string
  userId?: string
  action: string
  resource: string
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
  timestamp: Date
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication Security
*For any* authentication attempt, the system should use Supabase Auth and enforce rate limiting, preventing more than 5 failed attempts per minute per IP address.
**Validates: Requirements 1.1, 1.3**

### Property 2: RLS Policy Enforcement
*For any* database query, the system should enforce row-level security policies based on the authenticated user's role, ensuring users can only access data they're authorized to see.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 3: Input Validation
*For any* API request with user input, the system should validate the input against defined schemas before processing, rejecting invalid data with specific error messages.
**Validates: Requirements 2.3, 4.1**

### Property 4: Data Sanitization
*For any* API response containing user data, the system should filter sensitive fields (password hashes, tokens, internal IDs) before returning the response.
**Validates: Requirements 2.2, 4.2**

### Property 5: Error Handling Consistency
*For any* error that occurs in the system, the error should be logged with full context server-side while returning a sanitized error message to the client.
**Validates: Requirements 2.1, 2.2, 2.4**

### Property 6: Rate Limiting
*For any* API endpoint, the system should enforce rate limits appropriate to the endpoint's sensitivity, returning 429 status when limits are exceeded.
**Validates: Requirements 1.3, 2.5**

### Property 7: Environment Variable Validation
*For any* application startup, the system should validate all required environment variables are present and valid, failing fast with clear error messages if any are missing.
**Validates: Requirements 6.1, 6.2, 6.4**

### Property 8: File Upload Security
*For any* file upload, the system should validate file type, size, and content, rejecting uploads that don't meet security requirements.
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 9: Payment Processing Integrity
*For any* payment transaction, the system should verify webhook signatures and use idempotency keys to prevent duplicate charges.
**Validates: Requirements 7.1, 7.3**

### Property 10: Session Management
*For any* user session, the system should automatically expire sessions after the configured timeout and redirect to login.
**Validates: Requirements 1.4**

## Error Handling

### Error Categories

1. **Authentication Errors (401)**
   - Invalid credentials
   - Expired session
   - Missing authentication

2. **Authorization Errors (403)**
   - Insufficient permissions
   - Account suspended
   - Email not verified

3. **Validation Errors (400)**
   - Invalid input format
   - Missing required fields
   - Constraint violations

4. **Rate Limit Errors (429)**
   - Too many requests
   - Quota exceeded

5. **Server Errors (500)**
   - Database errors
   - External service failures
   - Unexpected errors

### Error Response Format
```typescript
{
  error: {
    code: "ERROR_CODE",
    message: "User-friendly error message",
    details: { /* Optional additional context */ },
    timestamp: "2025-12-08T10:30:00Z",
    requestId: "req_abc123"
  }
}
```

## Testing Strategy

### Unit Testing
- Test utility functions with Jest
- Test validation schemas with sample data
- Test DTO transformations
- Test error handlers
- Target: 80% code coverage

### Integration Testing
- Test API routes with Supertest
- Test authentication flows
- Test RLS policies with different roles
- Test rate limiting
- Test payment webhooks

### Property-Based Testing
- Use fast-check for property testing
- Test input validation with random data
- Test RLS policies with random user roles
- Test rate limiting with concurrent requests
- Configure 100+ iterations per property

### Security Testing
- SQL injection testing
- XSS testing
- CSRF testing
- Authentication bypass testing
- Authorization testing

### Performance Testing
- Load testing with k6
- Database query performance
- API response times
- Frontend rendering performance

## Deployment Strategy

### Phase 1: Critical Security (Week 1)
1. Deploy authentication fixes
2. Deploy RLS policies
3. Deploy input validation
4. Deploy rate limiting

### Phase 2: Performance (Week 2)
1. Deploy database optimizations
2. Deploy caching layer
3. Deploy frontend optimizations
4. Deploy monitoring

### Phase 3: Testing (Week 3)
1. Deploy test infrastructure
2. Run comprehensive test suite
3. Fix identified issues
4. Verify all tests pass

### Phase 4: Production (Week 4)
1. Final security audit
2. Performance testing
3. Staged rollout
4. Monitor and adjust

## Monitoring and Observability

### Metrics to Track
- Authentication success/failure rates
- API response times
- Error rates by endpoint
- Rate limit hits
- Database query performance
- User session duration

### Logging Strategy
- Structured logging with correlation IDs
- Error logs with full stack traces
- Security audit logs
- Performance metrics
- User activity logs

### Alerting Rules
- Error rate > 1%
- Response time > 1s
- Failed authentication > 10/min
- Database connection failures
- Payment processing failures

## Security Considerations

### Authentication
- Use Supabase Auth exclusively
- Enforce strong password policy
- Implement rate limiting
- Add 2FA for sensitive roles
- Secure session management

### Authorization
- Implement RLS on all tables
- Use role-based access control
- Validate permissions on every request
- Audit access to sensitive data

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all connections
- Sanitize all user input
- Filter sensitive data from responses
- Implement CSRF protection

### Compliance
- GDPR compliance for EU users
- COPPA compliance for children
- Data retention policies
- Right to deletion
- Data export capabilities
