'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { RichTextEditor } from '../../../rich-text-editor/rich-text-editor';

interface FullscreenExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onChange: (content: string) => void;
  title?: string;
  initialMode?: 'edit' | 'preview';
}

export default function FullscreenExplanationModal({
  isOpen,
  onClose,
  content,
  onChange,
  title = "Explanation",
  initialMode = 'edit'
}: FullscreenExplanationModalProps) {
  const { theme } = useTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(initialMode === 'preview');
  const [localContent, setLocalContent] = useState(content);

  // Reset mode and sync content when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsPreviewMode(initialMode === 'preview');
      setLocalContent(content);
    }
  }, [isOpen, initialMode, content]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Escape to close
      if (event.key === 'Escape') {
        handleSave();
      }
      
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
      
      // Ctrl/Cmd + P to toggle preview
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        togglePreviewMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, localContent]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Save the local content to parent component
    onChange(localContent);
    onClose();
  };

  const handleLocalContentChange = (newContent: string) => {
    setLocalContent(newContent);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div 
        className="w-full h-full max-w-full max-h-full flex flex-col"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          margin: '20px'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: theme.colors.semantic.border.secondary + '30',
            backgroundColor: theme.colors.semantic.surface.secondary + '20'
          }}
        >
          <div className="flex items-center space-x-4">
            <h2 
              className="text-xl font-semibold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {title}
            </h2>
            
            {/* Mode Toggle Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreviewMode(false)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  !isPreviewMode ? 'shadow-sm' : ''
                }`}
                style={{
                  backgroundColor: !isPreviewMode 
                    ? theme.colors.semantic.status.info + '20'
                    : 'transparent',
                  color: !isPreviewMode 
                    ? theme.colors.semantic.status.info
                    : theme.colors.semantic.text.secondary,
                  border: `1px solid ${!isPreviewMode 
                    ? theme.colors.semantic.status.info + '40'
                    : theme.colors.semantic.border.secondary + '30'
                  }`
                }}
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </div>
              </button>
              
              <button
                onClick={() => setIsPreviewMode(true)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  isPreviewMode ? 'shadow-sm' : ''
                }`}
                style={{
                  backgroundColor: isPreviewMode 
                    ? theme.colors.semantic.status.success + '20'
                    : 'transparent',
                  color: isPreviewMode 
                    ? theme.colors.semantic.status.success
                    : theme.colors.semantic.text.secondary,
                  border: `1px solid ${isPreviewMode 
                    ? theme.colors.semantic.status.success + '40'
                    : theme.colors.semantic.border.secondary + '30'
                  }`
                }}
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Keyboard shortcuts hint */}
            <div className="text-xs hidden md:block" style={{ color: theme.colors.semantic.text.secondary }}>
              <kbd className="px-1 py-0.5 rounded text-xs border" style={{ borderColor: theme.colors.semantic.border.secondary }}>Esc</kbd> to close • 
              <kbd className="px-1 py-0.5 rounded text-xs border mx-1" style={{ borderColor: theme.colors.semantic.border.secondary }}>Ctrl+S</kbd> to save • 
              <kbd className="px-1 py-0.5 rounded text-xs border" style={{ borderColor: theme.colors.semantic.border.secondary }}>Ctrl+P</kbd> to preview
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: theme.colors.semantic.status.success + '15',
                color: theme.colors.semantic.status.success,
                border: `1px solid ${theme.colors.semantic.status.success + '40'}`
              }}
            >
              Save & Close
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-red-50 transition-all"
              style={{ color: theme.colors.semantic.status.error }}
              title="Close without saving (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-hidden">
          {isPreviewMode ? (
            /* Preview Mode */
            <div 
              className="h-full p-6 rounded-lg border overflow-y-auto"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '20',
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              {localContent ? (
                <div 
                  className="prose max-w-none"
                  style={{ color: theme.colors.semantic.text.primary }}
                  dangerouslySetInnerHTML={{ __html: localContent }}
                />
              ) : (
                <div 
                  className="text-center text-gray-500 italic py-12"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  No content to preview. Switch to edit mode to add content.
                </div>
              )}
            </div>
          ) : (
            /* Edit Mode */
            <div className="h-full">
              <RichTextEditor
                content={localContent}
                onChange={handleLocalContentChange}
                placeholder="Write your detailed explanation here..."
                minHeight="calc(100vh - 200px)"
                maxLength={5000}
                showWordCount={true}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}