'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  Plus,
  Star,
  Users,
  DollarSign,
  Settings,
  BookOpen,
  AlertCircle
} from 'lucide-react'

interface Teacher {
  id: string
  name: string
  email: string
  avatar?: string
}

interface CourseData {
  id: string
  title: string
  description: string
  thumbnail: string
  category: string
  grade: string
  subject: string
  teacherId: string
  price: number
  originalPrice?: number
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  enrollmentLimit?: number
  tags: string[]
}

// Mock teachers data
const mockTeachers: Teacher[] = [
  { id: 't1', name: 'Dr. Sarah Johnson', email: 'sarah@school.com', avatar: '/api/placeholder/40/40' },
  { id: 't2', name: 'Prof. Michael Brown', email: 'michael@school.com', avatar: '/api/placeholder/40/40' },
  { id: 't3', name: 'James Thompson', email: 'james@school.com', avatar: '/api/placeholder/40/40' },
  { id: 't4', name: 'Dr. Jennifer Lee', email: 'jennifer@school.com', avatar: '/api/placeholder/40/40' },
  { id: 't5', name: 'Dr. Emily Chen', email: 'emily@school.com', avatar: '/api/placeholder/40/40' }
]

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [courseData, setCourseData] = useState<CourseData>({
    id: '',
    title: '',
    description: '',
    thumbnail: '',
    category: 'online-school',
    grade: 'Grade 10',
    subject: 'Mathematics',
    teacherId: '',
    price: 0,
    status: 'draft',
    featured: false,
    tags: []
  })
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Simulate loading course data
    setTimeout(() => {
      setCourseData({
        id: params.id as string,
        title: 'Mathematics Grade 10 - Advanced Algebra',
        description: 'Comprehensive course covering advanced algebraic concepts including quadratic equations, polynomials, and functions.',
        thumbnail: '/api/placeholder/400/250',
        category: 'online-school',
        grade: 'Grade 10',
        subject: 'Mathematics',
        teacherId: 't1',
        price: 299,
        originalPrice: 399,
        status: 'published',
        featured: true,
        enrollmentLimit: 500,
        tags: ['algebra', 'mathematics', 'grade-10']
      })
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const handleInputChange = (field: keyof CourseData, value: any) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!courseData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!courseData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!courseData.teacherId) {
      newErrors.teacherId = 'Teacher must be assigned'
    }
    if (courseData.price < 0) {
      newErrors.price = 'Price must be positive'
    }
    if (courseData.enrollmentLimit && courseData.enrollmentLimit < 1) {
      newErrors.enrollmentLimit = 'Enrollment limit must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (publish: boolean = false) => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const updatedData = {
        ...courseData,
        status: publish ? 'published' : courseData.status
      }

      console.log('Saving course:', updatedData)
      
      // In real app, call API
      // await fetch(`/api/admin/courses/${params.id}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify(updatedData)
      // })

      router.push(`/dashboard/admin/courses/${params.id}`)
    } catch (error) {
      console.error('Error saving course:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAssignTeacher = async (teacherId: string) => {
    try {
      // Call assign teacher API
      // await fetch(`/api/admin/courses/${params.id}/assign-teacher`, {
      //   method: 'POST',
      //   body: JSON.stringify({ teacherId })
      // })
      
      handleInputChange('teacherId', teacherId)
    } catch (error) {
      console.error('Error assigning teacher:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const selectedTeacher = mockTeachers.find(t => t.id === courseData.teacherId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
            <p className="text-gray-600 mt-1">Update course information and settings</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => router.push(`/dashboard/admin/courses/${params.id}`)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? 'Saving...' : 'Save & Publish'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={courseData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter course title"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={courseData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter course description"
                      rows={5}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                    )}
                  </div>

                  {/* Category, Grade, Subject */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={courseData.category} 
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online-school">Online School</SelectItem>
                          <SelectItem value="spoken-english">Spoken English</SelectItem>
                          <SelectItem value="tuition">Tuition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="grade">Grade Level</Label>
                      <Select 
                        value={courseData.grade} 
                        onValueChange={(value) => handleInputChange('grade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Grade 5">Grade 5</SelectItem>
                          <SelectItem value="Grade 6">Grade 6</SelectItem>
                          <SelectItem value="Grade 7">Grade 7</SelectItem>
                          <SelectItem value="Grade 8">Grade 8</SelectItem>
                          <SelectItem value="Grade 9">Grade 9</SelectItem>
                          <SelectItem value="Grade 10">Grade 10</SelectItem>
                          <SelectItem value="Grade 11">Grade 11</SelectItem>
                          <SelectItem value="Grade 12">Grade 12</SelectItem>
                          <SelectItem value="All Levels">All Levels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select 
                        value={courseData.subject} 
                        onValueChange={(value) => handleInputChange('subject', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Geography">Geography</SelectItem>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <Label>Course Thumbnail</Label>
                    <div className="mt-2">
                      {courseData.thumbnail ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                          <img
                            src={courseData.thumbnail}
                            alt="Course thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => handleInputChange('thumbnail', '')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                          <Button variant="outline" className="mt-4">
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Tags</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button onClick={handleAddTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {courseData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {courseData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-sm">
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Course Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={courseData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className={errors.price ? 'border-red-500' : ''}
                      />
                      {errors.price && (
                        <p className="text-sm text-red-600 mt-1">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="originalPrice">Original Price ($)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={courseData.originalPrice || ''}
                        onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || undefined)}
                        min="0"
                        step="0.01"
                        placeholder="Optional"
                      />
                      <p className="text-sm text-gray-500 mt-1">Show discount if set</p>
                    </div>
                  </div>

                  {/* Price Preview */}
                  {courseData.originalPrice && courseData.originalPrice > courseData.price && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Students will see:</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-2xl font-bold text-green-600">
                              ${courseData.price}
                            </span>
                            <span className="text-lg text-gray-500 line-through">
                              ${courseData.originalPrice}
                            </span>
                            <Badge className="bg-green-600">
                              {Math.round((1 - courseData.price / courseData.originalPrice) * 100)}% OFF
                            </Badge>
                          </div>
                        </div>
                        <DollarSign className="w-12 h-12 text-green-600" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Featured Course */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">Featured Course</h4>
                        <p className="text-sm text-gray-600">
                          Display this course prominently on the homepage
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={courseData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                  </div>

                  {/* Enrollment Limit */}
                  <div>
                    <Label htmlFor="enrollmentLimit">Enrollment Limit</Label>
                    <Input
                      id="enrollmentLimit"
                      type="number"
                      value={courseData.enrollmentLimit || ''}
                      onChange={(e) => handleInputChange('enrollmentLimit', parseInt(e.target.value) || undefined)}
                      min="1"
                      placeholder="Unlimited"
                      className={errors.enrollmentLimit ? 'border-red-500' : ''}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Leave empty for unlimited enrollments
                    </p>
                    {errors.enrollmentLimit && (
                      <p className="text-sm text-red-600 mt-1">{errors.enrollmentLimit}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="status">Course Status</Label>
                    <Select 
                      value={courseData.status} 
                      onValueChange={(value: any) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Teacher & Quick Actions */}
        <div className="space-y-6">
          {/* Assigned Teacher */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Teacher</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTeacher ? (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedTeacher.avatar ? (
                      <img 
                        src={selectedTeacher.avatar} 
                        alt={selectedTeacher.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg text-gray-500">
                        {selectedTeacher.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{selectedTeacher.name}</h4>
                    <p className="text-sm text-gray-600">{selectedTeacher.email}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">No teacher assigned</p>
                </div>
              )}

              <div>
                <Label>Change Teacher</Label>
                <Select 
                  value={courseData.teacherId} 
                  onValueChange={handleAssignTeacher}
                >
                  <SelectTrigger className={errors.teacherId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.teacherId && (
                  <p className="text-sm text-red-600 mt-1">{errors.teacherId}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Course Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={
                  courseData.status === 'published' ? 'bg-green-100 text-green-800' :
                  courseData.status === 'draft' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {courseData.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Featured</span>
                <Badge className={courseData.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                  {courseData.featured ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price</span>
                <span className="font-medium">${courseData.price}</span>
              </div>
              {courseData.enrollmentLimit && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Enrollment Limit</span>
                  <span className="font-medium">{courseData.enrollmentLimit}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Learn more about course management and best practices.
              </p>
              <Button variant="outline" className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
