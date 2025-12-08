import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Fetch course pricing
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Database error fetching course:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check permissions
    if (course.instructor_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      pricing_model: course.pricing_model,
      price: course.price,
      currency: course.currency,
      subscription_type: course.subscription_type,
      subscription_price: course.subscription_price,
      auto_renewal: course.auto_renewal,
      payment_plan_enabled: course.payment_plan_enabled,
      payment_plan_installments: course.payment_plan_installments,
      payment_plan_frequency: course.payment_plan_frequency,
      early_bird_enabled: course.early_bird_enabled,
      early_bird_price: course.early_bird_price,
      early_bird_deadline: course.early_bird_deadline,
      regular_price: course.regular_price,
      max_students: course.max_students,
      min_students: course.min_students,
      enable_waitlist: course.enable_waitlist,
      access_duration_type: course.access_duration_type,
      access_duration_days: course.access_duration_days,
      is_batch_based: course.is_batch_based,
      min_price: course.min_price,
      suggested_price: course.suggested_price,
      free_trial_enabled: course.free_trial_enabled,
      free_trial_days: course.free_trial_days,
      trial_requires_card: course.trial_requires_card,
      pricing_tiers: course.pricing_tiers
    })

  } catch (error) {
    console.error('Error fetching pricing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Fetch course
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      console.error('Database error fetching course:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check permissions
    if (course.instructor_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate pricing model
    const validModels = ['free', 'one_time', 'subscription', 'tiered', 'pay_what_you_want', 'bulk', 'early_bird', 'free_trial']
    if (body.pricing_model && !validModels.includes(body.pricing_model)) {
      return NextResponse.json(
        { error: 'Invalid pricing model' },
        { status: 400 }
      )
    }

    // Update pricing
    const { data: updated, error: updateError } = await supabase
      .from('courses')
      .update({
        pricing_model: body.pricing_model,
        price: body.price,
        currency: body.currency,
        subscription_type: body.subscription_type,
        subscription_price: body.subscription_price,
        auto_renewal: body.auto_renewal,
        payment_plan_enabled: body.payment_plan_enabled,
        payment_plan_installments: body.payment_plan_installments,
        payment_plan_frequency: body.payment_plan_frequency,
        early_bird_enabled: body.early_bird_enabled,
        early_bird_price: body.early_bird_price,
        early_bird_deadline: body.early_bird_deadline,
        regular_price: body.regular_price,
        max_students: body.max_students,
        min_students: body.min_students,
        enable_waitlist: body.enable_waitlist,
        access_duration_type: body.access_duration_type,
        access_duration_days: body.access_duration_days,
        is_batch_based: body.is_batch_based,
        min_price: body.min_price,
        suggested_price: body.suggested_price,
        free_trial_enabled: body.free_trial_enabled,
        free_trial_days: body.free_trial_days,
        trial_requires_card: body.trial_requires_card,
        pricing_tiers: body.pricing_tiers,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(updated)

  } catch (error) {
    console.error('Error updating pricing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
