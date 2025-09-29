/**
 * Clean Professional Statistics Panel Component
 * Modern analytics with theme integration and smooth animations
 */

'use client';

import React from 'react';
import { QuestionBankStats } from '../types';
import { useTheme } from '@/theme';

export interface StatisticsPanelProps {
  stats: QuestionBankStats;
  className?: string;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  stats,
  className = ''
}) => {
  const { theme } = useTheme();

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    subtitle?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
    icon?: React.ReactNode;
  }> = ({ title, value, subtitle, color = 'blue', icon }) => {
    const getColorScheme = (color: string) => {
      switch (color) {
        case 'green':
          return {
            bg: theme.colors.semantic.status.success + '10',
            text: theme.colors.semantic.status.success,
            icon: theme.colors.semantic.status.success + '80'
          };
        case 'purple':
          return {
            bg: theme.colors.semantic.action.secondary + '10',
            text: theme.colors.semantic.action.secondary,
            icon: theme.colors.semantic.action.secondary + '80'
          };
        case 'orange':
          return {
            bg: theme.colors.semantic.status.warning + '10',
            text: theme.colors.semantic.status.warning,
            icon: theme.colors.semantic.status.warning + '80'
          };
        default:
          return {
            bg: theme.colors.semantic.action.primary + '10',
            text: theme.colors.semantic.action.primary,
            icon: theme.colors.semantic.action.primary + '80'
          };
      }
    };

    const colorScheme = getColorScheme(color);

    return (
      <div 
        className="rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md transform"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          border: `1px solid ${theme.colors.semantic.border.secondary}`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1" style={{ color: theme.colors.semantic.text.secondary }}>
              {title}
            </p>
            <p className="text-2xl font-bold mb-1" style={{ color: colorScheme.text }}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center ml-3"
              style={{ backgroundColor: colorScheme.bg }}
            >
              <div style={{ color: colorScheme.icon }}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProgressBar: React.FC<{
    label: string;
    value: number;
    total: number;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'pink';
  }> = ({ label, value, total, color = 'blue' }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    const getProgressColor = (color: string) => {
      switch (color) {
        case 'green': return theme.colors.semantic.status.success;
        case 'yellow': return theme.colors.semantic.status.warning;
        case 'red': return theme.colors.semantic.status.error;
        case 'purple': return theme.colors.semantic.action.secondary;
        case 'indigo': return theme.colors.semantic.action.tertiary;
        case 'pink': return theme.colors.semantic.status.info;
        default: return theme.colors.semantic.action.primary;
      }
    };

    const progressColor = getProgressColor(color);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span style={{ color: theme.colors.semantic.text.primary }}>{label}</span>
          <span style={{ color: theme.colors.semantic.text.secondary }}>{value}</span>
        </div>
        <div 
          className="w-full rounded-full h-2"
          style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
        >
          <div 
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: progressColor
            }}
          />
        </div>
      </div>
    );
  };

  const ActivityDot: React.FC<{ type: string }> = ({ type }) => {
    const getActivityColor = (type: string) => {
      switch (type) {
        case 'created': return theme.colors.semantic.status.success;
        case 'updated': return theme.colors.semantic.action.primary;
        case 'deleted': return theme.colors.semantic.status.error;
        default: return theme.colors.semantic.text.secondary;
      }
    };

    return (
      <div 
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: getActivityColor(type) }}
      />
    );
  };

  const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const StarIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
          Question Bank Statistics
        </h3>
        <div className="flex items-center space-x-2">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: theme.colors.semantic.status.success }}
          />
          <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
            Live Data
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions.toLocaleString()}
          subtitle="All questions"
          color="blue"
          icon={<ChartIcon />}
        />
        <StatCard
          title="Active Questions"
          value={stats.activeQuestions.toLocaleString()}
          subtitle={`${((stats.activeQuestions / stats.totalQuestions) * 100).toFixed(1)}% of total`}
          color="green"
          icon={<CheckIcon />}
        />
        <StatCard
          title="Avg Points"
          value={stats.averagePoints.toFixed(1)}
          subtitle="Per question"
          color="purple"
          icon={<StarIcon />}
        />
        <StatCard
          title="Avg Time"
          value={`${Math.round(stats.averageTimeLimit)}s`}
          subtitle="Per question"
          color="orange"
          icon={<ClockIcon />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <div 
          className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`,
            boxShadow: `0 6px 24px ${theme.colors.semantic.text.primary}08, 0 3px 12px ${theme.colors.semantic.text.primary}10`
          }}
        >
          <h4 className="text-lg font-medium mb-4" style={{ color: theme.colors.semantic.text.primary }}>
            By Difficulty
          </h4>
          <div className="space-y-4">
            <ProgressBar
              label="Easy"
              value={stats.byDifficulty.EASY}
              total={stats.totalQuestions}
              color="green"
            />
            <ProgressBar
              label="Medium"
              value={stats.byDifficulty.MEDIUM}
              total={stats.totalQuestions}
              color="yellow"
            />
            <ProgressBar
              label="Hard"
              value={stats.byDifficulty.HARD}
              total={stats.totalQuestions}
              color="red"
            />
          </div>
        </div>

        {/* Question Type Distribution */}
        <div 
          className="rounded-xl p-6 transition-all duration-300 hover:shadow-xl"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`,
            boxShadow: `0 6px 24px ${theme.colors.semantic.text.primary}08, 0 3px 12px ${theme.colors.semantic.text.primary}10`
          }}
        >
          <h4 className="text-lg font-medium mb-4" style={{ color: theme.colors.semantic.text.primary }}>
            By Type
          </h4>
          <div className="space-y-4">
            <ProgressBar
              label="Single Choice"
              value={stats.byType.SINGLE_CHOICE}
              total={stats.totalQuestions}
              color="blue"
            />
            <ProgressBar
              label="Multiple Choice"
              value={stats.byType.MULTIPLE_CHOICE}
              total={stats.totalQuestions}
              color="purple"
            />
            <ProgressBar
              label="True/False"
              value={stats.byType.TRUE_FALSE}
              total={stats.totalQuestions}
              color="indigo"
            />
            <ProgressBar
              label="Assertion & Reasoning"
              value={stats.byType.ASSERTION_REASONING}
              total={stats.totalQuestions}
              color="pink"
            />
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      {stats.popularTags.length > 0 && (
        <div 
          className="rounded-lg p-6 transition-all duration-300 hover:shadow-md"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          <h4 className="text-lg font-medium mb-4" style={{ color: theme.colors.semantic.text.primary }}>
            Popular Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.popularTags.slice(0, 15).map(({ tag, count }, index) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm transition-all duration-200 hover:scale-105 transform"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary + '10',
                  color: theme.colors.semantic.action.primary,
                  border: `1px solid ${theme.colors.semantic.action.primary}20`,
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                {tag}
                <span className="ml-1 opacity-70">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div 
          className="rounded-lg p-6 transition-all duration-300 hover:shadow-md"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          <h4 className="text-lg font-medium mb-4" style={{ color: theme.colors.semantic.text.primary }}>
            Recent Activity
          </h4>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] transform"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInLeft 0.5s ease-out forwards'
                }}
              >
                <ActivityDot type={activity.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: theme.colors.semantic.text.primary }}>
                    Question {activity.type} by {activity.userId}
                  </p>
                  <p className="text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};