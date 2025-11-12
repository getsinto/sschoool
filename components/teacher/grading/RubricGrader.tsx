'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface RubricCriterion {
  id: string
  criterion: string
  description: string
  maxPoints: number
}

interface RubricGrade {
  points: number
  feedback: string
}

interface RubricGraderProps {
  rubric: RubricCriterion[]
  grades: {[key: string]: RubricGrade}
  onChange: (criterionId: string, points: number, feedback: string) => void
}

export default function RubricGrader({ rubric, grades, onChange }: RubricGraderProps) {
  const totalEarned = rubric.reduce((sum, criterion) => {
    const grade = grades[criterion.id]
    return sum + (grade ? grade.points : 0)
  }, 0)

  const totalPossible = rubric.reduce((sum, criterion) => sum + criterion.maxPoints, 0)
  const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Rubric Grading</span>
          <span className="text-sm font-normal text-gray-600">
            {totalEarned}/{totalPossible} ({percentage}%)
          </span>
        </CardTitle>
        <Progress value={percentage} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {rubric.map((criterion) => (
          <div key={criterion.id} className="space-y-3 pb-6 border-b last:border-b-0">
            <div>
              <h4 className="font-semibold text-sm">{criterion.criterion}</h4>
              <p className="text-xs text-gray-600 mt-1">{criterion.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`points-${criterion.id}`} className="text-xs">
                  Points (max: {criterion.maxPoints})
                </Label>
                <Input
                  id={`points-${criterion.id}`}
                  type="number"
                  min="0"
                  max={criterion.maxPoints}
                  value={grades[criterion.id]?.points || ''}
                  onChange={(e) => onChange(
                    criterion.id,
                    parseInt(e.target.value) || 0,
                    grades[criterion.id]?.feedback || ''
                  )}
                  placeholder={`0-${criterion.maxPoints}`}
                  className="h-9"
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  {grades[criterion.id]?.points || 0} / {criterion.maxPoints}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor={`feedback-${criterion.id}`} className="text-xs">
                Feedback
              </Label>
              <Textarea
                id={`feedback-${criterion.id}`}
                value={grades[criterion.id]?.feedback || ''}
                onChange={(e) => onChange(
                  criterion.id,
                  grades[criterion.id]?.points || 0,
                  e.target.value
                )}
                placeholder="Provide specific feedback for this criterion..."
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
