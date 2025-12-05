import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: sections, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching homepage sections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch homepage sections' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sections })

  } catch (error) {
    console.error('Error in homepage sections API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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
    const { sections } = body

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Sections must be an array' },
        { status: 400 }
      )
    }

    // Update each section
    const updates = sections.map(async (section) => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .update({
          section_title: section.section_title,
          is_enabled: section.is_enabled,
          display_order: section.display_order,
          settings: section.settings,
          updated_at: new Date().toISOString()
        })
        .eq('section_name', section.section_name)
        .select()
        .single()

      if (error) {
        console.error(`Error updating section ${section.section_name}:`, error)
        throw error
      }

      return data
    })

    const updatedSections = await Promise.all(updates)

    return NextResponse.json({
      success: true,
      sections: updatedSections
    })

  } catch (error) {
    console.error('Error in homepage sections API:', error)
    return NextResponse.json(
      { error: 'Failed to update homepage sections' },
      { status: 500 }
    )
  }
}
