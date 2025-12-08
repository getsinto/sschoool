import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export type AuthResult = {
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  } | null;
  error: string | null;
};

/**
 * Safely checks if a user is authenticated
 * @param supabase - The Supabase client instance
 * @returns Object with user and error properties
 */
export async function requireAuth(
  supabase: SupabaseClient<Database>
): Promise<AuthResult> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Authentication error:', error);
      return { user: null, error: 'Authentication failed' };
    }
    
    if (!user) {
      return { user: null, error: 'Unauthorized' };
    }
    
    return { user, error: null };
  } catch (err) {
    console.error('Unexpected error in requireAuth:', err);
    return { user: null, error: 'Authentication failed' };
  }
}

/**
 * Checks if a user is authenticated and has a specific role
 * @param supabase - The Supabase client instance
 * @param allowedRoles - Array of allowed role names
 * @returns Object with user, role, and error properties
 */
export async function requireRole(
  supabase: SupabaseClient<Database>,
  allowedRoles: string[]
): Promise<AuthResult & { role?: string }> {
  const authResult = await requireAuth(supabase);
  
  if (authResult.error || !authResult.user) {
    return authResult;
  }
  
  try {
    // Get user profile with role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authResult.user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return { user: null, error: 'Failed to verify permissions' };
    }
    
    if (!profile || !profile.role) {
      return { user: null, error: 'User role not found' };
    }
    
    if (!allowedRoles.includes(profile.role)) {
      return { 
        user: null, 
        error: 'Insufficient permissions',
        role: profile.role 
      };
    }
    
    return { 
      user: authResult.user, 
      error: null,
      role: profile.role 
    };
  } catch (err) {
    console.error('Unexpected error in requireRole:', err);
    return { user: null, error: 'Failed to verify permissions' };
  }
}
