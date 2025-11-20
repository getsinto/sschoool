'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Star,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChatbotAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/chatbot/analytics?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Analytics</h1>
          <p className="text-gray-600 mt-1">Performance metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold">{analytics.overview.total_conversations}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.overview.recent_conversations} in period
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{analytics.overview.total_messages}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.overview.user_messages} from users
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold">{analytics.metrics.resolution_rate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.overview.resolved_queries} resolved
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{analytics.metrics.avg_rating}/5</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.metrics.total_feedback} ratings
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Intents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Intents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.top_intents.slice(0, 8).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {item.intent.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.top_intents[0].count) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Failed Queries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Failed Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.failed_queries.slice(0, 8).map((query: any, index: number) => (
                <div key={index} className="border-l-2 border-red-300 pl-3">
                  <p className="text-sm text-gray-700">{query.query}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(query.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              {analytics.failed_queries.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No failed queries in this period
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular FAQs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.popular_faqs.map((faq: any, index: number) => (
              <div key={faq.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{faq.question}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Used {faq.usage_count} times
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Escalation Rate</p>
              <p className="text-3xl font-bold text-orange-600">
                {analytics.metrics.escalation_rate}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {analytics.overview.escalated_queries} escalated to support
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Avg Confidence</p>
              <p className="text-3xl font-bold text-purple-600">
                {analytics.metrics.avg_confidence}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                AI confidence score
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Queries</p>
              <p className="text-3xl font-bold text-blue-600">
                {analytics.overview.total_queries}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                In the last {period} days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
