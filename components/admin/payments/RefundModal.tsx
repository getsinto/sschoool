'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, AlertTriangle, DollarSign } from 'lucide-react'

interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: {
    id: string
    transactionId: string
    studentName: string
    courseName: string
    amount: number
    currency: string
    gateway: string
  }
  onConfirm: (refundData: { reason: string; amount: number; type: string }) => Promise<void>
}

export default function RefundModal({ isOpen, onClose, transaction, onConfirm }: RefundModalProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full')
  const [refundAmount, setRefundAmount] = useState(transaction.amount)
  const [reason, setReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!reason.trim()) {
      setError('Please provide a reason for the refund')
      return
    }

    if (refundType === 'partial' && (refundAmount <= 0 || refundAmount > transaction.amount)) {
      setError('Invalid refund amount')
      return
    }

    setIsProcessing(true)

    try {
      await onConfirm({
        reason: reason.trim(),
        amount: refundType === 'full' ? transaction.amount : refundAmount,
        type: refundType
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to process refund')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setReason('')
      setRefundAmount(transaction.amount)
      setRefundType('full')
      setError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Process Refund</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isProcessing}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Info */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono font-medium">{transaction.transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Student:</span>
                <span className="font-medium">{transaction.studentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Course:</span>
                <span className="font-medium">{transaction.courseName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original Amount:</span>
                <span className="font-medium">{transaction.currency} {transaction.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gateway:</span>
                <span className="font-medium capitalize">{transaction.gateway}</span>
              </div>
            </div>

            {/* Refund Type */}
            <div>
              <Label htmlFor="refundType">Refund Type *</Label>
              <Select value={refundType} onValueChange={(value: any) => setRefundType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Refund</SelectItem>
                  <SelectItem value="partial">Partial Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refund Amount (for partial) */}
            {refundType === 'partial' && (
              <div>
                <Label htmlFor="refundAmount">Refund Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="refundAmount"
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                    className="w-full pl-10 px-3 py-2 border rounded-lg"
                    min="0.01"
                    max={transaction.amount}
                    step="0.01"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {transaction.currency} {transaction.amount.toFixed(2)}
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Reason for Refund *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a detailed reason for this refund..."
                rows={4}
                required
                disabled={isProcessing}
              />
            </div>

            {/* Warning */}
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">This action cannot be undone</p>
                <p className="text-xs mt-1">
                  The refund will be processed through {transaction.gateway} and may take 5-10 business days to appear in the student's account.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? 'Processing...' : `Refund ${transaction.currency} ${refundType === 'full' ? transaction.amount.toFixed(2) : refundAmount.toFixed(2)}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
