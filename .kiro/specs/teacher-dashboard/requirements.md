# Requirements Document

## Introduction

This specification defines enhancements to the existing course builder (Prompt 19) to include additional fields for better course organization, targeting, and presentation. The enhancements focus on improving course discoverability, providing more detailed course information, and enabling better targeting of specific student demographics.

## Glossary

- **Course_Builder**: The teacher-facing interface for creating and editing courses
- **Basic_Info_Form**: The first step of the course creation wizard that collects fundamental course information
- **Course_Subtitle**: A short, descriptive tagline that appears below the course title
- **Course_Category**: A classification system for organizing courses with support for custom categories
- **Course_Language**: The primary language of instruction for the course
- **Target_Students**: Demographic information about the intended audience for the course
- **Age_Group**: Age range classifications for course targeting
- **Student_Type**: Classification of students by enrollment type (online school, spoken English, tuition)
- **Course_Highlights**: Key features or benefits of the course displayed as bullet points
- **Course_Outcomes**: Specific skills or competencies students will gain upon completion
- **Category_Management**: Administrative interface for creating and managing course categories

## Requirements

### Requirement 1

**User Story:** As a teacher, I want to add a subtitle to my course, so that I can provide a compelling tagline that helps students understand the course value at a glance.

#### Acceptance Criteria

1. WHEN creating a course, THE Basic_Info_Form SHALL display a subtitle input field below the course title
2. WHEN entering a subtitle, THE Basic_Info_Form SHALL enforce a maximum length of 150 characters
3. WHEN the subtitle exceeds 150 characters, THE Basic_Info_Form SHALL prevent further input and display a character count
4. WHEN saving the course, THE Course_Builder SHALL validate that the subtitle is between 10 and 150 characters
5. WHEN displaying the course, THE Platform SHALL show the subtitle below the title on course cards and detail pages

### Requirement 2

**User Story:** As a teacher, I want to select from existing categories or create new ones, so that I can properly classify my course and help students find it easily.

#### Acceptance Criteria

1. WHEN selecting a category, THE Basic_Info_Form SHALL display a dropdown with all active categories from the database
2. WHEN no suitable category exists, THE Basic_Info_Form SHALL provide an "Add New Category" option in the dropdown
3. WHEN "Add New Category" is selected, THE Basic_Info_Form SHALL open a modal dialog for category creation
4. WHEN creating a category, THE Category_Management SHALL collect category name, icon, description, and color
5. WHEN submitting a new category, THE Platform SHALL save it to the database and make it immediately available for selection

### Requirement 3

**User Story:** As an administrator, I want to manage course categories centrally, so that I can maintain a consistent and organized course catalog.

#### Acceptance Criteria

1. WHEN accessing category management, THE Category_Management SHALL display all categories with their metadata
2. WHEN creating a category, THE Category_Management SHALL validate that the category name is unique
3. WHEN uploading a category icon, THE Category_Management SHALL accept image files up to 1MB in size
4. WHEN selecting a category color, THE Category_Management SHALL provide a color picker interface
5. WHEN deactivating a category, THE Category_Management SHALL soft-delete it while preserving existing course associations

### Requirement 4

**User Story:** As a teacher, I want to specify the language of instruction, so that students can find courses taught in their preferred language.

#### Acceptance Criteria

1. WHEN creating a course, THE Basic_Info_Form SHALL display a language selection dropdown
2. WHEN selecting a language, THE Basic_Info_Form SHALL offer options for English, Urdu, Arabic, Hindi, and Other
3. WHEN "Other" is selected, THE Basic_Info_Form SHALL provide a text input for specifying the language
4. WHEN saving the course, THE Course_Builder SHALL validate that a language is selected
5. WHEN displaying courses, THE Platform SHALL show the language as a filter option and course attribute

### Requirement 5

**User Story:** As a teacher, I want to specify target age groups for my course, so that parents and students can determine if the course is age-appropriate.

#### Acceptance Criteria

1. WHEN creating a course, THE Basic_Info_Form SHALL display age group selection with predefined ranges
2. WHEN selecting age groups, THE Basic_Info_Form SHALL allow multiple selections from the available ranges
3. WHEN no age group is selected, THE Basic_Info_Form SHALL display a validation error
4. WHEN saving the course, THE Course_Builder SHALL store all selected age groups as an array
5. WHEN displaying courses, THE Platform SHALL show age groups as filterable attributes

### Requirement 6

**User Story:** As a teacher, I want to specify which student types my course targets, so that the right audience can discover my course.

#### Acceptance Criteria

1. WHEN creating a course, THE Basic_Info_Form SHALL display checkboxes for Online School Students, Spoken English Learners, and Tuition Students
2. WHEN selecting student types, THE Basic_Info_Form SHALL require at least one type to be selected
3. WHEN no student type is selected, THE Basic_Info_Form SHALL display a validation error
4. WHEN saving the course, THE Course_Builder SHALL store all selected student types as an array
5. WHEN displaying courses, THE Platform SHALL filter courses based on the current user's student type

