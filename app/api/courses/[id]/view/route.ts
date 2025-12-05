import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const courseId = params.id
    const body = await request.json()

    // Get user if authenticated (optional)
    const { data: { user } } = await supabase.auth.getUser()

    // Get IP address and user agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || body.referrer || null

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, view_count')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if this is a unique view (not counted in last 24 hours from same IP)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: recentView } = await supabase
      .from('course_views')
      .select('id')
      .eq('course_id', courseId)
      .eq('ip_address', ip)
      .gte('viewed_at', oneDayAgo.toISOString())
      .single()

    const isUniqueView = !recentView

    // Record the view
    const { error: insertError } = await supabase
      .from('course_views')
      .insert({
        course_id: courseId,
        user_id: user?.id || null,
        ip_address: ip,
        user_agent: userAgent,
        referrer: referer,
        is_unique: isUniqueView
      })

    if (insertError) {
      console.error('Error recording course view:', insertError)
      // Don't fail the request if view tracking fails
    }

    // Increment view count if unique
    if (isUniqueView) {
      await supabase
        .from('courses')
        .update({ 
          view_count: (course.view_count || 0) + 1 
        })
        .eq('id', courseId)
    }

    return NextResponse.json({
      success: true,
      unique_view: isUniqueView,
      total_views: (course.view_count || 0) + (isUniqueView ? 1 : 0)
    })

  } catch (error) {
    console.error('Error tracking course view:', error)
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
    
    const courseId = params.id

    // Get view statistics
    const { data: course } = await supabase
      .from('courses')
      .select('view_count')
      .eq('id', courseId)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get view breakdown
    const { data: views } = await supabase
      .from('course_views')
      .select('viewed_at, is_unique, referrer')
      .eq('course_id', courseId)
      .order('viewed_at', { ascending: false })
      .limit(100)

    // Calculate statistics
    const totalViews = views?.length || 0
    const uniqueViews = views?.filter(v => v.is_unique).length || 0
    
    // Group by date
    const viewsByDate: Record<string, number> = {}
    views?.forEach(view => {
      const date = new Date(view.viewed_at).toISOString().split('T')[0]
      viewsByDate[date] = (viewsByDate[date] || 0) + 1
    })

    // Group by referrer
    const viewsByReferrer: Record<string, number> = {}
    views?.forEach(view => {
      const referrer = view.referrer || 'Direct'
      viewsByReferrer[referrer] = (viewsByReferrer[referrer] || 0) + 1
    })

    return NextResponse.json({
      total_views: course.view_count || 0,
      recent_views: totalViews,
      unique_views: uniqueViews,
      views_by_date: viewsByDate,
      views_by_referrer: viewsByReferrer
    })

  } catch (error) {
    console.error('Error fetching view statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
