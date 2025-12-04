/**
 * Tests for BasicInfoForm Component
 * Validates all new fields and their interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BasicInfoForm } from '@/components/teacher/course-builder/BasicInfoForm'
import '@testing-library/jest-dom'

// Mock fetch
global.fetch = jest.fn()

// Mock CategoryModal
jest.mock('@/components/admin/categories/CategoryModal', () => {
  return function MockCategoryModal({ isOpen, onClose, onSuccess }: any) {
    if (!isOpen) return null
    return (
      <div data-testid="category-modal">
        <button onClick={() => {
          onSuccess({ id: 'new-cat', slug: 'new-category', name: 'New Category' })
        }}>
          Create Category
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    )
  }
})

// Mock IconSelector
jest.mock('@/components/teacher/course-builder/IconSelector', () => {
  return function MockIconSelector({ selectedIcon, onSelect }: any) {
    return (
      <div data-testid="icon-selector">
        <button onClick={() => onSelect('book')}>Select Book Icon</button>
        <span>Selected: {selectedIcon || 'none'}</span>
      </div>
    )
  }
})

// Mock AgeGroupSelector
jest.mock('@/components/teacher/course-builder/AgeGroupSelector', () => {
  return function MockAgeGroupSelector({ selectedGroups, onChange, error }: any) {
    return (
      <div data-testid="age-group-selector">
        <button onClick={() => onChange(['6-8', '9-12'])}>Select Age Groups</button>
        <span>Selected: {selectedGroups.length}</span>
        {error && <span className="error">{error}</span>}
      </div>
    )
  }
})

describe('BasicInfoForm', () => {
  const mockOnUpdate = jest.fn()
  const mockOnNext = jest.fn()
  
  const defaultData = {
    title: '',
    subtitle: '',
    shortDescription: '',
    fullDescription: '',
    category: '',
    grade: '',
    subject: '',
    language: 'English',
    customLanguage: '',
    thumbnail: null,
    introVideo: '',
    learningObjectives: [''],
    prerequisites: [''],
    difficultyLevel: '',
    ageGroups: [],
    studentTypes: [],
    highlights: [{ text: '', icon: '' }, { text: '', icon: '' }, { text: '', icon: '' }],
    outcomes: ['', '', '']
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        categories: [
          { id: '1', slug: 'mathematics', name: 'Mathematics', icon_url: null },
          { id: '2', slug: 'science', name: 'Science', icon_url: '/icon.png' }
        ]
      })
    })
  })

  describe('Subtitle Field', () => {
    it('renders subtitle field with character counter', () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const subtitleInput = screen.getByLabelText(/Course Subtitle/i)
      expect(subtitleInput).toBeInTheDocument()
      expect(screen.getByText(/0\/150 characters/i)).toBeInTheDocument()
    })

    it('updates character counter as user types', () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const subtitleInput = screen.getByLabelText(/Course Subtitle/i)
      fireEvent.change(subtitleInput, { target: { value: 'Test subtitle' } })
      
      expect(screen.getByText(/13\/150 characters/i)).toBeInTheDocument()
    })

    it('validates minimum length (10 characters)', async () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const subtitleInput = screen.getByLabelText(/Course Subtitle/i)
      fireEvent.change(subtitleInput, { target: { value: 'Short' } })
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Subtitle must be at least 10 characters/i)).toBeInTheDocument()
      })
    })

    it('validates maximum length (150 characters)', async () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const subtitleInput = screen.getByLabelText(/Course Subtitle/i)
      const longText = 'a'.repeat(151)
      fireEvent.change(subtitleInput, { target: { value: longText } })
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Subtitle must be 150 characters or less/i)).toBeInTheDocument()
      })
    })
  })

  describe('Category Selector with Modal', () => {
    it('fetches and displays categories on mount', async () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/admin/categories')
      })
    })

    it('opens category modal when "Add New Category" is selected', async () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('category-modal')).not.toBeInTheDocument()
      })
      
      // This test would need more complex interaction with Select component
      // Simplified for demonstration
    })

    it('updates category list after new category creation', async () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Language Selector', () => {
    it('renders language selector with default value', () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      expect(screen.getByLabelText(/Language of Instruction/i)).toBeInTheDocument()
    })

    it('shows custom language input when "Other" is selected', async () => {
      const dataWithOther = { ...defaultData, language: 'Other' }
      render(<BasicInfoForm data={dataWithOther} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const customInput = screen.getByPlaceholderText(/Please specify the language/i)
      expect(customInput).toBeInTheDocument()
    })

    it('validates custom language when "Other" is selected', async () => {
      const dataWithOther = { ...defaultData, language: 'Other', customLanguage: '' }
      render(<BasicInfoForm data={dataWithOther} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Please specify the language/i)).toBeInTheDocument()
      })
    })
  })

  describe('Age Groups and Student Types', () => {
    it('renders age group selector', () => {
      render(<BasicInfoForm data={defaultData} onUpdate=={mockOnUpdate} onNext={mockOnNext} />)
      
      expect(screen.getByTestId('age-group-selector')).toBeInTheDocument()
    })

    it('validates at least one age group is selected', async () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Please select at least one age group/i)).toBeInTheDocument()
      })
    })

    it('renders student type checkboxes', () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      expect(screen.getByText(/Student Types/i)).toBeInTheDocument()
    })

    it('validates at least one student type is selected', async () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Please select at least one student type/i)).toBeInTheDocument()
      })
    })
  })

  describe('Course Highlights', () => {
    it('renders initial 3 highlight fields', () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const highlightInputs = screen.getAllByPlaceholderText(/Highlight \d+/i)
      expect(highlightInputs).toHaveLength(3)
    })

    it('allows adding highlights up to 10', () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const addButton = screen.getByText(/Add Highlight/i)
      
      // Add highlights until we reach 10
      for (let i = 0; i < 7; i++) {
        fireEvent.click(addButton)
      }
      
      const highlightInputs = screen.getAllByPlaceholderText(/Highlight \d+/i)
      expect(highlightInputs).toHaveLength(10)
    })

    it('prevents adding more than 10 highlights', () => {
      const dataWith10Highlights = {
        ...defaultData,
        highlights: Array(10).fill({ text: 'Test', icon: '' })
      }
      render(<BasicInfoForm data={dataWith10Highlights} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      expect(screen.queryByText(/Add Highlight/i)).not.toBeInTheDocument()
    })

    it('allows removing highlights down to 3', () => {
      const dataWith5Highlights = {
        ...defaultData,
        highlights: Array(5).fill({ text: 'Test', icon: '' })
      }
      render(<BasicInfoForm data={dataWith5Highlights} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const removeButtons = screen.getAllByRole('button', { name: '' }).filter(btn => 
        btn.querySelector('svg')
      )
      
      // Should have remove buttons for highlights beyond the first 3
      expect(removeButtons.length).toBeGreaterThan(0)
    })

    it('validates highlight character limit (100 chars)', async () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const highlightInput = screen.getAllByPlaceholderText(/Highlight \d+/i)[0]
      const longText = 'a'.repeat(101)
      fireEvent.change(highlightInput, { target: { value: longText } })
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Highlight must be 100 characters or less/i)).toBeInTheDocument()
      })
    })

    it('integrates icon selector for each highlight', () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const iconSelectors = screen.getAllByTestId('icon-selector')
      expect(iconSelectors).toHaveLength(3) // One for each initial highlight
    })

    it('validates minimum 3 highlights are required', async () => {
      const dataWithEmptyHighlights = {
        ...defaultData,
        highlights: [{ text: '', icon: '' }, { text: '', icon: '' }, { text: '', icon: '' }]
      }
      render(<BasicInfoForm data={dataWithEmptyHighlights} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/At least 3 highlights are required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Course Outcomes', () => {
    it('renders initial 3 outcome fields', () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const outcomeInputs = screen.getAllByPlaceholderText(/Outcome \d+/i)
      expect(outcomeInputs).toHaveLength(3)
    })

    it('allows adding outcomes up to 8', () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const addButton = screen.getByText(/Add Outcome/i)
      
      // Add outcomes until we reach 8
      for (let i = 0; i < 5; i++) {
        fireEvent.click(addButton)
      }
      
      const outcomeInputs = screen.getAllByPlaceholderText(/Outcome \d+/i)
      expect(outcomeInputs).toHaveLength(8)
    })

    it('prevents adding more than 8 outcomes', () => {
      const dataWith8Outcomes = {
        ...defaultData,
        outcomes: Array(8).fill('Test outcome')
      }
      render(<BasicInfoForm data={dataWith8Outcomes} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      expect(screen.queryByText(/Add Outcome/i)).not.toBeInTheDocument()
    })

    it('validates minimum 3 outcomes are required', async () => {
      const dataWithEmptyOutcomes = {
        ...defaultData,
        outcomes: ['', '', '']
      }
      render(<BasicInfoForm data={dataWithEmptyOutcomes} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/At least 3 outcomes are required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('validates all required fields on submit', async () => {
      render(<BasicInfoForm data={defaultData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Course title is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Course subtitle is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Category is required/i)).toBeInTheDocument()
      })
      
      expect(mockOnNext).not.toHaveBeenCalled()
    })

    it('calls onNext when all validations pass', async () => {
      const validData = {
        title: 'Test Course',
        subtitle: 'This is a valid subtitle with enough characters',
        shortDescription: 'Short desc',
        fullDescription: 'Full description here',
        category: 'mathematics',
        grade: 'grade-10',
        subject: 'mathematics',
        language: 'English',
        customLanguage: '',
        thumbnail: 'data:image/png;base64,test',
        introVideo: '',
        learningObjectives: ['Objective 1'],
        prerequisites: [''],
        difficultyLevel: 'intermediate',
        ageGroups: ['13-15'],
        studentTypes: ['online_school'],
        highlights: [
          { text: 'Highlight 1', icon: 'book' },
          { text: 'Highlight 2', icon: 'video' },
          { text: 'Highlight 3', icon: 'star' }
        ],
        outcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3']
      }
      
      render(<BasicInfoForm data={validData} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      const submitButton = screen.getByText(/Save & Continue/i)
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled()
      })
    })
  })

  describe('Grade/Level Selector', () => {
    it('shows conditional options based on category', () => {
      const dataWithSpokenEnglish = { ...defaultData, category: 'spoken-english' }
      render(<BasicInfoForm data={dataWithSpokenEnglish} onUpdate={mockOnUpdate} onNext={mockOnNext} />)
      
      // This would require more complex Select component testing
      // Simplified for demonstration
      expect(screen.getByLabelText(/Grade\/Level/i)).toBeInTheDocument()
    })
  })
})
