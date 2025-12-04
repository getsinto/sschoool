'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ModuleSettingsForm } from './ModuleSettingsForm'
import { Module, ModuleFormData } from '@/types/lesson'

interface ModuleModalProps {
  open: boolean
  onClose: () => void
  onSave: (module: ModuleFormData & { id?: string; order_index?: number }) => void
  module?: Module | null
  allModules?: Module[]
  mode?: 'create' | 'edit'
}

export function ModuleModal({ 
  open, 
  onClose, 
  onSave, 
  module, 
  allModules = [],
  mode = 'create' 
}: ModuleModalProps) {
  const [formData, setFormData] = useState<ModuleFormData>({
    title: '',
    description: '',
    thumbnail_url: '',
    prerequisites: [],
    status: 'draft',
    access_type: 'enrolled_only'
  })

  const [errors, setErrors] = useState<{ title?: string }>({})

  useEffect(() => {
    if (module && mode === 'edit') {
      setFormData({
        title: module.title || '',
        description: module.description || '',
        thumbnail_url: module.thumbnail_url || '',
        prerequisites: module.prerequisites || [],
        status: module.status,
        access_type: module.access_type
      })
    } else {
      setFormData({
        title: '',
        description: '',
        thumbnail_url: '',
        prerequisites: [],
        status: 'draft',
        access_type: 'enrolled_only'
      })
    }
    setErrors({})
  }, [module, mode, open])

  const validateForm = () => {
    const newErrors: { title?: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Module title is required'
    }

    if (formData.description && formData.description.length < 50) {
      // Warning but not blocking
      console.warn('Module description should be at least 50 characters')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSave({
      ...formData,
      id: module?.id,
      order_index: module?.order_index
    })

    // Reset form
    setFormData({
      title: '',
      description: '',
      thumbnail_url: '',
      prerequisites: [],
      status: 'draft',
      access_type: 'enrolled_only'
    })
    setErrors({})
    onClose()
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail_url: '',
      prerequisites: [],
      status: 'draft',
      access_type: 'enrolled_only'
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Module' : 'Add New Module'}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Modules help organize your course content into logical sections
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ModuleSettingsForm
            module={module || undefined}
            allModules={allModules}
            onChange={setFormData}
          />

          {errors.title && (
            <p className="text-sm text-red-600 mt-2">{errors.title}</p>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Save Changes' : 'Add Module'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
