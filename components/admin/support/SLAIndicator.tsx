'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { calculateSLAStatus, getSLAColor, formatTimeRemaining } from '@/lib/support/sla'

interface SLAIndicatorProps {
  ticket: {
    id: string
    priority: string
    created_at: string
    first_response_at?: string
    resolved_at?: string
    status: string
  }
  showDetails?: boolean
}

export function SLAIndicator({ ticket, showDetails = false }: SLAIndicatorProps) {
  if (ticket.status === 'closed' || ticket.status === 'resolved') {
    return null
  }

  const slaStatus = calculateSLAStatus(ticket)

  const getIcon = () => {
    switch (slaStatus.overallStatus) {
      case 'on-track':
        return <CheckCircle className="h-3 w-3" />
      case 'at-risk':
        return <AlertTriangle className="h-3 w-3" />
      case 'breached':
        return <Clock className="h-3 w-3" />
    }
  }

  const getLabel = () => {
    switch (slaStatus.overallStatus) {
      case 'on-track':
        return 'On Track'
      case 'at-risk':
        return 'At Risk'
      case 'breached':
        return 'SLA Breached'
    }
  }

  if (!showDetails) {
    return (
      <Badge className={`${getSLAColor(slaStatus.overallStatus)} flex items-center gap-1`}>
        {getIcon()}
        {getLabel()}
      </Badge>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">SLA Status</span>
        <Badge className={`${getSLAColor(slaStatus.overallStatus)} flex items-center gap-1`}>
          {getIcon()}
          {getLabel()}
        </Badge>
      </div>

      {/* First Response SLA */}
      {!slaStatus.firstResponseAt && (
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">First Response</span>
            <span className={`text-xs font-medium ${
              slaStatus.firstResponseSLA.breached ? 'text-red-600' : 
              slaStatus.firstResponseSLA.percentage > 75 ? 'text-orange-600' : 
              'text-green-600'
            }`}>
              {formatTimeRemaining(slaStatus.firstResponseSLA.remaining)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                slaStatus.firstResponseSLA.breached ? 'bg-red-500' :
                slaStatus.firstResponseSLA.percentage > 75 ? 'bg-orange-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, slaStatus.firstResponseSLA.percentage)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Due: {slaStatus.firstResponseSLA.deadline.toLocaleString()}
          </p>
        </div>
      )}

      {/* Resolution SLA */}
      <div className="border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Resolution</span>
          <span className={`text-xs font-medium ${
            slaStatus.resolutionSLA.breached ? 'text-red-600' : 
            slaStatus.resolutionSLA.percentage > 75 ? 'text-orange-600' : 
            'text-green-600'
          }`}>
            {formatTimeRemaining(slaStatus.resolutionSLA.remaining)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              slaStatus.resolutionSLA.breached ? 'bg-red-500' :
              slaStatus.resolutionSLA.percentage > 75 ? 'bg-orange-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, slaStatus.resolutionSLA.percentage)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Due: {slaStatus.resolutionSLA.deadline.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
