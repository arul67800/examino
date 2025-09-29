import { useState, useCallback, useMemo } from 'react';
import { MCQFormData, FormValidationErrors, FormSection, FormSectionError, ValidationResult } from '../types';

interface UseFormValidationProps {
  formData: MCQFormData;
  hierarchyPath?: any;
}

export function useFormValidation({ formData, hierarchyPath }: UseFormValidationProps) {
  const [sectionErrors, setSectionErrors] = useState<Record<string, FormSectionError[]>>({});

  // Define form sections with their validation rules
  const formSections: FormSection[] = useMemo(() => [
    {
      id: 'hierarchy',
      name: 'Hierarchy Selection',
      isValid: true,
      errors: [],
      isRequired: true,
      order: 1
    },
    {
      id: 'questionType',
      name: 'Question Type',
      isValid: true,
      errors: [],
      isRequired: true,
      order: 2
    },
    {
      id: 'questionContent',
      name: 'Question Content',
      isValid: true,
      errors: [],
      isRequired: true,
      order: 3
    },
    {
      id: 'answerOptions',
      name: 'Answer Options',
      isValid: true,
      errors: [],
      isRequired: true,
      order: 4
    },
    {
      id: 'explanation',
      name: 'Explanation',
      isValid: true,
      errors: [],
      isRequired: false,
      order: 5
    },
    {
      id: 'references',
      name: 'References',
      isValid: true,
      errors: [],
      isRequired: false,
      order: 6
    },
    {
      id: 'settings',
      name: 'Question Settings',
      isValid: true,
      errors: [],
      isRequired: false,
      order: 7
    },
    {
      id: 'tags',
      name: 'Tags',
      isValid: true,
      errors: [],
      isRequired: false,
      order: 8
    }
  ], []);

  // Validate individual sections
  const validateSection = useCallback((sectionId: string): FormSectionError[] => {
    const errors: FormSectionError[] = [];

    switch (sectionId) {
      case 'hierarchy':
        if (!hierarchyPath?.section) {
          errors.push({
            id: 'hierarchy-missing',
            message: 'Please select a hierarchy path (at least up to Section level)',
            severity: 'error'
          });
        }
        // Note: Chapter is optional when creating MCQs at section level
        break;

      case 'questionType':
        if (!formData.type) {
          errors.push({
            id: 'type-missing',
            message: 'Please select a question type',
            severity: 'error'
          });
        }
        break;

      case 'questionContent':
        if (!formData.question?.trim()) {
          errors.push({
            id: 'question-empty',
            message: 'Question content is required',
            field: 'question',
            severity: 'error'
          });
        } else if (formData.question.trim().length < 10) {
          errors.push({
            id: 'question-short',
            message: 'Question should be at least 10 characters long',
            field: 'question',
            severity: 'warning'
          });
        }

        // Assertion-Reasoning specific validation
        if (formData.type === 'assertionReasoning') {
          if (!formData.assertion?.trim()) {
            errors.push({
              id: 'assertion-empty',
              message: 'Assertion (A) is required',
              field: 'assertion',
              severity: 'error'
            });
          }
          if (!formData.reasoning?.trim()) {
            errors.push({
              id: 'reasoning-empty',
              message: 'Reasoning (R) is required',
              field: 'reasoning',
              severity: 'error'
            });
          }
        }
        break;

      case 'answerOptions':
        if (formData.type === 'assertionReasoning') {
          const hasCorrectAnswer = formData.assertionReasoningOptions?.some(opt => opt.isCorrect);
          if (!hasCorrectAnswer) {
            errors.push({
              id: 'correct-answer-missing',
              message: 'Please select the correct answer',
              severity: 'error'
            });
          }
        } else {
          // Regular options validation
          if (!formData.options || formData.options.length < 2) {
            errors.push({
              id: 'options-insufficient',
              message: 'At least 2 options are required',
              severity: 'error'
            });
          } else {
            const nonEmptyOptions = formData.options.filter(opt => opt.text.trim());
            const emptyOptions = formData.options.filter(opt => !opt.text.trim());
            
            if (emptyOptions.length > 0) {
              errors.push({
                id: 'options-empty',
                message: 'All options must have text',
                severity: 'error'
              });
            }

            // Check for correct answer
            const hasCorrectAnswer = formData.options.some(opt => opt.isCorrect);
            if (!hasCorrectAnswer) {
              errors.push({
                id: 'correct-answer-missing',
                message: 'Please select at least one correct answer',
                severity: 'error'
              });
            }

            // Multiple choice validation
            if (formData.type === 'singleChoice') {
              const correctAnswers = formData.options.filter(opt => opt.isCorrect);
              if (correctAnswers.length > 1) {
                errors.push({
                  id: 'multiple-correct-single',
                  message: 'Single choice questions can only have one correct answer',
                  severity: 'error'
                });
              }
            }
          }
        }
        break;

      case 'explanation':
        // Optional but warn if empty
        if (!formData.explanation?.trim()) {
          errors.push({
            id: 'explanation-empty',
            message: 'Adding an explanation helps students understand the correct answer',
            severity: 'warning'
          });
        }
        break;

      case 'references':
        // Check if explanation is required before references
        if (formData.references?.trim() && !formData.explanation?.trim()) {
          errors.push({
            id: 'references-without-explanation',
            message: 'Please add an explanation before adding references',
            severity: 'error'
          });
        }
        break;

      case 'settings':
        // Validate points and time limit if enabled
        if (formData.points !== undefined && (formData.points < 0 || formData.points > 100)) {
          errors.push({
            id: 'points-invalid',
            message: 'Points must be between 0 and 100',
            field: 'points',
            severity: 'error'
          });
        }
        
        if (formData.timeLimit !== undefined && (formData.timeLimit < 10 || formData.timeLimit > 3600)) {
          errors.push({
            id: 'time-limit-invalid',
            message: 'Time limit must be between 10 seconds and 1 hour',
            field: 'timeLimit',
            severity: 'error'
          });
        }
        break;

      case 'tags':
        // Tags are optional, no validation needed
        break;

      default:
        break;
    }

    return errors;
  }, [formData, hierarchyPath]);

  // Update section errors
  const updateSectionErrors = useCallback((sectionId: string) => {
    const errors = validateSection(sectionId);
    setSectionErrors(prev => ({
      ...prev,
      [sectionId]: errors
    }));
    return errors;
  }, [validateSection]);

  // Validate all sections
  const validateAllSections = useCallback((): ValidationResult => {
    const updatedSections: FormSection[] = [];
    const newSectionErrors: Record<string, FormSectionError[]> = {};
    let firstErrorSection: string | undefined;

    for (const section of formSections) {
      const errors = validateSection(section.id);
      const hasErrors = errors.some(err => err.severity === 'error');
      
      newSectionErrors[section.id] = errors;
      
      updatedSections.push({
        ...section,
        isValid: !hasErrors,
        errors
      });

      // Track first error section
      if (hasErrors && !firstErrorSection) {
        firstErrorSection = section.id;
      }
    }

    setSectionErrors(newSectionErrors);

    const isValid = updatedSections.every(section => section.isValid || !section.isRequired);

    return {
      isValid,
      sections: updatedSections,
      firstErrorSection
    };
  }, [formSections, validateSection]);

  // Get errors for a specific section
  const getSectionErrors = useCallback((sectionId: string): FormSectionError[] => {
    return sectionErrors[sectionId] || [];
  }, [sectionErrors]);

  // Check if section has errors
  const hasSectionErrors = useCallback((sectionId: string, severity?: 'error' | 'warning'): boolean => {
    const errors = getSectionErrors(sectionId);
    if (!severity) {
      return errors.length > 0;
    }
    return errors.some(err => err.severity === severity);
  }, [getSectionErrors]);

  // Clear errors for a section
  const clearSectionErrors = useCallback((sectionId: string) => {
    setSectionErrors(prev => ({
      ...prev,
      [sectionId]: []
    }));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setSectionErrors({});
  }, []);

  return {
    formSections,
    sectionErrors,
    validateSection,
    updateSectionErrors,
    validateAllSections,
    getSectionErrors,
    hasSectionErrors,
    clearSectionErrors,
    clearAllErrors
  };
}