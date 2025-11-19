import { NextRequest, NextResponse } from 'next/server'

// GET /api/student/achievements - Get all badges and achievements
export async function GET(request: NextRequest) {
  try {
    // Mock data - replace with actual database queries
    const mockAchievements = {
      badges: [
        // Completion Badges
        {
          id: '1',
          name: 'Course Completer',
          description: 'Complete your first course',
          category: 'completion',
          earned: true,
          earnedDate: '2024-01-15',
          icon: '🎓',
          rarity: 'common'
        },
        {
          id: '2',
          name: '5 Course Master',
          description: 'Complete 5 courses',
          category: 'completion',
          earned: true,
          earnedDate: '2024-02-20',
          icon: '🏆',
          rarity: 'rare'
        },
        {
          id: '3',
          name: '10 Course Legend',
          description: 'Complete 10 courses',
          category: 'completion',
          earned: false,
          progress: 70,
          icon: '👑',
          rarity: 'epic'
        },

        // Streak Badges
        {
          id: '4',
          name: '7-Day Streak',
          description: 'Learn for 7 consecutive days',
          category: 'streak',
          earned: true,
          earnedDate: '2024-01-20',
          icon: '🔥',
          rarity: 'common'
        },
        {
          id: '5',
          name: '30-Day Streak',
          description: 'Learn for 30 consecutive days',
          category: 'streak',
          earned: true,
          earnedDate: '2024-02-15',
          icon: '⚡',
          rarity: 'rare'
        },
        {
          id: '6',
          name: '100-Day Streak',
          description: 'Learn for 100 consecutive days',
          category: 'streak',
          earned: false,
          progress: 45,
          icon: '💎',
          rarity: 'legendary'
        },

        // Performance Badges
        {
          id: '7',
          name: 'Perfect Score',
          description: 'Get 100% on any quiz',
          category: 'performance',
          earned: true,
          earnedDate: '2024-01-25',
          icon: '⭐',
          rarity: 'rare'
        },
        {
          id: '8',
          name: 'Early Bird',
          description: 'Complete assignment before due date',
          category: 'performance',
          earned: true,
          earnedDate: '2024-02-01',
          icon: '🐦',
          rarity: 'common'
        },
        {
          id: '9',
          name: 'Overachiever',
          description: 'Score above 95% on 10 assignments',
          category: 'performance',
          earned: false,
          progress: 60,
          icon: '🌟',
          rarity: 'epic'
        },

        // Participation Badges
        {
          id: '10',
          name: 'Class Participant',
          description: 'Attend your first live class',
          category: 'participation',
          earned: true,
          earnedDate: '2024-01-18',
          icon: '👥',
          rarity: 'common'
        },
        {
          id: '11',
          name: 'Active Learner',
          description: 'Attend 10 live classes',
          category: 'participation',
          earned: true,
          earnedDate: '2024-02-10',
          icon: '📚',
          rarity: 'rare'
        },
        {
          id: '12',
          name: 'Community Helper',
          description: 'Help 5 students in Q&A',
          category: 'participation',
          earned: false,
          progress: 40,
          icon: '🤝',
          rarity: 'rare'
        }
      ],
      stats: {
        totalBadges: 12,
        earnedBadges: 8,
        completionPercentage: 67,
        currentStreak: 45,
        longestStreak: 45
      }
    }

    return NextResponse.json({
      success: true,
      data: mockAchievements
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
