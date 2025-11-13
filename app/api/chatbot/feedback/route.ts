import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { message_id, rating, feedback_text } = body;

    if (!message_id || !rating) {
      return NextResponse.json(
        { error: 'Message ID and rating are required' },
        { status: 400 }
      );
    }

    // Update message with feedback
    const { error } = await supabase
      .from('chatbot_messages')
      .update({
        feedback_rating: rating,
        feedback_text: feedback_text || null,
        feedback_at: new Date().toISOString()
      })
      .eq('id', message_id);

    if (error) {
      console.error('Error saving feedback:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
