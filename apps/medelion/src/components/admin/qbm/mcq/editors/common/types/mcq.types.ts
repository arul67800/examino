export interface MCQData {
  id?: string;
  type: 'singleChoice' | 'multipleChoice' | 'trueFalse' | 'assertionReasoning';
  question: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  points?: number;
  timeLimit?: number; // in seconds
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  // For assertion-reasoning
  assertion?: string;
  reasoning?: string;
  assertionReasoningOptions?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface MCQEditorProps {
  mcqData?: Partial<MCQData>;
  onSave: (data: MCQData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  hierarchyContext?: {
    subject?: string;
    chapter?: string;
    topic?: string;
    subtopic?: string;
  };
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type MCQType = 'singleChoice' | 'multipleChoice' | 'trueFalse' | 'assertionReasoning';

export interface FormValidationErrors {
  question?: string;
  options?: string;
  correctAnswer?: string;
  assertion?: string;
  reasoning?: string;
  tags?: string;
}

export interface MCQFormData extends MCQData {
  // Ensure required fields have defaults
  type: MCQType;
  question: string;
  options?: MCQOption[];
}