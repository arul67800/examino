/**
 * Difficulty Analytics Component
 * Advanced analytics for question difficulty distribution with interactive charts
 */

'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';

export interface DifficultyAnalyticsProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  onMetricSelect?: (metric: string | null) => void;
}

export const DifficultyAnalytics: React.FC<DifficultyAnalyticsProps> = ({ 
  data, 
  onMetricSelect 
}) => {
  const { theme } = useTheme();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const getDifficultyColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'easy':
        return theme.colors.semantic.status.success;
      case 'medium':
        return theme.colors.semantic.status.warning;
      case 'hard':
        return theme.colors.semantic.status.error;
      default:
        return theme.colors.semantic.text.secondary;
    }
  };

  const getDifficultyIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'easy':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'hard':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const maxValue = Math.max(...data.map(d => d.value));

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 
            className="text-lg font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Question Difficulty Distribution
          </h3>
          <p 
            className="text-sm mt-1"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Analysis of question complexity and balance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              color: theme.colors.semantic.text.secondary
            }}
            title="Export Chart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Interactive Bar Chart */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div
            key={item.name}
            className={`group cursor-pointer transition-all duration-300 ${
              selectedDifficulty === item.name ? 'scale-105' : ''
            }`}
            onClick={() => {
              const newSelection = selectedDifficulty === item.name ? null : item.name;
              setSelectedDifficulty(newSelection);
              onMetricSelect?.(newSelection);
            }}
          >
            {/* Difficulty Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: getDifficultyColor(item.name) + '15',
                    color: getDifficultyColor(item.name)
                  }}
                >
                  {getDifficultyIcon(item.name)}
                </div>
                <div>
                  <h4 
                    className="font-medium"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    {item.name}
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {item.value} questions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div 
                  className="text-lg font-semibold"
                  style={{ color: getDifficultyColor(item.name) }}
                >
                  {item.percentage.toFixed(1)}%
                </div>
                <div 
                  className="text-sm"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  of total
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div 
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: theme.colors.semantic.surface.primary }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-500 group-hover:animate-pulse relative overflow-hidden"
                  style={{
                    backgroundColor: getDifficultyColor(item.name),
                    width: `${(item.value / maxValue) * 100}%`
                  }}
                >
                  {/* Animated shine effect */}
                  <div 
                    className="absolute inset-0 opacity-30 animate-pulse"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${getDifficultyColor(item.name)}40, transparent)`
                    }}
                  />
                </div>
              </div>
              
              {/* Hover Details */}
              <div 
                className={`absolute top-4 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow-lg transition-opacity duration-200 ${
                  selectedDifficulty === item.name ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {item.value} questions ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: theme.colors.semantic.border.secondary }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.status.success }}
            >
              {data.find(d => d.name === 'Easy')?.value || 0}
            </div>
            <div 
              className="text-xs"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Easy Questions
            </div>
          </div>
          <div>
            <div 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.status.warning }}
            >
              {data.find(d => d.name === 'Medium')?.value || 0}
            </div>
            <div 
              className="text-xs"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Medium Questions
            </div>
          </div>
          <div>
            <div 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.status.error }}
            >
              {data.find(d => d.name === 'Hard')?.value || 0}
            </div>
            <div 
              className="text-xs"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Hard Questions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};