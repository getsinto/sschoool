'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bold, 
  Italic, 
  List, 
  Link, 
  Smile,
  Mic,
  Paperclip
} from 'lucide-react'

interface FeedbackEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showTemplates?: boolean
  onAttachFile?: () => void
  onVoiceRecord?: () => void
}

export default function FeedbackEditor({
  value,
  onChange,
  placeholder = 'Provide detailed feedback for the student...',
  showTemplates = true,
  onAttachFile,
  onVoiceRecord
}: FeedbackEditorProps) {
  const [showEmojis, setShowEmojis] = useState(false)

  const emojis = ['👍', '👏', '💯', '⭐', '✅', '❌', '💡', '📝', '🎯', '🔥']

  const quickPhrases = [
    'Great work!',
    'Well done!',
    'Needs improvement',
    'Please revise',
    'Excellent analysis',
    'Good effort'
  ]

  const insertText = (text: string) => {
    onChange(value + (value ? ' ' : '') + text)
  }

  const formatText = (format: string) => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let formattedText = ''
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'list':
        formattedText = `\n- ${selectedText}`
        break
      default:
        formattedText = selectedText
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 pb-3 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText('list')}
            title="List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmojis(!showEmojis)}
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </Button>
          
          <div className="ml-auto flex gap-2">
            {onAttachFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAttachFile}
                title="Attach File"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            )}
            {onVoiceRecord && (
              <Button
                variant="outline"
                size="sm"
                onClick={onVoiceRecord}
                title="Voice Feedback"
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Emojis */}
        {showEmojis && (
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertText(emoji)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Quick Phrases */}
        {showTemplates && (
          <div className="flex flex-wrap gap-2">
            {quickPhrases.map((phrase) => (
              <Badge
                key={phrase}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => insertText(phrase)}
              >
                {phrase}
              </Badge>
            ))}
          </div>
        )}

        {/* Text Area */}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="resize-none"
        />

        {/* Character Count */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>{value.length} characters</span>
          <span>{value.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </CardContent>
    </Card>
  )
}
