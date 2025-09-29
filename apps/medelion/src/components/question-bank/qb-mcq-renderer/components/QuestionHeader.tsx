import React from 'react';
import { useTheme } from '@/theme';
import { MCQQuestion } from '../types';
import { getDifficultyColor, getDifficultyIcon, formatDuration } from '../utils';

interface QuestionHeaderProps {
  question: MCQQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeSpent?: number;
  showTimer?: boolean;
  showDifficulty?: boolean;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  question,
  questionNumber,
  totalQuestions,
  timeSpent = 0,
  showTimer = true,
  showDifficulty = true
}) => {
  const { theme } = useTheme();

  return (
    <div 
      className="flex items-center justify-between mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: theme.colors.semantic.surface.secondary,
        borderColor: `${theme.colors.semantic.border.primary}30`,
      }}
    >
      {/* Question Number and Progress */}
      <div className="flex items-center space-x-4">
        <div 
          className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: theme.colors.semantic.action.primary,
            color: theme.colors.semantic.text.inverse
          }}
        >
          <span>Question {questionNumber}</span>
          <span className="opacity-75">of {totalQuestions}</span>
        </div>

        {/* Subject and Chapter Tags */}
        <div className="flex items-center space-x-2">
          <span 
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: `${theme.colors.semantic.action.secondary}20`,
              color: theme.colors.semantic.text.primary
            }}
          >
            {question.subject}
          </span>
          {question.chapter && (
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: `${theme.colors.semantic.action.secondary}10`,
                color: theme.colors.semantic.text.secondary
              }}
            >
              {question.chapter}
            </span>
          )}
        </div>
      </div>

      {/* Right Side Info */}
      <div className="flex items-center space-x-4">
        {/* Difficulty Indicator */}
        {showDifficulty && (
          <div className="flex items-center space-x-2">
            <span 
              className="text-xs font-medium"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Difficulty:
            </span>
            <div 
              className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold"
              style={{
                backgroundColor: `${getDifficultyColor(question.difficulty)}20`,
                color: getDifficultyColor(question.difficulty)
              }}
            >
              <span>{getDifficultyIcon(question.difficulty)}</span>
              <span className="capitalize">{question.difficulty}</span>
            </div>
          </div>
        )}

        {/* Timer */}
        {showTimer && (
          <div 
            className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-mono"
            style={{
              backgroundColor: `${theme.colors.semantic.status.info}10`,
              color: theme.colors.semantic.status.info,
              border: `1px solid ${theme.colors.semantic.status.info}30`
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd" />
            </svg>
            <span>{formatDuration(timeSpent)}</span>
          </div>
        )}

        {/* Estimated Time */}
        <div 
          className="text-xs"
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          Est. {formatDuration(question.estimatedTime)}
        </div>
      </div>
    </div>
  );
};