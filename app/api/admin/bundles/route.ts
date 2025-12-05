import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('is_active')
    const isFeatured = searchParams.get('is_featured')

    let query = supabase
      .from('course_bundles')
      .select('*')
      .order('created_at', { ascending: false })

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true')
    }

    const { data: bundles, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Fetch course details for each bundle
    const bundlesWithCourses = await Promise.all(
      (bundles || []).map(async (bundle) => {
        if (bundle.course_ids && bundle.course_ids.length > 0) {
          const { data: courses } = await supabase
            .from('courses')
            .select('id, title, thumbnail_url, price')
            .in('id', bundle.course_ids)

          return {
            ...bundle,
            courses: courses || []
          }
        }
        return { ...bundle, courses: [] }
      })
    )

    return NextResponse.json(bundlesWithCourses)

  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.bundle_name || !body.bundle_price || !body.course_ids || body.course_ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = body.bundle_slug || body.bundle_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Calculate regular price if not provided
    let regularPrice = body.regular_price
    if (!regularPrice && body.course_ids.length > 0) {
      const { data: courses } = await supabase
        .from('courses')
        .select('price')
        .in('id', body.course_ids)

      regularPrice = courses?.reduce((sum, course) => sum + (course.price || 0), 0) || 0
    }

    // Calculate savings
    const savingsAmount = regularPrice - body.bundle_price
    const savingsPercentage = regularPrice > 0 
      ? Math.round((savingsAmount / regularPrice) * 100)
      : 0

    // Create bundle
    const { data: bundle, error } = await supabase
      .from('course_bundles')
      .insert({
        bundle_name: body.bundle_name,
        bundle_slug: slug,
        bundle_description: body.bundle_description,
        bundle_price: body.bundle_price,
        regular_price: regularPrice,
        savings_amount: savingsAmount,
        savings_percentage: savingsPercentage,
        currency: body.currency || 'USD',
        course_ids: body.course_ids,
        validity_days: body.validity_days,
        is_active: body.is_active !== false,
        is_featured: body.is_featured || false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(bundle, { status: 201 })

  } catch (error) {
    console.error('Error creating bundle:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
