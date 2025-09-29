/**
 * Comprehensive Overview Component
 * Combines all analytics into a single dashboard view with interactive widgets
 * and key insights for a complete picture of the question bank system
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/theme';
import { QuestionBankStats, Difficulty, QuestionType } from '../../types';

// Import all analytics components
import { MetricsOverview } from './metrics-overview';
import { DifficultyAnalytics } from './difficulty-analytics';
import { TypeDistribution } from './type-distribution';
import { HierarchyDistribution } from './hierarchy-distribution';
import { ApprovalStatusAnalytics } from './approval-status-analytics';
import { TimeBasedAnalytics } from './time-based-analytics';
import { StaffContributionAnalytics } from './staff-contribution-analytics';

// Component wrapper interfaces
interface WrappedComponentProps {
  stats?: QuestionBankStats;
  className?: string;
}

// Create wrapped components that handle different interfaces
const MetricsOverviewWrapper: React.FC<WrappedComponentProps> = ({ stats }) => {
  const mockStats = {
    totalQuestions: stats?.totalQuestions || 707,
    approvedQuestions: 423,
    pendingQuestions: 127,
    rejectedQuestions: 75,
    lastUpdated: new Date().toISOString()
  };
  return <MetricsOverview stats={mockStats} />;
};

const DifficultyAnalyticsWrapper: React.FC<WrappedComponentProps> = () => {
  const mockData = [
    { name: 'Easy', value: 245, percentage: 35 },
    { name: 'Medium', value: 320, percentage: 45 },
    { name: 'Hard', value: 142, percentage: 20 }
  ];
  return <DifficultyAnalytics data={mockData} />;
};

const TypeDistributionWrapper: React.FC<WrappedComponentProps> = () => {
  const mockData = [
    { name: 'MCQ', value: 450, percentage: 64 },
    { name: 'True/False', value: 180, percentage: 25 },
    { name: 'Fill in Blank', value: 77, percentage: 11 }
  ];
  return <TypeDistribution data={mockData} />;
};

const HierarchyDistributionWrapper: React.FC<WrappedComponentProps> = ({ stats }) => {
  const mockStats: QuestionBankStats = {
    totalQuestions: stats?.totalQuestions || 707,
    activeQuestions: stats?.activeQuestions || 650,
    inactiveQuestions: stats?.inactiveQuestions || 57,
    byDifficulty: stats?.byDifficulty || { 
      'EASY': 245, 
      'MEDIUM': 320, 
      'HARD': 142 
    } as Record<Difficulty, number>,
    byType: stats?.byType || { 
      'SINGLE_CHOICE': 350,
      'MULTIPLE_CHOICE': 180,
      'TRUE_FALSE': 120,
      'ASSERTION_REASONING': 57
    } as Record<QuestionType, number>,
    byHierarchy: stats?.byHierarchy || [],
    recentActivity: stats?.recentActivity || [],
    popularTags: stats?.popularTags || [],
    averagePoints: stats?.averagePoints || 2.5,
    averageTimeLimit: stats?.averageTimeLimit || 120
  };
  return <HierarchyDistribution stats={mockStats} />;
};

interface ComprehensiveOverviewProps {
  stats?: QuestionBankStats;
  className?: string;
}

type DashboardWidget = 
  | 'metrics'
  | 'difficulty'
  | 'types'
  | 'hierarchy'
  | 'approval'
  | 'timeline'
  | 'staff';

interface WidgetConfig {
  id: DashboardWidget;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  size: 'small' | 'medium' | 'large';
  component: React.ComponentType<{ stats?: QuestionBankStats; className?: string }>;
}

const widgetConfigs: WidgetConfig[] = [
  {
    id: 'metrics',
    title: 'Key Metrics',
    description: 'Overall system statistics and KPIs',
    icon: '📊',
    priority: 'high',
    size: 'large',
    component: MetricsOverviewWrapper
  },
  {
    id: 'difficulty',
    title: 'Difficulty Analysis',
    description: 'Question difficulty distribution and insights',
    icon: '📈',
    priority: 'high',
    size: 'medium',
    component: DifficultyAnalyticsWrapper
  },
  {
    id: 'types',
    title: 'Question Types',
    description: 'Distribution of MCQ, True/False, and other types',
    icon: '🔢',
    priority: 'medium',
    size: 'medium',
    component: TypeDistributionWrapper
  },
  {
    id: 'hierarchy',
    title: 'Hierarchy Distribution',
    description: 'Questions across different hierarchy levels',
    icon: '🏗️',
    priority: 'high',
    size: 'large',
    component: HierarchyDistributionWrapper
  },
  {
    id: 'approval',
    title: 'Approval Workflow',
    description: 'Question approval status and workflow analytics',
    icon: '✅',
    priority: 'medium',
    size: 'medium',
    component: ApprovalStatusAnalytics
  },
  {
    id: 'timeline',
    title: 'Time-Based Trends',
    description: 'Question creation and approval trends over time',
    icon: '📅',
    priority: 'medium',
    size: 'large',
    component: TimeBasedAnalytics
  },
  {
    id: 'staff',
    title: 'Staff Contributions',
    description: 'Individual and team performance analytics',
    icon: '👥',
    priority: 'low',
    size: 'large',
    component: StaffContributionAnalytics
  }
];

export const ComprehensiveOverview: React.FC<ComprehensiveOverviewProps> = ({
  stats,
  className = ''
}) => {
  const { theme } = useTheme();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Filter widgets by priority
  const filteredWidgets = useMemo(() => {
    if (filterPriority === 'all') return widgetConfigs;
    return widgetConfigs.filter(widget => widget.priority === filterPriority);
  }, [filterPriority]);

  // Generate layout classes based on widget size
  const getWidgetClasses = (size: string, layout: string) => {
    if (layout === 'list') {
      return 'col-span-1';
    }
    
    switch (size) {
      case 'small': return 'col-span-1 md:col-span-1';
      case 'medium': return 'col-span-1 md:col-span-2';
      case 'large': return 'col-span-1 md:col-span-3';
      default: return 'col-span-1';
    }
  };



  if (selectedWidget) {
    const widgetConfig = widgetConfigs.find(w => w.id === selectedWidget);
    const WidgetComponent = widgetConfig?.component;
    
    return (
      <div 
        className={`rounded-xl p-6 ${className}`}
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedWidget(null)}
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{ backgroundColor: theme.colors.semantic.action.primary + '10' }}
            >
              <svg 
                className="w-5 h-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={theme.colors.semantic.action.primary}
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <div>
              <h2 
                className="text-xl font-bold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {widgetConfig?.icon} {widgetConfig?.title}
              </h2>
              <p 
                className="text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                {widgetConfig?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Widget Content */}
        {WidgetComponent && <WidgetComponent stats={stats} />}
      </div>
    );
  }

  return (
    <div 
      className={`rounded-xl p-6 ${className}`}
      style={{ backgroundColor: theme.colors.semantic.surface.primary }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 
            className="text-xl font-bold mb-1"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Analytics Dashboard
          </h2>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Interactive analytics widgets and insights
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-3 py-1 rounded border text-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="all">All Widgets</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Layout Toggle */}
          <div className="flex items-center bg-opacity-10 rounded-lg p-1">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded transition-colors ${layout === 'grid' ? 'bg-opacity-20' : 'hover:bg-opacity-10'}`}
              style={{ backgroundColor: theme.colors.semantic.action.primary + (layout === 'grid' ? '20' : '10') }}
              title="Grid Layout"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={theme.colors.semantic.action.primary}>
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded transition-colors ${layout === 'list' ? 'bg-opacity-20' : 'hover:bg-opacity-10'}`}
              style={{ backgroundColor: theme.colors.semantic.action.primary + (layout === 'list' ? '20' : '10') }}
              title="List Layout"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={theme.colors.semantic.action.primary}>
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>



      {/* Widget Grid */}
      <div 
        className={`grid gap-6 ${
          layout === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}
      >
        {filteredWidgets.map((widget) => {
          const WidgetComponent = widget.component;
          
          return (
            <div
              key={widget.id}
              className={`group cursor-pointer transition-all duration-300 hover:scale-105 ${getWidgetClasses(widget.size, layout)}`}
              onClick={() => setSelectedWidget(widget.id)}
            >
              <div
                className="h-full rounded-xl border-2 border-transparent hover:border-opacity-30 transition-all duration-300"
                style={{ 
                  borderColor: theme.colors.semantic.action.primary + '30',
                  backgroundColor: theme.colors.semantic.surface.secondary 
                }}
              >
                {/* Widget Header */}
                <div 
                  className="p-4 border-b"
                  style={{ borderColor: theme.colors.semantic.border.secondary }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{widget.icon}</span>
                      <div>
                        <h3 
                          className="font-semibold group-hover:text-opacity-80"
                          style={{ color: theme.colors.semantic.text.primary }}
                        >
                          {widget.title}
                        </h3>
                        <p 
                          className="text-xs"
                          style={{ color: theme.colors.semantic.text.secondary }}
                        >
                          {widget.description}
                        </p>
                      </div>
                    </div>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        widget.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : widget.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {widget.priority}
                    </span>
                  </div>
                </div>

                {/* Widget Preview Content */}
                <div className="p-4">
                  <WidgetComponent 
                    stats={stats} 
                    className="pointer-events-none opacity-75 transform scale-90 origin-top-left" 
                  />
                </div>

                {/* Expand Indicator */}
                <div 
                  className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ backgroundColor: theme.colors.semantic.action.primary + '20' }}
                >
                  <svg 
                    className="w-4 h-4" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={theme.colors.semantic.action.primary}
                    strokeWidth="2"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex items-center justify-between">
        <div 
          className="text-sm"
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          Showing {filteredWidgets.length} of {widgetConfigs.length} widgets
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-4 py-2 rounded-lg border hover:bg-opacity-10 transition-colors text-sm"
            style={{
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary,
              backgroundColor: theme.colors.semantic.action.primary + '10'
            }}
          >
            📊 Export Report
          </button>
          <button
            className="px-4 py-2 rounded-lg border hover:bg-opacity-10 transition-colors text-sm"
            style={{
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary,
              backgroundColor: theme.colors.semantic.action.secondary + '10'
            }}
          >
            ⚙️ Configure Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};