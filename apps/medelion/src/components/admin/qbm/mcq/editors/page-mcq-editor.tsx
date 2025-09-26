'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '@/theme';
import { MCQViewIcons } from '../../hierarchy';
import MCQHierarchyBreadcrumb, { HierarchyPath } from '../breadcrumb/mcq-hierarchy-breadcrumb';
import MCQSettingsModal, { MCQEditorWidth } from '../mcq-settings-modal';
import { RichTextEditor } from '../rich-text-editor/rich-text-editor';

export interface MCQData {
  id?: string;
  type: 'singleChoice' | 'multipleChoice' | 'trueFalse' | 'assertionReasoning';
  question: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  points?: number;
  timeLimit?: number; // in seconds
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  // For assertion-reasoning
  assertion?: string;
  reasoning?: string;
  assertionReasoningOptions?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface PageMCQEditorProps {
  mcqData?: Partial<MCQData>;
  onSave: (data: MCQData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  hierarchyContext?: {
    subject?: string;
    chapter?: string;
    topic?: string;
    subtopic?: string;
  };
}

// Stable default to prevent re-renders
const DEFAULT_MCQ_DATA: Partial<MCQData> = {};

export default function PageMCQEditor({
  mcqData = DEFAULT_MCQ_DATA,
  onSave,
  onCancel,
  isLoading = false,
  hierarchyContext
}: PageMCQEditorProps) {
  const { theme } = useTheme();
  
  // Memoize initial form data to prevent unnecessary re-renders
  const initialFormData = useMemo<MCQData>(() => ({
    type: 'singleChoice',
    question: '',
    explanation: '',
    difficulty: 'medium',
    tags: [],
    points: 1,
    timeLimit: 60,
    options: [
      { id: '1', text: '', isCorrect: true },
      { id: '2', text: '', isCorrect: false },
      { id: '3', text: '', isCorrect: false },
      { id: '4', text: '', isCorrect: false }
    ],
    assertion: '',
    reasoning: '',
    assertionReasoningOptions: [
      { id: 'A', text: 'Both assertion and reasoning are true and reasoning is the correct explanation', isCorrect: false },
      { id: 'B', text: 'Both assertion and reasoning are true but reasoning is not the correct explanation', isCorrect: false },
      { id: 'C', text: 'Assertion is true but reasoning is false', isCorrect: false },
      { id: 'D', text: 'Assertion is false but reasoning is true', isCorrect: false },
      { id: 'E', text: 'Both assertion and reasoning are false', isCorrect: false }
    ],
    ...mcqData
  }), [JSON.stringify(mcqData)]); // Use JSON.stringify to deep compare mcqData

  // Form state
  const [formData, setFormData] = useState<MCQData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  // Keep track of if we've initialized to prevent setting unsaved changes on mount
  const hasInitialized = useRef(false);
  
  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editorWidth, setEditorWidth] = useState<MCQEditorWidth>('moderate');
  const [autoSave, setAutoSave] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [pointsEnabled, setPointsEnabled] = useState(true);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);
  
    // Initialize hierarchy path from hierarchyContext
  const [hierarchyPath, setHierarchyPath] = useState<HierarchyPath>(() => {
    if (hierarchyContext) {
      return {
        // Note: In a real app, you'd convert hierarchyContext strings to HierarchyItem objects
        // This is just for demonstration
      };
    }
    return {};
  });

  // Get container max width based on editor width setting
  const getContainerMaxWidth = () => {
    switch (editorWidth) {
      case 'compact': return 'max-w-3xl';
      case 'moderate': return 'max-w-5xl';
      case 'full': return 'max-w-full px-8';
      default: return 'max-w-4xl';
    }
  };

