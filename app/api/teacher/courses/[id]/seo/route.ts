import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateSEOScore, generateMetaTags, generateSchemaMarkup } from '@/lib/seo/analyzer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseId = params.id

    // Get course SEO data
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        thumbnail,
        category,
        meta_title,
        meta_description,
        seo_keywords,
        url_slug,
        og_title,
        og_description,
        og_image_url,
        twitter_card_type,
        twitter_title,
        twitter_description,
        canonical_url,
        robots_meta,
        seo_score,
        price,
        currency,
        rating,
        review_count
      `)
      .eq('id', courseId)
      .single()

    if (error || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Calculate SEO score
    const seoScore = calculateSEOScore(course)

    // Generate meta tags preview
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stharoon.com'
    const metaTags = generateMetaTags(course, baseUrl)

    // Generate schema markup
    const schemaMarkup = generateSchemaMarkup(course, baseUrl)

    return NextResponse.json({
      seo_score: seoScore,
      meta_tags: metaTags,
      schema_markup: schemaMarkup,
      current_data: {
        meta_title: course.meta_title,
        meta_description: course.meta_description,
        seo_keywords: course.seo_keywords,
        url_slug: course.url_slug,
        og_title: course.og_title,
        og_description: course.og_description,
        og_image_url: course.og_image_url,
        twitter_card_type: course.twitter_card_type,
        canonical_url: course.canonical_url,
        robots_meta: course.robots_meta
      }
    })

  } catch (error) {
    console.error('Error fetching SEO data:', error)
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
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courseId = params.id
    const body = await request.json()

    // Verify course ownership or admin access
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('created_by, title, description, thumbnail, category')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isOwner = course.created_by === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}

    if (body.meta_title !== undefined) {
      updateData.meta_title = body.meta_title
    }

    if (body.meta_description !== undefined) {
      updateData.meta_description = body.meta_description
    }

    if (body.seo_keywords !== undefined) {
      updateData.seo_keywords = body.seo_keywords
    }

    if (body.url_slug !== undefined) {
      // Validate slug format
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      if (!slugRegex.test(body.url_slug)) {
        return NextResponse.json(
          { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' },
          { status: 400 }
        )
      }

      // Check if slug is already taken
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('url_slug', body.url_slug)
        .neq('id', courseId)
        .single()

      if (existingCourse) {
        return NextResponse.json(
          { error: 'This URL slug is already in use' },
          { status: 409 }
        )
      }

      updateData.url_slug = body.url_slug
    }

    if (body.og_title !== undefined) {
      updateData.og_title = body.og_title
    }

    if (body.og_description !== undefined) {
      updateData.og_description = body.og_description
    }

    if (body.og_image_url !== undefined) {
      updateData.og_image_url = body.og_image_url
    }

    if (body.twitter_card_type !== undefined) {
      updateData.twitter_card_type = body.twitter_card_type
    }

    if (body.twitter_title !== undefined) {
      updateData.twitter_title = body.twitter_title
    }

    if (body.twitter_description !== undefined) {
      updateData.twitter_description = body.twitter_description
    }

    if (body.canonical_url !== undefined) {
      updateData.canonical_url = body.canonical_url
    }

    if (body.robots_meta !== undefined) {
      updateData.robots_meta = body.robots_meta
    }

    // Update the course
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating course SEO:', updateError)
      return NextResponse.json(
        { error: 'Failed to update course SEO' },
        { status: 500 }
      )
    }

    // Recalculate SEO score
    const seoScore = calculateSEOScore(updatedCourse)

    // Update SEO score in database
    await supabase
      .from('courses')
      .update({ seo_score: seoScore.total })
      .eq('id', courseId)

    // Create SEO audit record
    await supabase.from('course_seo_audits').insert({
      course_id: courseId,
      seo_score: seoScore.total,
      issues: seoScore.issues,
      suggestions: seoScore.suggestions,
      audited_by: user.id
    })

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      seo_score: seoScore
    })

  } catch (error) {
    console.error('Error in SEO API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
