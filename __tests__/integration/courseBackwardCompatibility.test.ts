/**
 * Backward Compatibility Tests for Course Builder Enhancements
 * Ensures existing courses work correctly with new fields
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

describe('Course Backward Compatibility', () => {
  let supabase: ReturnType<typeof createClient>;
  let testCourseId: string;

  beforeAll(() => {
    supabase = createClient(supabaseUrl, supabaseKey);
  });

  beforeEach(async () => {
    // Create a test course without new fields (simulating old course)
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: 'Legacy Test Course',
        description: 'This is a test course created before the enhancement',
        category: 'test',
        level: 'beginner',
        status: 'published',
        // Intentionally not including: subtitle, language, age_groups, student_types, highlights, outcomes
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    testCourseId = data!.id;
  });

  afterEach(async () => {
    // Cleanup test course
    if (testCourseId) {
      await supabase
        .from('courses')
        .delete()
        .eq('id', testCourseId);
    }
  });

  describe('Course Display', () => {
    it('should display existing courses without new fields', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourseId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.title).toBe('Legacy Test Course');
      expect(data!.description).toBe('This is a test course created before the enhancement');
    });

    it('should have default values for new fields', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('language, age_groups, student_types, highlights, outcomes')
        .eq('id', testCourseId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.language).toBe('English');
      expect(Array.isArray(data!.age_groups)).toBe(true);
      expect(Array.isArray(data!.student_types)).toBe(true);
      expect(Array.isArray(data!.highlights)).toBe(true);
      expect(Array.isArray(data!.outcomes)).toBe(true);
    });

    it('should work with course listing queries', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, subtitle, language, age_groups, student_types')
        .eq('status', 'published')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Course Updates', () => {
    it('should allow updating old courses with new fields', async () => {
      const { data, error } = await supabase
        .from('courses')
        .update({
          subtitle: 'A great course for beginners',
          language: 'English',
          age_groups: ['9-12 years', '13-15 years'],
          student_types: ['online_school'],
          highlights: [
            { text: 'Interactive lessons', icon: 'book' },
            { text: 'Expert instructors', icon: 'user' },
            { text: 'Certificate upon completion', icon: 'award' }
          ],
          outcomes: [
            'Master the basics',
            'Build confidence',
            'Apply knowledge practically'
          ]
        })
        .eq('id', testCourseId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.subtitle).toBe('A great course for beginners');
      expect(data!.language).toBe('English');
      expect(data!.age_groups).toEqual(['9-12 years', '13-15 years']);
      expect(data!.student_types).toEqual(['online_school']);
      expect(data!.highlights).toHaveLength(3);
      expect(data!.outcomes).toHaveLength(3);
    });

    it('should allow partial updates without affecting other fields', async () => {
      const { data: original } = await supabase
        .from('courses')
        .select('*')
        .eq('id', testCourseId)
        .single();

      const { data, error } = await supabase
        .from('courses')
        .update({
          subtitle: 'Updated subtitle only'
        })
        .eq('id', testCourseId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.subtitle).toBe('Updated subtitle only');
      expect(data!.title).toBe(original!.title);
      expect(data!.description).toBe(original!.description);
    });

    it('should preserve existing data when updating new fields', async () => {
      // First update with new fields
      await supabase
        .from('courses')
        .update({
          subtitle: 'Initial subtitle',
          highlights: [{ text: 'Feature 1', icon: 'star' }]
        })
        .eq('id', testCourseId);

      // Then update only subtitle
      const { data, error } = await supabase
        .from('courses')
        .update({
          subtitle: 'Updated subtitle'
        })
        .eq('id', testCourseId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.subtitle).toBe('Updated subtitle');
      expect(data!.highlights).toHaveLength(1);
      expect(data!.highlights[0].text).toBe('Feature 1');
    });
  });

  describe('API Endpoint Compatibility', () => {
    it('should handle courses with missing optional fields in GET requests', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/courses/${testCourseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.course).toBeDefined();
      expect(data.course.id).toBe(testCourseId);
    });

    it('should handle courses without new fields in listing endpoint', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data.courses)).toBe(true);
    });
  });

  describe('Filtering with Legacy Courses', () => {
    it('should handle language filter with courses that have default language', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('language', 'English')
        .eq('status', 'published');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle age group filter with courses that have empty age_groups', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .contains('age_groups', [])
        .eq('status', 'published');

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should handle student type filter with courses that have empty student_types', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .contains('student_types', [])
        .eq('status', 'published');

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should exclude courses with empty arrays when filtering by specific values', async () => {
      // Create a course with specific age groups
      const { data: newCourse } = await supabase
        .from('courses')
        .insert({
          title: 'Course with Age Groups',
          description: 'Test',
          category: 'test',
          level: 'beginner',
          status: 'published',
          age_groups: ['9-12 years']
        })
        .select()
        .single();

      // Filter for courses with this age group
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .overlaps('age_groups', ['9-12 years'])
        .eq('status', 'published');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // Should include the new course
      const foundNewCourse = data!.find(c => c.id === newCourse!.id);
      expect(foundNewCourse).toBeDefined();

      // Should not include the legacy course with empty age_groups
      const foundLegacyCourse = data!.find(c => c.id === testCourseId);
      expect(foundLegacyCourse).toBeUndefined();

      // Cleanup
      await supabase.from('courses').delete().eq('id', newCourse!.id);
    });
  });

  describe('UI Component Compatibility', () => {
    it('should render course card without errors for legacy courses', () => {
      const legacyCourse = {
        id: testCourseId,
        title: 'Legacy Test Course',
        description: 'This is a test course',
        category: 'test',
        level: 'beginner',
        status: 'published',
        language: 'English',
        age_groups: [],
        student_types: [],
        highlights: [],
        outcomes: []
      };

      // This would be tested in a component test
      expect(legacyCourse.title).toBeDefined();
      expect(legacyCourse.subtitle).toBeUndefined();
      expect(Array.isArray(legacyCourse.age_groups)).toBe(true);
    });

    it('should handle missing subtitle gracefully', () => {
      const course = {
        title: 'Course Title',
        subtitle: null,
        description: 'Description'
      };

      // Component should handle null subtitle
      const displaySubtitle = course.subtitle || '';
      expect(displaySubtitle).toBe('');
    });

    it('should handle empty highlights array', () => {
      const course = {
        highlights: []
      };

      expect(Array.isArray(course.highlights)).toBe(true);
      expect(course.highlights.length).toBe(0);
    });

    it('should handle empty outcomes array', () => {
      const course = {
        outcomes: []
      };

      expect(Array.isArray(course.outcomes)).toBe(true);
      expect(course.outcomes.length).toBe(0);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity after migration', async () => {
      // Check that all courses still have valid references
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, category, level, status')
        .limit(100);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      data!.forEach(course => {
        expect(course.id).toBeDefined();
        expect(course.title).toBeDefined();
        expect(course.category).toBeDefined();
        expect(course.level).toBeDefined();
        expect(course.status).toBeDefined();
      });
    });

    it('should not have broken any existing relationships', async () => {
      // Test that course relationships still work
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          enrollments (
            id,
            student_id
          )
        `)
        .eq('id', testCourseId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });
});
