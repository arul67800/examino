'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { MCQViewIcons } from '@/components/admin/hierarchy';
import { MCQType } from '../types';

interface MCQEditorHeaderProps {
  questionType: MCQType;
  hierarchyContext?: {
    subject?: string;
    chapter?: string;
    topic?: string;
    subtopic?: string;
  } | {
    hierarchyItemId: string;
    hierarchyLevel: number;
    hierarchyName: string;
    hierarchyType: string;
    hierarchyChain?: any[];
    mode?: 'new' | 'edit';
    mcqId?: string;
  } | null;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  onSettingsClick: () => void;
  onCancel: () => void;
  onSave: () => void;
  onSaveAndAddNew: () => void;
}

const getTypeIcon = (type: MCQType) => {
  switch (type) {
    case 'singleChoice':
      return <MCQViewIcons.Question size={24} />;
    case 'multipleChoice':
      return <MCQViewIcons.Checklist size={24} />;
    case 'trueFalse':
      return <MCQViewIcons.Question size={24} />;
    case 'assertionReasoning':
      return <MCQViewIcons.Question size={24} />;
    default:
      return <MCQViewIcons.Question size={24} />;
  }
};

const getTypeName = (type: MCQType) => {
  switch (type) {
    case 'singleChoice':
      return 'Single Choice';
    case 'multipleChoice':
      return 'Multiple Choice';
    case 'trueFalse':
      return 'True/False';
    case 'assertionReasoning':
      return 'Assertion & Reasoning';
    default:
      return 'MCQ';
  }
};

export default function MCQEditorHeader({
  questionType,
  hierarchyContext,
  hasUnsavedChanges,
  isLoading,
  onSettingsClick,
  onCancel,
  onSave,
  onSaveAndAddNew
}: MCQEditorHeaderProps) {
  const { theme } = useTheme();

  return (
    <div 
      className="sticky top-0 backdrop-blur-sm"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary + 'E6',
        borderBottom: `1px solid ${theme.colors.semantic.border.secondary}30`,
        zIndex: 1
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
              >
                {getTypeIcon(questionType)}
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Create {getTypeName(questionType)} Question
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            {hasUnsavedChanges && (
              <div 
                className="px-3 py-1 rounded-full text-sm font-medium animate-pulse whitespace-nowrap"
                style={{ 
                  backgroundColor: theme.colors.semantic.status.warning + '20',
                  color: theme.colors.semantic.status.warning
                }}
              >
                Unsaved changes
              </div>
            )}
            
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-105 flex-shrink-0"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '50',
                borderColor: theme.colors.semantic.border.secondary + '60',
                color: theme.colors.semantic.text.secondary
              }}
              title="Editor Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '50',
                border: `1px solid ${theme.colors.semantic.border.secondary}60`,
                color: theme.colors.semantic.text.secondary
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={onSave}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap flex-shrink-0 min-w-[80px]"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.semantic.status.success}, ${theme.colors.semantic.status.success}CC)`
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  <span>Save</span>
                </>
              )}
            </button>
            
            <button
              onClick={onSaveAndAddNew}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap flex-shrink-0 min-w-[100px]"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.info}CC)`
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  <span>Save+</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
