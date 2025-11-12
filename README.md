# St Haroon English Medium Online School

A comprehensive online education platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: PayPal, Razorpay, Stripe
- **Email**: Resend
- **Chatbot**: Google Gemini API
- **Live Classes**: Zoom & Google Meet SDK
- **Hosting**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages (admin, teacher, student, parent)
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase configuration
│   ├── payments/         # Payment integrations
│   ├── email/            # Email utilities
│   └── ai/               # AI/Chatbot utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── public/               # Static assets
```

## Features

- 🔐 Multi-role authentication (Student, Teacher, Admin, Parent)
- 📚 Course management system
- 💳 Multiple payment gateways
- 📧 Email notifications
- 🤖 AI-powered chatbot
- 🎥 Live class integration
- 📱 Responsive design
- 🌙 Dark mode support

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License."# sschoool" 
