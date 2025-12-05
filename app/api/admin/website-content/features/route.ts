import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    let query = supabase
      .from('platform_features')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }
    if (active !== null) {
      query = query.eq('is_active', active === 'true')
    }

    const { data: features, error, count } = await query

    if (error) {
      console.error('Error fetching features:', error)
      return NextResponse.json(
        { error: 'Failed to fetch features' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      features,
      total: count || 0
    })

  } catch (error) {
    console.error('Error in features API:', error)
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
      icon_name,
      icon_url,
      icon_color,
      title,
      description,
      details,
      feature_image_url,
      category,
      display_order
    } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    const validCategories = ['teaching', 'learning', 'platform', 'student_benefits', 'parent_benefits']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // Get the highest display order if not provided
    let finalDisplayOrder = display_order
    if (!finalDisplayOrder) {
      const { data: maxOrderFeature } = await supabase
        .from('platform_features')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

      finalDisplayOrder = (maxOrderFeature?.display_order || 0) + 1
    }

    // Create the feature
    const { data: newFeature, error: insertError } = await supabase
      .from('platform_features')
      .insert({
        icon_name: icon_name || null,
        icon_url: icon_url || null,
        icon_color: icon_color || '#3B82F6',
        title,
        description,
        details: details || null,
        feature_image_url: feature_image_url || null,
        category,
        display_order: finalDisplayOrder,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating feature:', insertError)
      return NextResponse.json(
        { error: 'Failed to create feature' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      feature: newFeature
    }, { status: 201 })

  } catch (error) {
    console.error('Error in features API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
