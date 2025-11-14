'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare,
  Settings,
  BarChart3,
  Search,
  HelpCircle,
  Zap
} from 'lucide-react'

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  usageCount: number
  lastUsed: string
  status: 'active' | 'inactive'
}

export default function ChatbotPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [chatbotEnabled, setChatbotEnabled] = useState(true)
  const [testQuery, setTestQuery] = useState('')
  const [testResponse, setTestResponse] = useState('')

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      // Mock data
      setFaqs([
        {
          id: '1',
          category: 'Enrollment',
          question: 'How do I enroll in a course?',
          answer: 'To enroll in a course, navigate to the course page and click the "Enroll Now" button. Follow the payment process to complete your enrollment.',
          usageCount: 145,
          lastUsed: '2024-01-15T10:00:00Z',
          status: 'active'
        },
        {
          id: '2',
          category: 'Payment',
          question: 'What payment methods do you accept?',
          answer: 'We accept credit cards, debit cards, PayPal, and bank transfers. All payments are processed securely through our payment gateway.',
          usageCount: 98,
          lastUsed: '2024-01-14T15:30:00Z',
          status: 'active'
        },
        {
          id: '3',
          category: 'Technical',
          question: 'I forgot my password. How do I reset it?',
          answer: 'Click on "Forgot Password" on the login page. Enter your email address and we will send you a password reset link.',
          usageCount: 76,
          lastUsed: '2024-01-13T09:20:00Z',
          status: 'active'
        }
      ])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestQuery = async () => {
    if (!testQuery.trim()) return
    
    // Simulate chatbot response
    setTestResponse('This is a simulated response. In production, this will use Google Gemini API to generate intelligent responses based on your FAQs.')
  }

  const stats = {
    totalFAQs: faqs.length,
    activeFAQs: faqs.filter(f => f.status === 'active').length,
    totalQueries: faqs.reduce((sum, f) => sum + f.usageCount, 0),
    avgUsage: faqs.reduce((sum, f) => sum + f.usageCount, 0) / faqs.length || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chatbot Management</h1>
          <p className="text-gray-600">Manage AI chatbot and FAQ database</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Chatbot Status:</span>
            <Switch checked={chatbotEnabled} onCheckedChange={setChatbotEnabled} />
            <Badge className={chatbotEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {chatbotEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total FAQs</p>
                <p className="text-2xl font-bold">{stats.totalFAQs}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active FAQs</p>
                <p className="text-2xl font-bold">{stats.activeFAQs}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold">{stats.totalQueries}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Usage</p>
                <p className="text-2xl font-bold">{stats.avgUsage.toFixed(0)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faqs">FAQ Management</TabsTrigger>
          <TabsTrigger value="test">Test Chatbot</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Chat Logs</TabsTrigger>
        </TabsList>

        {/* FAQ Management Tab */}
        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>FAQ Database</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{faq.category}</Badge>
                          <Badge className={faq.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {faq.status}
                          </Badge>
                        </div>
                        <h3 className="font-medium mb-2">{faq.question}</h3>
                        <p className="text-sm text-gray-600 mb-3">{faq.answer}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Used {faq.usageCount} times</span>
                          <span>Last used: {new Date(faq.lastUsed).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Chatbot Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Chatbot Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Enter a question:</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your question here..."
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTestQuery()}
                  />
                  <Button onClick={handleTestQuery}>
                    <Bot className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                </div>
              </div>

              {testResponse && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 mb-1">Chatbot Response:</p>
                      <p className="text-sm text-blue-800">{testResponse}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Sample Questions:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="cursor-pointer hover:text-blue-600" onClick={() => setTestQuery('How do I enroll in a course?')}>
                    • How do I enroll in a course?
                  </li>
                  <li className="cursor-pointer hover:text-blue-600" onClick={() => setTestQuery('What payment methods do you accept?')}>
                    • What payment methods do you accept?
                  </li>
                  <li className="cursor-pointer hover:text-blue-600" onClick={() => setTestQuery('How do I reset my password?')}>
                    • How do I reset my password?
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Chatbot</h4>
                    <p className="text-sm text-gray-600">Allow users to interact with the AI chatbot</p>
                  </div>
                  <Switch checked={chatbotEnabled} onCheckedChange={setChatbotEnabled} />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Gemini API Configuration</h4>
                  <Input placeholder="Enter your Google Gemini API key" type="password" />
                  <p className="text-xs text-gray-500 mt-1">Get your API key from Google AI Studio</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Fallback Response</h4>
                  <Input placeholder="Message when chatbot can't answer" />
                  <p className="text-xs text-gray-500 mt-1">Shown when no matching FAQ is found</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Escalation Rules</h4>
                  <p className="text-sm text-gray-600 mb-2">Create support ticket when:</p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">User asks to speak with human</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Question remains unanswered after 3 attempts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">User rates response as unhelpful</span>
                    </label>
                  </div>
                </div>
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Chat Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Chat logs viewer will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
