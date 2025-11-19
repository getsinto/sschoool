'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Paperclip } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderPhoto?: string
  message: string
  timestamp: string
  isOwn: boolean
}

interface MessageThreadProps {
  messages: Message[]
  onSendMessage: (message: string) => void
}

export default function MessageThread({ messages, onSendMessage }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : ''}`}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={message.senderPhoto} />
              <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={`flex flex-col ${message.isOwn ? 'items-end' : ''}`}>
              <div
                className={`rounded-lg p-3 max-w-md ${
                  message.isOwn ? 'bg-primary text-white' : 'bg-gray-100'
                }`}
              >
                <p className="text-sm">{message.message}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
