// types/registration.ts

export type UserType = 'student' | 'teacher' | 'parent' | 'spoken_english'
export type RegistrationStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  mobileNumber: string
  whatsappNumber?: string
  sameAsMobile: boolean
  dateOfBirth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
}

export interface AddressInfo {
  country: string
  state?: string
  city: string
  address: string
  postalCode: string
}

export interface StudentSpecificInfo {
  previousSchool: string
  gradeLevel: string
  academicYear: string
  parentEmail?: string
  howDidYouHear?: string
}

export interface TeacherSpecificInfo {
  qualification: string
  fieldOfStudy: string
  teachingExperience: number
  subjectsToTeach: string[]
  resumeUrl?: string
  bio: string
  linkedinProfile?: string
  onlineTeachingExperience: number
}

export interface ParentSpecificInfo {
  relationship: string
  occupation?: string
  studentToLink?: string
  numberOfChildren: number
  emergencyContact: string
  preferredContactMethod: 'email' | 'phone' | 'whatsapp' | 'sms'
  howDidYouHear?: string
}

export interface SpokenEnglishSpecificInfo {
  englishLevel: 'zero' | 'beginner' | 'intermediate' | 'advanced'
  ageGroup: string
  purposeOfLearning: string[]
  learningSchedule: string[]
  nativeLanguage: string
  previousLearning: boolean
  yearsOfLearning?: number
  whatStopped?: string
  learningGoals?: string
  preferredLessonDuration: 30 | 45 | 60 | 90
}

export interface IDVerification {
  idType: string
  idNumber: string
  idFrontUrl?: string
  idBackUrl?: string
  profilePhotoUrl?: string
  selfieWithIdUrl?: string
}

export interface Consents {
  termsAccepted: boolean
  privacyAccepted: boolean
  gdprConsent?: boolean
  coppaConsent?: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  whatsappNotifications: boolean
  dataSharing: boolean
}

export interface RegistrationData {
  userType: UserType
  currentStep: RegistrationStep
  personalInfo: Partial<PersonalInfo>
  addressInfo: Partial<AddressInfo>
  categorySpecific: Partial<StudentSpecificInfo | TeacherSpecificInfo | ParentSpecificInfo | SpokenEnglishSpecificInfo>
  idVerification: Partial<IDVerification>
  consents: Partial<Consents>
}

export interface ValidationErrors {
  [key: string]: string
}

export interface StepValidation {
  isValid: boolean
  errors: ValidationErrors
}

// Grade levels for students
export const GRADE_LEVELS = [
  'Pre-Nursery',
  'Nursery', 
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10'
] as const

// Academic years
export const ACADEMIC_YEARS = [
  '2024-2025',
  '2025-2026'
] as const

// Qualifications for teachers
export const QUALIFICATIONS = [
  'High School Diploma',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Ph.D.',
  'Professional Certification',
  'Other'
] as const

// Subjects for teachers
export const SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education'
] as const

// ID types
export const ID_TYPES = [
  'Aadhaar Card (India)',
  'Passport (International)',
  'Driver\'s License',
  'National ID Card',
  'Student ID Card',
  'Other Government ID'
] as const