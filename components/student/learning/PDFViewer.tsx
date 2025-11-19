'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Download, Printer, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PDFViewerProps {
  documents: {
    id: string
    title: string
    url: string
    pages: number
  }[]
  lessonId: string
  allowDownload?: boolean
  allowPrint?: boolean
  onComplete: () => void
}

export default function PDFViewer({
  documents,
  lessonId,
  allowDownload = true,
  allowPrint = true,
  onComplete
}: PDFViewerProps) {
  const [currentDoc, setCurrentDoc] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [notes, setNotes] = useState<Record<number, string>>({})

  const doc = documents[currentDoc]

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < doc.pages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 50))
  }

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(p => p !== currentPage))
    } else {
      setBookmarks([...bookmarks, currentPage])
    }
  }

  const handleDownload = () => {
    // Trigger download
    window.open(doc.url, '_blank')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleFullscreen = () => {
    document.documentElement.requestFullscreen()
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Document Tabs */}
          {documents.length > 1 && (
            <Tabs value={currentDoc.toString()} onValueChange={(v) => setCurrentDoc(parseInt(v))}>
              <TabsList>
                {documents.map((d, i) => (
                  <TabsTrigger key={d.id} value={i.toString()}>
                    {d.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-48"
            />
          </div>

          {/* Zoom Controls */}
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">{zoom}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Actions */}
          {allowDownload && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}
          {allowPrint && (
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleFullscreen}>
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4">
        <div 
          className="bg-white shadow-lg mx-auto"
          style={{ 
            width: `${zoom}%`,
            minHeight: '800px'
          }}
        >
          {/* PDF rendering would go here - using iframe as placeholder */}
          <iframe
            src={`${doc.url}#page=${currentPage}`}
            className="w-full h-full min-h-[800px]"
            title={doc.title}
          />
        </div>
      </div>

      {/* Page Navigation */}
      <div className="bg-white border-t p-3 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={currentPage}
            onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)}
            className="w-16 text-center"
            min={1}
            max={doc.pages}
          />
          <span className="text-sm text-gray-600">of {doc.pages}</span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleBookmark}
          >
            {bookmarks.includes(currentPage) ? '★' : '☆'} Bookmark
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === doc.pages}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Mark Complete Button */}
      {currentPage === doc.pages && (
        <div className="bg-blue-50 border-t p-3 text-center">
          <Button onClick={onComplete}>
            Mark as Complete
          </Button>
        </div>
      )}
    </div>
  )
}
