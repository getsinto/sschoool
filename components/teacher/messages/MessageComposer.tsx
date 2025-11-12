'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paperclip, Send, Smile } from 'lucide-react'

interface MessageComposerProps {
  onSend: (message: string, attachments?: File[]) => void
  placeholder?: string
  disabled?: boolean
}

export default function MessageComposer({ 
  onSend, 
  placeholder = 'Type your message...', 
  disabled = false 
}: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend(message, attachments)
      setMessage('')
      setAttachments([])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  return (
    <div className="space-y-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {file.name}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <label htmlFor="file-upload">
          <Button variant="ghost" size="sm" type="button" disabled={disabled}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </label>
        
        <Input
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1"
        />
        
        <Button 
          onClick={handleSend} 
          disabled={disabled || (!message.trim() && attachments.length === 0)}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <p className="text-xs text-gray-500">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
