import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get teacher's subjects
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get teacher's subjects using the function
    const { data: subjects, error } = await supabase
      .rpc('get_teacher_subjects', { p_teacher_id: user.id })

    if (error) {
      console.error('Error fetching teacher subjects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ subjects: subjects || [] })
  } catch (error: any) {
    console.error('Error in teacher subjects API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add subject to teacher
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject_id, is_primary, proficiency_level, years_experience, certification_url } = await request.json()

    if (!subject_id) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 })
    }

    // Insert teacher subject
    const { data, error } = await supabase
      .from('teacher_subjects')
      .insert({
        teacher_id: user.id,
        subject_id,
        is_primary: is_primary || false,
        proficiency_level: proficiency_level || 'intermediate',
        years_experience: years_experience || 0,
        certification_url,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Subject already added' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Subject added successfully. Pending admin approval.',
      subject: data
    })
  } catch (error: any) {
    console.error('Error adding teacher subject:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
