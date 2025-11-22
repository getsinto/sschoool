import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const courseId = searchParams.get('courseId')
    const sort = searchParams.get('sort') || 'dueDate'
    const order = searchParams.get('order') || 'asc'
    const search = searchParams.get('search')

    // Mock data - replace with actual database queries
    const mockAssignments = [
      {
        id: '1',
        title: 'Math Problem Set 1',
        courseName: 'Advanced Mathematics',
        courseId: 'math-101',
        dueDate: '2024-01-15T23:59:59Z',
        maxPoints: 100,
        status: 'not_started',
        description: 'Complete problems 1-20 from chapter 3',
        instructor: 'Dr. Smith'
      },
      {
        id: '2',
        title: 'Science Lab Report',
        courseName: 'Physics',
        courseId: 'phys-201',
        dueDate: '2024-01-20T23:59:59Z',
        maxPoints: 150,
        status: 'draft',
        description: 'Write a lab report on the pendulum experiment',
        instructor: 'Prof. Johnson'
      },
      {
        id: '3',
        title: 'History Essay',
        courseName: 'World History',
        courseId: 'hist-101',
        dueDate: '2024-01-10T23:59:59Z',
        maxPoints: 200,
        status: 'graded',
        grade: 185,
        submittedAt: '2024-01-09T15:30:00Z',
        gradedAt: '2024-01-12T10:00:00Z',
        description: 'Analyze the causes of World War I',
        instructor: 'Dr. Williams'
      },
      {
        id: '4',
        title: 'Chemistry Lab 3',
        courseName: 'Chemistry',
        courseId: 'chem-101',
        dueDate: '2024-01-25T23:59:59Z',
        maxPoints: 120,
        status: 'submitted',
        submittedAt: '2024-01-24T18:00:00Z',
        description: 'Chemical reactions experiment',
        instructor: 'Dr. Brown'
      },
      {
        id: '5',
        title: 'English Literature Analysis',
        courseName: 'English Literature',
        courseId: 'eng-201',
        dueDate: '2024-01-18T23:59:59Z',
        maxPoints: 180,
        status: 'not_started',
        description: 'Analyze Shakespeare\'s Hamlet',
        instructor: 'Prof. Davis'
      }
    ]

    let filteredAssignments = mockAssignments

    // Apply filters
    if (status && status !== 'all') {
      filteredAssignments = filteredAssignments.filter(a => a.status === status)
    }

    if (courseId && courseId !== 'all') {
      filteredAssignments = filteredAssignments.filter(a => a.courseId === courseId)
    }

    if (search) {
      filteredAssignments = filteredAssignments.filter(a => 
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.courseName.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply sorting
    filteredAssignments.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sort) {
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime()
          bValue = new Date(b.dueDate).getTime()
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'course':
          aValue = a.courseName.toLowerCase()
          bValue = b.courseName.toLowerCase()
          break
        case 'grade':
          aValue = a.grade || 0
          bValue = b.grade || 0
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (order === 'desc') {
        return aValue < bValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

    // Calculate summary
    const summary = {
      pending: filteredAssignments.filter(a => a.status === 'not_started' || a.status === 'draft').length,
      submitted: filteredAssignments.filter(a => a.status === 'submitted').length,
      graded: filteredAssignments.filter(a => a.status === 'graded').length,
      averageGrade: filteredAssignments
        .filter(a => a.grade !== undefined)
        .reduce((acc, a) => acc + (a.grade! / a.maxPoints) * 100, 0) / 
        filteredAssignments.filter(a => a.grade !== undefined).length || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        assignments: filteredAssignments,
        summary
      }
    })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}
