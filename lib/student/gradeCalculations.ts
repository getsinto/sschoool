export interface Grade {
  score: number
  maxScore: number
  weight?: number
  date?: string
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable'
  change: number
  consistency: number
}

export function calculateGPA(grades: Grade[]): number {
  if (grades.length === 0) return 0

  const totalPoints = grades.reduce((sum, grade) => {
    const percentage = (grade.score / grade.maxScore) * 100
    const gradePoint = percentageToGradePoint(percentage)
    return sum + gradePoint
  }, 0)

  return Number((totalPoints / grades.length).toFixed(2))
}

export function calculateAverage(grades: Grade[]): number {
  if (grades.length === 0) return 0

  const totalPercentage = grades.reduce((sum, grade) => {
    return sum + (grade.score / grade.maxScore) * 100
  }, 0)

  return Number((totalPercentage / grades.length).toFixed(2))
}

export function calculateWeightedAverage(grades: Grade[]): number {
  if (grades.length === 0) return 0

  const totalWeight = grades.reduce((sum, grade) => sum + (grade.weight || 1), 0)
  
  const weightedSum = grades.reduce((sum, grade) => {
    const percentage = (grade.score / grade.maxScore) * 100
    const weight = grade.weight || 1
    return sum + (percentage * weight)
  }, 0)

  return Number((weightedSum / totalWeight).toFixed(2))
}

export function calculateTrend(grades: Grade[]): TrendData {
  if (grades.length < 2) {
    return { direction: 'stable', change: 0, consistency: 1 }
  }

  // Sort by date if available
  const sortedGrades = [...grades].sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }
    return 0
  })

  const percentages = sortedGrades.map(g => (g.score / g.maxScore) * 100)
  
  // Calculate linear regression slope
  const n = percentages.length
  const xMean = (n - 1) / 2
  const yMean = percentages.reduce((sum, p) => sum + p, 0) / n
  
  let numerator = 0
  let denominator = 0
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (percentages[i] - yMean)
    denominator += Math.pow(i - xMean, 2)
  }
  
  const slope = numerator / denominator
  
  // Calculate consistency (inverse of standard deviation)
  const variance = percentages.reduce((sum, p) => sum + Math.pow(p - yMean, 2), 0) / n
  const stdDev = Math.sqrt(variance)
  const consistency = Math.max(0, 1 - (stdDev / 100))
  
  // Determine direction
  let direction: 'up' | 'down' | 'stable'
  if (Math.abs(slope) < 0.5) {
    direction = 'stable'
  } else if (slope > 0) {
    direction = 'up'
  } else {
    direction = 'down'
  }
  
  return {
    direction,
    change: Number(slope.toFixed(2)),
    consistency: Number(consistency.toFixed(2))
  }
}

export function predictFinalGrade(currentGrades: Grade[], remainingWeight: number): number {
  if (currentGrades.length === 0) return 0

  const currentAverage = calculateWeightedAverage(currentGrades)
  const currentWeight = currentGrades.reduce((sum, g) => sum + (g.weight || 1), 0)
  const totalWeight = currentWeight + remainingWeight

  // Assume student maintains current performance
  const predictedTotal = (currentAverage * currentWeight) + (currentAverage * remainingWeight)
  
  return Number((predictedTotal / totalWeight).toFixed(2))
}

export function percentageToGradePoint(percentage: number): number {
  if (percentage >= 93) return 4.0
  if (percentage >= 90) return 3.7
  if (percentage >= 87) return 3.3
  if (percentage >= 83) return 3.0
  if (percentage >= 80) return 2.7
  if (percentage >= 77) return 2.3
  if (percentage >= 73) return 2.0
  if (percentage >= 70) return 1.7
  if (percentage >= 67) return 1.3
  if (percentage >= 63) return 1.0
  if (percentage >= 60) return 0.7
  return 0.0
}

export function percentageToLetterGrade(percentage: number): string {
  if (percentage >= 93) return 'A'
  if (percentage >= 90) return 'A-'
  if (percentage >= 87) return 'B+'
  if (percentage >= 83) return 'B'
  if (percentage >= 80) return 'B-'
  if (percentage >= 77) return 'C+'
  if (percentage >= 73) return 'C'
  if (percentage >= 70) return 'C-'
  if (percentage >= 67) return 'D+'
  if (percentage >= 63) return 'D'
  if (percentage >= 60) return 'D-'
  return 'F'
}

export function calculateRequiredScore(
  currentGrades: Grade[],
  targetAverage: number,
  upcomingMaxScore: number
): number {
  const currentTotal = currentGrades.reduce((sum, g) => sum + g.score, 0)
  const currentMaxTotal = currentGrades.reduce((sum, g) => sum + g.maxScore, 0)
  
  const totalMaxScore = currentMaxTotal + upcomingMaxScore
  const requiredTotal = (targetAverage / 100) * totalMaxScore
  const requiredScore = requiredTotal - currentTotal
  
  return Math.max(0, Math.min(upcomingMaxScore, Number(requiredScore.toFixed(2))))
}
