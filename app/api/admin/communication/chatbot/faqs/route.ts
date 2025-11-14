import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const mockFAQs = [
  {
    id: '1',
    category: 'Enrollment',
    question: 'How do I enroll in a course?',
    answer: 'Navigate to the course page and click Enroll Now.',
    usageCount: 145,
    status: 'active'
  }
]

// GET /api/admin/communication/chatbot/faqs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let filtered = [...mockFAQs]

    if (category && category !== 'all') {
      filtered = filtered.filter(f => f.category === category)
    }

    return NextResponse.json({ faqs: filtered })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
}

// POST /api/admin/communication/chatbot/faqs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, question, answer } = body

    if (!category || !question || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newFAQ = {
      id: `faq_${Date.now()}`,
      category,
      question,
      answer,
      usageCount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'FAQ created successfully',
      faq: newFAQ
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    )
  }
}
