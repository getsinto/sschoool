import { NextRequest, NextResponse } from 'next/server'
import { handleGoogleCallback } from '@/lib/google-meet/oauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/teacher/integrations/google?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/teacher/integrations/google?error=missing_parameters', request.url)
      )
    }

    // Handle OAuth callback with code and state
    const result = await handleGoogleCallback(code, state)

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/teacher/integrations/google?error=${encodeURIComponent(result.error || 'oauth_failed')}`, request.url)
      )
    }

    return NextResponse.redirect(
      new URL('/teacher/integrations/google?success=connected', request.url)
    )
  } catch (error) {
    console.error('Error in Google OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/teacher/integrations/google?error=callback_failed', request.url)
    )
  }
}
