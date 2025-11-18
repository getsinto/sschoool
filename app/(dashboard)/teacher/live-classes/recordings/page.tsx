'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  Grid3x3,
  List,
  Play,
  Download,
  Share2,
  Edit,
  Trash2,
  Upload,
  CheckSquare
} from 'lucide-react'
import Link from 'next/link'
import { RecordingPlayer } from '@/components/teacher/live-classes/RecordingPlayer'

// Mock data
const mockRecordings = [
  {
    id: 'rec-1',
    title: 'Advanced Mathematics - Calculus',
    course: 'Grade 10 Mathematics',
    courseId: 'course-1',
    date: '2024-01-18T16:00:00',
    duration: 3600,
    size: 524288000,
    views: 15,
    thumbnailUrl: '/thumbnails/rec-1.jpg',
    videoUrl: '/recordings/rec-1.mp4',
    status: 'ready',
    published: false
  },
  {
    id: 'rec-2',
    title: 'Physics Lab Discussion',
    course: 'Grade 9 Physics',
    courseId: 'course-2',
    date: '2024-01-17T14:30:00',
    duration: 5400,
    size: 786432000,
    views: 23,
    thumbnailUrl: '/thumbnails/rec-2.jpg',
    videoUrl: '/recordings/rec-2.mp4',
    status: 'ready',
    published: true
  },
  {
    id: 'rec-3',
    title: 'English Literature Review',
    course: 'Grade 8 English',
    courseId: 'course-3',
    date: '2024-01-16T10:00:00',
    duration: 2700,
    size: 393216000,
    views: 18,
    thumbnailUrl: '/thumbnails/rec-3.jpg',
    videoUrl: '/recordings/rec-3.mp4',
    status: 'processing',
    published: false
  }
]

export default function RecordingsLibraryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([])
  const [showPlayer, setShowPlayer] = useState(false)
  const [currentRecording, setCurrentRecording] = useState<any>(null)

  const filteredRecordings = mockRecordings.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = filterCourse === 'all' || rec.courseId === filterCourse
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus
    return matchesSearch && matchesCourse && matchesStatus
  })

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const toggleSelection = (id: string) => {
    setSelectedRecordings(prev =>
      prev.includes(id) ? prev.filter(recId => recId !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedRecordings.length === filteredRecordings.length) {
      setSelectedRecordings([])
    } else {
      setSelectedRecordings(filteredRecordings.map(rec => rec.id))
    }
  }

  const handleBatchPublish = () => {
    alert(`Publishing ${selectedRecordings.length} recordings`)
    setSelectedRecordings([])
  }

  const handleBatchDelete = () => {
    if (confirm(`Delete ${selectedRecordings.length} recordings?`)) {
      alert('Recordings deleted')
      setSelectedRecordings([])
    }
  }

  const handlePlayRecording = (recording: any) => {
    setCurrentRecording(recording)
    setShowPlayer(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Recordings</h1>
          <p className="text-gray-600 mt-1">Manage and publish your class recordings</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Recording
        </Button>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search recordings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Course Filter */}
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="course-1">Grade 10 Mathematics</SelectItem>
                <SelectItem value="course-2">Grade 9 Physics</SelectItem>
                <SelectItem value="course-3">Grade 8 English</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Batch Actions */}
          {selectedRecordings.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t">
              <Checkbox
                checked={selectedRecordings.length === filteredRecordings.length}
                onCheckedChange={selectAll}
              />
              <span className="text-sm text-gray-600">
                {selectedRecordings.length} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleBatchPublish}>
                  <Upload className="w-4 h-4 mr-2" />
                  Publish to Course
                </Button>
                <Button variant="outline" size="sm" onClick={handleBatchDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recordings Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((recording) => (
            <Card key={recording.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  {recording.thumbnailUrl ? (
                    <img
                      src={recording.thumbnailUrl}
                      alt={recording.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedRecordings.includes(recording.id)}
                    onCheckedChange={() => toggleSelection(recording.id)}
                    className="bg-white"
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(recording.status)}>
                    {recording.status}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-black/70 text-white">
                    {formatDuration(recording.duration)}
                  </Badge>
                </div>
                {recording.status === 'ready' && (
                  <button
                    onClick={() => handlePlayRecording(recording)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-16 h-16 text-white" />
                  </button>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{recording.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{recording.course}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{new Date(recording.date).toLocaleDateString()}</span>
                  <span>{formatFileSize(recording.size)}</span>
                  <span>{recording.views} views</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>

                {!recording.published && recording.status === 'ready' && (
                  <Button className="w-full mt-2" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Publish to Course
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-3 px-4">
                      <Checkbox
                        checked={selectedRecordings.length === filteredRecordings.length}
                        onCheckedChange={selectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Views</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecordings.map((recording) => (
                    <tr key={recording.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedRecordings.includes(recording.id)}
                          onCheckedChange={() => toggleSelection(recording.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{recording.title}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{recording.course}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(recording.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDuration(recording.duration)}</td>
                      <td className="py-3 px-4 text-gray-600">{formatFileSize(recording.size)}</td>
                      <td className="py-3 px-4 text-gray-600">{recording.views}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(recording.status)}>
                          {recording.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {recording.status === 'ready' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePlayRecording(recording)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredRecordings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recordings found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCourse !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Upload your first recording to get started'}
            </p>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Recording
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recording Player Modal */}
      {showPlayer && currentRecording && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{currentRecording.title}</h2>
              <Button variant="ghost" onClick={() => setShowPlayer(false)} className="text-white">
                Close
              </Button>
            </div>
            <RecordingPlayer
              videoUrl={currentRecording.videoUrl}
              title={currentRecording.title}
              duration={currentRecording.duration}
              thumbnailUrl={currentRecording.thumbnailUrl}
              onDownload={() => alert('Download recording')}
              onShare={() => alert('Share recording')}
            />
          </div>
        </div>
      )}
    </div>
  )
}
