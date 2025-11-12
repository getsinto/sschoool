'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Ticket } from 'lucide-react'
import Link from 'next/link'

export default function SupportTicketDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/communication/support-tickets">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Ticket Details</h1>
          <p className="text-gray-600">View and manage support ticket</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ticket Details</h3>
          <p className="text-gray-600">Support ticket details coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}