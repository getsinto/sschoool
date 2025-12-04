import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/student/courses/[id]/resources - List all resources for a course (student view)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('module_id')
    const resourceType = searchParams.get('type')
    const category = searchParams.get('category')

    // Check if student is enrolled in the course
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('course_id', params.id)
      .eq('student_id', user.id)
      .single()

    const isEnrolled = enrollment && enrollment.status === 'active'

    // Build query
    let query = supabase
      .from('course_resources')
      .select('*')
      .eq('course_id', params.id)
      .order('display_order', { ascending: true })

    // Filter by enrollment requirement
    if (!isEnrolled) {
      query = query.eq('requires_enrollment', false)
    }

    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }

    if (category) {
      query = query.eq('resource_category', category)
    }

    const { data: resources, error } = await query

    if (error) throw error

    return NextResponse.json({
      resources,
      is_enrolled: isEnrolled
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}
