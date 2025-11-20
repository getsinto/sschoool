import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const category = searchParams.get('category')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Build query
    let dbQuery = supabase
      .from('chatbot_faqs')
      .select('*')
      .eq('active', true)

    // Filter by category if provided
    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    // Search in question, answer, and keywords
    const searchTerm = query.toLowerCase()
    dbQuery = dbQuery.or(
      `question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`
    )

    const { data: faqs, error } = await dbQuery
      .order('usage_count', { ascending: false })
      .limit(10)

    if (error) throw error

    // Calculate relevance score for each FAQ
    const rankedFaqs = faqs.map(faq => {
      let score = 0
      const lowerQuestion = faq.question.toLowerCase()
      const lowerAnswer = faq.answer.toLowerCase()
      const keywords = faq.keywords || []

      // Exact match in question (highest priority)
      if (lowerQuestion.includes(searchTerm)) {
        score += 10
      }

      // Keyword match
      if (keywords.some((k: string) => k.toLowerCase().includes(searchTerm))) {
        score += 5
      }

      // Answer match
      if (lowerAnswer.includes(searchTerm)) {
        score += 3
      }

      // Popularity bonus
      score += Math.min(faq.usage_count / 10, 2)

      // Helpfulness ratio
      const totalVotes = faq.helpful_count + faq.not_helpful_count
      if (totalVotes > 0) {
        const helpfulRatio = faq.helpful_count / totalVotes
        score += helpfulRatio * 2
      }

      return { ...faq, relevanceScore: score }
    })

    // Sort by relevance score
    rankedFaqs.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Increment usage count for top result
    if (rankedFaqs.length > 0) {
      await supabase
        .from('chatbot_faqs')
        .update({ usage_count: rankedFaqs[0].usage_count + 1 })
        .eq('id', rankedFaqs[0].id)
    }

    return NextResponse.json({
      faqs: rankedFaqs,
      count: rankedFaqs.length,
      query: query,
    })
  } catch (error) {
    console.error('FAQ search error:', error)
    return NextResponse.json(
      { error: 'Failed to search FAQs' },
      { status: 500 }
    )
  }
}

// Mark FAQ as helpful/not helpful
export async function POST(request: NextRequest) {
  try {
    const { faqId, helpful } = await request.json()

    if (!faqId || typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'FAQ ID and helpful flag are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current counts
    const { data: faq, error: fetchError } = await supabase
      .from('chatbot_faqs')
      .select('helpful_count, not_helpful_count')
      .eq('id', faqId)
      .single()

    if (fetchError) throw fetchError

    // Update counts
    const updateData = helpful
      ? { helpful_count: faq.helpful_count + 1 }
      : { not_helpful_count: faq.not_helpful_count + 1 }

    const { error: updateError } = await supabase
      .from('chatbot_faqs')
      .update(updateData)
      .eq('id', faqId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded',
    })
  } catch (error) {
    console.error('FAQ feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    )
  }
}
