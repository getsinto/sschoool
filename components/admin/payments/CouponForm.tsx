'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Shuffle, Calendar } from 'lucide-react'

interface CouponFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isEditing?: boolean
}

export default function CouponForm({ initialData, onSubmit, isEditing = false }: CouponFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    discountType: initialData?.discountType || 'percentage',
    discountValue: initialData?.discountValue || '',
    minPurchaseAmount: initialData?.minPurchaseAmount || '',
    usageLimitPerUser: initialData?.usageLimitPerUser || '',
    usageLimitTotal: initialData?.usageLimitTotal || '',
    validFrom: initialData?.validFrom || '',
    validUntil: initialData?.validUntil || '',
    applicableCourses: initialData?.applicableCourses || 'all',
    applicableUserTypes: initialData?.applicableUserTypes || 'all',
    status: initialData?.status || 'active'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateCode = () => {
    const code = 'COUPON' + Math.random().toString(36).substring(2, 10).toUpperCase()
    setFormData(prev => ({ ...prev, code }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Coupon Code */}
          <div>
            <Label htmlFor="code">Coupon Code *</Label>
            <div className="flex space-x-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                placeholder="SUMMER2024"
                required
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={generateCode}>
                <Shuffle className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountType">Discount Type *</Label>
              <Select value={formData.discountType} onValueChange={(value) => updateField('discountType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discountValue">
                Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={(e) => updateField('discountValue', e.target.value)}
                placeholder={formData.discountType === 'percentage' ? '10' : '50'}
                required
                min="0"
                max={formData.discountType === 'percentage' ? '100' : undefined}
              />
            </div>
          </div>

          {/* Minimum Purchase */}
          <div>
            <Label htmlFor="minPurchaseAmount">Minimum Purchase Amount ($)</Label>
            <Input
              id="minPurchaseAmount"
              type="number"
              value={formData.minPurchaseAmount}
              onChange={(e) => updateField('minPurchaseAmount', e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usageLimitPerUser">Usage Limit Per User</Label>
              <Input
                id="usageLimitPerUser"
                type="number"
                value={formData.usageLimitPerUser}
                onChange={(e) => updateField('usageLimitPerUser', e.target.value)}
                placeholder="Unlimited"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="usageLimitTotal">Total Usage Limit</Label>
              <Input
                id="usageLimitTotal"
                type="number"
                value={formData.usageLimitTotal}
                onChange={(e) => updateField('usageLimitTotal', e.target.value)}
                placeholder="Unlimited"
                min="1"
              />
            </div>
          </div>

          {/* Valid Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validFrom">
                <Calendar className="w-4 h-4 inline mr-2" />
                Valid From *
              </Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) => updateField('validFrom', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="validUntil">
                <Calendar className="w-4 h-4 inline mr-2" />
                Valid Until *
              </Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => updateField('validUntil', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Applicable Courses */}
          <div>
            <Label htmlFor="applicableCourses">Applicable Courses</Label>
            <Select value={formData.applicableCourses} onValueChange={(value) => updateField('applicableCourses', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="specific">Specific Courses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Applicable User Types */}
          <div>
            <Label htmlFor="applicableUserTypes">Applicable User Types</Label>
            <Select value={formData.applicableUserTypes} onValueChange={(value) => updateField('applicableUserTypes', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="new">New Users Only</SelectItem>
                <SelectItem value="existing">Existing Users Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Active Status</p>
              <p className="text-xs text-gray-500">Enable or disable this coupon</p>
            </div>
            <Switch
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => updateField('status', checked ? 'active' : 'inactive')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </div>
    </form>
  )
}
