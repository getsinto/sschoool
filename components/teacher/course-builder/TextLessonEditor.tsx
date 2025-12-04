'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bold, Italic, Underline, List, ListOrdered, Link, 
  Image, Code, Quote, Heading1, Heading2, Eye 
} from 'lucide-react'
import { TextLessonContent } from '@/types/lesson'

interface TextLessonEditorProps {
  content?: TextLessonContent
  onChange: (content: TextLessonContent) => void
}

export function TextLessonEditor({ content, onChange }: TextLessonEditorProps) {
  const [text, setText] = useState(content?.content || '')
  const [showPreview, setShowPreview] = useState(false)

  // Calculate reading time (200 words per minute average)
  const calculateReadingTime = (text: string): number => {
    const words = text.trim().split(/\s+/).length
    return Math.ceil(words / 200)
  }

  // Calculate word count
  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Update content when text changes
  useEffect(() => {
    const wordCount = getWordCount(text)
    const readingTime = calculateReadingTime(text)
    
    onChange({
      content: text,
      word_count: wordCount,
      reading_time_minutes: readingTime,
      has_images: text.includes('<img') || text.includes('!['),
      has_videos: text.includes('<video') || text.includes('<iframe'),
      has_code_blocks: text.includes('```') || text.includes('<code')
    })
  }, [text, onChange])

  // Simple formatting functions (basic implementation)
  const insertFormatting = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
    
    setText(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const wordCount = getWordCount(text)
  const readingTime = calculateReadingTime(text)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Lesson Content</Label>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{wordCount} words</span>
          <span>~{readingTime} min read</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {!showPreview ? (
        <>
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-gray-50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('# ', '')}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('## ', '')}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('**', '**')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('*', '*')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('~~', '~~')}
              title="Strikethrough"
            >
              <Underline className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('- ', '')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('1. ', '')}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('[', '](url)')}
              title="Link"
            >
              <Link className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('![alt text](', ')')}
              title="Image"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('`', '`')}
              title="Code"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('> ', '')}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </Button>
          </div>

          {/* Text Editor */}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your lesson content here... Supports Markdown formatting."
            rows={20}
            className="font-mono text-sm"
          />

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Formatting Guide:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><code># Heading 1</code> or <code>## Heading 2</code></li>
              <li><code>**bold**</code> or <code>*italic*</code></li>
              <li><code>- Bullet list</code> or <code>1. Numbered list</code></li>
              <li><code>[Link text](url)</code> for links</li>
              <li><code>![Alt text](image-url)</code> for images</li>
              <li><code>`code`</code> for inline code or <code>```code block```</code></li>
              <li><code>&gt; Quote</code> for blockquotes</li>
            </ul>
          </div>
        </>
      ) : (
        /* Preview */
        <div className="border rounded-lg p-6 bg-white min-h-[400px] prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(text) }} />
        </div>
      )}
    </div>
  )
}

// Simple markdown to HTML converter (basic implementation)
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />')

  // Code blocks
  html = html.replace(/```(.*?)```/gims, '<pre><code>$1</code></pre>')

  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>')

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

  // Line breaks
  html = html.replace(/\n/gim, '<br />')

  return html
}
