'use client'

import { Lock, Share2, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface BadgeData {
  id: string
  title: string
  description: string
  icon: string
  category: string
  earnedDate?: string
  progress?: number
  total?: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

interface BadgeCardProps {
  badge: BadgeData
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  const isEarned = !!badge.earnedDate

  const getRarityColor = () => {
    switch (badge.rarity) {
      case 'common': return 'border-gray-300 bg-gray-50'
      case 'uncommon': return 'border-green-300 bg-green-50'
      case 'rare': return 'border-blue-300 bg-blue-50'
      case 'epic': return 'border-purple-300 bg-purple-50'
      case 'legendary': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getRarityBadgeColor = () => {
    switch (badge.rarity) {
      case 'common': return 'bg-gray-500'
      case 'uncommon': return 'bg-green-500'
      case 'rare': return 'bg-blue-500'
      case 'epic': return 'bg-purple-500'
      case 'legendary': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className={`${getRarityColor()} border-2 ${isEarned ? '' : 'opacity-60'} hover:shadow-lg transition-all`}>
      <CardContent className="pt-6">
        <div className="text-center space-y-3">
          {/* Icon */}
          <div className="relative inline-block">
            <div className={`text-6xl ${isEarned ? '' : 'grayscale'}`}>
              {badge.icon}
            </div>
            {!isEarned && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="font-semibold text-lg mb-1">{badge.title}</h3>
            <p className="text-sm text-gray-600">{badge.description}</p>
          </div>

          {/* Rarity Badge */}
          <Badge className={`${getRarityBadgeColor()} text-white capitalize`}>
            {badge.rarity}
          </Badge>

          {/* Earned Date or Progress */}
          {isEarned ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Earned</span>
              </div>
              <p className="text-xs text-gray-600">
                {new Date(badge.earnedDate!).toLocaleDateString()}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Share2 className="w-3 h-3 mr-2" />
                Share
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Progress: {badge.progress} / {badge.total}
              </div>
              <Progress 
                value={((badge.progress || 0) / (badge.total || 1)) * 100} 
                className="h-2"
              />
              <p className="text-xs text-gray-600">
                {badge.total! - badge.progress!} more to unlock
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
