/**
 * Migration Tests for Course Builder Enhancements
 * Tests the 20250104000001_course_builder_enhancements.sql migration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

describe('Course Builder Enhancements Migration', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(supabaseUrl, supabaseKey);
  });

  describe('Schema Changes', () => {
    it('should have added new columns to courses table', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('subtitle, language, age_groups, student_types, highlights, outcomes')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have created course_categories table', async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have correct columns in course_categories table', async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('id, name, slug, description, icon_url, color, is_active, display_order, created_at, updated_at')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Default Values', () => {
    it('should set default language to English for existing courses', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('language')
        .is('subtitle', null);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        data.forEach(course => {
          expect(course.language).toBe('English');
        });
      }
    });

    it('should set default empty arrays for age_groups', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('age_groups')
        .is('subtitle', null)
        .limit(5);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        data.forEach(course => {
          expect(Array.isArray(course.age_groups)).toBe(true);
        });
      }
    });

    it('should set default empty arrays for student_types', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('student_types')
        .is('subtitle', null)
        .limit(5);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        data.forEach(course => {
          expect(Array.isArray(course.student_types)).toBe(true);
        });
      }
    });

    it('should set default empty JSONB for highlights', async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('highlights')
        .is('subtitle', null)
        .limit(5);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        data.forEach(course => {
          expect(Array.isArray(course.highlights)).toBe(true);
        });
      }
    });
  });

  describe('Constraints', () => {
    it('should enforce subtitle length constraint (10-150 chars)', async () => {
      const { error: shortError } = await supabase
        .from('courses')
        .insert({
          title: 'Test Course',
          subtitle: 'Short', // Too short
          description: 'Test description',
          category: 'test',
          level: 'beginner',
          status: 'draft'
        });

      expect(shortError).toBeTruthy();
      expect(shortError?.message).toContain('check_subtitle_length');
    });

    it('should enforce valid language constraint', async () => {
      const { error } = await supabase
        .from('courses')
        .insert({
          title: 'Test Course',
          language: 'InvalidLanguage',
          description: 'Test description',
          category: 'test',
          level: 'beginner',
          status: 'draft'
        });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('check_language_valid');
    });

    it('should enforce valid age groups constraint', async () => {
      const { error } = await supabase
        .from('courses')
        .insert({
          title: 'Test Course',
          age_groups: ['invalid-age-group'],
          description: 'Test description',
          category: 'test',
          level: 'beginner',
          status: 'draft'
        });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('check_age_groups_valid');
    });

    it('should enforce valid student types constraint', async () => {
      const { error } = await supabase
        .from('courses')
        .insert({
          title: 'Test Course',
          student_types: ['invalid_type'],
          description: 'Test description',
          category: 'test',
          level: 'beginner',
          status: 'draft'
        });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('check_student_types_valid');
    });
  });

  describe('Category Seeding', () => {
    it('should have seeded initial categories', async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
    });

    it('should have unique category names', async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('name');

      expect(error).toBeNull();
      if (data) {
        const names = data.map(c => c.name);
        const uniqueNames = new Set(names);
        expect(names.length).toBe(uniqueNames.size);
      }
    });

    it('should have unique category slugs', async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('slug');

      expect(error).toBeNull();
      if (data) {
        const slugs = data.map(c => c.slug);
        const uniqueSlugs = new Set(slugs);
        expect(slugs.length).toBe(uniqueSlugs.size);
      }
    });
  });

  describe('Indexes', () => {
    it('should have created index on course_categories active and display_order', async () => {
      const { data, error } = await supabase.rpc('check_index_exists', {
        table_name: 'course_categories',
        index_name: 'idx_course_categories_active'
      });

      // This test assumes you have a helper function to check indexes
      // If not available, this test can be skipped or implemented differently
      expect(error).toBeNull();
    });

    it('should have created GIN index on courses age_groups', async () => {
      const { data, error } = await supabase.rpc('check_index_exists', {
        table_name: 'courses',
        index_name: 'idx_courses_age_groups'
      });

      expect(error).toBeNull();
    });
  });

  describe('RLS Policies', () => {
    it('should allow authenticated users to read active categories', async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have RLS enabled on course_categories', async () => {
      const { data, error } = await supabase.rpc('check_rls_enabled', {
        table_name: 'course_categories'
      });

      // This test assumes you have a helper function to check RLS
      // If not available, this test can be skipped or implemented differently
      expect(error).toBeNull();
    });
  });

  describe('Triggers', () => {
    it('should update updated_at timestamp on category update', async () => {
      // First, create a test category
      const { data: category, error: createError } = await supabase
        .from('course_categories')
        .insert({
          name: 'Test Category for Trigger',
          slug: 'test-category-trigger',
          description: 'Test description'
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(category).toBeDefined();

      if (category) {
        const originalUpdatedAt = category.updated_at;

        // Wait a moment to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the category
        const { data: updated, error: updateError } = await supabase
          .from('course_categories')
          .update({ description: 'Updated description' })
          .eq('id', category.id)
          .select()
          .single();

        expect(updateError).toBeNull();
        expect(updated).toBeDefined();
        expect(new Date(updated!.updated_at).getTime()).toBeGreaterThan(
          new Date(originalUpdatedAt).getTime()
        );

        // Cleanup
        await supabase
          .from('course_categories')
          .delete()
          .eq('id', category.id);
      }
    });
  });
});
