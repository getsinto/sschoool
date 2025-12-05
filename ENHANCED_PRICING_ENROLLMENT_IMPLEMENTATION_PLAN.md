# Enhanced Pricing & Enrollment Options - Implementation Plan

**Date**: January 7, 2025  
**Feature**: Advanced Course Pricing & Enrollment System  
**Estimated Time**: 15-20 hours  
**Priority**: HIGH

---

## 📋 Overview

Expand the existing basic pricing system to support:
- Multiple pricing models (free, one-time, subscription, payment plans, tiered, pay-what-you-want)
- Batch-based courses with scheduling
- Enrollment limits and waitlists
- Course bundles
- Early bird pricing
- Free trials
- Access duration control
- Enhanced coupons and discounts

---

## 🎯 Current State

### Existing Features
- ✅ Free or Paid courses
- ✅ Basic course price
- ✅ Payment gateway integration (Stripe)
- ✅ Basic coupon system
- ✅ Simple enrollment

### Limitations
- ❌ Only one-time payment model
- ❌ No subscription support
- ❌ No payment plans
- ❌ No enrollment limits
- ❌ No batch-based courses
- ❌ No course bundles
- ❌ No early bird pricing
- ❌ No access duration control

---

## 🚀 Implementation Phases

### Phase 1: Database Schema (3-4 hours)
**Priority**: CRITICAL  
**Status**: NOT STARTED

**Tasks**:
1. Update `courses` table with new pricing fields
2. Create `course_batches` table
3. Create `course_bundles` table
4. Create `course_waitlist` table
5. Update `enrollments` table
6. Create indexes and RLS policies
7. Create helper functions

**Deliverables**:
- Migration file: `20250108000001_enhanced_pricing_enrollment.sql`
- ~500 lines of SQL

---

### Phase 2: Type Definitions (1-2 hours)
**Priority**: HIGH  
**Status**: NOT STARTED

**Tasks**:
1. Create pricing types
2. Create batch types
3. Create bundle types
4. Create waitlist types
5. Update enrollment types

**Deliverables**:
- `types/pricing.ts` (~400 lines)
- Update `types/course.ts`
- Update `types/database.ts`

---

### Phase 3: Enhanced PricingForm Component (3-4 hours)
**Priority**: HIGH  
**Status**: NOT STARTED

**Tasks**:
1. Update existing PricingForm
2. Add pricing model selector
3. Add payment plan configuration
4. Add early bird pricing
5. Add tiered pricing setup
6. Add free trial settings
7. Add enrollment limits
8. Add access duration

**Deliverables**:
- Update `components/teacher/course-builder/PricingForm.tsx`
- ~800 lines (expanded from current)

---

### Phase 4: Batch Management (2-3 hours)
**Priority**: MEDIUM  
**Status**: NOT STARTED

**Tasks**:
1. Create BatchManager component
2. Batch creation form
3. Batch schedule calendar
4. Student enrollment per batch
5. Batch cloning
6. Batch status management

**Deliverables**:
- `components/teacher/course-builder/BatchManager.tsx` (~600 lines)
- `components/teacher/course-builder/BatchForm.tsx` (~400 lines)

---

### Phase 5: Bundle Creator (2 hours)
**Priority**: MEDIUM  
**Status**: NOT STARTED

**Tasks**:
1. Create BundleCreator component
2. Course selection for bundle
3. Bundle pricing calculator
4. Savings display
5. Bundle management

**Deliverables**:
- `components/admin/bundles/BundleCreator.tsx` (~500 lines)
- `components/admin/bundles/BundleList.tsx` (~300 lines)

---

### Phase 6: Public Course Page Updates (2-3 hours)
**Priority**: HIGH  
**Status**: NOT STARTED

**Tasks**:
1. Update course detail page
2. Show pricing options
3. Batch selector (if batch-based)
4. Enrollment countdown
5. Spots remaining indicator
6. Early bird notice
7. Free trial badge
8. Waitlist join button

**Deliverables**:
- Update `app/(public)/courses/[slug]/page.tsx`
- `components/public/course/PricingDisplay.tsx` (~400 lines)
- `components/public/course/BatchSelector.tsx` (~300 lines)
- `components/public/course/EnrollmentStatus.tsx` (~200 lines)

