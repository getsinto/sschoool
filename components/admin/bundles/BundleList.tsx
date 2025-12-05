'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, Edit, Trash2, Star, DollarSign, 
  TrendingDown, Eye, EyeOff, Plus 
} from 'lucide-react'
import { CourseBundle } from '@/types/pricing'
import { getCurrencySymbol } from '@/types/pricing'

interface BundleListProps {
  onCreateBundle: () => void
  onEditBundle: (bundle: CourseBundle) => void
}

export function BundleList({ onCreateBundle, onEditBundle }: BundleListProps) {
  const [bundles, setBundles] = useState<CourseBundle[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBundles()
  }, [])

  const fetchBundles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/bundles')
      if (response.ok) {
        const data = await response.json()
        setBundles(data.bundles || [])
      }
    } catch (error) {
      console.error('Error fetching bundles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bundleId: string) => {
    if (!confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(bundleId)
      const response = await fetch(`/api/admin/bundles/${bundleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBundles(bundles.filter(b => b.id !== bundleId))
      } else {
        alert('Failed to delete bundle')
      }
    } catch (error) {
      console.error('Error deleting bundle:', error)
      alert('Error deleting bundle')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleActive = async (bundle: CourseBundle) => {
    try {
      const response = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !bundle.is_active })
      })

      if (response.ok) {
        const data = await response.json()
        setBundles(bundles.map(b => b.id === bundle.id ? data.bundle : b))
      }
    } catch (error) {
      console.error('Error toggling bundle status:', error)
    }
  }

  const toggleFeatured = async (bundle: CourseBundle) => {
    try {
      const response = await fetch(`/api/admin/bundles/${bundle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !bundle.is_featured })
      })

      if (response.ok) {
        const data = await response.json()
        setBundles(bundles.map(b => b.id === bundle.id ? data.bundle : b))
      }
    } catch (error) {
      console.error('Error toggling featured status:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Bundles</h3>
          <p className="text-sm text-gray-500">
            Manage course packages and bundle pricing
          </p>
        </div>
        <Button onClick={onCreateBundle}>
          <Plus className="w-4 h-4 mr-2" />
          Create Bundle
        </Button>
      </div>

      {bundles.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Bundles Yet</h4>
              <p className="text-gray-500 mb-4">
                Create your first course bundle to offer package deals
              </p>
              <Button onClick={onCreateBundle}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Bundle
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bundles.map((bundle) => (
            <Card key={bundle.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{bundle.bundle_name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {bundle.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Featured
                          </Badge>
                        )}
                        <Badge className={bundle.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {bundle.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    {bundle.bundle_description && (
                      <p className="text-sm text-gray-600">{bundle.bundle_description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeatured(bundle)}
                      title={bundle.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star className={`w-4 h-4 ${bundle.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(bundle)}
                      title={bundle.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {bundle.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditBundle(bundle)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(bundle.id)}
                      disabled={deletingId === bundle.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Courses */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Included Courses
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {bundle.course_ids.length}
                    </div>
                    <div className="text-xs text-gray-500">
                      courses in bundle
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Bundle Price
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {getCurrencySymbol(bundle.currency)}{bundle.bundle_price.toFixed(2)}
                      </div>
                      {bundle.regular_price && (
                        <div className="text-sm text-gray-500 line-through">
                          {getCurrencySymbol(bundle.currency)}{bundle.regular_price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Savings */}
                  {bundle.savings_amount && bundle.savings_amount > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Customer Savings
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {getCurrencySymbol(bundle.currency)}{bundle.savings_amount.toFixed(2)}
                          </div>
                          {bundle.savings_percentage && (
                            <div className="text-xs text-green-700">
                              {bundle.savings_percentage}% off
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Slug:</span> {bundle.bundle_slug}
                  </div>
                  {bundle.validity_days && (
                    <div>
                      <span className="font-medium">Validity:</span> {bundle.validity_days} days
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
