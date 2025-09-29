import React from 'react';
import { useTheme } from '@/theme';
import { MCQQuestion } from '../types';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  question: MCQQuestion;
  selectedOption: string;
  timeSpent: number;
  attempts: number;
  showAnimation?: boolean;
}

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  isCorrect,
  question,
  selectedOption,
  timeSpent,
  attempts,
  showAnimation = true
}) => {
  const { theme } = useTheme();

  const selectedOptionData = question.options.find(opt => opt.id === selectedOption);
  const correctOption = question.options.find(opt => opt.isCorrect);

  const getFeedbackColor = () => {
    return isCorrect 
      ? theme.colors.semantic.status.success 
      : theme.colors.semantic.status.error;
  };

  const getFeedbackIcon = () => {
    if (isCorrect) {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const getFeedbackMessage = () => {
    if (isCorrect) {
      const messages = [
        "Excellent! You got it right!",
        "Perfect! Well done!",
        "Correct! Great job!",
        "Outstanding! You nailed it!",
        "Brilliant! That's the right answer!"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        "Not quite right, but keep trying!",
        "Close! Let's review the correct answer.",
        "Good attempt! Here's the right answer.",
        "Almost there! Check out the explanation.",
        "Keep going! Learning from mistakes is important."
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  };

  const getPerformanceMessage = () => {
    if (timeSpent <= question.estimatedTime * 0.8) {
      return "Lightning fast! ⚡";
    } else if (timeSpent <= question.estimatedTime) {
      return "Good timing! ⏱️";
    } else if (timeSpent <= question.estimatedTime * 1.5) {
      return "Take your time! 🤔";
    } else {
      return "Thoughtful approach! 💭";
    }
  };

  return (
    <div 
      className={`
        p-6 rounded-lg border-2 mb-6
        ${showAnimation ? 'animate-slide-up' : ''}
      `}
      style={{
        backgroundColor: `${getFeedbackColor()}10`,
        borderColor: `${getFeedbackColor()}40`,
        boxShadow: `0 4px 16px ${getFeedbackColor()}20`
      }}
    >
      {/* Header with Icon and Message */}
      <div className="flex items-center space-x-4 mb-4">
        <div 
          className="p-2 rounded-full"
          style={{
            backgroundColor: getFeedbackColor(),
            color: theme.colors.semantic.text.inverse
          }}
        >
          {getFeedbackIcon()}
        </div>
        <div>
          <h3 
            className="text-lg font-bold"
            style={{ color: getFeedbackColor() }}
          >
            {getFeedbackMessage()}
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            {getPerformanceMessage()}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div 
          className="text-center p-3 rounded"
          style={{ backgroundColor: `${theme.colors.semantic.action.primary}08` }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.action.primary }}
          >
            {timeSpent}s
          </div>
          <div 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Time Taken
          </div>
        </div>
        <div 
          className="text-center p-3 rounded"
          style={{ backgroundColor: `${theme.colors.semantic.action.secondary}08` }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.action.secondary }}
          >
            {attempts}
          </div>
          <div 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            {attempts === 1 ? 'Attempt' : 'Attempts'}
          </div>
        </div>
        <div 
          className="text-center p-3 rounded"
          style={{ backgroundColor: `${getFeedbackColor()}08` }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: getFeedbackColor() }}
          >
            {isCorrect ? '100%' : '0%'}
          </div>
          <div 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Score
          </div>
        </div>
      </div>

      {/* Answer Summary */}
      <div 
        className="p-4 rounded-lg"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          border: `1px solid ${theme.colors.semantic.border.primary}20`
        }}
      >
        <div className="space-y-3">
          <div>
            <span 
              className="text-sm font-medium"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Your answer:
            </span>
            <span 
              className="ml-2 font-medium"
              style={{ color: isCorrect ? theme.colors.semantic.status.success : theme.colors.semantic.status.error }}
            >
              {selectedOptionData?.text}
            </span>
          </div>
          
          {!isCorrect && correctOption && (
            <div>
              <span 
                className="text-sm font-medium"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Correct answer:
              </span>
              <span 
                className="ml-2 font-medium"
                style={{ color: theme.colors.semantic.status.success }}
              >
                {correctOption.text}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Encouragement or Next Steps */}
      <div 
        className="mt-4 p-3 rounded text-sm"
        style={{
          backgroundColor: `${theme.colors.semantic.status.info}08`,
          border: `1px solid ${theme.colors.semantic.status.info}20`,
          color: theme.colors.semantic.text.secondary
        }}
      >
        {isCorrect ? (
          <div className="flex items-center space-x-2">
            <span>🎉</span>
            <span>Keep up the great work! Ready for the next challenge?</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>💡</span>
            <span>Review the explanation below to understand the correct answer better.</span>
          </div>
        )}
      </div>
    </div>
  );
};