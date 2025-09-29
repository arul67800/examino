// Core MCQ Types and Interfaces
export type QuestionType = 'single-choice' | 'multiple-choice' | 'true-false' | 'assertion-reasoning';
export type ViewMode = 'page' | 'modal' | 'inline';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Base Question Interface
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  explanation?: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  points?: number;
  timeLimit?: number; // in seconds
  createdAt?: Date;
  updatedAt?: Date;
  authorId?: string;
}

// Option Interface
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  image?: string;
}

// Single Choice Question
export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: QuestionOption[];
  correctOptionId: string;
}

// Multiple Choice Question
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: QuestionOption[];
  correctOptionIds: string[];
  minSelections?: number;
  maxSelections?: number;
}

// True/False Question
export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
  statement: string;
}

// Assertion-Reasoning Question
export interface AssertionReasoningQuestion extends BaseQuestion {
  type: 'assertion-reasoning';
  assertion: string;
  reason: string;
  options: {
    id: 'A' | 'B' | 'C' | 'D';
    text: string;
    isCorrect: boolean;
  }[];
  correctOptionId: 'A' | 'B' | 'C' | 'D';
}

// Union type for all question types
export type MCQQuestion = 
  | SingleChoiceQuestion 
  | MultipleChoiceQuestion 
  | TrueFalseQuestion 
  | AssertionReasoningQuestion;

// Question Answer Interface
export interface QuestionAnswer {
  questionId: string;
  selectedOptionIds?: string[];
  selectedValue?: boolean;
  isCorrect?: boolean;
  timeSpent?: number;
  answeredAt?: Date;
}

// Question State Interface
export interface QuestionState {
  isAnswered: boolean;
  selectedOptions: string[];
  selectedValue?: boolean;
  showExplanation: boolean;
  isReviewMode: boolean;
  timeSpent: number;
}

// MCQ Component Props
export interface MCQComponentProps {
  question: MCQQuestion;
  viewMode: ViewMode;
  state?: QuestionState;
  onAnswer?: (answer: QuestionAnswer) => void;
  onStateChange?: (state: Partial<QuestionState>) => void;
  showExplanation?: boolean;
  isReviewMode?: boolean;
  className?: string;
}

// MCQ Editor Props
export interface MCQEditorProps {
  question?: Partial<MCQQuestion>;
  questionType: QuestionType;
  onSave: (question: MCQQuestion) => void;
  onCancel: () => void;
  viewMode?: ViewMode;
  isEditing?: boolean;
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}