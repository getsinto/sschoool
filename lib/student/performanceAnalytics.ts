import { Grade, calculateAverage, calculateTrend } from './gradeCalculations'

export interface CourseGrade {
  courseId: string
  courseName: string
  grades: Grade[]
  category?: string
}

export interface Analysis {
  strengths: string[]
  weaknesses: string[]
  patterns: string[]
}

export interface Comparison {
  difference: number
  percentile: number
  status: 'above' | 'below' | 'at'
}

export function analyzeStrengths(courseGrades: CourseGrade[]): string[] {
  const strengths: string[] = []

  // Find courses with high averages
  const highPerformingCourses = courseGrades
    .filter(cg => {
      const avg = calculateAverage(cg.grades)
      return avg >= 90
    })
    .map(cg => cg.courseName)

  if (highPerformingCourses.length > 0) {
    strengths.push(`Excellent performance in ${highPerformingCourses.join(', ')}`)
  }

  // Find improving trends
  const improvingCourses = courseGrades
    .filter(cg => {
      const trend = calculateTrend(cg.grades)
      return trend.direction === 'up' && trend.change > 2
    })
    .map(cg => cg.courseName)

  if (improvingCourses.length > 0) {
    strengths.push(`Showing improvement in ${improvingCourses.join(', ')}`)
  }

  // Find consistent performance
  const consistentCourses = courseGrades
    .filter(cg => {
      const trend = calculateTrend(cg.grades)
      return trend.consistency > 0.8
    })
    .map(cg => cg.courseName)

  if (consistentCourses.length > 0) {
    strengths.push(`Consistent performance in ${consistentCourses.join(', ')}`)
  }

  // Category-based strengths
  const categoryPerformance = analyzeCategoryPerformance(courseGrades)
  const strongCategories = Object.entries(categoryPerformance)
    .filter(([_, avg]) => avg >= 85)
    .map(([category]) => category)

  if (strongCategories.length > 0) {
    strengths.push(`Strong skills in ${strongCategories.join(', ')} subjects`)
  }

  return strengths.length > 0 ? strengths : ['Keep up the good work!']
}

export function analyzeWeaknesses(courseGrades: CourseGrade[]): string[] {
  const weaknesses: string[] = []

  // Find courses with low averages
  const lowPerformingCourses = courseGrades
    .filter(cg => {
      const avg = calculateAverage(cg.grades)
      return avg < 75
    })
    .map(cg => cg.courseName)

  if (lowPerformingCourses.length > 0) {
    weaknesses.push(`Need improvement in ${lowPerformingCourses.join(', ')}`)
  }

  // Find declining trends
  const decliningCourses = courseGrades
    .filter(cg => {
      const trend = calculateTrend(cg.grades)
      return trend.direction === 'down' && trend.change < -2
    })
    .map(cg => cg.courseName)

  if (decliningCourses.length > 0) {
    weaknesses.push(`Declining performance in ${decliningCourses.join(', ')}`)
  }

  // Find inconsistent performance
  const inconsistentCourses = courseGrades
    .filter(cg => {
      const trend = calculateTrend(cg.grades)
      return trend.consistency < 0.5
    })
    .map(cg => cg.courseName)

  if (inconsistentCourses.length > 0) {
    weaknesses.push(`Inconsistent results in ${inconsistentCourses.join(', ')}`)
  }

  // Category-based weaknesses
  const categoryPerformance = analyzeCategoryPerformance(courseGrades)
  const weakCategories = Object.entries(categoryPerformance)
    .filter(([_, avg]) => avg < 75)
    .map(([category]) => category)

  if (weakCategories.length > 0) {
    weaknesses.push(`Focus needed on ${weakCategories.join(', ')} subjects`)
  }

  return weaknesses
}

