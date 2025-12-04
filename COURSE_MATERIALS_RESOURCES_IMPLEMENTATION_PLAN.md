# Course Materials & Resources System - Implementation Plan

## 📋 Overview

Comprehensive materials and resources management system for courses including enhanced PDFs, worksheets, quizzes, assignments, and additional resources.

**Estimated Time**: 20-30 hours  
**Complexity**: High  
**Priority**: High

---

## 🎯 Scope

### New Features

1. **Worksheets System** (NEW)
   - Create/upload worksheets
   - Student submissions
   - Teacher grading
   - Answer keys

2. **Enhanced PDF Management**
   - Advanced viewer
   - Annotations
   - Access control
   - Organization

3. **Enhanced Quiz System**
   - Question bank mode
   - New question types
   - Advanced grading
   - Analytics

4. **Enhanced Assignments**
   - Video/audio assignments
   - Rubric system
   - Peer review
   - Group assignments

5. **Additional Resources Library**
   - External links
   - Downloadable files
   - Reference materials
   - Software/tools

---

## 📊 Implementation Phases

### Phase 1: Database Schema (Priority: HIGH)
**Estimated Time**: 3-4 hours

**Tasks**:
1. Create worksheets table
2. Create worksheet_submissions table
3. Enhance assignments table
4. Create course_resources table
5. Enhance quizzes tables
6. Add indexes and RLS policies

### Phase 2: Type Definitions (Priority: HIGH)
**Estimated Time**: 2-3 hours

**Tasks**:
1. Worksheet types
2. Enhanced assignment types
3. Enhanced quiz types
4. Resource types
5. Submission types

### Phase 3: Teacher Components - Worksheets (Priority: HIGH)
**Estimated Time**: 4-5 hours

**Tasks**:
1. WorksheetsManager component
2. WorksheetForm component
3. WorksheetSubmissionsViewer component
4. WorksheetGrading component

### Phase 4: Teacher Components - Resources (Priority: HIGH)
**Estimated Time**: 3-4 hours

**Tasks**:
1. ResourcesLibrary component
2. ResourceForm component
3. ResourceOrganizer component

### Phase 5: Enhanced Components (Priority: MEDIUM)
**Estimated Time**: 4-5 hours

**Tasks**:
1. Update QuizBuilder (question bank, new types)
2. Update AssignmentForm (rubric, peer review)
3. Enhanced PDFViewer component

### Phase 6: API Routes (Priority: HIGH)
**Estimated Time**: 4-5 hours

**Tasks**:
1. Worksheets CRUD endpoints
2. Worksheet submissions endpoints
3. Resources CRUD endpoints
4. Enhanced assignments endpoints
5. Enhanced quizzes endpoints

### Phase 7: Student Interface (Priority: MEDIUM)
**Estimated Time**: 3-4 hours

**Tasks**:
1. Student worksheets page
2. Student resources page
3. Worksheet submission interface
4. Enhanced PDF viewer

### Phase 8: Testing & Documentation (Priority: MEDIUM)
**Estimated Time**: 2-3 hours

**Tasks**:
1. Unit tests
2. Integration tests
3. User documentation
4. API documentation

---

## 📁 Files to Create/Modify

### Database (1 file)
- `supabase/migrations/20250107000001_course_materials_resources.sql` (NEW)

### Type Definitions (2 files)
- `types/materials.ts` (NEW)
- `types/course.ts` (UPDATE)

### Teacher Components (8 NEW files)
- `components/teacher/course-builder/WorksheetsManager.tsx`
- `components/teacher/course-builder/WorksheetForm.tsx`
- `components/teacher/course-builder/WorksheetSubmissionsViewer.tsx`
- `components/teacher/course-builder/ResourcesLibrary.tsx`
- `components/teacher/course-builder/ResourceForm.tsx`
- `components/teacher/course-builder/EnhancedPDFViewer.tsx`
- `components/teacher/course-builder/RubricBuilder.tsx`
- `components/teacher/course-builder/QuestionBankManager.tsx`

