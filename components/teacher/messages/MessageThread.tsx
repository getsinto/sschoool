'use client'

import { motion } from 'framer-motion'
import { Check, CheckCheck, Clock } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  isTeacher: boolean
  status: 'sending' | 'sent' | 'delivered' | 'read'
  attachments?: any[]
}

interface MessageThreadProps {
  messages: Message[]
}

export default function MessageThread({ messages }: MessageThreadProps) {
  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />
      default: return <Clock className="w-3 h-3 text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex ${message.isTeacher ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[70%] ${message.isTeacher ? 'order-2' : 'order-1'}`}>
            <div
              className={`rounded-lg p-3 ${
                message.isTeacher
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
              message.isTeacher ? 'justify-end' : 'justify-start'
            }`}>
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {message.isTeacher && getMessageStatusIcon(message.status)}
            </div>
          </div>
        </motion.div>
      ))}
      
      {messages.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation</p>
        </div>
      )}
    </div>
  )
}
