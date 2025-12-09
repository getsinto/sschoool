import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTeacherStudents } from '@/lib/teacher/data-service'

export const dynamic = 'force-dynamic'

// GET /api/teacher/students/export - Export student data
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
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
    const format = searchParams.get('format') || 'csv' // 'csv' or 'json'

    // Fetch all students
    const students = await getTeacherStudents(user.id, { courseId })

    if (format === 'json') {
      // Return JSON format
      return NextResponse.json({
        success: true,
        data: students,
        meta: {
          exportedAt: new Date().toISOString(),
          totalStudents: students.length,
          courseId: courseId || 'all'
        }
      })
    } else {
      // Return CSV format
      const headers = [
        'ID',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Grade Level',
        'Status',
        'Overall Progress',
        'Average Grade',
        'Attendance Rate',
        'Last Active',
        'Enrolled Courses',
        'Completed Courses'
      ]

      const rows = students.map(student => [
        student.id,
        student.firstName,
        student.lastName,
        student.email,
        student.phone || '',
        student.gradeLevel || '',
        student.status,
        student.overallProgress,
        student.averageGrade,
        student.attendanceRate,
        student.lastActive,
        student.enrolledCourses,
        student.completedCourses
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="students-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
  } catch (error) {
    console.error('Error exporting students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export students' },
      { status: 500 }
    )
  }
}
