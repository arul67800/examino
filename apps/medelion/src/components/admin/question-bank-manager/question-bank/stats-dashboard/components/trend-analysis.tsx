// Trend Analysis Component
'use client';
import React from 'react';
import { useTheme } from '@/theme';

export interface TrendAnalysisProps {
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ timeRange, onTimeRangeChange }) => {
  const { theme } = useTheme();
  
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.colors.semantic.surface.secondary,
        border: `1px solid ${theme.colors.semantic.border.secondary}`,
        boxShadow: `0 6px 24px ${theme.colors.semantic.text.primary}08`
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.semantic.text.primary }}>
        Trend Analysis
      </h3>
      <div className="flex space-x-2 mb-4">
        {(['7d', '30d', '90d', '1y'] as const).map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range)}
            className={`px-3 py-1 rounded text-sm ${timeRange === range ? 'font-medium' : ''}`}
            style={{
              backgroundColor: timeRange === range ? theme.colors.semantic.action.primary + '20' : 'transparent',
              color: timeRange === range ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
            }}
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="h-32 flex items-center justify-center" style={{ color: theme.colors.semantic.text.secondary }}>
        Trend chart for {timeRange}
      </div>
    </div>
  );
};