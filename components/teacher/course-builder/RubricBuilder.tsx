'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Edit, GripVertical, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface RubricCriteria {
  id: string
  name: string
  description: string
  points: number
  weight?: number
  levels?: RubricLevel[]
}

export interface RubricLevel {
  id: string
  name: string
  description: string
  points: number
}

interface RubricBuilderProps {
  value: RubricCriteria[]
  onChange: (rubric: RubricCriteria[]) => void
  maxPoints?: number
  useWeights?: boolean
  useLevels?: boolean
}

export function RubricBuilder({
  value = [],
  onChange,
  maxPoints = 100,
  useWeights = false,
  useLevels = false
}: RubricBuilderProps) {
  const [rubric, setRubric] = useState<RubricCriteria[]>(value)
  const [editingCriteria, setEditingCriteria] = useState<RubricCriteria | null>(null)
  const [showCriteriaModal, setShowCriteriaModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const updateRubric = (newRubric: RubricCriteria[]) => {
    setRubric(newRubric)
    onChange(newRubric)
  }

  const addCriteria = () => {
    const newCriteria: RubricCriteria = {
      id: `criteria-${Date.now()}`,
      name: '',
      description: '',
      points: 0,
      weight: useWeights ? 1 : undefined,
      levels: useLevels ? [] : undefined
    }
    setEditingCriteria(newCriteria)
    setShowCriteriaModal(true)
  }

  const editCriteria = (criteria: RubricCriteria) => {
    setEditingCriteria(criteria)
    setShowCriteriaModal(true)
  }

  const saveCriteria = (criteria: RubricCriteria) => {
    const existing = rubric.find(c => c.id === criteria.id)
    if (existing) {
      updateRubric(rubric.map(c => c.id === criteria.id ? criteria : c))
    } else {
      updateRubric([...rubric, criteria])
    }
    setShowCriteriaModal(false)
    setEditingCriteria(null)
  }

  const deleteCriteria = (id: string) => {
    updateRubric(rubric.filter(c => c.id !== id))
  }

  const moveCriteria = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= rubric.length) return

    const newRubric = [...rubric]
    const temp = newRubric[index]
    newRubric[index] = newRubric[newIndex]
    newRubric[newIndex] = temp
    updateRubric(newRubric)
  }

  const totalPoints = rubric.reduce((sum, c) => sum + (c.points || 0), 0)
  const totalWeight = rubric.reduce((sum, c) => sum + (c.weight || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rubric Builder</h3>
          <p className="text-sm text-gray-600">
            Define grading criteria for this assignment
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
            disabled={rubric.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={addCriteria}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Criteria
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {rubric.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Criteria</p>
                <p className="text-2xl font-bold">{rubric.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
                {maxPoints && totalPoints !== maxPoints && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Target: {maxPoints}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          {useWeights && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Weight</p>
                  <p className="text-2xl font-bold">{totalWeight.toFixed(1)}</p>
                  {totalWeight !== 1 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Should equal 1.0
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Criteria List */}
      {rubric.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No criteria added yet</p>
            <Button onClick={addCriteria}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Criteria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rubric.map((criteria, index) => (
            <Card key={criteria.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveCriteria(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveCriteria(index, 'down')}
                      disabled={index === rubric.length - 1}
                    >
                      ↓
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{criteria.name || 'Untitled Criteria'}</h4>
                        {criteria.description && (
                          <p className="text-sm text-gray-600 mt-1">{criteria.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{criteria.points} pts</Badge>
                        {useWeights && criteria.weight && (
                          <Badge variant="outline">{(criteria.weight * 100).toFixed(0)}%</Badge>
                        )}
                      </div>
                    </div>

                    {useLevels && criteria.levels && criteria.levels.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {criteria.levels.map(level => (
                          <Badge key={level.id} variant="outline" className="text-xs">
                            {level.name}: {level.points}pts
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editCriteria(criteria)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCriteria(criteria.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Criteria Modal */}
      {showCriteriaModal && editingCriteria && (
        <CriteriaModal
          criteria={editingCriteria}
          onSave={saveCriteria}
          onClose={() => {
            setShowCriteriaModal(false)
            setEditingCriteria(null)
          }}
          useWeights={useWeights}
          useLevels={useLevels}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <RubricPreview
          rubric={rubric}
          onClose={() => setShowPreview(false)}
          useWeights={useWeights}
          useLevels={useLevels}
        />
      )}
    </div>
  )
}

// Criteria Modal Component
function CriteriaModal({
  criteria,
  onSave,
  onClose,
  useWeights,
  useLevels
}: {
  criteria: RubricCriteria
  onSave: (criteria: RubricCriteria) => void
  onClose: () => void
  useWeights: boolean
  useLevels: boolean
}) {
  const [formData, setFormData] = useState(criteria)

  const addLevel = () => {
    const newLevel: RubricLevel = {
      id: `level-${Date.now()}`,
      name: '',
      description: '',
      points: 0
    }
    setFormData({
      ...formData,
      levels: [...(formData.levels || []), newLevel]
    })
  }

  const updateLevel = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      levels: formData.levels?.map(l => l.id === id ? { ...l, [field]: value } : l)
    })
  }

  const deleteLevel = (id: string) => {
    setFormData({
      ...formData,
      levels: formData.levels?.filter(l => l.id !== id)
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {criteria.id.startsWith('criteria-') && criteria.name === '' ? 'Add' : 'Edit'} Criteria
          </DialogTitle>
          <DialogDescription>
            Define the grading criteria and point allocation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Criteria Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Content Quality, Organization, Grammar"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this criteria evaluates..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              />
            </div>

            {useWeights && (
              <div>
                <Label htmlFor="weight">Weight (0-1)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.weight || 0}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>

          {useLevels && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Performance Levels</Label>
                <Button type="button" size="sm" onClick={addLevel}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Level
                </Button>
              </div>

              {formData.levels && formData.levels.length > 0 ? (
                <div className="space-y-2">
                  {formData.levels.map((level) => (
                    <Card key={level.id}>
                      <CardContent className="p-3">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-3">
                            <Input
                              placeholder="Level name"
                              value={level.name}
                              onChange={(e) => updateLevel(level.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="col-span-6">
                            <Input
                              placeholder="Description"
                              value={level.description}
                              onChange={(e) => updateLevel(level.id, 'description', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              placeholder="Points"
                              value={level.points}
                              onChange={(e) => updateLevel(level.id, 'points', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteLevel(level.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No levels added. Click "Add Level" to create performance levels.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onSave(formData)}
            disabled={!formData.name || formData.points <= 0}
          >
            Save Criteria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Preview Modal Component
function RubricPreview({
  rubric,
  onClose,
  useWeights,
  useLevels
}: {
  rubric: RubricCriteria[]
  onClose: () => void
  useWeights: boolean
  useLevels: boolean
}) {
  const totalPoints = rubric.reduce((sum, c) => sum + c.points, 0)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rubric Preview</DialogTitle>
          <DialogDescription>
            This is how students will see the grading rubric
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">
              Total Points: {totalPoints}
            </p>
          </div>

          <div className="space-y-4">
            {rubric.map((criteria) => (
              <Card key={criteria.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{criteria.name}</CardTitle>
                      {criteria.description && (
                        <p className="text-sm text-gray-600 mt-1">{criteria.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className="text-lg">{criteria.points} pts</Badge>
                      {useWeights && criteria.weight && (
                        <p className="text-xs text-gray-600 mt-1">
                          {(criteria.weight * 100).toFixed(0)}% weight
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {useLevels && criteria.levels && criteria.levels.length > 0 && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                      {criteria.levels.map((level) => (
                        <div key={level.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm">{level.name}</p>
                            <Badge variant="outline">{level.points}pts</Badge>
                          </div>
                          <p className="text-xs text-gray-600">{level.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
