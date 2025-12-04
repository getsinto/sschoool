import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/courses/[id]/media
 * List all media for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const courseId = params.id

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get course with media
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseError) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get media gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('course_media_gallery')
      .select('*')
      .eq('course_id', courseId)
      .order('display_order', { ascending: true })

    if (galleryError) {
      console.error('Error fetching gallery:', galleryError)
    }

    // Organize media
    const media = {
      thumbnail: course.thumbnail_url,
      banners: {
        desktop: course.banner_desktop_url,
        mobile: course.banner_mobile_url,
        card: course.card_banner_url,
        featured: course.featured_banner_url
      },
      promoVideo: course.promo_video_url ? {
        url: course.promo_video_url,
        thumbnail: course.promo_video_thumbnail,
        title: course.promo_video_title,
        description: course.promo_video_description,
        duration: course.promo_video_duration,
        provider: course.promo_video_provider
      } : null,
      gallery: gallery?.filter(item => item.media_type === 'image') || [],
      demoVideos: gallery?.filter(item => item.media_type === 'demo_video') || []
    }

    return NextResponse.json({ media })
  } catch (error: any) {
    console.error('Error fetching course media:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/media
 * Add media to course gallery
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const courseId = params.id

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      media_type,
      media_url,
      thumbnail_url,
      title,
      description,
      caption,
      alt_text,
      is_free_preview,
      duration_seconds,
      file_size_bytes,
      mime_type,
      width,
      height
    } = body

    // Validate required fields
    if (!media_type || !media_url) {
      return NextResponse.json(
        { error: 'Missing required fields: media_type, media_url' },
        { status: 400 }
      )
    }

    // Get current max display order
    const { data: maxOrder } = await supabase
      .from('course_media_gallery')
      .select('display_order')
      .eq('course_id', courseId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const display_order = (maxOrder?.display_order || 0) + 1

    // Insert media item
    const { data: mediaItem, error: insertError } = await supabase
      .from('course_media_gallery')
      .insert({
        course_id: courseId,
        media_type,
        media_url,
        thumbnail_url,
        title,
        description,
        caption,
        alt_text,
        display_order,
        is_free_preview: is_free_preview || false,
        duration_seconds,
        file_size_bytes,
        mime_type,
        width,
        height,
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting media:', insertError)
      return NextResponse.json(
        { error: 'Failed to add media' },
        { status: 500 }
      )
    }

    return NextResponse.json({ media: mediaItem }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding media:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add media' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/courses/[id]/media
 * Update course banners or promo video
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const courseId = params.id

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const updates: any = {}

    // Handle banner updates
    if (body.banners) {
      if (body.banners.desktop) updates.banner_desktop_url = body.banners.desktop
      if (body.banners.mobile) updates.banner_mobile_url = body.banners.mobile
      if (body.banners.card) updates.card_banner_url = body.banners.card
      if (body.banners.featured) updates.featured_banner_url = body.banners.featured
    }

    // Handle promo video updates
    if (body.promoVideo) {
      updates.promo_video_url = body.promoVideo.url
      updates.promo_video_thumbnail = body.promoVideo.thumbnail
      updates.promo_video_title = body.promoVideo.title
      updates.promo_video_description = body.promoVideo.description
      updates.promo_video_duration = body.promoVideo.duration
      updates.promo_video_provider = body.promoVideo.provider
    }

    // Handle thumbnail update
    if (body.thumbnail) {
      updates.thumbnail_url = body.thumbnail
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      )
    }

    // Update course
    const { data: course, error: updateError } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating course:', updateError)
      return NextResponse.json(
        { error: 'Failed to update course media' },
        { status: 500 }
      )
    }

    return NextResponse.json({ course })
  } catch (error: any) {
    console.error('Error updating course media:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update media' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]/media?mediaId=xxx
 * Remove media from gallery
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Missing mediaId parameter' },
        { status: 400 }
      )
    }

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete media item
    const { error: deleteError } = await supabase
      .from('course_media_gallery')
      .delete()
      .eq('id', mediaId)

    if (deleteError) {
      console.error('Error deleting media:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete media' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete media' },
      { status: 500 }
    )
  }
}
