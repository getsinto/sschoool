'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Video, Clock, ExternalLink } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface UpcomingClass {
  id: string
  childId: string
  childName: string
  title: string
  teacher: string
  startTime: Date
  duration: number
  type: 'live' | 'recorded'
  meetingUrl?: string
  status: 'upcoming' | 'in-progress' | 'completed'
  thumbnail?: string
}

interface UpcomingClassesWidgetProps {
  classes: UpcomingClass[]
  limit?: number
  onJoinClass?: (classId: string) => void
  onViewAll?: () => void
}

export default function UpcomingClassesWidget({
  classes,
  limit = 5,
  onJoinClass,
  onViewAll
}: UpcomingClassesWidgetProps) {
  const displayedClasses = classes.slice(0, limit)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const isJoinable = (classItem: UpcomingClass) => {
    const now = new Date()
    const startTime = new Date(classItem.startTime)
    const timeDiff = startTime.getTime() - now.getTime()
    const minutesDiff = timeDiff / (1000 * 60)
    
    // Can join 10 minutes before start time
    return minutesDiff <= 10 && minutesDiff >= -classItem.duration
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Classes
          </CardTitle>
          {onViewAll && classes.length > limit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-sm"
            >
              View All ({classes.length})
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {displayedClasses.length === 0 ? (
          <div className="text-center py-8">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No upcoming classes</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later for scheduled classes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">{classItem.title}</h4>
                      <Badge className={getStatusColor(classItem.status)}>
                        {classItem.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {classItem.childName} • {classItem.teacher}
                    </p>
                  </div>
                  {classItem.type === 'live' && (
                    <Video className="h-4 w-4 text-blue-600" />
                  )}
                </div>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{format(classItem.startTime, 'MMM dd, h:mm a')}</span>
                  </div>
                  <span>{classItem.duration} min</span>
                  <span className="text-blue-600">
                    {formatDistanceToNow(classItem.startTime, { addSuffix: true })}
                  </span>
                </div>

                {classItem.meetingUrl && isJoinable(classItem) && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (onJoinClass) {
                        onJoinClass(classItem.id)
                      } else if (classItem.meetingUrl) {
                        window.open(classItem.meetingUrl, '_blank')
                      }
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Join Class
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
