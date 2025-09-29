/**
 * Question Bank Dashboard - Main Page
 * Advanced MCQ dashboard with hierarchy selectors and comprehensi  const [individualSelections, setIndividualSelections] = useState<IndividualSelections>({
    level1: null,
    level2: null,
    level3: null,
    level4: null,
    level5: null,
    mcq: null
  });res
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from '@/theme';
import { useRouter } from 'next/navigation';
import { 
  MCQHierarchyBreadcrumb, 
  HierarchyPath,
  CombinedBreadcrumbSelector 
} from '../mcq/breadcrumb';
import { HierarchyBreadcrumbSelector, HierarchyType } from '../mcq/breadcrumb/hierarchy-breadcrumb-selector';
import { IndividualBreadcrumbSelector } from '../mcq/breadcrumb/individual-breadcrumb-selector';
import { useQuestionBankHierarchy, usePreviousPapersHierarchy } from '@/components/admin/hierarchy';
import { HierarchyItem } from '@/lib/types/hierarchy.types';
import { 
  HierarchyMode, 
  getHierarchyConfig, 
  getLevelName, 
  getLevelColor 
} from '@/components/admin/hierarchy/config/hierarchy-config';
import { 
  useQuestionBank, 
  useQuestionSelection, 
  useQuestionSearch,
  useLocalStoragePersistence 
} from './hooks';
import { 
  Question, 
  ViewSettings, 
  ViewMode, 
  ExportConfig, 
  ImportConfig,
  BulkOperation 
} from './types';

// Component imports
import { QuestionGrid } from './components/question-grid';
import { QuestionList } from './components/question-list';
import { QuestionTable } from './components/question-table';
import { StatsDashboard } from './stats-dashboard';

import { FilterPanel } from './filters/filter-panel';
import { SearchBar } from './search/search-bar';
import { StatisticsPanel } from './analytics/statistics-panel';
import { BulkActionsBar } from './bulk-operations';
import { ImportModal } from './import/import-modal';
import { ExportModal } from './export/export-modal';
import { PreviewModal } from './preview/preview-modal';
import { ViewSettingsModal } from './settings/view-settings-modal';
import { SmallHierarchySelectors } from './components/small-hierarchy-selectors';

// Filter and Sort Types
interface FilterState {
  hierarchyPath: HierarchyPath;
  difficulty: string[];
}

// Dynamic hierarchy selections based on hierarchy type
interface IndividualSelections {
  level1: HierarchyItem | null; // Year (QB) or Exam (PP)
  level2: HierarchyItem | null; // Subject (QB) or Year (PP)
  level3: HierarchyItem | null; // Part (QB) or Subject (PP)
  level4: HierarchyItem | null; // Section (QB) or Section (PP)
  level5: HierarchyItem | null; // Chapter (QB) or Chapter (PP)
  mcq: HierarchyItem | null;
}

interface SortState {
  field: 'created' | 'updated' | 'difficulty' | 'type' | 'humanId';
  direction: 'asc' | 'desc';
}

export default function QuestionBankDashboard() {
  const { theme } = useTheme();
  const router = useRouter();
  
  // Main question bank hook
  const questionBank = useQuestionBank();
  
  // State Management for Filters
  const [filters, setFilters] = useState<FilterState>({
    hierarchyPath: {},
    difficulty: [],
    tags: [],
    dateRange: {},
    searchQuery: '',
    isActive: undefined
  });
  
  const [sort, setSort] = useState<SortState>({
    field: 'updated',
    direction: 'desc'
  });
  
  // Hierarchy selector states
  const [selectedHierarchyType, setSelectedHierarchyType] = useState<HierarchyType | null>(null);
  const [hierarchyDropdowns, setHierarchyDropdowns] = useState({
    level1: false,
    level2: false,
    level3: false,
    level4: false,
    level5: false,
    mcq: false
  });
  
  // Individual level selections
  const [individualSelections, setIndividualSelections] = useState<IndividualSelections>({
    level1: null,
    level2: null,
    level3: null,
    section: null as HierarchyItem | null,
    chapter: null as HierarchyItem | null,
    mcq: null as HierarchyItem | null
  });

  // Hierarchy data hooks
  const questionBankHierarchy = useQuestionBankHierarchy();
  const previousPapersHierarchy = usePreviousPapersHierarchy();
  
  // Get current hierarchy data based on selected type
  const currentHierarchy = selectedHierarchyType === 'question-bank' 
    ? questionBankHierarchy 
    : selectedHierarchyType === 'previous-papers' 
    ? previousPapersHierarchy 
    : null;

  // Selection management
  const selection = useQuestionSelection(questionBank.questions);

  // Search management
  const search = useQuestionSearch();

  // Local state for view settings with persistence
  const [viewSettings, setLocalViewSettings] = useLocalStoragePersistence<ViewSettings>('questionBankViewSettings', questionBank.viewSettings);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Hierarchy Event Handlers
  const handleHierarchyChange = (hierarchyPath: HierarchyPath) => {
    setFilters(prev => ({ ...prev, hierarchyPath }));
    
    // Find the most specific item in the hierarchy path for filtering
    const mostSpecificItem = hierarchyPath.mcq || 
      hierarchyPath.chapter || 
      hierarchyPath.section || 
      hierarchyPath.part || 
      hierarchyPath.subject || 
      hierarchyPath.year;
    
    // Reload questions with new hierarchy filter
    questionBank.setFilters({
      ...questionBank.filters,
      hierarchyItemId: mostSpecificItem?.id
    });
  };

  const clearFilters = () => {
    setFilters({
      hierarchyPath: {},
      difficulty: [],
      questionType: [],
      tags: [],
      dateRange: {},
      searchQuery: '',
      isActive: undefined
    });
    // Also clear individual selections
    setSelectedHierarchyType(null);
    setIndividualSelections({
      year: null,
      subject: null,
      part: null,
      section: null,
      chapter: null,
      mcq: null
    });
    
    // Clear question bank filters to show all questions
    questionBank.setFilters({
      ...questionBank.filters,
      hierarchyItemId: undefined
    });
  };
  
  // Dropdown handlers
  const toggleDropdown = (dropdown: keyof typeof hierarchyDropdowns) => {
    setHierarchyDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown],
      // Close other dropdowns
      ...Object.keys(prev).reduce((acc, key) => {
        if (key !== dropdown) acc[key as keyof typeof prev] = false;
        return acc;
      }, {} as Partial<typeof prev>)
    }));
  };
  
    // Individual level selection handlers
  const handleIndividualSelection = (level: keyof typeof individualSelections, item: HierarchyItem | null) => {
    setIndividualSelections(prev => ({
      ...prev,
      [level]: item,
      // Clear dependent levels
      ...(level === 'year' && { subject: null, part: null, section: null, chapter: null, mcq: null }),
      ...(level === 'subject' && { part: null, section: null, chapter: null, mcq: null }),
      ...(level === 'part' && { section: null, chapter: null, mcq: null }),
      ...(level === 'section' && { chapter: null, mcq: null }),
      ...(level === 'chapter' && { mcq: null })
    }));
    
    // Update filters hierarchyPath
    const newHierarchyPath = { ...filters.hierarchyPath };
    if (item) {
      newHierarchyPath[level] = item;
    } else {
      delete newHierarchyPath[level];
    }
    
    setFilters(prev => ({ ...prev, hierarchyPath: newHierarchyPath }));
    
    // Trigger question bank reload with new filters
    // Use the most specific selected item's ID for filtering
    const mostSpecificItem = item || 
      individualSelections.chapter || 
      individualSelections.section || 
      individualSelections.part || 
      individualSelections.subject || 
      individualSelections.year;
    
    questionBank.setFilters({
      ...questionBank.filters,
      hierarchyItemId: mostSpecificItem?.id
    });
  };
  
  // Get available items for each level
  const getAvailableItems = (level: keyof typeof individualSelections): HierarchyItem[] => {
    if (!currentHierarchy?.hierarchyItems) return [];
    
    switch (level) {
      case 'year':
        return currentHierarchy.hierarchyItems || [];
      case 'subject':
        return individualSelections.year?.children || [];
      case 'part':
        return individualSelections.subject?.children || [];
      case 'section':
        return individualSelections.part?.children || [];
      case 'chapter':
        return individualSelections.section?.children || [];
      case 'mcq':
        return individualSelections.chapter?.children || [];
      default:
        return [];
    }
  };
  
  // Hydration fix - ensure client and server render the same initially
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Main view states
  const [currentView, setCurrentView] = useState<'questionBank' | 'stats'>('questionBank');

  // Modal states
  const [modals, setModals] = useState({
    import: false,
    export: false,
    preview: false,
    settings: false,
  });
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [filterPanelVisible, setFilterPanelVisible] = useState(true);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Refs for click outside functionality
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Modal handlers
  const openModal = useCallback((modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = useCallback((modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: false }));
    if (modal === 'preview') {
      setPreviewQuestion(null);
    }
  }, []);

  const handlePreviewQuestion = useCallback((questionId: string) => {
    const question = questionBank.questions.find(q => q.id === questionId);
    if (question) {
      setPreviewQuestion(question);
      openModal('preview');
    }
  }, [openModal, questionBank.questions]);

  // Click outside handler for search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchExpanded(false);
      }
    };

    if (searchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [searchExpanded]);

  // Search handlers
  const handleSearch = useCallback((searchQuery: string) => {
    search.setQuery(searchQuery);
    questionBank.setSearchQuery(searchQuery);
    if (searchQuery.trim()) {
      search.addToRecentSearches(searchQuery);
    }
  }, [search, questionBank]);

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: any) => {
    questionBank.setFilters(newFilters);
  }, [questionBank]);

  // Bulk operation handlers
  const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
    try {
      await questionBank.performBulkOperation({
        ...operation,
        questionIds: Array.from(selection.selectedIds),
      });
      selection.clearSelection();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  }, [questionBank, selection]);

  // Export handler
  const handleExport = useCallback(async (config: ExportConfig) => {
    try {
      console.log('Export configuration:', config);
      closeModal('export');
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [closeModal]);

  // Import handler
  const handleImport = useCallback(async (file: File, config: ImportConfig) => {
    try {
      console.log('Import configuration:', config);
      await questionBank.refreshData();
      closeModal('import');
      return { success: true, errors: [], warnings: [], imported: 0, skipped: 0, total: 0 };
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }, [questionBank, closeModal]);

  // View settings handler
  const handleViewSettingsChange = useCallback((newSettings: ViewSettings) => {
    setLocalViewSettings(newSettings);
    questionBank.setViewSettings(newSettings);
  }, [setLocalViewSettings, questionBank]);

  // Question action handlers
  const handleEditQuestion = useCallback((questionId: string) => {
    console.log('Edit question:', questionId);
  }, []);

  const handleDeleteQuestion = useCallback(async (questionId: string) => {
    const question = questionBank.questions.find(q => q.id === questionId);
    if (question && confirm(`Are you sure you want to delete question "${question.humanId}"?`)) {
      try {
        await questionBank.deleteQuestion(questionId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  }, [questionBank]);

  const handleDuplicateQuestion = useCallback(async (question: Question) => {
    try {
      const duplicateData = {
        ...question,
        id: undefined,
        humanId: `${question.humanId}-COPY`,
        createdAt: undefined,
        updatedAt: undefined,
      };
      await questionBank.createQuestion(duplicateData);
    } catch (error) {
      console.error('Duplicate failed:', error);
    }
  }, [questionBank]);

  // Render question content based on view mode
  const renderQuestionContent = () => {
    const commonProps = {
      questions: questionBank.questions,
      selection: {
        selectedIds: selection.selectedIds,
        toggleSelection: selection.toggleSelection,
        toggleSelectAll: selection.toggleSelectAll,
        isAllSelected: selection.isAllSelected,
        isIndeterminate: selection.isIndeterminate,
      },
      onPreview: handlePreviewQuestion,
      onEdit: handleEditQuestion,
      onDelete: handleDeleteQuestion,
      isLoading: questionBank.isLoading,
    };

    switch (viewSettings.mode) {
      case ViewMode.GRID:
        return <QuestionGrid {...commonProps} viewSettings={viewSettings} />;
      case ViewMode.LIST:
        return <QuestionList {...commonProps} viewSettings={viewSettings} />;
      case ViewMode.TABLE:
        return <QuestionTable {...commonProps} viewSettings={viewSettings} />;
      default:
        return <QuestionGrid {...commonProps} viewSettings={viewSettings} />;
    }
  };

  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{ backgroundColor: theme.colors.semantic.background.secondary }}
    >
      {/* Header Section */}
      <div 
        className="sticky top-0 z-40 backdrop-blur-sm border-b transition-all duration-300"
        style={{ 
          borderColor: theme.colors.semantic.border.secondary,
          backgroundColor: theme.colors.semantic.surface.primary + 'F5'
        }}
      >
        <div className="px-6 py-4">
          {/* Title and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="animate-fade-in-left">
              <h1 
                className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.semantic.text.primary}, ${theme.colors.semantic.action.primary})`
                }}
              >
                Question Bank Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
                Manage and organize your question repository with advanced hierarchy filtering
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3 animate-fade-in-right">
              {/* View Switcher Buttons */}
              <div className="flex items-center space-x-2">
                {/* Stats Dashboard Button */}
                {questionBank.stats && (
                  <button
                    onClick={() => setCurrentView('stats')}
                    className={`px-4 py-2 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 transform group ${
                      currentView === 'stats' ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: currentView === 'stats' 
                        ? theme.colors.semantic.action.primary + '15' 
                        : theme.colors.semantic.surface.secondary,
                      borderColor: currentView === 'stats' 
                        ? theme.colors.semantic.action.primary 
                        : theme.colors.semantic.border.primary,
                      color: currentView === 'stats' 
                        ? theme.colors.semantic.action.primary 
                        : theme.colors.semantic.text.primary
                    }}
                    title="View statistics dashboard"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-sm font-medium">Stats Dashboard</span>
                      </div>
                      {currentView !== 'stats' && (
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="flex items-center space-x-1" style={{ color: theme.colors.semantic.text.secondary }}>
                            <span>{questionBank.stats.totalQuestions}</span>
                            <span>questions</span>
                          </div>
                          <div className="h-3 w-px" style={{ backgroundColor: theme.colors.semantic.border.secondary }}></div>
                          <div className="flex items-center space-x-1" style={{ color: theme.colors.semantic.status.success }}>
                            <span>{questionBank.stats.byDifficulty.EASY}</span>
                            <span>E</span>
                          </div>
                          <div className="flex items-center space-x-1" style={{ color: theme.colors.semantic.status.warning }}>
                            <span>{questionBank.stats.byDifficulty.MEDIUM}</span>
                            <span>M</span>
                          </div>
                          <div className="flex items-center space-x-1" style={{ color: theme.colors.semantic.status.error }}>
                            <span>{questionBank.stats.byDifficulty.HARD}</span>
                            <span>H</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                )}

                {/* Question Bank Button */}
                <button
                  onClick={() => setCurrentView('questionBank')}
                  className={`px-4 py-2 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 transform ${
                    currentView === 'questionBank' ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: currentView === 'questionBank' 
                      ? theme.colors.semantic.action.primary + '15' 
                      : theme.colors.semantic.surface.secondary,
                    borderColor: currentView === 'questionBank' 
                      ? theme.colors.semantic.action.primary 
                      : theme.colors.semantic.border.primary,
                    color: currentView === 'questionBank' 
                      ? theme.colors.semantic.action.primary 
                      : theme.colors.semantic.text.primary
                  }}
                  title="Manage question bank"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm font-medium">Question Bank</span>
                  </div>
                </button>
              </div>

              {/* Expandable Search */}
              <div className="flex items-center" ref={searchContainerRef}>
                {searchExpanded ? (
                  <div className="flex items-center space-x-3 animate-search-expand">
                    <div className="flex-1 min-w-0">
                      <SearchBar
                        query={search.query}
                        onSearch={() => {}}
                        onQueryChange={handleSearch}
                        suggestions={search.suggestions}
                        placeholder="Search questions, tags, or content..."
                      />
                    </div>
                    <button
                      onClick={() => setSearchExpanded(false)}
                      className="p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
                      style={{
                        color: theme.colors.semantic.text.secondary,
                        backgroundColor: theme.colors.semantic.surface.secondary,
                        border: `1px solid ${theme.colors.semantic.border.secondary}`
                      }}
                      title="Close search"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchExpanded(true)}
                    className="p-2.5 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 transform group"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.secondary
                    }}
                    title="Search questions"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}
              </div>

              <button
                onClick={() => setFilterPanelVisible(!filterPanelVisible)}
                className="px-4 py-2 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
                style={{
                  backgroundColor: filterPanelVisible ? theme.colors.semantic.action.primary + '10' : 'transparent',
                  borderColor: theme.colors.semantic.border.primary,
                  color: filterPanelVisible ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                }}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  <span>Filters</span>
                </div>
              </button>

              <button
                onClick={() => openModal('import')}
                className="px-4 py-2 rounded-xl border transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.status.info
                }}
              >
                Import
              </button>

              <button
                onClick={() => openModal('export')}
                className="px-4 py-2 rounded-xl border transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.status.success
                }}
              >
                Export
              </button>

              <button
                onClick={() => {}}
                className="px-6 py-2 rounded-xl text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
                style={{ 
                  backgroundColor: theme.colors.semantic.action.primary,
                  boxShadow: `0 8px 25px ${theme.colors.semantic.action.primary}40`
                }}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'questionBank' ? (
        // Question Bank View
        <div className="flex">
        {/* Sidebar */}
        <div 
          className={`border-r transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-80'
          }`}
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary
          }}
        >
          <div className="p-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:shadow-lg group"
              style={{
                backgroundColor: sidebarCollapsed 
                  ? theme.colors.semantic.action.primary + '10'
                  : theme.colors.semantic.surface.secondary,
                border: `1px solid ${sidebarCollapsed 
                  ? theme.colors.semantic.action.primary + '20'
                  : theme.colors.semantic.border.secondary}`,
                color: sidebarCollapsed 
                  ? theme.colors.semantic.action.primary
                  : theme.colors.semantic.text.primary
              }}
            >
              <div className="flex items-center space-x-3">
                {/* Filter Icon */}
                <div className="p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110" style={{
                  backgroundColor: sidebarCollapsed 
                    ? theme.colors.semantic.action.primary + '15'
                    : theme.colors.semantic.action.primary + '10'
                }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                </div>
                
                <span className={`text-sm font-semibold transition-all duration-300 ${
                  sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                }`}>
                  Filters & Analytics
                </span>
              </div>
              
              {/* Collapse Arrow */}
              <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                sidebarCollapsed ? 'rotate-0' : 'rotate-180'
              } group-hover:scale-110`} style={{
                backgroundColor: theme.colors.semantic.action.primary + '10'
              }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </button>
            
            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="mt-2 text-center">
                <span className="text-xs px-2 py-1 rounded-full" style={{
                  backgroundColor: theme.colors.semantic.action.primary + '10',
                  color: theme.colors.semantic.action.primary
                }}>
                  Expand Filters
                </span>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="pb-4">
              {filterPanelVisible && (
                <div className="px-4 mb-6 space-y-6">
                  {/* Standard Filters */}
                  <FilterPanel
                    filters={questionBank.filters}
                    onFiltersChange={handleFilterChange}
                    onClearFilters={() => questionBank.setFilters({})}
                    availableTags={[]}
                    availableHierarchies={[]}
                  />
                  
                  {/* Advanced Hierarchy Navigation */}
                  <div className="relative overflow-hidden rounded-2xl shadow-xl backdrop-blur-xl border" 
                       style={{
                         background: `linear-gradient(135deg, ${theme.colors.semantic.surface.primary}F5 0%, ${theme.colors.semantic.surface.secondary}E8 50%, ${theme.colors.semantic.surface.primary}F0 100%)`,
                         borderColor: theme.colors.semantic.border.primary + '20',
                         boxShadow: `0 25px 50px -12px ${theme.colors.semantic.action.primary}15`
                       }}>
                    
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5"
                         style={{
                           backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.colors.semantic.action.primary} 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${theme.colors.semantic.status.info} 1px, transparent 1px)`,
                           backgroundSize: '24px 24px'
                         }}></div>
                    
                    <div className="relative p-6">
                      {/* Header Section */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b shadow-lg" 
                                 style={{ 
                                   background: `linear-gradient(135deg, ${theme.colors.semantic.action.primary}, ${theme.colors.semantic.status.info})` 
                                 }}></div>
                            <div className="absolute -inset-1 w-3.5 h-8 rounded-full blur-sm opacity-75"
                                 style={{ 
                                   background: `linear-gradient(135deg, ${theme.colors.semantic.action.primary}, ${theme.colors.semantic.status.info})` 
                                 }}></div>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent"
                                style={{
                                  backgroundImage: `linear-gradient(135deg, ${theme.colors.semantic.text.primary}, ${theme.colors.semantic.action.primary})`
                                }}>
                              🎯 Smart Navigation
                            </h3>
                            <p className="text-xs opacity-80" 
                               style={{ color: theme.colors.semantic.text.secondary }}>
                              Navigate with precision
                            </p>
                          </div>
                        </div>
                        
                        {/* Status Indicator */}
                        {selectedHierarchyType && (
                          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full shadow-lg"
                               style={{
                                 background: `linear-gradient(135deg, ${theme.colors.semantic.status.success}20, ${theme.colors.semantic.status.info}15)`,
                                 border: `1px solid ${theme.colors.semantic.status.success}30`
                               }}>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                                 style={{ backgroundColor: theme.colors.semantic.status.success }}></div>
                            <span className="text-xs font-medium" 
                                  style={{ color: theme.colors.semantic.status.success }}>
                              {selectedHierarchyType === 'question-bank' ? 'QB' : 'PP'} Active
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Hierarchy Type Selection */}
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="text-sm font-semibold whitespace-nowrap opacity-90" 
                                 style={{ color: theme.colors.semantic.text.primary }}>
                            Type:
                          </label>
                          <select
                            value={selectedHierarchyType || ''}
                            onChange={(e) => {
                              const hierarchyType = e.target.value as HierarchyMode;
                              setSelectedHierarchyType(hierarchyType || null);
                              setIndividualSelections({
                                level1: null, level2: null, level3: null, level4: null, level5: null, mcq: null
                              });
                              questionBank.setFilters({
                                ...questionBank.filters,
                                hierarchyItemId: undefined
                              });
                            }}
                            className="px-4 py-2 rounded-lg border shadow-sm text-sm font-medium transition-all duration-300 hover:shadow-md focus:shadow-lg focus:outline-none"
                            style={{
                              backgroundColor: selectedHierarchyType 
                                ? theme.colors.semantic.action.primary + '10'
                                : theme.colors.semantic.surface.primary,
                              borderColor: selectedHierarchyType 
                                ? theme.colors.semantic.action.primary 
                                : theme.colors.semantic.border.primary,
                              color: selectedHierarchyType 
                                ? theme.colors.semantic.action.primary 
                                : theme.colors.semantic.text.primary
                            }}
                          >
                            <option value="">Choose Mode</option>
                            <option value="question-bank">📚 Question Bank</option>
                            <option value="previous-papers">📋 Previous Papers</option>
                          </select>
                        </div>

                        {/* Dynamic Level Selectors */}
                        {selectedHierarchyType && (
                          <>
                            <div className="flex items-center space-x-2">
                              <div className="h-px flex-1 opacity-30" 
                                   style={{ backgroundColor: theme.colors.semantic.border.primary }}></div>
                              <span className="text-xs font-medium px-2 py-1 rounded-full opacity-75"
                                    style={{ 
                                      backgroundColor: theme.colors.semantic.action.primary + '10',
                                      color: theme.colors.semantic.action.primary 
                                    }}>
                                LEVELS
                              </span>
                              <div className="h-px flex-1 opacity-30" 
                                   style={{ backgroundColor: theme.colors.semantic.border.primary }}></div>
                            </div>
                            
                            <div className="space-y-3">
                              <SmallHierarchySelectors 
                                hierarchyType={selectedHierarchyType}
                                individualSelections={individualSelections}
                                setIndividualSelections={setIndividualSelections}
                                questionBankHierarchy={questionBankHierarchy}
                                previousPapersHierarchy={previousPapersHierarchy}
                                theme={theme}
                                onSelectionChange={(newSelections: IndividualSelections) => {
                                  const lastSelected = Object.values(newSelections).find((item): item is HierarchyItem => Boolean(item));
                                  questionBank.setFilters({
                                    ...questionBank.filters,
                                    hierarchyItemId: lastSelected?.id
                                  });
                                }}
                              />
                            </div>
                            
                            {/* Clear Button */}
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={() => {
                                  setSelectedHierarchyType(null);
                                  setIndividualSelections({
                                    level1: null, level2: null, level3: null, level4: null, level5: null, mcq: null
                                  });
                                  questionBank.setFilters({
                                    ...questionBank.filters,
                                    hierarchyItemId: undefined
                                  });
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:shadow-md transform hover:scale-105 flex items-center space-x-1.5 group"
                                style={{
                                  backgroundColor: theme.colors.semantic.status.error + '10',
                                  borderColor: theme.colors.semantic.status.error + '30',
                                  color: theme.colors.semantic.status.error,
                                  border: '1px solid'
                                }}
                              >
                                <svg className="w-3 h-3 transition-transform group-hover:rotate-180 duration-500" 
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Clear</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewSettings.showStatistics && questionBank.stats && (
                <div className="px-4">
                  <StatisticsPanel stats={questionBank.stats} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Bulk Actions Bar */}
          {selection.selectedCount > 0 && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
              <BulkActionsBar
                selectedCount={selection.selectedCount}
                selectedQuestions={selection.selectedQuestions}
                onAction={handleBulkOperation}
                onClear={selection.clearSelection}
              />
            </div>
          )}

          {/* Content Header */}
          <div 
            className="border-b px-6 py-4"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                  {questionBank.isLoading ? 'Loading...' : (
                    <>
                      Showing {questionBank.questions.length} of {questionBank.pagination.total} questions
                      {selectedHierarchyType && (
                        <span className="text-blue-600 ml-2">
                          • {selectedHierarchyType === 'question-bank' ? '📚' : '📋'} 
                          {selectedHierarchyType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                      {Object.values(individualSelections).some(Boolean) && (
                        <span className="text-green-600 ml-2">
                          • Filtered by: {Object.entries(individualSelections)
                            .filter(([_, value]) => value)
                            .map(([key, value]) => `${key}: ${value?.name}`)
                            .join(', ')}
                        </span>
                      )}
                      {selection.selectedCount > 0 && ` • ${selection.selectedCount} selected`}
                    </>
                  )}
                </div>
                
                {questionBank.error && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    {questionBank.error}
                  </div>
                )}
              </div>

              {/* View Mode Selector */}
              <div className="flex items-center space-x-2">
                {[
                  { mode: ViewMode.GRID, icon: '▦', title: 'Grid View' },
                  { mode: ViewMode.LIST, icon: '☰', title: 'List View' },
                  { mode: ViewMode.TABLE, icon: '⊞', title: 'Table View' },
                ].map((option) => {
                  // Use fallback value during hydration to prevent mismatch
                  const currentMode = isHydrated ? viewSettings.mode : questionBank.viewSettings.mode;
                  const isActive = currentMode === option.mode;
                  
                  return (
                    <button
                      key={option.mode}
                      onClick={() => handleViewSettingsChange({ ...viewSettings, mode: option.mode })}
                      className={`p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={option.title}
                    >
                      <span className="text-lg">{option.icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Questions Content */}
          <div className="flex-1 p-6">
            {renderQuestionContent()}
          </div>

          {/* Pagination */}
          {questionBank.pagination.pages > 1 && (
            <div 
              className="border-t px-6 py-4"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                  Page {questionBank.pagination.page} of {questionBank.pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    disabled={!questionBank.pagination.hasPrev}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!questionBank.pagination.hasNext}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      ) : (
        /* Stats Dashboard View */
        questionBank.stats ? (
          <StatsDashboard 
            stats={questionBank.stats}
            onClose={() => setCurrentView('questionBank')}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 mx-auto mb-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-600">Loading stats...</p>
            </div>
          </div>
        )
      )}

      {/* Modals */}
      {modals.import && (
        <ImportModal
          onClose={() => closeModal('import')}
          onImport={handleImport}
        />
      )}

      {modals.export && (
        <ExportModal
          questions={selection.selectedCount > 0 ? selection.selectedQuestions : questionBank.questions}
          onClose={() => closeModal('export')}
          onExport={handleExport}
        />
      )}

      {modals.preview && previewQuestion && (
        <PreviewModal
          question={previewQuestion}
          onClose={() => closeModal('preview')}
          onEdit={() => handleEditQuestion(previewQuestion.id)}
          onDelete={() => handleDeleteQuestion(previewQuestion.id)}
          onDuplicate={() => handleDuplicateQuestion(previewQuestion)}
        />
      )}

      {modals.settings && (
        <ViewSettingsModal
          settings={viewSettings}
          onSave={handleViewSettingsChange}
          onClose={() => closeModal('settings')}
        />
      )}
    </div>
  );
}