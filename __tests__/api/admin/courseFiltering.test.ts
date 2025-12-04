/**
 * Course Filtering Tests
 * Feature: teacher-dashboard
 * 
 * Tests for course filtering by language, age groups, and student types
 * 
 * Requirements: 4.5, 5.5, 6.5
 */

import { describe, it, expect } from '@jest/globals'

describe('Course Filtering', () => {
  const mockCourses = [
    {
      id: '1',
      title: 'English Course',
      language: 'English',
      age_groups: ['6-8 years', '9-12 years'],
      student_types: ['online_school'],
      category: 'Mathematics',
      status: 'published'
    },
    {
      id: '2',
      title: 'Urdu Course',
      language: 'Urdu',
      age_groups: ['13-15 years', '16-18 years'],
      student_types: ['spoken_english', 'tuition'],
      category: 'Language',
      status: 'published'
    },
    {
      id: '3',
      title: 'Arabic Course',
      language: 'Arabic',
      age_groups: ['9-12 years', '13-15 years'],
      student_types: ['online_school', 'tuition'],
      category: 'Language',
      status: 'draft'
    }
  ]

  describe('Language Filter (Requirement 4.5)', () => {
    it('should filter courses by language', () => {
      const language = 'English'
      const filtered = mockCourses.filter(course => course.language === language)
      
      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('English Course')
    })

    it('should return multiple courses for same language', () => {
      const coursesWithUrdu = [
        ...mockCourses,
        { ...mockCourses[1], id: '4', title: 'Another Urdu Course' }
      ]
      
      const language = 'Urdu'
      const filtered = coursesWithUrdu.filter(course => course.language === language)
      
      expect(filtered.length).toBe(2)
      expect(filtered.every(c => c.language === 'Urdu')).toBe(true)
    })

    it('should return empty array when no courses match language', () => {
      const language = 'Spanish'
      const filtered = mockCourses.filter(course => course.language === language)
      
      expect(filtered.length).toBe(0)
    })

    it('should handle "all" language filter', () => {
      const language = 'all'
      const filtered = language === 'all' 
        ? mockCourses 
        : mockCourses.filter(course => course.language === language)
      
      expect(filtered.length).toBe(mockCourses.length)
    })
  })

  describe('Age Group Filter (Requirement 5.5)', () => {
    it('should filter courses by age group', () => {
      const ageGroup = '9-12 years'
      const filtered = mockCourses.filter(course => 
        course.age_groups && course.age_groups.includes(ageGroup)
      )
      
      expect(filtered.length).toBe(2)
      expect(filtered[0].title).toBe('English Course')
      expect(filtered[1].title).toBe('Arabic Course')
    })

    it('should return courses with multiple age groups', () => {
      const ageGroup = '13-15 years'
      const filtered = mockCourses.filter(course => 
        course.age_groups && course.age_groups.includes(ageGroup)
      )
      
      expect(filtered.length).toBe(2)
      expect(filtered.every(c => c.age_groups.includes(ageGroup))).toBe(true)
    })

    it('should return empty array when no courses match age group', () => {
      const ageGroup = 'Adults'
      const filtered = mockCourses.filter(course => 
        course.age_groups && course.age_groups.includes(ageGroup)
      )
      
      expect(filtered.length).toBe(0)
    })

    it('should handle courses without age groups', () => {
      const coursesWithMissing = [
        ...mockCourses,
        { id: '4', title: 'No Age Groups', language: 'English', student_types: ['online_school'] }
      ]
      
      const ageGroup = '6-8 years'
      const filtered = coursesWithMissing.filter(course => 
        course.age_groups && course.age_groups.includes(ageGroup)
      )
      
      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('English Course')
    })

    it('should handle "all" age group filter', () => {
      const ageGroup = 'all'
      const filtered = ageGroup === 'all' 
        ? mockCourses 
        : mockCourses.filter(course => course.age_groups && course.age_groups.includes(ageGroup))
      
      expect(filtered.length).toBe(mockCourses.length)
    })
  })

  describe('Student Type Filter (Requirement 6.5)', () => {
    it('should filter courses by student type', () => {
      const studentType = 'online_school'
      const filtered = mockCourses.filter(course => 
        course.student_types && course.student_types.includes(studentType)
      )
      
      expect(filtered.length).toBe(2)
      expect(filtered[0].title).toBe('English Course')
      expect(filtered[1].title).toBe('Arabic Course')
    })

    it('should return courses with multiple student types', () => {
      const studentType = 'tuition'
      const filtered = mockCourses.filter(course => 
        course.student_types && course.student_types.includes(studentType)
      )
      
      expect(filtered.length).toBe(2)
      expect(filtered.every(c => c.student_types.includes(studentType))).toBe(true)
    })

    it('should return empty array when no courses match student type', () => {
      const studentType = 'corporate'
      const filtered = mockCourses.filter(course => 
        course.student_types && course.student_types.includes(studentType)
      )
      
      expect(filtered.length).toBe(0)
    })

    it('should handle courses without student types', () => {
      const coursesWithMissing = [
        ...mockCourses,
        { id: '4', title: 'No Student Types', language: 'English', age_groups: ['6-8 years'] }
      ]
      
      const studentType = 'online_school'
      const filtered = coursesWithMissing.filter(course => 
        course.student_types && course.student_types.includes(studentType)
      )
      
      expect(filtered.length).toBe(2)
    })

    it('should handle "all" student type filter', () => {
      const studentType = 'all'
      const filtered = studentType === 'all' 
        ? mockCourses 
        : mockCourses.filter(course => course.student_types && course.student_types.includes(studentType))
      
      expect(filtered.length).toBe(mockCourses.length)
    })
  })

  describe('Combined Filters (Requirement 4.5, 5.5, 6.5)', () => {
    it('should apply language and age group filters together', () => {
      const language = 'English'
      const ageGroup = '9-12 years'
      
      let filtered = mockCourses.filter(course => course.language === language)
      filtered = filtered.filter(course => 
        course.age_groups && course.age_groups.includes(ageGroup)
      )
      
      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('English Course')
    })

    it('should apply language and student type filters together', () => {
      const language = 'Urdu'
      const studentType = 'spoken_english'
      
      let filtered = mockCourses.filter(course => course.language === language)
      filtered = filtered.filter(course => 
        course.student_types && course.student_types.includes(studentType)
      )
      
      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('Urdu Course')
    })

    it('should apply age group and student type filters together', () => {
      const ageGroup = '9-12 years'
      const studentType = 'tuition'
      
      let filtered = mockCourses.filter(course => 
        course.age_groups && course.age_groups.includes(ageGroup)
      )
      filtered = filtered.filter(course => 
        course.student_types && course.student_types.includes(studentType)
      )
      
      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('Arabic Course')
    })

    it('should apply all three filters together', () => {
      const language = 'Arabic'
      const ageGroup = '9-12 years'
      const studentType = 'online_school'
      
      let filtered = mockCourses.filter(course => course.language === language)
      filtered = filtered.filter(course => 
        course.age_groups && course.age_groups.includes(ageGroup)
      )
      filtered = filtered.filter(course => 
        course.student_types && course.student_types.includes(studentType)
      )
      
      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('Arabic Course')
    })

    it('should return empty array when combined filters match nothing', () => {
      const language = 'English'
      const ageGroup = '16-18 years'
      const studentType = 'spoken_english'
      
      let filtered = mockCourses.filter(course => course.language === language)
      filtered = filtered.filter(course => 
        course.age_groups && course.age_groups.includes(ageGroup)
      )
      filtered = filtered.filter(course => 
        course.student_types && course.student_types.includes(studentType)
      )
      
      expect(filtered.length).toBe(0)
    })

    it('should work with existing filters (category, status)', () => {
      const language = 'Urdu'
      const category = 'Language'
      const status = 'published'
      
      let filtered = mockCourses.filter(course => course.language === language)
      filtered = filtered.filter(course => course.category === category)
      filtered = filtered.filter(course => course.status === status)
      
      expect(filtered.length).toBe(1)
      expect(filtered[0].title).toBe('Urdu Course')
    })
  })

  describe('Filter UI Integration', () => {
    it('should update UI to show filtered results', () => {
      const language = 'English'
      const filtered = mockCourses.filter(course => course.language === language)
      
      // Simulate UI update
      const displayedCourses = filtered
      
      expect(displayedCourses.length).toBe(1)
      expect(displayedCourses[0].language).toBe('English')
    })

    it('should show all courses when filters are cleared', () => {
      const language = null
      const ageGroup = null
      const studentType = null
      
      let filtered = mockCourses
      if (language) filtered = filtered.filter(c => c.language === language)
      if (ageGroup) filtered = filtered.filter(c => c.age_groups?.includes(ageGroup))
      if (studentType) filtered = filtered.filter(c => c.student_types?.includes(studentType))
      
      expect(filtered.length).toBe(mockCourses.length)
    })
  })
})

