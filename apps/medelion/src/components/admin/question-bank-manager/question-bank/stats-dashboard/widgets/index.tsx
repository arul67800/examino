// Widgets
'use client';
import React from 'react';
import { useTheme } from '@/theme';
import { QuestionBankStats } from '../../types';

export const QuickActionsWidget: React.FC<{ onBackToQuestionBank?: () => void }> = ({ onBackToQuestionBank }) => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.semantic.text.primary }}>Quick Actions</h3>
      <div className="space-y-2">
        <button 
          onClick={onBackToQuestionBank}
          className="w-full p-2 rounded text-left" 
          style={{ backgroundColor: theme.colors.semantic.action.primary + '20', color: theme.colors.semantic.action.primary }}
        >
          ← Back to Question Bank
        </button>
      </div>
    </div>
  );
};

export const ExportWidget: React.FC<{ stats: QuestionBankStats }> = ({ stats }) => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>Export Data</h3>
      <p style={{ color: theme.colors.semantic.text.secondary }}>Export options coming soon...</p>
    </div>
  );
};

export const SettingsWidget: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
      <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>Dashboard Settings</h3>
      <p style={{ color: theme.colors.semantic.text.secondary }}>Settings coming soon...</p>
    </div>
  );
};