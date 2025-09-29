/**
 * Main Stats Dashboard Component
 * Combines all analytics views with navigation and layout management
 * Provides comprehensive analytics interface for the question bank system
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/theme';
import { QuestionBankStats } from '../../types';

// Import all analytics components
import { MetricsOverview } from './metrics-overview';
import { DifficultyAnalytics } from './difficulty-analytics';
import { TypeDistribution } from './type-distribution';
import { HierarchyDistribution } from './hierarchy-distribution';
import { ApprovalStatusAnalytics } from './approval-status-analytics';
import { TimeBasedAnalytics } from './time-based-analytics';
import { StaffContributionAnalytics } from './staff-contribution-analytics';
import { ComprehensiveOverview } from './comprehensive-overview';

interface StatsDashboardProps {
  stats?: QuestionBankStats;
  className?: string;
  onClose?: () => void;
}

type AnalyticsView = 
  | 'overview' 
  | 'metrics' 
  | 'difficulty' 
  | 'types' 
  | 'hierarchy' 
  | 'approval' 
  | 'timeline' 
  | 'staff';

interface AnalyticsNavItem {
  id: AnalyticsView;
  label: string;
  icon: string;
  description: string;
}

const navigationItems: AnalyticsNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '📊',
    description: 'Comprehensive dashboard with all analytics'
  },
  {
    id: 'metrics',
    label: 'Key Metrics',
    icon: '📈',
    description: 'Overall system statistics and KPIs'
  },
  {
    id: 'difficulty',
    label: 'Difficulty Analysis',
    icon: '🎯',
    description: 'Question difficulty distribution and insights'
  },
  {
    id: 'types',
    label: 'Question Types',
    icon: '🔢',
    description: 'Distribution across question types'
  },
  {
    id: 'hierarchy',
    label: 'Hierarchy Distribution',
    icon: '🏗️',
    description: 'Questions across hierarchy levels'
  },
  {
    id: 'approval',
    label: 'Approval Workflow',
    icon: '✅',
    description: 'Question approval status analytics'
  },
  {
    id: 'timeline',
    label: 'Time-Based Trends',
    icon: '📅',
    description: 'Creation and approval trends over time'
  },
  {
    id: 'staff',
    label: 'Staff Contributions',
    icon: '👥',
    description: 'Individual and team performance metrics'
  }
];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  className = '',
  onClose
}) => {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<AnalyticsView>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get active navigation item
  const activeNavItem = useMemo(() => {
    return navigationItems.find(item => item.id === activeView);
  }, [activeView]);

  // Render the active view component
  const renderActiveView = () => {
    const commonProps = { stats, className: 'flex-1' };
    
    switch (activeView) {
      case 'overview':
        return <ComprehensiveOverview {...commonProps} />;
      case 'metrics':
        const mockMetricsStats = {
          totalQuestions: stats?.totalQuestions || 707,
          approvedQuestions: 423,
          pendingQuestions: 127,
          rejectedQuestions: 75,
          lastUpdated: new Date().toISOString()
        };
        return <MetricsOverview stats={mockMetricsStats} />;
      case 'difficulty':
        const mockDifficultyData = [
          { name: 'Easy', value: 245, percentage: 35 },
          { name: 'Medium', value: 320, percentage: 45 },
          { name: 'Hard', value: 142, percentage: 20 }
        ];
        return <DifficultyAnalytics data={mockDifficultyData} />;
      case 'types':
        const mockTypeData = [
          { name: 'Single Choice', value: 350, percentage: 49 },
          { name: 'Multiple Choice', value: 180, percentage: 25 },
          { name: 'True/False', value: 120, percentage: 17 },
          { name: 'Assertion Reasoning', value: 57, percentage: 9 }
        ];
        return <TypeDistribution data={mockTypeData} />;
      case 'hierarchy':
        return stats ? <HierarchyDistribution stats={stats} className={commonProps.className} /> : null;
      case 'approval':
        return <ApprovalStatusAnalytics {...commonProps} />;
      case 'timeline':
        return <TimeBasedAnalytics {...commonProps} />;
      case 'staff':
        return <StaffContributionAnalytics {...commonProps} />;
      default:
        return <ComprehensiveOverview {...commonProps} />;
    }
  };

  return (
    <div 
      className={`flex h-full ${className}`}
      style={{ backgroundColor: theme.colors.semantic.surface.primary }}
    >
      {/* Sidebar Navigation */}
      <div 
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } border-r flex flex-col`}
        style={{ 
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.secondary
        }}
      >
        {/* Sidebar Header */}
        <div 
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.colors.semantic.border.secondary }}
        >
          {!isSidebarCollapsed && (
            <div>
              <h2 
                className="text-lg font-bold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Analytics Dashboard
              </h2>
              <p 
                className="text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Comprehensive insights
              </p>
            </div>
          )}
          
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ backgroundColor: theme.colors.semantic.action.primary + '10' }}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={theme.colors.semantic.action.primary}
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full p-3 rounded-lg mb-1 transition-all duration-200 flex items-center ${
                activeView === item.id 
                  ? 'bg-opacity-20' 
                  : 'hover:bg-opacity-10'
              }`}
              style={{
                backgroundColor: activeView === item.id 
                  ? theme.colors.semantic.action.primary + '20'
                  : 'transparent'
              }}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <span className="text-lg mr-3 flex-shrink-0">{item.icon}</span>
              {!isSidebarCollapsed && (
                <div className="text-left flex-1">
                  <div 
                    className="font-medium"
                    style={{ 
                      color: activeView === item.id 
                        ? theme.colors.semantic.action.primary
                        : theme.colors.semantic.text.primary 
                    }}
                  >
                    {item.label}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {item.description}
                  </div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Close Button */}
        {onClose && (
          <div className="p-4 border-t" style={{ borderColor: theme.colors.semantic.border.secondary }}>
            <button
              onClick={onClose}
              className="w-full p-3 rounded-lg border transition-colors text-sm font-medium hover:bg-opacity-10"
              style={{
                borderColor: theme.colors.semantic.border.secondary,
                color: theme.colors.semantic.text.primary,
                backgroundColor: theme.colors.semantic.action.secondary + '10'
              }}
            >
              {!isSidebarCollapsed && (
                <>
                  <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Back to Question Bank
                </>
              )}
              {isSidebarCollapsed && (
                <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div 
          className="p-6 border-b"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{activeNavItem?.icon}</span>
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {activeNavItem?.label}
                </h1>
                <p 
                  className="text-sm"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {activeNavItem?.description}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <button
                className="px-4 py-2 rounded-lg border hover:bg-opacity-10 transition-colors text-sm"
                style={{
                  borderColor: theme.colors.semantic.border.secondary,
                  color: theme.colors.semantic.text.primary,
                  backgroundColor: theme.colors.semantic.action.primary + '10'
                }}
              >
                📊 Export Data
              </button>
              <button
                className="px-4 py-2 rounded-lg border hover:bg-opacity-10 transition-colors text-sm"
                style={{
                  borderColor: theme.colors.semantic.border.secondary,
                  color: theme.colors.semantic.text.primary,
                  backgroundColor: theme.colors.semantic.action.secondary + '10'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};