import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateChatResponse } from '@/lib/chatbot/gemini';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Chatbot service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const supabase = createClient();
    const body = await request.json();
    const { message, session_id, context } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Create or get session
    let sessionId = session_id;
    if (!sessionId) {
      sessionId = uuidv4();
      
      await supabase.from('chatbot_sessions').insert({
        id: sessionId,
        user_id: userId,
        started_at: new Date().toISOString()
      });
    }

    // Save user message
    const userMessageId = uuidv4();
    await supabase.from('chatbot_messages').insert({
      id: userMessageId,
      session_id: sessionId,
      role: 'user',
      content: message.trim()
    });

    // Get conversation history
    const { data: history } = await supabase
      .from('chatbot_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    // Generate AI response
    const aiResponse = await generateChatResponse(
      message,
      history || [],
      context,
      userId
    );

    // Save AI response
    const aiMessageId = uuidv4();
    await supabase.from('chatbot_messages').insert({
      id: aiMessageId,
      session_id: sessionId,
      role: 'assistant',
      content: aiResponse.message,
      metadata: {
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        suggested_actions: aiResponse.suggestedActions
      }
    });

    // Update session
    await supabase
      .from('chatbot_sessions')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: supabase.rpc('increment', { row_id: sessionId })
      })
      .eq('id', sessionId);

    return NextResponse.json({
      session_id: sessionId,
      message: aiResponse.message,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      suggested_actions: aiResponse.suggestedActions,
      requires_escalation: aiResponse.requiresEscalation
    });
  } catch (error) {
    console.error('Error in chatbot API:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
