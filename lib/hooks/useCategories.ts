/**
 * React Query hook for category data caching
 * Implements Task 12.1: Category caching with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CourseCategory } from '@/types/course';

const CATEGORIES_QUERY_KEY = ['categories'];
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

interface CategoriesResponse {
  categories: CourseCategory[];
  success: boolean;
}

interface CreateCategoryData {
  name: string;
  description?: string;
  icon_url?: string;
  color?: string;
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

/**
 * Fetch categories from API
 */
async function fetchCategories(includeInactive = false): Promise<CourseCategory[]> {
  const url = `/api/admin/categories${includeInactive ? '?includeInactive=true' : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  const data: CategoriesResponse = await response.json();
  return data.categories;
}

/**
 * Create a new category
 */
async function createCategory(data: CreateCategoryData): Promise<CourseCategory> {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }
  
  const result = await response.json();
  return result.category;
}

/**
 * Update an existing category
 */
async function updateCategory(data: UpdateCategoryData): Promise<CourseCategory> {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category');
  }
  
  const result = await response.json();
  return result.category;
}

/**
 * Delete a category (soft delete)
 */
async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }
}

/**
 * Hook to fetch categories with caching
 */
export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, includeInactive],
    queryFn: () => fetchCategories(includeInactive),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME, // Previously cacheTime in v4
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Hook to create a category with optimistic updates
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCategory,
    onMutate: async (newCategory) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });
      
      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(CATEGORIES_QUERY_KEY);
      
      // Optimistically update cache
      queryClient.setQueryData(CATEGORIES_QUERY_KEY, (old: CourseCategory[] = []) => [
        ...old,
        {
          id: 'temp-' + Date.now(),
          ...newCategory,
          is_active: true,
          display_order: old.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as CourseCategory,
      ]);
      
      return { previousCategories };
    },
    onError: (err, newCategory, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previousCategories);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

/**
 * Hook to update a category with optimistic updates
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCategory,
    onMutate: async (updatedCategory) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });
      
      const previousCategories = queryClient.getQueryData(CATEGORIES_QUERY_KEY);
      
      queryClient.setQueryData(CATEGORIES_QUERY_KEY, (old: CourseCategory[] = []) =>
        old.map((cat) =>
          cat.id === updatedCategory.id
            ? { ...cat, ...updatedCategory, updated_at: new Date().toISOString() }
            : cat
        )
      );
      
      return { previousCategories };
    },
    onError: (err, updatedCategory, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete a category with optimistic updates
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCategory,
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });
      
      const previousCategories = queryClient.getQueryData(CATEGORIES_QUERY_KEY);
      
      queryClient.setQueryData(CATEGORIES_QUERY_KEY, (old: CourseCategory[] = []) =>
        old.filter((cat) => cat.id !== categoryId)
      );
      
      return { previousCategories };
    },
    onError: (err, categoryId, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

/**
 * Hook to prefetch categories (useful for preloading)
 */
export function usePrefetchCategories() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: CATEGORIES_QUERY_KEY,
      queryFn: () => fetchCategories(false),
      staleTime: STALE_TIME,
    });
  };
}
