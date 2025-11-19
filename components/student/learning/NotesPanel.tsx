'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Tag, Download, Camera, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Note {
  id: string
  lessonId: string
  content: string
  timestamp?: string
  tags: string[]
  screenshots: string[]
  createdAt: string
  updatedAt: string
}

interface NotesPanelProps {
  lessonId: string
  lessonType: 'video' | 'document' | 'quiz' | 'assignment' | 'live_class'
  currentTime?: number
}

export default function NotesPanel({ lessonId, lessonType, currentTime }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [newTags, setNewTags] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')

  useEffect(() => {
    loadNotes()
  }, [lessonId])

  const loadNotes = async () => {
    try {
      const response = await fetch(`/api/student/notes?lessonId=${lessonId}`)
      const data = await response.json()
      if (data.success) {
        setNotes(data.data)
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
    }
  }

  const createNote = async () => {
    if (!newNote.trim()) return

    const noteData = {
      lessonId,
      content: newNote,
      timestamp: lessonType === 'video' && currentTime ? formatTime(currentTime) : undefined,
      tags: newTags.split(',').map(tag => tag.trim()).filter(Boolean),
      screenshots: []
    }

    try {
      const response = await fetch('/api/student/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      })

      const data = await response.json()
      if (data.success) {
        setNotes([data.data, ...notes])
        setNewNote('')
        setNewTags('')
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const updateNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/student/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent,
          tags: editTags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      })

      if (response.ok) {
        setNotes(notes.map(note => 
          note.id === noteId 
            ? { ...note, content: editContent, tags: editTags.split(',').map(tag => tag.trim()).filter(Boolean) }
            : note
        ))
        setEditingNote(null)
        setEditContent('')
        setEditTags('')
      }
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/student/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId))
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const takeScreenshot = async () => {
    try {
      // This would require additional implementation for actual screenshot capture
      // For now, we'll simulate adding a screenshot
      const screenshotUrl = '/placeholder-screenshot.png'
      
      const noteData = {
        lessonId,
        content: 'Screenshot taken',
        timestamp: lessonType === 'video' && currentTime ? formatTime(currentTime) : undefined,
        tags: ['screenshot'],
        screenshots: [screenshotUrl]
      }

      const response = await fetch('/api/student/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      })

      const data = await response.json()
      if (data.success) {
        setNotes([data.data, ...notes])
      }
    } catch (error) {
      console.error('Failed to take screenshot:', error)
    }
  }

  const downloadNotes = () => {
    const notesText = notes
      .filter(note => !searchQuery || note.content.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(note => {
        let text = `${note.content}\n`
        if (note.timestamp) text += `Time: ${note.timestamp}\n`
        if (note.tags.length > 0) text += `Tags: ${note.tags.join(', ')}\n`
        text += `Created: ${new Date(note.createdAt).toLocaleString()}\n\n`
        return text
      })
      .join('---\n\n')

    const blob = new Blob([notesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lesson-notes-${lessonId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredNotes = notes.filter(note => 
    !searchQuery || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const startEdit = (note: Note) => {
    setEditingNote(note.id)
    setEditContent(note.content)
    setEditTags(note.tags.join(', '))
  }

  const cancelEdit = () => {
    setEditingNote(null)
    setEditContent('')
    setEditTags('')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notes</h3>
          <div className="flex gap-1">
            {lessonType === 'video' && (
              <Button size="sm" variant="outline" onClick={takeScreenshot}>
                <Camera className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={downloadNotes}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* New Note Form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Tags (comma separated)"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="flex-1"
            />
            <Button onClick={createNote} disabled={!newNote.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {lessonType === 'video' && currentTime && (
            <p className="text-xs text-gray-500">
              Current time: {formatTime(currentTime)}
            </p>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {searchQuery ? 'No notes found' : 'No notes yet. Add your first note above!'}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-3">
                {editingNote === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                    />
                    <Input
                      placeholder="Tags (comma separated)"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateNote(note.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        {note.timestamp && (
                          <p className="text-xs text-blue-600 mt-1">
                            📹 {note.timestamp}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(note)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteNote(note.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Screenshots */}
                    {note.screenshots.length > 0 && (
                      <div className="mb-2">
                        {note.screenshots.map((screenshot, index) => (
                          <img
                            key={index}
                            src={screenshot}
                            alt="Screenshot"
                            className="max-w-full h-20 object-cover rounded border cursor-pointer"
                            onClick={() => window.open(screenshot, '_blank')}
                          />
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}\
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
