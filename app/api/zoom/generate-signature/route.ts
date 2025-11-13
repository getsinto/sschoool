import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSDKSignature } from '@/lib/zoom/join-links';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { meetingNumber, role } = body;

    if (!meetingNumber) {
      return NextResponse.json(
        { error: 'Meeting number is required' },
        { status: 400 }
      );
    }

    // Generate SDK signature
    const signature = generateSDKSignature(
      meetingNumber.toString(),
      role || 0 // 0 = participant, 1 = host
    );

    return NextResponse.json({
      signature,
      sdkKey: process.env.ZOOM_API_KEY,
      meetingNumber: meetingNumber.toString(),
      role: role || 0
    });
  } catch (error) {
    console.error('Error generating Zoom signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
