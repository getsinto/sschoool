'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, TrendingUp, TrendingDown, MousePointerClick, 
  AlertCircle, UserX, BarChart3, Calendar 
} from 'lucide-react';

interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

interface TemplateStats {
  template: string;
  sent: number;
  openRate: number;
  clickRate: number;
}

export default function EmailAnalyticsPage() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [templateStats, setTemplateStats] = useState<TemplateStats[]>([]);
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/email/analytics?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.overall);
        setTemplateStats(data.byTemplate || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Analytics</h1>
          <p className="text-gray-600 mt-1">Monitor email performance and engagement</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <Button onClick={fetchAnalytics}>
            <Calendar className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sent"
          value={stats?.sent || 0}
          icon={<Mail className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Delivery Rate"
          value={`${stats?.deliveryRate.toFixed(1) || 0}%`}
          subtitle={`${stats?.delivered || 0} delivered`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
          trend={stats?.deliveryRate >= 95 ? 'up' : 'down'}
        />
        <StatCard
          title="Open Rate"
          value={`${stats?.openRate.toFixed(1) || 0}%`}
          subtitle={`${stats?.opened || 0} opened`}
          icon={<Mail className="h-5 w-5" />}
          color="purple"
          trend={stats?.openRate >= 20 ? 'up' : 'down'}
        />
        <StatCard
          title="Click Rate"
          value={`${stats?.clickRate.toFixed(1) || 0}%`}
          subtitle={`${stats?.clicked || 0} clicked`}
          icon={<MousePointerClick className="h-5 w-5" />}
          color="indigo"
          trend={stats?.clickRate >= 10 ? 'up' : 'down'}
        />
      </div>

      {/* Issues */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bounced</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.bounced || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.bounceRate.toFixed(1)}% bounce rate
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Spam Complaints</p>
              <p className="text-2xl font-bold text-red-600">{stats?.complained || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.sent ? ((stats.complained / stats.sent) * 100).toFixed(2) : 0}% complaint rate
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unsubscribed</p>
              <p className="text-2xl font-bold text-gray-600">{stats?.unsubscribed || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.sent ? ((stats.unsubscribed / stats.sent) * 100).toFixed(2) : 0}% unsubscribe rate
              </p>
            </div>
            <UserX className="h-8 w-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Performance by Template */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Performance by Template</h2>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Template</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Sent</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Open Rate</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Click Rate</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {templateStats.length > 0 ? (
                templateStats.map((template, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium">{formatTemplateName(template.template)}</span>
                    </td>
                    <td className="text-right py-3 px-4">{template.sent}</td>
                    <td className="text-right py-3 px-4">
                      <span className={getPerformanceColor(template.openRate)}>
                        {template.openRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={getPerformanceColor(template.clickRate)}>
                        {template.clickRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      {getPerformanceBadge(template.openRate, template.clickRate)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No template data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Insights & Recommendations</h2>
        <div className="space-y-3">
          {stats && (
            <>
              {stats.deliveryRate < 95 && (
                <InsightItem
                  type="warning"
                  message={`Delivery rate is ${stats.deliveryRate.toFixed(1)}%. Consider reviewing your email list for invalid addresses.`}
                />
              )}
              {stats.openRate < 15 && (
                <InsightItem
                  type="warning"
                  message={`Open rate is ${stats.openRate.toFixed(1)}%. Try improving subject lines and send times.`}
                />
              )}
              {stats.bounceRate > 5 && (
                <InsightItem
                  type="error"
                  message={`Bounce rate is ${stats.bounceRate.toFixed(1)}%. Clean your email list to improve deliverability.`}
                />
              )}
              {stats.complained > 0 && (
                <InsightItem
                  type="error"
                  message={`${stats.complained} spam complaints received. Review email content and frequency.`}
                />
              )}
              {stats.deliveryRate >= 95 && stats.openRate >= 20 && (
                <InsightItem
                  type="success"
                  message="Great performance! Your emails are being delivered and opened at healthy rates."
                />
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ReactNode; 
  color: string;
  trend?: 'up' | 'down';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
        )}
      </div>
    </Card>
  );
}

function InsightItem({ type, message }: { type: 'success' | 'warning' | 'error'; message: string }) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}

function formatTemplateName(template: string): string {
  return template
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getPerformanceColor(rate: number): string {
  if (rate >= 30) return 'text-green-600 font-semibold';
  if (rate >= 15) return 'text-blue-600 font-medium';
  if (rate >= 10) return 'text-yellow-600';
  return 'text-red-600';
}

function getPerformanceBadge(openRate: number, clickRate: number): JSX.Element {
  const avgRate = (openRate + clickRate) / 2;
  
  if (avgRate >= 25) {
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Excellent</span>;
  }
  if (avgRate >= 15) {
    return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Good</span>;
  }
  if (avgRate >= 10) {
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Average</span>;
  }
  return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Needs Improvement</span>;
}
