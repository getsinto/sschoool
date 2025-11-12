'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Tag } from 'lucide-react'

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600">Manage discount coupons and promotions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coupon Management</h3>
          <p className="text-gray-600">Coupon management interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}