---

### Phase 7: API Routes (3-4 hours)
**Priority**: HIGH  
**Status**: NOT STARTED

**Tasks**:
1. Update pricing API
2. Create batch management APIs
3. Create bundle APIs
4. Create waitlist APIs
5. Create installment payment APIs
6. Update enrollment APIs

**Deliverables**:
- Update `app/api/teacher/courses/[id]/pricing/route.ts`
- `app/api/teacher/courses/[id]/batches/route.ts`
- `app/api/teacher/courses/[id]/batches/[batchId]/route.ts`
- `app/api/admin/bundles/route.ts`
- `app/api/admin/bundles/[id]/route.ts`
- `app/api/student/courses/[id]/join-waitlist/route.ts`
- `app/api/payments/installment/route.ts`
- `app/api/payments/subscription/route.ts`
- ~1,500 lines total

---

### Phase 8: Payment Integration (2-3 hours)
**Priority**: HIGH  
**Status**: NOT STARTED

**Tasks**:
1. Update Stripe integration for subscriptions
2. Add payment plan handling
3. Add installment scheduling
4. Add free trial handling
5. Add subscription management

**Deliverables**:
- Update `lib/payments/stripe.ts`
- `lib/payments/subscriptions.ts` (~400 lines)
- `lib/payments/installments.ts` (~300 lines)

---

### Phase 9: Admin Management (1-2 hours)
**Priority**: MEDIUM  
**Status**: NOT STARTED

**Tasks**:
1. Bundle management page
2. Batch overview page
3. Waitlist management
4. Pricing analytics

**Deliverables**:
- `app/(dashboard)/admin/bundles/page.tsx`
- `app/(dashboard)/admin/batches/page.tsx`
- `app/(dashboard)/admin/pricing-analytics/page.tsx`

---

### Phase 10: Testing & Documentation (2 hours)
**Priority**: MEDIUM  
**Status**: NOT STARTED

**Tasks**:
1. Test all pricing models
2. Test batch enrollment
3. Test waitlist flow
4. Test payment plans
5. Create user documentation
6. Create API documentation

**Deliverables**:
- Test files
- User guides
- API documentation

---

## 📊 Detailed Feature Breakdown

### 1. Pricing Models

#### Free Course
```typescript
{
  pricing_model: 'free',
  price: 0,
  // No payment required
}
```

#### One-time Payment (Enhanced)
```typescript
{
  pricing_model: 'one_time',
  price: 299.99,
  currency: 'USD',
  payment_plan_enabled: true,
  payment_plan_installments: 3,
  payment_plan_frequency: 'monthly'
}
```

#### Subscription
```typescript
{
  pricing_model: 'subscription',
  subscription_type: 'monthly' | 'quarterly' | 'yearly',
  subscription_price: 29.99,
  auto_renewal: true
}
```

#### Tiered Pricing
```typescript
{
  pricing_model: 'tiered',
  tiers: [
    { name: 'Basic', price: 99, features: [...] },
    { name: 'Premium', price: 199, features: [...] },
    { name: 'VIP', price: 399, features: [...] }
  ]
}
```

#### Pay What You Want
```typescript
{
  pricing_model: 'pay_what_you_want',
  min_price: 10,
  suggested_price: 50
}
```

### 2. Enrollment Features

#### Enrollment Limits
```typescript
{
  max_students: 50,
  min_students: 10,
  enable_waitlist: true,
  current_enrollments: 45,
  spots_remaining: 5
}
```

#### Batch-Based Courses
```typescript
{
  is_batch_based: true,
  batches: [
    {
      batch_name: 'Batch #5 - March 2024',
      start_date: '2024-03-01',
      end_date: '2024-05-31',
      registration_opens: '2024-02-01',
      registration_closes: '2024-02-28',
      schedule_days: ['monday', 'wednesday', 'friday'],
      schedule_time: '18:00',
      max_students: 30
    }
  ]
}
```

