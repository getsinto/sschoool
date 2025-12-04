/**
 * Input Sanitization Utilities
 * Implements Task 13.1: Input sanitization for security
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitize plain text input
 * Removes potentially dangerous characters and scripts
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize file name to prevent directory traversal
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';
  
  return fileName
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/^\.+/, '') // Remove leading dots
    .trim();
}

/**
 * Sanitize URL to prevent malicious redirects
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Validate and sanitize file upload
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file extension
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
    };
  }

  // Sanitize filename
  const sanitizedName = sanitizeFileName(file.name);

  return {
    isValid: true,
    sanitizedName,
  };
}

/**
 * Sanitize JSON input
 * Prevents JSON injection attacks
 */
export function sanitizeJson<T>(input: unknown): T | null {
  try {
    // Convert to string and parse to ensure it's valid JSON
    const jsonString = JSON.stringify(input);
    const parsed = JSON.parse(jsonString);
    
    // Recursively sanitize string values
    return sanitizeJsonValues(parsed);
  } catch {
    return null;
  }
}

function sanitizeJsonValues(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeJsonValues);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeJsonValues(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitize SQL input (for raw queries - prefer parameterized queries)
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/['";]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comment start
    .replace(/\*\//g, '') // Remove multi-line comment end
    .replace(/xp_/gi, '') // Remove extended stored procedures
    .replace(/sp_/gi, '') // Remove system stored procedures
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Sanitize course data
 */
export interface CourseSanitizationResult {
  title: string;
  subtitle?: string;
  description: string;
  highlights: Array<{ text: string; icon?: string }>;
  outcomes: string[];
  language: string;
}

export function sanitizeCourseData(data: any): CourseSanitizationResult {
  return {
    title: sanitizeText(data.title || ''),
    subtitle: data.subtitle ? sanitizeText(data.subtitle) : undefined,
    description: sanitizeHtml(data.description || ''),
    highlights: Array.isArray(data.highlights)
      ? data.highlights.map((h: any) => ({
          text: sanitizeText(h.text || ''),
          icon: h.icon ? sanitizeText(h.icon) : undefined,
        }))
      : [],
    outcomes: Array.isArray(data.outcomes)
      ? data.outcomes.map((o: string) => sanitizeText(o))
      : [],
    language: sanitizeText(data.language || 'English'),
  };
}

/**
 * Sanitize category data
 */
export interface CategorySanitizationResult {
  name: string;
  description?: string;
  slug: string;
  color: string;
}

export function sanitizeCategoryData(data: any): CategorySanitizationResult {
  return {
    name: sanitizeText(data.name || ''),
    description: data.description ? sanitizeText(data.description) : undefined,
    slug: sanitizeText(data.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    color: sanitizeText(data.color || '#3B82F6').match(/^#[0-9A-Fa-f]{6}$/)
      ? data.color
      : '#3B82F6',
  };
}

/**
 * Rate limit check helper
 */
export interface RateLimitInfo {
  key: string;
  limit: number;
  window: number; // in seconds
}

/**
 * Create a rate limit key for a user/IP
 */
export function createRateLimitKey(
  identifier: string,
  action: string
): string {
  return `ratelimit:${action}:${identifier}`;
}
