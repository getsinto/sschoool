'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Trophy,
  Flame,
  Zap,
  Star,
  Target,
  Users,
  Calendar,
  Share2,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import BadgeCard from '@/components/student/achievements/BadgeCard'

// Mock data
const mockAchievements = {
  earned: [
    {
      id: 'b1',
      title: 'First Course Completed',
      description: 'Complete your first course with a passing grade',
      icon: '🎓',
      category: 'completion',
      earnedDate: '2024-01-10',
      rarity: 'common'
    },
    {
      id: 'b2',
      title: '7-Day Streak',
      description: 'Study for 7 consecutive days',
      icon: '🔥',
      category: 'streak',
      earnedDate: '2024-01-18',
      rarity: 'common'
    },
    {
      id: 'b3',
      title: 'Perfect Score',
      description: 'Get 100% on a quiz',
      icon: '💯',
      category: 'performance',
      earnedDate: '2024-01-15',
      rarity: 'uncommon'
    },
    {
      id: 'b4',
      title: 'Early Bird',
      description: 'Submit 5 assignments before the due date',
      icon: '🐦',
      category: 'participation',
      earnedDate: '2024-01-22',
      rarity: 'uncommon'
    },
    {
      id: 'b5',
      title: 'Class Participant',
      description: 'Attend 10 live classes',
      icon: '👥',
      category: 'participation',
      earnedDate: '2024-01-20',
      rarity: 'common'
    }
  ],
  locked: [
    {
      id: 'b6',
      title: '30-Day Streak',
      description: 'Study for 30 consecutive days',
      icon: '🔥',
      category: 'streak',
      progress: 7,
      total: 30,
      rarity: 'rare'
    },
    {
      id: 'b7',
      title: 'Speed Learner',
      description: 'Complete 10 lessons in one day',
      icon: '⚡',
      category: 'performance',
      progress: 3,
      total: 10,
      rarity: 'rare'
    },
    {
      id: 'b8',
      title: 'Honor Roll',
      description: 'Maintain 90%+ average across all courses',
      icon: '🏆',
      category: 'performance',
      progress: 88,
      total: 90,
      rarity: 'epic'
    },
    {
      id: 'b9',
      title: 'Marathon Runner',
      description: 'Study for 100 consecutive days',
      icon: '🏃',
      category: 'streak',
      progress: 7,
      total: 100,
      rarity: 'legendary'
    },
    {
      id: 'b10',
      title: 'Master Scholar',
      description: 'Complete 10 courses with distinction',
      icon: '👑',
      category: 'completion',
      progress: 2,
      total: 10,
      rarity: 'legendary'
    }
  ],
  stats: {
    totalEarned: 5,
    totalAvailable: 15,
    completionRate: 33,
    nextBadge: '30-Day Streak'
  }
}

export default function AchievementsPage() {
  const [data] = useState(mockAchievements)
  const [activeTab, setActiveTab] = useState('all')

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600'
      case 'uncommon': return 'text-green-600'
      case 'rare': return 'text-blue-600'
      case 'epic': return 'text-purple-600'
      case 'legendary': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const filterByCategory = (category: string) => {
    if (category === 'all') return [...data.earned, ...data.locked]
    return [...data.earned, ...data.locked].filter(b => b.category === category)
  }

  const filteredBadges = filterByCategory(activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Achievements & Badges</h1>
          <p className="text-gray-600">Collect badges as you progress through your learning journey</p>
        </div>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share Collection
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Earned</p>
                <p className="text-3xl font-bold text-green-600">{data.stats.totalEarned}</p>
              </div>
              <Trophy className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available</p>
                <p className="text-3xl font-bold text-blue-600">{data.stats.totalAvailable}</p>
              </div>
              <Award className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completion</p>
                <p className="text-3xl font-bold text-purple-600">{data.stats.completionRate}%</p>
              </div>
              <Target className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Badge</p>
                <p className="text-lg font-bold text-orange-600">{data.stats.nextBadge}</p>
              </div>
              <Star className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-semibold">{data.stats.totalEarned} / {data.stats.totalAvailable}</span>
            </div>
            <Progress value={data.stats.completionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="participation">Participation</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <BadgeCard badge={badge} />
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rarity Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Badge Rarity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-sm">Common</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm">Uncommon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm">Rare</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-sm">Epic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-sm">Legendary</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
