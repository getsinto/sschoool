# Implementation Plan

- [x] 1. Fix critical API routes with missing await


  - Fix chatbot message API to await createClient()
  - Fix notifications API to await createClient()
  - Add proper guest access handling to chatbot
  - _Requirements: 1.1, 1.3_



- [ ] 2. Fix user role API query pattern
  - Replace .single() with .maybeSingle() in user role route
  - Add null check for missing user records


  - Return 404 when user profile doesn't exist
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 3. Audit and fix all API routes with createClient()


  - Search for all createClient() calls without await
  - Add await to each instance
  - Verify auth.getUser() error handling
  - _Requirements: 1.1, 1.2, 5.1_



- [ ] 4. Audit and fix all .single() usage
  - Find all .single() calls in API routes
  - Determine which should be .maybeSingle()
  - Replace and add null checks
  - Keep .single() only where record MUST exist
  - _Requirements: 2.1, 2.2, 2.3, 5.2_

- [ ] 5. Add consistent error handling
  - Ensure all routes have try-catch blocks
  - Add proper error logging with context
  - Verify HTTP status codes are appropriate
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Test locally in production mode
  - Run npm run build
  - Run npm start
  - Test chatbot API (guest and authenticated)
  - Test notifications API
  - Test user role API
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7. Deploy and verify in Vercel
  - Commit and push changes
  - Monitor Vercel build logs
  - Test all three previously failing endpoints
  - Check Vercel error logs for the three errors
  - _Requirements: 4.4, 4.5_

- [ ] 8. Final verification checkpoint
  - Ensure all tests pass, ask the user if questions arise.
