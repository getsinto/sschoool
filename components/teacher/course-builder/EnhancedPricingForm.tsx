'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, Users, Calendar, Clock, Zap, TrendingUp, 
  Gift, CreditCard, Layers, AlertCircle, Info, Plus, X
} from 'lucide-react'
import { 
  PricingModel, 
  PricingFormData, 
  PricingTier,
  PRICING_MODELS,
  SUBSCRIPTION_TYPES,
  PAYMENT_FREQUENCIES,
  ACCESS_DURATION_TYPES,
  CURRENCIES,
  getCurrencySymbol
} from '@/types/pricing'

interface EnhancedPricingFormProps {
  data: Partial<PricingFormData>
  onUpdate: (data: Partial<PricingFormData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function EnhancedPricingForm({ data, onUpdate, onNext, onPrevious }: EnhancedPricingFormProps) {
  // State management
  const [pricingModel, setPricingModel] = useState<PricingModel>(data.pricing_model || 'one_time')
  const [price, setPrice] = useState(data.price?.toString() || '')
  const [currency, setCurrency] = useState(data.currency || 'USD')
  
  // Subscription
  const [subscriptionType, setSubscriptionType] = useState(data.subscription_type || 'monthly')
  const [subscriptionPrice, setSubscriptionPrice] = useState(data.subscription_price?.toString() || '')
  const [autoRenewal, setAutoRenewal] = useState(data.auto_renewal ?? true)
  
  // Payment plans
  const [paymentPlanEnabled, setPaymentPlanEnabled] = useState(data.payment_plan_enabled || false)
  const [installments, setInstallments] = useState(data.payment_plan_installments?.toString() || '3')
  const [frequency, setFrequency] = useState(data.payment_plan_frequency || 'monthly')
  const [downPayment, setDownPayment] = useState(data.payment_plan_down_payment?.toString() || '')
  
  // Early bird
  const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(data.early_bird_enabled || false)
  const [earlyBirdPrice, setEarlyBirdPrice] = useState(data.early_bird_price?.toString() || '')
  const [earlyBirdDeadline, setEarlyBirdDeadline] = useState(data.early_bird_deadline || '')
  const [regularPrice, setRegularPrice] = useState(data.regular_price?.toString() || '')
  
  // Enrollment limits
  const [minStudents, setMinStudents] = useState(data.min_students?.toString() || '')
  const [maxStudents, setMaxStudents] = useState(data.max_students?.toString() || '')
  const [enableWaitlist, setEnableWaitlist] = useState(data.enable_waitlist || false)
  
  // Access duration
  const [accessDurationType, setAccessDurationType] = useState(data.access_duration_type || 'lifetime')
  const [accessDurationDays, setAccessDurationDays] = useState(data.access_duration_days?.toString() || '')
  
  // Batch-based
  const [isBatchBased, setIsBatchBased] = useState(data.is_batch_based || false)
  
  // Pay what you want
  const [minPrice, setMinPrice] = useState(data.min_price?.toString() || '')
  const [suggestedPrice, setSuggestedPrice] = useState(data.suggested_price?.toString() || '')
  
  // Free trial
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(data.free_trial_enabled || false)
  const [freeTrialDays, setFreeTrialDays] = useState(data.free_trial_days?.toString() || '7')
  const [trialRequiresCard, setTrialRequiresCard] = useState(data.trial_requires_card ?? true)
  
  // Tiered pricing
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(data.pricing_tiers || [])

  // Get currency symbol
  const currencySymbol = getCurrencySymbol(currency)

  // Handle form submission
  const handleNext = () => {
    const formData: Partial<PricingFormData> = {
      pricing_model: pricingModel,
      currency,
    }

    // Add fields based on pricing model
    if (pricingModel === 'free') {
      formData.price = 0
    } else if (pricingModel === 'one_time') {
      formData.price = parseFloat(price) || 0
      if (paymentPlanEnabled) {
        formData.payment_plan_enabled = true
        formData.payment_plan_installments = parseInt(installments)
        formData.payment_plan_frequency = frequency
        formData.payment_plan_down_payment = parseFloat(downPayment) || 0
      }
    } else if (pricingModel === 'subscription') {
      formData.subscription_type = subscriptionType
      formData.subscription_price = parseFloat(subscriptionPrice) || 0
      formData.auto_renewal = autoRenewal
    } else if (pricingModel === 'tiered') {
      formData.pricing_tiers = pricingTiers
    } else if (pricingModel === 'pay_what_you_want') {
      formData.min_price = parseFloat(minPrice) || 0
      formData.suggested_price = parseFloat(suggestedPrice) || 0
    } else if (pricingModel === 'early_bird') {
      formData.early_bird_enabled = earlyBirdEnabled
      formData.early_bird_price = parseFloat(earlyBirdPrice) || 0
      formData.early_bird_deadline = earlyBirdDeadline
      formData.regular_price = parseFloat(regularPrice) || 0
    } else if (pricingModel === 'free_trial') {
      formData.free_trial_enabled = freeTrialEnabled
      formData.free_trial_days = parseInt(freeTrialDays)
      formData.trial_requires_card = trialRequiresCard
      formData.price = parseFloat(price) || 0
    }

    // Enrollment settings
    if (minStudents) formData.min_students = parseInt(minStudents)
    if (maxStudents) formData.max_students = parseInt(maxStudents)
    formData.enable_waitlist = enableWaitlist

    // Access duration
    formData.access_duration_type = accessDurationType
    if (accessDurationType === 'time_limited' && accessDurationDays) {
      formData.access_duration_days = parseInt(accessDurationDays)
    }

    // Batch-based
    formData.is_batch_based = isBatchBased

    onUpdate(formData)
    onNext()
  }

  // Add new tier
  const addTier = () => {
    setPricingTiers([
      ...pricingTiers,
      {
        id: `tier-${Date.now()}`,
        name: '',
        description: '',
        price: 0,
        features: [],
        isPopular: false
      }
    ])
  }

  // Remove tier
  const removeTier = (id: string) => {
    setPricingTiers(pricingTiers.filter(t => t.id !== id))
  }

  // Update tier
  const updateTier = (id: string, updates: Partial<PricingTier>) => {
    setPricingTiers(pricingTiers.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Enrollment</h2>
        <p className="text-gray-600">Configure your course pricing model and enrollment settings</p>
      </div>

      {/* Pricing Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing Model
          </CardTitle>
          <CardDescription>Choose how students will pay for your course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRICING_MODELS.map((model) => (
              <div
                key={model.value}
                onClick={() => setPricingModel(model.value)}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${pricingModel === model.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem 
                    value={model.value} 
                    checked={pricingModel === model.value}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{model.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{model.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currency Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  {curr.symbol} {curr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Model-specific configuration */}
      {pricingModel === 'free' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Gift className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Free Course</h4>
                <p className="text-sm text-green-800">
                  Students can enroll without payment. Great for building your audience and reputation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pricingModel === 'one_time' && (
        <Card>
          <CardHeader>
            <CardTitle>One-time Payment</CardTitle>
            <CardDescription>Students pay once for lifetime access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">Course Price</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="99.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Payment Plan Option */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label>Enable Payment Plans</Label>
                  <p className="text-sm text-gray-500">Allow students to pay in installments</p>
                </div>
                <Switch
                  checked={paymentPlanEnabled}
                  onCheckedChange={setPaymentPlanEnabled}
                />
              </div>

              {paymentPlanEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Number of Installments</Label>
                      <Input
                        type="number"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        min="2"
                        max="12"
                      />
                    </div>
                    <div>
                      <Label>Payment Frequency</Label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Down Payment (Optional)</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        className="pl-8"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {pricingModel === 'subscription' && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Pricing</CardTitle>
            <CardDescription>Recurring payments for ongoing access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Subscription Type</Label>
              <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subscription Price</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder="29.00"
                  value={subscriptionPrice}
                  onChange={(e) => setSubscriptionPrice(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Per {subscriptionType === 'monthly' ? 'month' : subscriptionType === 'quarterly' ? 'quarter' : 'year'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-renewal</Label>
                <p className="text-sm text-gray-500">Automatically renew subscriptions</p>
              </div>
              <Switch
                checked={autoRenewal}
                onCheckedChange={setAutoRenewal}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {pricingModel === 'tiered' && (
        <Card>
          <CardHeader>
            <CardTitle>Tiered Pricing</CardTitle>
            <CardDescription>Offer multiple pricing tiers with different features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricingTiers.map((tier, index) => (
              <div key={tier.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Tier {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTier(tier.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tier Name</Label>
                    <Input
                      placeholder="Basic"
                      value={tier.name}
                      onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        placeholder="49.00"
                        value={tier.price}
                        onChange={(e) => updateTier(tier.id, { price: parseFloat(e.target.value) })}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="Perfect for beginners"
                    value={tier.description}
                    onChange={(e) => updateTier(tier.id, { description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={tier.isPopular}
                    onCheckedChange={(checked) => updateTier(tier.id, { isPopular: checked })}
                  />
                  <Label>Mark as popular</Label>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addTier}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tier
            </Button>
          </CardContent>
        </Card>
      )}

      {pricingModel === 'pay_what_you_want' && (
        <Card>
          <CardHeader>
            <CardTitle>Pay What You Want</CardTitle>
            <CardDescription>Let students choose their own price</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Minimum Price</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder="10.00"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                The lowest price students can pay
              </p>
            </div>
            <div>
              <Label>Suggested Price</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder="50.00"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Recommended price shown to students
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {pricingModel === 'early_bird' && (
        <Card>
          <CardHeader>
            <CardTitle>Early Bird Pricing</CardTitle>
            <CardDescription>Offer discounted price before deadline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Early Bird Price</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder="79.00"
                  value={earlyBirdPrice}
                  onChange={(e) => setEarlyBirdPrice(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <Label>Regular Price</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder="99.00"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <Label>Early Bird Deadline</Label>
              <Input
                type="datetime-local"
                value={earlyBirdDeadline}
                onChange={(e) => setEarlyBirdDeadline(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Price will automatically switch to regular after this date
              </p>
            </div>
            {earlyBirdPrice && regularPrice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  Students save {currencySymbol}{(parseFloat(regularPrice) - parseFloat(earlyBirdPrice)).toFixed(2)} 
                  ({Math.round(((parseFloat(regularPrice) - parseFloat(earlyBirdPrice)) / parseFloat(regularPrice)) * 100)}% off)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {pricingModel === 'free_trial' && (
        <Card>
          <CardHeader>
            <CardTitle>Free Trial</CardTitle>
            <CardDescription>Offer a trial period before payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Trial Duration (Days)</Label>
              <Input
                type="number"
                value={freeTrialDays}
                onChange={(e) => setFreeTrialDays(e.target.value)}
                min="1"
                max="30"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Price After Trial</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder="99.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Card for Trial</Label>
                <p className="text-sm text-gray-500">Students must add payment method</p>
              </div>
              <Switch
                checked={trialRequiresCard}
                onCheckedChange={setTrialRequiresCard}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrollment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Enrollment Settings
          </CardTitle>
          <CardDescription>Configure enrollment limits and requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Students</Label>
              <Input
                type="number"
                placeholder="Optional"
                value={minStudents}
                onChange={(e) => setMinStudents(e.target.value)}
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Course starts when minimum is reached
              </p>
            </div>
            <div>
              <Label>Maximum Students</Label>
              <Input
                type="number"
                placeholder="Optional"
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enrollment closes when limit is reached
              </p>
            </div>
          </div>
          
          {maxStudents && (
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Waitlist</Label>
                <p className="text-sm text-gray-500">Allow students to join waitlist when full</p>
              </div>
              <Switch
                checked={enableWaitlist}
                onCheckedChange={setEnableWaitlist}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Duration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Access Duration
          </CardTitle>
          <CardDescription>How long students can access the course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={accessDurationType} onValueChange={setAccessDurationType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCESS_DURATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {accessDurationType === 'time_limited' && (
            <div>
              <Label>Access Duration (Days)</Label>
              <Input
                type="number"
                placeholder="90"
                value={accessDurationDays}
                onChange={(e) => setAccessDurationDays(e.target.value)}
                min="1"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Students will have access for this many days after enrollment
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch-Based Option */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Batch-Based Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Batch-Based Enrollment</Label>
              <p className="text-sm text-gray-500">
                Run course in scheduled batches with specific start/end dates
              </p>
            </div>
            <Switch
              checked={isBatchBased}
              onCheckedChange={setIsBatchBased}
            />
          </div>
          {isBatchBased && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <Info className="w-4 h-4 inline mr-1" />
                You'll be able to create and manage batches after creating the course
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600 text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Pricing Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Research similar courses to set competitive pricing</li>
                <li>• Payment plans can increase enrollment by 30-40%</li>
                <li>• Early bird pricing creates urgency and boosts early sales</li>
                <li>• Free trials reduce purchase hesitation</li>
                <li>• Subscription models provide recurring revenue</li>
                <li>• Tiered pricing lets you serve different customer segments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
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
