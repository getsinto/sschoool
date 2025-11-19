'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReportCard from '@/components/student/grades/ReportCard'

export default function GradeReportPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/grades/report')
      const data = await response.json()
      
      if (data.success) {
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/student/grades/report?format=pdf')
      const data = await response.json()
      
      if (data.success) {
        alert('PDF download functionality would be implemented here')
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Failed to load report</p>
          <Button onClick={() => router.push('/student/grades')} className="mt-4">
            Back to Grades
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/student/grades')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Grades
            </Button>
            <h1 className="text-xl font-bold">Grade Report</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button size="sm" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <ReportCard data={reportData} />
      </div>
    </div>
  )
}
