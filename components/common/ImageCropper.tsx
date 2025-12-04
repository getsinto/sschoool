'use client'

import { useState, useRef, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface ImageCropperProps {
  image: File | string
  aspectRatio?: number // width / height (e.g., 16/9 = 1.778)
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
  presets?: Array<{
    label: string
    ratio: number
  }>
}

export function ImageCropper({
  image,
  aspectRatio = 1,
  onCropComplete,
  onCancel,
  presets = [
    { label: 'Square (1:1)', ratio: 1 },
    { label: 'Desktop Banner (16:5)', ratio: 16 / 5 },
    { label: 'Mobile Banner (2:1)', ratio: 2 },
    { label: 'Card (16:10)', ratio: 16 / 10 },
    { label: 'Featured (3:2)', ratio: 3 / 2 }
  ]
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [selectedRatio, setSelectedRatio] = useState(aspectRatio)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Load image
    if (typeof image === 'string') {
      setImageUrl(image)
    } else {
      const url = URL.createObjectURL(image)
      setImageUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [image])

  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.onload = () => {
      setImageObj(img)
      initializeCropArea(img)
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    if (imageObj) {
      drawCanvas()
    }
  }, [imageObj, zoom, rotation, cropArea, selectedRatio])

  const initializeCropArea = (img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Calculate initial crop area based on aspect ratio
    let width = canvasWidth * 0.8
    let height = width / selectedRatio

    if (height > canvasHeight * 0.8) {
      height = canvasHeight * 0.8
      width = height * selectedRatio
    }

    setCropArea({
      x: (canvasWidth - width) / 2,
      y: (canvasHeight - height) / 2,
      width,
      height
    })
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !imageObj) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)
    ctx.drawImage(
      imageObj,
      -imageObj.width / 2,
      -imageObj.height / 2,
      imageObj.width,
      imageObj.height
    )
    ctx.restore()

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Clear crop area
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

    // Draw crop border
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1
    for (let i = 1; i < 3; i++) {
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(cropArea.x + (cropArea.width / 3) * i, cropArea.y)
      ctx.lineTo(cropArea.x + (cropArea.width / 3) * i, cropArea.y + cropArea.height)
      ctx.stroke()

      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(cropArea.x, cropArea.y + (cropArea.height / 3) * i)
      ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + (cropArea.height / 3) * i)
      ctx.stroke()
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if click is inside crop area
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true)
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let newX = x - dragStart.x
    let newY = y - dragStart.y

    // Keep crop area within canvas
    newX = Math.max(0, Math.min(newX, canvas.width - cropArea.width))
    newY = Math.max(0, Math.min(newY, canvas.height - cropArea.height))

    setCropArea({ ...cropArea, x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0] || 1)
  }

  const handleRotate = () => {
    setRotation((rotation + 90) % 360)
  }

  const handleRatioChange = (ratio: number) => {
    setSelectedRatio(ratio)
    if (imageObj) {
      initializeCropArea(imageObj)
    }
  }

  const handleCrop = (): void => {
    const canvas = canvasRef.current
    if (!canvas || !imageObj) return

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas')
    const ctx = cropCanvas.getContext('2d')
    if (!ctx) return

    cropCanvas.width = cropArea.width
    cropCanvas.height = cropArea.height

    // Calculate source coordinates
    const scale = imageObj.width / (canvas.width / zoom)
    const sourceX = (cropArea.x - canvas.width / 2) * scale + imageObj.width / 2
    const sourceY = (cropArea.y - canvas.height / 2) * scale + imageObj.height / 2
    const sourceWidth = cropArea.width * scale
    const sourceHeight = cropArea.height * scale

    // Draw cropped image
    ctx.drawImage(
      imageObj,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      cropArea.width,
      cropArea.height
    )

    // Convert to blob
    cropCanvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob)
      }
    }, 'image/webp', 0.9)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crop Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full border rounded-lg cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Aspect Ratio Presets */}
        <div className="space-y-2">
          <Label className="text-sm">Aspect Ratio</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant={selectedRatio === preset.ratio ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRatioChange(preset.ratio)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Zoom Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Zoom</Label>
            <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-gray-500" />
            <Slider
              value={[zoom]}
              onValueChange={handleZoomChange}
              min={0.5}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Rotation */}
        <div className="flex items-center justify-between">
          <Label className="text-sm">Rotation</Label>
          <Button variant="outline" size="sm" onClick={handleRotate}>
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate 90°
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleCrop} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            Apply Crop
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Drag the crop area to reposition. Use zoom and rotation controls to adjust the image.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
