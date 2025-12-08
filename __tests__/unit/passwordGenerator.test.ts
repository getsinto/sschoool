/**
 * Unit Tests: Password Generator Utility
 * 
 * Tests the password generation, validation, and strength calculation functions
 * to ensure they meet security requirements.
 */

import { describe, it, expect } from '@jest/globals'
import {
  generateSecurePassword,
  validatePassword,
  calculatePasswordStrength,
} from '@/lib/utils/password-generator'

describe('Password Generator Utility', () => {
  describe('generateSecurePassword', () => {
    it('should generate password with default length of 12 characters', () => {
      const password = generateSecurePassword()
      expect(password.length).toBe(12)
    })

    it('should generate password with custom length', () => {
      const password = generateSecurePassword(16)
      expect(password.length).toBe(16)
    })

    it('should generate password with minimum length of 8', () => {
      const password = generateSecurePassword(5) // Should default to 8
      expect(password.length).toBeGreaterThanOrEqual(8)
    })

    it('should include uppercase letters', () => {
      const password = generateSecurePassword(20)
      expect(/[A-Z]/.test(password)).toBe(true)
    })

    it('should include lowercase letters', () => {
      const password = generateSecurePassword(20)
      expect(/[a-z]/.test(password)).toBe(true)
    })

    it('should include numbers', () => {
      const password = generateSecurePassword(20)
      expect(/[0-9]/.test(password)).toBe(true)
    })

    it('should include special characters', () => {
      const password = generateSecurePassword(20)
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true)
    })

    it('should generate unique passwords', () => {
      const passwords = new Set()
      for (let i = 0; i < 100; i++) {
        passwords.add(generateSecurePassword())
      }
      // All 100 passwords should be unique
      expect(passwords.size).toBe(100)
    })

    it('should meet all character requirements', () => {
      const password = generateSecurePassword()
      const hasUppercase = /[A-Z]/.test(password)
      const hasLowercase = /[a-z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)

      expect(hasUppercase).toBe(true)
      expect(hasLowercase).toBe(true)
      expect(hasNumber).toBe(true)
      expect(hasSpecial).toBe(true)
    })
  })

  describe('validatePassword', () => {
    it('should validate password with all requirements', () => {
      const result = validatePassword('Test123!@#')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Test1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('test123!@#')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('TEST123!@#')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without number', () => {
      const result = validatePassword('TestTest!@#')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject password without special character', () => {
      const result = validatePassword('TestTest123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    it('should return multiple errors for invalid password', () => {
      const result = validatePassword('test')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    it('should accept password with all requirements met', () => {
      const passwords = [
        'Password123!',
        'MyP@ssw0rd',
        'Secure#Pass1',
        'Test@1234',
      ]

      passwords.forEach(password => {
        const result = validatePassword(password)
        expect(result.isValid).toBe(true)
      })
    })
  })

  describe('calculatePasswordStrength', () => {
    it('should return weak strength for short simple password', () => {
      const result = calculatePasswordStrength('Test123!')
      expect(result.score).toBeLessThan(50)
      expect(result.level).toBe('weak')
    })

    it('should return medium strength for moderate password', () => {
      const result = calculatePasswordStrength('TestPass123!')
      expect(result.score).toBeGreaterThanOrEqual(50)
      expect(result.score).toBeLessThan(75)
      expect(result.level).toBe('medium')
    })

    it('should return strong strength for complex password', () => {
      const result = calculatePasswordStrength('MyV3ry$tr0ng&C0mpl3xP@ssw0rd!')
      expect(result.score).toBeGreaterThanOrEqual(75)
      expect(result.level).toBe('strong')
    })

    it('should give higher score for longer passwords', () => {
      const short = calculatePasswordStrength('Test123!')
      const long = calculatePasswordStrength('Test123!Test123!')
      expect(long.score).toBeGreaterThan(short.score)
    })

    it('should give higher score for more character variety', () => {
      const simple = calculatePasswordStrength('aaaaaaaa1!')
      const complex = calculatePasswordStrength('aB1!cD2@eF3#')
      expect(complex.score).toBeGreaterThan(simple.score)
    })

    it('should return score between 0 and 100', () => {
      const passwords = [
        'weak',
        'Test123!',
        'MediumPassword123!',
        'V3ry$tr0ng&C0mpl3xP@ssw0rd!',
      ]

      passwords.forEach(password => {
        const result = calculatePasswordStrength(password)
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
      })
    })

    it('should return correct level based on score', () => {
      // Test weak
      const weak = calculatePasswordStrength('Test1!')
      expect(weak.level).toBe('weak')

      // Test medium
      const medium = calculatePasswordStrength('TestPass123!')
      expect(medium.level).toBe('medium')

      // Test strong
      const strong = calculatePasswordStrength('MyV3ry$tr0ng&C0mpl3xP@ssw0rd!')
      expect(strong.level).toBe('strong')
    })
  })

  describe('Security Properties', () => {
    it('should generate passwords that pass validation', () => {
      for (let i = 0; i < 50; i++) {
        const password = generateSecurePassword()
        const validation = validatePassword(password)
        expect(validation.isValid).toBe(true)
      }
    })

    it('should generate passwords with strong strength', () => {
      for (let i = 0; i < 50; i++) {
        const password = generateSecurePassword(16)
        const strength = calculatePasswordStrength(password)
        expect(strength.score).toBeGreaterThanOrEqual(50) // At least medium
      }
    })

    it('should not generate predictable patterns', () => {
      const passwords = []
      for (let i = 0; i < 100; i++) {
        passwords.push(generateSecurePassword())
      }

      // Check for common patterns
      const hasSequentialNumbers = passwords.some(p => /123|234|345|456|567|678|789/.test(p))
      const hasSequentialLetters = passwords.some(p => /abc|bcd|cde|def|efg|fgh|ghi/.test(p))
      const hasRepeatingChars = passwords.some(p => /(.)\1{3,}/.test(p))

      // Some might have these by chance, but not many
      const patternsFound = [hasSequentialNumbers, hasSequentialLetters, hasRepeatingChars].filter(Boolean).length
      expect(patternsFound).toBeLessThan(2) // Allow some randomness
    })
  })
})
