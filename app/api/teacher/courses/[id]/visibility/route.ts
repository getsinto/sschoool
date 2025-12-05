import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseId = params.id
    const body = await request.json()

    // Verify course ownership or admin access
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('created_by, status')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if user is course creator or admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isOwner = course.created_by === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}

    // Status update
    if (body.status !== undefined) {
      updateData.status = body.status
      
      // If publishing, set published_at
      if (body.status === 'published' && course.status !== 'published') {
        updateData.published_at = new Date().toISOString()
      }
      
      // If submitting for approval
      if (body.status === 'pending_approval') {
        updateData.submitted_for_approval_at = new Date().toISOString()
      }
    }

    // Visibility settings
    if (body.visibility !== undefined) {
      updateData.visibility = body.visibility
    }

    if (body.allowed_roles !== undefined) {
      updateData.allowed_roles = body.allowed_roles
    }

    if (body.allowed_grades !== undefined) {
      updateData.allowed_grades = body.allowed_grades
    }

    if (body.access_codes !== undefined) {
      updateData.access_codes = body.access_codes
    }

    // Scheduled publishing
    if (body.scheduled_publish_at !== undefined) {
      updateData.scheduled_publish_at = body.scheduled_publish_at
      if (body.scheduled_publish_at) {
        updateData.status = 'scheduled'
      }
    }

    // Geography restrictions
    if (body.allowed_countries !== undefined) {
      updateData.allowed_countries = body.allowed_countries
    }

    if (body.excluded_countries !== undefined) {
      updateData.excluded_countries = body.excluded_countries
    }

    // Time-based visibility
    if (body.visible_from !== undefined) {
      updateData.visible_from = body.visible_from
    }

    if (body.visible_until !== undefined) {
      updateData.visible_until = body.visible_until
    }

    // Featured status (admin only)
    if (body.is_featured !== undefined && isAdmin) {
      updateData.is_featured = body.is_featured
      if (body.featured_order !== undefined) {
        updateData.featured_order = body.featured_order
      }
    }

    // Update the course
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating course visibility:', updateError)
      return NextResponse.json(
        { error: 'Failed to update course visibility' },
        { status: 500 }
      )
    }

    // Send notifications based on status change
    if (body.status === 'pending_approval') {
      // Notify admins
      await supabase.from('notifications').insert({
        user_id: null, // Will be sent to all admins
        type: 'course_approval_needed',
        title: 'Course Approval Needed',
        message: `${updatedCourse.title} has been submitted for approval`,
        data: { course_id: courseId }
      })
    }

    if (body.status === 'published' && course.status !== 'published') {
      // Notify course creator
      await supabase.from('notifications').insert({
        user_id: course.created_by,
        type: 'course_published',
        title: 'Course Published',
        message: `Your course "${updatedCourse.title}" is now live!`,
        data: { course_id: courseId }
      })
    }

    return NextResponse.json({
      success: true,
      course: updatedCourse
    })

  } catch (error) {
    console.error('Error in visibility API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseId = params.id

    // Get course visibility settings
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        status,
        visibility,
        scheduled_publish_at,
        allowed_roles,
        allowed_grades,
        allowed_countries,
        excluded_countries,
        visible_from,
        visible_until,
        is_featured,
        featured_order,
        access_codes
      `)
      .eq('id', courseId)
      .single()

    if (error || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json(course)

  } catch (error) {
    console.error('Error fetching visibility settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
