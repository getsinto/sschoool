# Implementation Plan

- [ ] 1. Fix critical /api/notifications routes
  - Fix missing await on createClient() calls
  - Add proper auth guards
  - Replace single() with maybeSingle() where appropriate
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 2. Create reusable auth guard utility
  - Create lib/api/auth-guard.ts with requireAuth function
  - Add proper error handling and logging
  - Export TypeScript types for auth results
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Create safe query utilities
  - Create lib/api/safe-queries.ts with findOne and requireOne functions
  - Add proper error handling for PGRST116
  - Add TypeScript generics for type safety
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 4. Audit and fix all API routes with missing await
  - Search for all createClient() calls without await
  - Add await keyword to each instance
  - Test each fixed route
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. Replace unsafe single() calls with maybeSingle()
  - Identify all .single() calls in API routes
  - Replace with .maybeSingle() and add null checks
  - Handle 404 cases appropriately
  - _Requirements: 3.1, 3.2, 3.5_

- [ ] 6. Fix role query patterns
  - Update user/profile routes to use maybeSingle()
  - Add null checks for missing role records
  - Return appropriate errors for missing roles
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Standardize error responses
  - Create error response utility function
  - Update all routes to use consistent error format
  - Ensure proper HTTP status codes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Test fixes locally in production mode
  - Run npm run build to create production bundle
  - Run npm start to test production server
  - Test unauthenticated requests
  - Test authenticated requests
  - Test edge cases (no results, missing roles)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Deploy and verify on Vercel
  - Commit and push changes
  - Monitor Vercel deployment logs
  - Test /api/notifications endpoint
  - Verify no 500 errors in production
  - Check Vercel function logs for any remaining issues
  - _Requirements: All_

- [ ] 10. Create documentation for future development
  - Document auth guard pattern
  - Document safe query patterns
  - Add examples to README
  - Create code snippets for common patterns
  - _Requirements: 5.5_
