'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, Check } from 'lucide-react'
import Link from 'next/link'

export default function EnrollChildPage() {
  const [step, setStep] = useState(1)
  const [selectedChild, setSelectedChild] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [couponCode, setCouponCode] = useState('')

  const mockChildren = [
    { id: '1', name: 'Alice Johnson', grade: 'Grade 10' },
    { id: '2', name: 'Bob Johnson', grade: 'Grade 8' }
  ]

  const mockCourses = [
    { id: '1', title: 'Advanced Mathematics', price: 299, grade: 'Grade 10' },
    { id: '2', title: 'Physics Fundamentals', price: 249, grade: 'Grade 10' },
    { id: '3', title: 'English Literature', price: 199, grade: 'Grade 8' }
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/parent/payments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Enroll Child in Course</h1>
          <p className="text-muted-foreground">Complete the enrollment process</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= s ? 'bg-primary text-white' : 'bg-gray-200'
            }`}>
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 3 && <div className={`w-20 h-1 ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Child & Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Child</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a child" />
                </SelectTrigger>
                <SelectContent>
                  {mockChildren.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name} - {child.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Course</Label>
              <div className="grid gap-4 mt-2">
                {mockCourses.map(course => (
                  <div
                    key={course.id}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedCourse === course.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedCourse(course.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <Badge variant="outline">{course.grade}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${course.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!selectedChild || !selectedCourse}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Coupon Code (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                />
                <Button variant="outline">Apply</Button>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Course Price</span>
                <span className="font-semibold">$299.00</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>$299.00</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>Continue to Payment</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Payment Method</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card1">Visa ending in 4242</SelectItem>
                  <SelectItem value="new">Add new card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1">
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Enrollment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
