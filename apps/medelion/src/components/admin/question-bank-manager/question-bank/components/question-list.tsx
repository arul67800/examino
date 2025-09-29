/**
 * Clean Professional Question List Component
 * Modern list layout with theme integration and smooth animations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Question, ViewMode } from '../types';
import { QuestionCard } from './question-card';
import { useTheme } from '@/theme';

export interface QuestionListProps {
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
  className?: string;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  isLoading = false,
  selection,
  onEdit,
  onDelete,
  onPreview,
  viewSettings,
  className = ''
}) => {
  const { theme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Prevent hydration mismatch by showing loading state until hydrated
  if (!isHydrated || isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center p-4 rounded-lg animate-pulse"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              border: `1px solid ${theme.colors.semantic.border.secondary}`
            }}
          >
            <div className="w-5 h-5 rounded mr-4" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-4 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                <div className="w-16 h-4 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                <div className="w-64 h-4 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
              </div>
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <div className="w-12 h-6 rounded-full" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
              <div className="w-10 h-4 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
              <div className="flex space-x-1">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
              </div>
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
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
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
    <div className={`space-y-3 ${className}`}>
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="transform transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
          style={{
            animationDelay: `${index * 30}ms`,
            animation: 'slideInLeft 0.5s ease-out forwards'
          }}
        >
          <QuestionCard
            question={question}
            selected={selection?.selectedIds.has(question.id) || false}
            viewMode={ViewMode.LIST}
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