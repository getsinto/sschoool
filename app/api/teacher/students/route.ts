import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTeacherStudents } from '@/lib/teacher/data-service'

export const dynamic = 'force-dynamic'

// GET /api/teacher/students - Get students list
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId') || undefined
    const status = searchParams.get('status')
    const progressMin = searchParams.get('progressMin')
    const progressMax = searchParams.get('progressMax')
    const search = searchParams.get('search') || undefined
    const gradeLevel = searchParams.get('gradeLevel') || undefined
    const sortBy = searchParams.get('sortBy') || 'name'

    // Fetch students using data service
    const students = await getTeacherStudents(user.id, {
      courseId,
      search,
      gradeLevel,
    })

    // Apply additional filters
    let filtered = students

    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(s => s.status === status)
    }

    // Filter by progress range
    if (progressMin) {
      filtered = filtered.filter(s => s.overallProgress >= parseInt(progressMin))
    }
    if (progressMax) {
      filtered = filtered.filter(s => s.overallProgress <= parseInt(progressMax))
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = `${a.firstName} ${a.lastName}`
          const nameB = `${b.firstName} ${b.lastName}`
          return nameA.localeCompare(nameB)
        case 'progress':
          return b.overallProgress - a.overallProgress
        case 'grade':
          return b.averageGrade - a.averageGrade
        case 'lastActive':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        default:
          return 0
      }
    })

    return NextResponse.json({
      success: true,
      data: filtered,
      meta: {
        total: filtered.length,
        active: filtered.filter(s => s.status === 'active').length,
        inactive: filtered.filter(s => s.status === 'inactive').length
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}
