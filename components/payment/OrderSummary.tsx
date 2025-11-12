'use client'

import { Shield, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface OrderSummaryProps {
  courseName: string
  originalPrice: number
  discountedPrice?: number
  couponDiscount?: number
  tax?: number
  currency?: string
}

export default function OrderSummary({
  courseName,
  originalPrice,
  discountedPrice,
  couponDiscount = 0,
  tax = 0,
  currency = 'USD',
}: OrderSummaryProps) {
  const basePrice = discountedPrice || originalPrice
  const finalPrice = basePrice - couponDiscount + tax

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{courseName}</h3>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Original Price</span>
            <span className={discountedPrice ? 'line-through text-gray-400' : 'font-semibold'}>
              {formatPrice(originalPrice)}
            </span>
          </div>

          {discountedPrice && (
            <div className="flex justify-between text-green-600">
              <span>Discounted Price</span>
              <span className="font-semibold">{formatPrice(discountedPrice)}</span>
            </div>
          )}

          {couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Coupon Discount
              </span>
              <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(finalPrice)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <Shield className="w-4 h-4" />
          <span>Secure payment with 256-bit SSL encryption</span>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Lifetime access to course materials</p>
          <p>• 30-day money-back guarantee</p>
          <p>• Certificate of completion</p>
        </div>
      </CardContent>
    </Card>
  )
}
