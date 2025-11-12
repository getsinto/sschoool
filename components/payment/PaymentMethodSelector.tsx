'use client'

import { CreditCard, Wallet } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface PaymentMethodSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Pay securely with Stripe',
      icon: CreditCard,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: Wallet,
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'UPI, Cards, Net Banking & More',
      icon: Wallet,
    },
  ]

  return (
    <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
      {paymentMethods.map((method) => {
        const Icon = method.icon
        return (
          <div
            key={method.id}
            className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              value === method.id ? 'border-blue-600 bg-blue-50' : 'hover:border-gray-400'
            }`}
          >
            <RadioGroupItem value={method.id} id={method.id} />
            <Icon className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <Label htmlFor={method.id} className="cursor-pointer font-semibold">
                {method.name}
              </Label>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          </div>
        )
      })}
    </RadioGroup>
  )
}
