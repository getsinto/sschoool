'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CouponForm from '@/components/admin/payments/CouponForm'

interface CouponFormData {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchaseAmount: number
  usageLimit: number
  perUserLimit: number
  validFrom: string
  validUntil: string
  applicableCourses: string[]
  applicableUserTypes: string[]
  status: 'active' | 'disabled'
  description: string
}

export default function CreateCouponPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: CouponFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/payments/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create coupon')
      }

      const data = await response.json()
      
      // Redirect to coupons list on success
      router.push('/admin/payments/coupons')
    } catch (err) {
      console.error('Error creating coupon:', err)
      setError(err instanceof Error ? err.message : 'Failed to create coupon')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/payments/coupons">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Coupons
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
          <p className="text-gray-600">Create a new discount coupon for your courses</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Coupon Form */}
      <CouponForm
        onSubmit={handleSubmit}
        isEditing={false}
      />
    </div>
  )
}