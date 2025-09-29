/**
 * Statistics Panel Component
 * Displays comprehensive analytics and statistics
 */

'use client';

import React from 'react';
import { QuestionBankStats } from '../types';

export interface StatisticsPanelProps {
  stats: QuestionBankStats;
  className?: string;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  stats,
  className = ''
}) => {
  const StatCard: React.FC<{
    title: string;
    value: number | string;
    subtitle?: string;
    color?: string;
    icon?: string;
  }> = ({ title, value, subtitle, color = 'blue', icon = '📊' }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );

  const ProgressBar: React.FC<{
    label: string;
    value: number;
    total: number;
    color?: string;
  }> = ({ label, value, total, color = 'blue' }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">{label}</span>
          <span className="text-gray-500">{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Question Bank Statistics</h3>
        <span className="text-sm text-gray-500">Live Data</span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions.toLocaleString()}
          subtitle="All questions"
          color="blue"
          icon="📚"
        />
        <StatCard
          title="Active Questions"
          value={stats.activeQuestions.toLocaleString()}
          subtitle={`${((stats.activeQuestions / stats.totalQuestions) * 100).toFixed(1)}% of total`}
          color="green"
          icon="✅"
        />
        <StatCard
          title="Avg Points"
          value={stats.averagePoints.toFixed(1)}
          subtitle="Per question"
          color="purple"
          icon="⭐"
        />
        <StatCard
          title="Avg Time"
          value={`${Math.round(stats.averageTimeLimit)}s`}
          subtitle="Per question"
          color="orange"
          icon="⏱️"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">By Difficulty</h4>
          <div className="space-y-3">
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">By Type</h4>
          <div className="space-y-3">
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Popular Tags</h4>
          <div className="flex flex-wrap gap-2">
            {stats.popularTags.slice(0, 15).map(({ tag, count }) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
              >
                {tag}
                <span className="ml-1 text-blue-500">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'created' ? 'bg-green-500' :
                  activity.type === 'updated' ? 'bg-blue-500' :
                  activity.type === 'deleted' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    Question {activity.type} by {activity.userId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};