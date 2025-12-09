import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/session/refresh
 * Refresh the user's session and extend expiry
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Refresh the session
    const {
      data: { session: refreshedSession },
      error: refreshError,
    } = await supabase.auth.refreshSession();

    if (refreshError || !refreshedSession) {
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 401 }
      );
    }

    // Update last activity in database
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        last_activity: new Date().toISOString(),
      })
      .eq('id', refreshedSession.user.id);

    if (updateError) {
      console.error('Failed to update last activity:', updateError);
      // Don't fail the request if this update fails
    }

    return NextResponse.json({
      success: true,
      expiresAt: refreshedSession.expires_at,
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
