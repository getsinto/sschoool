# Design Document - Remaining High-Priority Work

## Overview

This design addresses the final 2% of work needed to achieve 100% production readiness. It covers: Google Meet OAuth integration, teacher API mock data replacement, file upload server-side handling, production monitoring setup, and session timeout handling.

## Architecture

### System Components

1. **OAuth Service** (`lib/google-meet/oauth.ts`) - Manages Google OAuth 2.0 flow
2. **File Upload Service** (`lib/uploads/file-handler.ts`) - Handles file validation and storage
3. **Teacher Data Service** (`lib/teacher/data-service.ts`) - Replaces mock data with real queries
4. **Session Manager** (`lib/session/manager.ts`) - Tracks activity and handles timeouts
5. **Monitoring Service** (`lib/monitoring/sentry.ts`) - Captures errors and performance metrics

## Components and Interfaces

### Google Meet OAuth Service

**Key Functions:**
```typescript
export async function initiateGoogleOAuth(userId: string): Promise<string>
export async function handleGoogleCallback(code: string, state: string): Promise<TokenData>
export async function getGoogleAccessToken(userId: string): Promise<string>
export async function refreshGoogleToken(userId: string, refreshToken: string): Promise<TokenData>
export async function revokeGoogleAccess(userId: string): Promise<void>
export async function isGoogleConnected(userId: string): Promise<boolean>
```

### File Upload Service

**Key Functions:**
```typescript
export async function validateFile(file: File): Promise<ValidationResult>
export async function uploadFile(file: File, userId: string, bucket: string): Promise<UploadResult>
export async function processImage(file: File): Promise<ImageVariants>
export async function processVideo(file: File): Promise<VideoMetadata>
export async function deleteFile(fileId: string, userId: string): Promise<void>
```

### Teacher Data Service

**Key Functions:**
```typescript
export async function getTeacherStudents(teacherId: string): Promise<Student[]>
export async function getStudentProgress(studentId: string): Promise<ProgressMetrics>
export async function getStudentPerformance(studentId: string): Promise<PerformanceData>
export async function sendMessage(teacherId: string, message: Message): Promise<void>
export async function getGradingStatistics(teacherId: string): Promise<Statistics>
```

### Session Manager

**Key Functions:**
```typescript
export function initializeSessionTracking(): void
export function resetInactivityTimer(): void
export function showTimeoutWarning(): void
export function refreshSession(): Promise<void>
export function handleSessionExpiry(): void
export function syncSessionAcrossTabs(): void
```

### Monitoring Service

**Key Functions:**
```typescript
export function initializeSentry(): void
export function captureError(error: Error, context?: ErrorContext): void
export function trackPerformance(operation: string, duration: number): void
export function setUserContext(user: User): void
```

## Data Models

### Integration Token (Extended)
```typescript
interface IntegrationToken {
  id: string
  user_id: string
  provider: 'zoom' | 'google_meet' | 'google_calendar'
  access_token: string  // encrypted
  refresh_token: string // encrypted
  expires_at: Date
  token_type: string
  scope: string
  metadata: Record<string, any>
  created_at: Date
  updated_at: Date
}
```

