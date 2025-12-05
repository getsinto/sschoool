import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    const section = searchParams.get('section')
    const key = searchParams.get('key')

    let query = supabase
      .from('website_content')
      .select('*')
      .order('content_key', { ascending: true })

    if (section) {
      query = query.eq('section', section)
    }
    if (key) {
      query = query.eq('content_key', key)
    }

    const { data: content, error } = await query

    if (error) {
      console.error('Error fetching website content:', error)
      return NextResponse.json(
        { error: 'Failed to fetch website content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ content })

  } catch (error) {
    console.error('Error in website content API:', error)
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
    const { content_key, content_value, content_type, section, metadata } = body

    if (!content_key) {
      return NextResponse.json(
        { error: 'Content key is required' },
        { status: 400 }
      )
    }

    const validContentTypes = ['text', 'html', 'image', 'video', 'json', 'url']
    if (content_type && !validContentTypes.includes(content_type)) {
      return NextResponse.json(
        { error: `Content type must be one of: ${validContentTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if content exists
    const { data: existingContent } = await supabase
      .from('website_content')
      .select('*')
      .eq('content_key', content_key)
      .single()

    let result

    if (existingContent) {
      // Update existing content
      const { data: updatedContent, error: updateError } = await supabase
        .from('website_content')
        .update({
          content_value: content_value || null,
          content_type: content_type || existingContent.content_type,
          section: section || existingContent.section,
          metadata: metadata || existingContent.metadata,
          last_updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('content_key', content_key)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating content:', updateError)
        return NextResponse.json(
          { error: 'Failed to update content' },
          { status: 500 }
        )
      }

      result = updatedContent
    } else {
      // Create new content
      const { data: newContent, error: insertError } = await supabase
        .from('website_content')
        .insert({
          content_key,
          content_value: content_value || null,
          content_type: content_type || 'text',
          section: section || null,
          metadata: metadata || null,
          last_updated_by: user.id
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating content:', insertError)
        return NextResponse.json(
          { error: 'Failed to create content' },
          { status: 500 }
        )
      }

      result = newContent
    }

    return NextResponse.json({
      success: true,
      content: result
    })

  } catch (error) {
    console.error('Error in website content API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
