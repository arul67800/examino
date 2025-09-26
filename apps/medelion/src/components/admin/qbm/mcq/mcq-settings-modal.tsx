'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/theme';

export type MCQEditorWidth = 'compact' | 'moderate' | 'full';

export interface MCQSettingsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Current width setting */
  currentWidth: MCQEditorWidth;
  /** Callback when width changes */
  onWidthChange: (width: MCQEditorWidth) => void;
  /** Additional settings can be added here */
  autoSave?: boolean;
  onAutoSaveChange?: (enabled: boolean) => void;
  showPreview?: boolean;
  onShowPreviewChange?: (enabled: boolean) => void;
  /** Points settings */
  pointsEnabled?: boolean;
  onPointsEnabledChange?: (enabled: boolean) => void;
  /** Time limit settings */
  timeLimitEnabled?: boolean;
  onTimeLimitEnabledChange?: (enabled: boolean) => void;
}

export const MCQSettingsModal: React.FC<MCQSettingsModalProps> = ({
  isOpen,
  onClose,
  currentWidth,
  onWidthChange,
  autoSave = true,
  onAutoSaveChange,
  showPreview = true,
  onShowPreviewChange,
  pointsEnabled = true,
  onPointsEnabledChange,
  timeLimitEnabled = true,
  onTimeLimitEnabledChange
}) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthOptions = [
    {
      value: 'compact' as MCQEditorWidth,
      label: 'Compact',
      description: 'Narrow width for focused editing',
      maxWidth: '768px',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      )
    },
    {
      value: 'moderate' as MCQEditorWidth,
      label: 'Moderate',
      description: 'Balanced width for comfortable editing',
      maxWidth: '1024px',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h12M4 18h16" />
        </svg>
      )
    },
    {
      value: 'full' as MCQEditorWidth,
      label: 'Full Width',
      description: 'Maximum width for comprehensive editing',
      maxWidth: '100%',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl transition-all"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.primary,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 
                className="text-xl font-bold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                MCQ Editor Settings
              </h2>
              <p 
                className="mt-1 text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Customize your editing experience
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Editor Width Section */}
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Editor Width
              </h3>
              <div className="space-y-3">
                {widthOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onWidthChange(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      currentWidth === option.value ? 'ring-2' : ''
                    }`}
                    style={{
                      borderColor: currentWidth === option.value 
                        ? theme.colors.semantic.action.primary
                        : theme.colors.semantic.border.primary,
                      backgroundColor: currentWidth === option.value 
                        ? theme.colors.semantic.action.primary + '10'
                        : theme.colors.semantic.surface.secondary + '30'
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="flex-shrink-0 p-2 rounded-lg"
                        style={{ 
                          backgroundColor: currentWidth === option.value 
                            ? theme.colors.semantic.action.primary
                            : theme.colors.semantic.surface.secondary,
                          color: currentWidth === option.value 
                            ? 'white'
                            : theme.colors.semantic.text.secondary
                        }}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div 
                          className="font-medium"
                          style={{ color: theme.colors.semantic.text.primary }}
                        >
                          {option.label}
                        </div>
                        <div 
                          className="text-sm"
                          style={{ color: theme.colors.semantic.text.secondary }}
                        >
                          {option.description}
                        </div>
                        <div 
                          className="text-xs mt-1 font-mono"
                          style={{ color: theme.colors.semantic.text.tertiary }}
                        >
                          Max width: {option.maxWidth}
                        </div>
                      </div>
                      {currentWidth === option.value && (
                        <div 
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.colors.semantic.action.primary }}
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Settings Section */}
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Editor Preferences
              </h3>
              <div className="space-y-4">
                {/* Auto Save Toggle */}
                {onAutoSaveChange && (
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '30' }}>
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        Auto Save
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.secondary }}
                      >
                        Automatically save changes as you type
                      </div>
                    </div>
                    <button
                      onClick={() => onAutoSaveChange(!autoSave)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoSave ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ 
                        backgroundColor: autoSave 
                          ? theme.colors.semantic.action.primary
                          : theme.colors.semantic.surface.secondary
                      }}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoSave ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Show Preview Toggle */}
                {onShowPreviewChange && (
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '30' }}>
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        Show Preview
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.secondary }}
                      >
                        Display live preview of the MCQ
                      </div>
                    </div>
                    <button
                      onClick={() => onShowPreviewChange(!showPreview)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showPreview ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ 
                        backgroundColor: showPreview 
                          ? theme.colors.semantic.action.primary
                          : theme.colors.semantic.surface.secondary
                      }}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showPreview ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Points Toggle */}
                {onPointsEnabledChange && (
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '30' }}>
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        Enable Points
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.secondary }}
                      >
                        Show points field in question settings
                      </div>
                    </div>
                    <button
                      onClick={() => onPointsEnabledChange(!pointsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pointsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ 
                        backgroundColor: pointsEnabled 
                          ? theme.colors.semantic.action.primary
                          : theme.colors.semantic.surface.secondary
                      }}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pointsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Time Limit Toggle */}
                {onTimeLimitEnabledChange && (
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '30' }}>
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        Enable Time Limit
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.secondary }}
                      >
                        Show time limit field in question settings
                      </div>
                    </div>
                    <button
                      onClick={() => onTimeLimitEnabledChange(!timeLimitEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        timeLimitEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ 
                        backgroundColor: timeLimitEnabled 
                          ? theme.colors.semantic.action.primary
                          : theme.colors.semantic.surface.secondary
                      }}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          timeLimitEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQSettingsModal;