'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Clock, Users, DollarSign, AlertCircle } from 'lucide-react'
import { CourseBatch, CourseBatchInsert, BatchStatus } from '@/types/pricing'
import { getCurrencySymbol } from '@/types/pricing'

interface BatchFormProps {
  courseId: string
  batch?: CourseBatch | null
  currency?: string
  onSave: (batch: CourseBatch) => void
  onCancel: () => void
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' }
]

export function BatchForm({ courseId, batch, currency = 'USD', onSave, onCancel }: BatchFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form state
  const [batchName, setBatchName] = useState(batch?.batch_name || '')
  const [batchNumber, setBatchNumber] = useState(batch?.batch_number?.toString() || '')
  const [description, setDescription] = useState(batch?.batch_description || '')
  const [startDate, setStartDate] = useState(batch?.start_date || '')
  const [endDate, setEndDate] = useState(batch?.end_date || '')
  const [registrationOpens, setRegistrationOpens] = useState(batch?.registration_opens || '')
  const [registrationCloses, setRegistrationCloses] = useState(batch?.registration_closes || '')
  const [scheduleDays, setScheduleDays] = useState<string[]>(batch?.schedule_days || [])
  const [scheduleTime, setScheduleTime] = useState(batch?.schedule_time || '')
  const [timezone, setTimezone] = useState(batch?.timezone || 'UTC')
  const [maxStudents, setMaxStudents] = useState(batch?.max_students?.toString() || '')
  const [minStudents, setMinStudents] = useState(batch?.min_students?.toString() || '')
  const [batchPrice, setBatchPrice] = useState(batch?.batch_price?.toString() || '')
  const [status, setStatus] = useState<BatchStatus>(batch?.status || 'upcoming')

  const currencySymbol = getCurrencySymbol(currency)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!batchName.trim()) {
      newErrors.batchName = 'Batch name is required'
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (!registrationOpens) {
      newErrors.registrationOpens = 'Registration open date is required'
    }

    if (!registrationCloses) {
      newErrors.registrationCloses = 'Registration close date is required'
    }

    if (registrationOpens && registrationCloses && 
        new Date(registrationOpens) >= new Date(registrationCloses)) {
      newErrors.registrationCloses = 'Registration close must be after open date'
    }

    if (registrationCloses && startDate && 
        new Date(registrationCloses) > new Date(startDate)) {
      newErrors.registrationCloses = 'Registration must close before course starts'
    }

    if (maxStudents && minStudents && 
        parseInt(maxStudents) < parseInt(minStudents)) {
      newErrors.maxStudents = 'Maximum must be greater than minimum'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const batchData: CourseBatchInsert | any = {
        course_id: courseId,
        batch_name: batchName,
        batch_number: batchNumber ? parseInt(batchNumber) : undefined,
        batch_description: description || undefined,
        start_date: startDate,
        end_date: endDate,
        registration_opens: registrationOpens,
        registration_closes: registrationCloses,
        schedule_days: scheduleDays.length > 0 ? scheduleDays : undefined,
        schedule_time: scheduleTime || undefined,
        timezone,
        max_students: maxStudents ? parseInt(maxStudents) : undefined,
        min_students: minStudents ? parseInt(minStudents) : undefined,
        batch_price: batchPrice ? parseFloat(batchPrice) : undefined,
        status
      }

      const url = batch
        ? `/api/teacher/courses/${courseId}/batches/${batch.id}`
        : `/api/teacher/courses/${courseId}/batches`

      const method = batch ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      })

      if (response.ok) {
        const data = await response.json()
        onSave(data.batch)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save batch')
      }
    } catch (error) {
      console.error('Error saving batch:', error)
      alert('Error saving batch')
    } finally {
      setLoading(false)
    }
  }

  const toggleDay = (day: string) => {
    setScheduleDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {batch ? 'Edit Batch' : 'Create New Batch'}
        </h3>
        <p className="text-sm text-gray-500">
          Configure batch schedule and enrollment settings
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batchName">
                Batch Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="batchName"
                placeholder="e.g., Batch #5 - Spring 2024"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className={errors.batchName ? 'border-red-500' : ''}
              />
              {errors.batchName && (
                <p className="text-sm text-red-500 mt-1">{errors.batchName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
              <Input
                id="batchNumber"
                type="number"
                placeholder="5"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this batch..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Duration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Course Duration
          </CardTitle>
          <CardDescription>When will this batch run?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Window */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registration Window
          </CardTitle>
          <CardDescription>When can students register?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registrationOpens">
                Opens <span className="text-red-500">*</span>
              </Label>
              <Input
                id="registrationOpens"
                type="datetime-local"
                value={registrationOpens}
                onChange={(e) => setRegistrationOpens(e.target.value)}
                className={errors.registrationOpens ? 'border-red-500' : ''}
              />
              {errors.registrationOpens && (
                <p className="text-sm text-red-500 mt-1">{errors.registrationOpens}</p>
              )}
            </div>

            <div>
              <Label htmlFor="registrationCloses">
                Closes <span className="text-red-500">*</span>
              </Label>
              <Input
                id="registrationCloses"
                type="datetime-local"
                value={registrationCloses}
                onChange={(e) => setRegistrationCloses(e.target.value)}
                className={errors.registrationCloses ? 'border-red-500' : ''}
              />
              {errors.registrationCloses && (
                <p className="text-sm text-red-500 mt-1">{errors.registrationCloses}</p>
              )}
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                Registration must close before the course start date
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Class Schedule (Optional)</CardTitle>
          <CardDescription>When will classes be held?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3 block">Days of Week</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.value}
                    checked={scheduleDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <Label
                    htmlFor={day.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduleTime">Class Time</Label>
              <Input
                id="scheduleTime"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Enrollment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStudents">Minimum Students</Label>
              <Input
                id="minStudents"
                type="number"
                placeholder="Optional"
                value={minStudents}
                onChange={(e) => setMinStudents(e.target.value)}
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Batch starts when minimum is reached
              </p>
            </div>

            <div>
              <Label htmlFor="maxStudents">Maximum Students</Label>
              <Input
                id="maxStudents"
                type="number"
                placeholder="Optional"
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                min="0"
                className={errors.maxStudents ? 'border-red-500' : ''}
              />
              {errors.maxStudents && (
                <p className="text-sm text-red-500 mt-1">{errors.maxStudents}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Registration closes when limit is reached
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Override */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Batch Pricing (Optional)
          </CardTitle>
          <CardDescription>
            Override course price for this batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="batchPrice">Batch Price</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                id="batchPrice"
                type="number"
                placeholder="Leave empty to use course price"
                value={batchPrice}
                onChange={(e) => setBatchPrice(e.target.value)}
                className="pl-8"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              If set, this price will be used instead of the course price
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {batch && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={status} onValueChange={(value) => setStatus(value as BatchStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="registration_open">Registration Open</SelectItem>
                <SelectItem value="registration_closed">Registration Closed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : batch ? 'Update Batch' : 'Create Batch'}
        </Button>
      </div>
    </form>
  )
}
