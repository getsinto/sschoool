# 🚀 COMPREHENSIVE COURSE BUILDER - IMPLEMENTATION PLAN

## Phase 1: Foundation & Core Components (Priority 1)

### 1.1 Enhanced BasicInfoForm ✅ START HERE
- [ ] Add Short Description (150 chars with counter)
- [ ] Integrate TipTap rich text editor for Full Description
- [ ] Add Course Thumbnail upload with crop
- [ ] Add Intro Video (upload or URL)
- [ ] Add Learning Objectives (dynamic list)
- [ ] Add Prerequisites (dynamic list)
- [ ] Add Difficulty Level selector
- [ ] Add searchable subject select

### 1.2 LessonModal Component (CRITICAL)
- [ ] Create modal structure with tabs
- [ ] Basic Info tab
- [ ] Content tab (dynamic based on lesson type)
- [ ] Resources tab
- [ ] Settings tab
- [ ] Modal state management

### 1.3 VideoUploader Component (CRITICAL)
- [ ] Upload tab with drag-drop
- [ ] Progress bar
- [ ] Video preview player
- [ ] Thumbnail generation
- [ ] Embed tab (YouTube, Vimeo, Google Drive)
- [ ] Video settings (speed, quality, chapters)

### 1.4 DocumentUploader Component (CRITICAL)
- [ ] Multi-file drag-drop
- [ ] File preview
- [ ] Reorder files
- [ ] Delete files
- [ ] Set primary document

## Phase 2: Advanced Lesson Types (Priority 1)

### 2.1 QuizBuilder Component (CRITICAL)
- [ ] Quiz settings form
- [ ] Question list
- [ ] Add question modal
- [ ] Question types: MCQ, True/False, Short Answer, Multiple Response
- [ ] Options management
- [ ] Correct answer marking
- [ ] Points and explanation
- [ ] Drag-drop reorder questions

### 2.2 AssignmentForm Component (CRITICAL)
- [ ] Assignment settings
- [ ] Instructions with rich text
- [ ] Due date picker
- [ ] Submission type settings
- [ ] File upload settings
- [ ] Text entry settings
- [ ] Late submission settings
- [ ] Rubric builder

### 2.3 LiveClassForm Component
- [ ] Class settings
- [ ] Date/time picker
- [ ] Platform selection
- [ ] Meeting settings
- [ ] Reminder settings
- [ ] Attendance tracking

## Phase 3: Curriculum Management (Priority 1)

### 3.1 Enhanced CurriculumForm
- [ ] Left panel: Sections list
- [ ] Right panel: Section content
- [ ] Integrate LessonModal
- [ ] Section management

### 3.2 DragDropCurriculum Component (CRITICAL)
- [ ] Integrate react-beautiful-dnd
- [ ] Drag sections to reorder
- [ ] Drag lessons between sections
- [ ] Collapse/expand sections
- [ ] Edit inline
- [ ] Delete with confirmation
- [ ] Duplicate functionality

## Phase 4: Enhanced Pricing & Certificates (Priority 2)

### 4.1 Enhanced PricingForm
- [ ] Currency selection
- [ ] Payment models (subscription, installments)
- [ ] Discount settings
- [ ] Course validity
- [ ] Refund policy

### 4.2 Certificate Settings
- [ ] Award certificate toggle
- [ ] Template selector
- [ ] Completion requirements
- [ ] Certificate fields

## Phase 5: Enhanced Review & Publish (Priority 2)

### 5.1 Enhanced ReviewForm
- [ ] Total duration calculation
- [ ] Curriculum tree view
- [ ] Edit buttons for sections
- [ ] Detailed checklist
- [ ] Preview as Student button

### 5.2 CoursePreview Component
- [ ] Student view preview
- [ ] Navigation through lessons
- [ ] Preview mode indicator

## Phase 6: API Routes (Priority 1)

### 6.1 Upload Routes (CRITICAL)
- [ ] `/api/teacher/courses/upload-video/route.ts`
- [ ] `/api/teacher/courses/upload-document/route.ts`
- [ ] `/api/teacher/courses/upload-image/route.ts`

### 6.2 Section & Lesson Routes
- [ ] `/api/teacher/courses/[id]/sections/route.ts`
- [ ] `/api/teacher/courses/[id]/sections/[sectionId]/lessons/route.ts`
- [ ] `/api/teacher/courses/[id]/reorder/route.ts`

### 6.3 Publish Route
- [ ] `/api/teacher/courses/[id]/publish/route.ts`

## Phase 7: Advanced Features (Priority 3)

### 7.1 Auto-save Enhancement
- [ ] Enhanced auto-save every 30 seconds
- [ ] Save indicators
- [ ] Conflict resolution

### 7.2 Keyboard Shortcuts
- [ ] Ctrl+S to save
- [ ] Esc to close modals
- [ ] Shortcuts help modal

### 7.3 Undo/Redo
- [ ] History stack
- [ ] Undo/redo buttons
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

### 7.4 Mobile Responsive
- [ ] Simplified mobile interface
- [ ] Touch-friendly controls
- [ ] Mobile-optimized modals

## Implementation Order

### IMMEDIATE (Start Now):
1. ✅ Enhanced BasicInfoForm with all fields
2. ✅ LessonModal structure
3. ✅ VideoUploader component
4. ✅ DocumentUploader component
5. ✅ Upload API routes

### NEXT (After Immediate):
6. QuizBuilder component
7. AssignmentForm component
8. DragDropCurriculum component
9. Enhanced PricingForm with certificates
10. Enhanced ReviewForm

### LATER (After Core):
11. LiveClassForm component
12. CoursePreview component
13. Advanced features (undo/redo, shortcuts)
14. Mobile optimization

## Dependencies to Install

```bash
npm install @tiptap/react @tiptap/starter-kit
npm install react-beautiful-dnd
npm install react-hook-form zod @hookform/resolvers
npm install react-dropzone
npm install react-image-crop
```

## Estimated Timeline

- **Phase 1-2:** 2-3 days (Core components)
- **Phase 3:** 1 day (Curriculum management)
- **Phase 4-5:** 1 day (Pricing & Review)
- **Phase 6:** 1 day (API routes)
- **Phase 7:** 1-2 days (Advanced features)

**Total:** 6-8 days for complete implementation

## Starting Now...

I'll begin with Phase 1.1: Enhanced BasicInfoForm
