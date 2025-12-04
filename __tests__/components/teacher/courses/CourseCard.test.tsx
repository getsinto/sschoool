import { render, screen, fireEvent } from '@testing-library/react'
import { CourseCard } from '@/components/teacher/courses/CourseCard'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('CourseCard', () => {
  const mockCourse = {
    id: '1',
    title: 'Test Course',
    subtitle: 'A comprehensive test course',
    thumbnail: '/test-image.jpg',
    category: 'Mathematics',
    grade: 'Grade 10',
    subject: 'Algebra',
    language: 'English',
    age_groups: ['13-15', '16-18'],
    student_types: ['Online School', 'Tuition'],
    enrollments: 150,
    rating: 4.5,
    revenue: 5000,
    status: 'published',
    lastUpdated: '2024-01-15'
  }

  const mockHandlers = {
    onEdit: jest.fn(),
    onDuplicate: jest.fn(),
    onArchive: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders course title', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    expect(screen.getByText('Test Course')).toBeInTheDocument()
  })

  it('renders course subtitle when provided', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    expect(screen.getByText('A comprehensive test course')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const courseWithoutSubtitle = { ...mockCourse, subtitle: undefined }
    render(<CourseCard course={courseWithoutSubtitle} {...mockHandlers} />)
    expect(screen.queryByText('A comprehensive test course')).not.toBeInTheDocument()
  })

  it('renders language badge when provided', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('renders age group badges', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    expect(screen.getByText('13-15')).toBeInTheDocument()
    expect(screen.getByText('16-18')).toBeInTheDocument()
  })

  it('does not render age groups when not provided', () => {
    const courseWithoutAgeGroups = { ...mockCourse, age_groups: undefined }
    render(<CourseCard course={courseWithoutAgeGroups} {...mockHandlers} />)
    expect(screen.queryByText('13-15')).not.toBeInTheDocument()
  })

  it('renders category, grade, and subject badges', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    expect(screen.getByText('Mathematics')).toBeInTheDocument()
    expect(screen.getByText('Grade 10')).toBeInTheDocument()
    expect(screen.getByText('Algebra')).toBeInTheDocument()
  })

  it('renders course statistics', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    expect(screen.getByText('150')).toBeInTheDocument() // enrollments
    expect(screen.getByText('4.5')).toBeInTheDocument() // rating
    expect(screen.getByText('5000')).toBeInTheDocument() // revenue
  })

  it('renders status badge with correct styling', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    const statusBadge = screen.getByText('published')
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('renders draft status with correct styling', () => {
    const draftCourse = { ...mockCourse, status: 'draft' }
    render(<CourseCard course={draftCourse} {...mockHandlers} />)
    const statusBadge = screen.getByText('draft')
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('renders archived status with correct styling', () => {
    const archivedCourse = { ...mockCourse, status: 'archived' }
    render(<CourseCard course={archivedCourse} {...mockHandlers} />)
    const statusBadge = screen.getByText('archived')
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    
    // Open dropdown menu
    const moreButton = screen.getByRole('button', { name: '' })
    fireEvent.click(moreButton)
    
    // Click edit option
    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith('1')
  })

  it('calls onDuplicate when duplicate button is clicked', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    
    // Open dropdown menu
    const moreButton = screen.getByRole('button', { name: '' })
    fireEvent.click(moreButton)
    
    // Click duplicate option
    const duplicateButton = screen.getByText('Duplicate')
    fireEvent.click(duplicateButton)
    
    expect(mockHandlers.onDuplicate).toHaveBeenCalledWith('1')
  })

  it('calls onArchive when archive button is clicked', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    
    // Open dropdown menu
    const moreButton = screen.getByRole('button', { name: '' })
    fireEvent.click(moreButton)
    
    // Click archive option
    const archiveButton = screen.getByText('Archive')
    fireEvent.click(archiveButton)
    
    expect(mockHandlers.onArchive).toHaveBeenCalledWith('1')
  })

  it('renders view button with correct link', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    const viewButton = screen.getByText('View').closest('a')
    expect(viewButton).toHaveAttribute('href', '/dashboard/teacher/courses/1')
  })

  it('renders last updated date', () => {
    render(<CourseCard course={mockCourse} {...mockHandlers} />)
    expect(screen.getByText(/Updated 2024-01-15/)).toBeInTheDocument()
  })

  it('handles missing optional handlers gracefully', () => {
    render(<CourseCard course={mockCourse} />)
    
    // Open dropdown menu
    const moreButton = screen.getByRole('button', { name: '' })
    fireEvent.click(moreButton)
    
    // Click edit option - should not throw error
    const editButton = screen.getByText('Edit')
    expect(() => fireEvent.click(editButton)).not.toThrow()
  })
})
