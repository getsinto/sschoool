'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, Send, Eye, MousePointer, AlertCircle, 
  TrendingUp, TrendingDown, Minus 
} from 'lucide-react';

export default function EmailAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/email/analytics?days=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Sent',
      value: stats?.sent || 0,
      icon: Send,
      color: 'blue'
    },
    {
      title: 'Delivered',
      value: stats?.delivered || 0,
      percentage: stats?.deliveryRate || 0,
      icon: Mail,
      color: 'green'
    },
    {
      title: 'Opened',
      value: stats?.opened || 0,
      percentage: stats?.openRate || 0,
      icon: Eye,
      color: 'purple'
    },
    {
      title: 'Clicked',
      value: stats?.clicked || 0,
      percentage: stats?.clickRate || 0,
      icon: MousePointer,
      color: 'orange'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Email Analytics</h1>
          <p className="text-gray-600 mt-1">Track email performance and engagement</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value.toLocaleString()}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            {stat.percentage !== undefined && (
              <div className="text-sm text-gray-500 mt-1">
                {stat.percentage.toFixed(1)}% rate
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bounce Rate</span>
              <span className="font-semibold">{(stats?.bounceRate || 0).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Complaint Rate</span>
              <span className="font-semibold">
                {((stats?.complained / stats?.sent * 100) || 0).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Unsubscribe Rate</span>
              <span className="font-semibold">
                {((stats?.unsubscribed / stats?.sent * 100) || 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Button className="w-full" variant="outline">
              View All Campaigns
            </Button>
            <Button className="w-full" variant="outline">
              Send Test Email
            </Button>
            <Button className="w-full" variant="outline">
              Export Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
