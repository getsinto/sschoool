# Student Learning Interface - Design Document

## Overview

The Student Learning Interface is a comprehensive learning management system that enables students to browse enrolled courses, access various types of learning content (video, documents, quizzes, assignments, live classes), track progress, take notes, ask questions, and interact with course materials. The system provides a seamless learning experience across multiple lesson types with advanced features like auto-resume, progress tracking, and interactive learning tools.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Student Dashboard                        │
│                  (Course Catalog View)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─────────────────────────────────────────┐
                     │                                         │
          ┌──────────▼──────────┐                 ┌───────────▼──────────┐
          │  Course Detail View │                 │   Learning Interface  │
          │  (Overview/Curriculum)│                │  (Lesson Player)      │
          └──────────┬──────────┘                 └───────────┬──────────┘
                     │                                         │
                     │                            ┌────────────┼────────────┐
                     │                            │            │            │
                     │                    ┌───────▼──┐  ┌──────▼───┐  ┌────▼─────┐
                     │                    │  Video   │  │   PDF    │  │   Quiz   │
                     │                    │  Player  │  │  Viewer  │  │Interface │
                     │                    └──────────┘  └──────────┘  └──────────┘
                     │                            │            │            │
                     │                    ┌───────▼──┐  ┌──────▼───────────┘
                     │                    │Assignment│  │  Live Class      │
                     │                    │Submission│  │   Interface      │
                     │                    └──────────┘  └──────────────────┘
                     │                            │
                     └────────────────────────────┼────────────────────────┘
                                                  │
                                    ┌─────────────▼─────────────┐
                                    │   Supporting Features     │
                                    │  - Notes Panel            │
                                    │  - Q&A Panel              │
                                    │  - Progress Tracker       │
                                    │  - Resource Manager       │
                                    └───────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Hooks (useState, useEffect, useContext)
- **API Communication**: Next.js API Routes with fetch
- **Video Player**: Custom HTML5 video player
- **PDF Viewer**: react-pdf or custom PDF.js implementation
- **Rich Text Editor**: TipTap or Quill
- **File Upload**: react-dropzone

## Components and Interfaces

### 1. Page Components

#### 1.1 My Courses Page (`app/(dashboard)/student/courses/page.tsx`)

**Status**: Partially Implemented (needs enhancement)

**Purpose**: Display all enrolled courses with filtering, sorting, and search capabilities.

**Key Features**:
- Tab-based filtering (All, In Progress, Completed, Bookmarked)
- Search by course title
- Filter by category, grade, subject
- Sort by recently accessed, progress, newest
- Course cards with progress visualization
- Quick actions (Continue, View Details, Download Certificate)

**Data Flow**:
```
User Action → Filter/Sort State → API Call → Display Filtered Courses
```

**API Integration**:
- GET `/api/student/courses` with query parameters for filtering and sorting

#### 1.2 Course Detail Page (`app/(dashboard)/student/courses/[id]/page.tsx`)

**Status**: Implemented (complete)

**Purpose**: Display comprehensive course information including curriculum, resources, and announcements.

**Key Features**:
- Course header with progress and teacher info
- Tabbed interface (Overview, Curriculum, Resources, Announcements)
- Expandable curriculum tree with lesson status
- Continue learning button
- Certificate download (if completed)

**Data Flow**:
```
Course ID → API Call → Course Data → Render Tabs → User Interaction
```

**API Integration**:
- GET `/api/student/courses/[id]` for course details
- GET `/api/student/courses/[id]/curriculum` for curriculum structure

#### 1.3 Learning Interface (`app/(dashboard)/student/learn/[courseId]/[lessonId]/page.tsx`)

**Status**: Partially Implemented (needs major enhancements)

**Purpose**: Main learning interface where students consume lesson content.

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│                        Header Bar                            │
│  [Back] Course Title > Lesson Title        [Mark Complete]  │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                  │               │
│  Left    │      Main Content Area          │    Right      │
│ Sidebar  │                                  │   Sidebar     │
│          │   (Dynamic Lesson Content)       │               │
│ - Course │                                  │ - Resources   │
│   Tree   │   - Video Player                 │ - Notes       │
│ - Sections│   - PDF Viewer                  │ - Q&A         │
│ - Lessons│   - Quiz Interface               │ - Transcript  │
│ - Progress│   - Assignment Form             │               │
│          │   - Live Class Card              │               │
│          │                                  │               │
├──────────┴──────────────────────────────────┴───────────────┤
│              Navigation: [Previous] [Next]                   │
└─────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Collapsible sidebars
- Dynamic content rendering based on lesson type
- Keyboard navigation
- Progress auto-save
- Responsive design

