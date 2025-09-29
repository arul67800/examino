/**
 * Performance Metrics Component
 */

'use client';

import React from 'react';
import { useTheme } from '@/theme';

export interface PerformanceMetricsProps {
  stats: {
    totalQuestions: number;
    completionRate: number;
    qualityScore: number;
  };
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ stats }) => {
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
        Performance Metrics
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span style={{ color: theme.colors.semantic.text.secondary }}>Completion Rate</span>
            <span style={{ color: theme.colors.semantic.text.primary }}>{stats.completionRate}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: theme.colors.semantic.surface.primary }}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: theme.colors.semantic.status.success,
                width: `${stats.completionRate}%`
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span style={{ color: theme.colors.semantic.text.secondary }}>Quality Score</span>
            <span style={{ color: theme.colors.semantic.text.primary }}>{stats.qualityScore}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: theme.colors.semantic.surface.primary }}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: theme.colors.semantic.status.warning,
                width: `${stats.qualityScore}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};