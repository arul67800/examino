import { 
  QuestionBankHierarchyType, 
  QUESTION_BANK_LEVEL_COLORS,
  getQuestionBankTypeByLevel 
} from '../types/question-bank-hierarchy.types';
import { 
  PreviousPapersHierarchyType, 
  PREVIOUS_PAPERS_LEVEL_COLORS,
  getPreviousPapersTypeByLevel 
} from '../types/previous-papers-hierarchy.types';

export type HierarchyMode = 'question-bank' | 'previous-papers';

export interface HierarchyConfig {
  mode: HierarchyMode;
  title: string;
  description: string;
  icon: string;
  maxLevels: number;
  levelColors: Record<number, string>;
  levelNames: Record<number, string>;
  getTypeByLevel: (level: number) => string;
  headerColors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

export const QUESTION_BANK_CONFIG: HierarchyConfig = {
  mode: 'question-bank',
  title: 'Main Bank Hierarchy',
  description: 'Organize your questions by Year → Subject → Part → Section → Chapter',
  icon: '📚',
  maxLevels: 5,
  levelColors: {
    1: '#8B5CF6', // Violet - Year
    2: '#6366F1', // Indigo - Subject  
    3: '#3B82F6', // Blue - Part
    4: '#047857', // Dark Green - Section
    5: '#10B981', // Light Green - Chapter
  },
  levelNames: {
    1: 'Year',
    2: 'Subject', 
    3: 'Part',
    4: 'Section',
    5: 'Chapter'
  },
  getTypeByLevel: (level: number) => getQuestionBankTypeByLevel(level),
  headerColors: {
    primary: '#8B5CF6', // Violet
    secondary: '#6366F1', // Indigo  
    tertiary: '#3B82F6'   // Blue
  }
};

export const PREVIOUS_PAPERS_CONFIG: HierarchyConfig = {
  mode: 'previous-papers',
  title: 'Previous Papers Hierarchy', 
  description: 'Organize previous papers by Exam → Year → Subject → Section → Chapter',
  icon: '📄',
  maxLevels: 5,
  levelColors: {
    1: '#DC2626', // Red - Exam
    2: '#EA580C', // Orange - Year
    3: '#D97706', // Amber - Subject
    4: '#059669', // Emerald - Section
    5: '#7C3AED', // Purple - Chapter
  },
  levelNames: {
    1: 'Exam',
    2: 'Year',
    3: 'Subject', 
    4: 'Section',
    5: 'Chapter'
  },
  getTypeByLevel: (level: number) => getPreviousPapersTypeByLevel(level),
  headerColors: {
    primary: '#DC2626', // Red
    secondary: '#EA580C', // Orange
    tertiary: '#D97706'   // Amber
  }
};

export const getHierarchyConfig = (mode: HierarchyMode): HierarchyConfig => {
  return mode === 'question-bank' ? QUESTION_BANK_CONFIG : PREVIOUS_PAPERS_CONFIG;
};

export const getLevelName = (level: number, mode: HierarchyMode): string => {
  const config = getHierarchyConfig(mode);
  return config.levelNames[level] || 'Unknown';
};

export const getLevelColor = (level: number, mode: HierarchyMode): string => {
  const config = getHierarchyConfig(mode);
  return config.levelColors[level] || '#6B7280';
};

export const canHaveMCQs = (level: number, mode: HierarchyMode): boolean => {
  const config = getHierarchyConfig(mode);
  // MCQs can be stored in the last 2 levels for both hierarchies
  return level >= (config.maxLevels - 1); // Last 2 levels (4 and 5 for both hierarchies)
};