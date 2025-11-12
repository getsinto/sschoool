'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Ticket } from 'lucide-react'

export default function SupportTicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Manage customer support tickets and issues</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Support Tickets</h3>
          <p className="text-gray-600">Support ticket management coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}