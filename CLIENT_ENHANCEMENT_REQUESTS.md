# Client Enhancement Requests - St Haroon English Medium Online School

## Date: November 23, 2025
## Status: Requirements Gathering Phase

---

## 1. User Registration & Verification System

### 1.1 Registration Verification Time
**Requirement**: Implement 24-48 hour verification period for all user registrations
- **Applies to**: Students, Teachers, Parents/Guardians, Spoken English course registrations
- **Current State**: Immediate registration approval
- **Requested State**: Admin manual verification within 24-48 hours
- **Impact**: High - affects all new user onboarding

### 1.2 Teacher Subject Management
**Requirement**: Dynamic subject selection and approval system
- **Feature 1**: During teacher signup, provide "Subjects you can teach" field
- **Feature 2**: Add "Other subjects" option with text input
- **Feature 3**: Admin approval workflow for custom subjects
- **Feature 4**: Admin panel to add additional subjects to teacher profiles
- **Impact**: Medium - enhances teacher profile flexibility

---

## 2. Spoken English Course Registration Enhancements

### 2.1 Purpose of Learning English - Admin Management
**Requirement**: Admin-controlled purpose list
- **Current**: Fixed list of purposes
- **Requested**: Admin panel to add/edit/remove purposes
- **Feature**: "Select all that apply" multi-select functionality
- **Impact**: Low - improves data collection flexibility

### 2.2 Preferred Learning Schedule - Admin Management
**Requirement**: Dynamic schedule and batch management
- **Feature 1**: Admin panel to add classes and schedules
- **Feature 2**: Create new batches as per requirement
- **Feature 3**: Make this optional for survey purposes
- **Feature 4**: Data gathering and analytics
- **Impact**: High - critical for course planning

### 2.3 Preferred Lesson Duration - Bug Fix
**Requirement**: Fix non-functional lesson duration selector
- **Current**: Not working
- **Requested**: Functional dropdown/selector
- **Priority**: High - blocking user registration
- **Impact**: High - affects user experience

---

## 3. Landing Page & Content Management

### 3.1 Our Impact Numbers - Visibility Control
**Requirement**: Admin toggle for impact numbers section
- **Feature**: Show/Hide button in admin panel
- **States**: Active/Inactive
- **Impact**: Low - marketing flexibility

### 3.2 Course Selection Management
**Requirement**: Admin control over course visibility
- **Feature 1**: Add new courses
- **Feature 2**: Hide/archive old courses
- **Feature 3**: Reorder course display
- **Impact**: High - core content management

### 3.3 Course Details Upload System
**Requirement**: Complete course management in admin panel
- **Feature**: Enter all course details
- **Feature**: Upload course materials
- **Feature**: Course metadata management
- **Impact**: High - essential for course operations

---

## 4. Media & Content Upload System

### 4.1 Admin Media Management Panel
**Requirement**: Comprehensive media upload system
- **Videos**: Course videos, promotional videos
- **Banners**: Hero banners, promotional banners
- **Mini Banners**: Section banners, category banners
- **Course Categories**: Category images and descriptions
- **Happy Parents & Students**: Testimonial photos/videos
- **Brochures**: PDF brochure uploads
- **Platform Features**: Feature showcase media
- **Impact**: High - essential for marketing and content

---

## 5. Notification System Enhancement

### 5.1 Notification Icons for All Users
**Requirement**: Universal notification system
- **Feature**: Notification bell icon for all registered users
- **Applies to**: Students, Teachers, Parents, Admins
- **Functionality**: Real-time notifications, notification history
- **Impact**: High - improves communication

---

## Priority Matrix

### Critical (Must Have - Week 1)
1. ✅ Fix Preferred Lesson Duration bug
2. ✅ Implement 24-48 hour verification system
3. ✅ Notification icons for all users
4. ✅ Course visibility management

### High Priority (Week 2-3)
1. Teacher subject management system
2. Spoken English schedule/batch management
3. Complete media upload system
4. Course details upload system

### Medium Priority (Week 4)
1. Purpose of Learning admin management
2. Impact numbers visibility toggle
3. Enhanced course categorization

---

## Technical Implementation Notes

### Database Changes Required
- User verification status table
- Teacher subjects (dynamic)
- Spoken English purposes (dynamic)
- Batch/schedule management tables
- Media library tables
- Notification system tables

### Admin Panel New Sections
1. User Verification Dashboard
2. Subject Management
3. Spoken English Configuration
4. Media Library
5. Course Management (Enhanced)
6. Content Visibility Controls

### API Endpoints Needed
- User verification workflows
- Subject CRUD operations
- Batch/schedule management
- Media upload/management
- Notification system
- Content visibility toggles

---

## Next Steps

1. **Review & Approval**: Client review of requirements breakdown
2. **Technical Specification**: Detailed technical design document
3. **Database Schema**: Design new tables and relationships
4. **UI/UX Mockups**: Design admin panels and user interfaces
5. **Development Phases**: Break into manageable sprints
6. **Testing Plan**: Comprehensive testing strategy
7. **Deployment Plan**: Staged rollout approach

---

## Questions for Client

1. **Verification System**: Should there be different verification times for different user types?
2. **Subject Approval**: Should teachers be notified when custom subjects are approved/rejected?
3. **Batch Management**: Maximum students per batch? Auto-enrollment rules?
4. **Media Storage**: Expected storage limits? CDN requirements?
5. **Notifications**: Push notifications, email, or both?
6. **Timeline**: Preferred completion timeline for each phase?

---

## Estimated Timeline

- **Phase 1 (Critical)**: 1-2 weeks
- **Phase 2 (High Priority)**: 2-3 weeks  
- **Phase 3 (Medium Priority)**: 1-2 weeks
- **Testing & QA**: 1 week
- **Total Estimated Time**: 5-8 weeks

---

**Document Status**: Draft - Awaiting Client Confirmation
**Last Updated**: November 23, 2025