#### Access Duration
```typescript
{
  access_duration_type: 'lifetime' | 'time_limited' | 'batch_duration',
  access_duration_days: 90, // for time_limited
  access_expires_at: '2024-12-31' // calculated
}
```

### 3. Discounts & Promotions

#### Early Bird Pricing
```typescript
{
  early_bird_enabled: true,
  early_bird_price: 199,
  early_bird_deadline: '2024-02-15',
  regular_price: 299
}
```

#### Free Trial
```typescript
{
  free_trial_enabled: true,
  free_trial_days: 7,
  trial_requires_card: true
}
```

### 4. Course Bundles
```typescript
{
  bundle_name: 'Complete Mathematics Package',
  bundle_description: 'All math courses in one package',
  course_ids: ['uuid1', 'uuid2', 'uuid3'],
  regular_price: 300,
  bundle_price: 250,
  savings_amount: 50
}
```

---

## 🗄️ Database Schema

### Updated `courses` Table
```sql
ALTER TABLE courses ADD COLUMN pricing_model TEXT DEFAULT 'one_time';
ALTER TABLE courses ADD COLUMN subscription_type TEXT;
ALTER TABLE courses ADD COLUMN subscription_price DECIMAL(10,2);
ALTER TABLE courses ADD COLUMN payment_plan_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN payment_plan_installments INTEGER;
ALTER TABLE courses ADD COLUMN payment_plan_frequency TEXT;
ALTER TABLE courses ADD COLUMN early_bird_price DECIMAL(10,2);
ALTER TABLE courses ADD COLUMN early_bird_deadline TIMESTAMP;
ALTER TABLE courses ADD COLUMN min_students INTEGER;
ALTER TABLE courses ADD COLUMN max_students INTEGER;
ALTER TABLE courses ADD COLUMN enable_waitlist BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN access_duration_type TEXT DEFAULT 'lifetime';
ALTER TABLE courses ADD COLUMN access_duration_days INTEGER;
ALTER TABLE courses ADD COLUMN is_batch_based BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN min_price DECIMAL(10,2);
ALTER TABLE courses ADD COLUMN suggested_price DECIMAL(10,2);
ALTER TABLE courses ADD COLUMN free_trial_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN free_trial_days INTEGER;
ALTER TABLE courses ADD COLUMN bundle_id UUID REFERENCES course_bundles(id);
```

### New `course_batches` Table
```sql
CREATE TABLE course_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  batch_name TEXT NOT NULL,
  batch_number INTEGER,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_opens DATE NOT NULL,
  registration_closes DATE NOT NULL,
  schedule_days TEXT[],
  schedule_time TIME,
  timezone TEXT DEFAULT 'UTC',
  max_students INTEGER,
  min_students INTEGER,
  current_enrollments INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### New `course_bundles` Table
```sql
CREATE TABLE course_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_name TEXT NOT NULL,
  bundle_description TEXT,
  bundle_price DECIMAL(10,2) NOT NULL,
  regular_price DECIMAL(10,2),
  savings_amount DECIMAL(10,2),
  course_ids UUID[],
  validity_days INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### New `course_waitlist` Table
```sql
CREATE TABLE course_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES course_batches(id),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_waitlist_at TIMESTAMP DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  status TEXT DEFAULT 'waiting'
);
```

### Updated `enrollments` Table
```sql
ALTER TABLE enrollments ADD COLUMN batch_id UUID REFERENCES course_batches(id);
ALTER TABLE enrollments ADD COLUMN pricing_tier TEXT;
ALTER TABLE enrollments ADD COLUMN access_expires_at TIMESTAMP;
ALTER TABLE enrollments ADD COLUMN is_trial BOOLEAN DEFAULT FALSE;
ALTER TABLE enrollments ADD COLUMN trial_ends_at TIMESTAMP;
ALTER TABLE enrollments ADD COLUMN payment_plan_id UUID;
ALTER TABLE enrollments ADD COLUMN subscription_id TEXT;
```

---

## 🎨 UI Components

### PricingForm Updates
- Pricing model selector (radio buttons)
- Conditional fields based on model
- Payment plan configuration
- Early bird pricing section
- Tiered pricing builder
- Free trial toggle
- Enrollment limits
- Access duration selector

