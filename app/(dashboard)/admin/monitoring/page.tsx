'use client';

/**
 * Admin Monitoring Dashboard
 * Feature: course-assignment-permissions
 * 
 * Displays metrics, alerts, and system health
 * Task 25: Create monitoring and alerting
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Activity, TrendingUp } from 'lucide-react';

interface MetricsData {
  health: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  summary: Record<string, { count: number; rate: number }>;
  rates: {
    courseCreation: number;
    teacherAssignment: number;
    permissionChecks: number;
    permissionDenials: number;
    rlsViolations: number;
    errors: number;
    rateLimitHits: number;
  };
  alerts: Array<{
    metric: string;
    threshold: number;
    current: number;
    severity: 'warning' | 'critical';
  }>;
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const getHealthIcon = () => {
    switch (metrics.health) {
      case 'healthy':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getHealthColor = () => {
    switch (metrics.health) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">Course Assignment Permissions System</p>
        </div>
        <div className="flex items-center gap-2">
          {getHealthIcon()}
          <Badge className={getHealthColor()}>{metrics.health.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Alerts */}
      {metrics.alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Active Alerts</h2>
          {metrics.alerts.map((alert, index) => (
            <Alert
              key={index}
              variant={alert.severity === 'critical' ? 'destructive' : 'default'}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {alert.severity === 'critical' ? 'Critical' : 'Warning'}: {alert.metric}
              </AlertTitle>
              <AlertDescription>
                Current rate: {alert.current.toFixed(2)}/hour (threshold: {alert.threshold}/hour)
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Course Creation Rate</CardDescription>
            <CardTitle className="text-2xl">
              {metrics.rates.courseCreation.toFixed(2)}/hr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              Per hour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Teacher Assignment Rate</CardDescription>
            <CardTitle className="text-2xl">
              {metrics.rates.teacherAssignment.toFixed(2)}/hr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              Per hour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Permission Checks</CardDescription>
            <CardTitle className="text-2xl">
              {metrics.rates.permissionChecks.toFixed(2)}/hr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-1" />
              Per hour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Error Rate</CardDescription>
            <CardTitle className="text-2xl">
              {metrics.rates.errors.toFixed(2)}/hr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <XCircle className="h-4 w-4 mr-1" />
              Per hour
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Security Metrics</CardTitle>
          <CardDescription>Permission denials and RLS violations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Permission Denials</p>
              <p className="text-2xl font-bold">{metrics.rates.permissionDenials.toFixed(2)}/hr</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">RLS Violations</p>
              <p className="text-2xl font-bold">{metrics.rates.rlsViolations.toFixed(2)}/hr</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rate Limit Hits</p>
              <p className="text-2xl font-bold">{metrics.rates.rateLimitHits.toFixed(2)}/hr</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>All Metrics</CardTitle>
          <CardDescription>Complete metrics summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(metrics.summary).map(([name, data]) => (
              <div key={name} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-mono">{name}</span>
                <div className="flex gap-4">
                  <span className="text-sm text-gray-600">
                    Count: {data.count}
                  </span>
                  <span className="text-sm text-gray-600">
                    Rate: {data.rate.toFixed(2)}/min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500 text-center">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
        <br />
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}
