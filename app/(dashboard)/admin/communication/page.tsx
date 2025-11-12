'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Megaphone, 
  Mail, 
  MessageSquare, 
  HelpCircle,
  ArrowRight,
  Users,
  Send,
  Clock,
  CheckCircle
} from 'lucide-react'

const communicationModules = [
  {
    title: 'Announcements',
    description: 'Create and manage platform-wide announcements for all users',
    icon: Megaphone,
    href: '/admin/communication/announcements',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    stats: {
      total: 45,
      active: 12,
      scheduled: 3
    }
  },
  {
    title: 'Email Campaigns',
    description: 'Send targeted email campaigns to specific user groups',
    icon: Mail,
    href: '/admin/communication/emails',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    stats: {
      total: 128,
      sent: 98,
      pending: 5
    }
  },
  {
    title: 'Messages',
    description: 'Direct messaging system for user communication',
    icon: MessageSquare,
    href: '/admin/communication/messages',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    stats: {
      total: 1247,
      unread: 23,
      today: 45
    }
  },
  {
    title: 'Support Tickets',
    description: 'Manage and respond to user support requests',
    icon: HelpCircle,
    href: '/admin/communication/support-tickets',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    stats: {
      total: 89,
      open: 12,
      resolved: 77
    }
  }
]

const recentActivity = [
  {
    id: 1,
    type: 'announcement',
    title: 'New Course Launch Announcement',
    description: 'Sent to all students and parents',
    time: '2 hours ago',
    icon: Megaphone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 2,
    type: 'email',
    title: 'Weekly Newsletter Campaign',
    description: 'Delivered to 2,847 subscribers',
    time: '5 hours ago',
    icon: Mail,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 3,
    type: 'ticket',
    title: 'Support Ticket #1234 Resolved',
    description: 'Login issue fixed for Sarah Johnson',
    time: '1 day ago',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 4,
    type: 'message',
    title: 'Bulk Message to Teachers',
    description: 'Grading deadline reminder sent',
    time: '2 days ago',
    icon: MessageSquare,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  }
]

export default function CommunicationPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-gray-600 mt-1">
            Manage all platform communications from one central hub
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>2,847 Active Users</span>
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">1,509</p>
                <p className="text-xs text-green-600 mt-1">+12% this week</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                <p className="text-xs text-orange-600 mt-1">Needs attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Announcements</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                <p className="text-xs text-blue-600 mt-1">3 scheduled</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">2.4h</p>
                <p className="text-xs text-green-600 mt-1">-15% faster</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communicationModules.map((module) => (
          <Card key={module.title} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${module.bgColor} rounded-lg flex items-center justify-center`}>
                    <module.icon className={`w-6 h-6 bg-gradient-to-r ${module.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="grid grid-cols-3 gap-4 flex-1">
                  {Object.entries(module.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="text-xs text-gray-500 capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Link href={module.href}>
                <Button className="w-full" variant="outline">
                  Open {module.title}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Activity</span>
            <Button variant="outline" size="sm">View All</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
