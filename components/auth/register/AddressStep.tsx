'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RegistrationData } from '@/app/(auth)/register/page'

const addressSchema = z.object({
  country: z.string().min(1, 'Please select your country'),
  state: z.string().min(1, 'Please enter your state/province'),
  city: z.string().min(1, 'Please enter your city'),
  address: z.string().min(5, 'Please enter your full address'),
  postalCode: z.string().min(3, 'Please enter your postal/ZIP code'),
})

type AddressForm = z.infer<typeof addressSchema>

interface AddressStepProps {
  data: RegistrationData
  updateData: (updates: Partial<RegistrationData>) => void
  onNext: () => void
  onPrev: () => void
}

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'IN', label: 'India' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'QA', label: 'Qatar' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'OM', label: 'Oman' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
]

export default function AddressStep({ data, updateData, onNext, onPrev }: AddressStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: data.country,
      state: data.state,
      city: data.city,
      address: data.address,
      postalCode: data.postalCode,
    },
  })

  const onSubmit = (formData: AddressForm) => {
    updateData(formData)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Address Information</h2>
        <p className="text-gray-600">
          We need your address for verification and course delivery purposes
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country *</Label>
        <Select onValueChange={(value) => setValue('country', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-sm text-red-600">{errors.country.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State/Province *</Label>
          <Input
            id="state"
            placeholder="Enter your state or province"
            {...register('state')}
          />
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="Enter your city"
            {...register('city')}
          />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          placeholder="Enter your full street address"
          {...register('address')}
        />
        {errors.address && (
          <p className="text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="postalCode">Postal/ZIP Code *</Label>
        <Input
          id="postalCode"
          placeholder="Enter your postal or ZIP code"
          {...register('postalCode')}
        />
        {errors.postalCode && (
          <p className="text-sm text-red-600">{errors.postalCode.message}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Privacy Notice
            </h4>
            <p className="text-sm text-blue-700">
              Your address information is used for identity verification and course material delivery. 
              We follow strict privacy guidelines and never share your personal information with third parties.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  )
}