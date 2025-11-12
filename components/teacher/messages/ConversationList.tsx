'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

interface Conversation {
  id: string
  student: {
    id: string
    name: string
    avatar?: string
  }
  lastMessage: string
  timestamp: string
  unreadCount: number
  isStarred: boolean
  status: 'read' | 'unread'
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conversation: Conversation) => void
}

export default function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect 
}: ConversationListProps) {
  return (
    <div className="divide-y">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedId === conversation.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.student.avatar} />
              <AvatarFallback>{conversation.student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-sm truncate">
                  {conversation.student.name}
                </h4>
                <span className="text-xs text-gray-500">
                  {new Date(conversation.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {conversation.lastMessage}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {conversation.unreadCount > 0 && (
                  <Badge className="bg-blue-600 text-white">
                    {conversation.unreadCount}
                  </Badge>
                )}
                {conversation.isStarred && (
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {conversations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No conversations</p>
        </div>
      )}
    </div>
  )
}
