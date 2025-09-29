/**
 * Question Bank Utilities
 * Common utility functions for the question bank system
 */

import { 
  Question, 
  QuestionFilters, 
  SearchQuery, 
  ViewMode, 
  SortBy,
  Difficulty,
  QuestionType,
  HierarchyPath 
} from '../types';

/**
 * Filter questions based on criteria
 */
export const filterQuestions = (questions: Question[], filters: QuestionFilters): Question[] => {
  return questions.filter(question => {
    // Difficulty filter
    if (filters.difficulty?.length && !filters.difficulty.includes(question.difficulty as Difficulty)) {
      return false;
    }

    // Type filter
    if (filters.type?.length && !filters.type.includes(question.type as QuestionType)) {
      return false;
    }

    // Tags filter
    if (filters.tags?.length) {
      const hasMatchingTag = filters.tags.some(tag => 
        question.tags?.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Source tags filter
    if (filters.sourceTags?.length) {
      const hasMatchingSourceTag = filters.sourceTags.some(tag => 
        question.sourceTags?.includes(tag)
      );
      if (!hasMatchingSourceTag) return false;
    }

    // Exam tags filter
    if (filters.examTags?.length) {
      const hasMatchingExamTag = filters.examTags.some(tag => 
        question.examTags?.includes(tag)
      );
      if (!hasMatchingExamTag) return false;
    }

    // Hierarchy filter
    if (filters.hierarchyItemId && question.hierarchyItemId !== filters.hierarchyItemId) {
      return false;
    }

    // Created by filter
    if (filters.createdBy && question.createdBy !== filters.createdBy) {
      return false;
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const createdDate = new Date(question.createdAt);
      if (filters.dateRange.from && createdDate < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && createdDate > filters.dateRange.to) {
        return false;
      }
    }

    // Points range filter
    if (filters.points) {
      if (filters.points.min !== undefined && question.points < filters.points.min) {
        return false;
      }
      if (filters.points.max !== undefined && question.points > filters.points.max) {
        return false;
      }
    }

    // Time limit range filter
    if (filters.timeLimit && question.timeLimit) {
      if (filters.timeLimit.min !== undefined && question.timeLimit < filters.timeLimit.min) {
        return false;
      }
      if (filters.timeLimit.max !== undefined && question.timeLimit > filters.timeLimit.max) {
        return false;
      }
    }

    // Has explanation filter
    if (filters.hasExplanation !== undefined) {
      if (filters.hasExplanation && !question.explanation) {
        return false;
      }
      if (!filters.hasExplanation && question.explanation) {
        return false;
      }
    }

    // Has references filter
    if (filters.hasReferences !== undefined) {
      if (filters.hasReferences && !question.references) {
        return false;
      }
      if (!filters.hasReferences && question.references) {
        return false;
      }
    }

    // Active status filter
    if (filters.isActive !== undefined && question.isActive !== filters.isActive) {
      return false;
    }

    return true;
  });
};

/**
 * Search questions based on query string
 */
export const searchQuestions = (questions: Question[], query: string): Question[] => {
  if (!query.trim()) return questions;

  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return questions.filter(question => {
    const searchableText = [
      question.question,
      question.explanation || '',
      question.references || '',
      question.humanId,
      ...(question.tags || []),
      ...(question.sourceTags || []),
      ...(question.examTags || []),
      question.assertion || '',
      question.reasoning || '',
      ...question.options.map(opt => opt.text),
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });
};

/**
 * Sort questions based on criteria
 */
export const sortQuestions = (questions: Question[], sortBy: SortBy, sortOrder: 'asc' | 'desc'): Question[] => {
  const sorted = [...questions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case SortBy.CREATED_AT:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case SortBy.UPDATED_AT:
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case SortBy.DIFFICULTY:
        const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
        aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
        bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
        break;
      case SortBy.POINTS:
        aValue = a.points;
        bValue = b.points;
        break;
      case SortBy.HUMAN_ID:
        aValue = a.humanId;
        bValue = b.humanId;
        break;
      case SortBy.TYPE:
        aValue = a.type;
        bValue = b.type;
        break;
      case SortBy.TAGS_COUNT:
        aValue = (a.tags?.length || 0) + (a.sourceTags?.length || 0) + (a.examTags?.length || 0);
        bValue = (b.tags?.length || 0) + (b.sourceTags?.length || 0) + (b.examTags?.length || 0);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

/**
 * Paginate questions array
 */
export const paginateQuestions = (questions: Question[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedQuestions = questions.slice(startIndex, endIndex);
  
  return {
    questions: paginatedQuestions,
    pagination: {
      page,
      pages: Math.ceil(questions.length / limit),
      total: questions.length,
      limit,
      hasNext: endIndex < questions.length,
      hasPrev: page > 1,
    },
  };
};

/**
 * Process search query with all filters, search, and sorting
 */
export const processSearchQuery = (questions: Question[], searchQuery: SearchQuery) => {
  // Apply filters first
  let filteredQuestions = filterQuestions(questions, searchQuery.filters);
  
  // Then apply search query
  if (searchQuery.query.trim()) {
    filteredQuestions = searchQuestions(filteredQuestions, searchQuery.query);
  }
  
  // Sort the results
  const sortedQuestions = sortQuestions(filteredQuestions, searchQuery.sortBy, searchQuery.sortOrder);
  
  // Paginate the results
  return paginateQuestions(sortedQuestions, searchQuery.page, searchQuery.limit);
};

/**
 * Generate display text for hierarchy path
 */
export const formatHierarchyPath = (hierarchyPath?: HierarchyPath): string => {
  if (!hierarchyPath) return 'No hierarchy';
  
  const parts = [];
  if (hierarchyPath.year) parts.push(hierarchyPath.year);
  if (hierarchyPath.subject) parts.push(hierarchyPath.subject);
  if (hierarchyPath.part) parts.push(hierarchyPath.part);
  if (hierarchyPath.section) parts.push(hierarchyPath.section);
  if (hierarchyPath.chapter) parts.push(hierarchyPath.chapter);
  
  return parts.join(' > ') || 'No hierarchy';
};

/**
 * Format difficulty with proper casing
 */
export const formatDifficulty = (difficulty: string): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
};

/**
 * Format question type for display
 */
export const formatQuestionType = (type: string): string => {
  switch (type) {
    case 'SINGLE_CHOICE':
      return 'Single Choice';
    case 'MULTIPLE_CHOICE':
      return 'Multiple Choice';
    case 'TRUE_FALSE':
      return 'True/False';
    case 'ASSERTION_REASONING':
      return 'Assertion & Reasoning';
    default:
      return type;
  }
};

/**
 * Get difficulty color class
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'hard':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Get type icon
 */
export const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'SINGLE_CHOICE':
      return '●';
    case 'MULTIPLE_CHOICE':
      return '☐';
    case 'TRUE_FALSE':
      return '◐';
    case 'ASSERTION_REASONING':
      return '↔';
    default:
      return '?';
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Extract text content from HTML
 */
export const extractTextFromHTML = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Calculate reading time for question
 */
export const calculateReadingTime = (question: Question): number => {
  const wordsPerMinute = 200;
  const text = [
    question.question,
    question.explanation || '',
    question.references || '',
    ...question.options.map(opt => opt.text),
  ].join(' ');
  
  const wordCount = extractTextFromHTML(text).split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

/**
 * Generate question summary
 */
export const generateQuestionSummary = (question: Question): string => {
  const text = extractTextFromHTML(question.question);
  return truncateText(text, 150);
};

/**
 * Validate question data
 */
export const validateQuestion = (question: Partial<Question>): string[] => {
  const errors: string[] = [];

  if (!question.question?.trim()) {
    errors.push('Question text is required');
  }

  if (!question.type) {
    errors.push('Question type is required');
  }

  if (!question.difficulty) {
    errors.push('Difficulty level is required');
  }

  if (!question.points || question.points <= 0) {
    errors.push('Points must be greater than 0');
  }

  if (!question.options || question.options.length < 2) {
    errors.push('At least 2 options are required');
  }

  if (question.options) {
    const correctAnswers = question.options.filter(opt => opt.isCorrect);
    
    if (question.type === 'SINGLE_CHOICE' && correctAnswers.length !== 1) {
      errors.push('Single choice questions must have exactly one correct answer');
    }
    
    if (question.type === 'TRUE_FALSE' && question.options.length !== 2) {
      errors.push('True/False questions must have exactly 2 options');
    }
    
    if (correctAnswers.length === 0) {
      errors.push('At least one option must be marked as correct');
    }
  }

  return errors;
};

/**
 * Generate unique tags from questions
 */
export const extractUniqueTags = (questions: Question[]): {
  tags: string[];
  sourceTags: string[];
  examTags: string[];
} => {
  const tagSets = {
    tags: new Set<string>(),
    sourceTags: new Set<string>(),
    examTags: new Set<string>(),
  };

  questions.forEach(question => {
    question.tags?.forEach(tag => tagSets.tags.add(tag));
    question.sourceTags?.forEach(tag => tagSets.sourceTags.add(tag));
    question.examTags?.forEach(tag => tagSets.examTags.add(tag));
  });

  return {
    tags: Array.from(tagSets.tags).sort(),
    sourceTags: Array.from(tagSets.sourceTags).sort(),
    examTags: Array.from(tagSets.examTags).sort(),
  };
};

/**
 * Calculate question complexity score
 */
export const calculateComplexityScore = (question: Question): number => {
  let score = 1;

  // Base on question length
  const questionLength = extractTextFromHTML(question.question).length;
  if (questionLength > 100) score += 0.5;
  if (questionLength > 200) score += 0.5;

  // Base on number of options
  if (question.options.length > 4) score += 0.5;
  if (question.options.length > 6) score += 0.5;

  // Base on question type
  if (question.type === 'MULTIPLE_CHOICE') score += 0.5;
  if (question.type === 'ASSERTION_REASONING') score += 1;

  // Base on presence of explanation/references
  if (question.explanation) score += 0.3;
  if (question.references) score += 0.2;

  // Base on difficulty
  switch (question.difficulty) {
    case 'MEDIUM':
      score += 0.5;
      break;
    case 'HARD':
      score += 1;
      break;
  }

  return Math.min(5, Math.max(1, score));
};

/**
 * Export utilities for different view modes
 */
export const getViewModeConfig = (viewMode: ViewMode): {
  containerClass: string;
  itemClass: string;
  showFullContent: boolean;
} => {
  switch (viewMode) {
    case ViewMode.GRID:
      return {
        containerClass: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        itemClass: 'bg-white rounded-lg shadow-sm border p-4',
        showFullContent: false,
      };
    case ViewMode.LIST:
      return {
        containerClass: 'space-y-2',
        itemClass: 'bg-white rounded-lg shadow-sm border p-3 flex items-center',
        showFullContent: false,
      };
    case ViewMode.TABLE:
      return {
        containerClass: 'overflow-x-auto',
        itemClass: '',
        showFullContent: false,
      };
    case ViewMode.CARDS:
      return {
        containerClass: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
        itemClass: 'bg-white rounded-xl shadow-md border p-6',
        showFullContent: true,
      };
    default:
      return getViewModeConfig(ViewMode.GRID);
  }
};

/**
 * Deep clone utility for questions
 */
export const cloneQuestion = (question: Question): Question => {
  return JSON.parse(JSON.stringify(question));
};

/**
 * Generate question ID suggestions
 */
export const generateHumanIdSuggestion = (question: Partial<Question>, hierarchyPath?: HierarchyPath): string => {
  const parts: string[] = [];

  if (hierarchyPath?.subject) {
    parts.push(hierarchyPath.subject.substring(0, 4).toUpperCase());
  }

  if (hierarchyPath?.chapter) {
    parts.push(hierarchyPath.chapter.substring(0, 3).toUpperCase());
  }

  // Add question type prefix
  switch (question.type) {
    case 'SINGLE_CHOICE':
      parts.push('SC');
      break;
    case 'MULTIPLE_CHOICE':
      parts.push('MC');
      break;
    case 'TRUE_FALSE':
      parts.push('TF');
      break;
    case 'ASSERTION_REASONING':
      parts.push('AR');
      break;
  }

  // Add difficulty indicator
  if (question.difficulty) {
    parts.push(question.difficulty.charAt(0));
  }

  // Add timestamp-based suffix
  const timestamp = Date.now().toString(36).toUpperCase();
  parts.push(timestamp.slice(-3));

  return parts.join('-');
};

/**
 * Compare two questions for similarity
 */
export const calculateQuestionSimilarity = (q1: Question, q2: Question): number => {
  const text1 = extractTextFromHTML(q1.question).toLowerCase();
  const text2 = extractTextFromHTML(q2.question).toLowerCase();

  // Simple similarity based on common words
  const words1 = new Set(text1.split(/\s+/));
  const words2 = new Set(text2.split(/\s+/));

  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
};

/**
 * Find potential duplicate questions
 */
export const findPotentialDuplicates = (questions: Question[], threshold: number = 0.8): Array<{
  question1: Question;
  question2: Question;
  similarity: number;
}> => {
  const duplicates: Array<{
    question1: Question;
    question2: Question;
    similarity: number;
  }> = [];

  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const similarity = calculateQuestionSimilarity(questions[i], questions[j]);
      if (similarity >= threshold) {
        duplicates.push({
          question1: questions[i],
          question2: questions[j],
          similarity,
        });
      }
    }
  }

  return duplicates.sort((a, b) => b.similarity - a.similarity);
};