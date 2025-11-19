# Student AGQ - Developer Quick Start Guide

## 🚀 Quick Start

### Installation
```bash
# Install required dependencies
npm install recharts

# Verify existing dependencies
npm list lucide-react @radix-ui/react-tabs
```

### Running the Feature
```bash
# Start development server
npm run dev

# Navigate to:
# - http://localhost:3000/student/assignments
# - http://localhost:3000/student/quizzes
# - http://localhost:3000/student/grades
```

---

## 📁 File Organization

### Pages (User-Facing Routes)
```
/student/assignments          → Overview with filters
/student/assignments/[id]     → Assignment detail & submission
/student/assignments/calendar → Calendar view
/student/quizzes              → Quiz list
/student/quizzes/[id]/results → Quiz results & attempts
/student/grades               → Grades overview
/student/grades/[itemId]      → Grade detail with rubric
/student/grades/report        → Printable report card
```

### API Endpoints
```
GET  /api/student/assignments
GET  /api/student/assignments/[id]/submissions
POST /api/student/assignments/[id]/regrade
GET  /api/student/quizzes
GET  /api/student/quizzes/[id]/attempts
GET  /api/student/grades
GET  /api/student/grades/[courseId]
GET  /api/student/grades/[itemId]
GET  /api/student/grades/report
GET  /api/student/grades/export
GET  /api/student/grades/trends
GET  /api/student/grades/insights
```

---

## 🔧 Common Tasks

### Adding a New Assignment Status
```typescript
// 1. Update the type in AssignmentCard.tsx
type Status = 'not_started' | 'draft' | 'submitted' | 'graded' | 'returned'

// 2. Add color mapping
const statusColors = {
  // ... existing
  returned: 'bg-purple-100 text-purple-800'
}

// 3. Update API route mock data
```

### Customizing Grade Calculations
```typescript
// lib/student/gradeCalculations.ts

// Modify GPA scale
export function percentageToGradePoint(percentage: number): number {
  // Your custom scale here
}

// Add new calculation
export function calculateCustomMetric(grades: Grade[]): number {
  // Your logic here
}
```

### Adding New Chart Types
```typescript
// components/student/grades/PerformanceChart.tsx

import { PieChart, Pie } from 'recharts'

// Add new chart type prop
type?: 'line' | 'bar' | 'pie'

// Implement in component
{type === 'pie' && (
  <PieChart>
    <Pie data={data} dataKey="value" />
  </PieChart>
)}
```

---

## 🎨 Styling Guide

### Color Scheme
```typescript
// Status Colors
const colors = {
  blue: 'primary/info',      // Submitted, In Progress
  green: 'success',          // Completed, Passed
  yellow: 'warning',         // Due Soon, Pending
  red: 'error',              // Overdue, Failed
  purple: 'accent',          // Special, Featured
  gray: 'neutral'            // Disabled, Archived
}
```

### Component Patterns
```typescript
// Card with hover effect
<Card className="hover:shadow-lg transition-shadow cursor-pointer">

// Status badge
<Badge className="bg-green-100 text-green-800">

// Loading state
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />

// Empty state
<div className="text-center py-12">
  <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
  <h3>No items found</h3>
</div>
```

---

## 🔌 Database Integration

### Replace Mock Data

#### Step 1: Create Database Models
```typescript
// prisma/schema.prisma
model Assignment {
  id          String   @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime
  maxPoints   Int
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  submissions Submission[]
}

model Submission {
  id           String   @id @default(cuid())
  assignmentId String
  assignment   Assignment @relation(fields: [assignmentId], references: [id])
  studentId    String
  content      String?
  grade        Int?
  submittedAt  DateTime
}
```

#### Step 2: Update API Routes
```typescript
// app/api/student/assignments/route.ts
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  const assignments = await prisma.assignment.findMany({
    where: {
      // Add filters
    },
    include: {
      course: true,
      submissions: true
    }
  })
  
  return NextResponse.json({
    success: true,
    data: { assignments }
  })
}
```

#### Step 3: Add Authentication
```typescript
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Fetch user-specific data
  const assignments = await prisma.assignment.findMany({
    where: {
      course: {
        enrollments: {
          some: {
            studentId: session.user.id
          }
        }
      }
    }
  })
}
```

---

## 🧪 Testing

