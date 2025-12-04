# Implementation Plan - Course Builder Enhancements

- [x] 1. Database schema updates and migrations



  - Create migration file for new course columns (subtitle, language, age_groups, student_types, highlights, outcomes)
  - Create course_categories table with all required columns
  - Add indexes for performance optimization
  - Create trigger for updated_at timestamp
  - Write migration to seed initial categories from existing course data





  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 2. Update TypeScript types and interfaces

  - Update Course interface in database.types.ts with new fields





  - Create CourseCategory interface
  - Create CourseHighlight interface
  - Update course validation schemas with new field validations
  - Create category validation schemas

  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 3. Implement category management API endpoints
- [x] 3.1 Create GET /api/admin/categories route

  - Implement route handler to fetch all active categories
  - Add query parameter for including inactive categories
  - Order results by display_order and name


  - Add error handling and logging
  - _Requirements: 13.1_


- [x] 3.2 Create POST /api/admin/categories route
  - Implement route handler for creating new categories

  - Add admin authentication middleware
  - Validate category name uniqueness
  - Handle icon file upload to storage
  - Generate slug from category name
  - _Requirements: 13.2, 13.5, 3.2, 3.3, 3.4_




- [x] 3.3 Create PATCH /api/admin/categories/[id] route
  - Implement route handler for updating categories

  - Add admin authentication middleware
  - Validate updated data



  - Handle icon replacement if provided

  - _Requirements: 13.3_

- [x] 3.4 Create DELETE /api/admin/categories/[id] route
  - Implement soft-delete by setting is_active to false
  - Add admin authentication middleware

  - Prevent deletion if categories are in use
  - _Requirements: 13.4, 3.5_

- [x] 3.5 Write API tests for category management
  - Test GET endpoint returns active categories

  - Test POST endpoint creates category with valid data
  - Test POST endpoint rejects duplicate names
  - Test PATCH endpoint updates category
  - Test DELETE endpoint soft-deletes category
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_



- [x] 4. Create CategoryModal component
- [x] 4.1 Build category creation modal UI
  - Create modal component with form fields (name, description, icon, color)
  - Add icon upload with preview



  - Implement color picker using a color input or library
  - Add form validation with error display
  - Create category badge preview
  - _Requirements: 2.3, 2.4, 3.2, 3.3, 3.4_

- [x] 4.2 Implement category creation logic


  - Connect form to POST /api/admin/categories endpoint

  - Handle file upload for icon
  - Show loading state during submission
  - Display success/error messages
  - Close modal and refresh category list on success
  - _Requirements: 2.5, 3.2, 3.3, 3.4_



- [x] 4.3 Write component tests for CategoryModal
  - Test modal opens and closes correctly
  - Test form validation works
  - Test icon upload preview
  - Test successful category creation
  - Test error handling


  - _Requirements: 2.3, 2.4, 2.5_

- [x] 5. Create IconSelector component
- [x] 5.1 Build icon selection interface
  - Create grid layout for displaying icons
  - Add search/filter functionality
  - Implement icon selection state

  - Show selected icon preview


  - Include common education icons (book, video, certificate, trophy, star, etc.)


  - _Requirements: 7.4_

- [x] 5.2 Integrate icon library
  - Use lucide-react or similar icon library
  - Create icon mapping object
  - Implement icon rendering from string identifier

  - Add fallback for missing icons
  - _Requirements: 7.4_

- [x] 5.3 Write component tests for IconSelector
  - Test icon grid renders correctly
  - Test icon selection updates state
  - Test search/filter functionality

  - Test selected icon preview
  - _Requirements: 7.4_

- [x] 6. Create AgeGroupSelector component
- [x] 6.1 Build age group multi-select interface

  - Create checkbox group with predefined age ranges
  - Add visual styling for selected groups
  - Implement validation for minimum one selection
  - Show validation error when none selected
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6.2 Implement age group state management

  - Handle multiple selections
  - Update parent form state
  - Validate on change and on submit
  - _Requirements: 5.2, 5.4_





