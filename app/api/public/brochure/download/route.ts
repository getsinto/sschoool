import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { brochure_id, user_email } = body

    if (!brochure_id) {
      return NextResponse.json(
        { error: 'Brochure ID is required' },
        { status: 400 }
      )
    }

    // Get brochure details
    const { data: brochure, error: brochureError } = await supabase
      .from('brochures')
      .select('*')
      .eq('id', brochure_id)
      .eq('is_active', true)
      .single()

    if (brochureError || !brochure) {
      return NextResponse.json(
        { error: 'Brochure not found or inactive' },
        { status: 404 }
      )
    }

    // Check if download is allowed
    if (!brochure.allow_download) {
      return NextResponse.json(
        { error: 'Download not allowed for this brochure' },
        { status: 403 }
      )
    }

    // Check if email is required
    if (brochure.require_email && !user_email) {
      return NextResponse.json(
        { error: 'Email is required to download this brochure' },
        { status: 400 }
      )
    }

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Get request metadata
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const user_agent = request.headers.get('user-agent') || 'unknown'

    // Track the download
    const { error: trackError } = await supabase
      .from('brochure_downloads')
      .insert({
        brochure_id,
        user_email: user_email || null,
        user_id: user?.id || null,
        ip_address,
        user_agent
      })

    if (trackError) {
      console.error('Error tracking download:', trackError)
      // Don't fail the request if tracking fails
    }

    // Return the download URL
    return NextResponse.json({
      success: true,
      download_url: brochure.file_url,
      brochure: {
        id: brochure.id,
        title: brochure.title,
        description: brochure.description,
        file_size: brochure.file_size,
        total_pages: brochure.total_pages
      }
    })

  } catch (error) {
    console.error('Error in brochure download API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const brochure_id = searchParams.get('brochure_id')

    if (!brochure_id) {
      return NextResponse.json(
        { error: 'Brochure ID is required' },
        { status: 400 }
      )
    }

    // Get download statistics
    const { data: downloads, error, count } = await supabase
      .from('brochure_downloads')
      .select('*', { count: 'exact' })
      .eq('brochure_id', brochure_id)

    if (error) {
      console.error('Error fetching download stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch download statistics' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const authenticated = downloads?.filter(d => d.user_id).length || 0
    const anonymous = (count || 0) - authenticated

    return NextResponse.json({
      total_downloads: count || 0,
      authenticated_downloads: authenticated,
      anonymous_downloads: anonymous
    })

  } catch (error) {
    console.error('Error in brochure download stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
