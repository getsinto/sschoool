import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasGoogleIntegration, getUserGoogleTokens } from '@/lib/google-meet/auth';
import { isGoogleConfigured } from '@/lib/google-meet/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isConfigured = isGoogleConfigured();
    const hasIntegration = await hasGoogleIntegration(user.id);
    
    let integrationDetails = null;
    if (hasIntegration) {
      const tokens = await getUserGoogleTokens(user.id);
      if (tokens) {
        integrationDetails = {
          connected: true,
          scopes: tokens.scope.split(' '),
          expiresAt: new Date(tokens.expiry_date).toISOString()
        };
      }
    }

    return NextResponse.json({
      configured: isConfigured,
      connected: hasIntegration,
      integration: integrationDetails
    });
  } catch (error) {
    console.error('Error checking Google Meet status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
