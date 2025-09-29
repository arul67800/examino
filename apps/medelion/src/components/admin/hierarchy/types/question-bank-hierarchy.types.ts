// Main Bank Hierarchy Types
export interface QuestionBankHierarchyItem {
  id: string;
  name: string;
  level: number;
  type: QuestionBankHierarchyType;
  color?: string | null;
  order: number;
  parentId?: string | null;
  questionCount: number;
  isPublished: boolean;
  children: QuestionBankHierarchyItem[];
  parent?: QuestionBankHierarchyItem | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionBankHierarchyItemInput {
  name: string;
  level: number;
  type: QuestionBankHierarchyType;
  color?: string;
  parentId?: string;
  questionCount?: number;
}

export interface UpdateQuestionBankHierarchyItemInput {
  name?: string;
  color?: string;
  order?: number;
  questionCount?: number;
  isPublished?: boolean;
}

export interface QuestionBankHierarchyOrderInput {
  id: string;
  order: number;
  parentId?: string;
}

export interface QuestionBankHierarchyStats {
  level: number;
  type: string;
  count: number;
  totalQuestions: number;
  publishedCount: number;
  unpublishedCount: number;
}

export enum QuestionBankHierarchyLevel {
  YEAR = 1,
  SUBJECT = 2,
  PART = 3,
  SECTION = 4,
  CHAPTER = 5
}

export enum QuestionBankHierarchyType {
  YEAR = 'Year',
  SUBJECT = 'Subject',
  PART = 'Part',
  SECTION = 'Section',
  CHAPTER = 'Chapter'
}

export const getQuestionBankTypeByLevel = (level: number): QuestionBankHierarchyType => {
  switch (level) {
    case 1: return QuestionBankHierarchyType.YEAR;
    case 2: return QuestionBankHierarchyType.SUBJECT;
    case 3: return QuestionBankHierarchyType.PART;
    case 4: return QuestionBankHierarchyType.SECTION;
    case 5: return QuestionBankHierarchyType.CHAPTER;
    default: return QuestionBankHierarchyType.CHAPTER;
  }
};

export const getQuestionBankLevelByType = (type: QuestionBankHierarchyType): number => {
  switch (type) {
    case QuestionBankHierarchyType.YEAR: return 1;
    case QuestionBankHierarchyType.SUBJECT: return 2;
    case QuestionBankHierarchyType.PART: return 3;
    case QuestionBankHierarchyType.SECTION: return 4;
    case QuestionBankHierarchyType.CHAPTER: return 5;
    default: return 5;
  }
};

// Main Bank Hierarchy Types
export const QUESTION_BANK_LEVEL_COLORS = {
  1: '#8B5CF6', // Violet - Year
  2: '#6366F1', // Indigo - Subject  
  3: '#3B82F6', // Blue - Part
  4: '#047857', // Dark Green - Section
  5: '#10B981', // Light Green - Chapter
} as const;