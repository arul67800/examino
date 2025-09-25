'use client';

import { useTheme } from '@/theme';
import { useState } from 'react';

export default function CategoriesManagementPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('list');

  // Sample categories data
  const categories = [
    { 
      id: 1, 
      name: 'Mathematics', 
      questions: 8234, 
      pending: 23, 
      approved: 8211, 
      quality: 95.2, 
      status: 'active',
      created: '2024-01-15',
      lastUpdated: '2 hours ago'
    },
    { 
      id: 2, 
      name: 'Science', 
      questions: 6789, 
      pending: 18, 
      approved: 6771, 
      quality: 93.8, 
      status: 'active',
      created: '2024-01-15',
      lastUpdated: '5 hours ago'
    },
    { 
      id: 3, 
      name: 'English', 
      questions: 5432, 
      pending: 31, 
      approved: 5401, 
      quality: 96.1, 
      status: 'active',
      created: '2024-01-20',
      lastUpdated: '1 day ago'
    },
    { 
      id: 4, 
      name: 'History', 
      questions: 3456, 
      pending: 12, 
      approved: 3444, 
      quality: 94.7, 
      status: 'active',
      created: '2024-01-25',
      lastUpdated: '3 days ago'
    },
    { 
      id: 5, 
      name: 'Geography', 
      questions: 1936, 
      pending: 8, 
      approved: 1928, 
      quality: 92.3, 
      status: 'active',
      created: '2024-02-01',
      lastUpdated: '1 week ago'
    },
    { 
      id: 6, 
      name: 'Computer Science', 
      questions: 0, 
      pending: 0, 
      approved: 0, 
      quality: 0, 
      status: 'draft',
      created: '2024-02-10',
      lastUpdated: 'Never'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.semantic.status.success;
      case 'draft': return theme.colors.semantic.status.warning;
      case 'inactive': return theme.colors.semantic.status.error;
      default: return theme.colors.semantic.text.secondary;
    }
  };

  const tabs = [
    { id: 'list', name: 'All Categories', count: categories.length },
    { id: 'active', name: 'Active', count: categories.filter(c => c.status === 'active').length },
    { id: 'draft', name: 'Draft', count: categories.filter(c => c.status === 'draft').length },
  ];

  const filteredCategories = categories.filter(category => {
    if (activeTab === 'active') return category.status === 'active';
    if (activeTab === 'draft') return category.status === 'draft';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-3xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Categories Management
          </h1>
          <p 
            className="text-lg mt-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Organize and manage question categories across the platform.
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
            Import Categories
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            Create Category
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div 
        className="border-b"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id 
                  ? 'border-current' 
                  : 'border-transparent hover:opacity-80'
                }
              `}
              style={{ 
                color: activeTab === tab.id 
                  ? theme.colors.semantic.action.primary 
                  : theme.colors.semantic.text.secondary,
                borderColor: activeTab === tab.id 
                  ? theme.colors.semantic.action.primary 
                  : 'transparent'
              }}
            >
              {tab.name}
              <span 
                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: activeTab === tab.id 
                    ? `${theme.colors.semantic.action.primary}20` 
                    : theme.colors.semantic.surface.tertiary,
                  color: activeTab === tab.id 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.tertiary
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Categories Table */}
      <div 
        className="rounded-xl shadow-lg overflow-hidden"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.secondary,
          border: `1px solid ${theme.colors.semantic.border.secondary}`
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead 
              className="border-b"
              style={{ 
                backgroundColor: theme.colors.semantic.surface.tertiary,
                borderColor: theme.colors.semantic.border.secondary
              }}
            >
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Category
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Questions
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Quality Score
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Last Updated
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody 
              className="divide-y" 
              style={{ 
                '--tw-divide-opacity': '1',
                borderColor: theme.colors.semantic.border.secondary
              } as any}
            >
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:opacity-80 transition-opacity">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div 
                        className="text-sm font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {category.name}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.tertiary }}
                      >
                        Created: {category.created}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div 
                        className="text-sm font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {category.questions.toLocaleString()} total
                      </div>
                      {category.pending > 0 && (
                        <div 
                          className="text-xs px-2 py-1 rounded inline-flex items-center"
                          style={{
                            backgroundColor: `${theme.colors.semantic.status.warning}20`,
                            color: theme.colors.semantic.status.warning
                          }}
                        >
                          {category.pending} pending
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: `${getStatusColor(category.status)}20`,
                        color: getStatusColor(category.status)
                      }}
                    >
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.quality > 0 ? (
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-16 h-2 rounded-full"
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
                        <span 
                          className="text-sm font-medium"
                          style={{ color: theme.colors.semantic.text.primary }}
                        >
                          {category.quality}%
                        </span>
                      </div>
                    ) : (
                      <span 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.tertiary }}
                      >
                        No data
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="text-sm"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {category.lastUpdated}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="p-2 rounded hover:opacity-80 transition-colors"
                        style={{ color: theme.colors.semantic.text.secondary }}
                        title="Edit Category"
                      >
                        ✏️
                      </button>
                      <button
                        className="p-2 rounded hover:opacity-80 transition-colors"
                        style={{ color: theme.colors.semantic.text.secondary }}
                        title="View Questions"
                      >
                        👁️
                      </button>
                      <button
                        className="p-2 rounded hover:opacity-80 transition-colors"
                        style={{ color: theme.colors.semantic.status.error }}
                        title="Delete Category"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="p-6 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Category Distribution
          </h3>
          <div className="space-y-3">
            {categories.filter(c => c.status === 'active').slice(0, 5).map((category, index) => (
              <div key={category.id} className="flex items-center justify-between">
                <span 
                  className="text-sm"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {category.name}
                </span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-16 h-1.5 rounded-full"
                    style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
                  >
                    <div
                      className="h-1.5 rounded-full"
                      style={{ 
                        width: `${(category.questions / Math.max(...categories.map(c => c.questions))) * 100}%`,
                        backgroundColor: theme.colors.semantic.action.primary
                      }}
                    />
                  </div>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {category.questions.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="p-6 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Quality Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span 
                className="text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Excellent (95%+)
              </span>
              <span 
                className="text-sm font-medium"
                style={{ color: theme.colors.semantic.status.success }}
              >
                {categories.filter(c => c.quality >= 95).length} categories
              </span>
            </div>
            <div className="flex justify-between">
              <span 
                className="text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Good (90-94%)
              </span>
              <span 
                className="text-sm font-medium"
                style={{ color: theme.colors.semantic.status.warning }}
              >
                {categories.filter(c => c.quality >= 90 && c.quality < 95).length} categories
              </span>
            </div>
            <div className="flex justify-between">
              <span 
                className="text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Needs Improvement
              </span>
              <span 
                className="text-sm font-medium"
                style={{ color: theme.colors.semantic.status.error }}
              >
                {categories.filter(c => c.quality < 90 && c.quality > 0).length} categories
              </span>
            </div>
          </div>
        </div>

        <div 
          className="p-6 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Pending Approvals
          </h3>
          <div className="space-y-3">
            {categories
              .filter(c => c.pending > 0)
              .sort((a, b) => b.pending - a.pending)
              .slice(0, 4)
              .map((category) => (
              <div key={category.id} className="flex justify-between items-center">
                <span 
                  className="text-sm"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {category.name}
                </span>
                <span 
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{
                    backgroundColor: `${theme.colors.semantic.status.warning}20`,
                    color: theme.colors.semantic.status.warning
                  }}
                >
                  {category.pending} pending
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}