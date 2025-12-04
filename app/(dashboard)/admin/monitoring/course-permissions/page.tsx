/**
 * Course Permissions Monitoring Dashboard
 * Task 25: Create monitoring and alerting
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react';

interface MetricsSummary {
  courseCreationRate: number;
  teacherAssignmentRate: number;
  permissionCheckFailureRate: number;
  rlsViolationCount: number;
  totalCourseCreations: number;
  totalTeacherAssignments: number;
}

interface AlertData {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metricCount: number;
}

export default function CoursePermissionsMonitoringPage() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [timeRange, setTimeRange] = useState('24');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch summary
      const summaryRes = await fetch(`/api/admin/monitoring/course-permissions?action=summary&hours=${timeRange}`);
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }

      // Fetch alerts
      const alertsRes = await fetch(`/api/admin/monitoring/course-permissions?action=alerts&hours=${timeRange}`);
      const alertsData = await alertsRes.json();
      if (alertsData.success) {
        setAlerts(alertsData.data.alerts || []);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Course Permissions Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor course creation, teacher assignments, and permission checks
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Hour</SelectItem>
              <SelectItem value="6">Last 6 Hours</SelectItem>
              <SelectItem value="24">Last 24 Hours</SelectItem>
              <SelectItem value="168">Last Week</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Active Alerts
          </h2>
          {alerts.map((alert, index) => (
            <Alert key={index} variant={getSeverityColor(alert.severity) as any}>
              <div className="flex items-start gap-2">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <AlertTitle className="flex items-center gap-2">
                    {alert.message}
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    {alert.metricCount} related metrics in the last {timeRange} hours
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Metrics Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Course Creation Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.courseCreationRate.toFixed(2)}/hr
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.totalCourseCreations} total in last {timeRange}h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Teacher Assignment Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.teacherAssignmentRate.toFixed(2)}/hr
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.totalTeacherAssignments} total in last {timeRange}h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Permission Check Failures
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.permissionCheckFailureRate.toFixed(2)}/hr
              </div>
              <p className="text-xs text-muted-foreground">
                Rate of failed permission checks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                RLS Violations
              </CardTitle>
              <Shield className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.rlsViolationCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.rlsViolationCount === 0 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    No violations detected
                  </span>
                ) : (
                  <span className="text-destructive">
                    Security policy violations
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Overall health of course permission system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Permission Checks</span>
              {summary && summary.permissionCheckFailureRate < 10 ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Issues Detected
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">RLS Policies</span>
              {summary && summary.rlsViolationCount === 0 ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Violations Detected
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Alerts</span>
              {alerts.length === 0 ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  No Alerts
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {alerts.length} Active
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
