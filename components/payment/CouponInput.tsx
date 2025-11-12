'use client'

import { useState } from 'react'
import { Check, X, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CouponInputProps {
  onApply: (code: string) => Promise<boolean>
  onRemove: () => void
  appliedCoupon?: { code: string; discount: number }
}

export default function CouponInput({ onApply, onRemove, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState('')

  const handleApply = async () => {
    if (!code.trim()) return

    setIsApplying(true)
    setError('')

    try {
      const success = await onApply(code.trim())
      if (success) {
        setCode('')
      } else {
        setError('Invalid coupon code')
      }
    } catch (err) {
      setError('Failed to apply coupon')
    } finally {
      setIsApplying(false)
    }
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
            <p className="text-sm text-green-600">{appliedCoupon.discount}% discount applied</p>
          </div>
        </div>
        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="text-green-800 hover:text-green-900"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={!code.trim() || isApplying}
          variant="outline"
        >
          {isApplying ? 'Applying...' : 'Apply'}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
