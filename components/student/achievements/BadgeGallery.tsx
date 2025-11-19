'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BadgeCard from './BadgeCard'
import { Award, Flame, Target, Users, Star, Trophy } from 'lucide-react'

interface BadgeGalleryProps {
  badges: any[]
  categories?: string[]
}

export default function BadgeGallery({ badges, categories = ['all', 'completion', 'streak', 'performance', 'participation'] }: BadgeGalleryProps) {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'completion':
        return <Award className="h-4 w-4" />
      case 'streak':
        return <Flame className="h-4 w-4" />
      case 'performance':
        return <Target className="h-4 w-4" />
      case 'participation':
        return <Users className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const filterBadgesByCategory = (category: string) => {
    if (category === 'all') return badges
    return badges.filter(badge => badge.category.toLowerCase() === category.toLowerCase())
  }

  const earnedBadges = badges.filter(b => b.earned)
  const totalBadges = badges.length
  const completionPercentage = Math.round((earnedBadges.length / totalBadges) * 100)

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold">{earnedBadges.length}</p>
            <p className="text-sm text-muted-foreground">Badges Earned</p>
          </div>
          <div className="text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-3xl font-bold">{totalBadges}</p>
            <p className="text-sm text-muted-foreground">Total Badges</p>
          </div>
          <div className="text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold">{completionPercentage}%</p>
            <p className="text-sm text-muted-foreground">Collection Progress</p>
          </div>
          <div className="text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-3xl font-bold">{badges.filter(b => b.category === 'streak' && b.earned).length}</p>
            <p className="text-sm text-muted-foreground">Streak Badges</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Collection Progress</span>
            <span className="font-medium">{earnedBadges.length} / {totalBadges}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Badge Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              <span className="flex items-center gap-2">
                {getCategoryIcon(category)}
                {category}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterBadgesByCategory(category).map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>

            {filterBadgesByCategory(category).length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No badges in this category yet</p>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Next Badges to Unlock */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Next Badges to Unlock</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges
            .filter(b => !b.earned && b.progress)
            .slice(0, 3)
            .map(badge => (
              <div key={badge.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center opacity-50">
                    {badge.icon || <Award className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{badge.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}
