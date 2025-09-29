import React from 'react';
import { useTheme } from '@/theme';
import { QuestionProgress } from '../types';

interface QuestionStatsProps {
  progress: QuestionProgress;
  sessionDuration: number;
  estimatedTotalTime: number;
  className?: string;
}

export const QuestionStats: React.FC<QuestionStatsProps> = ({
  progress,
  sessionDuration,
  estimatedTotalTime,
  className = ''
}) => {
  const { theme } = useTheme();

  const completionRate = progress.totalQuestions > 0 
    ? (progress.questionsAnswered / progress.totalQuestions) * 100 
    : 0;

  const accuracy = progress.questionsAnswered > 0 
    ? (progress.correctAnswers / progress.questionsAnswered) * 100 
    : 0;

  const timeEfficiency = estimatedTotalTime > 0 
    ? (estimatedTotalTime / Math.max(sessionDuration, 1)) * 100 
    : 100;

  const getGrade = (accuracy: number): { letter: string; color: string; description: string } => {
    if (accuracy >= 90) return { letter: 'A', color: theme.colors.semantic.status.success, description: 'Excellent' };
    if (accuracy >= 80) return { letter: 'B', color: '#22c55e', description: 'Good' };
    if (accuracy >= 70) return { letter: 'C', color: '#f59e0b', description: 'Average' };
    if (accuracy >= 60) return { letter: 'D', color: '#fb923c', description: 'Below Average' };
    return { letter: 'F', color: theme.colors.semantic.status.error, description: 'Needs Improvement' };
  };

  const grade = getGrade(accuracy);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = [
    {
      label: 'Questions Completed',
      value: `${progress.questionsAnswered}/${progress.totalQuestions}`,
      percentage: completionRate,
      icon: '📊',
      color: theme.colors.semantic.action.primary
    },
    {
      label: 'Accuracy Rate',
      value: `${accuracy.toFixed(1)}%`,
      percentage: accuracy,
      icon: '🎯',
      color: grade.color
    },
    {
      label: 'Time Efficiency',
      value: `${timeEfficiency.toFixed(0)}%`,
      percentage: Math.min(timeEfficiency, 100),
      icon: '⏱️',
      color: timeEfficiency >= 80 
        ? theme.colors.semantic.status.success 
        : timeEfficiency >= 60 
        ? theme.colors.semantic.status.warning 
        : theme.colors.semantic.status.error
    },
    {
      label: 'Session Duration',
      value: formatTime(sessionDuration),
      percentage: Math.min((sessionDuration / estimatedTotalTime) * 100, 100),
      icon: '🕐',
      color: theme.colors.semantic.status.info
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Grade */}
      {progress.questionsAnswered > 0 && (
        <div 
          className="p-6 rounded-lg text-center"
          style={{
            background: `linear-gradient(135deg, ${grade.color}15, ${grade.color}25)`,
            border: `2px solid ${grade.color}30`
          }}
        >
          <div 
            className="text-4xl font-bold mb-2"
            style={{ color: grade.color }}
          >
            {grade.letter}
          </div>
          <h3 
            className="text-lg font-semibold mb-1"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {grade.description}
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            {accuracy.toFixed(1)}% accuracy across {progress.questionsAnswered} questions
          </p>
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="grid gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: `${theme.colors.semantic.border.primary}20`
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{stat.icon}</span>
                <span 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {stat.label}
                </span>
              </div>
              <span 
                className="text-lg font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${stat.percentage}%`,
                  backgroundColor: stat.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Insights */}
      {progress.questionsAnswered > 0 && (
        <div 
          className="p-4 rounded-lg"
          style={{
            backgroundColor: `${theme.colors.semantic.status.info}08`,
            border: `1px solid ${theme.colors.semantic.status.info}20`
          }}
        >
          <h4 
            className="font-semibold mb-2 flex items-center space-x-2"
            style={{ color: theme.colors.semantic.status.info }}
          >
            <span>💡</span>
            <span>Quick Insights</span>
          </h4>
          <div className="space-y-2 text-sm">
            {accuracy >= 80 && (
              <p style={{ color: theme.colors.semantic.text.secondary }}>
                • Excellent performance! You're demonstrating strong understanding.
              </p>
            )}
            {accuracy < 60 && (
              <p style={{ color: theme.colors.semantic.text.secondary }}>
                • Consider reviewing the explanations for incorrect answers.
              </p>
            )}
            {progress.averageTime > 0 && progress.averageTime < 30 && (
              <p style={{ color: theme.colors.semantic.text.secondary }}>
                • You're answering questions quickly. Great pace!
              </p>
            )}
            {progress.averageTime > 60 && (
              <p style={{ color: theme.colors.semantic.text.secondary }}>
                • Taking time to think is good, but consider your overall pace.
              </p>
            )}
            {progress.difficultyBreakdown.hard.total > 0 && (
              <p style={{ color: theme.colors.semantic.text.secondary }}>
                • You're challenging yourself with difficult questions!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};