import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const personType = searchParams.get('person_type')

    let query = supabase
      .from('testimonials')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }
    if (featured !== null) {
      query = query.eq('is_featured', featured === 'true')
    }
    if (personType) {
      query = query.eq('person_type', personType)
    }

    const { data: testimonials, error, count } = await query

    if (error) {
      console.error('Error fetching testimonials:', error)
      return NextResponse.json(
        { error: 'Failed to fetch testimonials' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      testimonials,
      total: count || 0
    })

  } catch (error) {
    console.error('Error in testimonials API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const {
      person_name,
      person_type,
      person_photo_url,
      rating,
      testimonial_text,
      student_name,
      student_grade,
      course_program,
      video_url,
      is_featured,
      display_order
    } = body

    if (!person_name || !person_type || !testimonial_text) {
      return NextResponse.json(
        { error: 'Person name, type, and testimonial text are required' },
        { status: 400 }
      )
    }

    if (!['parent', 'student'].includes(person_type)) {
      return NextResponse.json(
        { error: 'Person type must be either "parent" or "student"' },
        { status: 400 }
      )
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get the highest display order if not provided
    let finalDisplayOrder = display_order
    if (!finalDisplayOrder) {
      const { data: maxOrderTestimonial } = await supabase
        .from('testimonials')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

      finalDisplayOrder = (maxOrderTestimonial?.display_order || 0) + 1
    }

    // Create the testimonial
    const { data: newTestimonial, error: insertError } = await supabase
      .from('testimonials')
      .insert({
        person_name,
        person_type,
        person_photo_url: person_photo_url || null,
        rating: rating || null,
        testimonial_text,
        student_name: student_name || null,
        student_grade: student_grade || null,
        course_program: course_program || null,
        video_url: video_url || null,
        is_featured: is_featured || false,
        display_order: finalDisplayOrder,
        status: 'active',
        approved_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating testimonial:', insertError)
      return NextResponse.json(
        { error: 'Failed to create testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      testimonial: newTestimonial
    }, { status: 201 })

  } catch (error) {
    console.error('Error in testimonials API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
