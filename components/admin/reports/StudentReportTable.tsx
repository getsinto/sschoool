'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface Student {
  id: string
  name: string
  grade: string
  coursesEnrolled: number
  completionRate: number
  averageScore: number
  status: 'active' | 'inactive'
}

interface StudentReportTableProps {
  students: Student[]
  onViewDetails: (id: string) => void
}

export default function StudentReportTable({ students, onViewDetails }: StudentReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Grade</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Courses</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Completion</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Avg Score</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
              <td className="px-4 py-3 text-sm">{student.grade}</td>
              <td className="px-4 py-3 text-sm">{student.coursesEnrolled}</td>
              <td className="px-4 py-3 text-sm">
                <Badge className={student.completionRate >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {student.completionRate}%
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm font-medium">{student.averageScore}%</td>
              <td className="px-4 py-3 text-sm">
                <Badge className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {student.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm">
                <Button size="sm" variant="ghost" onClick={() => onViewDetails(student.id)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
