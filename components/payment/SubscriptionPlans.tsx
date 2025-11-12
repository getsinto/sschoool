'use client'

import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  popular?: boolean
  priceId?: string
}

interface SubscriptionPlansProps {
  plans: Plan[]
  onSelectPlan: (plan: Plan) => void
  selectedPlanId?: string
}

export default function SubscriptionPlans({
  plans,
  onSelectPlan,
  selectedPlanId,
}: SubscriptionPlansProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            plan.popular ? 'border-blue-600 shadow-lg' : ''
          } ${selectedPlanId === plan.id ? 'ring-2 ring-blue-600' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-blue-600">Most Popular</Badge>
            </div>
          )}

          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-gray-600">/{plan.interval}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => onSelectPlan(plan)}
              className="w-full"
              variant={selectedPlanId === plan.id ? 'default' : 'outline'}
            >
              {selectedPlanId === plan.id ? 'Selected' : 'Select Plan'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
