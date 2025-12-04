'use client'

/**
 * CategoryModal Component
 * Modal dialog for creating new course categories
 * Includes form fields for name, description, icon upload, and color picker
 */

import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import { X, Upload, Check } from 'lucide-react'
import { categoryCreationSchema } from '@/lib/validations/courseValidation'
import { z } from 'zod'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (category: any) => void
}

export default function CategoryModal({ isOpen, onClose, onSuccess }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  if (!isOpen) return null
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      if (file.size > 1024 * 1024) {
        setErrors(prev => ({ ...prev, icon: 'Icon file must be less than 1MB' }))
        return
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, icon: 'Icon must be a JPEG, PNG, SVG, or WebP image' }))
        return
      }
      
      setIconFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear error
      if (errors.icon) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.icon
          return newErrors
        })
      }
    }
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)
    
    try {
      // Validate form data
      const validationData = {
        ...formData,
        icon: iconFile
      }
      
      categoryCreationSchema.parse(validationData)
      
      // Create FormData for submission
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('color', formData.color)
      if (iconFile) {
        submitData.append('icon', iconFile)
      }
      
      // Submit to API
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        body: submitData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setErrors({ submit: data.error || 'Failed to create category' })
        setIsSubmitting(false)
        return
      }
      
      // Success
      onSuccess(data.category)
      handleClose()
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ submit: 'An unexpected error occurred' })
      }
      setIsSubmitting(false)
    }
  }
  
  const handleClose = () => {
    setFormData({ name: '', description: '', color: '#3B82F6' })
    setIconFile(null)
    setIconPreview(null)
    setErrors({})
    setIsSubmitting(false)
    onClose()
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Category</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Mathematics"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description of this category"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          
          {/* Color Picker */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Category Color <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                disabled={isSubmitting}
              />
              <input
                type="text"
                value={formData.color}
                onChange={handleInputChange}
                name="color"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3B82F6"
                disabled={isSubmitting}
              />
            </div>
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color}</p>
            )}
          </div>
          
          {/* Icon Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Icon
            </label>
            <div className="flex items-center space-x-4">
              {iconPreview ? (
                <div className="w-16 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml,image/webp"
                  onChange={handleIconChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Choose File
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, SVG, or WebP (max 1MB)
                </p>
              </div>
            </div>
            {errors.icon && (
              <p className="mt-1 text-sm text-red-600">{errors.icon}</p>
            )}
          </div>
          
          {/* Category Badge Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div 
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: `${formData.color}20`,
                color: formData.color,
                border: `1px solid ${formData.color}40`
              }}
            >
              {iconPreview && (
                <img src={iconPreview} alt="" className="w-4 h-4 mr-2" />
              )}
              {formData.name || 'Category Name'}
            </div>
          </div>
          
          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
