'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Manage payments and transactions</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payments Management</h3>
          <p className="text-gray-600">Payment management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}