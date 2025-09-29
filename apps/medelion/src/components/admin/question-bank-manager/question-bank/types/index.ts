/**
 * Question Bank Types and Interfaces
 * Comprehensive type definitions for the advanced question bank system
 */

// Core Question Types
export interface Question {
  id: string;
  humanId: string;
  type: QuestionType;
  question: string;
  explanation?: string;
  references?: string;
  difficulty: Difficulty;
  points: number;
  timeLimit?: number;
  tags: string[];
  sourceTags?: string[];
  examTags?: string[];
  hierarchyItemId?: string;
  hierarchyPath?: HierarchyPath;
  options: QuestionOption[];
  assertion?: string;
  reasoning?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  explanation?: string;
  references?: string;
  questionId: string;
}

export interface HierarchyPath {
  year?: string;
  subject?: string;
  part?: string;
  section?: string;
  chapter?: string;
}

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  ASSERTION_REASONING = 'ASSERTION_REASONING'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

// Filter and Search Types
export interface QuestionFilters {
  difficulty?: Difficulty[];
  type?: QuestionType[];
  tags?: string[];
  sourceTags?: string[];
  examTags?: string[];
  hierarchyItemId?: string;
  createdBy?: string;
  dateRange?: DateRange;
  points?: NumberRange;
  timeLimit?: NumberRange;
  hasExplanation?: boolean;
  hasReferences?: boolean;
  isActive?: boolean;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface NumberRange {
  min?: number;
  max?: number;
}

export interface SearchQuery {
  query: string;
  filters: QuestionFilters;
  sortBy: SortBy;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export enum SortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  DIFFICULTY = 'difficulty',
  POINTS = 'points',
  HUMAN_ID = 'humanId',
  TYPE = 'type',
  TAGS_COUNT = 'tagsCount'
}

// View and Layout Types
export enum ViewMode {
  GRID = 'grid',
  LIST = 'list',
  TABLE = 'table',
  CARDS = 'cards'
}

export interface ViewSettings {
  mode: ViewMode;
  showPreviews: boolean;
  showHierarchy: boolean;
  showStatistics: boolean;
  compactMode: boolean;
  cardSize: 'small' | 'medium' | 'large';
  columnsToShow: string[];
}

// Pagination Types
export interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Selection and Bulk Operations
export interface SelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export interface BulkOperation {
  type: BulkOperationType;
  questionIds: string[];
  payload?: any;
}

export enum BulkOperationType {
  DELETE = 'delete',
  UPDATE_TAGS = 'updateTags',
  UPDATE_DIFFICULTY = 'updateDifficulty',
  UPDATE_HIERARCHY = 'updateHierarchy',
  EXPORT = 'export',
  DUPLICATE = 'duplicate',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate'
}

// Analytics and Statistics
export interface QuestionBankStats {
  totalQuestions: number;
  activeQuestions: number;
  inactiveQuestions: number;
  byDifficulty: Record<Difficulty, number>;
  byType: Record<QuestionType, number>;
  byHierarchy: HierarchyStats[];
  recentActivity: ActivityItem[];
  popularTags: TagUsage[];
  averagePoints: number;
  averageTimeLimit: number;
}

export interface HierarchyStats {
  hierarchyItemId: string;
  hierarchyPath: HierarchyPath;
  questionCount: number;
  level: number;
}

export interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'imported' | 'exported';
  questionId?: string;
  userId: string;
  timestamp: string;
  details?: any;
}

export interface TagUsage {
  tag: string;
  count: number;
  category: 'tags' | 'sourceTags' | 'examTags';
}

// Import/Export Types
export interface ImportConfig {
  format: 'json' | 'csv' | 'xlsx' | 'xml';
  mapping: FieldMapping;
  options: ImportOptions;
}

export interface FieldMapping {
  [key: string]: string; // maps CSV column to question field
}

export interface ImportOptions {
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateBeforeImport: boolean;
  hierarchyItemId?: string;
  defaultDifficulty: Difficulty;
  defaultPoints: number;
  addTags?: string[];
}

export interface ExportConfig {
  format: 'json' | 'csv' | 'xlsx' | 'pdf' | 'docx';
  includeOptions: boolean;
  includeExplanations: boolean;
  includeReferences: boolean;
  includeMetadata: boolean;
  filters?: QuestionFilters;
  template?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  data: any;
}

