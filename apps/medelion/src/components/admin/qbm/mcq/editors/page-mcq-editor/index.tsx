'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '@/theme';
import MCQSettingsModal, { MCQEditorWidth } from '../../mcq-settings-modal';
import {
  MCQEditorHeader,
  QuestionTypeSelector,
  QuestionContent,
  AnswerOptions,
  ExplanationSection,
  QuestionSettings,
  TagsSection,
  MCQEditorProps
} from '../common';
import { useMCQForm } from './hooks/useMCQForm';

// Stable default to prevent re-renders
const DEFAULT_MCQ_DATA = {};

export default function PageMCQEditor({
  mcqData = DEFAULT_MCQ_DATA,
  onSave,
  onCancel,
  isLoading = false,
  hierarchyContext
}: MCQEditorProps) {
  const { theme } = useTheme();
  
  // Form state management
  const {
    formData,
    errors,
    hasUnsavedChanges,
    updateFormData,
    handleTypeChange,
    addOption,
    removeOption,
    addTag,
    removeTag,
    validateForm,
    resetForm,
    clearUnsavedChanges
  } = useMCQForm({ initialData: mcqData });

  // UI state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editorWidth, setEditorWidth] = useState<MCQEditorWidth>('normal');
  const [autoSave, setAutoSave] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [pointsEnabled, setPointsEnabled] = useState(true);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);

  // Container width based on editor settings
  const getContainerMaxWidth = () => {
    switch (editorWidth) {
      case 'compact': return 'max-w-4xl';
      case 'wide': return 'max-w-full';
      case 'normal':
      default: return 'max-w-6xl';
    }
  };

  // Handle save operations
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Clean up the data before saving
    const cleanedData = {
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
    clearUnsavedChanges();
  };

  const handleSaveAndAddNew = () => {
    if (!validateForm()) {
      return;
    }

    // Clean up the data before saving
    const cleanedData = {
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
    resetForm();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }
    
    onCancel?.();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '20' }}>
        <div 
          className="p-8 rounded-xl shadow-lg border-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            border: `2px solid ${theme.colors.semantic.border.secondary}30`
          }}
        >
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.status.info + '20' }}
            >
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: theme.colors.semantic.status.info }}></div>
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
                Loading MCQ Editor...
              </h2>
              <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                Please wait while we prepare your workspace
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.semantic.surface.secondary + '20' }}>
      {/* Header */}
      <MCQEditorHeader
        questionType={formData.type}
        hierarchyContext={hierarchyContext}
        hasUnsavedChanges={hasUnsavedChanges}
        isLoading={isLoading}
        onSettingsClick={() => setShowSettingsModal(true)}
        onCancel={handleCancel}
        onSave={handleSave}
        onSaveAndAddNew={handleSaveAndAddNew}
      />

      {/* Content */}
      <div className={`${getContainerMaxWidth()} mx-auto p-6 space-y-6`}>
        
        {/* Question Type Selector */}
        <QuestionTypeSelector
          selectedType={formData.type}
          onTypeChange={handleTypeChange}
        />

        {/* Question Content */}
        <QuestionContent
          questionType={formData.type}
          question={formData.question}
          assertion={formData.assertion}
          reasoning={formData.reasoning}
          errors={errors}
          onQuestionChange={(content) => updateFormData({ question: content })}
          onAssertionChange={(content) => updateFormData({ assertion: content })}
          onReasoningChange={(content) => updateFormData({ reasoning: content })}
        />

        {/* Answer Options */}
        <AnswerOptions
          questionType={formData.type}
          options={formData.options}
          assertionReasoningOptions={formData.assertionReasoningOptions}
          errors={errors}
          onOptionsChange={(options) => updateFormData({ options })}
          onAssertionReasoningOptionsChange={(options) => updateFormData({ assertionReasoningOptions: options })}
          onAddOption={addOption}
          onRemoveOption={removeOption}
        />

        {/* Explanation */}
        <ExplanationSection
          explanation={formData.explanation || ''}
          onExplanationChange={(content) => updateFormData({ explanation: content })}
        />

        {/* Question Settings */}
        <QuestionSettings
          points={formData.points}
          timeLimit={formData.timeLimit}
          difficulty={formData.difficulty}
          pointsEnabled={pointsEnabled}
          timeLimitEnabled={timeLimitEnabled}
          onPointsChange={(points) => updateFormData({ points })}
          onTimeLimitChange={(timeLimit) => updateFormData({ timeLimit })}
          onDifficultyChange={(difficulty) => updateFormData({ difficulty })}
        />

        {/* Tags */}
        <TagsSection
          tags={formData.tags || []}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />
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