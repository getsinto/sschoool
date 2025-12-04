'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  SkipBack, SkipForward, Subtitles 
} from 'lucide-react'
import { VideoQualityOptions, VideoSubtitle, VideoChapter } from '@/types/lesson'

interface EnhancedVideoPlayerProps {
  videoUrl: string
  qualityOptions?: VideoQualityOptions
  subtitles?: VideoSubtitle[]
  chapters?: VideoChapter[]
  onProgress?: (percentage: number, timeSpent: number) => void
  onComplete?: () => void
}

export function EnhancedVideoPlayer({
  videoUrl,
  qualityOptions,
  subtitles = [],
  chapters = [],
  onProgress,
  onComplete
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState<string>('original')
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off')
  const [showSettings, setShowSettings] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [watchedPercentage, setWatchedPercentage] = useState(0)
  const [startTime] = useState(Date.now())

  // Get available quality options
  const availableQualities = qualityOptions
    ? Object.entries(qualityOptions).filter(([_, url]) => url)
    : [['original', videoUrl]]

  // Get current video source based on selected quality
  const currentVideoUrl = qualityOptions?.[selectedQuality as keyof VideoQualityOptions] || videoUrl

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle volume
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value
      setVolume(value)
      setIsMuted(value === 0)
    }
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setDuration(total)

      // Calculate watched percentage
      const percentage = (current / total) * 100
      setWatchedPercentage(percentage)

      // Report progress
      if (onProgress) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60) // minutes
        onProgress(percentage, timeSpent)
      }

      // Check if video is complete (watched 95%+)
      if (percentage >= 95 && onComplete) {
        onComplete()
      }
    }
  }

  // Handle seek
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  // Jump to chapter
  const jumpToChapter = (time: string) => {
    const [hours, minutes, seconds] = time.split(':').map(Number)
    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    handleSeek(totalSeconds)
    setShowChapters(false)
  }

  // Format time
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  // Change quality
  const changeQuality = (quality: string) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      setSelectedQuality(quality)
      // Video will reload with new source, restore time
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime
          if (isPlaying) {
            videoRef.current.play()
          }
        }
      }, 100)
    }
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={currentVideoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration)
          }
        }}
        onEnded={() => {
          setIsPlaying(false)
          if (onComplete) onComplete()
        }}
      >
        {subtitles.map((subtitle) => (
          <track
            key={subtitle.language}
            kind="subtitles"
            src={subtitle.url}
            srcLang={subtitle.language}
            label={subtitle.label}
            default={subtitle.is_default}
          />
        ))}
      </video>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            {/* Skip Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Chapters */}
            {chapters.length > 0 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChapters(!showChapters)}
                  className="text-white hover:bg-white/20"
                >
                  Chapters
                </Button>
                {showChapters && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 max-h-64 overflow-y-auto min-w-[200px]">
                    {chapters.map((chapter, index) => (
                      <button
                        key={index}
                        onClick={() => jumpToChapter(chapter.time)}
                        className="block w-full text-left px-3 py-2 text-white hover:bg-white/20 rounded text-sm"
                      >
                        <div className="font-medium">{chapter.title}</div>
                        <div className="text-xs text-gray-400">{chapter.time}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtitles */}
            {subtitles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Subtitles className="w-4 h-4" />
              </Button>
            )}

            {/* Quality Settings */}
            {availableQualities.length > 1 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2">
                    <div className="text-white text-sm mb-2 px-2">Quality</div>
                    {availableQualities.map(([quality]) => (
                      <button
                        key={quality}
                        onClick={() => changeQuality(quality)}
                        className={`block w-full text-left px-3 py-2 text-white hover:bg-white/20 rounded text-sm ${
                          selectedQuality === quality ? 'bg-white/20' : ''
                        }`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-2 text-xs text-white/70">
          Watched: {Math.round(watchedPercentage)}%
        </div>
      </div>
    </div>
  )
}
