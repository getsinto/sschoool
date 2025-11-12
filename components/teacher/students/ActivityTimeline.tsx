'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  FileText, 
  Activity, 
  Video, 
  MessageSquare 
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'lesson' | 'quiz' | 'assignment' | 'login' | 'live_class' | 'message'
  action: string
  title: string
  course?: string | null
  timestamp: string
  details?: any
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
  title?: string
}

export default function ActivityTimeline({ 
  activities, 
  title = 'Recent Activity' 
}: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4" />
      case 'quiz': return <FileText className="w-4 h-4" />
      case 'assignment': return <FileText className="w-4 h-4" />
      case 'live_class': return <Video className="w-4 h-4" />
      case 'message': return <MessageSquare className="w-4 h-4" />
      case 'login': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-50 text-blue-600'
      case 'quiz': return 'bg-purple-50 text-purple-600'
      case 'assignment': return 'bg-green-50 text-green-600'
      case 'live_class': return 'bg-red-50 text-red-600'
      case 'message': return 'bg-yellow-50 text-yellow-600'
      case 'login': return 'bg-gray-50 text-gray-600'
      default: return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-4 pb-4 border-b last:border-b-0"
            >
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                {activity.course && (
                  <p className="text-xs text-gray-600 mt-1">{activity.course}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
