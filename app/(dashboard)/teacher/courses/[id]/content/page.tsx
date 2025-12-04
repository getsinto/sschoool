'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Video,
  Link as LinkIcon,
  Save,
  X,
  Upload,
  PlayCircle,
  FileQuestion,
  ClipboardList
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface ContentItem {
  id: string
  title: string
  type: 'lesson' | 'assignment' | 'quiz' | 'resource'
  description: string
  order: number
  status: 'draft' | 'published'
  duration?: string
  points?: number
  createdAt: string
  updatedAt: string
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  items: ContentItem[]
}

interface Course {
  id: string
  title: string
  description: string
  status: string
}

interface UserPermissions {
  can_manage_content: boolean
  can_grade: boolean
  can_communicate: boolean
  is_primary_teacher: boolean
}

// Mock data
const mockCourse: Course = {
  id: '1',
  title: 'Advanced Mathematics',
  description: 'Comprehensive mathematics course',
  status: 'published'
}

const mockModules: Module[] = [
  {
    id: '1',
    title: 'Introduction to Calculus',
    description: 'Basic concepts and fundamentals',
    order: 1,
    items: [
      {
        id: '1',
        title: 'Welcome to Calculus',
        type: 'lesson',
        description: 'Introduction video and course overview',
        order: 1,
        status: 'published',
        duration: '15 min',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-05'
      },
      {
        id: '2',
        title: 'Limits and Continuity Quiz',
        type: 'quiz',
        description: 'Test your understanding of limits',
        order: 2,
        status: 'draft',
        points: 100,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-06'
      }
    ]
  },
  {
    id: '2',
    title: 'Derivatives',
    description: 'Understanding rates of change',
    order: 2,
    items: [
      {
        id: '3',
        title: 'Derivative Rules Assignment',
        type: 'assignment',
        description: 'Practice derivative calculations',
        order: 1,
        status: 'published',
        points: 50,
        createdAt: '2024-01-03',
        updatedAt: '2024-01-07'
      }
    ]
  }
]

export default function CourseContentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [permissions, setPermissions] = useState<UserPermissions>({
    can_manage_content: false,
    can_grade: false,
    can_communicate: false,
    is_primary_teacher: false
  })
  const [permissionLoading, setPermissionLoading] = useState(true)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      checkPermissions()
      fetchContent()
    }
  }, [id])

  const checkPermissions = async () => {
    try {
      setPermissionLoading(true)
      setPermissionError(null)
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/teacher/courses/${id}/permissions`)
      // const data = await response.json()
      
      // Mock permissions for now
      setTimeout(() => {
        setPermissions({
          can_manage_content: true,
          can_grade: true,
          can_communicate: true,
          is_primary_teacher: true
        })
        setPermissionLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error checking permissions:', error)
      setPermissionError('Failed to check permissions. Please try again.')
      setPermissionLoading(false)
    }
  }

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/teacher/courses/${id}/content`)
      // const data = await response.json()
      
      // Mock data for now
      setTimeout(() => {
        setCourse(mockCourse)
        setModules(mockModules)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching content:', error)
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <Video className="w-4 h-4" />
      case 'assignment':
        return <FileText className="w-4 h-4" />
      case 'quiz':
        return <FileQuestion className="w-4 h-4" />
      case 'resource':
        return <LinkIcon className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'assignment':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'quiz':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'resource':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const PermissionDeniedView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/teacher/courses/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Course Content</h1>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Content Management Access Denied
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You don't have permission to manage content for this course. 
            Only teachers with content management permissions can edit course materials.
          </p>
          <div className="flex justify-center gap-3">
            <Link href={`/teacher/courses/${id}`}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Course Details
              </Button>
            </Link>
            <Link href="/teacher/courses">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Courses
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Need content management access? Contact your administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (permissionLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!permissions.can_manage_content) {
    return <PermissionDeniedView />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/teacher/courses/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Course Content</h1>
            <p className="text-gray-600 mt-1">
              {course?.title}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>
          
          <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Module</DialogTitle>
                <DialogDescription>
                  Create a new module to organize your course content.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Module Title</label>
                  <Input placeholder="Enter module title" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Enter module description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModuleDialogOpen(false)}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Module
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Permission Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Content Management Enabled
            </span>
            <Badge className="bg-green-100 text-green-800">Full Access</Badge>
            {permissions.is_primary_teacher && (
              <Badge className="bg-blue-100 text-blue-800 ml-2">Primary Teacher</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="details">Course Details (Read-Only)</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 mt-6">
          {/* Content Modules */}
          {modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {module.title}
                      {isEditMode && (
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  </div>
                  {isEditMode && (
                    <div className="flex gap-2">
                      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Content Item</DialogTitle>
                            <DialogDescription>
                              Add a lesson, assignment, quiz, or resource to this module.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Content Type</label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="lesson">
                                    <div className="flex items-center gap-2">
                                      <Video className="w-4 h-4" />
                                      Lesson
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="assignment">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      Assignment
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="quiz">
                                    <div className="flex items-center gap-2">
                                      <FileQuestion className="w-4 h-4" />
                                      Quiz
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="resource">
                                    <div className="flex items-center gap-2">
                                      <LinkIcon className="w-4 h-4" />
                                      Resource
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Title</label>
                              <Input placeholder="Enter content title" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Description</label>
                              <Textarea placeholder="Enter content description" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={() => setIsItemDialogOpen(false)}>
                              <Save className="w-4 h-4 mr-2" />
                              Create Item
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {module.items.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${getTypeColor(item.type)}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            <Badge 
                              className={`text-xs ${
                                item.status === 'published' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {item.status}
                            </Badge>
                            {item.duration && (
                              <span className="text-xs text-gray-500">{item.duration}</span>
                            )}
                            {item.points && (
                              <span className="text-xs text-gray-500">{item.points} points</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {isEditMode && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {module.items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm">No content items in this module</p>
                      {isEditMode && (
                        <Button variant="outline" size="sm" className="mt-3">
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Item
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {modules.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Modules Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start building your course by adding modules and content.
                </p>
                <Button onClick={() => setIsModuleDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Module
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Course Details
                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                  <Lock className="w-3 h-3 mr-1" />
                  Read Only
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Course details are read-only
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Only administrators can modify course title, description, price, and status. 
                        Contact an admin if changes are needed.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Course Title</label>
                  <Input value={course?.title} disabled className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Textarea value={course?.description} disabled className="mt-1" rows={4} />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Input value={course?.status} disabled className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Student management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analytics features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
