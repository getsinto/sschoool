'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, CheckCircle } from 'lucide-react'
import { TextLessonContent } from '@/types/lesson'

interface TextLessonViewerProps {
  content: TextLessonContent
  onComplete?: () => void
  isCompleted?: boolean
}

export function TextLessonViewer({ 
  content, 
  onComplete,
  isCompleted = false 
}: TextLessonViewerProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('text-lesson-content')
      if (!element) return

      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight - element.clientHeight
      const progress = (scrollTop / scrollHeight) * 100

      setReadingProgress(Math.min(progress, 100))

      // Check if scrolled to bottom (95%+)
      if (progress >= 95 && !hasScrolledToBottom) {
        setHasScrolledToBottom(true)
      }
    }

    const element = document.getElementById('text-lesson-content')
    element?.addEventListener('scroll', handleScroll)

    return () => {
      element?.removeEventListener('scroll', handleScroll)
    }
  }, [hasScrolledToBottom])

  // Auto-complete when scrolled to bottom
  useEffect(() => {
    if (hasScrolledToBottom && !isCompleted && onComplete) {
      onComplete()
    }
  }, [hasScrolledToBottom, isCompleted, onComplete])

  return (
    <div className="space-y-4">
      {/* Reading Info Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>{content.word_count || 0} words</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>~{content.reading_time_minutes || 0} min read</span>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Completed</span>
            </div>
          )}
        </div>

        {/* Reading Progress */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {Math.round(readingProgress)}% read
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div 
        id="text-lesson-content"
        className="prose prose-lg max-w-none bg-white rounded-lg p-8 shadow-sm overflow-y-auto"
        style={{ maxHeight: '70vh' }}
      >
        <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(content.content) }} />
      </div>

      {/* Complete Button */}
      {!isCompleted && hasScrolledToBottom && (
        <div className="flex justify-center">
          <Button onClick={onComplete} size="lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Mark as Complete
          </Button>
        </div>
      )}
    </div>
  )
}

// Simple markdown to HTML converter
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

  // Strikethrough
  html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="rounded-lg shadow-md my-4" />')

  // Code blocks
  html = html.replace(/```(.*?)```/gims, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>')

  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>')

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">$1</blockquote>')

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul class="list-disc list-inside space-y-2">$1</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')

  // Paragraphs (line breaks)
  html = html.replace(/\n\n/gim, '</p><p class="mb-4">')
  html = '<p class="mb-4">' + html + '</p>'

  return html
}
