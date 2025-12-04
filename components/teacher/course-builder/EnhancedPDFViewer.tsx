'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  Maximize,
  Minimize,
  Search,
  FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EnhancedPDFViewerProps {
  url: string
  fileName?: string
  allowDownload?: boolean
  allowPrint?: boolean
  showAnnotations?: boolean
  onAnnotate?: (annotation: any) => void
}

export function EnhancedPDFViewer({
  url,
  fileName = 'document.pdf',
  allowDownload = true,
  allowPrint = true,
  showAnnotations = false,
  onAnnotate
}: EnhancedPDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const viewerRef = useRef<HTMLDivElement>(null)

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  // Page navigation
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value)
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Rotation
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // Download
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print
  const handlePrint = () => {
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Search (placeholder - would need PDF.js for real implementation)
  const handleSearch = () => {
    console.log('Searching for:', searchQuery)
    // In a real implementation, this would use PDF.js to search within the PDF
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={handlePageInput}
                  className="w-16 text-center"
                />
                <span className="text-sm text-gray-600">/ {totalPages}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 border-l pl-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomReset}
              >
                {zoom}%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Rotation */}
            <div className="border-l pl-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 border-l pl-4 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search in document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSearch}
                disabled={!searchQuery}
              >
                Search
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l pl-4">
              {allowDownload && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              {allowPrint && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer */}
      <Card ref={viewerRef}>
        <CardContent className="p-0">
          <div className="relative bg-gray-100 min-h-[600px] flex items-center justify-center overflow-auto">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              </div>
            )}

            {/* PDF Embed */}
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.3s ease'
              }}
              className="w-full"
            >
              <iframe
                src={`${url}#page=${currentPage}`}
                className="w-full h-[600px] border-0"
                onLoad={() => setLoading(false)}
                title={fileName}
              />
            </div>

            {/* Annotations Overlay (if enabled) */}
            {showAnnotations && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Annotation markers would go here */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Bar */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
          <Badge variant="secondary">
            Page {currentPage} of {totalPages}
          </Badge>
          <Badge variant="secondary">
            {zoom}% zoom
          </Badge>
          {rotation > 0 && (
            <Badge variant="secondary">
              {rotation}° rotated
            </Badge>
          )}
        </div>

        {showAnnotations && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAnnotate?.({ page: currentPage, type: 'note' })}
          >
            Add Annotation
          </Button>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Keyboard Shortcuts:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800">
            <div><kbd className="px-2 py-1 bg-white rounded">←</kbd> Previous page</div>
            <div><kbd className="px-2 py-1 bg-white rounded">→</kbd> Next page</div>
            <div><kbd className="px-2 py-1 bg-white rounded">+</kbd> Zoom in</div>
            <div><kbd className="px-2 py-1 bg-white rounded">-</kbd> Zoom out</div>
            <div><kbd className="px-2 py-1 bg-white rounded">R</kbd> Rotate</div>
            <div><kbd className="px-2 py-1 bg-white rounded">F</kbd> Fullscreen</div>
            <div><kbd className="px-2 py-1 bg-white rounded">Ctrl+F</kbd> Search</div>
            <div><kbd className="px-2 py-1 bg-white rounded">Ctrl+P</kbd> Print</div>
          </div>
        </CardContent>
      </Card>

      {/* Note about PDF.js */}
      <div className="text-xs text-gray-500 text-center">
        <p>
          Note: For full PDF functionality including text search and annotations, 
          integrate <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PDF.js</a> library.
        </p>
      </div>
    </div>
  )
}

// Simplified version for quick preview
export function SimplePDFViewer({ url, fileName }: { url: string; fileName?: string }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <iframe
            src={url}
            className="w-full h-[600px] border-0"
            title={fileName || 'PDF Document'}
          />
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{fileName || 'Document'}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.open(url, '_blank')}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  )
}
