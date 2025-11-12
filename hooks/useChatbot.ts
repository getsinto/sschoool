'use client';

import { useState, useCallback } from 'react';
import { ChatMessage, ChatbotResponse } from '@/types/chatbot';

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, context?: any) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          session_id: sessionId,
          context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ChatbotResponse = await response.json();

      if (!sessionId) {
        setSessionId(data.session_id);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        metadata: {
          intent: data.intent,
          confidence: data.confidence,
          suggestedActions: data.suggested_actions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact support.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  const submitFeedback = useCallback(async (messageId: string, rating: number, feedbackText?: string) => {
    try {
      await fetch('/api/chatbot/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          rating,
          feedback_text: feedbackText
        })
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    submitFeedback
  };
}
