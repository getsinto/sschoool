'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, Paperclip, User, Shield } from 'lucide-react'

interface Message {
  id: string
  sender: 'user' | 'admin'
  senderName: string
  content: string
  timestamp: string
  isInternal?: boolean
  attachments?: string[]
}

interface TicketThreadProps {
  messages: Message[]
  onSendMessage: (content: string, isInternal: boolean) => void
  onSendReply: (content: string) => void
}

export default function TicketThread({ messages, onSendMessage, onSendReply }: TicketThreadProps) {
  const [replyContent, setReplyContent] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const handleSend = () => {
    if (isInternal && internalNote.trim()) {
      onSendMessage(internalNote, true)
      setInternalNote('')
    } else if (!isInternal && replyContent.trim()) {
      onSendReply(replyContent)
      setReplyContent('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Messages Thread */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.isInternal ? 'w-full' : ''}`}>
                  {message.isInternal ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-800">Internal Note</span>
                        <Badge variant="outline" className="text-xs">
                          {message.senderName}
                        </Badge>
                      </div>
                      <p className="text-sm text-yellow-900">{message.content}</p>
                      <p className="text-xs text-yellow-600 mt-2">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">{message.senderName}</span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-1 text-xs">
                              <Paperclip className="w-3 h-3" />
                              <span>{attachment}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className={`text-xs mt-2 ${message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reply Section */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Toggle between reply and internal note */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isInternal}
                  onChange={() => setIsInternal(false)}
                  className="rounded-full"
                />
                <span className="text-sm">Reply to User</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isInternal}
                  onChange={() => setIsInternal(true)}
                  className="rounded-full"
                />
                <span className="text-sm">Internal Note</span>
              </label>
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                placeholder={isInternal ? 'Add internal note (not visible to user)...' : 'Type your reply...'}
                value={isInternal ? internalNote : replyContent}
                onChange={(e) => isInternal ? setInternalNote(e.target.value) : setReplyContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className={isInternal ? 'border-yellow-300' : ''}
              />
              <Button onClick={handleSend} disabled={isInternal ? !internalNote.trim() : !replyContent.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Attachments */}
            <Button variant="outline" size="sm">
              <Paperclip className="w-4 h-4 mr-2" />
              Attach File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
