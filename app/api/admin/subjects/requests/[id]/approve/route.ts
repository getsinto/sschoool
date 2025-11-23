import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const requestId = params.id

    // Get the request details
    const { data: subjectRequest, error: fetchError } = await supabase
      .from('custom_subject_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !subjectRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (subjectRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    // Create the new subject
    const { data: newSubject, error: subjectError } = await supabase
      .from('subjects')
      .insert({
        name: subjectRequest.subject_name,
        description: subjectRequest.description,
        category: subjectRequest.category,
        is_active: true,
        is_custom: true,
        created_by: user.id,
        approved_by: user.id
      })
      .select()
      .single()

    if (subjectError) {
      if (subjectError.code === '23505') {
        return NextResponse.json({ error: 'Subject already exists' }, { status: 400 })
      }
      return NextResponse.json({ error: subjectError.message }, { status: 500 })
    }

    // Update the request status
    const { error: updateError } = await supabase
      .from('custom_subject_requests')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        created_subject_id: newSubject.id
      })
      .eq('id', requestId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Automatically add the subject to the teacher who requested it
    await supabase
      .from('teacher_subjects')
      .insert({
        teacher_id: subjectRequest.teacher_id,
        subject_id: newSubject.id,
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })

    // Notify the teacher
    await supabase
      .from('notifications')
      .insert({
        user_id: subjectRequest.teacher_id,
        title: 'Custom Subject Approved',
        message: `Your request to add "${subjectRequest.subject_name}" has been approved!`,
        type: 'success',
        link_url: '/teacher/subjects'
      })

    return NextResponse.json({
      message: 'Subject request approved successfully',
      subject: newSubject
    })
  } catch (error: any) {
    console.error('Error approving subject request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
