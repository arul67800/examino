import React from 'react';
import { useTheme } from '@/theme';

interface QuestionNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  answeredQuestions: Set<number>;
  canNavigate?: boolean;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onGoTo,
  answeredQuestions,
  canNavigate = true
}) => {
  const { theme } = useTheme();

  const canGoPrevious = currentIndex > 0 && canNavigate;
  const canGoNext = currentIndex < totalQuestions - 1 && canNavigate;

  const getQuestionStatus = (index: number) => {
    if (index === currentIndex) return 'current';
    if (answeredQuestions.has(index)) return 'answered';
    return 'unanswered';
  };

  const getQuestionStyle = (index: number) => {
    const status = getQuestionStatus(index);
    const baseStyle = {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      border: '2px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: canNavigate ? 'pointer' : 'default',
      transition: 'all 200ms ease-out'
    };

    switch (status) {
      case 'current':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.semantic.action.primary,
          borderColor: theme.colors.semantic.action.primary,
          color: theme.colors.semantic.text.inverse,
          transform: 'scale(1.1)'
        };
      case 'answered':
        return {
          ...baseStyle,
          backgroundColor: `${theme.colors.semantic.status.success}20`,
          borderColor: theme.colors.semantic.status.success,
          color: theme.colors.semantic.status.success
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: `${theme.colors.semantic.border.primary}30`,
          color: theme.colors.semantic.text.secondary
        };
    }
  };

  return (
    <div 
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: `${theme.colors.semantic.border.primary}30`
      }}
    >
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="font-semibold flex items-center space-x-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <span>🧭</span>
          <span>Question Navigation</span>
        </h3>
        <span 
          className="text-sm"
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          {answeredQuestions.size}/{totalQuestions} completed
        </span>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <button
            key={index}
            onClick={() => canNavigate && onGoTo(index)}
            style={getQuestionStyle(index)}
            className="hover:shadow-md transition-shadow"
            disabled={!canNavigate}
            title={`Question ${index + 1}${answeredQuestions.has(index) ? ' (Answered)' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${canGoPrevious ? 'hover:shadow-lg hover:-translate-y-0.5' : 'opacity-50 cursor-not-allowed'}
          `}
          style={{
            backgroundColor: canGoPrevious 
              ? theme.colors.semantic.surface.secondary 
              : `${theme.colors.semantic.surface.secondary}50`,
            border: `1px solid ${theme.colors.semantic.border.primary}30`,
            color: theme.colors.semantic.text.primary
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-2">
          <span 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Question
          </span>
          <span 
            className="text-lg font-bold px-3 py-1 rounded"
            style={{
              backgroundColor: `${theme.colors.semantic.action.primary}20`,
              color: theme.colors.semantic.action.primary
            }}
          >
            {currentIndex + 1}
          </span>
          <span 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            of {totalQuestions}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${canGoNext ? 'hover:shadow-lg hover:-translate-y-0.5' : 'opacity-50 cursor-not-allowed'}
          `}
          style={{
            backgroundColor: canGoNext 
              ? theme.colors.semantic.action.primary 
              : `${theme.colors.semantic.action.primary}50`,
            color: theme.colors.semantic.text.inverse
          }}
        >
          <span>Next</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t" style={{ borderColor: `${theme.colors.semantic.border.primary}20` }}>
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded border-2"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              borderColor: theme.colors.semantic.action.primary
            }}
          />
          <span 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Current
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded border-2"
            style={{
              backgroundColor: `${theme.colors.semantic.status.success}20`,
              borderColor: theme.colors.semantic.status.success
            }}
          />
          <span 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Answered
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded border-2"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: `${theme.colors.semantic.border.primary}30`
            }}
          />
          <span 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Unanswered
          </span>
        </div>
      </div>
    </div>
  );
};