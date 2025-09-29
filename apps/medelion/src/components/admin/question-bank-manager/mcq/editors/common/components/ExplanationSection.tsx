'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { RichTextEditor } from '../../../rich-text-editor/rich-text-editor';
import MainReferences from './MainReferences';
import FullscreenExplanationModal from './FullscreenExplanationModal';

interface ExplanationSectionProps {
  explanation: string;
  references?: string;
  onExplanationChange: (content: string) => void;
  onReferencesChange: (content: string) => void;
  validatePrerequisitesForReferences?: () => boolean;
}

export default function ExplanationSection({
  explanation,
  references = '',
  onExplanationChange,
  onReferencesChange,
  validatePrerequisitesForReferences
}: ExplanationSectionProps) {
  const { theme } = useTheme();
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState<'edit' | 'preview'>('edit');

  const handleFullscreenEdit = () => {
    setFullscreenMode('edit');
    setIsFullscreenOpen(true);
  };

  const handleFullscreenPreview = () => {
    setFullscreenMode('preview');
    setIsFullscreenOpen(true);
  };

  return (
    <div>
      <div 
        className="rounded-xl p-6 border-2 relative group"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.secondary + '30'
        }}
      >
        {/* Header with Title and Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-lg font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Explanation (Optional)
          </h2>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Fullscreen Edit Button */}
            <button
              onClick={handleFullscreenEdit}
              className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
              style={{
                backgroundColor: theme.colors.semantic.status.info + '15',
                color: theme.colors.semantic.status.info
              }}
              title="Edit in fullscreen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

            {/* Preview Button */}
            <button
              onClick={handleFullscreenPreview}
              className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
              style={{
                backgroundColor: theme.colors.semantic.status.success + '15',
                color: theme.colors.semantic.status.success
              }}
              title="Preview in fullscreen"
              disabled={!explanation.trim()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <RichTextEditor
          content={explanation}
          onChange={onExplanationChange}
          placeholder="Provide a detailed explanation for the correct answer..."
          minHeight="150px"
          maxLength={2000}
          showWordCount={true}
        />
      </div>
      
      {/* References Section */}
      <MainReferences
        references={references}
        onReferencesChange={onReferencesChange}
        explanation={explanation}
        validatePrerequisites={validatePrerequisitesForReferences}
      />

      {/* Fullscreen Modal */}
      <FullscreenExplanationModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        content={explanation}
        onChange={onExplanationChange}
        title="Explanation"
        initialMode={fullscreenMode}
      />
    </div>
  );
}