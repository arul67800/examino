import { useState, useEffect, useCallback, useRef } from 'react';
import { QuestionState, RendererState, MCQQuestion, UserAnswer, RendererSettings } from '../types';
import { calculateProgress, trackInteraction, saveQuestionProgress } from '../utils';

// Hook for managing individual question state
export const useQuestionState = (question: MCQQuestion | null) => {
  const [state, setState] = useState<QuestionState>({
    currentQuestion: question,
    selectedOption: null,
    isAnswered: false,
    isCorrect: null,
    showExplanation: false,
    timeSpent: 0,
    attempts: 0,
    showFeedback: false
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Start timer when question changes
  useEffect(() => {
    if (question && question.id !== state.currentQuestion?.id) {
      setState(prev => ({
        ...prev,
        currentQuestion: question,
        selectedOption: null,
        isAnswered: false,
        isCorrect: null,
        showExplanation: false,
        timeSpent: 0,
        attempts: 0,
        showFeedback: false
      }));
      
      startTimeRef.current = new Date();
      
      // Start timer
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
          setState(prev => ({ ...prev, timeSpent: elapsed }));
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [question]);

  const selectOption = useCallback((optionId: string) => {
    if (state.isAnswered) return;

    const correctOption = question?.options.find(opt => opt.isCorrect);
    const isCorrect = optionId === correctOption?.id;

    setState(prev => ({
      ...prev,
      selectedOption: optionId,
      isAnswered: true,
      isCorrect,
      showFeedback: true,
      attempts: prev.attempts + 1
    }));

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    trackInteraction('option_selected', { optionId, isCorrect, timeSpent: state.timeSpent });
  }, [question, state.timeSpent, state.isAnswered]);

  const toggleExplanation = useCallback(() => {
    setState(prev => ({
      ...prev,
      showExplanation: !prev.showExplanation
    }));
    trackInteraction('explanation_toggled');
  }, []);

  const resetQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedOption: null,
      isAnswered: false,
      isCorrect: null,
      showExplanation: false,
      timeSpent: 0,
      showFeedback: false
    }));
    startTimeRef.current = new Date();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
        setState(prev => ({ ...prev, timeSpent: elapsed }));
      }
    }, 1000);
  }, []);

  return {
    ...state,
    selectOption,
    toggleExplanation,
    resetQuestion
  };
};

// Hook for managing the entire renderer state
export const useRenderer = (initialQuestions: MCQQuestion[] = []) => {
  const [state, setState] = useState<RendererState>({
    questions: initialQuestions,
    currentQuestionIndex: 0,
    userAnswers: [],
    progress: {
      questionsAnswered: 0,
      correctAnswers: 0,
      totalQuestions: initialQuestions.length,
      averageTime: 0,
      difficultyBreakdown: {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 }
      }
    },
    isLoading: false,
    error: null,
    sessionStartTime: new Date(),
    settings: {
      showTimer: true,
      allowMultipleAttempts: false,
      showInstantFeedback: true,
      showProgressBar: true,
      autoAdvance: false,
      autoAdvanceDelay: 2000,
      showDifficultyIndicator: true,
      enableKeyboardNavigation: true,
      animationsEnabled: true
    }
  });

  // Update progress when answers change
  useEffect(() => {
    const progress = calculateProgress(state.userAnswers, state.questions);
    setState(prev => ({ ...prev, progress }));
    saveQuestionProgress(progress);
  }, [state.userAnswers, state.questions]);

  const addAnswer = useCallback((answer: UserAnswer) => {
    setState(prev => ({
      ...prev,
      userAnswers: [...prev.userAnswers.filter(a => a.questionId !== answer.questionId), answer]
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1)
    }));
    trackInteraction('question_navigation', { direction: 'next' });
  }, []);

  const prevQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0)
    }));
    trackInteraction('question_navigation', { direction: 'previous' });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < state.questions.length) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: index
      }));
      trackInteraction('question_navigation', { direction: 'jump', index });
    }
  }, [state.questions.length]);

  const updateSettings = useCallback((newSettings: Partial<RendererSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  const resetRenderer = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: 0,
      userAnswers: [],
      sessionStartTime: new Date(),
      progress: {
        questionsAnswered: 0,
        correctAnswers: 0,
        totalQuestions: prev.questions.length,
        averageTime: 0,
        difficultyBreakdown: {
          easy: { correct: 0, total: 0 },
          medium: { correct: 0, total: 0 },
          hard: { correct: 0, total: 0 }
        }
      }
    }));
  }, []);

  return {
    ...state,
    currentQuestion: state.questions[state.currentQuestionIndex] || null,
    addAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    updateSettings,
    resetRenderer
  };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  enabled: boolean,
  onNext: () => void,
  onPrevious: () => void,
  onSelect: (optionIndex: number) => void,
  optionsCount: number
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'n':
        case 'N':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
        case 'p':
        case 'P':
          event.preventDefault();
          onPrevious();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          event.preventDefault();
          const optionIndex = parseInt(event.key) - 1;
          if (optionIndex < optionsCount) {
            onSelect(optionIndex);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [enabled, onNext, onPrevious, onSelect, optionsCount]);
};

// Hook for animations
export const useAnimation = (trigger: any, animationType: string = 'fade') => {
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const animate = useCallback((duration: number = 300) => {
    if (!elementRef.current) return;

    setIsAnimating(true);
    
    const element = elementRef.current;
    element.style.transition = `all ${duration}ms ease-in-out`;

    switch (animationType) {
      case 'fade':
        element.style.opacity = '0';
        setTimeout(() => {
          element.style.opacity = '1';
          setIsAnimating(false);
        }, duration);
        break;
      case 'scale':
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
          element.style.transform = 'scale(1)';
          setIsAnimating(false);
        }, duration);
        break;
      case 'slide':
        element.style.transform = 'translateX(-10px)';
        setTimeout(() => {
          element.style.transform = 'translateX(0)';
          setIsAnimating(false);
        }, duration);
        break;
      default:
        setIsAnimating(false);
    }
  }, [animationType]);

  useEffect(() => {
    if (trigger) {
      animate();
    }
  }, [trigger, animate]);

  return { isAnimating, elementRef, animate };
};