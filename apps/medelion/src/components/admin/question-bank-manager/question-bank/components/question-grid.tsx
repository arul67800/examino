/**
 * Clean Professional Question Grid Component
 * Modern grid layout with theme integration and smooth animations
 */

'use client';

import React from 'react';
import { Question, ViewMode } from '../types';
import { QuestionCard } from './question-card';
import { useTheme } from '@/theme';

export interface QuestionGridProps {
  questions: Question[];
  isLoading?: boolean;
  selection?: {
    selectedIds: Set<string>;
    toggleSelection: (id: string) => void;
  };
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  onPreview?: (questionId: string) => void;
  viewSettings?: any;
  cardSize?: 'small' | 'medium' | 'large';
  className?: string;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  questions,
  isLoading = false,
  selection,
  onEdit,
  onDelete,
  onPreview,
  viewSettings,
  cardSize = 'medium',
  className = ''
}) => {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className={`grid gap-6 ${getGridClass(cardSize)} ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl p-6 animate-pulse"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              border: `1px solid ${theme.colors.semantic.border.secondary}`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                <div className="w-8 h-4 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
              </div>
              <div className="flex space-x-1">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 rounded w-3/4" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
              <div className="h-4 rounded w-1/2" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 rounded w-full" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
              <div className="h-3 rounded w-2/3" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
            </div>
            <div className="mt-4 flex justify-between">
              <div className="h-3 rounded w-16" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
              <div className="h-3 rounded w-12" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4" style={{ color: theme.colors.semantic.text.disabled }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>No questions found</h3>
        <p className="mb-4" style={{ color: theme.colors.semantic.text.secondary }}>
          No questions match your current filters. Try adjusting your search criteria.
        </p>
        <button 
          className="px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90 transform hover:scale-105"
          style={{
            backgroundColor: theme.colors.semantic.action.primary,
            color: '#FFFFFF'
          }}
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${getGridClass(cardSize)} ${className}`}>
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <QuestionCard
            question={question}
            selected={selection?.selectedIds.has(question.id) || false}
            viewMode={cardSize === 'large' ? ViewMode.CARDS : ViewMode.GRID}
            onSelect={selection?.toggleSelection}
            onEdit={onEdit}
            onDelete={onDelete}
            onPreview={onPreview}
          />
        </div>
      ))}
    </div>
  );
};

function getGridClass(cardSize: 'small' | 'medium' | 'large'): string {
  switch (cardSize) {
    case 'small':
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    case 'medium':
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    case 'large':
      return 'grid-cols-1 lg:grid-cols-2';
    default:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }
}