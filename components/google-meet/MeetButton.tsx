'use client'

import { Button } from '@/components/ui/button'
import { Video, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface MeetButtonProps {
  meetLink: string
  label?: string
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  onJoin?: () => void
}

export function MeetButton({
  meetLink,
  label = 'Join Google Meet',
  variant = 'default',
  size = 'default',
  className,
  onJoin
}: MeetButtonProps) {
  const [joining, setJoining] = useState(false)

  const handleClick = () => {
    setJoining(true)
    
    // Open Google Meet in new tab
    window.open(meetLink, '_blank', 'noopener,noreferrer')
    
    // Call onJoin callback if provided
    if (onJoin) {
      onJoin()
    }
    
    // Reset joining state after a short delay
    setTimeout(() => setJoining(false), 2000)
  }

  return (
    <Button
      onClick={handleClick}
      disabled={joining || !meetLink}
      variant={variant}
      size={size}
      className={className}
    >
      {joining ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Video className="mr-2 h-4 w-4" />
      )}
      {label}
      <ExternalLink className="ml-2 h-3 w-3" />
    </Button>
  )
}