export interface ImportWarning {
  row: number;
  message: string;
  data: any;
}

// Quality Control Types
export interface QualityMetrics {
  score: number;
  issues: QualityIssue[];
  suggestions: QualitySuggestion[];
  completeness: number;
  accuracy: number;
  consistency: number;
}

export interface QualityIssue {
  type: QualityIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  field?: string;
  suggestion?: string;
}

export enum QualityIssueType {
  MISSING_EXPLANATION = 'missing_explanation',
  MISSING_REFERENCES = 'missing_references',
  SHORT_QUESTION = 'short_question',
  LONG_QUESTION = 'long_question',
  NO_CORRECT_ANSWER = 'no_correct_answer',
  MULTIPLE_CORRECT_ANSWERS = 'multiple_correct_answers',
  SIMILAR_OPTIONS = 'similar_options',
  GRAMMAR_ISSUES = 'grammar_issues',
  FORMATTING_ISSUES = 'formatting_issues',
  INAPPROPRIATE_DIFFICULTY = 'inappropriate_difficulty',
  MISSING_TAGS = 'missing_tags',
  DUPLICATE_CONTENT = 'duplicate_content'
}

export interface QualitySuggestion {
  type: string;
  message: string;
  action?: () => void;
}

// Component Props Types
export interface QuestionCardProps {
  question: Question;
  selected?: boolean;
  viewMode?: ViewMode;
  showActions?: boolean;
  showPreview?: boolean;
  onSelect?: (questionId: string) => void;
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  onDuplicate?: (questionId: string) => void;
  onPreview?: (questionId: string) => void;
}

export interface FilterPanelProps {
  filters: QuestionFilters;
  availableTags: string[];
  availableHierarchies: HierarchyItem[];
  onFiltersChange: (filters: QuestionFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  placeholder?: string;
  suggestions?: string[];
  isLoading?: boolean;
}

// Hierarchy Integration Types
export interface HierarchyItem {
  id: string;
  name: string;
  level: number;
  type: string;
  parentId?: string;
  children?: HierarchyItem[];
  questionCount: number;
  isPublished: boolean;
  color?: string;
}

// Animation and Theme Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  stagger: number;
}

export interface ThemeAwareProps {
  className?: string;
  style?: React.CSSProperties;
}

// State Management Types
export interface QuestionBankState {
  questions: Question[];
  filters: QuestionFilters;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: 'asc' | 'desc';
  viewSettings: ViewSettings;
  selection: SelectionState;
  pagination: PaginationInfo;
  stats: QuestionBankStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface QuestionBankActions {
  setQuestions: (questions: Question[]) => void;
  setFilters: (filters: QuestionFilters) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: SortBy, sortOrder: 'asc' | 'desc') => void;
  setViewSettings: (settings: Partial<ViewSettings>) => void;
  setSelection: (selection: SelectionState) => void;
  setPagination: (pagination: PaginationInfo) => void;
  setStats: (stats: QuestionBankStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// API Response Types
export interface QuestionResponse extends Question {}

export interface QuestionsListResponse {
  questions: Question[];
  page: number;
  pages: number;
  total: number;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  question: string;
  explanation?: string;
  references?: string;
  difficulty: Difficulty;
  points: number;
  timeLimit?: number;
  tags: string[];
  sourceTags?: string[];
  examTags?: string[];
  hierarchyItemId: string;
  options: Omit<QuestionOption, 'id' | 'questionId'>[];
  assertion?: string;
  reasoning?: string;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  id: string;
}

// Context Types
export interface QuestionBankContextValue {
  state: QuestionBankState;
  actions: QuestionBankActions;
  operations: {
    loadQuestions: () => Promise<void>;
    searchQuestions: (query: SearchQuery) => Promise<void>;
    createQuestion: (question: CreateQuestionRequest) => Promise<void>;
    updateQuestion: (question: UpdateQuestionRequest) => Promise<void>;
    deleteQuestion: (questionId: string) => Promise<void>;
    bulkOperation: (operation: BulkOperation) => Promise<void>;
    exportQuestions: (config: ExportConfig) => Promise<void>;
    importQuestions: (file: File, config: ImportConfig) => Promise<ImportResult>;
    loadStats: () => Promise<void>;
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;