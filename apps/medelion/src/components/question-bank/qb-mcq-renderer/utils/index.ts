import { MCQQuestion, QuestionProgress, UserAnswer } from '../types';

// Question scoring and analysis utilities
export const calculateScore = (userAnswers: UserAnswer[]): number => {
  if (userAnswers.length === 0) return 0;
  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  return (correctAnswers / userAnswers.length) * 100;
};

export const calculateProgress = (
  userAnswers: UserAnswer[], 
  questions: MCQQuestion[]
): QuestionProgress => {
  const questionsAnswered = userAnswers.length;
  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  const totalQuestions = questions.length;
  
  const totalTime = userAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0);
  const averageTime = questionsAnswered > 0 ? totalTime / questionsAnswered : 0;

  // Calculate difficulty breakdown
  const difficultyBreakdown = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 }
  };

  userAnswers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question) {
      difficultyBreakdown[question.difficulty].total++;
      if (answer.isCorrect) {
        difficultyBreakdown[question.difficulty].correct++;
      }
    }
  });

  return {
    questionsAnswered,
    correctAnswers,
    totalQuestions,
    averageTime,
    difficultyBreakdown
  };
};

// Time formatting utilities
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

// Difficulty utilities
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return '#22c55e'; // green
    case 'medium': return '#f59e0b'; // yellow
    case 'hard': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
};

export const getDifficultyIcon = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return '●';
    case 'medium': return '●●';
    case 'hard': return '●●●';
    default: return '○';
  }
};

// Animation utilities
export const createPulseAnimation = (element: HTMLElement, color: string, duration: number = 600): void => {
  element.style.transition = `all ${duration}ms ease-out`;
  element.style.boxShadow = `0 0 0 4px ${color}40`;
  element.style.transform = 'scale(1.02)';
  
  setTimeout(() => {
    element.style.boxShadow = 'none';
    element.style.transform = 'scale(1)';
  }, duration);
};

export const createShakeAnimation = (element: HTMLElement): void => {
  element.style.animation = 'shake 0.6s ease-in-out';
  
  setTimeout(() => {
    element.style.animation = '';
  }, 600);
};

// Question shuffling and randomization
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const shuffleQuestions = (questions: MCQQuestion[]): MCQQuestion[] => {
  return shuffleArray(questions).map(question => ({
    ...question,
    options: shuffleArray(question.options)
  }));
};

// Validation utilities
export const validateQuestion = (question: MCQQuestion): string[] => {
  const errors: string[] = [];
  
  if (!question.questionText?.trim()) {
    errors.push('Question text is required');
  }
  
  if (question.options.length < 2) {
    errors.push('At least 2 options are required');
  }
  
  const correctOptions = question.options.filter(opt => opt.isCorrect);
  if (correctOptions.length !== 1) {
    errors.push('Exactly one correct option is required');
  }
  
  if (question.options.some(opt => !opt.text?.trim())) {
    errors.push('All options must have text');
  }
  
  return errors;
};

// Local storage utilities
export const saveQuestionProgress = (progress: QuestionProgress): void => {
  try {
    localStorage.setItem('mcq_progress', JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save progress to localStorage:', error);
  }
};

export const loadQuestionProgress = (): QuestionProgress | null => {
  try {
    const stored = localStorage.getItem('mcq_progress');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load progress from localStorage:', error);
    return null;
  }
};

// Performance and analytics utilities
export const trackInteraction = (event: string, data?: any): void => {
  // Analytics tracking - can be extended with real analytics service
  console.log(`MCQ Interaction: ${event}`, data);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};