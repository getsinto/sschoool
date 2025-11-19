'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, RefreshCw } from 'lucide-react'

interface Payment {
  id: string
  date: string
  childName: string
  courseName: string
  amount: number
  method: string
  status: 'paid' | 'pending' | 'failed'
}

interface PaymentHistoryProps {
  payments: Payment[]
}

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Child</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map(payment => (
            <TableRow key={payment.id}>
              <TableCell>{payment.date}</TableCell>
              <TableCell>{payment.childName}</TableCell>
              <TableCell>{payment.courseName}</TableCell>
              <TableCell>${payment.amount}</TableCell>
              <TableCell>{payment.method}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
