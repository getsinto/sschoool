'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Upload, FileVideo } from 'lucide-react'
import { VideoQualityOptions, VideoSubtitle, VideoChapter } from '@/types/lesson'

interface VideoEnhancementsFormProps {
  qualityOptions?: VideoQualityOptions
  subtitles?: VideoSubtitle[]
  chapters?: VideoChapter[]
  onQualityChange: (options: VideoQualityOptions) => void
  onSubtitlesChange: (subtitles: VideoSubtitle[]) => void
  onChaptersChange: (chapters: VideoChapter[]) => void
}

export function VideoEnhancementsForm({
  qualityOptions = {},
  subtitles = [],
  chapters = [],
  onQualityChange,
  onSubtitlesChange,
  onChaptersChange
}: VideoEnhancementsFormProps) {
  const [activeTab, setActiveTab] = useState<'quality' | 'subtitles' | 'chapters'>('quality')

  // Quality Options State
  const [qualities, setQualities] = useState<VideoQualityOptions>(qualityOptions)

  // Subtitles State
  const [subtitleList, setSubtitleList] = useState<VideoSubtitle[]>(subtitles)

  // Chapters State
  const [chapterList, setChapterList] = useState<VideoChapter[]>(chapters)

  // Handle quality URL change
  const handleQualityChange = (quality: keyof VideoQualityOptions, url: string) => {
    const updated = { ...qualities, [quality]: url || null }
    setQualities(updated)
    onQualityChange(updated)
  }

  // Add subtitle
  const addSubtitle = () => {
    const newSubtitle: VideoSubtitle = {
      language: 'en',
      label: 'English',
      url: '',
      is_default: subtitleList.length === 0
    }
    const updated = [...subtitleList, newSubtitle]
    setSubtitleList(updated)
    onSubtitlesChange(updated)
  }

  // Update subtitle
  const updateSubtitle = (index: number, updates: Partial<VideoSubtitle>) => {
    const updated = subtitleList.map((sub, i) =>
      i === index ? { ...sub, ...updates } : sub
    )
    setSubtitleList(updated)
    onSubtitlesChange(updated)
  }

  // Remove subtitle
  const removeSubtitle = (index: number) => {
    const updated = subtitleList.filter((_, i) => i !== index)
    setSubtitleList(updated)
    onSubtitlesChange(updated)
  }

  // Add chapter
  const addChapter = () => {
    const newChapter: VideoChapter = {
      time: '00:00:00',
      title: '',
      description: ''
    }
    const updated = [...chapterList, newChapter]
    setChapterList(updated)
    onChaptersChange(updated)
  }

  // Update chapter
  const updateChapter = (index: number, updates: Partial<VideoChapter>) => {
    const updated = chapterList.map((ch, i) =>
      i === index ? { ...ch, ...updates } : ch
    )
    setChapterList(updated)
    onChaptersChange(updated)
  }

  // Remove chapter
  const removeChapter = (index: number) => {
    const updated = chapterList.filter((_, i) => i !== index)
    setChapterList(updated)
    onChaptersChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab('quality')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'quality'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quality Options
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subtitles')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'subtitles'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Subtitles ({subtitleList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('chapters')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'chapters'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Chapters ({chapterList.length})
        </button>
      </div>

      {/* Quality Options Tab */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload multiple quality versions of your video to let students choose based on their internet speed.
          </p>

          <div className="space-y-3">
            {(['1080p', '720p', '480p', '360p', 'original'] as const).map((quality) => (
              <div key={quality} className="flex items-center gap-3">
                <Label className="w-24">{quality}</Label>
                <Input
                  type="url"
                  value={qualities[quality] || ''}
                  onChange={(e) => handleQualityChange(quality, e.target.value)}
                  placeholder={`URL for ${quality} version`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement file upload
                    alert('File upload coming soon')
                  }}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Tip: At minimum, provide the original quality. Lower qualities can be auto-generated.
          </p>
        </div>
      )}

      {/* Subtitles Tab */}
      {activeTab === 'subtitles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Add subtitles/captions in multiple languages (SRT or VTT format)
            </p>
            <Button type="button" onClick={addSubtitle} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Subtitle
            </Button>
          </div>

          {subtitleList.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">No subtitles added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subtitleList.map((subtitle, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Language Code</Label>
                        <Input
                          value={subtitle.language}
                          onChange={(e) => updateSubtitle(index, { language: e.target.value })}
                          placeholder="en, es, fr, etc."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Display Label</Label>
                        <Input
                          value={subtitle.label}
                          onChange={(e) => updateSubtitle(index, { label: e.target.value })}
                          placeholder="English, Spanish, etc."
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubtitle(index)}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs">Subtitle File URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="url"
                        value={subtitle.url}
                        onChange={(e) => updateSubtitle(index, { url: e.target.value })}
                        placeholder="https://... (.srt or .vtt file)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement file upload
                          alert('File upload coming soon')
                        }}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`default-${index}`}
                      checked={subtitle.is_default || false}
                      onChange={(e) => {
                        // Only one can be default
                        const updated = subtitleList.map((sub, i) => ({
                          ...sub,
                          is_default: i === index ? e.target.checked : false
                        }))
                        setSubtitleList(updated)
                        onSubtitlesChange(updated)
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`default-${index}`} className="text-xs cursor-pointer">
                      Set as default subtitle
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chapters Tab */}
      {activeTab === 'chapters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Add chapter markers to help students navigate through the video
            </p>
            <Button type="button" onClick={addChapter} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </div>

          {chapterList.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">No chapters added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapterList.map((chapter, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Timestamp</Label>
                          <Input
                            value={chapter.time}
                            onChange={(e) => updateChapter(index, { time: e.target.value })}
                            placeholder="00:05:30"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">Format: HH:MM:SS</p>
                        </div>
                        <div>
                          <Label className="text-xs">Chapter Title</Label>
                          <Input
                            value={chapter.title}
                            onChange={(e) => updateChapter(index, { title: e.target.value })}
                            placeholder="Introduction"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Description (optional)</Label>
                        <Textarea
                          value={chapter.description || ''}
                          onChange={(e) => updateChapter(index, { description: e.target.value })}
                          placeholder="Brief description of this chapter"
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChapter(index)}
                      className="text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
