import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import { MCQOption } from '../types';
import { createPulseAnimation, createShakeAnimation } from '../utils';

interface AnswerOptionProps {
  option: MCQOption;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean | null;
  isAnswered: boolean;
  showFeedback: boolean;
  onSelect: (optionId: string) => void;
  animationsEnabled?: boolean;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  index,
  isSelected,
  isCorrect,
  isAnswered,
  showFeedback,
  onSelect,
  animationsEnabled = true
}) => {
  const { theme } = useTheme();
  const optionRef = useRef<HTMLDivElement>(null);

  // Handle feedback animations
  useEffect(() => {
    if (showFeedback && isSelected && optionRef.current && animationsEnabled) {
      if (isCorrect) {
        createPulseAnimation(optionRef.current, theme.colors.semantic.status.success);
      } else {
        createShakeAnimation(optionRef.current);
      }
    }
  }, [showFeedback, isSelected, isCorrect, theme, animationsEnabled]);

  const getOptionStyle = () => {
    const baseStyle = {
      backgroundColor: theme.colors.semantic.surface.primary,
      borderWidth: '2px',
      borderStyle: 'solid',
      transition: 'all 300ms ease-out',
    };

    if (showFeedback && isAnswered) {
      if (option.isCorrect) {
        // Always highlight the correct answer
        return {
          ...baseStyle,
          backgroundColor: `${theme.colors.semantic.status.success}15`,
          borderColor: theme.colors.semantic.status.success,
          boxShadow: `0 4px 12px ${theme.colors.semantic.status.success}25`,
        };
      } else if (isSelected) {
        // Highlight selected incorrect answer
        return {
          ...baseStyle,
          backgroundColor: `${theme.colors.semantic.status.error}15`,
          borderColor: theme.colors.semantic.status.error,
          boxShadow: `0 4px 12px ${theme.colors.semantic.status.error}25`,
        };
      } else {
        // Dim unselected incorrect answers
        return {
          ...baseStyle,
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: `${theme.colors.semantic.border.primary}30`,
          opacity: '0.7',
        };
      }
    }

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: `${theme.colors.semantic.action.primary}10`,
        borderColor: theme.colors.semantic.action.primary,
        boxShadow: `0 4px 12px ${theme.colors.semantic.action.primary}25`,
        transform: 'translateY(-1px)',
      };
    }

    return {
      ...baseStyle,
      borderColor: `${theme.colors.semantic.border.primary}30`,
    };
  };

  const getIconStyle = () => {
    if (showFeedback && isAnswered) {
      if (option.isCorrect) {
        return {
          backgroundColor: theme.colors.semantic.status.success,
          color: theme.colors.semantic.text.inverse,
        };
      } else if (isSelected) {
        return {
          backgroundColor: theme.colors.semantic.status.error,
          color: theme.colors.semantic.text.inverse,
        };
      }
    }

    if (isSelected) {
      return {
        backgroundColor: theme.colors.semantic.action.primary,
        color: theme.colors.semantic.text.inverse,
      };
    }

    return {
      backgroundColor: theme.colors.semantic.surface.secondary,
      color: theme.colors.semantic.text.primary,
    };
  };

  const getIcon = () => {
    if (showFeedback && isAnswered) {
      if (option.isCorrect) {
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      } else if (isSelected) {
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      }
    }

    return <span className="font-bold">{String.fromCharCode(65 + index)}</span>;
  };

  const handleClick = () => {
    if (!isAnswered) {
      onSelect(option.id);
    }
  };

  return (
    <div
      ref={optionRef}
      className={`
        relative p-4 rounded-lg cursor-pointer select-none group
        ${!isAnswered ? 'hover:shadow-lg hover:-translate-y-0.5' : 'cursor-default'}
        ${animationsEnabled ? 'transition-all duration-300 ease-out' : ''}
      `}
      style={getOptionStyle()}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isAnswered) {
          e.preventDefault();
          onSelect(option.id);
        }
      }}
      tabIndex={isAnswered ? -1 : 0}
      role="button"
      aria-pressed={isSelected}
      aria-disabled={isAnswered}
    >
      <div className="flex items-start space-x-4">
        {/* Option Letter/Icon */}
        <div
          className={`
            flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0
            ${animationsEnabled ? 'transition-all duration-300 ease-out' : ''}
            ${!isAnswered ? 'group-hover:scale-110' : ''}
          `}
          style={getIconStyle()}
        >
          {getIcon()}
        </div>

        {/* Option Content */}
        <div className="flex-1 min-w-0">
          <p 
            className={`text-base leading-relaxed ${animationsEnabled ? 'transition-colors duration-300' : ''}`}
            style={{ 
              color: theme.colors.semantic.text.primary,
              lineHeight: '1.5'
            }}
          >
            {option.text}
          </p>

          {/* Option Media */}
          {option.media && (
            <div className="mt-3">
              {option.media.type === 'image' && (
                <img
                  src={option.media.url}
                  alt={option.media.alt || 'Option image'}
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: '200px' }}
                />
              )}
            </div>
          )}

          {/* Individual Option Explanation (shown only after answering if available) */}
          {showFeedback && isAnswered && option.explanation && (isSelected || option.isCorrect) && (
            <div 
              className={`mt-3 p-3 rounded text-sm ${animationsEnabled ? 'animate-fade-in' : ''}`}
              style={{
                backgroundColor: option.isCorrect 
                  ? `${theme.colors.semantic.status.success}10`
                  : `${theme.colors.semantic.status.info}10`,
                border: `1px solid ${
                  option.isCorrect 
                    ? `${theme.colors.semantic.status.success}30`
                    : `${theme.colors.semantic.status.info}30`
                }`,
                color: theme.colors.semantic.text.secondary
              }}
            >
              <div className="flex items-start space-x-2">
                <svg 
                  className="w-4 h-4 mt-0.5 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{
                    color: option.isCorrect 
                      ? theme.colors.semantic.status.success 
                      : theme.colors.semantic.status.info
                  }}
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>{option.explanation}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection indicator overlay */}
      {isSelected && !showFeedback && (
        <div 
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: theme.colors.semantic.action.primary,
            color: theme.colors.semantic.text.inverse
          }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};