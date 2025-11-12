'use client'

import { useState } from 'react'
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

interface BasicInfoFormProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
}

export function BasicInfoForm({ data, onUpdate, onNext }: BasicInfoFormProps) {
  const [formData, setFormData] = useState({
    title: data.title || '',
    shortDescription: data.shortDescription || '',
    fullDescription: data.fullDescription || '',
    category: data.category || '',
    grade: data.grade || '',
    subject: data.subject || '',
    thumbnail: data.thumbnail || null,
    introVideo: data.introVideo || '',
    learningObjectives: data.learningObjectives || [''],
    prerequisites: data.prerequisites || [''],
    difficultyLevel: data.difficultyLevel || ''
  })

  const [errors, setErrors] = useState<any>({})

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
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required'
    if (formData.shortDescription.length > 150) newErrors.shortDescription = 'Short description must be 150 characters or less'
    if (!formData.fullDescription.trim()) newErrors.fullDescription = 'Full description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.grade) newErrors.grade = 'Grade/Level is required'
    if (!formData.subject) newErrors.subject = 'Subject is required'
    if (!formData.thumbnail) newErrors.thumbnail = 'Course thumbnail is required'
    if (!formData.difficultyLevel) newErrors.difficultyLevel = 'Difficulty level is required'
    
    const validObjectives = formData.learningObjectives.filter((obj: string) => obj.trim())
    if (validObjectives.length === 0) newErrors.learningObjectives = 'At least one learning objective is required'

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
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online-school">Online School</SelectItem>
                  <SelectItem value="spoken-english">Spoken English</SelectItem>
                  <SelectItem value="tuition">Tuition</SelectItem>
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
                  <SelectItem value="grade-1">Grade 1</SelectItem>
                  <SelectItem value="grade-2">Grade 2</SelectItem>
                  <SelectItem value="grade-3">Grade 3</SelectItem>
                  <SelectItem value="grade-4">Grade 4</SelectItem>
                  <SelectItem value="grade-5">Grade 5</SelectItem>
                  <SelectItem value="grade-6">Grade 6</SelectItem>
                  <SelectItem value="grade-7">Grade 7</SelectItem>
                  <SelectItem value="grade-8">Grade 8</SelectItem>
                  <SelectItem value="grade-9">Grade 9</SelectItem>
                  <SelectItem value="grade-10">Grade 10</SelectItem>
                  <SelectItem value="grade-11">Grade 11</SelectItem>
                  <SelectItem value="grade-12">Grade 12</SelectItem>
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
        </CardContent>
      </Card>

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
