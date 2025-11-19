'use client'

import { Card, CardContent } from '@/components/ui/card'

interface ReportCardProps {
  data: {
    student: {
      name: string
      id: string
      email: string
      program: string
    }
    term: {
      name: string
      startDate: string
      endDate: string
    }
    overall: {
      gpa: number
      credits: number
      gradePoints: number
    }
    courses: Array<{
      code: string
      name: string
      instructor: string
      credits: number
      grade: string
      gradePoints: number
      percentage: number
    }>
    summary: {
      totalCourses: number
      completedCredits: number
      cumulativeGPA: number
      termGPA: number
      academicStanding: string
    }
  }
}

export default function ReportCard({ data }: ReportCardProps) {
  return (
    <Card className="print:shadow-none print:border-2">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 pb-6">
          <h1 className="text-3xl font-bold mb-2">Academic Report Card</h1>
          <p className="text-gray-600">{data.term.name}</p>
          <p className="text-sm text-gray-500">
            {new Date(data.term.startDate).toLocaleDateString()} - {new Date(data.term.endDate).toLocaleDateString()}
          </p>
        </div>

        {/* Student Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Student Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{data.student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Student ID</p>
              <p className="font-medium">{data.student.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{data.student.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Program</p>
              <p className="font-medium">{data.student.program}</p>
            </div>
          </div>
        </div>

        {/* Course Grades */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Course Grades</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-2 px-4">Course Code</th>
                  <th className="text-left py-2 px-4">Course Name</th>
                  <th className="text-left py-2 px-4">Instructor</th>
                  <th className="text-center py-2 px-4">Credits</th>
                  <th className="text-center py-2 px-4">Grade</th>
                  <th className="text-center py-2 px-4">%</th>
                  <th className="text-center py-2 px-4">Grade Points</th>
                </tr>
              </thead>
              <tbody>
                {data.courses.map((course, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4 font-medium">{course.code}</td>
                    <td className="py-3 px-4">{course.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{course.instructor}</td>
                    <td className="py-3 px-4 text-center">{course.credits}</td>
                    <td className="py-3 px-4 text-center font-bold">{course.grade}</td>
                    <td className="py-3 px-4 text-center">{course.percentage}%</td>
                    <td className="py-3 px-4 text-center">{course.gradePoints.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t-2 pt-6">
          <h2 className="text-xl font-bold mb-4">Academic Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Term GPA</p>
              <p className="text-3xl font-bold text-blue-600">{data.summary.termGPA.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Cumulative GPA</p>
              <p className="text-3xl font-bold text-green-600">{data.summary.cumulativeGPA.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Credits Earned</p>
              <p className="text-3xl font-bold text-purple-600">{data.summary.completedCredits}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Courses Completed</p>
              <p className="text-3xl font-bold">{data.summary.totalCourses}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg col-span-2">
              <p className="text-sm text-gray-600 mb-1">Academic Standing</p>
              <p className="text-2xl font-bold text-green-600">{data.summary.academicStanding}</p>
            </div>
          </div>
        </div>

        {/* Grade Scale */}
        <div className="mt-8 border-t pt-6">
          <h3 className="font-bold mb-3">Grading Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div className="flex justify-between">
              <span>A (4.0)</span>
              <span className="text-gray-600">90-100%</span>
            </div>
            <div className="flex justify-between">
              <span>B (3.0)</span>
              <span className="text-gray-600">80-89%</span>
            </div>
            <div className="flex justify-between">
              <span>C (2.0)</span>
              <span className="text-gray-600">70-79%</span>
            </div>
            <div className="flex justify-between">
              <span>D (1.0)</span>
              <span className="text-gray-600">60-69%</span>
            </div>
            <div className="flex justify-between">
              <span>F (0.0)</span>
              <span className="text-gray-600">0-59%</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
          <p>This is an official academic transcript</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
