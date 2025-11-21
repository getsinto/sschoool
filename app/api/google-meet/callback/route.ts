import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleGoogleCallback } from '@/lib/google-meet/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/teacher/integrations?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/teacher/integrations?error=no_code', request.url)
      )
    }

    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      )
    }

    // Handle OAuth callback
    const result = await handleGoogleCallback(code, user.id)

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/teacher/integrations?error=${encodeURIComponent(result.error || 'oauth_failed')}`, request.url)
      )
    }

    return NextResponse.redirect(
      new URL('/teacher/integrations?success=google_connected', request.url)
    )
  } catch (error) {
    console.error('Error in Google OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/teacher/integrations?error=callback_failed', request.url)
    )
  }
}
