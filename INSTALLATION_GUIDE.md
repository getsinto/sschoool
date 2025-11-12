# Student Portal - Installation & Setup Guide

## 🚀 Quick Start

### 1. Install Missing Dependency

The student portal uses one additional dependency that needs to be installed:

```bash
npm install @radix-ui/react-radio-group
```

### 2. Verify Installation

Check that all dependencies are installed:

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 📁 What Was Built

### Student Portal Features (11 Pages)

1. **Dashboard** - `/dashboard/student`
2. **Course Listing** - `/dashboard/student/courses`
3. **Course Detail** - `/dashboard/student/courses/[id]`
4. **Video Learning** - `/dashboard/student/learn/[courseId]/[lessonId]`
5. **Quiz Interface** - `/dashboard/student/quiz/[courseId]/[quizId]`
6. **Assignment Submission** - `/dashboard/student/assignment/[courseId]/[assignmentId]`
7. **Progress Dashboard** - `/dashboard/student/progress`
8. **Certificates** - `/dashboard/student/certificates`
9. **Messages/Inbox** - `/dashboard/student/messages`
10. **Help Center** - `/dashboard/student/help`
11. **Profile Settings** - `/dashboard/student/profile`

### New UI Components Created

- `components/ui/radio-group.tsx` - Radio button groups for quizzes
- `components/ui/label.tsx` - Form labels
- `components/ui/separator.tsx` - Visual dividers

---

## 🧪 Testing the Student Portal

### Access Student Dashboard

1. Navigate to: `http://localhost:3000/dashboard/student`
2. You'll see the student dashboard with:
   - Course overview cards
   - Progress statistics
   - Recent activity
   - Upcoming assignments

### Test Course Flow

1. **View Courses**: `/dashboard/student/courses`
2. **Open Course**: Click any course card
3. **Start Learning**: Click "Continue Learning" button
4. **Watch Video**: Video player with notes and navigation
5. **Take Quiz**: Navigate to quiz from curriculum
6. **Submit Assignment**: Upload files or type response

### Test Progress Tracking

1. Go to: `/dashboard/student/progress`
2. View:
   - Weekly activity charts
   - Course progress
   - Achievements
   - Learning goals

### Test Certificates

1. Go to: `/dashboard/student/certificates`
2. View earned certificates
3. Download or share certificates

---

## 🎨 Customization

### Mock Data

All pages use mock data. To connect to real backend:

1. Replace mock data with API calls
2. Update API routes in `app/api/student/`
3. Connect to Supabase or your database

### Styling

The portal uses:
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components
- **Shadcn/ui** component library

To customize colors, edit `tailwind.config.ts`

---

## 🔧 Troubleshooting

### Issue: Module not found '@radix-ui/react-radio-group'

**Solution:**
```bash
npm install @radix-ui/react-radio-group
```

### Issue: TypeScript errors

**Solution:**
```bash
npm run type-check
```

Fix any type errors shown.

### Issue: Build fails

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Issue: Framer Motion animations not working

**Solution:**
Ensure `framer-motion` is installed:
```bash
npm install framer-motion
```

---

## 📦 Dependencies Used

### Core
- Next.js 14
- React 18
- TypeScript

### UI & Styling
- Tailwind CSS
- Radix UI components
- Framer Motion
- Lucide React (icons)

### Forms & Validation
- React Hook Form
- Zod

### State Management
- React hooks (useState, useEffect)

---

## 🌐 Navigation Structure

```
/dashboard/student
├── / (Dashboard)
├── /courses (Course Listing)
│   └── /[id] (Course Detail)
├── /learn/[courseId]/[lessonId] (Video Learning)
├── /quiz/[courseId]/[quizId] (Quiz)
├── /assignment/[courseId]/[assignmentId] (Assignment)
├── /progress (Progress Dashboard)
├── /certificates (Certificates)
├── /messages (Inbox)
├── /help (Help Center)
└── /profile (Profile Settings)
```

---

## 🎯 Next Steps

### For Development

1. **Connect to Backend**
   - Replace mock data with real API calls
   - Set up authentication
   - Configure Supabase

2. **Add Real Video Support**
   - Integrate video hosting (Vimeo, YouTube, AWS S3)
   - Add video progress tracking
   - Implement resume functionality

3. **Implement Real-time Features**
   - Live chat with instructors
   - Real-time notifications
   - Collaborative features

### For Production

1. **Environment Variables**
   - Set up `.env.local` with production values
   - Configure API endpoints
   - Add authentication keys

2. **Performance Optimization**
   - Enable Next.js image optimization
   - Add lazy loading
   - Implement caching

3. **Testing**
   - Add unit tests
   - Add integration tests
   - Test on multiple devices

---

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

## 🆘 Support

If you encounter any issues:

1. Check the `MISSING_FILES_FIXED.md` document
2. Review the `STUDENT_FEATURES_SUMMARY.md` for feature details
3. Ensure all dependencies are installed
4. Check console for error messages

---

**Happy Coding! 🚀**
