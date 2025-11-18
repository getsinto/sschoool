import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock data - in production, fetch from Supabase
const mockCourses = [
  {
    id: '1',
    title: 'Advanced Mathematics',
    description: 'Comprehensive mathematics course covering advanced topics',
    thumbnail: '/course-thumbnails/math.jpg',
    category: 'Mathematics',
    grade: 'Grade 10',
    subject: 'Algebra',
    enrollments: 245,
    rating: 4.8,
    revenue: 12450,
    status: 'published',
    lastUpdated: '2024-01-10',
    sections: 8,
    lessons: 42,
    duration: '24 hours',
    completionRate: 78,
    activeStudents: 198
  },
  {
    id: '2',
    title: 'Physics Fundamentals',
    description: 'Introduction to physics concepts',
    thumbnail: '/course-thumbnails/physics.jpg',
    category: 'Science',
    grade: 'Grade 9',
    subject: 'Physics',
    enrollments: 189,
    rating: 4.6,
    revenue: 9450,
    status: 'published',
    lastUpdated: '2024-01-08',
    sections: 6,
    lessons: 32,
    duration: '18 hours',
    completionRate: 82,
    activeStudents: 156
  },
  {
    id: '3',
    title: 'English Literature',
    description: 'Explore classic and modern literature',
    thumbnail: '/course-thumbnails/english.jpg',
    category: 'Language',
    grade: 'Grade 8',
    subject: 'English',
    enrollments: 312,
    rating: 4.9,
    revenue: 15600,
    status: 'published',
    lastUpdated: '2024-01-12',
    sections: 10,
    lessons: 48,
    duration: '30 hours',
    completionRate: 65,
    activeStudents: 203
  },
  {
    id: '4',
    title: 'Chemistry Basics',
    description: 'Fundamental chemistry concepts',
    thumbnail: '/course-thumbnails/chemistry.jpg',
    category: 'Science',
    grade: 'Grade 9',
    subject: 'Chemistry',
    enrollments: 156,
    rating: 4.5,
    revenue: 7800,
    status: 'draft',
    lastUpdated: '2024-01-05',
    sections: 5,
    lessons: 28,
    duration: '16 hours',
    completionRate: 70,
    activeStudents: 109
  }
]

// GET /api/teacher/courses - Get teacher's courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const status = searchParams.get('status') || 'all'
    const sortBy = searchParams.get('sortBy') || 'newest'
    const search = searchParams.get('search') || ''

    let filteredCourses = [...mockCourses]

    // Filter by status
    if (status !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.status === status)
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower)
      )
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filteredCourses.sort((a, b) => b.rating - a.rating)
        break
      case 'enrolled':
        filteredCourses.sort((a, b) => b.enrollments - a.enrollments)
        break
      case 'updated':
        filteredCourses.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        break
      case 'newest':
      default:
        filteredCourses.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    }

    return NextResponse.json({
      courses: filteredCourses,
      total: filteredCourses.length
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST /api/teacher/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { title, description, category, grade, subject } = body
    
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new course
    const newCourse = {
      id: (mockCourses.length + 1).toString(),
      title,
      description,
      thumbnail: '/course-thumbnails/default.jpg',
      category,
      grade: grade || 'Not specified',
      subject: subject || 'General',
      enrollments: 0,
      rating: 0,
      revenue: 0,
      status: 'draft',
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: 0,
      lessons: 0,
      duration: '0 hours',
      completionRate: 0,
      activeStudents: 0
    }

    mockCourses.push(newCourse)

    return NextResponse.json({
      message: 'Course created successfully',
      course: newCourse
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
