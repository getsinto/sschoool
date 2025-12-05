import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient()
    const { slug } = params

    // Fetch course by slug with all related data
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:users!courses_instructor_id_fkey(
          id,
          full_name,
          email,
          avatar_url,
          bio
        ),
        category:categories(
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Fetch batches if course is batch-based
    let batches = []
    if (course.is_batch_based) {
      const { data: batchData } = await supabase
        .from('course_batches')
        .select('*')
        .eq('course_id', course.id)
        .in('status', ['upcoming', 'registration_open', 'in_progress'])
        .order('start_date', { ascending: true })

      batches = batchData || []
    }

    // Fetch enrollment count
    const { count: enrollmentCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.id)
      .eq('status', 'active')

    // Fetch ratings
    const { data: ratings } = await supabase
      .from('course_reviews')
      .select('rating')
      .eq('course_id', course.id)

    const totalRatings = ratings?.length || 0
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0

    // Build pricing configuration
    const pricing = {
      pricing_model: course.pricing_model,
      price: course.price,
      currency: course.currency || 'USD',
      subscription_type: course.subscription_type,
      subscription_price: course.subscription_price,
      auto_renewal: course.auto_renewal,
      payment_plan_enabled: course.payment_plan_enabled,
      payment_plan_installments: course.payment_plan_installments,
      payment_plan_frequency: course.payment_plan_frequency,
      early_bird_enabled: course.early_bird_enabled,
      early_bird_price: course.early_bird_price,
      early_bird_deadline: course.early_bird_deadline,
      regular_price: course.regular_price,
      max_students: course.max_students,
      min_students: course.min_students,
      current_enrollments: enrollmentCount || 0,
      enable_waitlist: course.enable_waitlist,
      access_duration_type: course.access_duration_type,
      access_duration_days: course.access_duration_days,
      is_batch_based: course.is_batch_based,
      min_price: course.min_price,
      suggested_price: course.suggested_price,
      free_trial_enabled: course.free_trial_enabled,
      free_trial_days: course.free_trial_days,
      trial_requires_card: course.trial_requires_card,
      pricing_tiers: course.pricing_tiers
    }

    // Return complete course data
    return NextResponse.json({
      ...course,
      pricing,
      batches,
      enrolled_students: enrollmentCount || 0,
      rating: Number(averageRating.toFixed(1)),
      total_ratings: totalRatings
    })

  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
