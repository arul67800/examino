'use client';

import { useTheme } from '@/theme';

export default function QuestionBankManagerPage() {
  const { theme } = useTheme();

  // Sample data for QBM dashboard
  const qbmStats = [
    { title: 'Total Questions', value: '25,847', change: '+12%', icon: '📝', color: theme.colors.semantic.status.info },
    { title: 'Pending Approval', value: '156', change: '+8%', icon: '⏳', color: theme.colors.semantic.status.warning },
    { title: 'Categories', value: '24', change: '+2', icon: '🏷️', color: theme.colors.semantic.status.success },
    { title: 'Quality Score', value: '94.2%', change: '+1.2%', icon: '⭐', color: theme.colors.semantic.status.success },
  ];

  const recentActivities = [
    { action: 'New questions added to Mathematics', count: 45, time: '2 hours ago', type: 'add', category: 'Mathematics' },
    { action: 'Content approved in Science category', count: 12, time: '3 hours ago', type: 'approve', category: 'Science' },
    { action: 'Bulk import completed', count: 234, time: '5 hours ago', type: 'import', category: 'Various' },
    { action: 'Quality check completed', count: 89, time: '8 hours ago', type: 'quality', category: 'English' },
    { action: 'Duplicate questions removed', count: 7, time: '1 day ago', type: 'clean', category: 'History' },
  ];

  const categoryStats = [
    { name: 'Mathematics', questions: 8234, pending: 23, approved: 8211, quality: 95.2 },
    { name: 'Science', questions: 6789, pending: 18, approved: 6771, quality: 93.8 },
    { name: 'English', questions: 5432, pending: 31, approved: 5401, quality: 96.1 },
    { name: 'History', questions: 3456, pending: 12, approved: 3444, quality: 94.7 },
    { name: 'Geography', questions: 1936, pending: 8, approved: 1928, quality: 92.3 },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add': return '➕';
      case 'approve': return '✅';
      case 'import': return '📥';
      case 'quality': return '🔍';
      case 'clean': return '🧹';
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
            Question Bank Manager
          </h1>
          <p 
            className="text-lg mt-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Comprehensive management and oversight of the question bank system.
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
            Quality Report
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            Bulk Operations
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qbmStats.map((stat, index) => (
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
              Recent QBM Activities
            </h3>
            <button
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: theme.colors.semantic.action.primary }}
            >
              View All Activities
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
                    className="text-xs"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {activity.count} items • {activity.category}
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

        {/* Category Overview */}
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
            Category Overview
          </h3>
          <div className="space-y-4">
            {categoryStats.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {category.name}
                  </span>
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      color: category.pending > 20 ? theme.colors.semantic.status.error : theme.colors.semantic.status.success,
                      backgroundColor: category.pending > 20 ? `${theme.colors.semantic.status.error}20` : `${theme.colors.semantic.status.success}20`
                    }}
                  >
                    {category.pending} pending
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span style={{ color: theme.colors.semantic.text.secondary }}>
                      Questions: {category.questions.toLocaleString()}
                    </span>
                    <span style={{ color: theme.colors.semantic.text.secondary }}>
                      Quality: {category.quality}%
                    </span>
                  </div>
                  <div 
                    className="h-2 rounded-full"
                    style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${category.quality}%`,
                        backgroundColor: category.quality > 95 ? theme.colors.semantic.status.success :
                                       category.quality > 90 ? theme.colors.semantic.status.warning :
                                       theme.colors.semantic.status.error
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Panel */}
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
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Review Pending', icon: '⏳', href: '/admin/dashboard/qbm/approval/pending', badge: '12' },
            { name: 'Bulk Import', icon: '📥', href: '/admin/dashboard/qbm/bulk/import' },
            { name: 'Quality Check', icon: '🔍', href: '/admin/dashboard/qbm/quality/validation' },
            { name: 'Categories', icon: '🏷️', href: '/admin/dashboard/qbm/categories' },
            { name: 'Duplicates', icon: '👯', href: '/admin/dashboard/qbm/quality/duplicates', badge: '3' },
            { name: 'Reports', icon: '📊', href: '/admin/dashboard/qbm/quality/reports' },
          ].map((action, index) => (
            <button
              key={index}
              className="relative flex flex-col items-center p-4 rounded-lg transition-all duration-200 hover:scale-105 hover:opacity-80"
              style={{ 
                backgroundColor: theme.colors.semantic.surface.tertiary,
                border: `1px solid ${theme.colors.semantic.border.secondary}`
              }}
              onClick={() => window.location.href = action.href}
            >
              {action.badge && (
                <span 
                  className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: theme.colors.semantic.status.error,
                    color: theme.colors.semantic.text.inverse
                  }}
                >
                  {action.badge}
                </span>
              )}
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