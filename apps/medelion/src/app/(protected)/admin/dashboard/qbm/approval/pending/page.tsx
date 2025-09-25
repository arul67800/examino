'use client';

import { useTheme } from '@/theme';
import { useState } from 'react';

export default function ContentApprovalPage() {
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('pending');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Sample pending approval data
  const pendingContent = [
    {
      id: 1,
      type: 'question',
      title: 'What is the derivative of x²?',
      category: 'Mathematics',
      subcategory: 'Calculus',
      difficulty: 'Medium',
      submittedBy: 'john.teacher@school.edu',
      submittedDate: '2024-02-15',
      timeAgo: '2 hours ago',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 2,
      type: 'question',
      title: 'Explain photosynthesis process',
      category: 'Science',
      subcategory: 'Biology',
      difficulty: 'Easy',
      submittedBy: 'maria.biology@school.edu',
      submittedDate: '2024-02-15',
      timeAgo: '4 hours ago',
      priority: 'medium',
      status: 'pending'
    },
    {
      id: 3,
      type: 'bulk_import',
      title: 'Chemistry Questions - Batch 15',
      category: 'Science',
      subcategory: 'Chemistry',
      difficulty: 'Mixed',
      submittedBy: 'system@examino.com',
      submittedDate: '2024-02-14',
      timeAgo: '1 day ago',
      priority: 'high',
      status: 'pending',
      itemCount: 45
    },
    {
      id: 4,
      type: 'question',
      title: 'Shakespeare\'s literary contributions',
      category: 'English',
      subcategory: 'Literature',
      difficulty: 'Hard',
      submittedBy: 'sarah.english@school.edu',
      submittedDate: '2024-02-14',
      timeAgo: '1 day ago',
      priority: 'low',
      status: 'under_review'
    },
    {
      id: 5,
      type: 'category_update',
      title: 'Updated Mathematics Category Structure',
      category: 'Mathematics',
      subcategory: 'General',
      difficulty: 'N/A',
      submittedBy: 'admin.math@school.edu',
      submittedDate: '2024-02-13',
      timeAgo: '2 days ago',
      priority: 'medium',
      status: 'pending'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.semantic.status.error;
      case 'medium': return theme.colors.semantic.status.warning;
      case 'low': return theme.colors.semantic.status.info;
      default: return theme.colors.semantic.text.secondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return '❓';
      case 'bulk_import': return '📦';
      case 'category_update': return '🏷️';
      default: return '📋';
    }
  };

  const filters = [
    { id: 'pending', name: 'Pending Review', count: pendingContent.filter(item => item.status === 'pending').length },
    { id: 'under_review', name: 'Under Review', count: pendingContent.filter(item => item.status === 'under_review').length },
    { id: 'all', name: 'All Items', count: pendingContent.length },
  ];

  const filteredContent = pendingContent.filter(item => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredContent.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredContent.map(item => item.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on items:`, selectedItems);
    setSelectedItems([]);
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
            Content Approval
          </h1>
          <p 
            className="text-lg mt-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Review and approve pending content submissions across all categories.
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
            Approval Settings
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            Quick Review
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Pending Review', value: '156', icon: '⏳', color: theme.colors.semantic.status.warning },
          { title: 'Under Review', value: '23', icon: '👀', color: theme.colors.semantic.status.info },
          { title: 'Approved Today', value: '89', icon: '✅', color: theme.colors.semantic.status.success },
          { title: 'Avg Review Time', value: '2.5h', icon: '⏱️', color: theme.colors.semantic.action.primary },
        ].map((stat, index) => (
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

      {/* Filter Tabs */}
      <div 
        className="border-b"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <nav className="-mb-px flex space-x-8">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeFilter === filter.id 
                  ? 'border-current' 
                  : 'border-transparent hover:opacity-80'
                }
              `}
              style={{ 
                color: activeFilter === filter.id 
                  ? theme.colors.semantic.action.primary 
                  : theme.colors.semantic.text.secondary,
                borderColor: activeFilter === filter.id 
                  ? theme.colors.semantic.action.primary 
                  : 'transparent'
              }}
            >
              {filter.name}
              <span 
                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: activeFilter === filter.id 
                    ? `${theme.colors.semantic.action.primary}20` 
                    : theme.colors.semantic.surface.tertiary,
                  color: activeFilter === filter.id 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.tertiary
                }}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div 
          className="p-4 rounded-lg flex items-center justify-between"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.tertiary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          <span 
            className="text-sm font-medium"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {selectedItems.length} item(s) selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: theme.colors.semantic.status.success,
                color: theme.colors.semantic.text.inverse
              }}
            >
              Approve All
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: theme.colors.semantic.status.error,
                color: theme.colors.semantic.text.inverse
              }}
            >
              Reject All
            </button>
            <button
              onClick={() => handleBulkAction('review')}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: theme.colors.semantic.action.secondary,
                color: theme.colors.semantic.text.primary
              }}
            >
              Mark for Review
            </button>
          </div>
        </div>
      )}

      {/* Content List */}
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
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredContent.length && filteredContent.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Content
                </th>
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
                  Priority
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Submitted
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
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:opacity-80 transition-opacity">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{getTypeIcon(item.type)}</div>
                      <div>
                        <div 
                          className="text-sm font-medium line-clamp-2"
                          style={{ color: theme.colors.semantic.text.primary }}
                        >
                          {item.title}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span 
                            className="text-xs px-2 py-1 rounded capitalize"
                            style={{
                              backgroundColor: theme.colors.semantic.surface.tertiary,
                              color: theme.colors.semantic.text.tertiary
                            }}
                          >
                            {item.type.replace('_', ' ')}
                          </span>
                          {item.itemCount && (
                            <span 
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: `${theme.colors.semantic.action.primary}20`,
                                color: theme.colors.semantic.action.primary
                              }}
                            >
                              {item.itemCount} items
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div 
                        className="text-sm font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {item.category}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: theme.colors.semantic.text.tertiary }}
                      >
                        {item.subcategory}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: `${getPriorityColor(item.priority)}20`,
                        color: getPriorityColor(item.priority)
                      }}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {item.timeAgo}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: theme.colors.semantic.text.tertiary }}
                      >
                        by {item.submittedBy}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="px-3 py-1.5 rounded text-xs font-medium transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: theme.colors.semantic.status.success,
                          color: theme.colors.semantic.text.inverse
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="px-3 py-1.5 rounded text-xs font-medium transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: theme.colors.semantic.action.secondary,
                          color: theme.colors.semantic.text.primary
                        }}
                      >
                        Review
                      </button>
                      <button
                        className="px-3 py-1.5 rounded text-xs font-medium transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: theme.colors.semantic.status.error,
                          color: theme.colors.semantic.text.inverse
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}