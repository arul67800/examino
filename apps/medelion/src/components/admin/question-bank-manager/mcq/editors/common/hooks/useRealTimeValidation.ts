import { useCallback, useEffect, useRef } from 'react';
import { MCQFormData } from '../types';

interface UseRealTimeValidationProps {
  formData: MCQFormData;
  hierarchyPath?: any;
  onValidationChange?: (sectionId: string, isValid: boolean, errors: any[]) => void;
  debounceMs?: number;
}

export function useRealTimeValidation({
  formData,
  hierarchyPath,
  onValidationChange,
  debounceMs = 300
}: UseRealTimeValidationProps) {
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const previousFormData = useRef<MCQFormData | undefined>(undefined);
  const previousHierarchyPath = useRef<any>(undefined);

  // Debounced validation function
  const debouncedValidation = useCallback((sectionId: string, validationFn: () => void) => {
    // Clear existing timeout for this section
    if (debounceTimeouts.current[sectionId]) {
      clearTimeout(debounceTimeouts.current[sectionId]);
    }

    // Set new timeout
    debounceTimeouts.current[sectionId] = setTimeout(() => {
      validationFn();
      delete debounceTimeouts.current[sectionId];
    }, debounceMs);
  }, [debounceMs]);

  // Validate specific fields and trigger callbacks
  const validateField = useCallback((sectionId: string, field: string, value: any) => {
    const validation = () => {
      let errors: any[] = [];
      let isValid = true;

      switch (sectionId) {
        case 'questionContent':
          if (field === 'question') {
            if (!value?.trim()) {
              errors.push({
                id: 'question-empty',
                message: 'Question content is required',
                field: 'question',
                severity: 'error'
              });
              isValid = false;
            } else if (value.trim().length < 10) {
              errors.push({
                id: 'question-short',
                message: 'Question should be at least 10 characters long',
                field: 'question',
                severity: 'warning'
              });
            }
          } else if (field === 'assertion') {
            if (!value?.trim()) {
              errors.push({
                id: 'assertion-empty',
                message: 'Assertion (A) is required',
                field: 'assertion',
                severity: 'error'
              });
              isValid = false;
            }
          } else if (field === 'reasoning') {
            if (!value?.trim()) {
              errors.push({
                id: 'reasoning-empty',
                message: 'Reasoning (R) is required',
                field: 'reasoning',
                severity: 'error'
              });
              isValid = false;
            }
          }
          break;

        case 'answerOptions':
          // Validate options in real-time
          if (field === 'options' && Array.isArray(value)) {
            const emptyOptions = value.filter((opt: any) => !opt.text?.trim());
            if (emptyOptions.length > 0) {
              errors.push({
                id: 'options-empty',
                message: 'All options must have text',
                severity: 'error'
              });
              isValid = false;
            }

            const correctAnswers = value.filter((opt: any) => opt.isCorrect);
            if (correctAnswers.length === 0) {
              errors.push({
                id: 'correct-answer-missing',
                message: 'Please select at least one correct answer',
                severity: 'error'
              });
              isValid = false;
            }
          }
          break;

        case 'settings':
          if (field === 'points') {
            if (value !== undefined && (value < 0 || value > 100)) {
              errors.push({
                id: 'points-invalid',
                message: 'Points must be between 0 and 100',
                field: 'points',
                severity: 'error'
              });
              isValid = false;
            }
          } else if (field === 'timeLimit') {
            if (value !== undefined && (value < 10 || value > 3600)) {
              errors.push({
                id: 'time-limit-invalid',
                message: 'Time limit must be between 10 seconds and 1 hour',
                field: 'timeLimit',
                severity: 'error'
              });
              isValid = false;
            }
          }
          break;
      }

      onValidationChange?.(sectionId, isValid, errors);
    };

    debouncedValidation(sectionId, validation);
  }, [debouncedValidation, onValidationChange]);

  // Watch for form data changes and trigger real-time validation
  useEffect(() => {
    const prev = previousFormData.current;
    const current = formData;

    if (!prev) {
      previousFormData.current = current;
      return;
    }

    // Check what changed and validate accordingly
    if (prev.question !== current.question) {
      validateField('questionContent', 'question', current.question);
    }

    if (prev.assertion !== current.assertion) {
      validateField('questionContent', 'assertion', current.assertion);
    }

    if (prev.reasoning !== current.reasoning) {
      validateField('questionContent', 'reasoning', current.reasoning);
    }

    if (JSON.stringify(prev.options) !== JSON.stringify(current.options)) {
      validateField('answerOptions', 'options', current.options);
    }

    if (prev.points !== current.points) {
      validateField('settings', 'points', current.points);
    }

    if (prev.timeLimit !== current.timeLimit) {
      validateField('settings', 'timeLimit', current.timeLimit);
    }

    previousFormData.current = current;
  }, [formData, validateField]);

  // Watch for hierarchy changes
  useEffect(() => {
    const prev = previousHierarchyPath.current;
    const current = hierarchyPath;

    if (JSON.stringify(prev) !== JSON.stringify(current)) {
      const validation = () => {
        let isValid = true;
        let errors: any[] = [];

        if (!current?.section) {
          errors.push({
            id: 'hierarchy-missing',
            message: 'Please select a hierarchy path (at least up to Section level)',
            severity: 'error'
          });
          isValid = false;
        }

        onValidationChange?.('hierarchy', isValid, errors);
      };

      // Don't debounce hierarchy validation as it's usually a single action
      validation();
    }

    previousHierarchyPath.current = current;
  }, [hierarchyPath, onValidationChange]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    validateField
  };
}