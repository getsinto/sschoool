import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Fetch bundle
    const { data: bundle, error } = await supabase
      .from('course_bundles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    // Fetch courses
    if (bundle.course_ids && bundle.course_ids.length > 0) {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, thumbnail_url, price')
        .in('id', bundle.course_ids)

      bundle.courses = courses || []
    }

    return NextResponse.json(bundle)

  } catch (error) {
    console.error('Error fetching bundle:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Calculate regular price if course_ids changed
    let regularPrice = body.regular_price
    if (body.course_ids && body.course_ids.length > 0 && !body.regular_price) {
      const { data: courses } = await supabase
        .from('courses')
        .select('price')
        .in('id', body.course_ids)

      regularPrice = courses?.reduce((sum, course) => sum + (course.price || 0), 0) || 0
    }

    // Calculate savings
    const bundlePrice = body.bundle_price
    const savingsAmount = regularPrice && bundlePrice ? regularPrice - bundlePrice : 0
    const savingsPercentage = regularPrice && regularPrice > 0
      ? Math.round((savingsAmount / regularPrice) * 100)
      : 0

    // Update bundle
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (body.bundle_name) updateData.bundle_name = body.bundle_name
    if (body.bundle_slug) updateData.bundle_slug = body.bundle_slug
    if (body.bundle_description !== undefined) updateData.bundle_description = body.bundle_description
    if (body.bundle_price !== undefined) updateData.bundle_price = body.bundle_price
    if (regularPrice !== undefined) updateData.regular_price = regularPrice
    if (savingsAmount !== undefined) updateData.savings_amount = savingsAmount
    if (savingsPercentage !== undefined) updateData.savings_percentage = savingsPercentage
    if (body.currency) updateData.currency = body.currency
    if (body.course_ids) updateData.course_ids = body.course_ids
    if (body.validity_days !== undefined) updateData.validity_days = body.validity_days
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured

    const { data: bundle, error } = await supabase
      .from('course_bundles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(bundle)

  } catch (error) {
    console.error('Error updating bundle:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check if bundle has enrollments
    const { count } = await supabase
      .from('bundle_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('bundle_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bundle with active enrollments' },
        { status: 400 }
      )
    }

    // Delete bundle
    const { error } = await supabase
      .from('course_bundles')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Bundle deleted successfully' })

  } catch (error) {
    console.error('Error deleting bundle:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