### BatchManager
- Batch list view
- Create/edit batch form
- Schedule calendar
- Enrollment tracking
- Batch cloning
- Status management

### BundleCreator
- Course multi-select
- Price calculator
- Savings display
- Bundle preview

### Public Course Page
- Dynamic pricing display
- Batch selector dropdown
- Enrollment countdown
- Spots remaining badge
- Early bird banner
- Free trial badge
- Waitlist button

---

## 🔌 API Endpoints

### Pricing
- `PATCH /api/teacher/courses/[id]/pricing` - Update pricing
- `GET /api/courses/[id]/pricing` - Get pricing info

### Batches
- `GET /api/teacher/courses/[id]/batches` - List batches
- `POST /api/teacher/courses/[id]/batches` - Create batch
- `PATCH /api/teacher/courses/[id]/batches/[batchId]` - Update batch
- `DELETE /api/teacher/courses/[id]/batches/[batchId]` - Delete batch
- `POST /api/teacher/courses/[id]/batches/[batchId]/clone` - Clone batch

### Bundles
- `GET /api/admin/bundles` - List bundles
- `POST /api/admin/bundles` - Create bundle
- `PATCH /api/admin/bundles/[id]` - Update bundle
- `DELETE /api/admin/bundles/[id]` - Delete bundle

### Waitlist
- `POST /api/student/courses/[id]/join-waitlist` - Join waitlist
- `DELETE /api/student/courses/[id]/leave-waitlist` - Leave waitlist
- `GET /api/teacher/courses/[id]/waitlist` - View waitlist

### Payments
- `POST /api/payments/installment` - Process installment
- `POST /api/payments/subscription/create` - Create subscription
- `POST /api/payments/subscription/cancel` - Cancel subscription
- `POST /api/payments/trial/start` - Start free trial

---

## 📝 Implementation Order

### Week 1: Core Infrastructure
1. ✅ Database migration
2. ✅ Type definitions
3. ✅ Update PricingForm component

### Week 2: Batch & Bundle Features
4. ✅ BatchManager component
5. ✅ BundleCreator component
6. ✅ API routes for batches and bundles

### Week 3: Public Interface & Payments
7. ✅ Update public course page
8. ✅ Payment integration
9. ✅ Waitlist functionality

### Week 4: Admin & Testing
10. ✅ Admin management pages
11. ✅ Testing
12. ✅ Documentation

---

## 🎯 Success Criteria

### Functional
- ✅ All 8 pricing models working
- ✅ Batch enrollment functional
- ✅ Waitlist notifications working
- ✅ Payment plans processing correctly
- ✅ Subscriptions auto-renewing
- ✅ Bundles calculating savings
- ✅ Early bird pricing switching automatically

### Technical
- ✅ Database migration successful
- ✅ RLS policies secure
- ✅ API endpoints tested
- ✅ Payment integration working
- ✅ Type safety maintained

### User Experience
- ✅ Intuitive pricing setup
- ✅ Clear pricing display
- ✅ Easy batch selection
- ✅ Smooth enrollment flow
- ✅ Transparent waitlist process

---

## 🚨 Risks & Mitigation

### Risk 1: Payment Integration Complexity
**Mitigation**: Start with Stripe, add others later

### Risk 2: Batch Scheduling Complexity
**Mitigation**: Use simple date/time, add advanced features later

### Risk 3: Database Performance
**Mitigation**: Add indexes, optimize queries

### Risk 4: User Confusion
**Mitigation**: Clear UI, good documentation, tooltips

---

## 📚 Documentation Needed

1. **User Guides**
   - How to set up different pricing models
   - How to create and manage batches
   - How to create course bundles
   - How to manage waitlists

2. **Developer Guides**
   - API reference
   - Database schema
   - Payment integration
   - Type definitions

3. **Admin Guides**
   - Pricing analytics
   - Batch management
   - Bundle management
   - Waitlist management

---

**Status**: Ready to Start  
**Next Step**: Create database migration  
**Estimated Completion**: 2-3 weeks
