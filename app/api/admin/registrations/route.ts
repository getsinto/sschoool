import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tab = searchParams.get('tab')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const supabase = createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        account_status,
        email_verified,
        registration_completed,
        created_at,
        mobile_number,
        category_specific_data,
        id_type,
        id_number
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('account_status', status)
    }

    if (tab && tab !== 'all') {
      if (tab === 'pending') {
        query = query.in('account_status', ['pending_verification', 'pending_review'])
      } else {
        query = query.eq('role', tab)
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: registrations, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch registrations' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (status && status !== 'all') {
      countQuery = countQuery.eq('account_status', status)
    }

    if (tab && tab !== 'all') {
      if (tab === 'pending') {
        countQuery = countQuery.in('account_status', ['pending_verification', 'pending_review'])
      } else {
        countQuery = countQuery.eq('role', tab)
      }
    }

    const { count } = await countQuery

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
