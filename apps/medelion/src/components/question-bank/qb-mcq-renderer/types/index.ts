// Core question and answer types
export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  media?: MediaContent;
}

export interface MCQQuestion {
  id: string;
  questionText: string;
  options: MCQOption[];
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  chapter?: string;
  section?: string;
  tags: string[];
  estimatedTime: number; // in seconds
  media?: MediaContent;
  detailedExplanation: string;
  learningObjectives: string[];
  references?: Reference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaContent {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  alt?: string;
  caption?: string;
  duration?: number; // for video/audio
}

export interface Reference {
  title: string;
  author?: string;
  url?: string;
  page?: number;
  type: 'book' | 'article' | 'website' | 'paper';
}

// User interaction and progress types
export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  attempts: number;
  answeredAt: Date;
}

export interface QuestionProgress {
  questionsAnswered: number;
  correctAnswers: number;
  totalQuestions: number;
  averageTime: number;
  difficultyBreakdown: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
}

// Component state types
export interface QuestionState {
  currentQuestion: MCQQuestion | null;
  selectedOption: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  showExplanation: boolean;
  timeSpent: number;
  attempts: number;
  showFeedback: boolean;
}

export interface RendererState {
  questions: MCQQuestion[];
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  progress: QuestionProgress;
  isLoading: boolean;
  error: string | null;
  sessionStartTime: Date;
  settings: RendererSettings;
}

export interface RendererSettings {
  showTimer: boolean;
  allowMultipleAttempts: boolean;
  showInstantFeedback: boolean;
  showProgressBar: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number; // in milliseconds
  showDifficultyIndicator: boolean;
  enableKeyboardNavigation: boolean;
  animationsEnabled: boolean;
}

// Animation and interaction types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce' | 'pulse';

export interface FeedbackAnimation {
  type: AnimationType;
  duration: number;
  delay?: number;
}

export interface InteractionEvent {
  type: 'option_select' | 'option_hover' | 'explanation_expand' | 'question_submit' | 'navigation';
  timestamp: Date;
  data?: any;
}

// Theme and styling types
export interface McqTheme {
  colors: {
    correct: string;
    incorrect: string;
    selected: string;
    hover: string;
    neutral: string;
    warning: string;
  };
  animations: {
    feedback: FeedbackAnimation;
    transition: FeedbackAnimation;
  };
}