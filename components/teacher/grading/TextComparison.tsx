'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TextComparisonProps {
  studentText: string
  referenceText?: string
  wordCount?: number
  showDiff?: boolean
}

export default function TextComparison({ 
  studentText, 
  referenceText, 
  wordCount,
  showDiff = false 
}: TextComparisonProps) {
  const [showReference, setShowReference] = useState(showDiff)
  const [highlightDiff, setHighlightDiff] = useState(false)

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).length
  }

  const actualWordCount = wordCount || calculateWordCount(studentText)

  // Simple diff highlighting (in production, use a proper diff library)
  const highlightDifferences = (text1: string, text2: string) => {
    const words1 = text1.split(' ')
    const words2 = text2.split(' ')
    
    return words1.map((word, index) => {
      const isDifferent = words2[index] !== word
      return (
        <span
          key={index}
          className={isDifferent ? 'bg-yellow-200' : ''}
        >
          {word}{' '}
        </span>
      )
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Student Submission</CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                <FileText className="w-3 h-3 mr-1" />
                {actualWordCount} words
              </Badge>
              {referenceText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReference(!showReference)}
                >
                  {showReference ? (
                    <><EyeOff className="w-4 h-4 mr-1" /> Hide Reference</>
                  ) : (
                    <><Eye className="w-4 h-4 mr-1" /> Show Reference</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none bg-gray-50 rounded-lg p-4">
            {highlightDiff && referenceText ? (
              <div>{highlightDifferences(studentText, referenceText)}</div>
            ) : (
              <div className="whitespace-pre-wrap">{studentText}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {showReference && referenceText && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Reference Answer</CardTitle>
              <Badge variant="outline">
                <FileText className="w-3 h-3 mr-1" />
                {calculateWordCount(referenceText)} words
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none bg-blue-50 rounded-lg p-4">
              <div className="whitespace-pre-wrap">{referenceText}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
