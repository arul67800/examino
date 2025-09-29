import { useCallback, useRef } from 'react';

export function useScrollToError() {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Register a section element
  const registerSection = useCallback((sectionId: string, element: HTMLElement | null) => {
    sectionRefs.current[sectionId] = element;
  }, []);

  // Scroll to a specific section with smooth animation
  const scrollToSection = useCallback((sectionId: string, options?: ScrollIntoViewOptions) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const defaultOptions: ScrollIntoViewOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      };

      element.scrollIntoView({ ...defaultOptions, ...options });
      
      // Add a brief highlight effect
      element.style.transition = 'box-shadow 0.3s ease-in-out';
      element.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';
      
      setTimeout(() => {
        element.style.boxShadow = '';
        element.style.transition = '';
      }, 2000);
    }
  }, []);

  // Scroll to the first error section
  const scrollToFirstError = useCallback((firstErrorSectionId?: string) => {
    if (firstErrorSectionId) {
      // Add a small delay to ensure the error states have been updated
      setTimeout(() => {
        scrollToSection(firstErrorSectionId);
      }, 100);
    }
  }, [scrollToSection]);

  // Create a ref callback for sections
  const createSectionRef = useCallback((sectionId: string) => {
    return (element: HTMLElement | null) => {
      registerSection(sectionId, element);
    };
  }, [registerSection]);

  return {
    registerSection,
    scrollToSection,
    scrollToFirstError,
    createSectionRef
  };
}