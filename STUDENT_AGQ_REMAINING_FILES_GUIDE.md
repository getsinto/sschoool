# Student AGQ - Remaining Files Implementation Guide

## Completed So Far (6/40)
1. ✅ components/student/shared/StatCard.tsx
2. ✅ components/student/shared/FilterBar.tsx
3. ✅ components/student/assignments/AssignmentCard.tsx
4. ✅ components/student/assignments/SubmissionHistory.tsx
5. ✅ components/student/quizzes/QuizCard.tsx
6. ✅ components/student/quizzes/ResultsBreakdown.tsx

## Remaining Files (34/40)

### Priority 1: Core Pages (8 files)
These are the main user-facing pages that tie everything together.

1. **app/(dashboard)/student/assignments/page.tsx**
   - Import: AssignmentCard, StatCard, FilterBar
   - Features: Summary cards, tabs, filtering, sorting
   - API: GET /api/student/assignments

2. **app/(dashboard)/student/quizzes/page.tsx**
   - Import: QuizCard, StatCard, FilterBar
   - Features: Summary stats, tabs (Available/Completed/Failed)
   - API: GET /api/student/quizzes

3. **app/(dashboard)/student/grades/page.tsx**
   - Import: GradeCard, PerformanceChart, StatCard
   - Features: GPA display, course grades, trends
   - API: GET /api/student/grades

4. **app/(dashboard)/student/assignments/[id]/page.tsx**
   - Reuse: AssignmentSubmission from learning interface
   - Add: SubmissionHistory, course context
   - API: GET /api/student/assignments/[id]

5. **app/(dashboard)/student/quizzes/[id]/results/page.tsx**
   - Import: ResultsBreakdown, AttemptComparison
   - Features: Detailed results, all attempts
   - API: GET /api/student/quizzes/[id]/results

6. **app/(dashboard)/student/grades/[itemId]/page.tsx**
   - Import: GradeDetailsModal content
   - Features: Rubric, feedback, regrade request
   - API: GET /api/student/grades/[itemId]

7. **app/(dashboard)/student/grades/report/page.tsx**
   - Import: ReportCard
   - Features: Formal report, print/PDF export
   - API: GET /api/student/grades/report

8. **app/(dashboard)/student/assignments/calendar/page.tsx**
   - Import: DueDateCalendar
   - Features: Calendar view of assignments
   - API: GET /api/student/assignments

### Priority 2: Remaining Components (8 files)

9. **components/student/assignments/DueDateCalendar.tsx**
   - Use: react-calendar or similar
   - Features: Monthly view, color-coded urgency
   - Props: assignments array

10. **components/student/quizzes/AttemptComparison.tsx**
    - Features: Side-by-side attempt comparison
    - Props: attempts array
    - Display: Score trends, improvement

11. **components/student/grades/GradeCard.tsx**
    - Features: Course grade display
    - Props: course, grade, breakdown
    - Display: Overall grade, components

12. **components/student/grades/PerformanceChart.tsx**
    - Use: recharts or chart.js
    - Features: Line/bar chart of grades over time
    - Props: grades data, timeframe

13. **components/student/grades/ReportCard.tsx**
    - Features: Formal report card layout
    - Props: student info, all grades
    - Display: Print-friendly format

14. **components/student/grades/GradeTrendChart.tsx**
    - Use: recharts
    - Features: Trend visualization
    - Props: trend data

15. **components/student/grades/PerformanceInsights.tsx**
    - Features: AI-driven insights display
    - Props: insights array
    - Display: Strengths, weaknesses, recommendations

16. **components/student/grades/GradeDetailsModal.tsx**
    - Features: Modal with detailed grade info
    - Props: grade item, rubric, feedback
    - Actions: Close, request regrade

### Priority 3: API Routes (16 files)

17-32. **API Routes** (See detailed specs below)

### Priority 4: Utilities (2 files)

