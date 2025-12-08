# Requirements Document

## Introduction

This specification addresses critical production errors in the Next.js 13+ App Router project deployed to Vercel. The errors stem from improper Supabase client initialization and unsafe database query patterns that cause 500 errors when users are unauthenticated or when queries return no results.

## Glossary

- **Supabase Client**: The database client library used to interact with Supabase PostgreSQL database
- **Route Handler**: Next.js API route that handles HTTP requests
- **RLS**: Row Level Security policies in PostgreSQL
- **PGRST116**: PostgREST error code indicating a query expected one row but found zero or multiple rows
- **Auth Guard**: Code pattern that safely checks for authenticated users before proceeding
- **maybeSingle()**: Supabase query method that returns null instead of throwing when no rows found

## Requirements

### Requirement 1

**User Story:** As a developer, I want all API routes to properly await the Supabase client creation, so that authentication checks work correctly in production.

#### Acceptance Criteria

1. WHEN an API route creates a Supabase client THEN the system SHALL await the createClient() function call
2. WHEN the Supabase client is initialized THEN the system SHALL ensure cookies are properly accessed in the async context
3. WHEN multiple API routes use the Supabase client THEN the system SHALL follow a consistent initialization pattern
4. WHEN the client initialization fails THEN the system SHALL return a 500 error with appropriate logging

### Requirement 2

**User Story:** As a developer, I want authentication checks to handle missing or unauthenticated users gracefully, so that the system doesn't crash with "Cannot read properties of undefined" errors.

#### Acceptance Criteria

1. WHEN calling supabase.auth.getUser() THEN the system SHALL check both the error and user object before proceeding
2. WHEN a user is not authenticated THEN the system SHALL return a 401 Unauthorized response
3. WHEN authentication fails THEN the system SHALL log the error details for debugging
4. WHEN an auth error occurs THEN the system SHALL NOT attempt to access user properties
5. WHEN a route requires authentication THEN the system SHALL validate the user exists before any database queries

### Requirement 3

**User Story:** As a developer, I want database queries using single() to handle "no results" cases gracefully, so that PGRST116 errors don't cause 500 responses.

#### Acceptance Criteria

1. WHEN a query expects zero or one result THEN the system SHALL use maybeSingle() instead of single()
2. WHEN maybeSingle() returns null THEN the system SHALL handle it as a "not found" case
3. WHEN a query must return exactly one row THEN the system SHALL use single() with proper error handling
4. WHEN a PGRST116 error occurs THEN the system SHALL return a 404 Not Found response
5. WHEN checking for record existence THEN the system SHALL use maybeSingle() to avoid exceptions

### Requirement 4

**User Story:** As a developer, I want role-based queries to safely handle cases where users don't have role records, so that the system doesn't crash on new or incomplete user accounts.

#### Acceptance Criteria

1. WHEN querying user role tables THEN the system SHALL use maybeSingle() to handle missing role records
2. WHEN a role record doesn't exist THEN the system SHALL return appropriate default values or errors
3. WHEN checking user permissions THEN the system SHALL handle null role data gracefully
4. WHEN a user has no role assigned THEN the system SHALL return a 403 Forbidden or appropriate error
5. WHEN role queries fail THEN the system SHALL log the error and return a meaningful message

### Requirement 5

**User Story:** As a developer, I want all API routes to follow consistent error handling patterns, so that production errors are predictable and debuggable.

#### Acceptance Criteria

1. WHEN an API route encounters an error THEN the system SHALL log the full error details to console
2. WHEN returning error responses THEN the system SHALL use appropriate HTTP status codes
3. WHEN catching exceptions THEN the system SHALL return generic messages to clients while logging specifics
4. WHEN database queries fail THEN the system SHALL distinguish between client errors (4xx) and server errors (5xx)
5. WHEN errors occur in production THEN the system SHALL provide enough context for debugging without exposing sensitive data

### Requirement 6

**User Story:** As a developer, I want to test fixes in production mode locally, so that I can verify they work before deploying to Vercel.

#### Acceptance Criteria

1. WHEN running npm run build THEN the system SHALL compile without errors
2. WHEN running npm start THEN the system SHALL serve the production build successfully
3. WHEN testing API routes locally THEN the system SHALL behave identically to Vercel deployment
4. WHEN authentication is tested THEN the system SHALL properly handle both authenticated and unauthenticated requests
5. WHEN database queries are tested THEN the system SHALL handle all edge cases (no results, multiple results, errors)
