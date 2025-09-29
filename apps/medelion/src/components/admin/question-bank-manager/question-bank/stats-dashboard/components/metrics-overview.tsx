/**
 * Metrics Overview Component
 * Displays key performance indicators and summary metrics
 */

'use client';

import React from 'react';
import { useTheme } from '@/theme';

export interface MetricsOverviewProps {
  stats: {
    totalQuestions: number;
    approvedQuestions: number;
    pendingQuestions: number;
    rejectedQuestions: number;
    lastUpdated: string;
  };
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ stats }) => {
  const { theme } = useTheme();

  const metrics = [
    {
      id: 'total',
      label: 'Total Questions',
      value: stats.totalQuestions.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: theme.colors.semantic.action.primary
    },
    {
      id: 'approved',
      label: 'Approved',
      value: stats.approvedQuestions.toLocaleString(),
      change: '+5%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: theme.colors.semantic.status.success
    },
    {
      id: 'pending',
      label: 'Pending',
      value: stats.pendingQuestions.toLocaleString(),
      change: '-3%',
      trend: 'down',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: theme.colors.semantic.status.warning
    },
    {
      id: 'rejected',
      label: 'Rejected',
      value: stats.rejectedQuestions.toLocaleString(),
      change: '-2%',
      trend: 'down',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: theme.colors.semantic.status.error
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 group cursor-pointer"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`,
            boxShadow: `0 4px 16px ${theme.colors.semantic.text.primary}08`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div
              className="p-3 rounded-lg group-hover:scale-110 transition-transform duration-200"
              style={{
                backgroundColor: metric.color + '15',
                color: metric.color
              }}
            >
              {metric.icon}
            </div>
            <div className="flex items-center space-x-1">
              <span
                className="text-sm font-medium"
                style={{
                  color: metric.trend === 'up' 
                    ? theme.colors.semantic.status.success 
                    : theme.colors.semantic.status.error
                }}
              >
                {metric.change}
              </span>
              <svg 
                className={`w-4 h-4 ${metric.trend === 'up' ? '' : 'rotate-180'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  color: metric.trend === 'up' 
                    ? theme.colors.semantic.status.success 
                    : theme.colors.semantic.status.error
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 
              className="text-2xl font-bold mb-1"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {metric.value}
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              {metric.label}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div 
              className="h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: theme.colors.semantic.surface.primary }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500 group-hover:animate-pulse"
                style={{
                  backgroundColor: metric.color,
                  width: metric.id === 'approved' ? `${Math.round((stats.approvedQuestions / stats.totalQuestions) * 100)}%` :
                        metric.id === 'pending' ? `${Math.round((stats.pendingQuestions / stats.totalQuestions) * 100)}%` :
                        metric.id === 'rejected' ? `${Math.round((stats.rejectedQuestions / stats.totalQuestions) * 100)}%` :
                        '100%'
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};