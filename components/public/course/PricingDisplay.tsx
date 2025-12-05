'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Clock, 
  TrendingDown, 
  Calendar,
  CreditCard,
  Zap,
  Gift,
  Users,
  Sparkles
} from 'lucide-react'
import type { CoursePricingConfig, Currency } from '@/types/pricing'
import { 
  formatPrice, 
  calculateSavings, 
  isEarlyBirdActive,
  getCurrencySymbol 
} from '@/types/pricing'

interface PricingDisplayProps {
  pricing: CoursePricingConfig
  currency?: Currency
  className?: string
}

export default function PricingDisplay({ 
  pricing, 
  currency = 'USD',
  className = '' 
}: PricingDisplayProps) {
  const currencySymbol = getCurrencySymbol(currency)
  
  // Determine current price based on model and early bird
  const getCurrentPrice = () => {
    if (pricing.pricing_model === 'free') {
      return 0
    }
    
    if (pricing.early_bird_enabled && pricing.early_bird_deadline && isEarlyBirdActive(pricing.early_bird_deadline)) {
      return pricing.early_bird_price || pricing.price
    }
    
    return pricing.price
  }
  
  const currentPrice = getCurrentPrice()
  const hasDiscount = pricing.early_bird_enabled && 
                      pricing.early_bird_deadline && 
                      isEarlyBirdActive(pricing.early_bird_deadline) &&
                      pricing.regular_price &&
                      pricing.regular_price > currentPrice
  
  const savings = hasDiscount && pricing.regular_price 
    ? calculateSavings(pricing.regular_price, currentPrice)
    : null

  // Calculate days remaining for early bird
  const getDaysRemaining = () => {
    if (!pricing.early_bird_deadline) return null
    const deadline = new Date(pricing.early_bird_deadline)
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : null
  }
  
  const daysRemaining = getDaysRemaining()

  // Render based on pricing model
  const renderPricingContent = () => {
    switch (pricing.pricing_model) {
      case 'free':
        return (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-2">
              <Gift className="w-5 h-5" />
              <span className="font-semibold text-lg">FREE</span>
            </div>
            <p className="text-sm text-gray-600">No payment required</p>
          </div>
        )
      
      case 'subscription':
        return (
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(pricing.subscription_price || 0, currency)}
              </span>
              <span className="text-gray-600">
                /{pricing.subscription_type || 'month'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Zap className="w-4 h-4" />
              <span>
                {pricing.auto_renewal ? 'Auto-renews' : 'Manual renewal'} {pricing.subscription_type}
              </span>
            </div>
            {pricing.free_trial_enabled && (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                <Sparkles className="w-3 h-3 mr-1" />
                {pricing.free_trial_days} days free trial
              </Badge>
            )}
          </div>
        )
      
      case 'tiered':
        return (
          <div>
            <div className="text-sm text-gray-600 mb-2">Starting from</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatPrice(pricing.price, currency)}
            </div>
            <Badge variant="secondary">
              Multiple tiers available
            </Badge>
          </div>
        )
      
      case 'pay_what_you_want':
        return (
          <div>
            <div className="text-sm text-gray-600 mb-2">Pay what you want</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(pricing.min_price || 0, currency)}
              </span>
              <span className="text-gray-600">minimum</span>
            </div>
            {pricing.suggested_price && (
              <div className="text-sm text-gray-600">
                Suggested: {formatPrice(pricing.suggested_price, currency)}
              </div>
            )}
          </div>
        )
      
      case 'bulk':
        return (
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(currentPrice, currency)}
              </span>
              {hasDiscount && pricing.regular_price && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(pricing.regular_price, currency)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Batch-based pricing</span>
            </div>
          </div>
        )
      
      case 'free_trial':
        return (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">
                {pricing.free_trial_days} Days Free Trial
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(currentPrice, currency)}
              </span>
              <span className="text-gray-600">after trial</span>
            </div>
            {pricing.trial_requires_card && (
              <p className="text-xs text-gray-500">Credit card required</p>
            )}
          </div>
        )
      
      case 'early_bird':
      case 'one_time':
      default:
        return (
          <div>
            {hasDiscount && daysRemaining && (
              <div className="mb-3">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Early Bird - {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                </Badge>
              </div>
            )}
            
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(currentPrice, currency)}
              </span>
              {hasDiscount && pricing.regular_price && (
                <span className="text-2xl text-gray-500 line-through">
                  {formatPrice(pricing.regular_price, currency)}
                </span>
              )}
            </div>
            
            {savings && savings.amount > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Save {formatPrice(savings.amount, currency)} ({savings.percentage}% off)
                </Badge>
              </div>
            )}
            
            {pricing.payment_plan_enabled && pricing.payment_plan_installments && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Payment Plan Available
                    </p>
                    <p className="text-xs text-blue-700">
                      {pricing.payment_plan_installments} {pricing.payment_plan_frequency} payments of{' '}
                      {formatPrice(
                        currentPrice / pricing.payment_plan_installments,
                        currency
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {pricing.free_trial_enabled && pricing.free_trial_days && (
              <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span>Includes {pricing.free_trial_days}-day free trial</span>
              </div>
            )}
          </div>
        )
    }
  }

  // Render access duration info
  const renderAccessInfo = () => {
    if (!pricing.access_duration_type) return null
    
    const accessInfo = {
      lifetime: { icon: '∞', text: 'Lifetime access' },
      time_limited: { 
        icon: <Calendar className="w-4 h-4" />, 
        text: `${pricing.access_duration_days} days access` 
      },
      batch_duration: { 
        icon: <Calendar className="w-4 h-4" />, 
        text: 'Access during batch period' 
      },
      subscription_based: { 
        icon: <Zap className="w-4 h-4" />, 
        text: 'Access while subscribed' 
      }
    }
    
    const info = accessInfo[pricing.access_duration_type]
    if (!info) return null
    
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {typeof info.icon === 'string' ? (
            <span className="text-lg font-bold">{info.icon}</span>
          ) : (
            info.icon
          )}
          <span>{info.text}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {renderPricingContent()}
      {renderAccessInfo()}
    </div>
  )
}
