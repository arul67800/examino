export interface HierarchyItem {
  id: string;
  name: string;
  level: number;
  type: string;
  color?: string | null;
  order: number;
  parentId?: string | null;
  questionCount: number;
  children: HierarchyItem[];
  parent?: HierarchyItem | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHierarchyItemInput {
  name: string;
  level: number;
  color?: string;
  parentId?: string;
  questionCount?: number;
}

export interface UpdateHierarchyItemInput {
  name?: string;
  color?: string;
  order?: number;
  questionCount?: number;
}

export interface HierarchyStats {
  level: number;
  type: string;
  count: number;
  totalQuestions: number;
}

export enum HierarchyLevel {
  YEAR = 1,
  SUBJECT = 2,
  PART = 3,
  SECTION = 4,
  CHAPTER = 5
}

export const getTypeByLevel = (level: number): string => {
  switch (level) {
    case 1: return 'Year';
    case 2: return 'Subject';
    case 3: return 'Part';
    case 4: return 'Section';
    case 5: return 'Chapter';
    default: return 'Item';
  }
};