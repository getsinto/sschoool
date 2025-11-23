'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, BookOpen, Video, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export default function CourseBuilderPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Builder</h1>
        <p className="text-gray-600 mt-1">Create and manage your course content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/teacher/courses/create">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-blue-600" />
                Create New Course
              </CardTitle>
              <CardDescription>Start building a new course from scratch</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Get Started</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/teacher/courses/templates">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Course Templates
              </CardTitle>
              <CardDescription>Use pre-built templates to speed up creation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Browse Templates</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/teacher/courses/import">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                Import Content
              </CardTitle>
              <CardDescription>Import existing course materials</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Import</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}