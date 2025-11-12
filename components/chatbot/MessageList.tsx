'use client'

import { Bot, User } from 'lucide-react'
import { format } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            message.role === 'user' ? 'bg-blue-600' : 'bg-gray-300'
          }`}>
            {message.role === 'user' ? (
              <User className="h-5 w-5 text-white" />
            ) : (
              <Bot className="h-5 w-5 text-gray-700" />
            )}
          </div>

          {/* Message Bubble */}
          <div className={`flex flex-col max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
          </div>
        </div>
      ))}
    </>
  )
}
