import { render } from '@react-email/render';
import { ReactElement } from 'react';

/**
 * Template variable injection and personalization utilities
 */

export interface TemplateData {
  [key: string]: any;
}

export interface RenderOptions {
  pretty?: boolean;
  plainText?: boolean;
}

/**
 * Render email template to HTML
 */
export async function renderEmailTemplate(
  template: ReactElement,
  options: RenderOptions = {}
): Promise<string> {
  try {
    const html = render(template, {
      pretty: options.pretty ?? false,
    });
    return html;
  } catch (error) {
    console.error('Failed to render email template:', error);
    throw new Error('Email template rendering failed');
  }
}

/**
 * Render email template to plain text
 */
export async function renderEmailTemplatePlainText(
  template: ReactElement
): Promise<string> {
  try {
    const plainText = render(template, {
      plainText: true,
    });
    return plainText;
  } catch (error) {
    console.error('Failed to render email template as plain text:', error);
    throw new Error('Email template plain text rendering failed');
  }
}

/**
 * Inject variables into template data
 */
export function injectVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value));
  });
  
  return result;
}

/**
 * Personalize email content with user data
 */
export function personalizeContent(
  data: TemplateData,
  userInfo: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  }
): TemplateData {
  return {
    ...data,
    firstName: userInfo.firstName || 'User',
    lastName: userInfo.lastName || '',
    fullName: `${userInfo.firstName || 'User'} ${userInfo.lastName || ''}`.trim(),
    email: userInfo.email || '',
    role: userInfo.role || 'user',
  };
}

/**
 * Format date for email display
 */
export function formatEmailDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for email display
 */
export function formatEmailTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time for email display
 */
export function formatEmailDateTime(date: Date | string): string {
  return `${formatEmailDate(date)} at ${formatEmailTime(date)}`;
}

/**
 * Format currency for email display
 */
export function formatEmailCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Truncate text for email preview
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Generate unsubscribe link
 */
export function generateUnsubscribeLink(
  userId: string,
  category?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
  const paramsObj: Record<string, string> = { user: userId };
  if (category) {
    paramsObj.category = category;
  }
  const params = new URLSearchParams(paramsObj);
  return `${baseUrl}/api/email/unsubscribe?${params.toString()}`;
}

/**
 * Generate tracking pixel URL
 */
export function generateTrackingPixelUrl(emailJobId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
  return `${baseUrl}/api/email/track/open?id=${emailJobId}`;
}

/**
 * Generate click tracking URL
 */
export function generateClickTrackingUrl(
  emailJobId: string,
  originalUrl: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
  const params = new URLSearchParams({
    id: emailJobId,
    url: originalUrl,
  });
  return `${baseUrl}/api/email/track/click?${params.toString()}`;
}

/**
 * Validate email template data
 */
export function validateTemplateData(
  data: TemplateData,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(field => !(field in data));
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get template variables from template string
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /{{\\s*([a-zA-Z0-9_]+)\\s*}}/g;
  const variables: string[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(template)) !== null) {
    const variable = match[1];
    if (variable && !variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
}

/**
 * Sanitize HTML content for email
 */
export function sanitizeEmailContent(content: string): string {
  // Remove potentially dangerous HTML
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}

export default {
  renderEmailTemplate,
  renderEmailTemplatePlainText,
  injectVariables,
  personalizeContent,
  formatEmailDate,
  formatEmailTime,
  formatEmailDateTime,
  formatEmailCurrency,
  truncateText,
  generateUnsubscribeLink,
  generateTrackingPixelUrl,
  generateClickTrackingUrl,
  validateTemplateData,
  extractTemplateVariables,
  sanitizeEmailContent,
};
