'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, Trash2 } from 'lucide-react'

interface RubricCriteria {
  id: string
  name: string
  description: string
  points: number
}

interface AssignmentFormProps {
  value?: any
  onChange: (assignment: any) => void
}

export function AssignmentForm({ value, onChange }: AssignmentFormProps) {
  const [assignmentData, setAssignmentData] = useState({
    title: value?.title || '',
    instructions: value?.instructions || '',
    dueDate: value?.dueDate || '',
    dueDateType: value?.dueDateType || 'fixed', // 'fixed' or 'relative'
    relativeDays: value?.relativeDays || 7,
    maxPoints: value?.maxPoints || 100,
    submissionType: value?.submissionType || 'both', // 'file', 'text', 'both'
    // File upload settings
    allowedFileTypes: value?.allowedFileTypes || ['pdf', 'doc', 'docx'],
    maxFileSize: value?.maxFileSize || 10, // MB
    maxFiles: value?.maxFiles || 1,
    // Text entry settings
    minWordCount: value?.minWordCount || 0,
    maxWordCount: value?.maxWordCount || 0,
    textEditorType: value?.textEditorType || 'rich', // 'plain' or 'rich'
    // Late submission
    allowLateSubmission: value?.allowLateSubmission || false,
    latePenaltyPercentage: value?.latePenaltyPercentage || 10,
    latePenaltyPer: value?.latePenaltyPer || 'day', // 'day' or 'hour'
    // Rubric
    useRubric: value?.useRubric || false,
    rubric: value?.rubric || [] as RubricCriteria[]
  })

  const updateField = (field: string, value: any) => {
    const updated = { ...assignmentData, [field]: value }
    setAssignmentData(updated)
    onChange(updated)
  }

  // Rubric management
  const addRubricCriteria = () => {
    const newCriteria: RubricCriteria = {
      id: `criteria-${Date.now()}`,
      name: '',
      description: '',
      points: 0
    }
    const updated = {
      ...assignmentData,
      rubric: [...assignmentData.rubric, newCriteria]
    }
    setAssignmentData(updated)
    onChange(updated)
  }

  const updateRubricCriteria = (id: string, field: string, value: any) => {
    const updated = {
      ...assignmentData,
      rubric: assignmentData.rubric.map((c: RubricCriteria) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    }
    setAssignmentData(updated)
    onChange(updated)
  }

  const removeRubricCriteria = (id: string) => {
    const updated = {
      ...assignmentData,
      rubric: assignmentData.rubric.filter((c: RubricCriteria) => c.id !== id)
    }
    setAssignmentData(updated)
    onChange(updated)
  }

  const totalRubricPoints = assignmentData.rubric.reduce(
    (sum: number, c: RubricCriteria) => sum + (c.points || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>
              Assignment Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={assignmentData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter assignment title"
              required
            />
          </div>

          <div>
            <Label>
              Instructions <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={assignmentData.instructions}
              onChange={(e) => updateField('instructions', e.target.value)}
              placeholder="Provide detailed instructions for students"
              rows={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Explain what students need to do and how they will be graded
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Due Date Type</Label>
              <Select
                value={assignmentData.dueDateType}
                onValueChange={(value) => updateField('dueDateType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Date</SelectItem>
                  <SelectItem value="relative">Relative to Enrollment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assignmentData.dueDateType === 'fixed' ? (
              <div>
                <Label>
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={assignmentData.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <Label>Days After Enrollment</Label>
                <Input
                  type="number"
                  value={assignmentData.relativeDays}
                  onChange={(e) => updateField('relativeDays', parseInt(e.target.value) || 7)}
                  min="1"
                />
              </div>
            )}
          </div>

          <div>
            <Label>
              Maximum Points <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={assignmentData.maxPoints}
              onChange={(e) => updateField('maxPoints', parseInt(e.target.value) || 100)}
              min="1"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Type */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={assignmentData.submissionType}
            onValueChange={(value) => updateField('submissionType', value)}
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="file" id="file" />
              <Label htmlFor="file" className="flex-1 cursor-pointer">
                <div className="font-medium">File Upload</div>
                <div className="text-sm text-gray-500">Students upload files</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="text" id="text" />
              <Label htmlFor="text" className="flex-1 cursor-pointer">
                <div className="font-medium">Text Entry</div>
                <div className="text-sm text-gray-500">Students type their response</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="flex-1 cursor-pointer">
                <div className="font-medium">Both</div>
                <div className="text-sm text-gray-500">Allow file upload and text entry</div>
              </Label>
            </div>
          </RadioGroup>

          {/* File Upload Settings */}
          {(assignmentData.submissionType === 'file' || assignmentData.submissionType === 'both') && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">File Upload Settings</h4>
              
              <div>
                <Label>Allowed File Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {['pdf', 'doc', 'docx', 'txt', 'zip', 'jpg', 'png'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignmentData.allowedFileTypes.includes(type)}
                        onChange={(e) => {
                          const types = e.target.checked
                            ? [...assignmentData.allowedFileTypes, type]
                            : assignmentData.allowedFileTypes.filter((t: string) => t !== type)
                          updateField('allowedFileTypes', types)
                        }}
                      />
                      <span className="text-sm">.{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={assignmentData.maxFileSize}
                    onChange={(e) => updateField('maxFileSize', parseInt(e.target.value) || 10)}
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Max Number of Files</Label>
                  <Input
                    type="number"
                    value={assignmentData.maxFiles}
                    onChange={(e) => updateField('maxFiles', parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text Entry Settings */}
          {(assignmentData.submissionType === 'text' || assignmentData.submissionType === 'both') && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Text Entry Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Word Count (Optional)</Label>
                  <Input
                    type="number"
                    value={assignmentData.minWordCount}
                    onChange={(e) => updateField('minWordCount', parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="0 = No minimum"
                  />
                </div>
                <div>
                  <Label>Max Word Count (Optional)</Label>
                  <Input
                    type="number"
                    value={assignmentData.maxWordCount}
                    onChange={(e) => updateField('maxWordCount', parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="0 = No maximum"
                  />
                </div>
              </div>

              <div>
                <Label>Text Editor Type</Label>
                <Select
                  value={assignmentData.textEditorType}
                  onValueChange={(value) => updateField('textEditorType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain">Plain Text</SelectItem>
                    <SelectItem value="rich">Rich Text (with formatting)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Late Submission */}
      <Card>
        <CardHeader>
          <CardTitle>Late Submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Late Submission</Label>
              <p className="text-sm text-gray-500">
                Permit students to submit after the due date
              </p>
            </div>
            <Switch
              checked={assignmentData.allowLateSubmission}
              onCheckedChange={(checked) => updateField('allowLateSubmission', checked)}
            />
          </div>

          {assignmentData.allowLateSubmission && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label>Late Penalty (%)</Label>
                <Input
                  type="number"
                  value={assignmentData.latePenaltyPercentage}
                  onChange={(e) => updateField('latePenaltyPercentage', parseInt(e.target.value) || 10)}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label>Penalty Per</Label>
                <Select
                  value={assignmentData.latePenaltyPer}
                  onValueChange={(value) => updateField('latePenaltyPer', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rubric */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Grading Rubric (Optional)</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Define grading criteria for consistent evaluation
              </p>
            </div>
            <Switch
              checked={assignmentData.useRubric}
              onCheckedChange={(checked) => updateField('useRubric', checked)}
            />
          </div>
        </CardHeader>
        {assignmentData.useRubric && (
          <CardContent className="space-y-4">
            {assignmentData.rubric.length > 0 && (
              <div className="space-y-3">
                {assignmentData.rubric.map((criteria: RubricCriteria) => (
                  <div key={criteria.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Criteria name (e.g., Content Quality)"
                          value={criteria.name}
                          onChange={(e) => updateRubricCriteria(criteria.id, 'name', e.target.value)}
                        />
                        <Textarea
                          placeholder="Description of what this criteria evaluates"
                          value={criteria.description}
                          onChange={(e) => updateRubricCriteria(criteria.id, 'description', e.target.value)}
                          rows={2}
                        />
                        <Input
                          type="number"
                          placeholder="Points"
                          value={criteria.points}
                          onChange={(e) => updateRubricCriteria(criteria.id, 'points', parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRubricCriteria(criteria.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Total Points:</span>
                  <span className="text-lg font-bold">{totalRubricPoints}</span>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={addRubricCriteria}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Criteria
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
