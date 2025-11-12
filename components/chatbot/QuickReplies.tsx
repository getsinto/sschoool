'use client'

import { Button } from '@/components/ui/button'

interface QuickRepliesProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export default function QuickReplies({ suggestions, onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          onClick={() => onSelect(suggestion)}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
