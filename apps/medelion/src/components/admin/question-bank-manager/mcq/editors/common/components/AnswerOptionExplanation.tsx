'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import AnswerOptionReferences from './AnswerOptionReferences';

interface AnswerOptionExplanationProps {
  optionId: string;
  explanation?: string;
  references?: string;
  onExplanationChange: (optionId: string, explanation: string) => void;
  onReferencesChange: (optionId: string, references: string) => void;
  onClose: () => void;
}

export default function AnswerOptionExplanation({
  optionId,
  explanation = '',
  references = '',
  onExplanationChange,
  onReferencesChange,
  onClose
}: AnswerOptionExplanationProps) {
  const { theme } = useTheme();
  const [localExplanation, setLocalExplanation] = useState(explanation);

  const handleSave = () => {
    onExplanationChange(optionId, localExplanation);
    onClose();
  };

  const handleCancel = () => {
    setLocalExplanation(explanation);
    onClose();
  };

  return (
    <div 
      className="mt-2 p-3 rounded-lg border-2 border-dashed"
      style={{
        backgroundColor: theme.colors.semantic.surface.tertiary + '50',
        borderColor: theme.colors.semantic.border.primary + '40'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <label 
          className="text-sm font-medium"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Option Explanation (Optional)
        </label>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-2 py-1 text-xs rounded transition-all"
            style={{
              backgroundColor: theme.colors.semantic.status.success,
              color: theme.colors.semantic.surface.primary
            }}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 text-xs rounded transition-all"
            style={{
              backgroundColor: theme.colors.semantic.status.error,
              color: theme.colors.semantic.surface.primary
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      
      <textarea
        value={localExplanation}
        onChange={(e) => setLocalExplanation(e.target.value)}
        placeholder="Explain why this option is correct or incorrect..."
        className="w-full p-2 text-sm rounded border resize-none"
        rows={3}
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          border: `1px solid ${theme.colors.semantic.border.secondary}`,
          color: theme.colors.semantic.text.primary
        }}
      />
      
      <div className="mt-2 text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
        This explanation will help students understand why this option is correct or incorrect.
      </div>
      
      {/* References Component */}
      <AnswerOptionReferences
        optionId={optionId}
        references={references}
        onReferencesChange={onReferencesChange}
      />
    </div>
  );
}