import { useState, useEffect, useRef } from 'react';
import { MCQData, MCQFormData, MCQType, MCQOption, FormValidationErrors } from '../../common/types';

interface UseMCQFormProps {
  initialData?: Partial<MCQData>;
}

const getDefaultOptions = (type: MCQType): MCQOption[] => {
  if (type === 'trueFalse') {
    return [
      { id: '1', text: 'True', isCorrect: false },
      { id: '2', text: 'False', isCorrect: false }
    ];
  }
  
  // Default 4 options for single choice and multiple choice
  return [
    { id: '1', text: '', isCorrect: false },
    { id: '2', text: '', isCorrect: false },
    { id: '3', text: '', isCorrect: false },
    { id: '4', text: '', isCorrect: false }
  ];
};

const getDefaultAssertionReasoningOptions = (): MCQOption[] => [
  { id: '1', text: 'Both A and R are true, and R is the correct explanation of A', isCorrect: false },
  { id: '2', text: 'Both A and R are true, but R is not the correct explanation of A', isCorrect: false },
  { id: '3', text: 'A is true, but R is false', isCorrect: false },
  { id: '4', text: 'A is false, but R is true', isCorrect: false },
  { id: '5', text: 'Both A and R are false', isCorrect: false }
];

const createInitialFormData = (initialData?: Partial<MCQData>): MCQFormData => {
  const type = initialData?.type || 'singleChoice';
  
  return {
    type,
    question: initialData?.question || '',
    explanation: initialData?.explanation || '',
    difficulty: initialData?.difficulty || 'medium',
    tags: initialData?.tags || [],
    points: initialData?.points || 1,
    timeLimit: initialData?.timeLimit || 60,
    options: initialData?.options || getDefaultOptions(type),
    assertion: initialData?.assertion || '',
    reasoning: initialData?.reasoning || '',
    assertionReasoningOptions: initialData?.assertionReasoningOptions || getDefaultAssertionReasoningOptions()
  };
};

export function useMCQForm({ initialData }: UseMCQFormProps = {}) {
  const [formData, setFormData] = useState<MCQFormData>(() => createInitialFormData(initialData));
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      setFormData(createInitialFormData(initialData));
      return;
    }
  }, [initialData]);

  // Mark as having unsaved changes when form data changes (but not on initial load)
  useEffect(() => {
    if (hasInitialized.current) {
      setHasUnsavedChanges(true);
    }
  }, [formData]);

  const updateFormData = (updates: Partial<MCQFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleTypeChange = (newType: MCQType) => {
    if (newType === formData.type) return;

    const updates: Partial<MCQFormData> = { type: newType };

    // Reset type-specific fields when changing question type
    if (newType === 'trueFalse') {
      updates.options = getDefaultOptions('trueFalse');
    } else if (newType === 'assertionReasoning') {
      updates.assertionReasoningOptions = getDefaultAssertionReasoningOptions();
      updates.options = undefined;
    } else {
      // For single and multiple choice, use 4 default options
      updates.options = getDefaultOptions(newType);
      updates.assertion = '';
      updates.reasoning = '';
      updates.assertionReasoningOptions = undefined;
    }

    updateFormData(updates);
  };

  const addOption = () => {
    if (!formData.options || formData.options.length >= 6) return;
    
    const newOption: MCQOption = {
      id: (formData.options.length + 1).toString(),
      text: '',
      isCorrect: false
    };
    
    updateFormData({
      options: [...formData.options, newOption]
    });
  };

  const removeOption = (optionId: string) => {
    if (!formData.options || formData.options.length <= 2) return;
    
    updateFormData({
      options: formData.options.filter(opt => opt.id !== optionId)
    });
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      updateFormData({
        tags: [...(formData.tags || []), trimmedTag]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData({
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  // Enhanced tag handlers for sources and exams
  const addSourceTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.sourceTags?.includes(trimmedTag)) {
      updateFormData({
        sourceTags: [...(formData.sourceTags || []), trimmedTag]
      });
    }
  };

  const removeSourceTag = (tagToRemove: string) => {
    updateFormData({
      sourceTags: formData.sourceTags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const addExamTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.examTags?.includes(trimmedTag)) {
      updateFormData({
        examTags: [...(formData.examTags || []), trimmedTag]
      });
    }
  };

  const removeExamTag = (tagToRemove: string) => {
    updateFormData({
      examTags: formData.examTags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormValidationErrors = {};

    // Validate question
    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }

    // Validate assertion-reasoning specific fields
    if (formData.type === 'assertionReasoning') {
      if (!formData.assertion?.trim()) {
        newErrors.assertion = 'Assertion is required';
      }
      if (!formData.reasoning?.trim()) {
        newErrors.reasoning = 'Reasoning is required';
      }
      
      // Check if correct answer is selected for assertion-reasoning
      const hasCorrectAnswer = formData.assertionReasoningOptions?.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        newErrors.correctAnswer = 'Please select the correct answer';
      }
    } else {
      // Validate regular options
      if (!formData.options || formData.options.length < 2) {
        newErrors.options = 'At least 2 options are required';
      } else {
        const nonEmptyOptions = formData.options.filter(opt => opt.text.trim());
        const emptyOptions = formData.options.filter(opt => !opt.text.trim());
        
        if (emptyOptions.length > 0) {
          newErrors.options = 'All options must have text';
        }
        
        // Check if at least one correct answer is selected
        const hasCorrectAnswer = formData.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          newErrors.correctAnswer = 'Please select at least one correct answer';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    const initialFormData = createInitialFormData();
    setFormData(initialFormData);
    setErrors({});
    setHasUnsavedChanges(false);
    hasInitialized.current = false;
    setTimeout(() => hasInitialized.current = true, 100);
  };

  const clearUnsavedChanges = () => {
    setHasUnsavedChanges(false);
  };

  return {
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
    validateForm,
    resetForm,
    clearUnsavedChanges
  };
}