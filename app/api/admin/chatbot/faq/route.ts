import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    let query = supabase
      .from('faqs')
      .select('*, faq_categories(name)')
      .order('usage_count', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (active !== null && active !== 'all') {
      query = query.eq('active', active === 'true')
    }

    const { data: faqs, error: faqsError } = await query

    if (faqsError) {
      console.error('FAQs fetch error:', faqsError)
      throw faqsError
    }

    const { data: categories, error: categoriesError } = await supabase
      .from('faq_categories')
      .select('*')
      .order('name')

    if (categoriesError) {
      console.error('Categories fetch error:', categoriesError)
      throw categoriesError
    }

    return NextResponse.json({
      faqs: faqs || [],
      categories: categories || [],
      total: faqs?.length || 0
    })
  } catch (error) {
    console.error('FAQ fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const {
      question,
      answer,
      category,
      keywords,
      active = true
    } = await request.json()

    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: 'Question, answer, and category are required' },
        { status: 400 }
      )
    }

    const { data: faq, error: faqError } = await supabase
      .from('faqs')
      .insert({
        question: question.trim(),
        answer: answer.trim(),
        category,
        keywords: keywords || [],
        active,
        usage_count: 0
      })
      .select('*')
      .single()

    if (faqError) {
      console.error('FAQ creation error:', faqError)
      throw faqError
    }

    return NextResponse.json({
      faq,
      message: 'FAQ created successfully',
      success: true
    })
  } catch (error) {
    console.error('FAQ creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const {
      id,
      question,
      answer,
      category,
      keywords,
      active
    } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (question !== undefined) updateData.question = question.trim()
    if (answer !== undefined) updateData.answer = answer.trim()
    if (category !== undefined) updateData.category = category
    if (keywords !== undefined) updateData.keywords = keywords
    if (active !== undefined) updateData.active = active

    const { data: faq, error: faqError } = await supabase
      .from('faqs')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (faqError) {
      console.error('FAQ update error:', faqError)
      throw faqError
    }

    return NextResponse.json({
      faq,
      message: 'FAQ updated successfully',
      success: true
    })
  } catch (error) {
    console.error('FAQ update error:', error)
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID is required' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('FAQ deletion error:', deleteError)
      throw deleteError
    }

    return NextResponse.json({
      message: 'FAQ deleted successfully',
      success: true
    })
  } catch (error) {
    console.error('FAQ deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    )
  }
}
