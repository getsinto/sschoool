'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { DollarSign, Users, Calendar } from 'lucide-react'

interface PricingFormProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function PricingForm({ data, onUpdate, onNext, onPrevious }: PricingFormProps) {
  const [pricingType, setPricingType] = useState(data.pricingType || 'paid')
  const [price, setPrice] = useState(data.price || '')
  const [enableEnrollmentLimit, setEnableEnrollmentLimit] = useState(data.enableEnrollmentLimit || false)
  const [enrollmentLimit, setEnrollmentLimit] = useState(data.enrollmentLimit || '')
  const [enableDeadline, setEnableDeadline] = useState(data.enableDeadline || false)
  const [enrollmentDeadline, setEnrollmentDeadline] = useState(data.enrollmentDeadline || '')

  const handleNext = () => {
    onUpdate({
      pricingType,
      price: pricingType === 'paid' ? price : 0,
      enableEnrollmentLimit,
      enrollmentLimit: enableEnrollmentLimit ? enrollmentLimit : null,
      enableDeadline,
      enrollmentDeadline: enableDeadline ? enrollmentDeadline : null
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Enrollment</h2>
        <p className="text-gray-600">Set your course pricing and enrollment options</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Model</CardTitle>
          <CardDescription>Choose how students will access your course</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={pricingType} onValueChange={setPricingType}>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="free" id="free" />
              <Label htmlFor="free" className="flex-1 cursor-pointer">
                <div className="font-semibold">Free</div>
                <div className="text-sm text-gray-500">Anyone can enroll for free</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="paid" id="paid" />
              <Label htmlFor="paid" className="flex-1 cursor-pointer">
                <div className="font-semibold">Paid</div>
                <div className="text-sm text-gray-500">Students pay to enroll</div>
              </Label>
            </div>
          </RadioGroup>

          {pricingType === 'paid' && (
            <div className="mt-4">
              <Label htmlFor="price">Course Price</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="price"
                  type="number"
                  placeholder="49.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-10"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Set a competitive price for your course content
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Settings</CardTitle>
          <CardDescription>Configure enrollment limits and deadlines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enrollment Limit */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-600" />
                <Label htmlFor="enrollment-limit">Enrollment Limit</Label>
              </div>
              <p className="text-sm text-gray-500">
                Limit the number of students who can enroll
              </p>
            </div>
            <Switch
              id="enrollment-limit"
              checked={enableEnrollmentLimit}
              onCheckedChange={setEnableEnrollmentLimit}
            />
          </div>

          {enableEnrollmentLimit && (
            <div>
              <Label htmlFor="limit-number">Maximum Students</Label>
              <Input
                id="limit-number"
                type="number"
                placeholder="100"
                value={enrollmentLimit}
                onChange={(e) => setEnrollmentLimit(e.target.value)}
                className="mt-2"
                min="1"
              />
            </div>
          )}

          {/* Enrollment Deadline */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-600" />
                <Label htmlFor="enrollment-deadline">Enrollment Deadline</Label>
              </div>
              <p className="text-sm text-gray-500">
                Set a deadline for course enrollment
              </p>
            </div>
            <Switch
              id="enrollment-deadline"
              checked={enableDeadline}
              onCheckedChange={setEnableDeadline}
            />
          </div>

          {enableDeadline && (
            <div>
              <Label htmlFor="deadline-date">Deadline Date</Label>
              <Input
                id="deadline-date"
                type="date"
                value={enrollmentDeadline}
                onChange={(e) => setEnrollmentDeadline(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600 text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Pricing Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Research similar courses to set competitive pricing</li>
                <li>• Consider offering early-bird discounts</li>
                <li>• Free courses can help build your reputation</li>
                <li>• You can always adjust pricing later</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
