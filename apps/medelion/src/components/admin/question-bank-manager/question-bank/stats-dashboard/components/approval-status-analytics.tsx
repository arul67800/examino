/**
 * Approval Status Analytics Component
 * Shows detailed analytics for question approval workflow
 * Including approved, pending, and rejected questions
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/theme';

interface ApprovalStatusData {
  status: 'approved' | 'pending' | 'rejected';
  count: number;
  percentage: number;
  trend: number; // Percentage change from previous period
  avgProcessingTime?: number; // Hours
}

interface RecentActivity {
  id: string;
  questionId: string;
  questionTitle: string;
  action: 'approved' | 'rejected' | 'submitted_for_review';
  reviewer?: string;
  submitter: string;
  timestamp: string;
  processingTime?: number; // Hours
  reason?: string;
}

interface ApprovalStatusAnalyticsProps {
  stats?: {
    totalQuestions: number;
    activeQuestions: number;
    inactiveQuestions: number;
  };
  className?: string;
}

export const ApprovalStatusAnalytics: React.FC<ApprovalStatusAnalyticsProps> = ({
  stats,
  className = ''
}) => {
  const { theme } = useTheme();
  const [selectedView, setSelectedView] = useState<'overview' | 'breakdown' | 'activity'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock approval data - replace with actual API data
  const mockApprovalData: ApprovalStatusData[] = [
    { status: 'approved', count: 423, percentage: 68, trend: 5.2, avgProcessingTime: 2.3 },
    { status: 'pending', count: 127, percentage: 20, trend: -3.1, avgProcessingTime: 0 },
    { status: 'rejected', count: 75, percentage: 12, trend: -2.1, avgProcessingTime: 1.8 }
  ];

  const mockRecentActivity: RecentActivity[] = [
    {
      id: '1',
      questionId: 'Q-2025-001',
      questionTitle: 'Principles of Thermodynamics',
      action: 'approved',
      reviewer: 'Dr. Sarah Johnson',
      submitter: 'Prof. Michael Chen',
      timestamp: '2025-09-28T08:30:00Z',
      processingTime: 1.5
    },
    {
      id: '2',
      questionId: 'Q-2025-002',
      questionTitle: 'Organic Chemistry Reactions',
      action: 'rejected',
      reviewer: 'Dr. Emily Rodriguez',
      submitter: 'James Wilson',
      timestamp: '2025-09-28T07:15:00Z',
      processingTime: 3.2,
      reason: 'Insufficient explanation for answer choices'
    },
    {
      id: '3',
      questionId: 'Q-2025-003',
      questionTitle: 'Linear Algebra Applications',
      action: 'submitted_for_review',
      submitter: 'Dr. Lisa Park',
      timestamp: '2025-09-28T06:45:00Z'
    }
  ];

  const totalQuestions = useMemo(() => 
    mockApprovalData.reduce((sum, item) => sum + item.count, 0), 
    [mockApprovalData]
  );

  const avgApprovalRate = useMemo(() => {
    const approved = mockApprovalData.find(item => item.status === 'approved');
    return approved ? approved.percentage : 0;
  }, [mockApprovalData]);

  const avgProcessingTime = useMemo(() => {
    const withTime = mockApprovalData.filter(item => item.avgProcessingTime && item.avgProcessingTime > 0);
    const totalTime = withTime.reduce((sum, item) => sum + (item.avgProcessingTime || 0), 0);
    return withTime.length > 0 ? Math.round((totalTime / withTime.length) * 10) / 10 : 0;
  }, [mockApprovalData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return theme.colors.semantic.status.success;
      case 'pending': return theme.colors.semantic.status.warning;
      case 'rejected': return theme.colors.semantic.status.error;
      default: return theme.colors.semantic.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Key Metrics */}
      <div
        className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-lg border"
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.secondary
        }}
      >
        <div className="text-center">
          <div 
            className="text-3xl font-bold mb-1"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {totalQuestions}
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Total Questions
          </div>
        </div>

        <div className="text-center">
          <div 
            className="text-3xl font-bold mb-1"
            style={{ 
              color: avgApprovalRate >= 90 
                ? theme.colors.semantic.status.success 
                : theme.colors.semantic.status.error
            }}
          >
            {avgApprovalRate}%
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Approval Rate
          </div>
        </div>

        <div className="text-center">
          <div 
            className="text-3xl font-bold mb-1"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {avgProcessingTime}h
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Avg Processing Time
          </div>
        </div>

        <div className="text-center">
          <div 
            className="text-3xl font-bold mb-1"
            style={{ color: theme.colors.semantic.status.warning }}
          >
            {mockApprovalData.find(item => item.status === 'pending')?.count || 0}
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Pending Review
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      {mockApprovalData.map((item, index) => (
        <div
          key={item.status}
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getStatusIcon(item.status)}</span>
              <div>
                <h3 
                  className="font-semibold capitalize"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {item.status}
                </h3>
                <div 
                  className="text-xl font-bold"
                  style={{ color: getStatusColor(item.status) }}
                >
                  {item.count}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div 
                className="text-2xl font-bold"
                style={{ color: getStatusColor(item.status) }}
              >
                {item.percentage}%
              </div>
              <div 
                className={`text-sm flex items-center justify-end ${
                  item.trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <span className="mr-1">
                  {item.trend >= 0 ? '↗' : '↘'}
                </span>
                {Math.abs(item.trend)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div 
              className="h-2 rounded-full"
              style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
            >
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: getStatusColor(item.status),
                  width: `${item.percentage}%`
                }}
              />
            </div>
          </div>

          {item.avgProcessingTime !== undefined && item.avgProcessingTime > 0 && (
            <div 
              className="text-xs"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Avg processing: {item.avgProcessingTime}h
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderBreakdown = () => (
    <div className="space-y-6">
      {/* Detailed Breakdown */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.secondary
        }}
      >
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Approval Workflow Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockApprovalData.map((item) => (
            <div key={item.status} className="text-center p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
            >
              <div className="text-4xl mb-2">{getStatusIcon(item.status)}</div>
              <div 
                className="text-2xl font-bold mb-2"
                style={{ color: getStatusColor(item.status) }}
              >
                {item.count}
              </div>
              <div 
                className="text-lg font-medium mb-1 capitalize"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {item.status}
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span style={{ color: theme.colors.semantic.status.success }}>
                  {item.percentage}%
                </span>
                <span style={{ color: theme.colors.semantic.status.warning }}>
                  {item.trend >= 0 ? '+' : ''}{item.trend}%
                </span>
                <span style={{ color: theme.colors.semantic.status.error }}>
                  {item.avgProcessingTime || 0}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div
      className="rounded-lg border"
      style={{
        backgroundColor: theme.colors.semantic.surface.secondary,
        borderColor: theme.colors.semantic.border.secondary
      }}
    >
      <div 
        className="p-6 border-b"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <h3 
          className="text-lg font-semibold"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Recent Approval Activity
        </h3>
      </div>

      <div 
        className="divide-y" 
        style={{ 
          '--tw-divide-opacity': 1, 
          '--tw-divide-color': theme.colors.semantic.border.secondary 
        } as React.CSSProperties}
      >
        {mockRecentActivity.map((activity) => (
          <div key={activity.id} className="p-6 hover:bg-opacity-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: getStatusColor(activity.action) }}
                  >
                    {getStatusIcon(activity.action)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 
                      className="font-semibold"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {activity.questionTitle}
                    </h4>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getStatusColor(activity.action) + '20',
                        color: getStatusColor(activity.action)
                      }}
                    >
                      {activity.questionId}
                    </span>
                  </div>
                  
                  <div 
                    className="text-sm mb-2"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {activity.action === 'approved' && (
                      <>Approved by {activity.reviewer}</>
                    )}
                    {activity.action === 'rejected' && (
                      <>Rejected by {activity.reviewer}</>
                    )}
                    {activity.action === 'submitted_for_review' && (
                      <>Submitted by {activity.submitter}</>
                    )}
                  </div>

                  {activity.reason && (
                    <div 
                      className="text-sm px-3 py-2 rounded"
                      style={{ 
                        backgroundColor: theme.colors.semantic.surface.tertiary,
                        color: theme.colors.semantic.text.secondary 
                      }}
                    >
                      <strong>Reason:</strong> {activity.reason}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div 
                  className="text-sm mb-1"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {formatTimeAgo(activity.timestamp)}
                </div>
                {activity.processingTime && (
                  <div 
                    className="text-xs"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {activity.processingTime}h processing
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
            ✅ Approval Status Analytics
          </h2>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Track question approval workflow and review performance
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1 rounded border text-sm mr-4"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <div className="flex rounded-lg border" style={{ borderColor: theme.colors.semantic.border.secondary }}>
            {(['overview', 'breakdown', 'activity'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1 text-sm font-medium capitalize transition-colors ${
                  selectedView === view 
                    ? 'bg-opacity-20' 
                    : 'hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor: selectedView === view 
                    ? theme.colors.semantic.action.primary + '20'
                    : 'transparent',
                  color: selectedView === view 
                    ? theme.colors.semantic.action.primary
                    : theme.colors.semantic.text.secondary
                }}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedView === 'overview' && renderOverview()}
      {selectedView === 'breakdown' && renderBreakdown()}
      {selectedView === 'activity' && renderActivity()}
    </div>
  );
};