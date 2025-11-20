'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, ThumbsUp, ThumbsDown, Smile, Meh, Frown } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SatisfactionSurveyProps {
  ticketId: string
  ticketNumber: string
  onComplete?: () => void
}

export function SatisfactionSurvey({
  ticketId,
  ticketNumber,
  onComplete
}: SatisfactionSurveyProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'rating' | 'feedback' | 'complete'>('rating')
  const [rating, setRating] = useState<number>(0)
  const [satisfaction, setSatisfaction] = useState<'satisfied' | 'neutral' | 'dissatisfied' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleRatingSelect = (value: number) => {
    setRating(value)
    setStep('feedback')
  }

  const handleSatisfactionSelect = (value: 'satisfied' | 'neutral' | 'dissatisfied') => {
    setSatisfaction(value)
    setStep('feedback')
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          satisfaction,
          feedback: feedback.trim()
        })
      })

      if (response.ok) {
        setStep('complete')
        toast({
          title: 'Thank you!',
          description: 'Your feedback has been submitted successfully.'
        })
        setTimeout(() => {
          onComplete?.()
        }, 2000)
      } else {
        throw new Error('Failed to submit survey')
      }
    } catch (error) {
      console.error('Survey submission error:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'complete') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Thank You for Your Feedback!
          </h3>
          <p className="text-sm text-green-700">
            Your input helps us improve our support service.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">How was your support experience?</CardTitle>
        <p className="text-sm text-gray-600">
          Ticket #{ticketNumber} has been resolved. We'd love to hear your feedback!
        </p>
      </CardHeader>
      <CardContent>
        {step === 'rating' && (
          <div className="space-y-6">
            {/* Star Rating */}
            <div>
              <p className="text-sm font-medium mb-3">Rate your experience (1-5 stars)</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRatingSelect(value)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        value <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            {/* Quick Satisfaction */}
            <div>
              <p className="text-sm font-medium mb-3">Quick feedback</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSatisfactionSelect('satisfied')}
                  className="flex flex-col items-center gap-2 p-4 border-2 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <Smile className="h-8 w-8 text-green-500" />
                  <span className="text-sm font-medium">Satisfied</span>
                </button>
                <button
                  onClick={() => handleSatisfactionSelect('neutral')}
                  className="flex flex-col items-center gap-2 p-4 border-2 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
                >
                  <Meh className="h-8 w-8 text-yellow-500" />
                  <span className="text-sm font-medium">Neutral</span>
                </button>
                <button
                  onClick={() => handleSatisfactionSelect('dissatisfied')}
                  className="flex flex-col items-center gap-2 p-4 border-2 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                >
                  <Frown className="h-8 w-8 text-red-500" />
                  <span className="text-sm font-medium">Dissatisfied</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'feedback' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              {rating > 0 ? (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-6 w-6 ${
                        value <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              ) : satisfaction === 'satisfied' ? (
                <Smile className="h-8 w-8 text-green-500" />
              ) : satisfaction === 'neutral' ? (
                <Meh className="h-8 w-8 text-yellow-500" />
              ) : (
                <Frown className="h-8 w-8 text-red-500" />
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional comments (optional)
              </label>
              <Textarea
                placeholder="Tell us more about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.length}/500 characters
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('rating')}
                disabled={submitting}
              >
                Back
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => onComplete?.()}
              className="w-full text-sm"
              disabled={submitting}
            >
              Skip Survey
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
