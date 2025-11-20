// SLA (Service Level Agreement) Management

export interface SLAConfig {
  priority: 'low' | 'medium' | 'high' | 'urgent'
  firstResponseTime: number // in hours
  resolutionTime: number // in hours
}

export const DEFAULT_SLA_CONFIG: Record<string, SLAConfig> = {
  urgent: {
    priority: 'urgent',
    firstResponseTime: 1, // 1 hour
    resolutionTime: 4 // 4 hours
  },
  high: {
    priority: 'high',
    firstResponseTime: 4, // 4 hours
    resolutionTime: 24 // 24 hours
  },
  medium: {
    priority: 'medium',
    firstResponseTime: 8, // 8 hours
    resolutionTime: 48 // 48 hours
  },
  low: {
    priority: 'low',
    firstResponseTime: 24, // 24 hours
    resolutionTime: 120 // 5 days
  }
}

export interface SLAStatus {
  ticketId: string
  priority: string
  createdAt: Date
  firstResponseAt?: Date
  resolvedAt?: Date
  firstResponseSLA: {
    deadline: Date
    remaining: number // in hours
    breached: boolean
    percentage: number // 0-100
  }
  resolutionSLA: {
    deadline: Date
    remaining: number // in hours
    breached: boolean
    percentage: number // 0-100
  }
  overallStatus: 'on-track' | 'at-risk' | 'breached'
}

export function calculateSLAStatus(
  ticketData: {
    id: string
    priority: string
    created_at: string
    first_response_at?: string
    resolved_at?: string
  },
  config: Record<string, SLAConfig> = DEFAULT_SLA_CONFIG
): SLAStatus {
  const slaConfig = config[ticketData.priority] || config.medium
  const createdAt = new Date(ticketData.created_at)
  const now = new Date()

  // Calculate first response SLA
  const firstResponseDeadline = new Date(
    createdAt.getTime() + slaConfig.firstResponseTime * 60 * 60 * 1000
  )
  const firstResponseAt = ticketData.first_response_at
    ? new Date(ticketData.first_response_at)
    : undefined

  const firstResponseElapsed = firstResponseAt
    ? (firstResponseAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    : (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  const firstResponseRemaining = firstResponseAt
    ? 0
    : slaConfig.firstResponseTime - firstResponseElapsed

  const firstResponseBreached = firstResponseAt
    ? firstResponseElapsed > slaConfig.firstResponseTime
    : firstResponseRemaining < 0

  const firstResponsePercentage = Math.min(
    100,
    (firstResponseElapsed / slaConfig.firstResponseTime) * 100
  )

  // Calculate resolution SLA
  const resolutionDeadline = new Date(
    createdAt.getTime() + slaConfig.resolutionTime * 60 * 60 * 1000
  )
  const resolvedAt = ticketData.resolved_at
    ? new Date(ticketData.resolved_at)
    : undefined

  const resolutionElapsed = resolvedAt
    ? (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    : (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  const resolutionRemaining = resolvedAt
    ? 0
    : slaConfig.resolutionTime - resolutionElapsed

  const resolutionBreached = resolvedAt
    ? resolutionElapsed > slaConfig.resolutionTime
    : resolutionRemaining < 0

  const resolutionPercentage = Math.min(
    100,
    (resolutionElapsed / slaConfig.resolutionTime) * 100
  )

  // Determine overall status
  let overallStatus: 'on-track' | 'at-risk' | 'breached' = 'on-track'
  
  if (firstResponseBreached || resolutionBreached) {
    overallStatus = 'breached'
  } else if (
    firstResponsePercentage > 75 ||
    resolutionPercentage > 75
  ) {
    overallStatus = 'at-risk'
  }

  return {
    ticketId: ticketData.id,
    priority: ticketData.priority,
    createdAt,
    firstResponseAt,
    resolvedAt,
    firstResponseSLA: {
      deadline: firstResponseDeadline,
      remaining: firstResponseRemaining,
      breached: firstResponseBreached,
      percentage: firstResponsePercentage
    },
    resolutionSLA: {
      deadline: resolutionDeadline,
      remaining: resolutionRemaining,
      breached: resolutionBreached,
      percentage: resolutionPercentage
    },
    overallStatus
  }
}

export function getSLAColor(status: 'on-track' | 'at-risk' | 'breached'): string {
  switch (status) {
    case 'on-track':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'at-risk':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'breached':
      return 'text-red-600 bg-red-50 border-red-200'
  }
}

export function formatTimeRemaining(hours: number): string {
  if (hours < 0) {
    const absHours = Math.abs(hours)
    if (absHours < 1) {
      return `${Math.round(absHours * 60)}m overdue`
    }
    if (absHours < 24) {
      return `${Math.round(absHours)}h overdue`
    }
    return `${Math.round(absHours / 24)}d overdue`
  }

  if (hours < 1) {
    return `${Math.round(hours * 60)}m remaining`
  }
  if (hours < 24) {
    return `${Math.round(hours)}h remaining`
  }
  return `${Math.round(hours / 24)}d remaining`
}

export async function checkSLABreaches(tickets: any[]): Promise<{
  breached: any[]
  atRisk: any[]
  onTrack: any[]
}> {
  const breached: any[] = []
  const atRisk: any[] = []
  const onTrack: any[] = []

  for (const ticket of tickets) {
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      continue
    }

    const slaStatus = calculateSLAStatus(ticket)

    if (slaStatus.overallStatus === 'breached') {
      breached.push({ ...ticket, slaStatus })
    } else if (slaStatus.overallStatus === 'at-risk') {
      atRisk.push({ ...ticket, slaStatus })
    } else {
      onTrack.push({ ...ticket, slaStatus })
    }
  }

  return { breached, atRisk, onTrack }
}
