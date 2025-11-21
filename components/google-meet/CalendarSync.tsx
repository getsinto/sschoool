'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Calendar, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CalendarSyncProps {
  userId: string
  onSyncComplete?: (result: SyncResult) => void
}

interface SyncResult {
  created: number
  updated: number
  deleted: number
  errors: string[]
}

export function CalendarSync({ userId, onSyncComplete }: CalendarSyncProps) {
  const { toast } = useToast()
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)

  const handleSync = async () => {
    try {
      setSyncing(true)
      setSyncResult(null)

      const response = await fetch('/api/google-meet/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      const result = await response.json()
      setSyncResult(result)
      setLastSync(new Date())

      if (onSyncComplete) {
        onSyncComplete(result)
      }

      toast({
        title: 'Sync Complete',
        description: `Created: ${result.created}, Updated: ${result.updated}, Deleted: ${result.deleted}`
      })
    } catch (error) {
      console.error('Sync error:', error)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync with Google Calendar',
        variant: 'destructive'
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Calendar Sync</CardTitle>
          </div>
          {lastSync && (
            <Badge variant="outline">
              Last synced: {lastSync.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <CardDescription>
          Sync your live classes with Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncResult && (
          <div className="space-y-2">
            {syncResult.created > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>{syncResult.created} event(s) created</span>
              </div>
            )}
            {syncResult.updated > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <CheckCircle className="h-4 w-4" />
                <span>{syncResult.updated} event(s) updated</span>
              </div>
            )}
            {syncResult.deleted > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <CheckCircle className="h-4 w-4" />
                <span>{syncResult.deleted} event(s) deleted</span>
              </div>
            )}
            {syncResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {syncResult.errors.length} error(s) occurred during sync
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Button
          onClick={handleSync}
          disabled={syncing}
          className="w-full"
        >
          {syncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>This will sync all upcoming live classes with your Google Calendar:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Create calendar events for new classes</li>
            <li>Update existing events with changes</li>
            <li>Remove cancelled classes</li>
            <li>Send invites to enrolled students</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
