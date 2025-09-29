// Previous Papers Hierarchy Types
export interface PreviousPapersHierarchyItem {
  id: string;
  name: string;
  level: number;
  type: PreviousPapersHierarchyType;
  color?: string | null;
  order: number;
  parentId?: string | null;
  questionCount: number;
  isPublished: boolean;
  children: PreviousPapersHierarchyItem[];
  parent?: PreviousPapersHierarchyItem | null;
  createdAt: string;
  updatedAt: string;
}

// Use the schema-defined input types
export interface CreatePreviousPapersHierarchyItemInput {
  name: string;
  level: number;
  color?: string;
  parentId?: string;
  questionCount?: number;
}

export interface UpdatePreviousPapersHierarchyItemInput {
  name?: string;
  color?: string;
  order?: number;
  questionCount?: number;
}

export interface PreviousPapersHierarchyOrderInput {
  id: string;
  order: number;
}

export interface PreviousPapersHierarchyStats {
  level: number;
  type: string;
  count: number;
  totalQuestions: number;
}

export enum PreviousPapersHierarchyLevel {
  EXAM = 1,
  YEAR = 2,
  SUBJECT = 3,
  SECTION = 4,
  CHAPTER = 5
}

export enum PreviousPapersHierarchyType {
  EXAM = 'Exam',
  YEAR = 'Year',
  SUBJECT = 'Subject',
  SECTION = 'Section',
  CHAPTER = 'Chapter'
}

export const getPreviousPapersTypeByLevel = (level: number): PreviousPapersHierarchyType => {
  switch (level) {
    case 1: return PreviousPapersHierarchyType.EXAM;
    case 2: return PreviousPapersHierarchyType.YEAR;
    case 3: return PreviousPapersHierarchyType.SUBJECT;
    case 4: return PreviousPapersHierarchyType.SECTION;
    case 5: return PreviousPapersHierarchyType.CHAPTER;
    default: return PreviousPapersHierarchyType.CHAPTER;
  }
};

export const getPreviousPapersLevelByType = (type: PreviousPapersHierarchyType): number => {
  switch (type) {
    case PreviousPapersHierarchyType.EXAM: return 1;
    case PreviousPapersHierarchyType.YEAR: return 2;
    case PreviousPapersHierarchyType.SUBJECT: return 3;
    case PreviousPapersHierarchyType.SECTION: return 4;
    case PreviousPapersHierarchyType.CHAPTER: return 5;
    default: return 5;
  }
};

// Previous Papers specific color palette
export const PREVIOUS_PAPERS_LEVEL_COLORS = {
  1: '#DC2626', // Red - Exam
  2: '#EA580C', // Orange - Year
  3: '#D97706', // Amber - Subject
  4: '#059669', // Emerald - Section
  5: '#7C3AED', // Purple - Chapter (MCQs can be stored here)
} as const;