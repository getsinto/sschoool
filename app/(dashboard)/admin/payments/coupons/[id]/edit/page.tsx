'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
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

export default function EditCouponPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [couponData, setCouponData] = useState<CouponFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCouponData()
  }, [params.id])

  const fetchCouponData = async () => {
    try {
      const response = await fetch(`/api/admin/payments/coupons/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch coupon')
      
      const data = await response.json()
      setCouponData(data.coupon)
    } catch (err) {
      console.error('Error fetching coupon:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch coupon')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (formData: CouponFormData) => {
    setError(null)

    try {
      const response = await fetch(`/api/admin/payments/coupons/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update coupon')
      }

      // Redirect to coupons list on success
      router.push('/admin/payments/coupons')
    } catch (err) {
      console.error('Error updating coupon:', err)
      setError(err instanceof Error ? err.message : 'Failed to update coupon')
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading coupon...</p>
        </div>
      </div>
    )
  }

  if (error && !couponData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/payments/coupons">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Coupons
            </Button>
          </Link>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Coupon</h1>
          <p className="text-gray-600">Update coupon details and settings</p>
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
      {couponData && (
        <CouponForm
          initialData={couponData}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      )}
    </div>
  )
}
