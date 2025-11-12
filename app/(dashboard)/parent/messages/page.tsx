'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  Filter,
  MoreVertical,
  User,
  Calendar
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

// Mock data
const mockConversations = [
  {
    id: '1',
    teacher: {
      name: 'Dr. Smith',
      avatar: '/avatars/teacher1.jpg',
      subject: 'Mathematics'
    },
    child: 'Emma Johnson',
    lastMessage: 'Thank you for your concern. Emma is doing great in class.',
    timestamp: '2 hours ago',
    unread: 2,
    messages: [
      {
        id: '1',
        sender: 'parent',
        content: 'Hello Dr. Smith, I wanted to discuss Emma\'s recent quiz performance.',
        timestamp: '2024-01-20 10:00 AM'
      },
      {
        id: '2',
        sender: 'teacher',
        content: 'Hello! Emma did very well on the quiz. She scored 95%. Is there something specific you\'d like to discuss?',
        timestamp: '2024-01-20 10:15 AM'
      },
      {
        id: '3',
        sender: 'parent',
        content: 'That\'s great to hear! I was wondering if there are any areas where she could improve further.',
        timestamp: '2024-01-20 10:20 AM'
      },
      {
        id: '4',
        sender: 'teacher',
        content: 'Thank you for your concern. Emma is doing great in class. She could work on her geometry skills, but overall she\'s excelling.',
        timestamp: '2024-01-20 10:25 AM'
      }
    ]
  },
  {
    id: '2',
    teacher: {
      name: 'Prof. Anderson',
      avatar: '/avatars/teacher2.jpg',
      subject: 'Physics'
    },
    child: 'Emma Johnson',
    lastMessage: 'I\'ll send you the lab report guidelines.',
    timestamp: '1 day ago',
    unread: 0,
    messages: [
      {
        id: '1',
        sender: 'parent',
        content: 'Hi Professor, Emma mentioned she needs help with the lab report format.',
        timestamp: '2024-01-19 02:00 PM'
      },
      {
        id: '2',
        sender: 'teacher',
        content: 'I\'ll send you the lab report guidelines. She can also attend office hours on Wednesdays.',
        timestamp: '2024-01-19 02:30 PM'
      }
    ]
  },
  {
    id: '3',
    teacher: {
      name: 'Mr. Johnson',
      avatar: '/avatars/teacher3.jpg',
      subject: 'Web Development'
    },
    child: 'Lucas Johnson',
    lastMessage: 'Lucas is making excellent progress!',
    timestamp: '2 days ago',
    unread: 0,
    messages: [
      {
        id: '1',
        sender: 'parent',
        content: 'How is Lucas doing in the web development course?',
        timestamp: '2024-01-18 11:00 AM'
      },
      {
        id: '2',
        sender: 'teacher',
        content: 'Lucas is making excellent progress! He\'s very engaged and his projects show great creativity.',
        timestamp: '2024-01-18 11:30 AM'
      }
    ]
  }
]

export default function MessagesPage() {
  const [conversations] = useState(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Safety check
  if (!selectedConversation) {
    return <div>Loading...</div>
  }

  const filteredConversations = conversations.filter(conv =>
    conv.teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.child.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // API call to send message
      console.log('Sending message:', messageText)
      setMessageText('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with your children's teachers</p>
      </div>

      {/* Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="divide-y">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation.id === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={conv.teacher.avatar} />
                        <AvatarFallback>{conv.teacher.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="font-semibold text-sm">{conv.teacher.name}</p>
                            <p className="text-xs text-gray-600">{conv.teacher.subject}</p>
                          </div>
                          {conv.unread > 0 && (
                            <Badge className="bg-blue-600">{conv.unread}</Badge>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mb-1">Re: {conv.child}</p>
                        <p className="text-sm text-gray-700 truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">{conv.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Thread Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.teacher.avatar} />
                  <AvatarFallback>{selectedConversation.teacher.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedConversation.teacher.name}</p>
                  <p className="text-sm text-gray-600">{selectedConversation.teacher.subject} • {selectedConversation.child}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === 'parent'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'parent' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1">
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
                    className="resize-none"
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
