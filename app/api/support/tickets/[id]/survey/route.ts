import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { rating, satisfaction, feedback } = await request.json()

    // Verify ticket exists and user has access
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Create or update survey response
    const { data: survey, error: surveyError } = await supabase
      .from('ticket_surveys')
      .upsert({
        ticket_id: params.id,
        user_id: user.id,
        rating: rating || null,
        satisfaction: satisfaction || null,
        feedback: feedback || null,
        submitted_at: new Date().toISOString()
      }, {
        onConflict: 'ticket_id'
      })
      .select('*')
      .single()

    if (surveyError) {
      console.error('Survey submission error:', surveyError)
      throw surveyError
    }

    // Update ticket with survey completion
    await supabase
      .from('support_tickets')
      .update({
        survey_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    return NextResponse.json({
      survey,
      message: 'Survey submitted successfully',
      success: true
    })
  } catch (error) {
    console.error('Survey submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get survey response
    const { data: survey, error: surveyError } = await supabase
      .from('ticket_surveys')
      .select('*')
      .eq('ticket_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (surveyError && surveyError.code !== 'PGRST116') {
      console.error('Survey fetch error:', surveyError)
      throw surveyError
    }

    return NextResponse.json({
      survey: survey || null,
      exists: !!survey
    })
  } catch (error) {
    console.error('Survey fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch survey' },
      { status: 500 }
    )
  }
}
