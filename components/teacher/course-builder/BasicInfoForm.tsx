'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Upload, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CategoryModal from '@/components/admin/categories/CategoryModal'
import IconSelector from '@/components/teacher/course-builder/IconSelector'
import AgeGroupSelector from '@/components/teacher/course-builder/AgeGroupSelector'
import { LANGUAGES, STUDENT_TYPES, GRADE_LEVELS } from '@/types/course'
import type { CourseHighlight } from '@/types/course'

interface BasicInfoFormProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
}

export function BasicInfoForm({ data, onUpdate, onNext }: BasicInfoFormProps) {
  const [formData, setFormData] = useState({
    title: data.title || '',
    subtitle: data.subtitle || '',
    shortDescription: data.shortDescription || '',
    fullDescription: data.fullDescription || '',
    category: data.category || '',
    grade: data.grade || '',
    subject: data.subject || '',
    language: data.language || 'English',
    customLanguage: data.customLanguage || '',
    thumbnail: data.thumbnail || null,
    introVideo: data.introVideo || '',
    learningObjectives: data.learningObjectives || [''],
    prerequisites: data.prerequisites || [''],
    difficultyLevel: data.difficultyLevel || '',
    ageGroups: data.ageGroups || [],
    studentTypes: data.studentTypes || [],
    highlights: data.highlights || [{ text: '', icon: '' }, { text: '', icon: '' }, { text: '', icon: '' }],
    outcomes: data.outcomes || ['', '', '']
  })

  const [errors, setErrors] = useState<any>({})
  const [categories, setCategories] = useState<any[]>([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    onUpdate({ [field]: value })
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const addListItem = (field: 'learningObjectives' | 'prerequisites') => {
    const newList = [...formData[field], '']
    setFormData({ ...formData, [field]: newList })
    onUpdate({ [field]: newList })
  }

  const removeListItem = (field: 'learningObjectives' | 'prerequisites', index: number) => {
    const newList = formData[field].filter((_: string, i: number) => i !== index)
    setFormData({ ...formData, [field]: newList })
    onUpdate({ [field]: newList })
  }

  const updateListItem = (field: 'learningObjectives' | 'prerequisites', index: number, value: string) => {
    const newList = [...formData[field]]
    newList[index] = value
    setFormData({ ...formData, [field]: newList })
    onUpdate({ [field]: newList })
  }

  // Highlights management
  const addHighlight = () => {
    if (formData.highlights.length < 10) {
      const newHighlights = [...formData.highlights, { text: '', icon: '' }]
      setFormData({ ...formData, highlights: newHighlights })
      onUpdate({ highlights: newHighlights })
    }
  }

  const removeHighlight = (index: number) => {
    if (formData.highlights.length > 3) {
      const newHighlights = formData.highlights.filter((_: CourseHighlight, i: number) => i !== index)
      setFormData({ ...formData, highlights: newHighlights })
      onUpdate({ highlights: newHighlights })
    }
  }

  const updateHighlight = (index: number, field: 'text' | 'icon', value: string) => {
    const newHighlights = [...formData.highlights]
    newHighlights[index] = { ...newHighlights[index], [field]: value }
    setFormData({ ...formData, highlights: newHighlights })
    onUpdate({ highlights: newHighlights })
  }

  // Outcomes management
  const addOutcome = () => {
    if (formData.outcomes.length < 8) {
      const newOutcomes = [...formData.outcomes, '']
      setFormData({ ...formData, outcomes: newOutcomes })
      onUpdate({ outcomes: newOutcomes })
    }
  }

  const removeOutcome = (index: number) => {
    if (formData.outcomes.length > 3) {
      const newOutcomes = formData.outcomes.filter((_: string, i: number) => i !== index)
      setFormData({ ...formData, outcomes: newOutcomes })
      onUpdate({ outcomes: newOutcomes })
    }
  }

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...formData.outcomes]
    newOutcomes[index] = value
    setFormData({ ...formData, outcomes: newOutcomes })
    onUpdate({ outcomes: newOutcomes })
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implement image upload and crop
      const reader = new FileReader()
      reader.onloadend = () => {
        handleChange('thumbnail', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validate = () => {
    const newErrors: any = {}

    if (!formData.title.trim()) newErrors.title = 'Course title is required'
    
    // Subtitle validation
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = 'Course subtitle is required'
    } else if (formData.subtitle.length < 10) {
      newErrors.subtitle = 'Subtitle must be at least 10 characters'
    } else if (formData.subtitle.length > 150) {
      newErrors.subtitle = 'Subtitle must be 150 characters or less'
    }
    
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required'
    if (formData.shortDescription.length > 150) newErrors.shortDescription = 'Short description must be 150 characters or less'
    if (!formData.fullDescription.trim()) newErrors.fullDescription = 'Full description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.grade) newErrors.grade = 'Grade/Level is required'
    if (!formData.subject) newErrors.subject = 'Subject is required'
    
    // Language validation
    if (!formData.language) {
      newErrors.language = 'Language is required'
    } else if (formData.language === 'Other' && !formData.customLanguage.trim()) {
      newErrors.customLanguage = 'Please specify the language'
    }
    
    if (!formData.thumbnail) newErrors.thumbnail = 'Course thumbnail is required'
    if (!formData.difficultyLevel) newErrors.difficultyLevel = 'Difficulty level is required'
    
    // Age groups validation
    if (formData.ageGroups.length === 0) {
      newErrors.ageGroups = 'Please select at least one age group'
    }
    
    // Student types validation
    if (formData.studentTypes.length === 0) {
      newErrors.studentTypes = 'Please select at least one student type'
    }
    
    const validObjectives = formData.learningObjectives.filter((obj: string) => obj.trim())
    if (validObjectives.length === 0) newErrors.learningObjectives = 'At least one learning objective is required'
    
    // Highlights validation
    const validHighlights = formData.highlights.filter((h: CourseHighlight) => h.text.trim())
    if (validHighlights.length < 3) {
      newErrors.highlights = 'At least 3 highlights are required'
    } else if (validHighlights.length > 10) {
      newErrors.highlights = 'Maximum 10 highlights allowed'
    }
    
    // Check individual highlight length
    formData.highlights.forEach((h: CourseHighlight, i: number) => {
      if (h.text.length > 100) {
        newErrors[`highlight_${i}`] = 'Highlight must be 100 characters or less'
      }
    })
    
    // Outcomes validation
    const validOutcomes = formData.outcomes.filter((o: string) => o.trim())
    if (validOutcomes.length < 3) {
      newErrors.outcomes = 'At least 3 outcomes are required'
    } else if (validOutcomes.length > 8) {
      newErrors.outcomes = 'Maximum 8 outcomes allowed'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Course Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course Title */}
          <div>
            <Label htmlFor="title">
              Course Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Advanced Mathematics for Grade 10"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Course Subtitle */}
          <div>
            <Label htmlFor="subtitle">
              Course Subtitle <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="e.g., Master the fundamentals of mathematics"
              maxLength={150}
              className={errors.subtitle ? 'border-red-500' : ''}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.subtitle.length}/150 characters (minimum 10)
            </p>
            {errors.subtitle && <p className="text-sm text-red-500 mt-1">{errors.subtitle}</p>}
          </div>

          {/* Short Description */}
          <div>
            <Label htmlFor="shortDescription">
              Short Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => handleChange('shortDescription', e.target.value)}
              placeholder="Brief overview of the course (max 150 characters)"
              maxLength={150}
              rows={2}
              className={errors.shortDescription ? 'border-red-500' : ''}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.shortDescription.length}/150 characters
            </p>
            {errors.shortDescription && <p className="text-sm text-red-500 mt-1">{errors.shortDescription}</p>}
          </div>

          {/* Full Description */}
          <div>
            <Label htmlFor="fullDescription">
              Full Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="fullDescription"
              value={formData.fullDescription}
              onChange={(e) => handleChange('fullDescription', e.target.value)}
              placeholder="Detailed description of what students will learn..."
              rows={6}
              className={errors.fullDescription ? 'border-red-500' : ''}
            />
            {errors.fullDescription && <p className="text-sm text-red-500 mt-1">{errors.fullDescription}</p>}
          </div>

          {/* Category, Grade, Subject Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => {
                  if (value === '__add_new__') {
                    setIsCategoryModalOpen(true)
                  } else {
                    handleChange('category', value)
                  }
                }}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      <div className="flex items-center gap-2">
                        {cat.icon_url && (
                          <img src={cat.icon_url} alt="" className="w-4 h-4" />
                        )}
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="__add_new__" className="text-blue-600 font-medium">
                    + Add New Category
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label htmlFor="grade">
                Grade/Level <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
                <SelectTrigger className={errors.grade ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((level) => {
                    // Show conditional options based on category
                    if (level.value === 'spoken-english-all' && formData.category !== 'spoken-english') {
                      return null
                    }
                    if (level.value === 'tuition-custom' && formData.category !== 'tuition') {
                      return null
                    }
                    return (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {errors.grade && <p className="text-sm text-red-500 mt-1">{errors.grade}</p>}
            </div>

            <div>
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)}>
                <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="geography">Geography</SelectItem>
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <Label htmlFor="language">
              Language of Instruction <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.language} onValueChange={(value) => handleChange('language', value)}>
              <SelectTrigger className={errors.language ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language && <p className="text-sm text-red-500 mt-1">{errors.language}</p>}
            
            {/* Custom Language Input */}
            {formData.language === 'Other' && (
              <div className="mt-3">
                <Input
                  value={formData.customLanguage}
                  onChange={(e) => handleChange('customLanguage', e.target.value)}
                  placeholder="Please specify the language"
                  className={errors.customLanguage ? 'border-red-500' : ''}
                />
                {errors.customLanguage && <p className="text-sm text-red-500 mt-1">{errors.customLanguage}</p>}
              </div>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <Label htmlFor="thumbnail">
              Course Thumbnail <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              {formData.thumbnail ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.thumbnail}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleChange('thumbnail', null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="thumbnail-upload"
                  className={`
                    flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
                    hover:bg-gray-50 transition-colors
                    ${errors.thumbnail ? 'border-red-500' : 'border-gray-300'}
                  `}
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload thumbnail</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended: 1280x720px</p>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                  />
                </label>
              )}
            </div>
            {errors.thumbnail && <p className="text-sm text-red-500 mt-1">{errors.thumbnail}</p>}
          </div>

          {/* Intro Video */}
          <div>
            <Label htmlFor="introVideo">Intro Video (Optional)</Label>
            <Input
              id="introVideo"
              value={formData.introVideo}
              onChange={(e) => handleChange('introVideo', e.target.value)}
              placeholder="YouTube or Vimeo URL"
            />
          </div>

          {/* Difficulty Level */}
          <div>
            <Label htmlFor="difficultyLevel">
              Difficulty Level <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.difficultyLevel} onValueChange={(value) => handleChange('difficultyLevel', value)}>
              <SelectTrigger className={errors.difficultyLevel ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficultyLevel && <p className="text-sm text-red-500 mt-1">{errors.difficultyLevel}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Target Students Section */}
      <Card>
        <CardHeader>
          <CardTitle>Target Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Age Groups */}
          <AgeGroupSelector
            selectedGroups={formData.ageGroups}
            onChange={(groups) => handleChange('ageGroups', groups)}
            error={errors.ageGroups}
          />

          {/* Student Types */}
          <div>
            <Label>
              Student Types <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              Select the types of students this course is designed for
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STUDENT_TYPES.map((type) => {
                const isSelected = formData.studentTypes.includes(type.value)
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      const newTypes = isSelected
                        ? formData.studentTypes.filter((t: string) => t !== type.value)
                        : [...formData.studentTypes, type.value]
                      handleChange('studentTypes', newTypes)
                    }}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                      ${errors.studentTypes ? 'border-red-300' : ''}
                    `}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                )
              })}
            </div>
            {errors.studentTypes && <p className="text-sm text-red-500 mt-2">{errors.studentTypes}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Learning Objectives */}
          <div>
            <Label>
              Learning Objectives <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2 mt-2">
              {formData.learningObjectives.map((objective: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateListItem('learningObjectives', index, e.target.value)}
                    placeholder={`Learning objective ${index + 1}`}
                  />
                  {formData.learningObjectives.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeListItem('learningObjectives', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addListItem('learningObjectives')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Objective
              </Button>
            </div>
            {errors.learningObjectives && <p className="text-sm text-red-500 mt-1">{errors.learningObjectives}</p>}
          </div>

          {/* Prerequisites */}
          <div>
            <Label>Prerequisites (Optional)</Label>
            <div className="space-y-2 mt-2">
              {formData.prerequisites.map((prerequisite: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={prerequisite}
                    onChange={(e) => updateListItem('prerequisites', index, e.target.value)}
                    placeholder={`Prerequisite ${index + 1}`}
                  />
                  {formData.prerequisites.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeListItem('prerequisites', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addListItem('prerequisites')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Prerequisite
              </Button>
            </div>
          </div>

          {/* Course Highlights */}
          <div>
            <Label>
              Course Highlights <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              Add 3-10 key features or benefits of this course (max 100 characters each)
            </p>
            <div className="space-y-3">
              {formData.highlights.map((highlight: CourseHighlight, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={highlight.text}
                        onChange={(e) => updateHighlight(index, 'text', e.target.value)}
                        placeholder={`Highlight ${index + 1}`}
                        maxLength={100}
                        className={errors[`highlight_${index}`] ? 'border-red-500' : ''}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {highlight.text.length}/100 characters
                      </p>
                      {errors[`highlight_${index}`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`highlight_${index}`]}</p>
                      )}
                    </div>
                    {formData.highlights.length > 3 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeHighlight(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {/* Icon Selector for this highlight */}
                  <div className="ml-2">
                    <IconSelector
                      selectedIcon={highlight.icon || undefined}
                      onSelect={(icon) => updateHighlight(index, 'icon', icon || '')}
                    />
                  </div>
                </div>
              ))}
              {formData.highlights.length < 10 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addHighlight}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Highlight
                </Button>
              )}
            </div>
            {errors.highlights && <p className="text-sm text-red-500 mt-2">{errors.highlights}</p>}
          </div>

          {/* Course Outcomes */}
          <div>
            <Label>
              Course Outcomes <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              What skills will students have after completing this course? (3-8 outcomes)
            </p>
            <div className="space-y-2">
              {formData.outcomes.map((outcome: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={outcome}
                    onChange={(e) => updateOutcome(index, e.target.value)}
                    placeholder={`Outcome ${index + 1}`}
                  />
                  {formData.outcomes.length > 3 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeOutcome(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {formData.outcomes.length < 8 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOutcome}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Outcome
                </Button>
              )}
            </div>
            {errors.outcomes && <p className="text-sm text-red-500 mt-2">{errors.outcomes}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={(newCategory) => {
          fetchCategories()
          handleChange('category', newCategory.slug)
          setIsCategoryModalOpen(false)
        }}
      />

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} size="lg">
          Save & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
