import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/session/verify
 * Verify the user's session is valid
 * Checks both token expiration and database session status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { valid: false, error: 'No active session' },
        { status: 401 }
      );
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      return NextResponse.json(
        { valid: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    // Verify user still exists and is active in database
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, role, is_active')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { valid: false, error: 'User not found' },
        { status: 401 }
      );
    }

    if (!userProfile.is_active) {
      return NextResponse.json(
        { valid: false, error: 'User account is inactive' },
        { status: 401 }
      );
    }

    // Session is valid
    return NextResponse.json({
      valid: true,
      userId: session.user.id,
      role: userProfile.role,
      expiresAt: session.expires_at,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
