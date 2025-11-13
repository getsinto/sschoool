import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

async function checkDatabase() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase.from('users').select('count').limit(1)
    
    return {
      status: error ? 'error' : 'ok',
      message: error ? error.message : 'Database connection successful',
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Database check failed',
      timestamp: new Date().toISOString()
    }
  }
}

async function checkStorage() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase.storage.listBuckets()
    
    return {
      status: error ? 'error' : 'ok',
      message: error ? error.message : 'Storage connection successful',
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Storage check failed',
      timestamp: new Date().toISOString()
    }
  }
}

async function checkEmailService() {
  try {
    const hasResendKey = !!process.env.RESEND_API_KEY
    
    return {
      status: hasResendKey ? 'ok' : 'warning',
      message: hasResendKey ? 'Email service configured' : 'Email service not configured',
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Email service check failed',
      timestamp: new Date().toISOString()
    }
  }
}

async function checkPaymentGateways() {
  try {
    const hasStripe = !!process.env.STRIPE_SECRET_KEY
    const hasPayPal = !!process.env.PAYPAL_CLIENT_SECRET
    const hasRazorpay = !!process.env.RAZORPAY_KEY_SECRET
    
    const configured = [hasStripe, hasPayPal, hasRazorpay].filter(Boolean).length
    
    return {
      status: configured > 0 ? 'ok' : 'warning',
      message: `${configured} payment gateway(s) configured`,
      details: {
        stripe: hasStripe,
        paypal: hasPayPal,
        razorpay: hasRazorpay
      },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Payment gateway check failed',
      timestamp: new Date().toISOString()
    }
  }
}

export async function GET() {
  try {
    const checks = {
      database: await checkDatabase(),
      storage: await checkStorage(),
      email: await checkEmailService(),
      payments: await checkPaymentGateways()
    }
    
    const allHealthy = Object.values(checks).every(
      check => check.status === 'ok' || check.status === 'warning'
    )
    
    const hasErrors = Object.values(checks).some(
      check => check.status === 'error'
    )
    
    return NextResponse.json(
      {
        status: hasErrors ? 'degraded' : allHealthy ? 'healthy' : 'warning',
        timestamp: new Date().toISOString(),
        checks,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV
      },
      { status: hasErrors ? 503 : 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
