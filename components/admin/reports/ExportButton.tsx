'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ExportButtonProps {
  reportType: string
  data?: any
  filters?: any
  onExport?: (format: string, data: any) => Promise<void>
  className?: string
}

type ExportFormat = 'pdf' | 'excel' | 'csv'

interface ExportStatus {
  format: ExportFormat | null
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  downloadUrl?: string
}

export default function ExportButton({ 
  reportType, 
  data, 
  filters, 
  onExport,
  className = '' 
}: ExportButtonProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    format: null,
    status: 'idle'
  })
  const [showDropdown, setShowDropdown] = useState(false)

  const exportFormats = [
    {
      format: 'pdf' as ExportFormat,
      label: 'PDF Report',
      icon: FileText,
      description: 'Formatted report with charts and tables'
    },
    {
      format: 'excel' as ExportFormat,
      label: 'Excel Spreadsheet',
      icon: FileSpreadsheet,
      description: 'Raw data in Excel format for analysis'
    },
    {
      format: 'csv' as ExportFormat,
      label: 'CSV Data',
      icon: File,
      description: 'Comma-separated values for data processing'
    }
  ]

  const handleExport = async (format: ExportFormat) => {
    setExportStatus({ format, status: 'loading' })
    setShowDropdown(false)

    try {
      if (onExport) {
        await onExport(format, { data, filters, reportType })
      } else {
        // Default export behavior
        await defaultExport(format)
      }

      setExportStatus({
        format,
        status: 'success',
        message: `${format.toUpperCase()} report generated successfully`,
        downloadUrl: `/reports/exports/${reportType}-${Date.now()}.${format}`
      })

      // Reset status after 3 seconds
      setTimeout(() => {
        setExportStatus({ format: null, status: 'idle' })
      }, 3000)
    } catch (error) {
      setExportStatus({
        format,
        status: 'error',
        message: `Failed to generate ${format.toUpperCase()} report`
      })

      // Reset status after 5 seconds
      setTimeout(() => {
        setExportStatus({ format: null, status: 'idle' })
      }, 5000)
    }
  }

  const defaultExport = async (format: ExportFormat) => {
    // Simulate API call
    const response = await fetch(`/api/admin/reports/${reportType}?format=${format}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, filters })
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    // In real app, trigger download
    if (result.downloadUrl) {
      const link = document.createElement('a')
      link.href = result.downloadUrl
      link.download = result.fileName || `${reportType}-report.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getStatusIcon = () => {
    switch (exportStatus.status) {
      case 'loading':
        return <Loader2 className=\"w-4 h-4 animate-spin\" />
      case 'success':
        return <CheckCircle className=\"w-4 h-4 text-green-600\" />
      case 'error':
        return <AlertCircle className=\"w-4 h-4 text-red-600\" />
      default:
        return <Download className=\"w-4 h-4\" />
    }
  }

  const getButtonText = () => {
    if (exportStatus.status === 'loading') {
      return `Generating ${exportStatus.format?.toUpperCase()}...`
    }
    if (exportStatus.status === 'success') {
      return 'Export Complete'
    }
    if (exportStatus.status === 'error') {
      return 'Export Failed'
    }
    return 'Export Report'
  }

  const getButtonVariant = () => {
    if (exportStatus.status === 'success') return 'default'
    if (exportStatus.status === 'error') return 'destructive'
    return 'outline'
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant={getButtonVariant()}
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={exportStatus.status === 'loading'}
        className=\"relative\"
      >
        {getStatusIcon()}
        <span className=\"ml-2\">{getButtonText()}</span>
      </Button>

      {/* Export Status Message */}
      {exportStatus.message && (
        <div className=\"absolute top-full left-0 mt-2 z-50\">
          <div className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${
            exportStatus.status === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {exportStatus.message}
          </div>
        </div>
      )}

      {/* Export Format Dropdown */}
      {showDropdown && exportStatus.status === 'idle' && (
        <div className=\"absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50\">
          <div className=\"p-4\">
            <h3 className=\"font-medium text-gray-900 mb-3\">Choose Export Format</h3>
            <div className=\"space-y-2\">
              {exportFormats.map(({ format, label, icon: Icon, description }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className=\"w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left\"
                >
                  <Icon className=\"w-5 h-5 text-gray-500 mt-0.5\" />
                  <div className=\"flex-1\">
                    <div className=\"flex items-center justify-between mb-1\">
                      <span className=\"font-medium text-gray-900\">{label}</span>
                      <Badge variant=\"outline\" className=\"text-xs\">
                        {format.toUpperCase()}
                      </Badge>
                    </div>
                    <p className=\"text-sm text-gray-600\">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className=\"border-t p-3 bg-gray-50 rounded-b-lg\">
            <p className=\"text-xs text-gray-500\">
              Reports include current filters and date range. Large datasets may take a few moments to generate.
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div 
          className=\"fixed inset-0 z-40\" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}