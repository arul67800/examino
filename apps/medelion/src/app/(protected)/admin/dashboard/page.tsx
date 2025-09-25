'use client';

import { useTheme } from '@/theme';

export default function AdminDashboardPage() {
  const { theme } = useTheme();

  // Sample data for the admin dashboard
  const stats = [
    { title: 'Total Users', value: '12,345', change: '+15%', icon: '👥', color: theme.colors.semantic.status.info },
    { title: 'Active Questions', value: '8,902', change: '+8%', icon: '📝', color: theme.colors.semantic.status.success },
    { title: 'Daily Tests', value: '1,234', change: '+23%', icon: '📊', color: theme.colors.semantic.status.warning },
    { title: 'System Health', value: '99.9%', change: '+0.2%', icon: '🚀', color: theme.colors.semantic.status.success },
  ];

  const recentActivities = [
    { action: 'New user registered', user: 'john.doe@example.com', time: '2 minutes ago', type: 'user' },
    { action: 'Question bank updated', user: 'admin@example.com', time: '15 minutes ago', type: 'content' },
    { action: 'System backup completed', user: 'system', time: '1 hour ago', type: 'system' },
    { action: 'Bulk import completed', user: 'jane.smith@example.com', time: '2 hours ago', type: 'import' },
    { action: 'User reported issue', user: 'user123@example.com', time: '3 hours ago', type: 'support' },
  ];

  const systemMetrics = [
    { name: 'CPU Usage', value: 45, max: 100, color: theme.colors.semantic.status.success },
    { name: 'Memory', value: 78, max: 100, color: theme.colors.semantic.status.warning },
    { name: 'Storage', value: 32, max: 100, color: theme.colors.semantic.status.info },
    { name: 'Network', value: 89, max: 100, color: theme.colors.semantic.status.error },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return '👤';
      case 'content': return '📝';
      case 'system': return '⚙️';
      case 'import': return '📤';
      case 'support': return '🆘';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-3xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Admin Dashboard
          </h1>
          <p 
            className="text-lg mt-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: theme.colors.semantic.action.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            Export Report
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            System Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.secondary,
              border: `1px solid ${theme.colors.semantic.border.secondary}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {stat.title}
                </p>
                <p 
                  className="text-2xl font-bold mt-1"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {stat.value}
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: stat.color }}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div 
                className="p-3 rounded-full text-2xl"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div 
          className="lg:col-span-2 p-6 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Recent Activities
            </h3>
            <button
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: theme.colors.semantic.action.primary }}
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg transition-colors hover:opacity-80"
                style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
              >
                <div className="text-xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {activity.action}
                  </p>
                  <p 
                    className="text-xs truncate"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    by {activity.user}
                  </p>
                </div>
                <div 
                  className="text-xs whitespace-nowrap"
                  style={{ color: theme.colors.semantic.text.tertiary }}
                >
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div 
          className="p-6 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          <h3 
            className="text-lg font-semibold mb-6"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            System Metrics
          </h3>
          <div className="space-y-4">
            {systemMetrics.map((metric, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {metric.name}
                  </span>
                  <span 
                    className="text-sm"
                    style={{ color: metric.color }}
                  >
                    {metric.value}%
                  </span>
                </div>
                <div 
                  className="h-2 rounded-full"
                  style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${metric.value}%`,
                      backgroundColor: metric.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div 
        className="p-6 rounded-xl shadow-lg"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.secondary,
          border: `1px solid ${theme.colors.semantic.border.secondary}`
        }}
      >
        <h3 
          className="text-lg font-semibold mb-6"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Add User', icon: '👤➕', href: '/admin/dashboard/users/new' },
            { name: 'Bulk Import', icon: '📤', href: '/admin/dashboard/import' },
            { name: 'Generate Report', icon: '📊', href: '/admin/dashboard/reports' },
            { name: 'System Logs', icon: '📄', href: '/admin/dashboard/logs' },
            { name: 'Backup Data', icon: '💾', href: '/admin/dashboard/backup' },
            { name: 'Help Center', icon: '❓', href: '/admin/dashboard/help' },
          ].map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center p-4 rounded-lg transition-all duration-200 hover:scale-105 hover:opacity-80"
              style={{ 
                backgroundColor: theme.colors.semantic.surface.tertiary,
                border: `1px solid ${theme.colors.semantic.border.secondary}`
              }}
              onClick={() => window.location.href = action.href}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <span 
                className="text-xs font-medium text-center"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {action.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}