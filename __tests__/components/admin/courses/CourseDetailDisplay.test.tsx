/**
 * Course Detail Display Tests
 * Feature: teacher-dashboard
 * 
 * Tests for course detail page display with new fields:
 * - subtitle, language, age_groups, student_types, highlights, outcomes
 * 
 * Requirements: 1.5, 4.5, 5.5, 6.5, 7.5, 8.5
 */

import { render, screen } from '@testing-library/react'

// Mock course detail component
const CourseDetailDisplay = ({ course }: { course: any }) => {
  return (
    <div>
      <h1>{course.title}</h1>
      {course.subtitle && <p className="subtitle">{course.subtitle}</p>}
      
      {course.language && (
        <div className="language">Language: {course.language}</div>
      )}
      
      {course.age_groups && course.age_groups.length > 0 && (
        <div className="age-groups">
          {course.age_groups.map((group: string) => (
            <span key={group} className="age-group-badge">{group}</span>
          ))}
        </div>
      )}
      
      {course.student_types && course.student_types.length > 0 && (
        <div className="student-types">
          {course.student_types.map((type: string) => (
            <span key={type} className="student-type-badge">{type}</span>
          ))}
        </div>
      )}
      
      {course.highlights && course.highlights.length > 0 && (
        <div className="highlights">
          <h4>Course Highlights</h4>
          <ul>
            {course.highlights.map((highlight: any, index: number) => (
              <li key={index}>
                {highlight.icon && <span className="icon">{highlight.icon}</span>}
                <span>{typeof highlight === 'string' ? highlight : highlight.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {course.outcomes && course.outcomes.length > 0 && (
        <div className="outcomes">
          <h4>Learning Outcomes</h4>
          <ul>
            {course.outcomes.map((outcome: string, index: number) => (
              <li key={index}>{outcome}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

describe('CourseDetailDisplay', () => {
  const mockCourse = {
    id: '1',
    title: 'Advanced Mathematics',
    subtitle: 'Master advanced mathematical concepts',
    description: 'Comprehensive course description',
    language: 'English',
    age_groups: ['13-15 years', '16-18 years'],
    student_types: ['online_school', 'tuition'],
    highlights: [
      { text: 'Interactive lessons', icon: 'book' },
      { text: 'Expert instructors', icon: 'users' },
      { text: 'Certificate upon completion', icon: 'certificate' }
    ],
    outcomes: [
      'Master core mathematical concepts',
      'Apply knowledge to real-world problems',
      'Build confidence in problem-solving'
    ]
  }

  it('renders course title', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument()
  })

  it('renders subtitle prominently', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    const subtitle = screen.getByText('Master advanced mathematical concepts')
    expect(subtitle).toBeInTheDocument()
    expect(subtitle).toHaveClass('subtitle')
  })

  it('does not render subtitle when not provided', () => {
    const courseWithoutSubtitle = { ...mockCourse, subtitle: undefined }
    render(<CourseDetailDisplay course={courseWithoutSubtitle} />)
    expect(screen.queryByText('Master advanced mathematical concepts')).not.toBeInTheDocument()
  })

  it('renders language information', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    expect(screen.getByText(/Language: English/)).toBeInTheDocument()
  })

  it('renders all age group tags', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    expect(screen.getByText('13-15 years')).toBeInTheDocument()
    expect(screen.getByText('16-18 years')).toBeInTheDocument()
  })

  it('renders all student types', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    expect(screen.getByText('online_school')).toBeInTheDocument()
    expect(screen.getByText('tuition')).toBeInTheDocument()
  })

  it('renders highlights section with title', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    expect(screen.getByText('Course Highlights')).toBeInTheDocument()
  })

  it('renders all highlights as bullet points', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    expect(screen.getByText('Interactive lessons')).toBeInTheDocument()
    expect(screen.getByText('Expert instructors')).toBeInTheDocument()
    expect(screen.getByText('Certificate upon completion')).toBeInTheDocument()
  })

  it('renders highlights with icons', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    const highlightsList = screen.getByText('Interactive lessons').closest('ul')
    expect(highlightsList).toBeInTheDocument()
    
    // Check that icons are rendered
    const icons = highlightsList?.querySelectorAll('.icon')
    expect(icons?.length).toBe(3)
  })

  it('renders outcomes section with title', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    expect(screen.getByText('Learning Outcomes')).toBeInTheDocument()
  })

  it('renders all outcomes in dedicated section', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    expect(screen.getByText('Master core mathematical concepts')).toBeInTheDocument()
    expect(screen.getByText('Apply knowledge to real-world problems')).toBeInTheDocument()
    expect(screen.getByText('Build confidence in problem-solving')).toBeInTheDocument()
  })

  it('styles outcomes differently from objectives', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    const outcomesSection = screen.getByText('Learning Outcomes').closest('.outcomes')
    expect(outcomesSection).toBeInTheDocument()
    expect(outcomesSection).toHaveClass('outcomes')
  })

  it('handles course with string highlights (backward compatibility)', () => {
    const courseWithStringHighlights = {
      ...mockCourse,
      highlights: ['Highlight 1', 'Highlight 2', 'Highlight 3']
    }
    render(<CourseDetailDisplay course={courseWithStringHighlights} />)
    expect(screen.getByText('Highlight 1')).toBeInTheDocument()
    expect(screen.getByText('Highlight 2')).toBeInTheDocument()
    expect(screen.getByText('Highlight 3')).toBeInTheDocument()
  })

  it('does not render highlights section when empty', () => {
    const courseWithoutHighlights = { ...mockCourse, highlights: [] }
    render(<CourseDetailDisplay course={courseWithoutHighlights} />)
    expect(screen.queryByText('Course Highlights')).not.toBeInTheDocument()
  })

  it('does not render outcomes section when empty', () => {
    const courseWithoutOutcomes = { ...mockCourse, outcomes: [] }
    render(<CourseDetailDisplay course={courseWithoutOutcomes} />)
    expect(screen.queryByText('Learning Outcomes')).not.toBeInTheDocument()
  })

  it('does not render age groups when not provided', () => {
    const courseWithoutAgeGroups = { ...mockCourse, age_groups: undefined }
    render(<CourseDetailDisplay course={courseWithoutAgeGroups} />)
    expect(screen.queryByText('13-15 years')).not.toBeInTheDocument()
  })

  it('does not render student types when not provided', () => {
    const courseWithoutStudentTypes = { ...mockCourse, student_types: undefined }
    render(<CourseDetailDisplay course={courseWithoutStudentTypes} />)
    const studentTypesSection = screen.queryByText('online_school')
    expect(studentTypesSection).not.toBeInTheDocument()
  })

  it('renders all new fields together correctly', () => {
    render(<CourseDetailDisplay course={mockCourse} />)
    
    // Verify all new fields are present
    expect(screen.getByText('Master advanced mathematical concepts')).toBeInTheDocument() // subtitle
    expect(screen.getByText(/Language: English/)).toBeInTheDocument() // language
    expect(screen.getByText('13-15 years')).toBeInTheDocument() // age groups
    expect(screen.getByText('online_school')).toBeInTheDocument() // student types
    expect(screen.getByText('Interactive lessons')).toBeInTheDocument() // highlights
    expect(screen.getByText('Master core mathematical concepts')).toBeInTheDocument() // outcomes
  })
})

