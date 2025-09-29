import React, { useCallback, useState, useEffect } from 'react';
import { MCQFormData, FormSectionError, ValidationResult } from '../types';
import { useFormValidation } from './useFormValidation';
import { useScrollToError } from './useScrollToError';
import { useRealTimeValidation } from './useRealTimeValidation';
import { useFormSectionErrors } from './useFormSectionErrors';
import { useMCQForm } from '../../page-mcq-editor/hooks/useMCQForm';

interface UseEnhancedMCQFormProps {
  initialData?: Partial<MCQFormData>;
  hierarchyPath?: any;
  enableRealTimeValidation?: boolean;
  autoScrollToErrors?: boolean;
}

export function useEnhancedMCQForm({
  initialData,
  hierarchyPath,
  enableRealTimeValidation = true,
  autoScrollToErrors = true
}: UseEnhancedMCQFormProps = {}) {
  
  // Validation trigger state
  const [validationTriggered, setValidationTriggered] = useState(false);
  
  // Base form functionality
  const mcqForm = useMCQForm({ initialData });
  
  // Enhanced validation hooks
  const validation = useFormValidation({ 
    formData: mcqForm.formData, 
    hierarchyPath 
  });
  
  const scrollToError = useScrollToError();
  const sectionErrors = useFormSectionErrors();
  
  // Real-time validation handler
  const handleValidationChange = useCallback((sectionId: string, isValid: boolean, errors: FormSectionError[]) => {
    sectionErrors.updateSectionErrors(sectionId, errors);
  }, [sectionErrors.updateSectionErrors]);

  // Real-time validation
  const realTimeValidation = useRealTimeValidation({
    formData: mcqForm.formData,
    hierarchyPath,
    onValidationChange: enableRealTimeValidation ? handleValidationChange : undefined
  });

  // Enhanced validation function
  const validateFormWithScrolling = useCallback((): ValidationResult => {
    setValidationTriggered(true);
    const result = validation.validateAllSections();
    
    // Update section errors
    result.sections.forEach(section => {
      sectionErrors.updateSectionErrors(section.id, section.errors);
    });
    
    // Scroll to first error if enabled
    if (!result.isValid && autoScrollToErrors && result.firstErrorSection) {
      scrollToError.scrollToFirstError(result.firstErrorSection);
    }
    
    return result;
  }, [validation.validateAllSections, sectionErrors.updateSectionErrors, scrollToError.scrollToFirstError, autoScrollToErrors]);

  // Enhanced save handler
  const handleSaveWithValidation = useCallback((onSuccess?: (data: MCQFormData) => void, onError?: (errors: ValidationResult) => void) => {
    const validationResult = validateFormWithScrolling();
    
    if (validationResult.isValid) {
      // Clear all errors on successful validation
      sectionErrors.clearAllErrors();
      
      // Prepare clean data
      const cleanedData: MCQFormData = {
        ...mcqForm.formData,
        question: mcqForm.formData.question.trim(),
        explanation: mcqForm.formData.explanation?.trim() || '',
        tags: mcqForm.formData.tags?.filter(tag => tag.trim()) || [],
        options: mcqForm.formData.type !== 'assertionReasoning' 
          ? mcqForm.formData.options?.filter(opt => opt.text.trim())
          : undefined,
        assertion: mcqForm.formData.type === 'assertionReasoning' ? mcqForm.formData.assertion?.trim() : undefined,
        reasoning: mcqForm.formData.type === 'assertionReasoning' ? mcqForm.formData.reasoning?.trim() : undefined,
        assertionReasoningOptions: mcqForm.formData.type === 'assertionReasoning' 
          ? mcqForm.formData.assertionReasoningOptions 
          : undefined,
      };
      
      mcqForm.clearUnsavedChanges();
      onSuccess?.(cleanedData);
    } else {
      onError?.(validationResult);
    }
    
    return validationResult.isValid;
  }, [validateFormWithScrolling, sectionErrors.clearAllErrors, mcqForm]);

  // Get section-specific validation state
  const getSectionValidationState = useCallback((sectionId: string) => {
    const errors = validationTriggered ? sectionErrors.getSectionErrors(sectionId) : [];
    const hasErrors = validationTriggered ? sectionErrors.hasSectionErrors(sectionId, 'error') : false;
    const hasWarnings = validationTriggered ? sectionErrors.hasSectionErrors(sectionId, 'warning') : false;
    
    return {
      errors,
      hasErrors,
      hasWarnings,
      isValid: !hasErrors
    };
  }, [sectionErrors, validationTriggered]);

  // Create section ref for scroll-to-error functionality
  const createSectionRef = useCallback((sectionId: string) => {
    return scrollToError.createSectionRef(sectionId);
  }, [scrollToError.createSectionRef]);

  // Manual section validation
  const validateSection = useCallback((sectionId: string) => {
    setValidationTriggered(true);
    const errors = validation.validateSection(sectionId);
    sectionErrors.updateSectionErrors(sectionId, errors);
    return errors;
  }, [validation.validateSection, sectionErrors.updateSectionErrors]);

  // Trigger validation for a specific section
  const triggerSectionValidation = useCallback((sectionId: string) => {
    setValidationTriggered(true);
    return validateSection(sectionId);
  }, [validateSection]);

  // Clear errors for a specific section
  const clearSectionErrors = useCallback((sectionId: string) => {
    sectionErrors.clearSectionErrors(sectionId);
  }, [sectionErrors.clearSectionErrors]);

  // Get validation summary
  const getValidationSummary = useCallback(() => {
    return {
      sections: validation.formSections.map(section => ({
        ...section,
        errors: sectionErrors.getSectionErrors(section.id),
        isValid: !sectionErrors.hasSectionErrors(section.id, 'error')
      })),
      totalErrors: sectionErrors.getSectionsWithErrors('error').length,
      totalWarnings: sectionErrors.getSectionsWithErrors('warning').length,
      hasErrors: sectionErrors.getSectionsWithErrors('error').length > 0
    };
  }, [validation.formSections, sectionErrors]);

  return {
    // Base form functionality
    ...mcqForm,
    
    // Enhanced validation
    validateFormWithScrolling,
    handleSaveWithValidation,
    getSectionValidationState,
    createSectionRef,
    validateSection,
    triggerSectionValidation,
    clearSectionErrors,
    getValidationSummary,
    
    // Section error management
    sectionErrors: sectionErrors.sectionErrors,
    
    // Scroll functionality
    scrollToSection: scrollToError.scrollToSection,
    scrollToFirstError: scrollToError.scrollToFirstError,
    
    // Real-time validation
    validateField: realTimeValidation.validateField
  };
}