'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Child {
  id: string
  name: string
  grade: string
  photo?: string
}

interface ChildSelectorProps {
  children: Child[]
  selectedChildId: string
  onChildChange: (childId: string) => void
}

export default function ChildSelector({ children, selectedChildId, onChildChange }: ChildSelectorProps) {
  return (
    <Select value={selectedChildId} onValueChange={onChildChange}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select a child" />
      </SelectTrigger>
      <SelectContent>
        {children.map(child => (
          <SelectItem key={child.id} value={child.id}>
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={child.photo} />
                <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{child.name}</span>
              <span className="text-xs text-muted-foreground">({child.grade})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
