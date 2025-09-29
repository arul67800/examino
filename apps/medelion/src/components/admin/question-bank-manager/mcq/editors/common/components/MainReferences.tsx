'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { RichTextEditor } from '../../../rich-text-editor/rich-text-editor';
import FullscreenExplanationModal from './FullscreenExplanationModal';

interface MainReferencesProps {
  references: string;
  onReferencesChange: (content: string) => void;
  explanation?: string;
  validatePrerequisites?: () => boolean;
}

export default function MainReferences({
  references,
  onReferencesChange,
  explanation = '',
  validatePrerequisites
}: MainReferencesProps) {
  const { theme } = useTheme();
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState<'edit' | 'preview'>('edit');

  const handleFullscreenEdit = () => {
    if (validatePrerequisites && !validatePrerequisites()) {
      return;
    }
    setFullscreenMode('edit');
    setIsFullscreenOpen(true);
  };

  const handleFullscreenPreview = () => {
    if (validatePrerequisites && !validatePrerequisites()) {
      return;
    }
    setFullscreenMode('preview');
    setIsFullscreenOpen(true);
  };

  const handleReferencesChange = (content: string) => {
    if (validatePrerequisites && !validatePrerequisites()) {
      return;
    }
    onReferencesChange(content);
  };

  return (
    <>
      <div 
        className="rounded-xl p-6 border-2 mt-4 relative group"
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
            References (Optional)
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
              title="Edit references in fullscreen"
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
              title="Preview references in fullscreen"
              disabled={!references.trim()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <RichTextEditor
          content={references}
          onChange={handleReferencesChange}
          placeholder="Add references, citations, sources, or supporting materials for this question..."
          minHeight="120px"
          maxLength={1500}
          showWordCount={true}
        />
        <div className="mt-2 text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
          Add academic references, citations, textbook pages, or other sources that support this question and its answer.
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenExplanationModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        content={references}
        onChange={handleReferencesChange}
        title="References"
        initialMode={fullscreenMode}
      />
    </>
  );
}