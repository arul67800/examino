import { useState, useCallback } from 'react';
import { FormSectionError } from '../types';

export function useFormSectionErrors() {
  const [sectionErrors, setSectionErrors] = useState<Record<string, FormSectionError[]>>({});

  // Update errors for a specific section
  const updateSectionErrors = useCallback((sectionId: string, errors: FormSectionError[]) => {
    setSectionErrors(prev => ({
      ...prev,
      [sectionId]: errors
    }));
  }, []);

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
    return errors.some(error => error.severity === severity);
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

  // Get all sections with errors
  const getSectionsWithErrors = useCallback((severity?: 'error' | 'warning'): string[] => {
    return Object.keys(sectionErrors).filter(sectionId => hasSectionErrors(sectionId, severity));
  }, [sectionErrors, hasSectionErrors]);

  return {
    sectionErrors,
    updateSectionErrors,
    getSectionErrors,
    hasSectionErrors,
    clearSectionErrors,
    clearAllErrors,
    getSectionsWithErrors
  };
}