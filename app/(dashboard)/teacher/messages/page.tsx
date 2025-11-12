'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Filter,
  Plus,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

// Mock conversations
const mockConversations = [
  {
    id: '1',
    student: {
      id: 's1',
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg'
    },
    lastMessage: 'Thank you for the feedback on my assignment!',
    timestamp: '2024-01-20T14:30:00',
    unreadCount: 2,
    isStarred: false,
    status: 'read'
  },
  {
    id: '2',
    student: {
      id: 's2',
      name: 'Michael Chen',
      avatar: '/avatars/michael.jpg'
    },
    lastMessage: 'Could you please explain the concept from today\'s lesson?',
    timestamp: '2024-01-20T13:15:00',
    unreadCount: 1,
    isStarred: true,
    status: 'unread'
  },
  {
    id: '3',
    student: {
      id: 's3',
      name: 'Emma Davis',
      avatar: '/avatars/emma.jpg'
    },
    lastMessage: 'I submitted the assignment. Please let me know if you received it.',
    timestamp: '2024-01-19T16:45:00',
    unreadCount: 0,
    isStarred: false,
    status: 'read'
  }
]

// Mock messages for selected conversation
const mockMessages = [
  {
    id: 'm1',
    senderId: 's1',
    senderName: 'Sarah Johnson',
    text: 'Hello! I have a question about the assignment.',
    timestamp: '2024-01-20T14:00:00',
    isTeacher: false,
    status: 'read'
  },
  {
    id: 'm2',
    senderId: 'teacher',
    senderName: 'You',
    text: 'Hi Sarah! Of course, what would you like to know?',
    timestamp: '2024-01-20T14:05:00',
    isTeacher: true,
    status: 'read'
  },
  {
    id: 'm3',
    senderId: 's1',
    senderName: 'Sarah Johnson',
    text: 'I\'m not sure about question 3. Could you provide some guidance?',
    timestamp: '2024-01-20T14:10:00',
    isTeacher: false,
    status: 'read'
  },
  {
    id: 'm4',
    senderId: 'teacher',
    senderName: 'You',
    text: 'Sure! For question 3, think about the relationship between the variables. Try breaking it down into smaller steps.',
    timestamp: '2024-01-20T14:15:00',
    isTeacher: true,
    status: 'read'
  },
  {
    id: 'm5',
    senderId: 's1',
    senderName: 'Sarah Johnson',
    text: 'Thank you for the feedback on my assignment!',
    timestamp: '2024-01-20T14:30:00',
    isTeacher: false,
    status: 'delivered'
  }
]

export default function TeacherMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('all')

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // TODO: Send message via API
      setMessageText('')
    }
  }

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />
      default: return <Clock className="w-3 h-3 text-gray-400" />
    }
  }

  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.student.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      filterTab === 'all' ||
      (filterTab === 'unread' && conv.unreadCount > 0) ||
      (filterTab === 'starred' && conv.isStarred)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Communicate with your students</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/teacher/messages/compose">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </Link>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            {/* Search and Filter */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs value={filterTab} onValueChange={setFilterTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                  <TabsTrigger value="starred" className="flex-1">Starred</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Conversations */}
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation.id === conversation.id ? 'bg-blue-50' : ''
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
            </div>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            {/* Thread Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation.student.avatar} />
                  <AvatarFallback>{selectedConversation.student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConversation.student.name}</h3>
                  <p className="text-xs text-gray-600">Active now</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href={`/dashboard/teacher/students/${selectedConversation.student.id}`}>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Star className="w-4 h-4 mr-2" />
                      Star Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-4 h-[500px] overflow-y-auto">
              {mockMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.isTeacher ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.isTeacher ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.isTeacher
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                      message.isTeacher ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.isTeacher && getMessageStatusIcon(message.status)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
