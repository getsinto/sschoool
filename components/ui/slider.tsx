import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  max?: number
  min?: number
  step?: number
  onValueChange?: (value: number[]) => void
  className?: string
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, defaultValue, max = 100, min = 0, step = 1, onValueChange, disabled = false }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || defaultValue || [0])
    const sliderRef = React.useRef<HTMLDivElement>(null)
    const isDragging = React.useRef(false)

    const currentValue = value || internalValue

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return
      isDragging.current = true
      updateValue(e.clientX)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || disabled) return
      updateValue(e.clientX)
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    const updateValue = (clientX: number) => {
      if (!sliderRef.current) return
      
      const rect = sliderRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percent * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))
      
      const newValue = [clampedValue]
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    React.useEffect(() => {
      if (isDragging.current) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [])

    const percentage = currentValue[0] !== undefined ? ((currentValue[0] - min) / (max - min)) * 100 : 0

    return (
      <div
        ref={sliderRef}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
          <div 
            className="absolute h-full bg-blue-600 transition-all" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div 
          className="absolute block h-5 w-5 rounded-full border-2 border-blue-600 bg-white shadow transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