### Requirement 7

**User Story:** As a teacher, I want to add course highlights, so that I can showcase the key features and benefits of my course.

#### Acceptance Criteria

1. WHEN creating a course, THE Basic_Info_Form SHALL display a dynamic list for adding course highlights
2. WHEN adding a highlight, THE Basic_Info_Form SHALL enforce a maximum length of 100 characters per item
3. WHEN managing highlights, THE Basic_Info_Form SHALL require a minimum of 3 and maximum of 10 highlights
4. WHEN adding a highlight, THE Basic_Info_Form SHALL optionally allow selection of an icon from a predefined library
5. WHEN displaying the course, THE Platform SHALL show highlights as bullet points with icons on the course detail page

### Requirement 8

**User Story:** As a teacher, I want to specify course outcomes separately from learning objectives, so that students understand what skills they will gain.

#### Acceptance Criteria

1. WHEN creating a course, THE Basic_Info_Form SHALL display a separate section for course outcomes distinct from learning objectives
2. WHEN adding outcomes, THE Basic_Info_Form SHALL require a minimum of 3 and maximum of 8 outcomes
3. WHEN entering an outcome, THE Basic_Info_Form SHALL provide guidance that outcomes describe skills students will have after completion
4. WHEN saving the course, THE Course_Builder SHALL validate that outcomes are distinct from learning objectives
5. WHEN displaying the course, THE Platform SHALL show outcomes in a dedicated section emphasizing student competencies

### Requirement 9

**User Story:** As a teacher, I want the enhanced grade/level field to include all student categories, so that I can target courses to specific educational levels including spoken English and tuition students.

#### Acceptance Criteria

1. WHEN selecting grade/level, THE Basic_Info_Form SHALL display options for Pre-Nursery, Nursery, LKG, UKG, and Grades 1-10
2. WHEN the category is Spoken English, THE Basic_Info_Form SHALL include "Spoken English - All Ages" as a grade option
3. WHEN the category is Tuition, THE Basic_Info_Form SHALL include "Tuition - Custom" as a grade option
4. WHEN saving the course, THE Course_Builder SHALL validate that the selected grade is appropriate for the course category
5. WHEN displaying courses, THE Platform SHALL use the grade/level for filtering and organization

### Requirement 10

**User Story:** As a developer, I want the database schema updated to support all new fields, so that course data is properly stored and retrievable.

#### Acceptance Criteria

1. WHEN the migration runs, THE Platform SHALL add a subtitle column to the courses table
2. WHEN the migration runs, THE Platform SHALL add a language column with a default value of 'English'
3. WHEN the migration runs, THE Platform SHALL add an age_group column as a text array
4. WHEN the migration runs, THE Platform SHALL add a student_types column as a text array
5. WHEN the migration runs, THE Platform SHALL add a highlights column as JSONB for storing highlight text and icons

### Requirement 11

**User Story:** As a developer, I want a dedicated course_categories table, so that categories can be managed dynamically without code changes.

#### Acceptance Criteria

1. WHEN the migration runs, THE Platform SHALL create a course_categories table with id, name, slug, description, icon_url, color, is_active, display_order, and created_at columns
2. WHEN a category is created, THE Platform SHALL generate a unique slug from the category name
3. WHEN categories are queried, THE Platform SHALL order them by display_order and then alphabetically
4. WHEN a category is soft-deleted, THE Platform SHALL set is_active to false without removing the record
5. WHEN courses reference categories, THE Platform SHALL use the category slug as the foreign key

### Requirement 12

**User Story:** As a developer, I want validation schemas updated, so that all new fields are properly validated on the client and server.

#### Acceptance Criteria

1. WHEN validating course data, THE Platform SHALL enforce subtitle length between 10 and 150 characters
2. WHEN validating course data, THE Platform SHALL require language selection from the allowed options
3. WHEN validating course data, THE Platform SHALL require at least one age group selection
4. WHEN validating course data, THE Platform SHALL require at least one student type selection
5. WHEN validating course data, THE Platform SHALL enforce highlights array length between 3 and 10 items

### Requirement 13

**User Story:** As a developer, I want API routes for category management, so that administrators can create and manage categories through the interface.

#### Acceptance Criteria

1. WHEN accessing GET /api/admin/categories, THE Platform SHALL return all active categories ordered by display_order
2. WHEN posting to POST /api/admin/categories, THE Platform SHALL create a new category with admin authentication
3. WHEN accessing PATCH /api/admin/categories/[id], THE Platform SHALL update the specified category
4. WHEN accessing DELETE /api/admin/categories/[id], THE Platform SHALL soft-delete the category by setting is_active to false
5. WHEN creating or updating categories, THE Platform SHALL validate that category names are unique
