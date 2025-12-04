/**
 * Monitoring Metrics API
 * Feature: course-assignment-permissions
 * 
 * GET /api/admin/monitoring/metrics - Get metrics summary and alerts
 * 
 * Task 25: Create monitoring and alerting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMetricsSummary, checkAlerts, getMetricRate, METRICS } from '@/lib/monitoring/metrics';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, role_level')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins can view metrics
    if (userData.role_level < 4) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only administrators can view monitoring metrics'
        },
        { status: 403 }
      );
    }

    // Get metrics summary
    const summary = getMetricsSummary();

    // Check for alerts
    const { alerts } = checkAlerts();

    // Get specific rates
    const rates = {
      courseCreation: getMetricRate(METRICS.COURSE_CREATED, 60),
      teacherAssignment: getMetricRate(METRICS.TEACHER_ASSIGNED, 60),
      permissionChecks: getMetricRate(METRICS.PERMISSION_CHECK, 60),
      permissionDenials: getMetricRate(METRICS.PERMISSION_DENIED, 60),
      rlsViolations: getMetricRate(METRICS.RLS_VIOLATION, 60),
      errors: getMetricRate(METRICS.ERROR_OCCURRED, 60),
      rateLimitHits: getMetricRate(METRICS.RATE_LIMIT_EXCEEDED, 60)
    };

    // Calculate health status
    const health = alerts.length === 0 ? 'healthy' : alerts.some(a => a.severity === 'critical') ? 'critical' : 'warning';

    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
      summary,
      rates,
      alerts,
      metadata: {
        windowMinutes: 60,
        description: 'Metrics and rates are calculated over the last 60 minutes'
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