  // Update form data when mcqData prop changes (but only when it actually changes)
  const mcqDataString = JSON.stringify(mcqData);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return; // Skip on initial mount since we already have initialFormData
    }
    
    // Only update if mcqData has meaningful content
    if (mcqData && Object.keys(mcqData).length > 0) {
      setFormData(prev => ({ ...prev, ...mcqData }));
    }
  }, [mcqDataString]); // Use stable string comparison

  // Mark as having unsaved changes when form data changes (but not on initial load)
  useEffect(() => {
    if (hasInitialized.current) {
      setHasUnsavedChanges(true);
    }
  }, [formData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }

    if (formData.type === 'assertionReasoning') {
      if (!formData.assertion?.trim()) {
        newErrors.assertion = 'Assertion is required';
      }
      if (!formData.reasoning?.trim()) {
        newErrors.reasoning = 'Reasoning is required';
      }
      // Check if at least one assertion-reasoning option is marked correct
      if (!formData.assertionReasoningOptions?.some(opt => opt.isCorrect)) {
        newErrors.assertionReasoningOptions = 'Please mark the correct option';
      }
    } else {
      // Validate regular options
      if (!formData.options?.some(opt => opt.text.trim())) {
        newErrors.options = 'At least one option is required';
      }
      
      if (formData.type === 'trueFalse') {
        // For true/false, ensure we have exactly 2 options
        const validOptions = formData.options?.filter(opt => opt.text.trim()) || [];
        if (validOptions.length !== 2) {
          newErrors.options = 'True/False questions must have exactly 2 options';
        }
      } else {
        // For single/multiple choice, ensure at least 2 options
        const validOptions = formData.options?.filter(opt => opt.text.trim()) || [];
        if (validOptions.length < 2) {
          newErrors.options = 'At least 2 options are required';
        }
      }

      // Check if correct answers are selected based on question type
      const correctOptions = formData.options?.filter(opt => opt.isCorrect && opt.text.trim()) || [];
      
      if (formData.type === 'singleChoice') {
        // Single choice: exactly one option should be selected
        if (correctOptions.length === 0) {
          newErrors.correctAnswer = 'Please select exactly one correct answer for single choice questions';
        } else if (correctOptions.length > 1) {
          newErrors.correctAnswer = 'Single choice questions can have only one correct answer';
        }
      } else if (formData.type === 'multipleChoice') {
        // Multiple choice: at least two options should be selected
        if (correctOptions.length === 0) {
          newErrors.correctAnswer = 'Please select at least two correct answers for multiple choice questions';
        } else if (correctOptions.length < 2) {
          newErrors.correctAnswer = 'Multiple choice questions must have at least two correct answers';
        }
      } else {
        // True/False and other types: at least one option should be selected
        if (correctOptions.length === 0) {
          newErrors.correctAnswer = 'Please mark at least one correct answer';
        }
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
      tags: formData.tags?.filter(tag => tag.trim()) || [],
      options: formData.type !== 'assertionReasoning' 
        ? formData.options?.filter(opt => opt.text.trim())
        : undefined,
      assertion: formData.type === 'assertionReasoning' ? formData.assertion?.trim() : undefined,
      reasoning: formData.type === 'assertionReasoning' ? formData.reasoning?.trim() : undefined,
      assertionReasoningOptions: formData.type === 'assertionReasoning' 
        ? formData.assertionReasoningOptions 
        : undefined
    };

    onSave(cleanedData);
    setHasUnsavedChanges(false);
  };

  const handleSaveAndAddNew = () => {
    if (!validateForm()) {
      return;
    }

    // Clean up the data before saving
    const cleanedData: MCQData = {
      ...formData,
      question: formData.question.trim(),
      explanation: formData.explanation?.trim() || '',
      tags: formData.tags?.filter(tag => tag.trim()) || [],
      options: formData.type !== 'assertionReasoning' 
        ? formData.options?.filter(opt => opt.text.trim())
        : undefined,
      assertion: formData.type === 'assertionReasoning' ? formData.assertion?.trim() : undefined,
      reasoning: formData.type === 'assertionReasoning' ? formData.reasoning?.trim() : undefined,
      assertionReasoningOptions: formData.type === 'assertionReasoning' 
        ? formData.assertionReasoningOptions 
        : undefined
    };

    onSave(cleanedData);
    setHasUnsavedChanges(false);
    
    // Reset form to create a new question
    setFormData(initialFormData);
    hasInitialized.current = false;
    // Reset initialization flag after a brief delay to prevent immediate unsaved changes detection
    setTimeout(() => hasInitialized.current = true, 100);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
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

  const handleTypeChange = (newType: MCQData['type']) => {
    let updatedOptions = formData.options;
    
    if (newType === 'trueFalse') {
      // Set up True/False options
      updatedOptions = [
        { id: '1', text: 'True', isCorrect: false },
        { id: '2', text: 'False', isCorrect: false }
      ];
    } else if (formData.type === 'trueFalse') {
      // Switching away from True/False to single/multiple choice, provide 4 options
      updatedOptions = [
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
      ];
    } else if ((newType === 'singleChoice' || newType === 'multipleChoice') && (formData.options?.length || 0) < 4) {
      // If switching to single/multiple choice and we have fewer than 4 options, extend to 4
      const currentOptions = formData.options || [];
      const optionsToAdd = 4 - currentOptions.length;
      const newOptions = [];
      
      for (let i = 0; i < optionsToAdd; i++) {
        newOptions.push({
          id: String(currentOptions.length + i + 1),
          text: '',
          isCorrect: false
        });
      }
      
      updatedOptions = [...currentOptions, ...newOptions];
    }
    
    updateFormData({ 
      type: newType,
      options: updatedOptions
    });
  };

  const updateOption = (optionId: string, updates: { text?: string; isCorrect?: boolean }) => {
    updateFormData({
      options: formData.options?.map(opt => 
        opt.id === optionId ? { ...opt, ...updates } : opt
      ) || []
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      updateFormData({
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData({
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const getTypeIcon = () => {
    switch (formData.type) {
      case 'singleChoice': return <MCQViewIcons.Question size={20} />;
      case 'multipleChoice': return <MCQViewIcons.Checklist size={20} />;
      case 'trueFalse': return <MCQViewIcons.Question size={20} />;
      case 'assertionReasoning': return <MCQViewIcons.Question size={20} />;
      default: return <MCQViewIcons.Question size={20} />;
    }
  };

  const getTypeName = () => {
    switch (formData.type) {
      case 'singleChoice': return 'Single Choice';
      case 'multipleChoice': return 'Multiple Choice';
      case 'trueFalse': return 'True/False';
      case 'assertionReasoning': return 'Assertion-Reasoning';
      default: return 'Question';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '20' }}>
        <div 
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            border: `2px solid ${theme.colors.semantic.border.secondary}30`
          }}
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-spin"
            style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
          >
            <MCQViewIcons.Edit size={32} color={theme.colors.semantic.status.info} />
          </div>
          <p className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
            Loading MCQ Editor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '20' }}>
      {/* Header */}
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
                  {getTypeIcon()}
                </div>
                <div>
                  <h1 
                    className="text-2xl font-bold"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Create {getTypeName()} Question
                  </h1>
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
            </div>

            <div className="flex items-center space-x-3">
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
              
              {/* Settings Button */}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-105"
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
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-sm"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary + '50',
                  border: `1px solid ${theme.colors.semantic.border.secondary}60`,
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
              
              <button
                onClick={handleSaveAndAddNew}
                disabled={isLoading}
                className="px-6 py-2 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.info}CC)`
                }}
              >
                {isLoading ? 'Saving...' : '💾➕ Save & Add New'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${getContainerMaxWidth()} mx-auto p-6 space-y-6`}>
        
        {/* Question Type Selector */}
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
            Question Type
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: 'singleChoice', label: 'Single Choice', icon: <MCQViewIcons.Question size={16} /> },
              { key: 'multipleChoice', label: 'Multiple Choice', icon: <MCQViewIcons.Checklist size={16} /> },
              { key: 'trueFalse', label: 'True/False', icon: <MCQViewIcons.Question size={16} /> },
              { key: 'assertionReasoning', label: 'Assertion-Reasoning', icon: <MCQViewIcons.Question size={16} /> }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => handleTypeChange(type.key as any)}
                className={`p-3 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 ${
                  formData.type === type.key ? 'shadow-md' : 'hover:shadow-sm'
                }`}
                style={{
                  backgroundColor: formData.type === type.key
                    ? theme.colors.semantic.status.info + '20'
                    : theme.colors.semantic.surface.secondary + '50',
                  border: formData.type === type.key
                    ? `1px solid ${theme.colors.semantic.status.info}40`
                    : `1px solid ${theme.colors.semantic.border.secondary}30`,
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
                  <div className="font-medium">{type.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hierarchy Breadcrumb */}
        <MCQHierarchyBreadcrumb
          hierarchyPath={hierarchyPath}
          onHierarchyChange={setHierarchyPath}
          showEditButton={true}
        />

        {/* Question Content */}
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
            Question Content
          </h2>
          
          <div className="space-y-4">
            
            {/* Main Question */}
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

            {/* Assertion-Reasoning Fields */}
            {formData.type === 'assertionReasoning' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Assertion *
                  </label>
                  <textarea
                    value={formData.assertion || ''}
                    onChange={(e) => updateFormData({ assertion: e.target.value })}
                    placeholder="Enter the assertion statement..."
                    rows={2}
                    className={`w-full p-3 rounded-lg border resize-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      errors.assertion ? 'border-red-400 focus:ring-red-400' : ''
                    }`}
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary + '30',
                      borderColor: errors.assertion 
                        ? theme.colors.semantic.status.error + '60'
                        : theme.colors.semantic.border.secondary + '40',
                      color: theme.colors.semantic.text.primary
                    }}
                  />
                  {errors.assertion && (
                    <p className="mt-1 text-xs" style={{ color: theme.colors.semantic.status.error }}>
                      {errors.assertion}
                    </p>
                  )}
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.colors.semantic.text.primary }}
                  >
                    Reasoning *
                  </label>
                  <textarea
                    value={formData.reasoning || ''}
                    onChange={(e) => updateFormData({ reasoning: e.target.value })}
                    placeholder="Enter the reasoning statement..."
                    rows={2}
                    className={`w-full p-3 rounded-lg border resize-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      errors.reasoning ? 'border-red-400 focus:ring-red-400' : ''
                    }`}
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary + '30',
                      borderColor: errors.reasoning 
                        ? theme.colors.semantic.status.error + '60'
                        : theme.colors.semantic.border.secondary + '40',
                      color: theme.colors.semantic.text.primary
                    }}
                  />
                  {errors.reasoning && (
                    <p className="mt-1 text-xs" style={{ color: theme.colors.semantic.status.error }}>
                      {errors.reasoning}
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Answer Options */}
        {formData.type === 'assertionReasoning' ? (
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
              Select Correct Answer *
            </h2>
            
            <div className="space-y-3">
              {formData.assertionReasoningOptions?.map((option) => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg transition-all cursor-pointer ${
                    option.isCorrect ? 'shadow-md' : 'hover:shadow-sm'
                  }`}
                  style={{
                    backgroundColor: option.isCorrect
                      ? theme.colors.semantic.status.success + '20'
                      : theme.colors.semantic.surface.secondary + '30',
                    border: option.isCorrect
                      ? `1px solid ${theme.colors.semantic.status.success}40`
                      : `1px solid ${theme.colors.semantic.border.secondary}30`
                  }}
                  onClick={() => {
                    updateFormData({
                      assertionReasoningOptions: formData.assertionReasoningOptions?.map(opt => 
                        ({ ...opt, isCorrect: opt.id === option.id })
                      ) || []
                    });
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{
                        border: option.isCorrect 
                          ? `2px solid ${theme.colors.semantic.status.success}`
                          : `2px solid ${theme.colors.semantic.border.secondary}`,
                        backgroundColor: option.isCorrect 
                          ? theme.colors.semantic.status.success 
                          : 'transparent'
                      }}
                    >
                      {option.isCorrect && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="font-semibold"
                          style={{ color: theme.colors.semantic.text.primary }}
                        >
                          {option.id}.
                        </span>
                        <span 
                          style={{ color: theme.colors.semantic.text.primary }}
                        >
                          {option.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {errors.assertionReasoningOptions && (
              <p className="mt-2 text-xs" style={{ color: theme.colors.semantic.status.error }}>
                {errors.assertionReasoningOptions}
              </p>
            )}
          </div>
        ) : (
          <div 
            className="rounded-xl p-6 border-2"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-lg font-semibold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Answer Options *
              </h2>
              
              {formData.type !== 'trueFalse' && (formData.options?.length || 0) < 6 && (
                <button
                  onClick={addOption}
                  className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm flex items-center space-x-1"
                  style={{
                    backgroundColor: theme.colors.semantic.status.info + '15',
                    border: `1px solid ${theme.colors.semantic.status.info}40`,
                    color: theme.colors.semantic.status.info
                  }}
                >
                  <span>+</span>
                  <span>Add Option</span>
                </button>
              )}
            </div>
            
            {/* True/False Options */}
            {formData.type === 'trueFalse' ? (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                  Select the correct answer:
                </p>
                <div className="flex space-x-4">
                  {[
                    { id: '1', label: 'True', value: 'True' },
                    { id: '2', label: 'False', value: 'False' }
                  ].map((option) => {
                    const isSelected = formData.options?.find(opt => opt.id === option.id)?.isCorrect || false;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          updateFormData({
                            options: formData.options?.map(opt => ({
                              ...opt,
                              isCorrect: opt.id === option.id
                            })) || []
                          });
                        }}
                        className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 ${
                          isSelected ? 'shadow-lg' : 'hover:shadow-md'
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? theme.colors.semantic.status.success + '20'
                            : theme.colors.semantic.surface.secondary + '30',
                          border: `2px solid ${isSelected 
                            ? theme.colors.semantic.status.success 
                            : theme.colors.semantic.border.secondary + '40'
                          }`,
                          color: isSelected
                            ? theme.colors.semantic.status.success
                            : theme.colors.semantic.text.primary
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              backgroundColor: isSelected 
                                ? theme.colors.semantic.status.success
                                : theme.colors.semantic.surface.tertiary,
                              color: isSelected 
                                ? theme.colors.semantic.surface.primary
                                : theme.colors.semantic.text.secondary
                            }}
                          >
                            {option.label[0]}
                          </div>
                          <span>{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Regular Options */
              <div className="space-y-3">
                {formData.options?.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 p-3 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary + '30',
                      border: `1px solid ${theme.colors.semantic.border.secondary}30`
                    }}
                  >
                    {/* Correct Answer Checkbox */}
                    <div className="flex-shrink-0">
                      <input
                        type={formData.type === 'singleChoice' ? 'radio' : 'checkbox'}
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={(e) => {
                          if (formData.type === 'singleChoice') {
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
                      {String.fromCharCode(65 + index)} {/* A, B, C, D... */}
                    </div>
                    
                    {/* Option Text Input */}
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(option.id, { text: e.target.value })}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1 p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{
                        backgroundColor: theme.colors.semantic.surface.primary,
                        border: `1px solid ${theme.colors.semantic.border.secondary}40`,
                        color: theme.colors.semantic.text.primary
                      }}
                    />
                    
                    {/* Remove Option Button */}
                    {(formData.options?.length || 0) > 2 && (
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
            )}
            
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
        )}

        {/* Explanation */}
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
            content={formData.explanation || ''}
            onChange={(content) => updateFormData({ explanation: content })}
            placeholder="Provide a detailed explanation for the correct answer..."
            minHeight="150px"
            maxLength={2000}
            showWordCount={true}
          />
        </div>

        {/* Question Settings */}
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
            Question Settings
          </h2>
          
          <div className={`grid grid-cols-1 gap-4 ${
            pointsEnabled && timeLimitEnabled ? 'md:grid-cols-3' :
            pointsEnabled || timeLimitEnabled ? 'md:grid-cols-2' :
            'md:grid-cols-1'
          }`}>
            
            {/* Difficulty */}
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
                className="w-full p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary + '30',
                  border: `1px solid ${theme.colors.semantic.border.secondary}40`,
                  color: theme.colors.semantic.text.primary
                }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            {/* Points - Only show if enabled */}
            {pointsEnabled && (
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
                  className="w-full p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary + '30',
                    border: `1px solid ${theme.colors.semantic.border.secondary}40`,
                    color: theme.colors.semantic.text.primary
                  }}
                />
              </div>
            )}
            
            {/* Time Limit - Only show if enabled */}
            {timeLimitEnabled && (
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Time Limit (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  step="10"
                  value={formData.timeLimit}
                  onChange={(e) => updateFormData({ timeLimit: parseInt(e.target.value) || 60 })}
                  className="w-full p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary + '30',
                    border: `1px solid ${theme.colors.semantic.border.secondary}40`,
                    color: theme.colors.semantic.text.primary
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
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
            Tags (Optional)
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
                style={{
                  backgroundColor: theme.colors.semantic.status.info + '20',
                  color: theme.colors.semantic.status.info
                }}
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:bg-red-100 rounded-full p-0.5 transition-all"
                  style={{ color: theme.colors.semantic.status.error }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add a tag..."
              className="flex-1 p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '30',
                border: `1px solid ${theme.colors.semantic.border.secondary}40`,
                color: theme.colors.semantic.text.primary
              }}
            />
            <button
              onClick={addTag}
              disabled={!newTag.trim()}
              className="px-4 py-2 rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.colors.semantic.status.info + '15',
                border: `1px solid ${theme.colors.semantic.status.info}40`,
                color: theme.colors.semantic.status.info
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* MCQ Settings Modal */}
      <MCQSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentWidth={editorWidth}
        onWidthChange={setEditorWidth}
        autoSave={autoSave}
        onAutoSaveChange={setAutoSave}
        showPreview={showPreview}
        onShowPreviewChange={setShowPreview}
        pointsEnabled={pointsEnabled}
        onPointsEnabledChange={setPointsEnabled}
        timeLimitEnabled={timeLimitEnabled}
        onTimeLimitEnabledChange={setTimeLimitEnabled}
      />
    </div>
  );
}