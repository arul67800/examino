'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { RichTextEditor } from '../../../rich-text-editor/rich-text-editor';

interface ExplanationSectionProps {
  explanation: string;
  onExplanationChange: (content: string) => void;
}

export default function ExplanationSection({
  explanation,
  onExplanationChange
}: ExplanationSectionProps) {
  const { theme } = useTheme();

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
        Explanation (Optional)
      </h2>
      <RichTextEditor
        content={explanation}
        onChange={onExplanationChange}
        placeholder="Provide a detailed explanation for the correct answer..."
        minHeight="150px"
        maxLength={2000}
        showWordCount={true}
      />
    </div>
  );
}