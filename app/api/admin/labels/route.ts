import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get all course labels
    const { data: labels, error } = await supabase
      .from('course_labels')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching labels:', error)
      return NextResponse.json(
        { error: 'Failed to fetch labels' },
        { status: 500 }
      )
    }

    return NextResponse.json({ labels })

  } catch (error) {
    console.error('Error in labels API:', error)
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
    const { name, description, color, icon } = body

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      )
    }

    // Check if label name already exists
    const { data: existingLabel } = await supabase
      .from('course_labels')
      .select('id')
      .eq('name', name)
      .single()

    if (existingLabel) {
      return NextResponse.json(
        { error: 'A label with this name already exists' },
        { status: 409 }
      )
    }

    // Get the highest display order
    const { data: maxOrderLabel } = await supabase
      .from('course_labels')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const displayOrder = (maxOrderLabel?.display_order || 0) + 1

    // Create the label
    const { data: newLabel, error: insertError } = await supabase
      .from('course_labels')
      .insert({
        name,
        description: description || null,
        color,
        icon: icon || null,
        display_order: displayOrder,
        is_active: true,
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating label:', insertError)
      return NextResponse.json(
        { error: 'Failed to create label' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      label: newLabel
    }, { status: 201 })

  } catch (error) {
    console.error('Error in labels API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