- [x] 6.3 Write component tests for AgeGroupSelector

  - Test multiple selections work
  - Test validation requires at least one
  - Test visual feedback for selections
  - _Requirements: 5.1, 5.2, 5.3_


- [x] 7. Update BasicInfoForm component with new fields
- [x] 7.1 Add course subtitle field
  - Add subtitle input field below title

  - Implement character counter (10-150 chars)
  - Add real-time validation
  - Show error messages for invalid length
  - _Requirements: 1.1, 1.2, 1.3, 1.4_


- [x] 7.2 Enhance category selector
  - Replace static dropdown with dynamic category loading


  - Fetch categories from GET /api/admin/categories

  - Add "Add New Category" option at bottom of dropdown
  - Integrate CategoryModal component
  - Update category list after new category creation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7.3 Add language selector
  - Create language dropdown with options (English, Urdu, Arabic, Hindi, Other)
  - Add conditional text input for "Other" option
  - Implement validation for required selection

  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7.4 Add Target Students section
  - Create new section after grade/level
  - Integrate AgeGroupSelector component


  - Add student type checkboxes (Online School, Spoken English, Tuition)

  - Implement validation for at least one student type
  - Add section styling and layout
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

- [x] 7.5 Enhance grade/level selector
  - Add Pre-Nursery, Nursery, LKG, UKG options



  - Add conditional "Spoken English - All Ages" option
  - Add conditional "Tuition - Custom" option
  - Implement logic to show/hide options based on category
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 7.6 Add course highlights section
  - Create dynamic list for highlights (min 3, max 10)

  - Add text input with 100 char limit per highlight
  - Integrate IconSelector for optional icons
  - Implement add/remove functionality
  - Add drag-and-drop reordering
  - Show character counter per highlight
  - _Requirements: 7.1, 7.2, 7.3, 7.4_


- [x] 7.7 Add course outcomes section
  - Create dynamic list for outcomes (min 3, max 8)
  - Add guidance text explaining difference from objectives
  - Implement add/remove functionality
  - Add validation for min/max items
  - Style differently from learning objectives
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7.8 Update form validation
  - Add validation for all new fields
  - Implement Zod schema for enhanced course data
  - Show field-specific error messages
  - Prevent submission if validation fails
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 7.9 Write component tests for BasicInfoForm updates
  - Test subtitle field with character counter
  - Test category selector with modal integration
  - Test language selector with conditional input
  - Test age group and student type selections
  - Test highlights with icon selection
  - Test outcomes section
  - Test form validation for all new fields
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 4.1, 5.1, 6.1, 7.1, 8.1_

- [x] 8. Update course creation API endpoint




- [x] 8.1 Update POST /api/teacher/courses/create route
  - Add new fields to request body handling
  - Validate all new fields server-side
  - Save subtitle, language, age_groups, student_types, highlights, outcomes to database
  - Validate category exists and is active
  - Handle JSONB storage for highlights


  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 8.2 Update PATCH /api/teacher/courses/[id] route
  - Add new fields to update handling


  - Validate updated data
  - Preserve existing data for fields not being updated
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 8.3 Write API tests for course creation updates




  - Test course creation with all new fields
  - Test validation rejects invalid data
  - Test highlights stored correctly as JSONB
  - Test arrays stored correctly
  - Test category validation


  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 9. Update course display components
- [x] 9.1 Update course card component
  - Display subtitle below title
  - Show language badge
  - Display age group tags
  - Show category with icon and color


  - _Requirements: 1.5, 4.5, 5.5_

- [x] 9.2 Update course detail page
  - Display subtitle prominently





  - Show language information
  - Display target age groups
  - Show student types
  - Display highlights as bullet points with icons

  - Show outcomes in dedicated section
  - Style outcomes differently from objectives
  - _Requirements: 1.5, 4.5, 5.5, 6.5, 7.5, 8.5_

