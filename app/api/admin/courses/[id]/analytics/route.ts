import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get course to verify it exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', params.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get enrollment statistics
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', params.id)

    // Get course views/analytics
    const { data: analytics } = await supabase
      .from('course_analytics')
      .select('*')
      .eq('course_id', params.id)
      .order('date', { ascending: true })

    // Get lesson completion data
    const { data: lessonProgress } = await supabase
      .from('lesson_progress')
      .select(`
        *,
        lesson:lessons (
          id,
          title,
          section_id
        )
      `)
      .eq('course_id', params.id)

    // Get reviews and ratings
    const { data: reviews } = await supabase
      .from('course_reviews')
      .select(`
        *,
        user:users (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('course_id', params.id)
      .order('created_at', { ascending: false })

    // Calculate analytics metrics
    const totalEnrollments = enrollments?.length || 0
    const totalViews = analytics?.reduce((sum: number, a: any) => sum + (a.views || 0), 0) || 0
    const totalWatchTime = lessonProgress?.reduce((sum: number, p: any) => sum + (p.watch_time || 0), 0) || 0
    
    // Calculate completion rate
    const completedEnrollments = enrollments?.filter(e => e.completion_percentage === 100).length || 0
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0

    // Calculate average rating
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    // Calculate enrollment trend (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const enrollmentTrend = enrollments
      ?.filter(e => new Date(e.created_at) >= thirtyDaysAgo)
      .reduce((acc: any[], enrollment) => {
        const date = new Date(enrollment.created_at).toISOString().split('T')[0]
        const existing = acc.find(item => item.date === date)
        if (existing) {
          existing.count += 1
        } else {
          acc.push({ date, count: 1 })
        }
        return acc
      }, [])
      .sort((a, b) => a.date.localeCompare(b.date)) || []

    // Calculate cumulative enrollments for trend
    let cumulative = 0
    const enrollmentTrendCumulative = enrollmentTrend.map(item => {
      cumulative += item.count
      return {
        date: item.date,
        enrollments: cumulative
      }
    })

    // Identify drop-off points (lessons with low completion)
    const lessonCompletionMap = new Map()
    lessonProgress?.forEach(progress => {
      const lessonId = progress.lesson_id
      if (!lessonCompletionMap.has(lessonId)) {
        lessonCompletionMap.set(lessonId, {
          lessonId,
          lessonTitle: progress.lesson?.title || 'Unknown',
          completed: 0,
          total: 0
        })
      }
      const stats = lessonCompletionMap.get(lessonId)
      stats.total += 1
      if (progress.completed) {
        stats.completed += 1
      }
    })

    const dropOffPoints = Array.from(lessonCompletionMap.values())
      .map(stats => ({
        lessonId: stats.lessonId,
        lessonTitle: stats.lessonTitle,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
        dropOffRate: stats.total > 0 ? ((stats.total - stats.completed) / stats.total) * 100 : 0
      }))
      .filter(point => point.dropOffRate > 20) // Only show significant drop-offs
      .sort((a, b) => b.dropOffRate - a.dropOffRate)
      .slice(0, 5) // Top 5 drop-off points

    // Calculate device usage (mock data - would come from analytics table)
    const deviceUsage = {
      desktop: 45,
      mobile: 35,
      tablet: 20
    }

    // Calculate peak study times (mock data - would come from analytics table)
    const studyTimePattern = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      activeStudents: Math.floor(Math.random() * 50) // Mock data
    }))

    return NextResponse.json({
      courseId: params.id,
      courseTitle: course.title,
      overview: {
        totalEnrollments,
        totalViews,
        totalWatchTime, // in minutes
        completionRate: Math.round(completionRate),
        averageRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: reviews?.length || 0
      },
      enrollmentTrend: enrollmentTrendCumulative,
      dropOffPoints,
      deviceUsage,
      studyTimePattern,
      recentReviews: reviews?.slice(0, 10) || [],
      performanceInsights: {
        strengths: [
          completionRate > 70 ? 'High completion rate' : null,
          avgRating >= 4.5 ? 'Excellent student ratings' : null,
          totalEnrollments > 100 ? 'Strong enrollment numbers' : null
        ].filter(Boolean),
        improvements: [
          completionRate < 50 ? 'Low completion rate needs attention' : null,
          dropOffPoints.length > 3 ? 'Multiple drop-off points identified' : null,
          avgRating < 4.0 ? 'Student satisfaction could be improved' : null
        ].filter(Boolean)
      }
    })

  } catch (error) {
    console.error('Error fetching course analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