### File Upload Record
```typescript
interface FileUpload {
  id: string
  user_id: string
  filename: string
  file_type: string
  file_size: number
  bucket: string
  path: string
  public_url: string
  metadata: Record<string, any>
  status: 'uploading' | 'processing' | 'complete' | 'failed'
  created_at: Date
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Google Meet OAuth Properties

**Property 1: OAuth Redirect Correctness**
*For any* teacher initiating Google OAuth, the redirect URL should contain all required scopes and proper state parameter
**Validates: Requirements 1.1**

**Property 2: Token Exchange Success**
*For any* valid authorization code, the system should successfully exchange it for access and refresh tokens
**Validates: Requirements 1.2**

**Property 3: Automatic Token Refresh**
*For any* expired access token with valid refresh token, the system should automatically refresh and return a new valid token
**Validates: Requirements 1.3**

**Property 4: Meeting Creation with Valid Token**
*For any* teacher with valid access token and meeting details, the system should successfully create a Google Meet meeting
**Validates: Requirements 1.4**

**Property 5: Complete Token Revocation**
*For any* connected teacher, disconnecting should revoke tokens with Google and delete all token records from database
**Validates: Requirements 1.5**

**Property 6: Token Storage Security**
*For any* OAuth token being stored, it should be encrypted and have RLS policies applied
**Validates: Requirements 1.6**

**Property 7: Refresh Failure Handling**
*For any* failed token refresh, the system should prompt the teacher to re-authorize
**Validates: Requirements 1.7**

**Property 8: Connection Status Accuracy**
*For any* teacher, checking connection status should return accurate token validity information
**Validates: Requirements 1.8**

### Teacher API Data Properties

**Property 9: Student List Filtering**
*For any* teacher, the students list should only include students enrolled in that teacher's courses
**Validates: Requirements 2.1**

**Property 10: Real Progress Calculation**
*For any* student, progress metrics should be calculated from actual lesson_progress and assignment_submissions records
**Validates: Requirements 2.2**

**Property 11: Performance Aggregation**
*For any* student, performance metrics should aggregate actual grades and quiz scores from the database
**Validates: Requirements 2.3**

**Property 12: Activity Log Retrieval**
*For any* student, activity logs should be retrieved from actual database records, not mock data
**Validates: Requirements 2.4**

**Property 13: Message Persistence**
*For any* message sent by a teacher, conversation records should be created in database and notifications sent
**Validates: Requirements 2.5**

**Property 14: Statistics Calculation**
*For any* teacher, grading statistics should be calculated from actual submissions and grades tables
**Validates: Requirements 2.6**

**Property 15: Export Data Accuracy**
*For any* export request, the generated report should contain data from actual database records
**Validates: Requirements 2.7**

**Property 16: Note Validation and Persistence**
*For any* student note, it should be validated and persisted to the database
**Validates: Requirements 2.8**

**Property 17: Message Retrieval**
*For any* teacher, messages should be fetched from actual conversation records in database
**Validates: Requirements 2.9**

**Property 18: Bulk Message Creation**
*For any* bulk message, individual message records should be created for each recipient
**Validates: Requirements 2.10**

**Property 19: Permission Validation**
*For any* resource access by a teacher, permissions should be validated before returning data
**Validates: Requirements 2.11**

**Property 20: Error Handling**
*For any* database query failure, appropriate error messages should be returned and failures logged
**Validates: Requirements 2.12**

### File Upload Properties

**Property 21: File Type Validation**
*For any* file upload, the file type should be validated against allowed extensions
**Validates: Requirements 3.1**

**Property 22: File Size Validation**
*For any* file upload, the file size should be validated against maximum limits
**Validates: Requirements 3.2**

**Property 23: Malware Scanning**
*For any* validated file, malware scanning should occur before storage
**Validates: Requirements 3.3**

**Property 24: Storage Organization**
*For any* file being stored, it should be uploaded to the correct Supabase Storage bucket
**Validates: Requirements 3.4**

**Property 25: Image Optimization**
*For any* image file, thumbnail, medium, and large versions should be generated
**Validates: Requirements 3.5**

**Property 26: Video Metadata Extraction**
*For any* video file, duration should be extracted and thumbnail generated
**Validates: Requirements 3.6**

**Property 27: Document Metadata Extraction**
*For any* document file, metadata like page count should be extracted
**Validates: Requirements 3.7**

**Property 28: Upload Completion Response**
*For any* successful file upload, public URL and metadata should be returned
**Validates: Requirements 3.8**

**Property 29: Upload Failure Cleanup**
*For any* failed file upload, partial uploads should be cleaned up
**Validates: Requirements 3.9**

**Property 30: File Deletion Completeness**
*For any* file deletion, both storage and database references should be removed
**Validates: Requirements 3.10**

**Property 31: File Access Permissions**
*For any* file access attempt, RLS policies should be enforced based on user permissions
**Validates: Requirements 3.11**

**Property 32: Resumable Upload Support**
*For any* large file upload, resumable upload functionality should be available
**Validates: Requirements 3.12**

### Monitoring Properties

**Property 33: Error Capture**
*For any* error in production, it should be captured with full context and sent to Sentry
**Validates: Requirements 4.1**

**Property 34: Performance Tracking**
*For any* slow transaction or API call, it should be tracked in monitoring system
**Validates: Requirements 4.2**

**Property 35: Critical Error Alerts**
*For any* critical error, immediate alerts should be sent to administrators
**Validates: Requirements 4.3**

**Property 36: Error Context Completeness**
*For any* error report, stack traces, user context, and breadcrumbs should be included
**Validates: Requirements 4.4**

**Property 37: Error Grouping**
*For any* set of similar errors, they should be grouped and patterns identified
**Validates: Requirements 4.5**

**Property 38: API Performance Metrics**
*For any* API call, response time and throughput should be tracked
**Validates: Requirements 4.6**

**Property 39: Slow Query Logging**
*For any* slow database query, it should be identified and logged
**Validates: Requirements 4.7**

**Property 40: Session Replay Availability**
*For any* problematic user session, replay data should be available for debugging
**Validates: Requirements 4.8**

**Property 41: Release Version Tracking**
*For any* error, the release version should be included in the error report
**Validates: Requirements 4.9**

**Property 42: Error Resolution Status**
*For any* resolved error, its status should be updated in Sentry
**Validates: Requirements 4.10**

### Session Timeout Properties

**Property 43: Inactivity Warning**
*For any* user session, 25 minutes of inactivity should trigger a warning dialog
**Validates: Requirements 5.1**

**Property 44: Countdown Display**
*For any* timeout warning dialog, a countdown timer should be displayed
**Validates: Requirements 5.2**

**Property 45: Session Refresh on Action**
*For any* "Stay Logged In" action, the session should be refreshed and timeout reset
**Validates: Requirements 5.3**

**Property 46: Automatic Logout**
*For any* user session, 30 minutes of inactivity should trigger automatic logout
**Validates: Requirements 5.4**

**Property 47: Expiry Redirect**
*For any* expired session, user should be redirected to login page with expiration message
**Validates: Requirements 5.5**

**Property 48: Activity Timer Reset**
*For any* user action, the inactivity timer should be reset
**Validates: Requirements 5.6**

**Property 49: Automatic Token Refresh**
*For any* expired session token with valid refresh token, automatic refresh should occur
**Validates: Requirements 5.7**

**Property 50: Refresh Failure Cleanup**
*For any* failed token refresh, user should be logged out and session data cleared
**Validates: Requirements 5.8**

**Property 51: Cross-Tab Synchronization**
*For any* multi-tab session, session state should be synchronized across all tabs
**Validates: Requirements 5.9**

**Property 52: Token Invalidation on Logout**
*For any* user logout, all session tokens should be immediately invalidated
**Validates: Requirements 5.10**

**Property 53: Session Data Encryption**
*For any* session data being stored, sensitive information should be encrypted
**Validates: Requirements 5.11**

**Property 54: Session Validity Verification**
*For any* session validity check, both token expiration and database status should be verified
**Validates: Requirements 5.12**

## Error Handling

- OAuth errors: Prompt re-authorization, retry with backoff
- File upload errors: Cleanup partial uploads, return clear error messages
- Teacher API errors: Return appropriate HTTP status codes, log failures
- Session errors: Attempt refresh, fallback to logout
- Monitoring errors: Queue for retry, use fallback logging

## Testing Strategy

### Unit Testing
- OAuth token exchange logic
- File validation functions
- Session timeout calculations
- Error handling paths

### Property-Based Testing
- Use `fast-check` library for JavaScript/TypeScript
- Configure each property test to run minimum 100 iterations
- Tag format: `// Feature: remaining-high-priority-work-jan-2025, Property X: [property text]`

### Integration Testing
- Complete OAuth flow with Google
- File upload to Supabase Storage
- Teacher API with real database
- Session timeout with multiple tabs

## Security Considerations

- OAuth: State parameter validation, token encryption, HTTPS only
- File Upload: Malware scanning, type whitelist, size limits, RLS policies
- Session: Secure httpOnly cookies, CSRF protection, encrypted session data
- API: Permission validation, rate limiting, parameterized queries

## Deployment Strategy

1. **Phase 1**: Google Meet OAuth (Days 1-2)
2. **Phase 2**: Teacher API Mock Data (Days 3-6)
3. **Phase 3**: File Upload Handling (Days 7-9)
4. **Phase 4**: Production Monitoring (Day 10)
5. **Phase 5**: Session Timeout (Days 11-12)

## Success Criteria

- Google Meet OAuth: 95% success rate
- File uploads: 98% success rate, <30s for 100MB
- Teacher APIs: 100% real data, <500ms response
- Session timeout: <5% user complaints
- Monitoring: 100% error capture
- All property tests passing
- Platform at 100% readiness
