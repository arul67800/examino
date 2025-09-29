/**
 * Time-Based Analytics Component
 * Shows question creation trends by day, month, and year
 * with interactive charts and temporal insights
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/theme';
import { QuestionBankStats } from '../../types';

interface TimeBasedData {
  period: string;
  questionsCreated: number;
  questionsApproved: number;
  questionsRejected: number;
  date: string;
}

interface TimeBasedAnalyticsProps {
  stats?: QuestionBankStats;
  className?: string;
}

// Mock time-based data - replace with actual API data
const mockDailyData: TimeBasedData[] = [
  { period: '2025-09-22', questionsCreated: 45, questionsApproved: 38, questionsRejected: 7, date: '2025-09-22' },
  { period: '2025-09-23', questionsCreated: 52, questionsApproved: 41, questionsRejected: 11, date: '2025-09-23' },
  { period: '2025-09-24', questionsCreated: 38, questionsApproved: 35, questionsRejected: 3, date: '2025-09-24' },
  { period: '2025-09-25', questionsCreated: 61, questionsApproved: 48, questionsRejected: 13, date: '2025-09-25' },
  { period: '2025-09-26', questionsCreated: 43, questionsApproved: 39, questionsRejected: 4, date: '2025-09-26' },
  { period: '2025-09-27', questionsCreated: 56, questionsApproved: 44, questionsRejected: 12, date: '2025-09-27' },
  { period: '2025-09-28', questionsCreated: 49, questionsApproved: 42, questionsRejected: 7, date: '2025-09-28' }
];

const mockMonthlyData: TimeBasedData[] = [
  { period: '2025-03', questionsCreated: 892, questionsApproved: 745, questionsRejected: 147, date: '2025-03-01' },
  { period: '2025-04', questionsCreated: 1024, questionsApproved: 856, questionsRejected: 168, date: '2025-04-01' },
  { period: '2025-05', questionsCreated: 967, questionsApproved: 823, questionsRejected: 144, date: '2025-05-01' },
  { period: '2025-06', questionsCreated: 1156, questionsApproved: 981, questionsRejected: 175, date: '2025-06-01' },
  { period: '2025-07', questionsCreated: 1089, questionsApproved: 934, questionsRejected: 155, date: '2025-07-01' },
  { period: '2025-08', questionsCreated: 1234, questionsApproved: 1047, questionsRejected: 187, date: '2025-08-01' },
  { period: '2025-09', questionsCreated: 1178, questionsApproved: 998, questionsRejected: 180, date: '2025-09-01' }
];

const mockYearlyData: TimeBasedData[] = [
  { period: '2021', questionsCreated: 8540, questionsApproved: 7234, questionsRejected: 1306, date: '2021-01-01' },
  { period: '2022', questionsCreated: 9876, questionsApproved: 8452, questionsRejected: 1424, date: '2022-01-01' },
  { period: '2023', questionsCreated: 11234, questionsApproved: 9789, questionsRejected: 1445, date: '2023-01-01' },
  { period: '2024', questionsCreated: 12890, questionsApproved: 11234, questionsRejected: 1656, date: '2024-01-01' },
  { period: '2025', questionsCreated: 8934, questionsApproved: 7821, questionsRejected: 1113, date: '2025-01-01' }
];

export const TimeBasedAnalytics: React.FC<TimeBasedAnalyticsProps> = ({
  stats,
  className = ''
}) => {
  const { theme } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedMetric, setSelectedMetric] = useState<'created' | 'approved' | 'rejected'>('created');

  // Get data based on selected timeframe
  const currentData = useMemo(() => {
    switch (selectedTimeframe) {
      case 'daily': return mockDailyData;
      case 'monthly': return mockMonthlyData;
      case 'yearly': return mockYearlyData;
      default: return mockDailyData;
    }
  }, [selectedTimeframe]);

  // Calculate totals and trends
  const analytics = useMemo(() => {
    const totalCreated = currentData.reduce((sum, item) => sum + item.questionsCreated, 0);
    const totalApproved = currentData.reduce((sum, item) => sum + item.questionsApproved, 0);
    const totalRejected = currentData.reduce((sum, item) => sum + item.questionsRejected, 0);
    
    const avgDaily = totalCreated / currentData.length;
    const approvalRate = totalCreated > 0 ? (totalApproved / totalCreated) * 100 : 0;
    const rejectionRate = totalCreated > 0 ? (totalRejected / totalCreated) * 100 : 0;
    
    // Calculate trend (comparing last two periods)
    const lastPeriod = currentData[currentData.length - 1];
    const previousPeriod = currentData[currentData.length - 2];
    const trend = previousPeriod ? 
      ((lastPeriod.questionsCreated - previousPeriod.questionsCreated) / previousPeriod.questionsCreated) * 100 : 0;

    return {
      totalCreated,
      totalApproved,
      totalRejected,
      avgDaily: Math.round(avgDaily),
      approvalRate: Math.round(approvalRate),
      rejectionRate: Math.round(rejectionRate),
      trend: Math.round(trend * 10) / 10
    };
  }, [currentData]);

  // Get chart data based on selected metric
  const chartData = useMemo(() => {
    return currentData.map(item => ({
      period: item.period,
      value: item[selectedMetric === 'created' ? 'questionsCreated' : 
                   selectedMetric === 'approved' ? 'questionsApproved' : 'questionsRejected']
    }));
  }, [currentData, selectedMetric]);

  const maxValue = Math.max(...chartData.map(d => d.value));

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'created': return theme.colors.semantic.action.primary;
      case 'approved': return '#10B981'; // Green
      case 'rejected': return '#EF4444'; // Red
      default: return theme.colors.semantic.action.primary;
    }
  };

  const formatPeriodLabel = (period: string) => {
    switch (selectedTimeframe) {
      case 'daily': 
        return new Date(period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'monthly':
        return new Date(period + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'yearly':
        return period;
      default:
        return period;
    }
  };

  return (
    <div 
      className={`rounded-xl p-6 ${className}`}
      style={{ backgroundColor: theme.colors.semantic.surface.primary }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 
            className="text-lg font-semibold mb-1"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Time-Based Analytics
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Question creation trends and temporal insights
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1">
            {(['daily', 'monthly', 'yearly'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedTimeframe === timeframe ? 'shadow-md' : 'hover:shadow-sm'
                }`}
                style={{
                  backgroundColor: selectedTimeframe === timeframe 
                    ? theme.colors.semantic.action.primary + '15' 
                    : theme.colors.semantic.surface.secondary,
                  color: selectedTimeframe === timeframe 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.secondary,
                  border: `1px solid ${selectedTimeframe === timeframe 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.border.secondary}`
                }}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>

          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as 'created' | 'approved' | 'rejected')}
            className="px-3 py-1 rounded border text-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="created">Questions Created</option>
            <option value="approved">Questions Approved</option>
            <option value="rejected">Questions Rejected</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: `4px solid ${theme.colors.semantic.action.primary}`
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span 
              className="text-sm font-medium"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Total Created
            </span>
            <div className={`text-xs px-2 py-1 rounded ${analytics.trend >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {analytics.trend >= 0 ? '+' : ''}{analytics.trend}%
            </div>
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {analytics.totalCreated.toLocaleString()}
          </div>
          <div 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            ~{analytics.avgDaily} per {selectedTimeframe.slice(0, -2)}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: '4px solid #10B981'
          }}
        >
          <span 
            className="text-sm font-medium block mb-2"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Approval Rate
          </span>
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {analytics.approvalRate}%
          </div>
          <div 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            {analytics.totalApproved.toLocaleString()} approved
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: '4px solid #EF4444'
          }}
        >
          <span 
            className="text-sm font-medium block mb-2"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Rejection Rate
          </span>
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {analytics.rejectionRate}%
          </div>
          <div 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            {analytics.totalRejected.toLocaleString()} rejected
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            borderLeft: `4px solid ${theme.colors.semantic.action.secondary}`
          }}
        >
          <span 
            className="text-sm font-medium block mb-2"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Peak {selectedTimeframe.slice(0, -2)}
          </span>
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {Math.max(...chartData.map(d => d.value)).toLocaleString()}
          </div>
          <div 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Highest count
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.secondary
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 
            className="text-md font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {selectedMetric === 'created' ? 'Questions Created' : 
             selectedMetric === 'approved' ? 'Questions Approved' : 'Questions Rejected'} Trend
          </h4>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getMetricColor(selectedMetric) }}
            ></div>
            <span 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="relative">
          <div className="flex items-end justify-between h-48 space-x-1">
            {chartData.map((item, index) => {
              const height = (item.value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full rounded-t transition-all duration-300 hover:opacity-80 relative group"
                    style={{
                      backgroundColor: getMetricColor(selectedMetric),
                      height: `${height}%`,
                      minHeight: '4px'
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                         style={{ backgroundColor: theme.colors.semantic.surface.tertiary, color: theme.colors.semantic.text.primary }}>
                      {item.value.toLocaleString()}
                    </div>
                  </div>
                  <div 
                    className="text-xs mt-2 text-center transform -rotate-45 origin-top-left"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {formatPeriodLabel(item.period)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary
          }}
        >
          <h5 
            className="font-semibold mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            📈 Trends & Insights
          </h5>
          <ul 
            className="text-sm space-y-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <li>• {analytics.trend >= 0 ? 'Increasing' : 'Decreasing'} trend of {Math.abs(analytics.trend)}% from previous period</li>
            <li>• Average of {analytics.avgDaily} questions created per {selectedTimeframe.slice(0, -2)}</li>
            <li>• {analytics.approvalRate}% approval rate shows quality consistency</li>
          </ul>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary
          }}
        >
          <h5 
            className="font-semibold mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            🎯 Recommendations
          </h5>
          <ul 
            className="text-sm space-y-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <li>• {analytics.rejectionRate > 15 ? 'Review question creation guidelines' : 'Maintain current quality standards'}</li>
            <li>• {analytics.trend < 0 ? 'Consider increasing creation incentives' : 'Scale current successful practices'}</li>
            <li>• Monitor {selectedTimeframe} patterns for resource planning</li>
          </ul>
        </div>
      </div>
    </div>
  );
};