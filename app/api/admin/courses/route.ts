import { NextRequest, NextResponse } from 'next/server'

// Mock courses data - in real app, this would come from database
const mockCourses = [
  {
    id: '1',
    title: 'Mathematics Grade 10 - Advanced Algebra',
    thumbnail: '/api/placeholder/300/200',
    category: 'online-school',
    grade: 'Grade 10',
    subject: 'Mathematics',
    teacher: {
      id: 't1',
      name: 'Dr. Sarah Johnson',
      avatar: '/api/placeholder/40/40'
    },
    price: 299,
    enrollments: 245,
    status: 'published',
    createdDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    rating: 4.8,
    revenue: 73255,
    completionRate: 78,
    featured: true
  },
  {
    id: '2',
    title: 'English Literature - Classic Novels',
    thumbnail: '/api/placeholder/300/200',
    category: 'online-school',
    grade: 'Grade 11',
    subject: 'English',
    teacher: {
      id: 't2',
      name: 'Prof. Michael Brown',
      avatar: '/api/placeholder/40/40'
    },
    price: 249,
    enrollments: 198,
    status: 'published',
    createdDate: '2024-01-10',
    lastUpdated: '2024-01-18',
    rating: 4.9,
    revenue: 49302,
    completionRate: 85,
    featured: false
  }
]

// GET /api/admin/courses - List courses with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const grade = searchParams.get('grade')
    const subject = searchParams.get('subject')
    const status = searchParams.get('status')
    const teacher = searchParams.get('teacher')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    let filteredCourses = [...mockCourses]

    // Apply filters
    if (category && category !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.category === category)
    }

    if (grade && grade !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.grade === grade)
    }

    if (subject && subject !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.subject === subject)
    }

    if (status && status !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.status === status)
    }

    if (teacher && teacher !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.teacher.id === teacher)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.teacher.name.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filteredCourses.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

    // Calculate stats
    const stats = {
      total: mockCourses.length,
      published: mockCourses.filter(c => c.status === 'published').length,
      draft: mockCourses.filter(c => c.status === 'draft').length,
      archived: mockCourses.filter(c => c.status === 'archived').length,
      totalEnrollments: mockCourses.reduce((sum, c) => sum + c.enrollments, 0),
      totalRevenue: mockCourses.reduce((sum, c) => sum + c.revenue, 0)
    }

    return NextResponse.json({
      courses: paginatedCourses,
      pagination: {
        page,
        limit,
        total: filteredCourses.length,
        totalPages: Math.ceil(filteredCourses.length / limit)
      },
      stats,
      filters: {
        category,
        grade,
        subject,
        status,
        teacher,
        search
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST /api/admin/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { title, category, grade, subject, teacherId, price } = body
    
    if (!title || !category || !grade || !subject || !teacherId || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new course
    const newCourse = {
      id: (mockCourses.length + 1).toString(),
      title,
      thumbnail: '/api/placeholder/300/200',
      category,
      grade,
      subject,
      teacher: {
        id: teacherId,
        name: 'Teacher Name', // In real app, fetch from database
        avatar: '/api/placeholder/40/40'
      },
      price,
      enrollments: 0,
      status: 'draft' as const,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      rating: 0,
      revenue: 0,
      completionRate: 0,
      featured: false,
      ...body
    }

    // In real app, save to database
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