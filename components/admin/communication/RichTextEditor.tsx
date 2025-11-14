'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Undo,
  Redo
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  minHeight = '200px'
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)

  // Toolbar button component
  const ToolbarButton = ({ icon: Icon, label, onClick }: any) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={label}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  )

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  return (
    <div className={`border rounded-lg ${isFocused ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-2 border-b bg-gray-50">
        <ToolbarButton icon={Bold} label="Bold" onClick={() => handleFormat('bold')} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => handleFormat('italic')} />
        <ToolbarButton icon={Underline} label="Underline" onClick={() => handleFormat('underline')} />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton icon={List} label="Bullet List" onClick={() => handleFormat('insertUnorderedList')} />
        <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => handleFormat('insertOrderedList')} />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton icon={LinkIcon} label="Insert Link" onClick={() => {
          const url = prompt('Enter URL:')
          if (url) handleFormat('createLink', url)
        }} />
        <ToolbarButton icon={ImageIcon} label="Insert Image" onClick={() => {
          const url = prompt('Enter image URL:')
          if (url) handleFormat('insertImage', url)
        }} />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton icon={Code} label="Code Block" onClick={() => handleFormat('formatBlock', 'pre')} />
        <ToolbarButton icon={Quote} label="Quote" onClick={() => handleFormat('formatBlock', 'blockquote')} />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton icon={Undo} label="Undo" onClick={() => handleFormat('undo')} />
        <ToolbarButton icon={Redo} label="Redo" onClick={() => handleFormat('redo')} />
      </div>

      {/* Editor */}
      <div
        contentEditable
        className="p-4 outline-none prose max-w-none"
        style={{ minHeight }}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false)
          onChange(e.currentTarget.innerHTML)
        }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      {/* Character Count */}
      <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 text-right">
        {value.replace(/<[^>]*>/g, '').length} characters
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  )
}
