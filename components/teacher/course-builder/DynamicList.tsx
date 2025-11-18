'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'

interface DynamicListProps {
  label: string
  value: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  required?: boolean
}

export function DynamicList({
  label,
  value = [],
  onChange,
  placeholder = 'Add item...',
  required = false
}: DynamicListProps) {
  const [newItem, setNewItem] = useState('')

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...value, newItem.trim()])
      setNewItem('')
    }
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Existing items */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group"
            >
              <span className="flex-1 text-sm text-gray-700">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!newItem.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-gray-500">No items added yet</p>
      )}
    </div>
  )
}
