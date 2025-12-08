/**
 * Password Generation Utility
 * Generates secure temporary passwords for admin-created users
 */

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

/**
 * Generates a cryptographically secure random password
 * @param requirements - Password requirements configuration
 * @returns A secure random password meeting all requirements
 */
export function generateSecurePassword(
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): string {
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = requirements

  // Build character pool
  let charPool = ''
  const requiredChars: string[] = []

  if (requireLowercase) {
    charPool += LOWERCASE
    requiredChars.push(getRandomChar(LOWERCASE))
  }

  if (requireUppercase) {
    charPool += UPPERCASE
    requiredChars.push(getRandomChar(UPPERCASE))
  }

  if (requireNumbers) {
    charPool += NUMBERS
    requiredChars.push(getRandomChar(NUMBERS))
  }

  if (requireSpecialChars) {
    charPool += SPECIAL_CHARS
    requiredChars.push(getRandomChar(SPECIAL_CHARS))
  }

  if (charPool.length === 0) {
    throw new Error('At least one character type must be required')
  }

  // Calculate remaining length needed
  const remainingLength = Math.max(0, minLength - requiredChars.length)

  // Generate remaining random characters
  const remainingChars = Array.from({ length: remainingLength }, () =>
    getRandomChar(charPool)
  )

  // Combine required and remaining characters
  const allChars = [...requiredChars, ...remainingChars]

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i + 1)
    ;[allChars[i], allChars[j]] = [allChars[j], allChars[i]]
  }

  return allChars.join('')
}

/**
 * Gets a cryptographically secure random character from a string
 */
function getRandomChar(chars: string): string {
  const index = getRandomInt(0, chars.length)
  return chars[index]
}

/**
 * Gets a cryptographically secure random integer between min (inclusive) and max (exclusive)
 */
function getRandomInt(min: number, max: number): number {
  const range = max - min
  const bytesNeeded = Math.ceil(Math.log2(range) / 8)
  const maxValue = Math.pow(256, bytesNeeded)
  const randomBytes = new Uint8Array(bytesNeeded)

  let randomValue: number
  do {
    crypto.getRandomValues(randomBytes)
    randomValue = randomBytes.reduce((acc, byte, i) => acc + byte * Math.pow(256, i), 0)
  } while (randomValue >= maxValue - (maxValue % range))

  return min + (randomValue % range)
}

/**
 * Validates if a password meets the specified requirements
 * @param password - Password to validate
 * @param requirements - Password requirements to check against
 * @returns Object with validation result and error messages
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`)
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Calculates password strength score (0-100)
 * @param password - Password to evaluate
 * @returns Strength score and level
 */
export function calculatePasswordStrength(password: string): {
  score: number
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
} {
  let score = 0

  // Length score (up to 30 points)
  score += Math.min(30, password.length * 2)

  // Character variety score (up to 40 points)
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 10

  // Complexity score (up to 30 points)
  const uniqueChars = new Set(password).size
  score += Math.min(30, uniqueChars * 2)

  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  if (score < 40) level = 'weak'
  else if (score < 60) level = 'fair'
  else if (score < 75) level = 'good'
  else if (score < 90) level = 'strong'
  else level = 'very-strong'

  return { score: Math.min(100, score), level }
}
