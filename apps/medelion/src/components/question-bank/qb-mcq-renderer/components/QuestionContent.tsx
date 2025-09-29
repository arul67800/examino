import React from 'react';
import { useTheme } from '@/theme';
import { MCQQuestion } from '../types';

interface QuestionContentProps {
  question: MCQQuestion;
  className?: string;
}

export const QuestionContent: React.FC<QuestionContentProps> = ({
  question,
  className = ''
}) => {
  const { theme } = useTheme();

  return (
    <div 
      className={`mb-6 ${className}`}
      style={{ color: theme.colors.semantic.text.primary }}
    >
      {/* Question Text */}
      <div 
        className="text-lg leading-relaxed mb-4 p-6 rounded-lg"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          border: `2px solid ${theme.colors.semantic.border.primary}20`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <h2 className="font-medium" style={{ lineHeight: '1.6' }}>
          {question.questionText}
        </h2>
      </div>

      {/* Question Tags */}
      {question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${theme.colors.semantic.action.secondary}15`,
                color: theme.colors.semantic.text.secondary,
                border: `1px solid ${theme.colors.semantic.action.secondary}25`
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Learning Objectives */}
      {question.learningObjectives.length > 0 && (
        <div 
          className="p-4 rounded-lg mb-4"
          style={{
            backgroundColor: `${theme.colors.semantic.status.info}08`,
            border: `1px solid ${theme.colors.semantic.status.info}20`
          }}
        >
          <h3 
            className="text-sm font-semibold mb-2"
            style={{ color: theme.colors.semantic.status.info }}
          >
            Learning Objectives:
          </h3>
          <ul className="text-sm space-y-1">
            {question.learningObjectives.map((objective, index) => (
              <li 
                key={index}
                className="flex items-start space-x-2"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <span 
                  className="inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: theme.colors.semantic.status.info }}
                />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};