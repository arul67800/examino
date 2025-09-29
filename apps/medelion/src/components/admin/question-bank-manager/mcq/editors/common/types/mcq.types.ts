export type MCQType = 'singleChoice' | 'multipleChoice' | 'trueFalse' | 'assertionReasoning';

export interface MCQData {
  id?: string;
  type: MCQType;
  question: string;
  explanation?: string;
  references?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[]; // Legacy support
  sourceTags?: string[];
  examTags?: string[];
  points?: number;
  timeLimit?: number; // in seconds
  options?: MCQOption[];
  // For assertion-reasoning
  assertion?: string;
  reasoning?: string;
  assertionReasoningOptions?: MCQOption[];
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
  } | {
    hierarchyItemId: string;
    hierarchyLevel: number;
    hierarchyName: string;
    hierarchyType: string;
    hierarchyChain?: any[];
    mode?: 'new' | 'edit';
    mcqId?: string;
  } | null;
  onHierarchyChange?: (hierarchyPath: any) => void;
}

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  references?: string;
  order?: number;
}

export interface FormValidationErrors {
  question?: string;
  options?: string;
  correctAnswer?: string;
  assertion?: string;
  reasoning?: string;
  tags?: string;
  hierarchy?: string;
  questionType?: string;
  explanation?: string;
  settings?: string;
}

export interface FormSectionError {
  id: string;
  message: string;
  field?: string;
  severity: 'error' | 'warning';
}

export interface FormSection {
  id: string;
  name: string;
  isValid: boolean;
  errors: FormSectionError[];
  isRequired: boolean;
  order: number;
}

export interface ValidationResult {
  isValid: boolean;
  sections: FormSection[];
  firstErrorSection?: string;
}

export interface MCQFormData extends MCQData {
  // Ensure required fields have defaults
  type: MCQType;
  question: string;
  options?: MCQOption[];
}