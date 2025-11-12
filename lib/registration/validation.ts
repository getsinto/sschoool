import { z } from 'zod'
import { RegistrationData, RegistrationStep, ValidationErrors, StepValidation } from '@/types/registration'

// Validation schemas for each step
const userTypeSchema = z.object({
  userType: z.enum(['student', 'teacher', 'parent', 'spoken_english'])
})

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters').regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters').regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number')
    .regex(/(?=.*[!@#$%^&*])/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  mobileNumber: z.string().min(10, 'Please enter a valid mobile number'),
  whatsappNumber: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const addressInfoSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters').max(50, 'City must be less than 50 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must be less than 200 characters'),
  postalCode: z.string().min(1, 'Postal code is required')
})

const studentSpecificSchema = z.object({
  previousSchool: z.string().min(3, 'School name must be at least 3 characters').max(100, 'School name must be less than 100 characters'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  parentEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  howDidYouHear: z.string().optional()
})

const teacherSpecificSchema = z.object({
  qualification: z.string().min(1, 'Qualification is required'),
  fieldOfStudy: z.string().min(2, 'Field of study must be at least 2 characters').max(100, 'Field of study must be less than 100 characters'),
  teachingExperience: z.number().min(0, 'Teaching experience cannot be negative').max(50, 'Teaching experience cannot exceed 50 years'),
  subjectsToTeach: z.array(z.string()).min(1, 'Please select at least one subject to teach'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must be less than 500 characters'),
  linkedinProfile: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  onlineTeachingExperience: z.number().min(0, 'Online teaching experience cannot be negative').max(30, 'Online teaching experience cannot exceed 30 years'),
  resumeUrl: z.string().optional()
})

const parentSpecificSchema = z.object({
  relationship: z.string().min(1, 'Relationship is required'),
  occupation: z.string().optional(),
  studentToLink: z.string().optional(),
  numberOfChildren: z.number().min(1, 'Number of children must be at least 1').max(10, 'Number of children cannot exceed 10'),
  emergencyContact: z.string().min(10, 'Please enter a valid emergency contact number'),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp', 'sms']),
  howDidYouHear: z.string().optional()
})

const spokenEnglishSpecificSchema = z.object({
  englishLevel: z.enum(['zero', 'beginner', 'intermediate', 'advanced']),
  ageGroup: z.string().min(1, 'Age group is required'),
  purposeOfLearning: z.array(z.string()).min(1, 'Please select at least one purpose for learning'),
  learningSchedule: z.array(z.string()).min(1, 'Please select at least one preferred schedule'),
  nativeLanguage: z.string().min(1, 'Native language is required'),
  previousLearning: z.boolean(),
  yearsOfLearning: z.number().optional(),
  whatStopped: z.string().optional(),
  learningGoals: z.string().max(500, 'Learning goals must be less than 500 characters').optional(),
  preferredLessonDuration: z.enum(['30', '45', '60', '90'])
})

const idVerificationSchema = z.object({
  idType: z.string().min(1, 'ID type is required'),
  idNumber: z.string().min(1, 'ID number is required'),
  idFrontUrl: z.string().min(1, 'Please upload the front of your ID'),
  idBackUrl: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  selfieWithIdUrl: z.string().optional()
})

const consentsSchema = z.object({
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the Terms and Conditions'),
  privacyAccepted: z.boolean().refine(val => val === true, 'You must accept the Privacy Policy'),
  gdprConsent: z.boolean().optional(),
  coppaConsent: z.boolean().optional(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  whatsappNotifications: z.boolean(),
  dataSharing: z.boolean().refine(val => val === true, 'You must consent to data sharing for educational purposes')
})

// Helper function to check if user is under 13
const isUnder13 = (dateOfBirth: string): boolean => {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 < 13
  }
  return age < 13
}

// Helper function to check if user is in EU
const isEUCountry = (country: string): boolean => {
  const euCountries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
    'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
    'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden'
  ]
  return euCountries.includes(country)
}

// Validate individual step
export function validateStep(step: RegistrationStep, data: RegistrationData): StepValidation {
  const errors: ValidationErrors = {}
  let isValid = true

  try {
    switch (step) {
      case 1:
        userTypeSchema.parse({ userType: data.userType })
        break

      case 2:
        personalInfoSchema.parse(data.personalInfo)
        break

      case 3:
        addressInfoSchema.parse(data.addressInfo)
        break

      case 4:
        switch (data.userType) {
          case 'student':
            studentSpecificSchema.parse(data.categorySpecific)
            break
          case 'teacher':
            teacherSpecificSchema.parse(data.categorySpecific)
            break
          case 'parent':
            parentSpecificSchema.parse(data.categorySpecific)
            break
          case 'spoken_english':
            spokenEnglishSpecificSchema.parse(data.categorySpecific)
            break
        }
        break

      case 5:
        idVerificationSchema.parse(data.idVerification)
        break

      case 6:
        // Dynamic validation for consents based on user data
        const consentsToValidate = { ...data.consents }
        
        // Check if GDPR consent is required
        if (data.addressInfo.country && isEUCountry(data.addressInfo.country)) {
          if (!consentsToValidate.gdprConsent) {
            errors.gdprConsent = 'GDPR consent is required for EU residents'
            isValid = false
          }
        }
        
        // Check if COPPA consent is required
        if (data.personalInfo.dateOfBirth && isUnder13(data.personalInfo.dateOfBirth)) {
          if (!consentsToValidate.coppaConsent) {
            errors.coppaConsent = 'Parental consent is required for users under 13'
            isValid = false
          }
        }
        
        if (isValid) {
          consentsSchema.parse(consentsToValidate)
        }
        break

      case 7:
        // Final validation - all previous steps must be valid
        for (let i = 1; i <= 6; i++) {
          const stepValidation = validateStep(i as RegistrationStep, data)
          if (!stepValidation.isValid) {
            Object.assign(errors, stepValidation.errors)
            isValid = false
          }
        }
        break
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      isValid = false
    } else {
      errors.general = 'Validation error occurred'
      isValid = false
    }
  }

  return { isValid, errors }
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0
  
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*]/.test(password)) score++
  
  if (score < 3) return 'weak'
  if (score < 5) return 'medium'
  return 'strong'
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Check if COPPA consent is required
export function requiresCoppaConsent(dateOfBirth: string): boolean {
  return isUnder13(dateOfBirth)
}

// Check if GDPR consent is required
export function requiresGdprConsent(country: string): boolean {
  return isEUCountry(country)
}