**Data Flow**:
```
Lesson ID → API Call → Lesson Data → Render Appropriate Component → Track Progress
```

**API Integration**:
- GET `/api/student/learn/[lessonId]` for lesson content
- POST `/api/student/learn/[lessonId]/progress` for progress updates
- POST `/api/student/learn/[lessonId]/complete` to mark complete

### 2. Learning Components

#### 2.1 Video Player Component (`components/student/learning/VideoPlayer.tsx`)

**Status**: Needs Creation (enhanced version)

**Purpose**: Custom video player with advanced controls and progress tracking.

**Features**:
- Play/Pause, Seek, Volume controls
- Playback speed (0.5x - 2x)
- Quality selector
- Fullscreen and Picture-in-Picture
- Keyboard shortcuts
- Auto-resume from last position
- Progress tracking (save every 5 seconds)
- Video chapters navigation
- Synced transcript display

**Component Structure**:
```typescript
interface VideoPlayerProps {
  videoUrl: string
  lessonId: string
  lastPosition?: number
  chapters?: VideoChapter[]
  transcript?: TranscriptItem[]
  onProgressUpdate: (time: number) => void
  onComplete: () => void
}

interface VideoChapter {
  time: number
  title: string
}

interface TranscriptItem {
  time: string
  text: string
}
```

**State Management**:
```typescript
const [isPlaying, setIsPlaying] = useState(false)
const [currentTime, setCurrentTime] = useState(0)
const [duration, setDuration] = useState(0)
const [volume, setVolume] = useState(1)
const [playbackRate, setPlaybackRate] = useState(1)
const [quality, setQuality] = useState('auto')
```

**Key Methods**:
- `togglePlay()`: Play/pause video
- `handleSeek(time)`: Jump to specific time
- `saveProgress()`: Auto-save progress every 5 seconds
- `handleKeyboard(event)`: Handle keyboard shortcuts
- `toggleFullscreen()`: Enter/exit fullscreen
- `togglePiP()`: Enable picture-in-picture

#### 2.2 PDF Viewer Component (`components/student/learning/PDFViewer.tsx`)

**Status**: Needs Creation

**Purpose**: PDF document viewer with navigation and annotation tools.

**Features**:
- Page navigation (prev/next, jump to page)
- Zoom controls (in/out, fit-to-width, fit-to-height)
- Fullscreen mode
- Search within document
- Bookmarks
- Text highlighting
- Page notes
- Download and print (if allowed)
- Multiple document tabs

**Component Structure**:
```typescript
interface PDFViewerProps {
  documents: PDFDocument[]
  lessonId: string
  allowDownload?: boolean
  allowPrint?: boolean
  onComplete: () => void
}

interface PDFDocument {
  id: string
  title: string
  url: string
  pages: number
}

interface Bookmark {
  page: number
  title: string
}

interface Highlight {
  page: number
  text: string
  color: string
  position: { x: number; y: number; width: number; height: number }
}

interface PageNote {
  page: number
  content: string
  createdAt: string
}
```

**State Management**:
```typescript
const [currentPage, setCurrentPage] = useState(1)
const [totalPages, setTotalPages] = useState(0)
const [zoom, setZoom] = useState(1)
const [searchQuery, setSearchQuery] = useState('')
const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
const [highlights, setHighlights] = useState<Highlight[]>([])
const [notes, setNotes] = useState<PageNote[]>([])
```

#### 2.3 Quiz Interface Component (`components/student/learning/QuizInterface.tsx`)

**Status**: Needs Creation

**Purpose**: Interactive quiz-taking interface with multiple question types.

**Features**:
- Timer display (for timed quizzes)
- Question counter and progress bar
- Multiple question types (MCQ, Multiple Response, True/False, Short Answer)
- Question navigator
- Answer review before submission
- Results page with detailed feedback
- Retake functionality