### Updated Components (3 files)
- `components/teacher/course-builder/QuizBuilder.tsx` (UPDATE)
- `components/teacher/course-builder/AssignmentForm.tsx` (UPDATE)
- `components/teacher/course-builder/LessonModal.tsx` (UPDATE)

### API Routes (12 NEW files)
- `app/api/teacher/courses/[id]/worksheets/route.ts`
- `app/api/teacher/courses/[id]/worksheets/[worksheetId]/route.ts`
- `app/api/teacher/courses/[id]/worksheets/[worksheetId]/submissions/route.ts`
- `app/api/teacher/courses/[id]/resources/route.ts`
- `app/api/teacher/courses/[id]/resources/[resourceId]/route.ts`
- `app/api/student/courses/[id]/worksheets/route.ts`
- `app/api/student/courses/[id]/worksheets/[worksheetId]/submit/route.ts`
- `app/api/student/courses/[id]/resources/route.ts`

### Student Components (4 NEW files)
- `app/(dashboard)/student/courses/[id]/worksheets/page.tsx`
- `app/(dashboard)/student/courses/[id]/resources/page.tsx`
- `components/student/worksheets/WorksheetCard.tsx`
- `components/student/worksheets/WorksheetSubmissionForm.tsx`

### Utilities (2 NEW files)
- `lib/materials/worksheet-utils.ts`
- `lib/materials/resource-utils.ts`

**Total**: ~30 files (23 new, 7 updated)

---

## 🗄️ Database Schema

### 1. Worksheets Table
```sql
CREATE TABLE worksheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id),
  lesson_id UUID REFERENCES lessons(id),
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT, -- 'easy', 'medium', 'hard'
  estimated_minutes INTEGER,
  worksheet_file_url TEXT NOT NULL,
  answer_key_url TEXT,
  instructions TEXT,
  requires_submission BOOLEAN DEFAULT FALSE,
  download_allowed BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Worksheet Submissions Table
```sql
CREATE TABLE worksheet_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worksheet_id UUID REFERENCES worksheets(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_file_url TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  grade DECIMAL(5,2),
  max_grade DECIMAL(5,2) DEFAULT 100,
  teacher_feedback TEXT,
  status TEXT DEFAULT 'submitted', -- 'submitted', 'graded', 'resubmit_requested'
  graded_at TIMESTAMP,
  graded_by UUID REFERENCES users(id),
  resubmission_count INTEGER DEFAULT 0
);
```

### 3. Enhanced Assignments Table
```sql
ALTER TABLE assignments 
ADD COLUMN assignment_type TEXT DEFAULT 'file', -- 'file', 'text', 'video', 'audio', 'project'
ADD COLUMN rubric JSONB, -- {criteria: [{name, description, points, weight}]}
ADD COLUMN enable_peer_review BOOLEAN DEFAULT FALSE,
ADD COLUMN peer_review_count INTEGER DEFAULT 2,
ADD COLUMN is_group_assignment BOOLEAN DEFAULT FALSE,
ADD COLUMN group_size INTEGER,
ADD COLUMN allow_late_submission BOOLEAN DEFAULT TRUE,
ADD COLUMN late_penalty_percentage DECIMAL(5,2);
```

### 4. Course Resources Table
```sql
CREATE TABLE course_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'link', 'file', 'reference', 'tool'
  resource_category TEXT, -- 'required', 'optional', 'supplementary'
  title TEXT NOT NULL,
  description TEXT,
  resource_url TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  module_id UUID REFERENCES modules(id),
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Enhanced Quizzes
```sql
ALTER TABLE quizzes 
ADD COLUMN question_bank_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN questions_per_attempt INTEGER,
ADD COLUMN enable_negative_marking BOOLEAN DEFAULT FALSE,
ADD COLUMN negative_marks_value DECIMAL(3,2),
ADD COLUMN enable_partial_credit BOOLEAN DEFAULT FALSE;

ALTER TABLE quiz_questions 
ADD COLUMN question_weight DECIMAL(5,2) DEFAULT 1.0,
ADD COLUMN media_url TEXT, -- for image/audio questions
ADD COLUMN question_subtype TEXT; -- 'standard', 'image_based', 'audio', 'hotspot', 'matching', 'ordering'
```

