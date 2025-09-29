/**
 * Type Distribution Component
 * Displays question type distribution with pie chart visualization
 */

'use client';

import React from 'react';
import { useTheme } from '@/theme';

export interface TypeDistributionProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}

export const TypeDistribution: React.FC<TypeDistributionProps> = ({ data }) => {
  const { theme } = useTheme();

  const getTypeColor = (index: number) => {
    const colors = [
      theme.colors.semantic.action.primary,
      theme.colors.semantic.status.success,
      theme.colors.semantic.status.warning,
      theme.colors.semantic.status.error
    ];
    return colors[index % colors.length];
  };

  const getTypeIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'single choice':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'multiple choice':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'true/false':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: theme.colors.semantic.surface.secondary,
        border: `1px solid ${theme.colors.semantic.border.secondary}`,
        boxShadow: `0 6px 24px ${theme.colors.semantic.text.primary}08`
      }}
    >
      {/* Header */}
      <h3 
        className="text-lg font-semibold mb-4"
        style={{ color: theme.colors.semantic.text.primary }}
      >
        Question Types
      </h3>

      {/* Donut Chart Simulation */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <div className="w-full h-full rounded-full border-8 border-gray-200 relative overflow-hidden">
          {/* This would be replaced with actual chart library */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {data.reduce((sum, item) => sum + item.value, 0)}
              </div>
              <div 
                className="text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Total Questions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTypeColor(index) }}
              />
              <div className="flex items-center space-x-2">
                <div style={{ color: getTypeColor(index) }}>
                  {getTypeIcon(item.name)}
                </div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {item.name}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div 
                className="text-sm font-semibold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {item.value}
              </div>
              <div 
                className="text-xs"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};