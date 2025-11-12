'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CreditCard, Shield, Check, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Fetch course data
    fetchCourseData()
  }, [params.courseId])

  const fetchCourseData = async () => {
    // Mock data for now
    setCourse({
      id: params.courseId,
      title: 'Advanced React Development',
      price: 199,
      originalPrice: 299,
      currency: 'USD'
    })
  }

  const applyCoupon = async () => {
    if (!couponCode) return
    
    try {
      const response = await fetch('/api/payments/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, courseId: params.courseId })
      })
      
      const data = await response.json()
      if (data.valid) {
        setAppliedCoupon(data.coupon)
      }
    } catch (error) {
      console.error('Coupon validation failed:', error)
    }
  }

  const calculateTotal = () => {
    if (!course) return 0
    let total = course.price
    if (appliedCoupon) {
      total -= (total * appliedCoupon.discount) / 100
    }
    return total
  }

  const handleCheckout = async () => {
    if (!acceptTerms) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: params.courseId,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          amount: calculateTotal()
        })
      })
      
      const data = await response.json()
      if (data.success) {
        router.push(`/checkout/payment?orderId=${data.orderId}`)
      }
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!course) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method */}
                <div>
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe">Credit/Debit Card (Stripe)</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded">
                      <RadioGroupItem value="razorpay" id="razorpay" />
                      <Label htmlFor="razorpay">Razorpay</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Coupon Code */}
                <div>
                  <Label>Coupon Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                    />
                    <Button onClick={applyCoupon} variant="outline">
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 mt-2">
                      <Check className="inline w-4 h-4" /> Coupon applied: {appliedCoupon.discount}% off
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms">
                    I agree to the terms and conditions
                  </Label>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={!acceptTerms || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span>${course.price}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${((course.price * appliedCoupon.discount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
