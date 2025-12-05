'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Save, Eye, EyeOff, Settings } from 'lucide-react'
import { HomepageSection } from '@/types/website-content'

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/website-content/homepage')
      const data = await response.json()
      setSections(data.sections || [])
    } catch (error) {
      console.error('Error fetching sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSection = (sectionName: string) => {
    setSections(sections.map(section => 
      section.section_name === sectionName
        ? { ...section, is_enabled: !section.is_enabled }
        : section
    ))
  }

  const handleUpdateTitle = (sectionName: string, title: string) => {
    setSections(sections.map(section => 
      section.section_name === sectionName
        ? { ...section, section_title: title }
        : section
    ))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    
    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index - 1]
    newSections[index - 1] = temp
    
    // Update display orders
    newSections.forEach((section, i) => {
      section.display_order = i + 1
    })
    
    setSections(newSections)
  }

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return
    
    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[index + 1]
    newSections[index + 1] = temp
    
    // Update display orders
    newSections.forEach((section, i) => {
      section.display_order = i + 1
    })
    
    setSections(newSections)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/website-content/homepage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections })
      })

      if (response.ok) {
        alert('Homepage sections saved successfully!')
        await fetchSections()
      } else {
        throw new Error('Failed to save sections')
      }
    } catch (error) {
      console.error('Error saving sections:', error)
      alert('Error saving sections')
    } finally {
      setSaving(false)
    }
  }

  const getSectionIcon = (sectionName: string) => {
    const icons: Record<string, string> = {
      hero: '🎯',
      features: '✨',
      courses: '📚',
      teachers: '👨‍🏫',
      testimonials: '💬',
      brochure: '📄',
      faq: '❓',
      cta: '🚀'
    }
    return icons[sectionName] || '📄'
  }

  const getSectionDescription = (sectionName: string) => {
    const descriptions: Record<string, string> = {
      hero: 'Main banner with headline and call-to-action',
      features: 'Platform features and benefits showcase',
      courses: 'Featured courses grid',
      teachers: 'Meet our teachers section',
      testimonials: 'Parent and student testimonials',
      brochure: 'Downloadable brochure section',
      faq: 'Frequently asked questions',
      cta: 'Final call-to-action section'
    }
    return descriptions[sectionName] || 'Homepage section'
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Homepage Sections Manager</h1>
          <p className="text-gray-600">Manage the order and visibility of homepage sections</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Order & Visibility</CardTitle>
          <CardDescription>
            Drag sections to reorder, toggle visibility, and edit titles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sections.map((section, index) => (
            <Card key={section.section_name} className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="h-6 px-2"
                    >
                      ▲
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sections.length - 1}
                      className="h-6 px-2"
                    >
                      ▼
                    </Button>
                  </div>

                  <div className="cursor-move">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="text-2xl">
                    {getSectionIcon(section.section_name)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold capitalize">
                        {section.section_name.replace(/_/g, ' ')}
                      </h3>
                      <Badge variant="outline">Order: {section.display_order}</Badge>
                      {section.is_enabled ? (
                        <Badge variant="default" className="bg-green-500">
                          <Eye className="w-3 h-3 mr-1" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {getSectionDescription(section.section_name)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Visible</Label>
                      <Switch
                        checked={section.is_enabled}
                        onCheckedChange={() => handleToggleSection(section.section_name)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 ml-14 space-y-2">
                  <div className="space-y-1">
                    <Label className="text-sm">Section Title</Label>
                    <Input
                      value={section.section_title || ''}
                      onChange={(e) => handleUpdateTitle(section.section_name, e.target.value)}
                      placeholder={`Title for ${section.section_name} section`}
                    />
                  </div>

                  {section.settings && (
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(section.settings).map(([key, value]) => (
                        <Badge key={key} variant="outline">
                          <Settings className="w-3 h-3 mr-1" />
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview Order</CardTitle>
          <CardDescription>
            This is how sections will appear on your homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections
              .filter(s => s.is_enabled)
              .map((section, index) => (
                <div key={section.section_name} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <Badge>{index + 1}</Badge>
                  <span className="text-2xl">{getSectionIcon(section.section_name)}</span>
                  <div>
                    <div className="font-semibold">
                      {section.section_title || section.section_name.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getSectionDescription(section.section_name)}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {sections.filter(s => s.is_enabled).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sections are currently visible. Enable at least one section to display content.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  )
}