---

## 🎨 Key Features

### Worksheets System

**Teacher Features**:
- Upload worksheets (PDF, DOC, images)
- Upload answer keys (hidden from students)
- Set difficulty level and estimated time
- Require submission or just downloadable
- Grade submissions with feedback
- Request resubmissions

**Student Features**:
- View all worksheets
- Download worksheets
- Submit completed worksheets
- View grades and feedback
- Resubmit if requested

### Enhanced PDF Management

**Features**:
- Zoom in/out
- Full-screen mode
- Page navigation
- Search within PDF
- Highlight text
- Add annotations
- Download/print controls
- Attach to multiple lessons

### Enhanced Quiz System

**New Question Types**:
- Image-based MCQ
- Audio questions
- Fill-in-the-blank
- Matching pairs
- Ordering/sequence
- Hotspot (click on image)

**Advanced Features**:
- Question bank mode
- Random question selection
- Timed sections
- Partial credit
- Negative marking
- Weighted questions
- Analytics

### Enhanced Assignments

**New Types**:
- Video assignments
- Audio assignments
- Project assignments (multiple files)

**New Features**:
- Rubric-based grading
- Peer review system
- Group assignments
- Late submission penalties

### Additional Resources

**Types**:
- External links
- Downloadable files
- Reference materials
- Software/tools

**Organization**:
- By category
- By module
- Required vs optional

---

## 🔧 Technical Considerations

### Performance
- Lazy load worksheets and resources
- Paginate submissions
- Cache frequently accessed resources
- Optimize PDF rendering

### Storage
- Implement file size limits
- Use compression for PDFs
- Clean up unused files
- Monitor storage usage

### Security
- Validate file types
- Scan for malware
- Enforce access control
- Secure file URLs

### Accessibility
- PDF text extraction
- Screen reader support
- Keyboard navigation
- Alt text for images

---

## 📈 Success Metrics

- ✅ All worksheet features working
- ✅ Submission and grading flow complete
- ✅ Enhanced PDF viewer functional
- ✅ Quiz enhancements working
- ✅ Assignment rubrics functional
- ✅ Resources library organized
- ✅ Student interface intuitive
- ✅ Performance optimized

---

## ⚠️ Risks & Mitigation

### Risk 1: Large File Uploads
**Mitigation**: Implement chunked uploads, file size limits, compression

### Risk 2: Storage Costs
**Mitigation**: Set quotas, implement cleanup, use efficient formats

### Risk 3: Complex Grading
**Mitigation**: Clear rubric UI, auto-calculation, validation

### Risk 4: Performance Issues
**Mitigation**: Lazy loading, pagination, caching, optimization

---

## 🚀 Deployment Strategy

### Phase 1: Database Migration
1. Run migration on staging
2. Test with sample data
3. Verify backward compatibility
4. Deploy to production

### Phase 2: Backend APIs
1. Deploy API routes
2. Test CRUD operations
3. Verify permissions

### Phase 3: Teacher Interface
1. Deploy teacher components
2. Test worksheet creation
3. Test grading flow

### Phase 4: Student Interface
1. Deploy student components
2. Test submission flow
3. Verify access control

### Phase 5: Testing & Rollout
1. Beta test with teachers
2. Gather feedback
3. Fix issues
4. Full rollout

---

## 📝 Next Steps

1. **Review and approve** this plan
2. **Start with Phase 1**: Database schema
3. **Implement incrementally**: One phase at a time
4. **Test thoroughly**: Each phase before moving forward
5. **Document**: As we build

---

**Status**: Planning Complete - Ready for Implementation  
**Estimated Total Time**: 20-30 hours  
**Complexity**: High  
**Priority**: High  
**Date**: January 6, 2025
