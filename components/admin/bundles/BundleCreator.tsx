'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Package, DollarSign, TrendingDown, Star, X, 
  Search, CheckCircle, AlertCircle 
} from 'lucide-react'
import { CourseBundle, CourseBundleInsert, getCurrencySymbol } from '@/types/pricing'

interface Course {
  id: string
  title: string
  thumbnail_url?: string
  price: number
  category: string
}

interface BundleCreatorProps {
  bundle?: CourseBundle | null
  onSave: (bundle: CourseBundle) => void
  onCancel: () => void
}

export function BundleCreator({ bundle, onSave, onCancel }: BundleCreatorProps) {
  const [loading, setLoading] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Available courses
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [bundleName, setBundleName] = useState(bundle?.bundle_name || '')
  const [bundleSlug, setBundleSlug] = useState(bundle?.bundle_slug || '')
  const [description, setDescription] = useState(bundle?.bundle_description || '')
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(bundle?.course_ids || [])
  const [bundlePrice, setBundlePrice] = useState(bundle?.bundle_price?.toString() || '')
  const [validityDays, setValidityDays] = useState(bundle?.validity_days?.toString() || '')
  const [isActive, setIsActive] = useState(bundle?.is_active ?? true)
  const [isFeatured, setIsFeatured] = useState(bundle?.is_featured ?? false)

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    // Auto-generate slug from name
    if (!bundle && bundleName) {
      const slug = bundleName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setBundleSlug(slug)
    }
  }, [bundleName, bundle])

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await fetch('/api/admin/courses?status=published')
      if (response.ok) {
        const data = await response.json()
        setAllCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const selectedCourses = allCourses.filter(c => selectedCourseIds.includes(c.id))
  const regularPrice = selectedCourses.reduce((sum, course) => sum + course.price, 0)
  const bundlePriceNum = parseFloat(bundlePrice) || 0
  const savings = regularPrice - bundlePriceNum
  const savingsPercentage = regularPrice > 0 ? Math.round((savings / regularPrice) * 100) : 0

  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!bundleName.trim()) {
      newErrors.bundleName = 'Bundle name is required'
    }

    if (!bundleSlug.trim()) {
      newErrors.bundleSlug = 'Bundle slug is required'
    }

    if (selectedCourseIds.length < 2) {
      newErrors.courses = 'Select at least 2 courses for the bundle'
    }

    if (!bundlePrice || parseFloat(bundlePrice) <= 0) {
      newErrors.bundlePrice = 'Bundle price must be greater than 0'
    }

    if (bundlePriceNum >= regularPrice) {
      newErrors.bundlePrice = 'Bundle price should be less than regular price'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const bundleData: CourseBundleInsert | any = {
        bundle_name: bundleName,
        bundle_slug: bundleSlug,
        bundle_description: description || undefined,
        bundle_price: parseFloat(bundlePrice),
        regular_price: regularPrice,
        course_ids: selectedCourseIds,
        validity_days: validityDays ? parseInt(validityDays) : undefined,
        is_active: isActive,
        is_featured: isFeatured
      }

      const url = bundle
        ? `/api/admin/bundles/${bundle.id}`
        : '/api/admin/bundles'

      const method = bundle ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bundleData)
      })

      if (response.ok) {
        const data = await response.json()
        onSave(data.bundle)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save bundle')
      }
    } catch (error) {
      console.error('Error saving bundle:', error)
      alert('Error saving bundle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {bundle ? 'Edit Bundle' : 'Create Course Bundle'}
        </h3>
        <p className="text-sm text-gray-500">
          Package multiple courses together at a discounted price
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Bundle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bundleName">
              Bundle Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bundleName"
              placeholder="e.g., Complete Mathematics Package"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              className={errors.bundleName ? 'border-red-500' : ''}
            />
            {errors.bundleName && (
              <p className="text-sm text-red-500 mt-1">{errors.bundleName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bundleSlug">
              Bundle Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bundleSlug"
              placeholder="complete-mathematics-package"
              value={bundleSlug}
              onChange={(e) => setBundleSlug(e.target.value)}
              className={errors.bundleSlug ? 'border-red-500' : ''}
            />
            <p className="text-sm text-gray-500 mt-1">
              URL-friendly identifier (auto-generated from name)
            </p>
            {errors.bundleSlug && (
              <p className="text-sm text-red-500 mt-1">{errors.bundleSlug}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what's included in this bundle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Courses</CardTitle>
          <CardDescription>
            Choose at least 2 courses to include in this bundle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Courses Summary */}
          {selectedCourseIds.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? 's' : ''} selected
                </span>
                <span className="text-sm text-blue-700">
                  Total: ${regularPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCourses.map(course => (
                  <Badge key={course.id} variant="secondary" className="flex items-center gap-1">
                    {course.title}
                    <button
                      type="button"
                      onClick={() => toggleCourse(course.id)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {errors.courses && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{errors.courses}</p>
            </div>
          )}

          {/* Course List */}
          {loadingCourses ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
              {filteredCourses.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No courses found</p>
              ) : (
                filteredCourses.map(course => (
                  <div
                    key={course.id}
                    className={`
                      flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                      ${selectedCourseIds.includes(course.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                      }
                    `}
                    onClick={() => toggleCourse(course.id)}
                  >
                    <Checkbox
                      checked={selectedCourseIds.includes(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                    />
                    {course.thumbnail_url && (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-gray-500">{course.category}</div>
                    </div>
                    <div className="text-sm font-semibold">${course.price.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Bundle Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bundlePrice">
              Bundle Price <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="bundlePrice"
                type="number"
                placeholder="199.00"
                value={bundlePrice}
                onChange={(e) => setBundlePrice(e.target.value)}
                className={`pl-8 ${errors.bundlePrice ? 'border-red-500' : ''}`}
                min="0"
                step="0.01"
              />
            </div>
            {errors.bundlePrice && (
              <p className="text-sm text-red-500 mt-1">{errors.bundlePrice}</p>
            )}
          </div>

          {/* Pricing Summary */}
          {selectedCourseIds.length > 0 && bundlePriceNum > 0 && (
            <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Regular Price:</span>
                <span className="text-sm font-medium">${regularPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Bundle Price:</span>
                <span className="text-sm font-medium">${bundlePriceNum.toFixed(2)}</span>
              </div>
              <div className="border-t border-green-300 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Savings:</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${savings.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700">
                      ({savingsPercentage}% off)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="validityDays">Validity Period (Days)</Label>
            <Input
              id="validityDays"
              type="number"
              placeholder="365 (optional)"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              min="1"
            />
            <p className="text-sm text-gray-500 mt-1">
              How long students have access after purchase (leave empty for lifetime)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Bundle Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-sm text-gray-500">
                Make this bundle available for purchase
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <Label>Featured Bundle</Label>
                <p className="text-sm text-gray-500">
                  Highlight this bundle on the homepage
                </p>
              </div>
            </div>
            <Switch
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : bundle ? 'Update Bundle' : 'Create Bundle'}
        </Button>
      </div>
    </form>
  )
}
