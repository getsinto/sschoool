'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingDown, Calendar, BookOpen, X } from 'lucide-react'

interface Alert {
  id: string
  type: 'low_grade' | 'missing_assignment' | 'poor_attendance' | 'at_risk'
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  actionLabel: string
}

interface AlertsWidgetProps {
  alerts: Alert[]
  onDismiss: (alertId: string) => void
  onAction: (alertId: string) => void
}

export default function AlertsWidget({ alerts, onDismiss, onAction }: AlertsWidgetProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_grade': return <TrendingDown className="w-5 h-5" />
      case 'missing_assignment': return <BookOpen className="w-5 h-5" />
      case 'poor_attendance': return <Calendar className="w-5 h-5" />
      default: return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-orange-500 bg-orange-50'
      case 'low': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Performance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 border-l-4 rounded-lg ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="text-orange-600 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => onAction(alert.id)}
                      >
                        {alert.actionLabel}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No alerts at this time
          </p>
        )}
      </CardContent>
    </Card>
  )
}
