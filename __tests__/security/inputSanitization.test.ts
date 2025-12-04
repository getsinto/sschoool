/**
 * Security Tests for Input Sanitization
 * Implements Task 13.4: Write security tests
 */

import {
  sanitizeHtml,
  sanitizeText,
  sanitizeFileName,
  sanitizeUrl,
  validateFile,
  sanitizeJson,
  sanitizeSqlInput,
  isValidEmail,
  isValidPhone,
  sanitizeCourseData,
  sanitizeCategoryData,
} from '@/lib/security/inputSanitization';

describe('Input Sanitization Security Tests', () => {
  describe('HTML Sanitization', () => {
    it('should remove script tags', () => {
      const malicious = '<p>Hello</p><script>alert("XSS")</script>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
      const malicious = '<p onclick="alert(\'XSS\')">Click me</p>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('alert');
    });

    it('should remove iframe tags', () => {
      const malicious = '<p>Content</p><iframe src="evil.com"></iframe>';
      const sanitized = sanitizeHtml(malicious);
      
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).toContain('<p>Content</p>');
    });

    it('should allow safe HTML tags', () => {
      const safe = '<p>Hello <strong>world</strong></p>';
      const sanitized = sanitizeHtml(safe);
      
      expect(sanitized).toBe(safe);
    });
  });

  describe('Text Sanitization', () => {
    it('should remove script tags from text', () => {
      const malicious = 'Hello <script>alert("XSS")</script> World';
      const sanitized = sanitizeText(malicious);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World');
    });

    it('should remove javascript: protocol', () => {
      const malicious = 'javascript:alert("XSS")';
      const sanitized = sanitizeText(malicious);
      
      expect(sanitized).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const malicious = 'onclick="alert(\'XSS\')"';
      const sanitized = sanitizeText(malicious);
      
      expect(sanitized).not.toContain('onclick');
    });

    it('should trim whitespace', () => {
      const text = '  Hello World  ';
      const sanitized = sanitizeText(text);
      
      expect(sanitized).toBe('Hello World');
    });
  });

  describe('File Name Sanitization', () => {
    it('should remove directory traversal attempts', () => {
      const malicious = '../../../etc/passwd';
      const sanitized = sanitizeFileName(malicious);
      
      expect(sanitized).not.toContain('..');
      expect(sanitized).not.toContain('/');
    });

    it('should remove path separators', () => {
      const malicious = 'path/to/file.txt';
      const sanitized = sanitizeFileName(malicious);
      
      expect(sanitized).not.toContain('/');
      expect(sanitized).toBe('pathtofile.txt');
    });

    it('should remove invalid filename characters', () => {
      const malicious = 'file<>:"|?*.txt';
      const sanitized = sanitizeFileName(malicious);
      
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain(':');
      expect(sanitized).not.toContain('|');
      expect(sanitized).not.toContain('?');
      expect(sanitized).not.toContain('*');
    });

    it('should remove leading dots', () => {
      const malicious = '...hidden.txt';
      const sanitized = sanitizeFileName(malicious);
      
      expect(sanitized).toBe('hidden.txt');
    });
  });

  describe('URL Sanitization', () => {
    it('should allow valid HTTP URLs', () => {
      const url = 'http://example.com/page';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).toBe(url);
    });

    it('should allow valid HTTPS URLs', () => {
      const url = 'https://example.com/page';
      const sanitized = sanitizeUrl(url);
      
      expect(sanitized).toBe(url);
    });

    it('should reject javascript: protocol', () => {
      const malicious = 'javascript:alert("XSS")';
      const sanitized = sanitizeUrl(malicious);
      
      expect(sanitized).toBe('');
    });

    it('should reject data: protocol', () => {
      const malicious = 'data:text/html,<script>alert("XSS")</script>';
      const sanitized = sanitizeUrl(malicious);
      
      expect(sanitized).toBe('');
    });

    it('should reject file: protocol', () => {
      const malicious = 'file:///etc/passwd';
      const sanitized = sanitizeUrl(malicious);
      
      expect(sanitized).toBe('');
    });

    it('should handle invalid URLs', () => {
      const invalid = 'not a url';
      const sanitized = sanitizeUrl(invalid);
      
      expect(sanitized).toBe('');
    });
  });

  describe('File Validation', () => {
    it('should reject files exceeding size limit', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const result = validateFile(largeFile, { maxSize: 5 * 1024 * 1024 });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('size exceeds');
    });

    it('should reject disallowed MIME types', () => {
      const file = new File(['content'], 'file.exe', {
        type: 'application/x-msdownload',
      });

      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject disallowed file extensions', () => {
      const file = new File(['content'], 'file.php', {
        type: 'image/jpeg', // Lying about type
      });

      const result = validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('extension');
    });

    it('should accept valid files', () => {
      const file = new File(['content'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedName).toBe('image.jpg');
    });

    it('should sanitize file names', () => {
      const file = new File(['content'], '../../../evil.jpg', {
        type: 'image/jpeg',
      });

      const result = validateFile(file);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedName).not.toContain('..');
      expect(result.sanitizedName).not.toContain('/');
    });
  });

  describe('JSON Sanitization', () => {
    it('should sanitize string values in JSON', () => {
      const malicious = {
        name: '<script>alert("XSS")</script>',
        description: 'Safe text',
      };

      const sanitized = sanitizeJson(malicious);

      expect(sanitized).toBeDefined();
      expect(sanitized!.name).not.toContain('<script>');
      expect(sanitized!.description).toBe('Safe text');
    });

    it('should handle nested objects', () => {
      const malicious = {
        user: {
          name: '<script>alert("XSS")</script>',
          email: 'test@example.com',
        },
      };

      const sanitized = sanitizeJson(malicious);

      expect(sanitized).toBeDefined();
      expect(sanitized!.user.name).not.toContain('<script>');
      expect(sanitized!.user.email).toBe('test@example.com');
    });

    it('should handle arrays', () => {
      const malicious = {
        items: ['<script>alert("XSS")</script>', 'Safe item'],
      };

      const sanitized = sanitizeJson(malicious);

      expect(sanitized).toBeDefined();
      expect(sanitized!.items[0]).not.toContain('<script>');
      expect(sanitized!.items[1]).toBe('Safe item');
    });
  });

  describe('SQL Input Sanitization', () => {
    it('should remove SQL injection attempts', () => {
      const malicious = "'; DROP TABLE users; --";
      const sanitized = sanitizeSqlInput(malicious);
      
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain('--');
      expect(sanitized).not.toContain('DROP');
    });

    it('should remove SQL comments', () => {
      const malicious = 'SELECT * FROM users -- comment';
      const sanitized = sanitizeSqlInput(malicious);
      
      expect(sanitized).not.toContain('--');
    });

    it('should remove extended stored procedures', () => {
      const malicious = 'xp_cmdshell';
      const sanitized = sanitizeSqlInput(malicious);
      
      expect(sanitized).not.toContain('xp_');
    });
  });

  describe('Email Validation', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@invalid.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('should accept valid phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('Course Data Sanitization', () => {
    it('should sanitize all course fields', () => {
      const malicious = {
        title: '<script>alert("XSS")</script>Course',
        subtitle: '<script>alert("XSS")</script>Subtitle',
        description: '<p>Description</p><script>alert("XSS")</script>',
        highlights: [
          { text: '<script>alert("XSS")</script>Highlight', icon: 'book' },
        ],
        outcomes: ['<script>alert("XSS")</script>Outcome'],
        language: 'English<script>',
      };

      const sanitized = sanitizeCourseData(malicious);

      expect(sanitized.title).not.toContain('<script>');
      expect(sanitized.subtitle).not.toContain('<script>');
      expect(sanitized.description).not.toContain('<script>');
      expect(sanitized.highlights[0].text).not.toContain('<script>');
      expect(sanitized.outcomes[0]).not.toContain('<script>');
      expect(sanitized.language).not.toContain('<script>');
    });
  });

  describe('Category Data Sanitization', () => {
    it('should sanitize category fields', () => {
      const malicious = {
        name: '<script>alert("XSS")</script>Category',
        description: '<script>alert("XSS")</script>Description',
        slug: 'Category Name!@#',
        color: 'red; background: url(evil.com)',
      };

      const sanitized = sanitizeCategoryData(malicious);

      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.description).not.toContain('<script>');
      expect(sanitized.slug).toMatch(/^[a-z0-9-]+$/);
      expect(sanitized.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should use default color for invalid colors', () => {
      const data = {
        name: 'Category',
        slug: 'category',
        color: 'invalid',
      };

      const sanitized = sanitizeCategoryData(data);

      expect(sanitized.color).toBe('#3B82F6');
    });
  });
});
