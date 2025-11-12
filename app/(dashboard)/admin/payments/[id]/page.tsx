'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function PaymentDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/payments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <p className="text-gray-600">View payment transaction details</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Details</h3>
          <p className="text-gray-600">Payment details coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}