import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateSitemap } from '@/lib/seo/analyzer'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get all published courses
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        id,
        url_slug,
        updated_at,
        created_at,
        is_featured,
        status
      `)
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses for sitemap:', error)
      return new NextResponse('Error generating sitemap', { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stharoon.com'
    const sitemapXml = generateSitemap(courses || [], baseUrl)

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
