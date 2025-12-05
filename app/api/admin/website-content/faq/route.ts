import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    let query = supabase
      .from('faqs')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }
    if (active !== null) {
      query = query.eq('is_active', active === 'true')
    }

    const { data: faqs, error, count } = await query

    if (error) {
      console.error('Error fetching FAQs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      faqs,
      total: count || 0
    })

  } catch (error) {
    console.error('Error in FAQs API:', error)
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
    const { question, answer, category, display_order } = body

    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: 'Question, answer, and category are required' },
        { status: 400 }
      )
    }

    const validCategories = ['admissions', 'courses', 'payments', 'technical', 'general']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // Get the highest display order if not provided
    let finalDisplayOrder = display_order
    if (!finalDisplayOrder) {
      const { data: maxOrderFAQ } = await supabase
        .from('faqs')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

      finalDisplayOrder = (maxOrderFAQ?.display_order || 0) + 1
    }

    // Create the FAQ
    const { data: newFAQ, error: insertError } = await supabase
      .from('faqs')
      .insert({
        question,
        answer,
        category,
        display_order: finalDisplayOrder,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating FAQ:', insertError)
      return NextResponse.json(
        { error: 'Failed to create FAQ' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      faq: newFAQ
    }, { status: 201 })

  } catch (error) {
    console.error('Error in FAQs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
