import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { validateSlug, generateSlugFromTitle } from '@/lib/seo/analyzer'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { slug, courseId, title } = body

    if (!slug && !title) {
      return NextResponse.json(
        { error: 'Either slug or title is required' },
        { status: 400 }
      )
    }

    // If title provided, generate slug
    let slugToCheck = slug
    if (!slugToCheck && title) {
      slugToCheck = generateSlugFromTitle(title)
    }

    // Validate slug format
    const validation = validateSlug(slugToCheck)
    if (!validation.valid) {
      return NextResponse.json({
        available: false,
        valid: false,
        error: validation.error,
        slug: slugToCheck
      })
    }

    // Check if slug is available
    let query = supabase
      .from('courses')
      .select('id, title')
      .eq('url_slug', slugToCheck)

    // Exclude current course if updating
    if (courseId) {
      query = query.neq('id', courseId)
    }

    const { data: existingCourse } = await query.single()

    if (existingCourse) {
      // Slug is taken, suggest alternatives
      const alternatives = await generateAlternativeSlugs(supabase, slugToCheck, courseId)
      
      return NextResponse.json({
        available: false,
        valid: true,
        slug: slugToCheck,
        message: `This slug is already used by "${existingCourse.title}"`,
        suggestions: alternatives
      })
    }

    // Slug is available
    return NextResponse.json({
      available: true,
      valid: true,
      slug: slugToCheck,
      message: 'This slug is available'
    })

  } catch (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate alternative slug suggestions
 */
async function generateAlternativeSlugs(
  supabase: any,
  baseSlug: string,
  excludeCourseId?: string
): Promise<string[]> {
  const alternatives: string[] = []
  
  // Try adding numbers
  for (let i = 2; i <= 5; i++) {
    const altSlug = `${baseSlug}-${i}`
    
    let query = supabase
      .from('courses')
      .select('id')
      .eq('url_slug', altSlug)
    
    if (excludeCourseId) {
      query = query.neq('id', excludeCourseId)
    }
    
    const { data } = await query.single()
    
    if (!data) {
      alternatives.push(altSlug)
    }
    
    if (alternatives.length >= 3) break
  }
  
  // Try adding year
  const year = new Date().getFullYear()
  const yearSlug = `${baseSlug}-${year}`
  
  let yearQuery = supabase
    .from('courses')
    .select('id')
    .eq('url_slug', yearSlug)
  
  if (excludeCourseId) {
    yearQuery = yearQuery.neq('id', excludeCourseId)
  }
  
  const { data: yearData } = await yearQuery.single()
  
  if (!yearData && alternatives.length < 3) {
    alternatives.push(yearSlug)
  }
  
  // Try shortening the slug
  if (baseSlug.length > 30 && alternatives.length < 3) {
    const words = baseSlug.split('-')
    if (words.length > 3) {
      const shortSlug = words.slice(0, 3).join('-')
      
      let shortQuery = supabase
        .from('courses')
        .select('id')
        .eq('url_slug', shortSlug)
      
      if (excludeCourseId) {
        shortQuery = shortQuery.neq('id', excludeCourseId)
      }
      
      const { data: shortData } = await shortQuery.single()
      
      if (!shortData) {
        alternatives.push(shortSlug)
      }
    }
  }
  
  return alternatives
}
