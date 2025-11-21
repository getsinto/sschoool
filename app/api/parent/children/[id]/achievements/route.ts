import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const childId = params.id
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the child belongs to this parent
    const { data: child, error: childError } = await supabase
      .from('profiles')
      .select('id, parent_id')
      .eq('id', childId)
      .eq('parent_id', user.id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 })
    }

    // Get child's achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('student_achievements')
      .select(`
        id,
        earned_at,
        achievements (
          id,
          title,
          description,
          badge_url,
          category,
          points
        )
      `)
      .eq('student_id', childId)
      .order('earned_at', { ascending: false })

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
      return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
    }

    // Format achievements data
    const formattedAchievements = (achievements || []).map((achievement: any) => ({
      id: achievement.id,
      title: achievement.achievements.title,
      description: achievement.achievements.description,
      badge_url: achievement.achievements.badge_url,
      category: achievement.achievements.category,
      points: achievement.achievements.points,
      earned_date: achievement.earned_at
    }))

    return NextResponse.json(formattedAchievements)
  } catch (error) {
    console.error('Error in parent children achievements API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