**Component Structure**:
```typescript
interface QuizInterfaceProps {
  quizId: string
  lessonId: string
  onComplete: (score: number) => void
}

interface Quiz {
  id: string
  title: string
  instructions: string
  timeLimit?: number // in minutes
  questions: Question[]
  passingScore: number
  allowRetake: boolean
  showCorrectAnswers: boolean
}

interface Question {
  id: string
  type: 'mcq' | 'multiple_response' | 'true_false' | 'short_answer'
  text: string
  image?: string
  options?: string[] // for MCQ and multiple response
  correctAnswer: string | string[]
  explanation?: string
  points: number
}

interface QuizSubmission {
  answers: Record<string, string | string[]>
  timeSpent: number
  submittedAt: string
}

interface QuizResult {
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  timeSpent: number
  questionResults: QuestionResult[]
  feedback?: string
}

interface QuestionResult {
  questionId: string
  userAnswer: string | string[]
  correctAnswer: string | string[]
  isCorrect: boolean
  points: number
  earnedPoints: number
  explanation?: string
}
```

**State Management**:
```typescript
const [currentQuestion, setCurrentQuestion] = useState(0)
const [answers, setAnswers] = useState<Record<string, any>>({})
const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
const [isSubmitted, setIsSubmitted] = useState(false)
const [results, setResults] = useState<QuizResult | null>(null)
```

**Key Methods**:
- `handleAnswerChange(questionId, answer)`: Update answer
- `navigateToQuestion(index)`: Jump to specific question
- `submitQuiz()`: Submit quiz for grading
- `retakeQuiz()`: Reset and start over

#### 2.4 Assignment Submission Component (`components/student/learning/AssignmentSubmission.tsx`)

**Status**: Needs Creation

**Purpose**: Assignment submission interface with file upload and text entry.

**Features**:
- Due date countdown
- File upload with drag-drop
- Multiple file support
- Rich text editor for text entry
- Auto-save drafts
- Submission history
- Graded feedback view

**Component Structure**:
```typescript
interface AssignmentSubmissionProps {
  assignmentId: string
  lessonId: string
  onComplete: () => void
}

interface Assignment {
  id: string
  title: string
  instructions: string
  dueDate: string
  maxPoints: number
  submissionType: 'file' | 'text' | 'both'
  allowMultipleFiles: boolean
  maxFileSize: number // in MB
  allowedFileTypes: string[]
  maxAttempts: number
}

interface Submission {
  id: string
  submittedAt: string
  status: 'draft' | 'submitted' | 'graded'
  files?: UploadedFile[]
  textContent?: string
  grade?: number
  feedback?: string
  feedbackFiles?: string[]
  gradedAt?: string
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}
```

**State Management**:
```typescript
const [files, setFiles] = useState<File[]>([])
const [textContent, setTextContent] = useState('')
const [isDraft, setIsDraft] = useState(true)
const [submissions, setSubmissions] = useState<Submission[]>([])
const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null)
```

**Key Methods**:
- `handleFileUpload(files)`: Handle file selection
- `handleTextChange(content)`: Update text content
- `saveDraft()`: Auto-save draft
- `submitAssignment()`: Submit for grading
- `viewFeedback()`: Display graded feedback

#### 2.5 Live Class Card Component (`components/student/learning/LiveClassCard.tsx`)

**Status**: Needs Creation

**Purpose**: Display live class information and provide join/recording access.

**Features**:
- Class schedule display
- Countdown timer for upcoming classes
- Join button (enabled 15 min before)
- Live indicator for ongoing classes
- Recording playback for completed classes
- Add to calendar functionality
- Attendance status

**Component Structure**:
```typescript
interface LiveClassCardProps {
  liveClass: LiveClass
  lessonId: string
}

interface LiveClass {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number // in minutes
  platform: 'zoom' | 'google_meet' | 'teams'
  meetingUrl?: string
  meetingId?: string
  password?: string
  status: 'upcoming' | 'ongoing' | 'completed'
  recordingUrl?: string
  recordingDuration?: number
  allowRecordingDownload: boolean
  attendance?: {
    present: boolean
    joinedAt?: string
    leftAt?: string
  }
}
```

**State Management**:
```typescript
const [timeUntilStart, setTimeUntilStart] = useState<number>(0)
const [canJoin, setCanJoin] = useState(false)
const [isPlaying, setIsPlaying] = useState(false)
```

**Key Methods**:
- `calculateTimeUntilStart()`: Calculate countdown
- `joinClass()`: Open meeting link
- `addToCalendar()`: Generate calendar event
- `playRecording()`: Play recorded session