33. **lib/student/gradeCalculations.ts**
34. **lib/student/performanceAnalytics.ts**

## API Routes Specifications

### Assignments APIs

**app/api/student/assignments/route.ts**
```typescript
// GET - List all assignments with filtering
// Query: status, courseId, sort, order, search
// Response: { assignments[], summary }
```

**app/api/student/assignments/[id]/submissions/route.ts**
```typescript
// GET - Get all submission attempts
// Response: { submissions[] }
```

**app/api/student/assignments/[id]/regrade/route.ts**
```typescript
// POST - Request regrade
// Body: { reason, details }
// Response: { success, requestId }
```

### Quizzes APIs

**app/api/student/quizzes/route.ts**
```typescript
// GET - List all quizzes
// Query: status, courseId, sort
// Response: { quizzes[], summary }
```

**app/api/student/quizzes/[id]/attempts/route.ts**
```typescript
// GET - Get all quiz attempts
// Response: { attempts[] }
```

### Grades APIs

**app/api/student/grades/route.ts**
```typescript
// GET - Get all grades and summary
// Response: { overall, courses[], trends[], insights[] }
```

**app/api/student/grades/[courseId]/route.ts**
```typescript
// GET - Get grades for specific course
// Response: { course, grades[], breakdown }
```

**app/api/student/grades/[itemId]/route.ts**
```typescript
// GET - Get detailed grade for specific item
// Response: { grade, rubric, feedback, classAverage }
```

**app/api/student/grades/report/route.ts**
```typescript
// GET - Generate report card
// Query: format (pdf|html)
// Response: Report data or PDF file
```

**app/api/student/grades/export/route.ts**
```typescript
// GET - Export grades
// Query: format (csv|excel)
// Response: Downloadable file
```

**app/api/student/grades/trends/route.ts**
```typescript
// GET - Get performance trends
// Query: timeframe
// Response: { trends[] }
```

**app/api/student/grades/insights/route.ts**
```typescript
// GET - Get AI-generated insights
// Response: { insights[], recommendations[] }
```

## Utility Functions

**lib/student/gradeCalculations.ts**
```typescript
export function calculateGPA(grades: Grade[]): number
export function calculateAverage(grades: Grade[]): number
export function calculateTrend(grades: Grade[]): TrendData
export function predictFinalGrade(current: Grade[], remaining: number): number
```

**lib/student/performanceAnalytics.ts**
```typescript
export function analyzeStrengths(grades: Grade[]): string[]
export function analyzeWeaknesses(grades: Grade[]): string[]
export function generateRecommendations(analysis: Analysis): string[]
export function compareToClassAverage(student: number, class: number): Comparison
```

## Implementation Notes

### Common Patterns

1. **All Pages**: Use 'use client' directive
2. **API Routes**: Follow NextJS 13+ App Router pattern
3. **Error Handling**: Try-catch with user-friendly messages
4. **Loading States**: Show skeletons/spinners
5. **Empty States**: Friendly messages with CTAs

### Styling

- Use Tailwind CSS classes
- Follow existing component patterns
- Maintain consistent spacing (p-4, p-6, gap-4, etc.)
- Use color scheme: blue (primary), green (success), red (error), yellow (warning)

### Data Fetching

- Use fetch API in client components
- Use NextJS route handlers for API routes
- Implement proper error handling
- Show loading states

### Responsive Design

- Mobile-first approach
- Use grid/flex with responsive breakpoints
- Collapsible sections on mobile
- Touch-friendly buttons

## Testing Checklist

- [ ] All pages render without errors
- [ ] All API routes return correct data
- [ ] Filtering and sorting work
- [ ] Mobile responsive
- [ ] Loading states display
- [ ] Error handling works
- [ ] Empty states show correctly
- [ ] Navigation between pages works

## Completion Status

**Current**: 6/40 files (15%)
**Remaining**: 34 files (85%)

**Estimated Time**: 8-10 hours for remaining files
