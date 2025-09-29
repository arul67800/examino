'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/theme';
import { useToast } from '@/components/ui/toast';
import { DeleteConfirmationModal } from '@/components/admin/hierarchy';
import MCQSettingsModal, { MCQEditorWidth } from '../../mcq-settings-modal';
import MCQHierarchyBreadcrumb, { HierarchyPath } from '../../breadcrumb/mcq-hierarchy-breadcrumb';
import {
  MCQEditorHeader,
  QuestionTypeSelector,
  QuestionContent,
  AnswerOptions,
  ExplanationSection,
  QuestionSettings,
  TagsSection,
  FormSectionWrapper,
  MCQEditorProps
} from '../common';
import { useEnhancedMCQForm } from '../common/hooks';

// Stable default to prevent re-renders
const DEFAULT_MCQ_DATA = {};

export default function PageMCQEditor({
  mcqData = DEFAULT_MCQ_DATA,
  onSave,
  onCancel,
  isLoading = false,
  hierarchyContext,
  onHierarchyChange
}: MCQEditorProps) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  
  // Hierarchy selection state
  const [hierarchyPath, setHierarchyPath] = useState<HierarchyPath>(() => {
    console.log('PageMCQEditor: Initializing hierarchyPath with hierarchyContext:', hierarchyContext);
    
    // Initialize from existing hierarchy context if available
    if (hierarchyContext && 'hierarchyChain' in hierarchyContext && hierarchyContext.hierarchyChain) {
      const chain = hierarchyContext.hierarchyChain;
      console.log('PageMCQEditor: Found hierarchy chain with', chain.length, 'items:', chain);
      
      const path: HierarchyPath = {
        // Set the hierarchy type from context - this is crucial for proper initialization
        hierarchyType: hierarchyContext.hierarchyType as 'question-bank' | 'previous-papers'
      };
      
      chain.forEach((item: any) => {
        switch (item.level) {
          case 1: // Year/Exam (depending on hierarchy type)
            path.year = item;
            break;
          case 2: // Subject/Year
            path.subject = item;
            break;
          case 3: // Part/Subject
            path.part = item;
            break;
          case 4: // Section  
            path.section = item;
            break;
          case 5: // Chapter
            path.chapter = item;
            break;
        }
      });

      // If mode is 'new', automatically set MCQ level to "new-mcq"
      if (hierarchyContext.mode === 'new') {
        path.mcq = {
          id: 'new-mcq',
          name: 'Create New MCQ',
          level: 6,
          type: 'MCQ',
          color: '#3B82F6', // Blue color for new MCQ
          order: 0,
          questionCount: 0,
          parentId: hierarchyContext.hierarchyItemId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [],
          isPublished: false
        };
        console.log('PageMCQEditor: Auto-selected "new-mcq" based on mode=new');
      }
      
      console.log('PageMCQEditor: Initialized hierarchy path from context:', {
        hierarchyType: path.hierarchyType,
        chainLength: chain.length,
        mode: hierarchyContext.mode,
        autoSelectedNewMCQ: hierarchyContext.mode === 'new',
        mcqItem: path.mcq,
        levels: Object.keys(path).filter(key => key !== 'hierarchyType' && path[key as keyof HierarchyPath])
      });
      
      return path;
    } else if (hierarchyContext && 'hierarchyItemId' in hierarchyContext && hierarchyContext.hierarchyItemId) {
      // If we have hierarchy context but no chain, create a minimal path
      console.log('PageMCQEditor: No hierarchy chain, but have hierarchy item info. Creating minimal path from:', hierarchyContext);
      
      const path: HierarchyPath = {
        hierarchyType: hierarchyContext.hierarchyType as 'question-bank' | 'previous-papers'
      };

      // Create a minimal item from the hierarchy context
      const hierarchyItem = {
        id: hierarchyContext.hierarchyItemId,
        name: hierarchyContext.hierarchyName,
        level: hierarchyContext.hierarchyLevel,
        type: hierarchyContext.hierarchyType === 'previous-papers' ? 
          (hierarchyContext.hierarchyLevel === 1 ? 'Exam' :
           hierarchyContext.hierarchyLevel === 2 ? 'Year' :
           hierarchyContext.hierarchyLevel === 3 ? 'Subject' :
           hierarchyContext.hierarchyLevel === 4 ? 'Section' : 'Chapter') :
          (hierarchyContext.hierarchyLevel === 1 ? 'Year' :
           hierarchyContext.hierarchyLevel === 2 ? 'Subject' :
           hierarchyContext.hierarchyLevel === 3 ? 'Part' :
           hierarchyContext.hierarchyLevel === 4 ? 'Section' : 'Chapter'),
        color: '#059669', // Default color
        order: 0,
        questionCount: 0,
        parentId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: [],
        isPublished: false
      };

      // Place the item at the correct level in the path
      switch (hierarchyContext.hierarchyLevel) {
        case 1:
          path.year = hierarchyItem;
          break;
        case 2:
          path.subject = hierarchyItem;
          break;
        case 3:
          path.part = hierarchyItem;
          break;
        case 4:
          path.section = hierarchyItem;
          break;
        case 5:
          path.chapter = hierarchyItem;
          break;
      }

      // If mode is 'new', add the MCQ item
      if (hierarchyContext.mode === 'new') {
        path.mcq = {
          id: 'new-mcq',
          name: 'Create New MCQ',
          level: 6,
          type: 'MCQ',
          color: '#3B82F6',
          order: 0,
          questionCount: 0,
          parentId: hierarchyContext.hierarchyItemId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [],
          isPublished: false
        };
        console.log('PageMCQEditor: Auto-selected "new-mcq" based on mode=new (minimal path)');
      }

      console.log('PageMCQEditor: Created minimal hierarchy path:', path);
      return path;
    } else {
      console.log('PageMCQEditor: No valid hierarchy context found, using empty path');
    }
    return {};
  });
  
  // Form state management with enhanced validation
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
    addSourceTag,
    removeSourceTag,
    addExamTag,
    removeExamTag,
    validateFormWithScrolling,
    handleSaveWithValidation,
    getSectionValidationState,
    createSectionRef,
    triggerSectionValidation,
    resetForm,
    clearUnsavedChanges,
    getValidationSummary
  } = useEnhancedMCQForm({ 
    initialData: mcqData,
    hierarchyPath,
    enableRealTimeValidation: true,
    autoScrollToErrors: true
  });

  // Update hierarchy path when context changes (for async hierarchy type detection)
  useEffect(() => {
    if (hierarchyContext && 'hierarchyChain' in hierarchyContext && hierarchyContext.hierarchyChain) {
      const chain = hierarchyContext.hierarchyChain;
      
      // Start with current hierarchyPath to preserve existing selections (especially mcq)
      const newPath: HierarchyPath = {
        ...hierarchyPath, // Preserve existing selections
        hierarchyType: hierarchyContext.hierarchyType as 'question-bank' | 'previous-papers'
      };
      
      // Only update the hierarchy chain items, preserve mcq if it exists
      chain.forEach((item: any) => {
        switch (item.level) {
          case 1:
            newPath.year = item;
            break;
          case 2:
            newPath.subject = item;
            break;
          case 3:
            newPath.part = item;
            break;
          case 4:
            newPath.section = item;
            break;
          case 5:
            newPath.chapter = item;
            break;
        }
      });

      // If mode is 'new' and we don't already have a mcq selection, set it to "new-mcq"
      if (hierarchyContext.mode === 'new' && !newPath.mcq) {
        newPath.mcq = {
          id: 'new-mcq',
          name: 'Create New MCQ',
          level: 6,
          type: 'MCQ',
          color: '#3B82F6', // Blue color for new MCQ
          order: 0,
          questionCount: 0,
          parentId: hierarchyContext.hierarchyItemId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [],
          isPublished: false
        };
        console.log('PageMCQEditor: Auto-selected "new-mcq" based on mode=new (context update)');
      }
      
      console.log('PageMCQEditor: Updating hierarchy path from context change:', {
        ...newPath,
        mode: hierarchyContext.mode,
        autoSelectedNewMCQ: hierarchyContext.mode === 'new',
        preservedMcq: !!newPath.mcq
      });
      console.log('PageMCQEditor: Setting hierarchyPath with mcq:', newPath.mcq);
      setHierarchyPath(newPath);
    }
  }, [hierarchyContext]);

  // Track if user has interacted with form sections
  const [hasInteractedWithSections, setHasInteractedWithSections] = useState(false);

  // Trigger validation when user starts interacting with sections
  const triggerValidationOnInteraction = () => {
    if (!hasInteractedWithSections) {
      setHasInteractedWithSections(true);
      // Validate all previous required sections when user starts interacting
      triggerSectionValidation('hierarchy');
      triggerSectionValidation('questionType');
    }
  };

  // Validate prerequisites for question content
  const validatePrerequisitesForQuestionContent = () => {
    // Always validate hierarchy and question type when user tries to interact with question content
    triggerSectionValidation('hierarchy');
    triggerSectionValidation('questionType');
    
    // Show toast if hierarchy is not selected
    if (!hierarchyPath.section) {
      showToast('Please select a hierarchy path before entering question content.', 'warning');
      return false;
    }
    
    // Show toast if question type is not selected
    if (!formData.type) {
      showToast('Please select a question type before entering question content.', 'warning');
      return false;
    }
    
    return true;
  };

  // Validate prerequisites for answer options
  const validatePrerequisitesForAnswerOptions = () => {
    triggerValidationOnInteraction();
    
    // Always validate question content when user tries to interact with answer options
    triggerSectionValidation('questionContent');
    
    // Show toast if question content is missing
    if (!formData.question?.trim()) {
      showToast('Please enter Question content before setting up answer options.', 'warning');
      return false;
    }
    
    // For assertion-reasoning, check both assertion and reasoning
    if (formData.type === 'assertionReasoning') {
      if (!formData.assertion?.trim() || !formData.reasoning?.trim()) {
        showToast('Please enter both Assertion (A) and Reasoning (R) before setting up answer options.', 'warning');
        return false;
      }
    }
    
    return true;
  };

  // Validate prerequisites for references
  const validatePrerequisitesForReferences = () => {
    // Always validate explanation when user tries to interact with references
    triggerSectionValidation('explanation');
    
    // Show toast if explanation is missing
    if (!formData.explanation?.trim()) {
      showToast('Please add an explanation before adding references.', 'warning');
      return false;
    }
    
    return true;
  };

  // UI state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [editorWidth, setEditorWidth] = useState<MCQEditorWidth>('moderate');
  const [autoSave, setAutoSave] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [pointsEnabled, setPointsEnabled] = useState(false);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);

  // Handle hierarchy selection change
  const handleHierarchyChange = (newHierarchyPath: HierarchyPath) => {
    console.log('PageMCQEditor: handleHierarchyChange called with:', newHierarchyPath);
    
    // Handle special "Create New MCQ" selection
    if (newHierarchyPath.mcq && newHierarchyPath.mcq.id === 'new-mcq') {
      console.log('PageMCQEditor: Detected "Create New MCQ" selection, resetting form');
      
      // Set the hierarchy path first (keep the original new-mcq item)
      setHierarchyPath(newHierarchyPath);
      
      // Clear form data to start fresh
      resetForm();
      
      // Don't notify parent component - keep the MCQ selection visible
      return;
    }

    setHierarchyPath(newHierarchyPath);
    // Notify parent component if callback provided
    if (onHierarchyChange) {
      onHierarchyChange(newHierarchyPath);
    }
  };

  // Update hierarchy path when hierarchy context changes
  useEffect(() => {
    if (hierarchyContext && 'hierarchyChain' in hierarchyContext && hierarchyContext.hierarchyChain) {
      const chain = hierarchyContext.hierarchyChain;
      const path: HierarchyPath = {};
      
      chain.forEach((item: any) => {
        switch (item.level) {
          case 1: // Year/Subject
            path.year = item;
            break;
          case 2: // Subject
            path.subject = item;
            break;
          case 3: // Part
            path.part = item;
            break;
          case 4: // Section  
            path.section = item;
            break;
          case 5: // Chapter
            path.chapter = item;
            break;
        }
      });
      
      setHierarchyPath(path);
    }
  }, [hierarchyContext]);

  // Container width based on editor settings
  const getContainerMaxWidth = () => {
    switch (editorWidth) {
      case 'compact': return 'max-w-4xl';
      case 'full': return 'max-w-full';
      case 'moderate':
      default: return 'max-w-6xl';
    }
  };

  // Handle save operations with enhanced validation
  const handleSave = () => {
    // Validate hierarchy selection - require at least section level
    if (!hierarchyPath.section) {
      showToast('Please select a hierarchy path (at least up to Section level) before saving the question.', 'warning');
      return;
    }

    const success = handleSaveWithValidation(
      (cleanedData) => {
        // Include hierarchy information
        const dataWithHierarchy = {
          ...cleanedData,
          hierarchyPath: hierarchyPath
        };
        onSave(dataWithHierarchy);
      },
      (validationResult) => {
        showToast(
          `Please fix ${validationResult.sections.filter(s => s.errors.some(e => e.severity === 'error')).length} error(s) before saving.`,
          'error'
        );
      }
    );
  };

  const handleSaveAndAddNew = () => {
    // Validate hierarchy selection - require at least section level
    if (!hierarchyPath.section) {
      showToast('Please select a hierarchy path (at least up to Section level) before saving the question.', 'warning');
      return;
    }

    const success = handleSaveWithValidation(
      (cleanedData) => {
        // Include hierarchy information
        const dataWithHierarchy = {
          ...cleanedData,
          hierarchyPath: hierarchyPath
        };
        onSave(dataWithHierarchy);
        // Keep the hierarchy selection for the next question
        // Don't reset hierarchyPath
      },
      (validationResult) => {
        showToast(
          `Please fix ${validationResult.sections.filter(s => s.errors.some(e => e.severity === 'error')).length} error(s) before saving.`,
          'error'
        );
      }
    );
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirmModal(true);
      return;
    }
    
    onCancel?.();
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmModal(false);
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
        
        {/* Hierarchy Selection */}
        <FormSectionWrapper
          ref={createSectionRef('hierarchy')}
          sectionId="hierarchy"
          title="Hierarchy Selection"
          isRequired={true}
          errors={getSectionValidationState('hierarchy').errors}
        >
          <div 
            className="rounded-xl p-6 border-2 bg-gradient-to-r"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.status.info + '30',
              backgroundImage: `linear-gradient(135deg, ${theme.colors.semantic.surface.primary}, ${theme.colors.semantic.status.info + '05'})`
            }}
          >
            <MCQHierarchyBreadcrumb
              hierarchyPath={hierarchyPath}
              onHierarchyChange={handleHierarchyChange}
              showEditButton={true}
              isEditing={false}
            />
          </div>
        </FormSectionWrapper>
        
        {/* Question Type Selector */}
        <FormSectionWrapper
          ref={createSectionRef('questionType')}
          sectionId="questionType"
          title="Question Type"
          isRequired={true}
          errors={getSectionValidationState('questionType').errors}
        >
          <QuestionTypeSelector
            selectedType={formData.type}
            onTypeChange={(type) => {
              // Trigger validation of hierarchy when user selects question type
              triggerSectionValidation('hierarchy');
              handleTypeChange(type);
            }}
          />
        </FormSectionWrapper>

        {/* Question Content */}
        <FormSectionWrapper
          ref={createSectionRef('questionContent')}
          sectionId="questionContent"
          title="Question Content"
          isRequired={true}
          errors={getSectionValidationState('questionContent').errors}
        >
          <QuestionContent
            questionType={formData.type}
            question={formData.question}
            assertion={formData.assertion}
            reasoning={formData.reasoning}
            errors={{}}
            onQuestionChange={(content) => {
              if (validatePrerequisitesForQuestionContent()) {
                updateFormData({ question: content });
              }
            }}
            onAssertionChange={(content) => {
              if (validatePrerequisitesForQuestionContent()) {
                updateFormData({ assertion: content });
              }
            }}
            onReasoningChange={(content) => {
              if (validatePrerequisitesForQuestionContent()) {
                updateFormData({ reasoning: content });
              }
            }}
          />
        </FormSectionWrapper>

        {/* Answer Options */}
        <FormSectionWrapper
          ref={createSectionRef('answerOptions')}
          sectionId="answerOptions"
          title="Answer Options"
          isRequired={true}
          errors={getSectionValidationState('answerOptions').errors}
        >
          <AnswerOptions
            questionType={formData.type}
            options={formData.options}
            assertionReasoningOptions={formData.assertionReasoningOptions}
            errors={{}}
            onOptionsChange={(options) => {
              if (validatePrerequisitesForAnswerOptions()) {
                updateFormData({ options });
              }
            }}
            onAssertionReasoningOptionsChange={(options) => {
              if (validatePrerequisitesForAnswerOptions()) {
                updateFormData({ assertionReasoningOptions: options });
              }
            }}
            onAddOption={() => {
              if (validatePrerequisitesForAnswerOptions()) {
                addOption();
              }
            }}
            onRemoveOption={(optionId) => {
              if (validatePrerequisitesForAnswerOptions()) {
                removeOption(optionId);
              }
            }}
          />
        </FormSectionWrapper>

        {/* Explanation */}
        <FormSectionWrapper
          ref={createSectionRef('explanation')}
          sectionId="explanation"
          title="Explanation & References"
          isRequired={false}
          errors={getSectionValidationState('explanation').errors}
        >
          <ExplanationSection
            explanation={formData.explanation || ''}
            references={formData.references || ''}
            onExplanationChange={(content) => updateFormData({ explanation: content })}
            onReferencesChange={(content) => updateFormData({ references: content })}
            validatePrerequisitesForReferences={validatePrerequisitesForReferences}
          />
        </FormSectionWrapper>

        {/* Question Settings */}
        <FormSectionWrapper
          ref={createSectionRef('settings')}
          sectionId="settings"
          title="Question Settings"
          isRequired={false}
          errors={getSectionValidationState('settings').errors}
        >
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
        </FormSectionWrapper>

        {/* Tags */}
        <FormSectionWrapper
          ref={createSectionRef('tags')}
          sectionId="tags"
          title="Tags & Categories"
          isRequired={false}
          errors={getSectionValidationState('tags').errors}
        >
          <TagsSection
            sourceTags={formData.sourceTags || []}
            examTags={formData.examTags || []}
            onAddSourceTag={addSourceTag}
            onRemoveSourceTag={removeSourceTag}
            onAddExamTag={addExamTag}
            onRemoveExamTag={removeExamTag}
          />
        </FormSectionWrapper>
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

      {/* Cancel Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        onConfirm={handleConfirmCancel}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel? All changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Keep Editing"
        isDestructive={true}
      />
    </div>
  );
}