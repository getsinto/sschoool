# Requirements Document

## Introduction

This document outlines the requirements for fixing critical Supabase authentication and query errors in the Next.js 13+ App Router API routes deployed to Vercel production.

## Glossary

- **Supabase Client**: The database client instance used to interact with Supabase services
- **Route Handler**: Next.js API route that handles HTTP requests
- **RLS**: Row Level Security policies in Supabase
- **Auth Context**: The authentication state and user information available in a request
- **PGRST116**: PostgreSQL REST API error code indicating zero rows returned when expecting exactly one

## Requirements

### Requirement 1

**User Story:** As a developer, I want all API routes to properly initialize Supabase clients with request context, so that authentication works correctly in production.

#### Acceptance Criteria

1. WHEN an API route creates a Supabase client THEN the system SHALL await the async createClient() function
2. WHEN the Supabase client is initialized THEN the system SHALL pass the correct cookies context from the request
3. WHEN supabase.auth.getUser() is called THEN the system SHALL handle both authenticated and unauthenticated states gracefully
4. WHEN an unauthenticated user accesses a protected route THEN the system SHALL return a 401 status with a clear error message
5. WHEN an authenticated user accesses a route THEN the system SHALL successfully retrieve their user object

### Requirement 2

**User Story:** As a developer, I want database queries to handle missing records gracefully, so that the application doesn't crash when data doesn't exist.

#### Acceptance Criteria

1. WHEN querying for a single record that may not exist THEN the system SHALL use maybeSingle() instead of single()
2. WHEN a query returns zero rows with maybeSingle() THEN the system SHALL return null without throwing an error
3. WHEN a query returns multiple rows with maybeSingle() THEN the system SHALL return an error
4. WHEN handling query results THEN the system SHALL check for both error and null data conditions
5. WHEN a required record is not found THEN the system SHALL return an appropriate 404 error to the client

### Requirement 3

**User Story:** As a developer, I want consistent error handling across all API routes, so that debugging production issues is easier.

#### Acceptance Criteria

1. WHEN an authentication error occurs THEN the system SHALL log the error with context
2. WHEN a database query fails THEN the system SHALL log the error with the query details
3. WHEN returning error responses THEN the system SHALL include appropriate HTTP status codes
4. WHEN an unexpected error occurs THEN the system SHALL return a 500 status with a generic message
5. WHEN errors are logged THEN the system SHALL include the route path and user ID if available

### Requirement 4

**User Story:** As a developer, I want to verify fixes work in both local production mode and Vercel deployment, so that I can be confident the issues are resolved.

#### Acceptance Criteria

1. WHEN running npm run build locally THEN the system SHALL compile without errors
2. WHEN running npm start locally THEN the system SHALL serve the production build successfully
3. WHEN testing API routes locally THEN the system SHALL handle authentication correctly
4. WHEN deploying to Vercel THEN the system SHALL pass all build checks
5. WHEN testing in Vercel production THEN the system SHALL not show the original three errors

### Requirement 5

**User Story:** As a system administrator, I want all API routes audited for auth and query issues, so that no routes are missed in the fix.

#### Acceptance Criteria

1. WHEN auditing API routes THEN the system SHALL identify all routes using createClient()
2. WHEN auditing queries THEN the system SHALL identify all uses of .single()
3. WHEN auditing auth checks THEN the system SHALL identify routes missing proper guards
4. WHEN the audit is complete THEN the system SHALL provide a list of all files requiring changes
5. WHEN fixes are applied THEN the system SHALL verify each identified issue is resolved
