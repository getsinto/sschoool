'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Minimize2, Send, User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MessageList from './MessageList'
import QuickReplies from './QuickReplies'
import TypingIndicator from './TypingIndicator'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface ChatInterfaceProps {
  onClose: () => void
  onMinimize: () => void
  onNewMessage: () => void
}

export default function ChatInterface({ onClose, onMinimize, onNewMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('chatHistory')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // Welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Welcome! I'm the St Haroon Assistant. How can I help you today?",
        timestamp: new Date(),
        suggestions: ['Browse Courses', 'Enrollment Process', 'Pricing', 'Contact Us']
      }])
    }
  }, [])

  useEffect(() => {
    // Save chat history
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages
        })
      })

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions
      }

      setMessages(prev => [...prev, botMessage])
      onNewMessage()
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again or contact support.",
        timestamp: new Date(),
        suggestions: ['Try Again', 'Contact Support']
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    setInput(reply)
    setTimeout(() => handleSend(), 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEscalate = () => {
    // Navigate to support ticket creation
    window.location.href = '/support/create'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-8 w-8" />
            <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-semibold">St Haroon Assistant</h3>
            <p className="text-xs opacity-90">
              {isTyping ? 'Typing...' : isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onMinimize}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <MessageList messages={messages} />
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length > 0 && messages[messages.length - 1].suggestions && (
        <div className="px-4 py-2 border-t bg-white">
          <QuickReplies
            suggestions={messages[messages.length - 1].suggestions!}
            onSelect={handleQuickReply}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            maxLength={500}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <button
            onClick={handleEscalate}
            className="text-blue-600 hover:underline"
          >
            Talk to human support
          </button>
          <span>{input.length}/500</span>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">
          Powered by Google Gemini
        </div>
      </div>
    </div>
  )
}