### Component Testing
```typescript
// __tests__/components/AssignmentCard.test.tsx
import { render, screen } from '@testing-library/react'
import AssignmentCard from '@/components/student/assignments/AssignmentCard'

describe('AssignmentCard', () => {
  it('renders assignment title', () => {
    const assignment = {
      id: '1',
      title: 'Test Assignment',
      // ... other props
    }
    
    render(<AssignmentCard assignment={assignment} />)
    expect(screen.getByText('Test Assignment')).toBeInTheDocument()
  })
})
```

### API Testing
```typescript
// __tests__/api/assignments.test.ts
import { GET } from '@/app/api/student/assignments/route'

describe('/api/student/assignments', () => {
  it('returns assignments list', async () => {
    const request = new Request('http://localhost/api/student/assignments')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data.assignments)).toBe(true)
  })
})
```

---

## 🐛 Debugging

### Common Issues

#### Charts Not Rendering
```typescript
// Issue: recharts not installed
npm install recharts

// Issue: data format incorrect
// Ensure data has correct shape:
const data = [
  { label: 'Week 1', value: 85 },
  { label: 'Week 2', value: 90 }
]
```

#### API Routes Returning 404
```typescript
// Check file location
app/api/student/assignments/route.ts  // ✅ Correct
app/api/student/assignments.ts        // ❌ Wrong

// Check export
export async function GET() { }  // ✅ Correct
export default function GET() { } // ❌ Wrong
```

#### TypeScript Errors
```typescript
// Add proper types
interface Assignment {
  id: string
  title: string
  // ... all required fields
}

// Use type guards
if (assignment.grade !== undefined) {
  // Now TypeScript knows grade exists
}
```

---

## 📊 Performance Tips

### Optimize Large Lists
```typescript
// Use pagination
const ITEMS_PER_PAGE = 20

// Use virtual scrolling for 100+ items
import { useVirtualizer } from '@tanstack/react-virtual'

// Memoize expensive calculations
const averageGrade = useMemo(() => 
  calculateAverage(grades),
  [grades]
)
```

### Optimize Charts
```typescript
// Limit data points
const chartData = data.slice(-30) // Last 30 points only

// Debounce updates
const debouncedData = useDebounce(data, 300)
```

### Code Splitting
```typescript
// Lazy load heavy components
const PerformanceChart = dynamic(
  () => import('@/components/student/grades/PerformanceChart'),
  { loading: () => <div>Loading chart...</div> }
)
```

---

## 🔐 Security Considerations

### Input Validation
```typescript
// Validate user input
import { z } from 'zod'

const regradeSchema = z.object({
  reason: z.enum(['grading_error', 'rubric_misapplication', 'missing_credit', 'other']),
  details: z.string().min(10).max(1000)
})

// Use in API route
const body = await request.json()
const validated = regradeSchema.parse(body)
```

### Authorization
```typescript
// Check user permissions
const canViewGrade = await checkPermission(
  session.user.id,
  'view_grade',
  gradeId
)

if (!canViewGrade) {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  )
}
```

### Data Sanitization
```typescript
// Sanitize HTML content
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userInput)
```

---

## 📱 Mobile Optimization

### Responsive Breakpoints
```typescript
// Tailwind breakpoints used
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
```

### Touch Interactions
```typescript
// Make cards touch-friendly
<Card className="active:scale-95 transition-transform">

// Increase tap targets
<Button className="min-h-[44px] min-w-[44px]">
```

---

## 🎯 Best Practices

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface Props {
  // ...
}

// 3. Component
export default function Component({ }: Props) {
  // 4. State
  const [state, setState] = useState()
  
  // 5. Effects
  useEffect(() => {}, [])
  
  // 6. Handlers
  const handleClick = () => {}
  
  // 7. Render
  return <div />
}
```

### Error Handling
```typescript
try {
  const response = await fetch('/api/...')
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error)
  }
  
  // Handle success
} catch (error) {
  console.error('Error:', error)
  // Show user-friendly message
  setError('Failed to load data. Please try again.')
}
```

### Loading States
```typescript
const [loading, setLoading] = useState(false)

const loadData = async () => {
  setLoading(true)
  try {
    // Fetch data
  } finally {
    setLoading(false) // Always reset
  }
}
```

---

## 📚 Additional Resources

### Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Recharts](https://recharts.org/en-US/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

## 🤝 Contributing

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Pull Request Process
1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit PR with description

---

**Happy Coding! 🚀**