### 3. Supporting Components

#### 3.1 Notes Panel Component (`components/student/learning/NotesPanel.tsx`)

**Status**: Needs Enhancement

**Purpose**: Allow students to take notes during learning with timestamps and formatting.

**Features**:
- Rich text formatting
- Timestamp for video lessons
- Screenshot attachment
- Note tagging
- Search notes
- Download notes
- Share notes (optional)

**Component Structure**:
```typescript
interface NotesPanelProps {
  lessonId: string
  lessonType: 'video' | 'document' | 'quiz' | 'assignment' | 'live_class'
  currentTime?: number // for video lessons
}

interface Note {
  id: string
  lessonId: string
  content: string
  timestamp?: string // for video lessons
  tags: string[]
  screenshots: string[]
  createdAt: string
  updatedAt: string
}
```

#### 3.2 Q&A Panel Component (`components/student/learning/QAPanel.tsx`)

**Status**: Needs Creation

**Purpose**: Enable students to ask questions and view answers from teachers and peers.

**Features**:
- Ask questions about lesson
- View other students' questions
- Teacher answers
- Vote on helpful answers
- Mark as resolved
- Filter by status (open, answered, resolved)

**Component Structure**:
```typescript
interface QAPanelProps {
  lessonId: string
}

interface Question {
  id: string
  lessonId: string
  studentId: string
  studentName: string
  question: string
  createdAt: string
  status: 'open' | 'answered' | 'resolved'
  answers: Answer[]
  votes: number
}

interface Answer {
  id: string
  questionId: string
  authorId: string
  authorName: string
  authorRole: 'teacher' | 'student'
  answer: string
  createdAt: string
  votes: number
  isAccepted: boolean
}
```

#### 3.3 Curriculum Tree Component (`components/student/courses/CurriculumTree.tsx`)

**Status**: Needs Creation (reusable version)

**Purpose**: Display course structure with sections and lessons.

**Features**:
- Expandable/collapsible sections
- Lesson icons by type
- Completion checkmarks
- Lock icons for restricted content
- Current lesson highlight
- Click to navigate

**Component Structure**:
```typescript
interface CurriculumTreeProps {
  courseId: string
  currentLessonId?: string
  onLessonClick: (lessonId: string) => void
}

interface Section {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live_class'
  duration: string
  completed: boolean
  locked: boolean
  order: number
}
```

#### 3.4 Course Card Component (`components/student/courses/CourseCard.tsx`)

**Status**: Needs Creation (reusable version)

**Purpose**: Reusable course card for displaying course information.

**Component Structure**:
```typescript
interface CourseCardProps {
  course: Course
  onContinue: (courseId: string) => void
  onViewDetails: (courseId: string) => void
  onDownloadCertificate?: (courseId: string) => void
}

interface Course {
  id: string
  title: string
  category: string
  grade: string
  thumbnail: string
  progress: number
  lessonsCompleted: number
  totalLessons: number
  averageGrade?: number
  lastAccessed: string
  status: 'in_progress' | 'completed'
  instructor: string
  isBookmarked: boolean
  hasCertificate: boolean
}
```

## Data Models

### Course Model
```typescript
interface Course {
  id: string
  title: string
  description: string
  category: string
  grade: string
  subject: string
  thumbnail: string
  instructor: {
    id: string
    name: string
    avatar: string
    bio: string
  }
  rating: number
  totalStudents: number
  duration: string
  level: string
  objectives: string[]
  prerequisites: string[]
  status: 'in_progress' | 'completed' | 'not_started'
  progress: number
  enrolledDate: string
  completedDate?: string
  hasCertificate: boolean
  isBookmarked: boolean
  lastAccessed: string
}
```

### Lesson Model
```typescript
interface Lesson {
  id: string
  courseId: string
  sectionId: string
  title: string
  description: string
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live_class'
  duration: string
  order: number
  completed: boolean
  locked: boolean
  content: VideoContent | DocumentContent | QuizContent | AssignmentContent | LiveClassContent
  resources: Resource[]
  lastAccessedAt?: string
  completedAt?: string
  progress?: number
}
```

### Progress Model
```typescript
interface Progress {
  id: string
  studentId: string
  courseId: string
  lessonId: string
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live_class'
  progress: number // 0-100
  timeSpent: number // in seconds
  lastPosition?: number // for video lessons
  completed: boolean
  completedAt?: string
  updatedAt: string
}
```

