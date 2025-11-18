'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Section {
  id?: string
  title: string
  description?: string
  order?: number
}

interface SectionModalProps {
  open: boolean
  onClose: () => void
  onSave: (section: Section) => void
  section?: Section | null
  mode?: 'create' | 'edit'
}

export function SectionModal({ open, onClose, onSave, section, mode = 'create' }: SectionModalProps) {
  const [formData, setFormData] = useState<Section>({
    title: '',
    description: ''
  })

  const [errors, setErrors] = useState<{ title?: string }>({})

  useEffect(() => {
    if (section && mode === 'edit') {
      setFormData({
        title: section.title || '',
        description: section.description || '',
        order: section.order
      })
    } else {
      setFormData({
        title: '',
        description: ''
      })
    }
    setErrors({})
  }, [section, mode, open])

  const validateForm = () => {
    const newErrors: { title?: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Section title is required'
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
      id: section?.id
    })

    // Reset form
    setFormData({ title: '', description: '' })
    setErrors({})
    onClose()
  }

  const handleCancel = () => {
    setFormData({ title: '', description: '' })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Section' : 'Add New Section'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Section Title */}
            <div>
              <Label htmlFor="section-title">
                Section Title *
              </Label>
              <Input
                id="section-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to React"
                className={errors.title ? 'border-red-500' : ''}
                autoFocus
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Section Description */}
            <div>
              <Label htmlFor="section-description">
                Section Description (Optional)
              </Label>
              <Textarea
                id="section-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe what students will learn in this section..."
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Help students understand what to expect from this section
              </p>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Section Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use clear, descriptive titles that indicate the learning objective</li>
                <li>• Group related lessons together logically</li>
                <li>• Keep sections focused on a single topic or skill</li>
                <li>• Aim for 3-7 lessons per section for optimal organization</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Save Changes' : 'Add Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
