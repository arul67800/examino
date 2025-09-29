'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/theme';
import { MCQViewIcons } from '@/components/admin/hierarchy';
import { RichTextEditor } from '../rich-text-editor/rich-text-editor';
import MCQHierarchyBreadcrumb, { HierarchyPath } from '../breadcrumb/mcq-hierarchy-breadcrumb';
import { MCQData } from './common/types';
import { FormSectionWrapper } from './common/components';
import { useToast } from '@/components/ui/toast';

interface InlineMCQEditorProps {
  mcqData?: Partial<MCQData>;
  onSave: (data: MCQData) => void;
  onCancel?: () => void;
  onExpand?: () => void; // To expand to full page editor
  isLoading?: boolean;
  compact?: boolean;
  showExpandButton?: boolean;
  hierarchyContext?: {
    subject?: string;
    chapter?: string;
    topic?: string;
    subtopic?: string;
  };
}

export default function InlineMCQEditor({
  mcqData = {},
  onSave,
  onCancel,
  onExpand,
  isLoading = false,
  compact = false,
  showExpandButton = true,
  hierarchyContext
}: InlineMCQEditorProps) {
  const { theme } = useTheme();
  
  // Form state - simplified for inline editing
  const [formData, setFormData] = useState<MCQData>({
    type: 'singleChoice',
    question: '',
    explanation: '',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: '1', text: '', isCorrect: true },
      { id: '2', text: '', isCorrect: false }
    ],
    ...mcqData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  };

  const handleCancel = () => {
    const hasChanges = formData.question !== (mcqData.question || '') || 
                      (formData.options?.some((opt, idx) => 
                        opt.text !== (mcqData.options?.[idx]?.text || '') ||
                        opt.isCorrect !== (mcqData.options?.[idx]?.isCorrect || false)
                      ) || false);

    if (hasChanges) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }
    onCancel?.();
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
      case 'singleChoice': return <MCQViewIcons.Question size={16} />;
      case 'multipleChoice': return <MCQViewIcons.Checklist size={16} />;
      case 'trueFalse': return <MCQViewIcons.Question size={16} />;
      default: return <MCQViewIcons.Question size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div 
        className="rounded-lg p-6 border-2 text-center animate-pulse"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.secondary + '30'
        }}
      >
        <div 
          className="w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
        >
          <MCQViewIcons.Edit size={16} color={theme.colors.semantic.status.info} />
        </div>
        <p className="text-sm font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
          Loading editor...
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-lg border-2 ${compact ? 'p-4' : 'p-6'} space-y-4`}
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.secondary + '30'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
          >
            {getTypeIcon()}
          </div>
          <div>
            <h3 
              className={`font-semibold ${compact ? 'text-sm' : 'text-lg'}`}
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {mcqData.id ? 'Edit' : 'Create'} MCQ
            </h3>
            {hierarchyContext && (
              <p 
                className="text-xs"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                {[hierarchyContext.topic, hierarchyContext.subtopic].filter(Boolean).join(' → ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showExpandButton && onExpand && (
            <button
              onClick={onExpand}
              className="p-2 rounded-lg border transition-all duration-200 hover:shadow-sm"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '50',
                borderColor: theme.colors.semantic.border.secondary + '40',
                color: theme.colors.semantic.text.secondary
              }}
              title="Expand to full editor"
            >
              <MCQViewIcons.Page size={14} />
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg border transition-all duration-200 hover:shadow-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary + '50',
              borderColor: theme.colors.semantic.border.secondary + '40',
              color: theme.colors.semantic.text.secondary
            }}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hierarchy Breadcrumb */}
      <MCQHierarchyBreadcrumb
        hierarchyPath={hierarchyPath}
        onHierarchyChange={setHierarchyPath}
        showEditButton={true}
        compact={compact}
      />

      {/* Question Type Quick Selector */}
      {(isExpanded || !compact) && (
        <div className="flex space-x-2">
          {[
            { key: 'singleChoice', label: 'Single', icon: <MCQViewIcons.Question size={12} /> },
            { key: 'multipleChoice', label: 'Multiple', icon: <MCQViewIcons.Checklist size={12} /> },
            { key: 'trueFalse', label: 'T/F', icon: <MCQViewIcons.Question size={12} /> }
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => updateFormData({ type: type.key as any })}
              className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1 ${
                formData.type === type.key ? 'shadow-sm' : 'hover:shadow-sm'
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
                  : theme.colors.semantic.text.secondary
              }}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Question Input */}
      <div>
        <label 
          className={`block font-medium mb-2 ${compact ? 'text-sm' : 'text-sm'}`}
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Question *
        </label>
        <textarea
          value={formData.question}
          onChange={(e) => updateFormData({ question: e.target.value })}
          placeholder="Enter your question..."
          rows={compact ? 2 : 3}
          className={`w-full p-2 rounded border resize-none focus:ring-2 focus:ring-offset-1 transition-all ${
            errors.question ? 'border-red-400 focus:ring-red-400' : ''
          }`}
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary + '30',
            borderColor: errors.question 
              ? theme.colors.semantic.status.error + '60'
              : theme.colors.semantic.border.secondary + '40',
            color: theme.colors.semantic.text.primary,
            fontSize: compact ? '13px' : '14px'
          }}
        />
        {errors.question && (
          <p className="mt-1 text-xs" style={{ color: theme.colors.semantic.status.error }}>
            {errors.question}
          </p>
        )}
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label 
            className={`font-medium ${compact ? 'text-sm' : 'text-sm'}`}
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Options *
          </label>
          
          {formData.type !== 'trueFalse' && (formData.options?.length || 0) < 4 && (
            <button
              onClick={addOption}
              className="px-2 py-1 rounded text-xs font-medium border transition-all hover:shadow-sm"
              style={{
                backgroundColor: theme.colors.semantic.status.info + '15',
                borderColor: theme.colors.semantic.status.info + '40',
                color: theme.colors.semantic.status.info
              }}
            >
              + Option
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {formData.options?.slice(0, isExpanded ? undefined : (compact ? 2 : 4)).map((option, index) => (
            <div
              key={option.id}
              className="flex items-center space-x-2 p-2 rounded border"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '30',
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              {/* Correct Answer Radio/Checkbox */}
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
                className="w-3 h-3"
                style={{ accentColor: theme.colors.semantic.status.success }}
              />
              
              {/* Option Letter */}
              <div 
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold`}
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
                  : String.fromCharCode(65 + index)
                }
              </div>
              
              {/* Option Text */}
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOption(option.id, { text: e.target.value })}
                placeholder={formData.type === 'trueFalse' 
                  ? (index === 0 ? 'True' : 'False')
                  : `Option ${String.fromCharCode(65 + index)}`
                }
                className="flex-1 p-1 rounded border focus:ring-1 focus:ring-offset-1 transition-all text-sm"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.secondary + '40',
                  color: theme.colors.semantic.text.primary
                }}
              />
              
              {/* Add Option Button */}
              {formData.type !== 'trueFalse' && (formData.options?.length || 0) < 4 && (
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
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              
              {/* Remove Option */}
              {formData.type !== 'trueFalse' && (formData.options?.length || 0) > 2 && (
                <button
                  onClick={() => removeOption(option.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-red-100 transition-all"
                  style={{ color: theme.colors.semantic.status.error }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          
          {!isExpanded && (formData.options?.length || 0) > (compact ? 2 : 4) && (
            <div className="text-center">
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs font-medium px-2 py-1 rounded border transition-all"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary + '50',
                  borderColor: theme.colors.semantic.border.secondary + '40',
                  color: theme.colors.semantic.text.secondary
                }}
              >
                Show {(formData.options?.length || 0) - (compact ? 2 : 4)} more options...
              </button>
            </div>
          )}
        </div>
        
        {(errors.options || errors.correctAnswer) && (
          <div className="mt-1 space-y-1">
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

      {/* Explanation - only shown when expanded */}
      {isExpanded && (
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
            placeholder="Brief explanation..."
            rows={2}
            className="w-full p-2 rounded border resize-none focus:ring-2 focus:ring-offset-1 transition-all text-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary + '30',
              borderColor: theme.colors.semantic.border.secondary + '40',
              color: theme.colors.semantic.text.primary
            }}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: theme.colors.semantic.border.secondary + '20' }}>
        <button
          onClick={handleCancel}
          className={`px-3 py-1 rounded font-medium border transition-all hover:shadow-sm ${compact ? 'text-xs' : 'text-sm'}`}
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
          className={`px-4 py-1 rounded font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${compact ? 'text-xs' : 'text-sm'}`}
          style={{
            background: `linear-gradient(135deg, ${theme.colors.semantic.status.success}, ${theme.colors.semantic.status.success}CC)`
          }}
        >
          {isLoading ? 'Saving...' : '💾 Save'}
        </button>
      </div>
    </div>
  );
}