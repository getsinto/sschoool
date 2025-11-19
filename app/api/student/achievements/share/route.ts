import { NextRequest, NextResponse } from 'next/server'

// POST /api/student/achievements/share - Share badge on social media
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { badgeId, platform } = body

    if (!badgeId || !platform) {
      return NextResponse.json(
        { success: false, error: 'Badge ID and platform are required' },
        { status: 400 }
      )
    }

    // Mock badge data - replace with actual database query
    const mockBadge = {
      id: badgeId,
      name: 'Course Completer',
      description: 'Complete your first course',
      icon: '🎓',
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/achievements/${badgeId}`
    }

    // Generate share URLs for different platforms
    const shareUrls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(mockBadge.shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I earned the ${mockBadge.name} badge! ${mockBadge.description}`)}&url=${encodeURIComponent(mockBadge.shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mockBadge.shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(`Check out my ${mockBadge.name} badge!`)}&body=${encodeURIComponent(`I earned the ${mockBadge.name} badge: ${mockBadge.description}\n\nView it here: ${mockBadge.shareUrl}`)}`
    }

    const shareUrl = shareUrls[platform.toLowerCase()]

    if (!shareUrl) {
      return NextResponse.json(
        { success: false, error: 'Invalid platform' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        badge: mockBadge
      }
    })
  } catch (error) {
    console.error('Error generating share URL:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate share URL' },
      { status: 500 }
    )
  }
}