export function generateRecommendations(analysis: Analysis): string[] {
  const recommendations: string[] = []

  // Based on weaknesses
  if (analysis.weaknesses.length > 0) {
    recommendations.push('Schedule regular study sessions for challenging subjects')
    recommendations.push('Consider forming or joining study groups')
    recommendations.push('Meet with instructors during office hours for additional support')
  }

  // Based on patterns
  if (analysis.patterns.includes('late_submissions')) {
    recommendations.push('Use a planner or calendar app to track assignment deadlines')
    recommendations.push('Start assignments earlier to allow time for revision')
  }

  if (analysis.patterns.includes('quiz_struggles')) {
    recommendations.push('Create practice quizzes to test your understanding')
    recommendations.push('Review material regularly rather than cramming before quizzes')
  }

  if (analysis.patterns.includes('essay_issues')) {
    recommendations.push('Visit the writing center for feedback on essays')
    recommendations.push('Outline your essays before writing to improve structure')
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('Maintain your current study habits')
    recommendations.push('Challenge yourself with advanced topics')
    recommendations.push('Consider tutoring or mentoring other students')
  }

  return recommendations
}

export function compareToClassAverage(studentScore: number, classAverage: number): Comparison {
  const difference = Number((studentScore - classAverage).toFixed(2))
  
  // Calculate approximate percentile (simplified)
  const standardDeviation = 10 // Assumed
  const zScore = difference / standardDeviation
  const percentile = Math.round(normalCDF(zScore) * 100)
  
  let status: 'above' | 'below' | 'at'
  if (Math.abs(difference) < 1) {
    status = 'at'
  } else if (difference > 0) {
    status = 'above'
  } else {
    status = 'below'
  }

  return {
    difference,
    percentile: Math.max(0, Math.min(100, percentile)),
    status
  }
}

export function identifyPatterns(courseGrades: CourseGrade[]): string[] {
  const patterns: string[] = []

  // Check for time-based patterns
  const allGrades = courseGrades.flatMap(cg => 
    cg.grades.map(g => ({ ...g, course: cg.courseName }))
  )

  // Pattern: Better in certain types of assessments
  const quizAvg = calculateAverage(
    allGrades.filter(g => g.date?.includes('quiz') || false)
  )
  const assignmentAvg = calculateAverage(
    allGrades.filter(g => g.date?.includes('assignment') || false)
  )

  if (quizAvg < assignmentAvg - 10) {
    patterns.push('quiz_struggles')
  }

  // Pattern: Improvement over time
  const firstHalf = allGrades.slice(0, Math.floor(allGrades.length / 2))
  const secondHalf = allGrades.slice(Math.floor(allGrades.length / 2))
  
  if (firstHalf.length > 0 && secondHalf.length > 0) {
    const firstAvg = calculateAverage(firstHalf)
    const secondAvg = calculateAverage(secondHalf)
    
    if (secondAvg > firstAvg + 5) {
      patterns.push('improving_over_time')
    } else if (firstAvg > secondAvg + 5) {
      patterns.push('declining_over_time')
    }
  }

  return patterns
}

function analyzeCategoryPerformance(courseGrades: CourseGrade[]): Record<string, number> {
  const categoryScores: Record<string, number[]> = {}

  courseGrades.forEach(cg => {
    const category = cg.category || 'General'
    if (!categoryScores[category]) {
      categoryScores[category] = []
    }
    const avg = calculateAverage(cg.grades)
    categoryScores[category].push(avg)
  })

  const categoryAverages: Record<string, number> = {}
  Object.entries(categoryScores).forEach(([category, scores]) => {
    categoryAverages[category] = scores.reduce((sum, s) => sum + s, 0) / scores.length
  })

  return categoryAverages
}

// Simplified normal CDF for percentile calculation
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  
  return z > 0 ? 1 - p : p
}

export function generateInsightsSummary(courseGrades: CourseGrade[]): {
  overall: string
  keyPoints: string[]
  actionItems: string[]
} {
  const strengths = analyzeStrengths(courseGrades)
  const weaknesses = analyzeWeaknesses(courseGrades)
  const patterns = identifyPatterns(courseGrades)
  
  const overallAvg = calculateAverage(
    courseGrades.flatMap(cg => cg.grades)
  )

  let overall: string
  if (overallAvg >= 90) {
    overall = 'Excellent academic performance'
  } else if (overallAvg >= 80) {
    overall = 'Strong academic performance'
  } else if (overallAvg >= 70) {
    overall = 'Satisfactory academic performance'
  } else {
    overall = 'Academic performance needs improvement'
  }

  const keyPoints = [
    ...strengths.slice(0, 2),
    ...weaknesses.slice(0, 2)
  ]

  const actionItems = generateRecommendations({ strengths, weaknesses, patterns })
    .slice(0, 3)

  return {
    overall,
    keyPoints,
    actionItems
  }
}
