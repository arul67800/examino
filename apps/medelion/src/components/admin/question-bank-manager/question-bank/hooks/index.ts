/**
 * Question Bank Custom Hooks
 * React hooks for managing question bank state and operations
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Question, 
  QuestionFilters, 
  SearchQuery, 
  ViewSettings, 
  SelectionState, 
  QuestionBankStats,
  SortBy,
  ViewMode,
  PaginationInfo,
  BulkOperation,
  ExportConfig,
  ImportConfig,
  ImportResult
} from '../types';
import { questionBankService } from '../services/question-bank-service';
import { processSearchQuery, extractUniqueTags } from '../utils';

/**
 * Main hook for question bank functionality
 */
export const useQuestionBank = () => {
  // Core state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    mode: ViewMode.GRID,
    showPreviews: true,
    showHierarchy: true,
    showStatistics: false,
    compactMode: false,
    cardSize: 'medium',
    columnsToShow: ['question', 'type', 'difficulty', 'created'],
  });

  // Selection state
  const [selection, setSelection] = useState<SelectionState>({
    selectedIds: new Set(),
    isAllSelected: false,
    isIndeterminate: false,
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20,
    hasNext: false,
    hasPrev: false,
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Statistics
  const [stats, setStats] = useState<QuestionBankStats | null>(null);

  /**
   * Load questions from API
   */
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query: SearchQuery = {
        query: searchQuery,
        filters,
        sortBy,
        sortOrder,
        page: pagination.page,
        limit: pagination.limit,
      };

      const result = await questionBankService.getQuestions(query);
      setQuestions(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, sortBy, sortOrder, pagination.page, pagination.limit]);

  /**
   * Process questions with current search and filters
   */
  const processQuestions = useCallback(() => {
    const query: SearchQuery = {
      query: searchQuery,
      filters,
      sortBy,
      sortOrder,
      page: 1,
      limit: questions.length,
    };

    const result = processSearchQuery(questions, query);
    setFilteredQuestions(result.questions);
    
    // Update pagination for filtered results
    setPagination(prev => ({
      ...prev,
      total: result.pagination.total,
      pages: Math.ceil(result.pagination.total / prev.limit),
    }));
  }, [questions, searchQuery, filters, sortBy, sortOrder]);

  /**
   * Load statistics
   */
  const loadStats = useCallback(async () => {
    try {
      const statsData = await questionBankService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  /**
   * Create a new question
   */
  const createQuestion = useCallback(async (questionData: any) => {
    setIsLoading(true);
    try {
      await questionBankService.createQuestion(questionData);
      await loadQuestions();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadQuestions, loadStats]);

  /**
   * Update an existing question
   */
  const updateQuestion = useCallback(async (questionData: any) => {
    setIsLoading(true);
    try {
      await questionBankService.updateQuestion(questionData);
      await loadQuestions();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadQuestions, loadStats]);

  /**
   * Delete a question
   */
  const deleteQuestion = useCallback(async (questionId: string) => {
    setIsLoading(true);
    try {
      await questionBankService.deleteQuestion(questionId);
      await loadQuestions();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadQuestions, loadStats]);

  /**
   * Perform bulk operations
   */
  const performBulkOperation = useCallback(async (operation: BulkOperation) => {
    setIsLoading(true);
    try {
      await questionBankService.bulkOperation(operation);
      await loadQuestions();
      await loadStats();
      setSelection({
        selectedIds: new Set(),
        isAllSelected: false,
        isIndeterminate: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk operation failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadQuestions, loadStats]);

  // Update filtered questions when dependencies change
  useEffect(() => {
    processQuestions();
  }, [processQuestions]);

  // Initial load
  useEffect(() => {
    loadQuestions();
    loadStats();
  }, []);

  return {
    // State
    questions: filteredQuestions,
    allQuestions: questions,
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    viewSettings,
    selection,
    pagination,
    stats,
    isLoading,
    error,

    // Actions
    setFilters,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    setViewSettings,
    setSelection,
    setPagination,

    // Operations
    loadQuestions,
    loadStats,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    performBulkOperation,
    refreshData: () => Promise.all([loadQuestions(), loadStats()]),
  };
};

/**
 * Hook for managing question selection
 */
export const useQuestionSelection = (questions: Question[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((questionId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(questions.map(q => q.id)));
  }, [questions]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === questions.length) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [selectedIds.size, questions.length, clearSelection, selectAll]);

  const selectionState = useMemo(() => ({
    selectedIds,
    selectedQuestions: questions.filter(q => selectedIds.has(q.id)),
    isAllSelected: questions.length > 0 && selectedIds.size === questions.length,
    isIndeterminate: selectedIds.size > 0 && selectedIds.size < questions.length,
    selectedCount: selectedIds.size,
  }), [selectedIds, questions]);

  return {
    ...selectionState,
    toggleSelection,
    selectAll,
    clearSelection,
    toggleSelectAll,
    setSelectedIds,
  };
};

/**
 * Hook for managing search and filters
 */
export const useQuestionSearch = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const addToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== searchQuery);
      return [searchQuery, ...filtered].slice(0, 10);
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const updateFilter = useCallback((key: keyof QuestionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setFilters({});
  }, []);

  return {
    query,
    filters,
    suggestions,
    recentSearches,
    setQuery,
    setFilters,
    updateFilter,
    clearFilters,
    clearAll,
    addToRecentSearches,
    clearRecentSearches,
  };
};

/**
 * Hook for managing view settings
 */
export const useViewSettings = () => {
  const [settings, setSettings] = useState<ViewSettings>({
    mode: ViewMode.GRID,
    showPreviews: true,
    showHierarchy: true,
    showStatistics: false,
    compactMode: false,
    cardSize: 'medium',
    columnsToShow: ['question', 'type', 'difficulty', 'created'],
  });

  const updateSetting = useCallback(<K extends keyof ViewSettings>(
    key: K,
    value: ViewSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const toggleSetting = useCallback((key: keyof ViewSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({
      mode: ViewMode.GRID,
      showPreviews: true,
      showHierarchy: true,
      showStatistics: false,
      compactMode: false,
      cardSize: 'medium',
      columnsToShow: ['question', 'type', 'difficulty', 'created'],
    });
  }, []);

  return {
    settings,
    updateSetting,
    toggleSetting,
    resetSettings,
  };
};

/**
 * Hook for export functionality
 */
export const useQuestionExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportQuestions = useCallback(async (config: ExportConfig) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const blob = await questionBankService.exportQuestions(config);
      
      clearInterval(progressInterval);
      setExportProgress(100);

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions-export-${Date.now()}.${config.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, []);

  return {
    isExporting,
    exportProgress,
    exportQuestions,
  };
};

/**
 * Hook for import functionality
 */
export const useQuestionImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const importQuestions = useCallback(async (file: File, config: ImportConfig): Promise<ImportResult> => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const result = await questionBankService.importQuestions(file, config);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResult(result);

      return result;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  }, []);

  const clearImportResult = useCallback(() => {
    setImportResult(null);
  }, []);

  return {
    isImporting,
    importProgress,
    importResult,
    importQuestions,
    clearImportResult,
  };
};

/**
 * Hook for debounced search
 */
export const useDebouncedSearch = (callback: (query: string) => void, delay: number = 300) => {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(query);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, callback, delay]);

  return [query, setQuery] as const;
};

/**
 * Hook for managing local storage persistence
 */
export const useLocalStoragePersistence = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error(`Failed to save to localStorage:`, error);
        }
      }
      
      return valueToStore;
    });
  }, [key]);

  return [value, setStoredValue] as const;
};

/**
 * Hook for extracting available filter options from questions
 */
export const useFilterOptions = (questions: Question[]) => {
  return useMemo(() => {
    const tags = extractUniqueTags(questions);
    const creators = Array.from(new Set(questions.map(q => q.createdBy).filter(Boolean))).sort();
    const hierarchyIds = Array.from(new Set(questions.map(q => q.hierarchyItemId).filter(Boolean)));

    return {
      ...tags,
      creators,
      hierarchyIds,
      difficulties: ['EASY', 'MEDIUM', 'HARD'],
      types: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'ASSERTION_REASONING'],
    };
  }, [questions]);
};

/**
 * Hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = (handlers: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      const isAlt = event.altKey;

      let shortcut = '';
      if (isCtrl) shortcut += 'ctrl+';
      if (isShift) shortcut += 'shift+';
      if (isAlt) shortcut += 'alt+';
      shortcut += key;

      if (handlers[shortcut]) {
        event.preventDefault();
        handlers[shortcut]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};