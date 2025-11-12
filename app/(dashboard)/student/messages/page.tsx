'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Search,
  Paperclip,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  User,
  Clock,
  CheckCheck,
  Circle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

// Mock messages data
const mockConversations = [
  {
    id: 'conv1',
    participant: {
      id: 'u1',
      name: 'Prof. Anderson',
      avatar: '/avatars/prof-anderson.jpg',
      role: 'Instructor'
    },
    subject: 'Question about Quadratic Formula Assignment',
    lastMessage: 'Great question! The discriminant helps determine...',
    timestamp: '2024-01-22T14:30:00',
    unread: true,
    starred: false,
    messages: [
      {
        id: 'm1',
        senderId: 'student',
        content: 'Hi Professor, I have a question about problem #5 in the assignment. I\'m not sure how to apply the discriminant when b² - 4ac is negative.',
        timestamp: '2024-01-22T13:15:00',
        read: true
      },
      {
        id: 'm2',
        senderId: 'u1',
        content: 'Great question! The discriminant helps determine the nature of the roots. When b² - 4ac is negative, it means the quadratic equation has no real solutions, only complex ones. For this course, you can simply state "no real solutions" for such cases.',
        timestamp: '2024-01-22T14:30:00',
        read: false
      }
    ]
  },
  {
    id: 'conv2',
    participant: {
      id: 'u2',
      name: 'Dr. Sarah Johnson',
      avatar: '/avatars/dr-johnson.jpg',
      role: 'Instructor'
    },
    subject: 'Feedback on Your Essay',
    lastMessage: 'I\'ve reviewed your essay and left detailed comments...',
    timestamp: '2024-01-21T16:45:00',
    unread: false,
    starred: true,
    messages: [
      {
        id: 'm3',
        senderId: 'u2',
        content: 'I\'ve reviewed your essay on World War II and left detailed comments. Overall, excellent work! Your analysis of the economic factors was particularly strong. I\'d like to discuss your conclusion in more detail during office hours.',
        timestamp: '2024-01-21T16:45:00',
        read: true
      },
      {
        id: 'm4',
        senderId: 'student',
        content: 'Thank you so much for the feedback! I really appreciate the detailed comments. When are your office hours this week?',
        timestamp: '2024-01-21T17:20:00',
        read: true
      },
      {
        id: 'm5',
        senderId: 'u2',
        content: 'My office hours are Wednesday 2-4 PM and Friday 10 AM-12 PM. Feel free to drop by anytime!',
        timestamp: '2024-01-21T18:00:00',
        read: true
      }
    ]
  },
  {
    id: 'conv3',
    participant: {
      id: 'u3',
      name: 'Prof. Michael Chen',
      avatar: '/avatars/prof-chen.jpg',
      role: 'Instructor'
    },
    subject: 'Lab Report Extension Request',
    lastMessage: 'Yes, you can have until Friday. Make sure to...',
    timestamp: '2024-01-20T10:15:00',
    unread: false,
    starred: false,
    messages: [
      {
        id: 'm6',
        senderId: 'student',
        content: 'Hi Professor Chen, I wanted to request a 2-day extension on the lab report due to a family emergency. I have all my data collected and just need more time to write it up properly.',
        timestamp: '2024-01-20T09:30:00',
        read: true
      },
      {
        id: 'm7',
        senderId: 'u3',
        content: 'I\'m sorry to hear about your situation. Yes, you can have until Friday. Make sure to include all the required sections and double-check your calculations. Let me know if you need any clarification on the requirements.',
        timestamp: '2024-01-20T10:15:00',
        read: true
      },
      {
        id: 'm8',
        senderId: 'student',
        content: 'Thank you so much for understanding! I\'ll make sure to submit a thorough report by Friday.',
        timestamp: '2024-01-20T10:30:00',
        read: true
      }
    ]
  },
  {
    id: 'conv4',
    participant: {
      id: 'u4',
      name: 'Dr. Emily Rodriguez',
      avatar: '/avatars/dr-rodriguez.jpg',
      role: 'Instructor'
    },
    subject: 'Study Group Formation',
    lastMessage: 'That sounds like a great idea! I can help...',
    timestamp: '2024-01-19T14:20:00',
    unread: false,
    starred: false,
    messages: [
      {
        id: 'm9',
        senderId: 'student',
        content: 'Hi Dr. Rodriguez, a few classmates and I are interested in forming a study group for the upcoming midterm. Would you be able to recommend any resources or study strategies?',
        timestamp: '2024-01-19T13:45:00',
        read: true
      },
      {
        id: 'm10',
        senderId: 'u4',
        content: 'That sounds like a great idea! I can help coordinate. I\'ll create a discussion board on the course page where you can connect with other students. Also, I\'ll post some practice problems and review materials this week.',
        timestamp: '2024-01-19T14:20:00',
        read: true
      }
    ]
  }
]

export default function MessagesPage() {
  const [conversations] = useState(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<typeof mockConversations[0] | null>(
    mockConversations[0]
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const filteredConversations = conversations.filter(conv =>
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return
    
    // Send message logic
    alert('Message sent!')
    setNewMessage('')
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Card className="h-full">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List */}
            <div className="col-span-4 border-r flex flex-col h-full">
              {/* Search Header */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <ScrollArea className="flex-1">
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 cursor-pointer transition ${
                        selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={conv.participant.avatar} />
                          <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold text-sm truncate ${conv.unread ? 'text-blue-600' : ''}`}>
                              {conv.participant.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              {conv.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                              <span className="text-xs text-gray-500">{formatTimestamp(conv.timestamp)}</span>
                            </div>
                          </div>
                          <p className={`text-sm mb-1 truncate ${conv.unread ? 'font-semibold' : 'text-gray-600'}`}>
                            {conv.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unread && (
                          <Circle className="w-2 h-2 text-blue-600 fill-blue-600 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Message Thread */}
            {selectedConversation ? (
              <div className="col-span-8 flex flex-col h-full">
                {/* Thread Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedConversation.participant.avatar} />
                        <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.participant.name}</h3>
                        <p className="text-sm text-gray-600">{selectedConversation.participant.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Star className={`w-4 h-4 ${selectedConversation.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium text-sm">{selectedConversation.subject}</h4>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message, index) => {
                      const isStudent = message.senderId === 'student'
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-3 max-w-[70%] ${isStudent ? 'flex-row-reverse' : ''}`}>
                            {!isStudent && (
                              <Avatar className="flex-shrink-0">
                                <AvatarImage src={selectedConversation.participant.avatar} />
                                <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}>
                              <div
                                className={`rounded-lg p-3 ${
                                  isStudent
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1 px-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {isStudent && message.read && (
                                  <CheckCheck className="w-3 h-3 text-blue-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send • Shift + Enter for new line
                  </p>
                </div>
              </div>
            ) : (
              <div className="col-span-8 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