- [x] 9.3 Write component tests for display updates

  - Test course card shows new fields
  - Test course detail page shows all new information
  - Test highlights render with icons
  - Test outcomes section displays correctly
  - _Requirements: 1.5, 4.5, 5.5, 7.5, 8.5_



- [x] 10. Implement course filtering and search
- [x] 10.1 Add language filter to course search
  - Add language filter dropdown




  - Implement filter logic in API
  - Update UI to show filtered results
  - _Requirements: 4.5_

- [x] 10.2 Add age group filter to course search

  - Add age group filter checkboxes
  - Implement filter logic in API
  - Update UI to show filtered results
  - _Requirements: 5.5_


- [x] 10.3 Add student type filter to course search
  - Add student type filter
  - Implement filter logic in API
  - Show courses relevant to user's student type
  - _Requirements: 6.5_


- [x] 10.4 Write tests for filtering functionality
  - Test language filter works correctly




  - Test age group filter works correctly
  - Test student type filter works correctly
  - Test combined filters work together
  - _Requirements: 4.5, 5.5, 6.5_


- [x] 11. Data migration and backward compatibility
- [x] 11.1 Run database migrations
  - Execute migration to add new columns
  - Execute migration to create course_categories table
  - Seed initial categories from existing data

  - Set default values for existing courses
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 11.2 Test backward compatibility
  - Verify existing courses display correctly

  - Test that courses without new fields work properly
  - Verify teachers can update old courses with new fields
  - _Requirements: All requirements_

- [x] 11.3 Write migration tests
  - Test migration adds columns correctly
  - Test default values are set
  - Test existing data is preserved
  - Test categories are seeded correctly
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2_

- [x] 12. Performance optimization
- [x] 12.1 Implement category caching
  - Add React Query for category data
  - Cache categories with appropriate TTL
  - Invalidate cache on category creation/update
  - _Requirements: 2.1, 2.2_

- [x] 12.2 Optimize form rendering
  - Use React.memo for list items
  - Implement useCallback for handlers
  - Debounce validation checks
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 12.3 Optimize icon loading
  - Lazy load IconSelector component
  - Use SVG sprites for icons
  - Cache icon selections
  - _Requirements: 7.4_

- [x] 12.4 Write performance tests
  - Test form renders quickly with many fields
  - Test category loading is fast
  - Test icon selector performs well
  - _Requirements: All requirements_

- [x] 13. Security and validation
- [x] 13.1 Implement input sanitization
  - Sanitize all text inputs
  - Validate file uploads (type, size)
  - Prevent XSS in user-generated content
  - _Requirements: All requirements_

- [x] 13.2 Add authorization checks
  - Verify teacher role for course creation
  - Verify admin role for category management
  - Check course ownership for updates
  - _Requirements: 2.3, 2.4, 2.5, 3.2, 3.3, 3.4_

- [x] 13.3 Implement rate limiting
  - Add rate limiting to category creation
  - Add rate limiting to course creation
  - Add rate limiting to file uploads
  - _Requirements: 2.5, 3.2_

- [x] 13.4 Write security tests
  - Test unauthorized access is blocked
  - Test input sanitization works
  - Test file upload validation
  - Test rate limiting works
  - _Requirements: All requirements_

- [x] 14. Documentation and deployment
- [x] 14.1 Update API documentation
  - Document new category endpoints
  - Document updated course endpoints
  - Add request/response examples
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 14.2 Create user documentation
  - Write guide for using new course fields
  - Create guide for category management
  - Add screenshots and examples
  - _Requirements: All requirements_

- [x] 14.3 Deploy to staging
  - Run migrations on staging database
  - Deploy updated code to staging
  - Test all functionality in staging
  - _Requirements: All requirements_

- [x] 14.4 Deploy to production
  - Run migrations on production database
  - Deploy updated code to production
  - Monitor for errors and issues
  - _Requirements: All requirements_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