### Note Model
```typescript
interface Note {
  id: string
  studentId: string
  lessonId: string
  content: string
  timestamp?: string
  tags: string[]
  screenshots: string[]
  createdAt: string
  updatedAt: string
}
```

### Question Model
```typescript
interface Question {
  id: string
  studentId: string
  lessonId: string
  question: string
  status: 'open' | 'answered' | 'resolved'
  createdAt: string
  updatedAt: string
  answers: Answer[]
  votes: number
}
```

## API Endpoints

### Course APIs
- `GET /api/student/courses` - Get enrolled courses with filters
- `GET /api/student/courses/[id]` - Get course details
- `GET /api/student/courses/[id]/curriculum` - Get curriculum structure
- `POST /api/student/courses/[id]/bookmark` - Bookmark course
- `DELETE /api/student/courses/[id]/bookmark` - Remove bookmark

### Learning APIs
- `GET /api/student/learn/[lessonId]` - Get lesson content
- `POST /api/student/learn/[lessonId]/progress` - Update progress
- `POST /api/student/learn/[lessonId]/complete` - Mark lesson complete

### Quiz APIs
- `GET /api/student/quizzes/[id]` - Get quiz questions
- `POST /api/student/quizzes/[id]/submit` - Submit quiz
- `GET /api/student/quizzes/[id]/results` - Get quiz results
- `POST /api/student/quizzes/[id]/retake` - Retake quiz

### Assignment APIs
- `GET /api/student/assignments/[id]` - Get assignment details
- `POST /api/student/assignments/[id]/submit` - Submit assignment
- `POST /api/student/assignments/[id]/draft` - Save draft
- `GET /api/student/assignments/[id]/submission` - Get submission status

### Notes APIs
- `GET /api/student/notes?lessonId=[id]` - Get notes for lesson
- `POST /api/student/notes` - Create note
- `PATCH /api/student/notes/[id]` - Update note
- `DELETE /api/student/notes/[id]` - Delete note

### Q&A APIs
- `GET /api/student/qa?lessonId=[id]` - Get questions for lesson
- `POST /api/student/qa` - Ask question
- `PATCH /api/student/qa/[id]` - Update question
- `DELETE /api/student/qa/[id]` - Delete question
- `POST /api/student/qa/[id]/vote` - Vote on answer

### Live Class APIs
- `GET /api/student/live-classes/[id]/join` - Get join meeting details
- `GET /api/student/live-classes/[id]/recording` - Get recording URL

## Error Handling

### Error Types
```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR'
}

interface AppError {
  type: ErrorType
  message: string
  details?: any
}
```

### Error Handling Strategy
- Display user-friendly error messages
- Log errors for debugging
- Retry failed API calls (with exponential backoff)
- Fallback to cached data when possible
- Show offline indicator when network is unavailable

## Testing Strategy

### Unit Tests
- Test individual components in isolation
- Test utility functions
- Test state management logic
- Mock API calls

### Integration Tests
- Test component interactions
- Test API integration
- Test data flow between components

### E2E Tests
- Test complete user flows
- Test video playback and progress tracking
- Test quiz submission
- Test assignment submission
- Test navigation between lessons

### Performance Tests
- Test video loading performance
- Test PDF rendering performance
- Test large course catalog rendering
- Test progress auto-save performance

## Accessibility Features

- Keyboard navigation support
- Screen reader compatibility
- Closed captions for videos
- High contrast mode
- Focus indicators
- ARIA labels and roles
- Alt text for images

## Performance Optimizations

- Lazy loading of components
- Code splitting by route
- Image optimization
- Video streaming optimization
- Caching strategy for API responses
- Debouncing for auto-save operations
- Virtual scrolling for large lists
- Progressive Web App (PWA) support for offline access

## Security Considerations

- Authentication required for all routes
- Authorization checks for course access
- Secure video streaming (signed URLs)
- File upload validation
- XSS protection
- CSRF protection
- Rate limiting for API calls
- Secure storage of progress data

## Future Enhancements

- Offline mode with service workers
- Mobile app (React Native)
- Social learning features (study groups)
- Gamification (badges, leaderboards)
- AI-powered recommendations
- Advanced analytics dashboard
- Collaborative notes
- Real-time collaboration features
- Voice commands
- AR/VR learning experiences
