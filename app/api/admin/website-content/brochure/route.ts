import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type')
    const active = searchParams.get('active')
    const current = searchParams.get('current')

    let query = supabase
      .from('brochures')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('brochure_type', type)
    }
    if (active !== null) {
      query = query.eq('is_active', active === 'true')
    }
    if (current !== null) {
      query = query.eq('is_current', current === 'true')
    }

    const { data: brochures, error, count } = await supabase
      .from('brochures')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching brochures:', error)
      return NextResponse.json(
        { error: 'Failed to fetch brochures' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      brochures,
      total: count || 0
    })

  } catch (error) {
    console.error('Error in brochures API:', error)
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
      title,
      description,
      file_url,
      file_size,
      total_pages,
      version,
      brochure_type,
      is_current,
      allow_download,
      require_email
    } = body

    if (!title || !file_url || !brochure_type) {
      return NextResponse.json(
        { error: 'Title, file URL, and brochure type are required' },
        { status: 400 }
      )
    }

    // If marking as current, unmark other brochures of same type
    if (is_current) {
      await supabase
        .from('brochures')
        .update({ is_current: false })
        .eq('brochure_type', brochure_type)
    }

    // Create the brochure
    const { data: newBrochure, error: insertError } = await supabase
      .from('brochures')
      .insert({
        title,
        description: description || null,
        file_url,
        file_size: file_size || null,
        total_pages: total_pages || null,
        version: version || null,
        brochure_type,
        is_current: is_current || false,
        allow_download: allow_download !== false,
        require_email: require_email || false,
        is_active: true,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating brochure:', insertError)
      return NextResponse.json(
        { error: 'Failed to create brochure' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      brochure: newBrochure
    }, { status: 201 })

  } catch (error) {
    console.error('Error in brochures API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
