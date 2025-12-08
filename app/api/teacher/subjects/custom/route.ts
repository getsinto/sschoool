import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get teacher's custom subject requests
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: requests, error } = await supabase
      .from('custom_subject_requests')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ requests: requests || [] })
  } catch (error: any) {
    console.error('Error fetching custom subject requests:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Request custom subject
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject_name, description, category, justification } = await request.json()

    if (!subject_name || !justification) {
      return NextResponse.json(
        { error: 'Subject name and justification are required' },
        { status: 400 }
      )
    }

    // Insert custom subject request
    const { data, error } = await supabase
      .from('custom_subject_requests')
      .insert({
        teacher_id: user.id,
        subject_name,
        description,
        category,
        justification,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notify admins
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: 'New Custom Subject Request',
        message: `Teacher has requested to add "${subject_name}" as a new subject`,
        type: 'info',
        link_url: '/admin/subjects/requests'
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({
      message: 'Custom subject request submitted successfully',
      request: data
    })
  } catch (error: any) {
    console.error('Error creating custom subject request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
