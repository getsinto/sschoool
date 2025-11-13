import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleGoogleCallback } from '@/lib/google-meet/auth';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/teacher/settings?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/teacher/settings?error=no_code', request.url)
      );
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', request.url)
      );
    }

    // Handle OAuth callback
    const result = await handleGoogleCallback(code, user.id);

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/dashboard/teacher/settings?error=${result.error}`, request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/dashboard/teacher/settings?success=google_connected', request.url)
    );
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/teacher/settings?error=callback_failed', request.url)
    );
  }
}
