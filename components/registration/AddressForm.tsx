'use client'

import { useState } from 'react'
import { AddressInfo, ValidationErrors } from '@/types/registration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface AddressFormProps {
  data: Partial<AddressInfo>
  errors: ValidationErrors
  onChange: (data: Partial<AddressInfo>) => void
  onNext: () => void
  onBack: () => void
}

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' }
]

const statesProvinces: { [key: string]: string[] } = {
  'US': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  'CA': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
  'IN': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
}

export function AddressForm({ data, errors, onChange, onNext, onBack }: AddressFormProps) {
  const [countrySearch, setCountrySearch] = useState('')
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const selectedCountry = countries.find(c => c.name === data.country)
  const showStateField = selectedCountry && statesProvinces[selectedCountry.code]

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
          <p className="text-sm text-gray-600">
            Please provide your address details for account verification and regional compliance
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Country Selection */}
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select 
              value={data.country || ''} 
              onValueChange={(value) => onChange({ ...data, country: value, state: '' })}
            >
              <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your country">
                  {selectedCountry && (
                    <span className="flex items-center gap-2">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.name}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {filteredCountries.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-red-600 mt-1">{errors.country}</p>
            )}
          </div>

          {/* State/Province (conditional) */}
          {showStateField && (
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Select 
                value={data.state || ''} 
                onValueChange={(value) => onChange({ ...data, state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state/province" />
                </SelectTrigger>
                <SelectContent>
                  {statesProvinces[selectedCountry.code]?.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* City and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.city || ''}
                onChange={(e) => onChange({ ...data, city: e.target.value })}
                placeholder="Enter your city"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="postalCode">Postal/ZIP Code *</Label>
              <Input
                id="postalCode"
                value={data.postalCode || ''}
                onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
                placeholder="Enter postal code"
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-600 mt-1">{errors.postalCode}</p>
              )}
            </div>
          </div>

          {/* Full Address */}
          <div>
            <Label htmlFor="address">Full Address *</Label>
            <Textarea
              id="address"
              value={data.address || ''}
              onChange={(e) => onChange({ ...data, address: e.target.value })}
              placeholder="Street address, building number, apartment, etc."
              rows={3}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">{errors.address}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Please provide your complete address including street name, building number, and any apartment/unit details
            </p>
          </div>

          {/* EU/GDPR Notice */}
          {selectedCountry && ['Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria', 'Sweden', 'Denmark', 'Finland', 'Ireland', 'Portugal', 'Greece', 'Luxembourg', 'Malta', 'Cyprus', 'Estonia', 'Latvia', 'Lithuania', 'Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Slovenia', 'Croatia', 'Bulgaria', 'Romania'].includes(selectedCountry.name) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>EU Resident Notice:</strong> As you're located in the European Union, additional GDPR consent will be required in the Terms & Consent step to comply with data protection regulations.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              Continue to Role-Specific Information
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}