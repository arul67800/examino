'use client';

import React from 'react';
import { useTheme } from '@/theme';

interface QuestionSettingsProps {
  points?: number;
  timeLimit?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  pointsEnabled: boolean;
  timeLimitEnabled: boolean;
  onPointsChange: (points: number) => void;
  onTimeLimitChange: (timeLimit: number) => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export default function QuestionSettings({
  points = 1,
  timeLimit = 60,
  difficulty = 'medium',
  pointsEnabled,
  timeLimitEnabled,
  onPointsChange,
  onTimeLimitChange,
  onDifficultyChange
}: QuestionSettingsProps) {
  const { theme } = useTheme();

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: theme.colors.semantic.status.success },
    { value: 'medium', label: 'Medium', color: theme.colors.semantic.status.warning },
    { value: 'hard', label: 'Hard', color: theme.colors.semantic.status.error }
  ] as const;

  return (
    <div 
      className="rounded-xl p-6 border-2"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.secondary + '30'
      }}
    >
      <h2 
        className="text-lg font-semibold mb-4"
        style={{ color: theme.colors.semantic.text.primary }}
      >
        Question Settings
      </h2>
      
      <div className={`grid grid-cols-1 gap-4 ${
        pointsEnabled && timeLimitEnabled ? 'md:grid-cols-3' :
        pointsEnabled || timeLimitEnabled ? 'md:grid-cols-2' :
        'md:grid-cols-1'
      }`}>
        {/* Difficulty */}
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Difficulty Level
          </label>
          <div className="flex space-x-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onDifficultyChange(option.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  difficulty === option.value ? 'shadow-md' : 'hover:shadow-sm'
                }`}
                style={{
                  backgroundColor: difficulty === option.value 
                    ? option.color + '20' 
                    : theme.colors.semantic.surface.secondary + '30',
                  border: `1px solid ${difficulty === option.value 
                    ? option.color + '60' 
                    : theme.colors.semantic.border.secondary + '40'}`,
                  color: difficulty === option.value 
                    ? option.color 
                    : theme.colors.semantic.text.secondary
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Points */}
        {pointsEnabled && (
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Points
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={points}
              onChange={(e) => onPointsChange(Number(e.target.value))}
              className="w-full p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '30',
                border: `1px solid ${theme.colors.semantic.border.secondary}40`,
                color: theme.colors.semantic.text.primary
              }}
            />
          </div>
        )}

        {/* Time Limit */}
        {timeLimitEnabled && (
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Time Limit (seconds)
            </label>
            <input
              type="number"
              min="10"
              max="3600"
              step="10"
              value={timeLimit}
              onChange={(e) => onTimeLimitChange(Number(e.target.value))}
              className="w-full p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '30',
                border: `1px solid ${theme.colors.semantic.border.secondary}40`,
                color: theme.colors.semantic.text.primary
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}