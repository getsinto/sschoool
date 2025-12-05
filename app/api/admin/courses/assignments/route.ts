import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user details with role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, role_level')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    if (userData.role_level < 4) {
      return NextResponse.json(
        { error: 'Forbidden: Only administrators can view all assignments' },
        { status: 403 }
      )
    }

    // Fetch all course assignments with related data
    const { data: assignments, error: assignmentsError } = await supabase
      .from('course_assignments')
      .select(`
        id,
        is_primary_teacher,
        can_manage_content,
        can_grade,
        can_communicate,
        assigned_at,
        assigned_by,
        course:course_id (
          id,
          title,
          status
        ),
        teacher:teacher_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .order('assigned_at', { ascending: false })

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      total_assignments: assignments.length,
      primary_teachers: assignments.filter(a => a.is_primary_teacher).length,
      content_managers: assignments.filter(a => a.can_manage_content).length,
      graders: assignments.filter(a => a.can_grade).length,
      communicators: assignments.filter(a => a.can_communicate).length,
      active_courses: new Set(assignments.map(a => a.course.id)).size,
      total_teachers: new Set(assignments.map(a => a.teacher.id)).size
    }

    // Calculate teacher workload
    const teacherWorkloadMap = new Map()
    
    assignments.forEach(assignment => {
      const teacherId = assignment.teacher.id
      
      if (!teacherWorkloadMap.has(teacherId)) {
        teacherWorkloadMap.set(teacherId, {
          teacher_id: teacherId,
          teacher_name: assignment.teacher.full_name,
          total_courses: 0,
          primary_courses: 0,
          secondary_courses: 0,
          permissions: {
            can_manage_content: 0,
            can_grade: 0,
            can_communicate: 0
          }
        })
      }

      const workload = teacherWorkloadMap.get(teacherId)
      workload.total_courses++
      
      if (assignment.is_primary_teacher) {
        workload.primary_courses++
      } else {
        workload.secondary_courses++
      }

      if (assignment.can_manage_content) workload.permissions.can_manage_content++
      if (assignment.can_grade) workload.permissions.can_grade++
      if (assignment.can_communicate) workload.permissions.can_communicate++
    })

    const workload = Array.from(teacherWorkloadMap.values())
      .sort((a, b) => b.total_courses - a.total_courses)

    return NextResponse.json({
      assignments,
      stats,
      workload
    })

  } catch (error) {
    console.error('Error in assignments overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
