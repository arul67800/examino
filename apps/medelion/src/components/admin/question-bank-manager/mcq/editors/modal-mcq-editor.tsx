'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/theme';
import { MCQViewIcons } from '@/components/admin/hierarchy';
import { RichTextEditor } from '../rich-text-editor/rich-text-editor';
import MCQHierarchyBreadcrumb, { HierarchyPath } from '../breadcrumb/mcq-hierarchy-breadcrumb';
import { MCQData } from './common/types';
import { FormSectionWrapper } from './common/components';
import { useToast } from '@/components/ui/toast';

interface ModalMCQEditorProps {
  isOpen: boolean;
  onClose: () => void;
  mcqData?: Partial<MCQData>;
  onSave: (data: MCQData) => void;
  onExpandToPage?: () => void;
  isLoading?: boolean;
  title?: string;
  hierarchyContext?: {
    subject?: string;
    chapter?: string;
    topic?: string;
    subtopic?: string;
  };
}

export default function ModalMCQEditor({
  isOpen,
  onClose,
  mcqData = {},
  onSave,
  onExpandToPage,
  isLoading = false,
  title,
  hierarchyContext
}: ModalMCQEditorProps) {
  const { theme } = useTheme();
  
  // Form state
  const [formData, setFormData] = useState<MCQData>({
    type: 'singleChoice',
    question: '',
    explanation: '',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: '1', text: '', isCorrect: true },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false }
    ],
    ...mcqData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Initialize hierarchy path from hierarchyContext
  const [hierarchyPath, setHierarchyPath] = useState<HierarchyPath>(() => {
    if (hierarchyContext) {
      return {
        // Note: In a real app, you'd convert hierarchyContext strings to HierarchyItem objects
        // For now, we'll leave this empty and the user can select manually
      };
    }
    return {};
  });

  // Update form data when mcqData prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, ...mcqData }));
  }, [mcqData]);

  // Mark as having unsaved changes when form data changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }

    // Validate options
    const validOptions = formData.options?.filter(opt => opt.text.trim()) || [];
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    // Check if at least one option is marked correct
    if (!formData.options?.some(opt => opt.isCorrect && opt.text.trim())) {
      newErrors.correctAnswer = 'Please mark the correct answer';
    }

    // For single choice, ensure only one correct answer
    if (formData.type === 'singleChoice') {
      const correctCount = formData.options?.filter(opt => opt.isCorrect && opt.text.trim()).length || 0;
      if (correctCount > 1) {
        newErrors.correctAnswer = 'Single choice questions can have only one correct answer';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Clean up the data before saving
    const cleanedData: MCQData = {
      ...formData,
      question: formData.question.trim(),
      explanation: formData.explanation?.trim() || '',
      options: formData.options?.filter(opt => opt.text.trim())
    };

    onSave(cleanedData);
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    onClose();
  };

  const updateFormData = (updates: Partial<MCQData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addOption = () => {
    const newOption = {
      id: String(Date.now()),
      text: '',
      isCorrect: false
    };
    updateFormData({
      options: [...(formData.options || []), newOption]
    });
  };

  const removeOption = (optionId: string) => {
    updateFormData({
      options: formData.options?.filter(opt => opt.id !== optionId) || []
    });
  };

  const updateOption = (optionId: string, updates: { text?: string; isCorrect?: boolean }) => {
    updateFormData({
      options: formData.options?.map(opt => 
        opt.id === optionId ? { ...opt, ...updates } : opt
      ) || []
    });
  };

  const getTypeIcon = () => {
    switch (formData.type) {
      case 'singleChoice': return <MCQViewIcons.Question size={20} />;
      case 'multipleChoice': return <MCQViewIcons.Checklist size={20} />;
      case 'trueFalse': return <MCQViewIcons.Question size={20} />;
      default: return <MCQViewIcons.Question size={20} />;
    }
  };

  const getTypeName = () => {
    switch (formData.type) {
      case 'singleChoice': return 'Single Choice';
      case 'multipleChoice': return 'Multiple Choice';
      case 'trueFalse': return 'True/False';
      default: return 'Question';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border-2 shadow-2xl"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary + '30',
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
              >
                <MCQViewIcons.Modal size={24} color={theme.colors.semantic.status.info} />
              </div>
              <div>
                <h2 
                  className="text-xl font-bold"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {title || `${mcqData.id ? 'Edit' : 'Create'} ${getTypeName()} Question`}
                </h2>
                {hierarchyContext && (
                  <p 
                    className="text-sm"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {[hierarchyContext.subject, hierarchyContext.chapter, hierarchyContext.topic, hierarchyContext.subtopic]
                      .filter(Boolean).join(' → ')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <div 
                  className="px-3 py-1 rounded-full text-sm font-medium animate-pulse"
                  style={{ 
                    backgroundColor: theme.colors.semantic.status.warning + '20',
                    color: theme.colors.semantic.status.warning
                  }}
                >
                  Unsaved changes
                </div>
              )}
              
              {onExpandToPage && (
                <button
                  onClick={() => {
                    onExpandToPage();
                    onClose();
                  }}
                  className="p-2 rounded-lg border transition-all duration-200 hover:shadow-sm"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary + '50',
                    borderColor: theme.colors.semantic.border.secondary + '40',
                    color: theme.colors.semantic.text.secondary
                  }}
                  title="Expand to full page editor"
                >
                  <MCQViewIcons.Page size={18} />
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="p-2 rounded-lg border transition-all duration-200 hover:shadow-sm"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary + '50',
                  borderColor: theme.colors.semantic.border.secondary + '40',
                  color: theme.colors.semantic.text.secondary
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Hierarchy Breadcrumb */}
          <div className="px-6 pt-4">
            <MCQHierarchyBreadcrumb
              hierarchyPath={hierarchyPath}
              onHierarchyChange={setHierarchyPath}
              showEditButton={true}
            />
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
            
            {/* Question Type Selector */}
            <div>
              <h3 
                className="text-lg font-semibold mb-3"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Question Type
              </h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: 'singleChoice', label: 'Single Choice', icon: <MCQViewIcons.Question size={16} /> },
                  { key: 'multipleChoice', label: 'Multiple Choice', icon: <MCQViewIcons.Checklist size={16} /> },
                  { key: 'trueFalse', label: 'True/False', icon: <MCQViewIcons.Question size={16} /> },
                  { key: 'assertionReasoning', label: 'Assertion-Reasoning', icon: <MCQViewIcons.Question size={16} /> }
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => updateFormData({ type: type.key as any })}
                    className={`p-3 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 ${
                      formData.type === type.key ? 'shadow-md' : 'hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: formData.type === type.key
                        ? theme.colors.semantic.status.info + '20'
                        : theme.colors.semantic.surface.secondary + '50',
                      borderColor: formData.type === type.key
                        ? theme.colors.semantic.status.info + '40'
                        : theme.colors.semantic.border.secondary + '30',
                      border: '1px solid',
                      color: formData.type === type.key
                        ? theme.colors.semantic.status.info
                        : theme.colors.semantic.text.primary
                    }}
                  >
                    <div style={{ 
                      color: formData.type === type.key
                        ? theme.colors.semantic.status.info
                        : theme.colors.semantic.text.secondary 
                    }}>
                      {type.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{type.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Content */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Question *
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => updateFormData({ question: e.target.value })}
                placeholder="Enter your question here..."
                rows={3}
                className={`w-full p-3 rounded-lg border resize-none focus:ring-2 focus:ring-offset-2 transition-all ${
                  errors.question ? 'border-red-400 focus:ring-red-400' : ''
                }`}
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary + '30',
                  borderColor: errors.question 
                    ? theme.colors.semantic.status.error + '60'
                    : theme.colors.semantic.border.secondary + '40',
                  color: theme.colors.semantic.text.primary
                }}
              />
              {errors.question && (
                <p className="mt-1 text-xs" style={{ color: theme.colors.semantic.status.error }}>
                  {errors.question}
                </p>
              )}
            </div>

            {/* Answer Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Answer Options *
                </label>
                
                {formData.type !== 'trueFalse' && (formData.options?.length || 0) < 6 && (
                  <button
                    onClick={addOption}
                    className="px-3 py-1 rounded-lg text-sm font-medium border transition-all duration-200 hover:shadow-sm flex items-center space-x-1"
                    style={{
                      backgroundColor: theme.colors.semantic.status.info + '15',
                      borderColor: theme.colors.semantic.status.info + '40',
                      color: theme.colors.semantic.status.info
                    }}
                  >
                    <span>+</span>
                    <span>Add Option</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {formData.options?.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary + '30',
                      borderColor: theme.colors.semantic.border.secondary + '30'
                    }}
                  >
                    {/* Correct Answer Checkbox */}
                    <div className="flex-shrink-0">
                      <input
                        type={formData.type === 'singleChoice' || formData.type === 'trueFalse' ? 'radio' : 'checkbox'}
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={(e) => {
                          if (formData.type === 'singleChoice' || formData.type === 'trueFalse') {
                            // For single choice, uncheck all others
                            updateFormData({
                              options: formData.options?.map(opt => 
                                ({ ...opt, isCorrect: opt.id === option.id })
                              ) || []
                            });
                          } else {
                            // For multiple choice, toggle this option
                            updateOption(option.id, { isCorrect: e.target.checked });
                          }
                        }}
                        className="w-4 h-4"
                        style={{ accentColor: theme.colors.semantic.status.success }}
                      />
                    </div>
                    
                    {/* Option Letter/Number */}
                    <div 
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{
                        backgroundColor: option.isCorrect 
                          ? theme.colors.semantic.status.success + '20'
                          : theme.colors.semantic.surface.tertiary + '50',
                        color: option.isCorrect 
                          ? theme.colors.semantic.status.success
                          : theme.colors.semantic.text.secondary
                      }}
                    >
                      {formData.type === 'trueFalse' 
                        ? (index === 0 ? 'T' : 'F')
                        : String.fromCharCode(65 + index) // A, B, C, D...
                      }
                    </div>
                    
                    {/* Option Text Input */}
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(option.id, { text: e.target.value })}
                      placeholder={formData.type === 'trueFalse' 
                        ? (index === 0 ? 'True' : 'False')
                        : `Option ${String.fromCharCode(65 + index)}`
                      }
                      className="flex-1 p-2 rounded border focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: theme.colors.semantic.surface.primary,
                        borderColor: theme.colors.semantic.border.secondary + '40',
                        color: theme.colors.semantic.text.primary
                      }}
                    />
                    
                    {/* Add Option Button */}
                    {formData.type !== 'trueFalse' && (formData.options?.length || 0) < 6 && (
                      <button
                        onClick={() => {
                          const newOption = {
                            id: String(Date.now()),
                            text: '',
                            isCorrect: false
                          };
                          const currentOptions = formData.options || [];
                          const newOptions = [...currentOptions];
                          newOptions.splice(index + 1, 0, newOption);
                          updateFormData({ options: newOptions });
                        }}
                        className="flex-shrink-0 p-1 rounded hover:bg-green-100 transition-all"
                        style={{ color: theme.colors.semantic.status.success }}
                        title="Add option after this one"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Remove Option Button */}
                    {formData.type !== 'trueFalse' && (formData.options?.length || 0) > 2 && (
                      <button
                        onClick={() => removeOption(option.id)}
                        className="flex-shrink-0 p-1 rounded hover:bg-red-100 transition-all"
                        style={{ color: theme.colors.semantic.status.error }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {(errors.options || errors.correctAnswer) && (
                <div className="mt-2 space-y-1">
                  {errors.options && (
                    <p className="text-xs" style={{ color: theme.colors.semantic.status.error }}>
                      {errors.options}
                    </p>
                  )}
                  {errors.correctAnswer && (
                    <p className="text-xs" style={{ color: theme.colors.semantic.status.error }}>
                      {errors.correctAnswer}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Explanation */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Explanation (Optional)
              </label>
              <textarea
                value={formData.explanation || ''}
                onChange={(e) => updateFormData({ explanation: e.target.value })}
                placeholder="Provide a detailed explanation for the correct answer..."
                rows={2}
                className="w-full p-3 rounded-lg border resize-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary + '30',
                  borderColor: theme.colors.semantic.border.secondary + '40',
                  color: theme.colors.semantic.text.primary
                }}
              />
            </div>

            {/* Quick Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => updateFormData({ difficulty: e.target.value as any })}
                  className="w-full p-2 rounded border focus:ring-2 focus:ring-offset-1 transition-all"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary + '30',
                    borderColor: theme.colors.semantic.border.secondary + '40',
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
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
                  max="10"
                  value={formData.points}
                  onChange={(e) => updateFormData({ points: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 rounded border focus:ring-2 focus:ring-offset-1 transition-all"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary + '30',
                    borderColor: theme.colors.semantic.border.secondary + '40',
                    color: theme.colors.semantic.text.primary
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="flex items-center justify-end space-x-3 p-6 border-t"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary + '30',
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg font-medium border transition-all duration-200 hover:shadow-sm"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '50',
                borderColor: theme.colors.semantic.border.secondary + '60',
                color: theme.colors.semantic.text.secondary
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.semantic.status.success}, ${theme.colors.semantic.status.success}CC)`
              }}
            >
              {isLoading ? 'Saving...' : '💾 Save Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}