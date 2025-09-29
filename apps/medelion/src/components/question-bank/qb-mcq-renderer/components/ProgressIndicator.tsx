import React from 'react';
import { useTheme } from '@/theme';
import { QuestionProgress } from '../types';

interface ProgressIndicatorProps {
  progress: QuestionProgress;
  currentQuestionIndex: number;
  showDetailedStats?: boolean;
  compact?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  currentQuestionIndex,
  showDetailedStats = true,
  compact = false
}) => {
  const { theme } = useTheme();

  const progressPercentage = progress.totalQuestions > 0 
    ? (progress.questionsAnswered / progress.totalQuestions) * 100 
    : 0;

  const accuracy = progress.questionsAnswered > 0 
    ? (progress.correctAnswers / progress.questionsAnswered) * 100 
    : 0;

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return theme.colors.semantic.status.success;
    if (accuracy >= 60) return theme.colors.semantic.status.warning;
    return theme.colors.semantic.status.error;
  };

  if (compact) {
    return (
      <div 
        className="flex items-center space-x-4 p-3 rounded-lg"
        style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
      >
        {/* Progress Bar */}
        <div className="flex-1">
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: `${theme.colors.semantic.border.primary}20` }}
          >
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: theme.colors.semantic.action.primary
              }}
            />
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-3 text-sm">
          <span style={{ color: theme.colors.semantic.text.secondary }}>
            {progress.questionsAnswered}/{progress.totalQuestions}
          </span>
          <span 
            className="font-medium"
            style={{ color: getAccuracyColor(accuracy) }}
          >
            {accuracy.toFixed(0)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-lg border mb-6"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: `${theme.colors.semantic.border.primary}30`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-lg font-semibold flex items-center space-x-2"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <span>📊</span>
          <span>Your Progress</span>
        </h3>
        <span 
          className="text-sm px-3 py-1 rounded-full font-medium"
          style={{
            backgroundColor: `${theme.colors.semantic.action.primary}20`,
            color: theme.colors.semantic.action.primary
          }}
        >
          Question {currentQuestionIndex + 1} of {progress.totalQuestions}
        </span>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span 
            className="text-sm font-medium"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Overall Progress
          </span>
          <span 
            className="text-sm font-bold"
            style={{ color: theme.colors.semantic.action.primary }}
          >
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        <div 
          className="h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: `${theme.colors.semantic.border.primary}20` }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercentage}%`,
              background: `linear-gradient(90deg, ${theme.colors.semantic.action.primary}, ${theme.colors.semantic.action.secondary})`
            }}
          />
        </div>
      </div>

      {showDetailedStats && (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div 
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: theme.colors.semantic.action.primary }}
              >
                {progress.questionsAnswered}
              </div>
              <div 
                className="text-xs"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Answered
              </div>
            </div>
            
            <div 
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: theme.colors.semantic.status.success }}
              >
                {progress.correctAnswers}
              </div>
              <div 
                className="text-xs"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Correct
              </div>
            </div>

            <div 
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: getAccuracyColor(accuracy) }}
              >
                {accuracy.toFixed(0)}%
              </div>
              <div 
                className="text-xs"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Accuracy
              </div>
            </div>

            <div 
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: theme.colors.semantic.status.info }}
              >
                {Math.round(progress.averageTime)}s
              </div>
              <div 
                className="text-xs"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Avg Time
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div>
            <h4 
              className="text-sm font-semibold mb-3"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Performance by Difficulty
            </h4>
            <div className="space-y-3">
              {[
                { key: 'easy', label: 'Easy', color: theme.colors.semantic.status.success },
                { key: 'medium', label: 'Medium', color: '#f59e0b' },
                { key: 'hard', label: 'Hard', color: theme.colors.semantic.status.error }
              ].map(difficulty => {
                const difficultyData = progress.difficultyBreakdown[difficulty.key as keyof typeof progress.difficultyBreakdown];
                const difficultyAccuracy = difficultyData.total > 0 
                  ? (difficultyData.correct / difficultyData.total) * 100 
                  : 0;

                return (
                  <div key={difficulty.key} className="flex items-center space-x-3">
                    <div 
                      className="w-12 text-xs font-medium text-center py-1 rounded"
                      style={{ 
                        backgroundColor: `${difficulty.color}20`,
                        color: difficulty.color
                      }}
                    >
                      {difficulty.label}
                    </div>
                    <div className="flex-1">
                      <div 
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: `${difficulty.color}20` }}
                      >
                        <div
                          className="h-full transition-all duration-500 ease-out"
                          style={{
                            width: `${difficultyAccuracy}%`,
                            backgroundColor: difficulty.color
                          }}
                        />
                      </div>
                    </div>
                    <div 
                      className="text-xs font-medium w-12 text-right"
                      style={{ color: difficulty.color }}
                    >
                      {difficultyData.total > 0 ? `${difficultyAccuracy.toFixed(0)}%` : '—'}
                    </div>
                    <div 
                      className="text-xs w-12 text-right"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {difficultyData.correct}/{difficultyData.total}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};