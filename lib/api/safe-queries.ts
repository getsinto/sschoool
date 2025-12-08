import { PostgrestFilterBuilder, PostgrestError } from '@supabase/postgrest-js';

export type QueryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

export type RequireResult<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

/**
 * Safely fetches a single record, returning null if not found
 * @param query - The Postgrest query builder
 * @returns Object with data and error
 */
export async function findOne<T>(
  query: PostgrestFilterBuilder<any, any, T[]>
): Promise<QueryResult<T>> {
  const { data, error } = await query.maybeSingle();
  return { data, error };
}

/**
 * Fetches a single record and returns appropriate error if not found
 * @param query - The Postgrest query builder
 * @param notFoundMessage - Custom message for 404 response
 * @returns Object with data, error message, and HTTP status
 */
export async function requireOne<T>(
  query: PostgrestFilterBuilder<any, any, T[]>,
  notFoundMessage = 'Resource not found'
): Promise<RequireResult<T>> {
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Database query error:', error);
    return { data: null, error: 'Database error', status: 500 };
  }
  
  if (!data) {
    return { data: null, error: notFoundMessage, status: 404 };
  }
  
  return { data, error: null, status: 200 };
}

/**
 * Safely checks if a record exists
 * @param query - The Postgrest query builder
 * @returns Boolean indicating if record exists
 */
export async function exists(
  query: PostgrestFilterBuilder<any, any, any[]>
): Promise<{ exists: boolean; error: PostgrestError | null }> {
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    return { exists: false, error };
  }
  
  return { exists: data !== null, error: null };
}

/**
 * Handles PGRST116 errors gracefully
 * @param error - The Postgrest error
 * @returns Boolean indicating if this is a "not found" error
 */
export function isNotFoundError(error: PostgrestError | null): boolean {
  return error?.code === 'PGRST116';
}

/**
 * Converts Postgrest errors to user-friendly messages
 * @param error - The Postgrest error
 * @returns User-friendly error message
 */
export function getErrorMessage(error: PostgrestError | null): string {
  if (!error) return 'Unknown error';
  
  switch (error.code) {
    case 'PGRST116':
      return 'Resource not found';
    case '23505':
      return 'A record with this information already exists';
    case '23503':
      return 'Referenced resource does not exist';
    case '42501':
      return 'Permission denied';
    default:
      return 'Database error occurred';
  }
}
