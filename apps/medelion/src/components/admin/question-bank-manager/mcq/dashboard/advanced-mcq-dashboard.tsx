'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/theme';
import { useRouter } from 'next/navigation';
import { 
  MCQHierarchyBreadcrumb, 
  HierarchyPath,
  CombinedBreadcrumbSelector 
} from '../breadcrumb';
import { HierarchyBreadcrumbSelector, HierarchyType } from '../breadcrumb/hierarchy-breadcrumb-selector';
import { IndividualBreadcrumbSelector } from '../breadcrumb/individual-breadcrumb-selector';
import { useQuestionBankHierarchy, usePreviousPapersHierarchy } from '@/components/admin/hierarchy';
import { HierarchyItem } from '@/lib/types/hierarchy.types';
import { Question } from '../../question-bank/types';

// Advanced Dashboard Props
export interface AdvancedMCQDashboardProps {
  questions?: Question[];
  isLoading?: boolean;
  onQuestionSelect?: (question: Question) => void;
  onCreateNew?: (hierarchyPath: HierarchyPath) => void;
  className?: string;
}

// Filter and Sort Types
interface FilterState {
  hierarchyPath: HierarchyPath;
  difficulty: string[];
  questionType: string[];
  tags: string[];
  dateRange: { start?: Date; end?: Date };
  searchQuery: string;
  isActive?: boolean;
}

interface SortState {
  field: 'created' | 'updated' | 'difficulty' | 'type' | 'humanId';
  direction: 'asc' | 'desc';
}

// View Mode Types
type ViewMode = 'grid' | 'list' | 'table' | 'kanban';

export const AdvancedMCQDashboard: React.FC<AdvancedMCQDashboardProps> = ({
  questions = [],
  isLoading = false,
  onQuestionSelect,
  onCreateNew,
  className = ''
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  // State Management
  const [filters, setFilters] = useState<FilterState>({
    hierarchyPath: {},
    difficulty: [],
    questionType: [],
    tags: [],
    dateRange: {},
    searchQuery: '',
    isActive: undefined
  });
  
  const [sort, setSort] = useState<SortState>({
    field: 'updated',
    direction: 'desc'
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showHierarchySelector, setShowHierarchySelector] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  // Hierarchy selector states
  const [selectedHierarchyType, setSelectedHierarchyType] = useState<HierarchyType | null>(null);
  const [hierarchyDropdowns, setHierarchyDropdowns] = useState({
    hierarchyType: false,
    year: false,
    subject: false,
    part: false,
    section: false,
    chapter: false,
    mcq: false
  });
  
  // Individual level selections
  const [individualSelections, setIndividualSelections] = useState({
    year: null as HierarchyItem | null,
    subject: null as HierarchyItem | null,
    part: null as HierarchyItem | null,
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

  // Computed Values
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      // Hierarchy filtering
      if (filters.hierarchyPath.year && question.hierarchyPath?.year !== filters.hierarchyPath.year.id) return false;
      if (filters.hierarchyPath.subject && question.hierarchyPath?.subject !== filters.hierarchyPath.subject.id) return false;
      if (filters.hierarchyPath.part && question.hierarchyPath?.part !== filters.hierarchyPath.part.id) return false;
      if (filters.hierarchyPath.section && question.hierarchyPath?.section !== filters.hierarchyPath.section.id) return false;
      if (filters.hierarchyPath.chapter && question.hierarchyPath?.chapter !== filters.hierarchyPath.chapter.id) return false;
      
      // Difficulty filtering
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(question.difficulty)) return false;
      
      // Question type filtering
      if (filters.questionType.length > 0 && !filters.questionType.includes(question.type)) return false;
      
      // Tags filtering
      if (filters.tags.length > 0 && !filters.tags.some(tag => question.tags.includes(tag))) return false;
      
      // Search query filtering
      if (filters.searchQuery && !question.question.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !question.humanId.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      
      // Active status filtering
      if (filters.isActive !== undefined && question.isActive !== filters.isActive) return false;
      
      return true;
    });
  }, [questions, filters]);

  const sortedQuestions = useMemo(() => {
    return [...filteredQuestions].sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1;
      
      switch (sort.field) {
        case 'created':
          return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'updated':
          return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        case 'difficulty':
          const difficultyOrder: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return direction * ((difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0));
        case 'type':
          return direction * a.type.localeCompare(b.type);
        case 'humanId':
          return direction * a.humanId.localeCompare(b.humanId);
        default:
          return 0;
      }
    });
  }, [filteredQuestions, sort]);

  // Statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const filtered = filteredQuestions.length;
    const active = questions.filter(q => q.isActive).length;
    const byDifficulty = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byType = questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, filtered, active, byDifficulty, byType };
  }, [questions, filteredQuestions]);

  // Event Handlers
  const handleHierarchyChange = (hierarchyPath: HierarchyPath) => {
    setFilters(prev => ({ ...prev, hierarchyPath }));
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew(filters.hierarchyPath);
    } else {
      router.push('/admin/dashboard/question-bank-manager/mcq?mode=new');
    }
  };

  const handleBulkAction = (action: string) => {
    // Implement bulk actions
    console.log('Bulk action:', action, 'on questions:', selectedQuestions);
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

  return (
    <div 
      className={`min-h-screen transition-all duration-300 ${className}`}
      style={{ backgroundColor: theme.colors.semantic.background.secondary }}
    >
      {/* Header Section */}
      <div 
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b transition-all duration-300"
        style={{ 
          borderColor: theme.colors.semantic.border.secondary + '20',
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
                MCQ Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
                Manage your multiple choice questions with advanced filtering and organization
              </p>
            </div>

            <div className="flex items-center space-x-3 animate-fade-in-right">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-4 py-2 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
                style={{
                  backgroundColor: showAdvancedFilters ? theme.colors.semantic.action.primary + '10' : 'transparent',
                  borderColor: theme.colors.semantic.border.primary,
                  color: showAdvancedFilters ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
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
                onClick={handleCreateNew}
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
                  <span>Create New MCQ</span>
                </div>
              </button>
            </div>
          </div>

          {/* Prominent Hierarchy Selector Row */}
          <div className="mb-4 p-4 bg-white/50 rounded-xl border animate-fade-in-up"
               style={{
                 backgroundColor: theme.colors.semantic.surface.primary + '80',
                 borderColor: theme.colors.semantic.border.primary + '30'
               }}>
            <div className="flex flex-col space-y-3">
              {/* Quick Hierarchy Type Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold whitespace-nowrap" style={{ color: theme.colors.semantic.text.primary }}>
                  Hierarchy Type:
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedHierarchyType('question-bank');
                      setIndividualSelections({
                        year: null, subject: null, part: null, section: null, chapter: null, mcq: null
                      });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedHierarchyType === 'question-bank' ? 'shadow-md' : 'hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: selectedHierarchyType === 'question-bank' 
                        ? theme.colors.semantic.action.primary 
                        : theme.colors.semantic.surface.secondary,
                      color: selectedHierarchyType === 'question-bank' 
                        ? 'white' 
                        : theme.colors.semantic.text.primary,
                      borderColor: theme.colors.semantic.border.primary
                    }}
                  >
                    📚 Question Bank
                  </button>
                  <button
                    onClick={() => {
                      setSelectedHierarchyType('previous-papers');
                      setIndividualSelections({
                        year: null, subject: null, part: null, section: null, chapter: null, mcq: null
                      });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedHierarchyType === 'previous-papers' ? 'shadow-md' : 'hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: selectedHierarchyType === 'previous-papers' 
                        ? theme.colors.semantic.action.primary 
                        : theme.colors.semantic.surface.secondary,
                      color: selectedHierarchyType === 'previous-papers' 
                        ? 'white' 
                        : theme.colors.semantic.text.primary
                    }}
                  >
                    📋 Previous Papers
                  </button>
                </div>
              </div>

              {/* Quick Level Selectors */}
              {selectedHierarchyType && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium whitespace-nowrap" style={{ color: theme.colors.semantic.text.secondary }}>
                    Quick Select:
                  </span>
                  
                  {/* Year Selector */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('year')}
                      className="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm flex items-center space-x-2"
                      style={{
                        backgroundColor: individualSelections.year 
                          ? theme.colors.semantic.action.primary + '20' 
                          : theme.colors.semantic.surface.primary,
                        borderColor: individualSelections.year 
                          ? theme.colors.semantic.action.primary 
                          : theme.colors.semantic.border.secondary,
                        color: individualSelections.year 
                          ? theme.colors.semantic.action.primary 
                          : theme.colors.semantic.text.secondary
                      }}
                    >
                      <span>{individualSelections.year?.name || 'Year'}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <IndividualBreadcrumbSelector
                      level={1}
                      items={getAvailableItems('year')}
                      currentSelection={individualSelections.year || undefined}
                      label="Year"
                      isOpen={hierarchyDropdowns.year}
                      onToggle={() => toggleDropdown('year')}
                      onSelect={(item) => handleIndividualSelection('year', item)}
                      theme={theme}
                      compact={true}
                    />
                  </div>

                  {/* Subject Selector */}
                  {individualSelections.year && (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('subject')}
                        className="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm flex items-center space-x-2"
                        style={{
                          backgroundColor: individualSelections.subject 
                            ? theme.colors.semantic.action.primary + '20' 
                            : theme.colors.semantic.surface.primary,
                          borderColor: individualSelections.subject 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.border.secondary,
                          color: individualSelections.subject 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.text.secondary
                        }}
                      >
                        <span>{individualSelections.subject?.name || 'Subject'}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <IndividualBreadcrumbSelector
                        level={2}
                        items={getAvailableItems('subject')}
                        currentSelection={individualSelections.subject || undefined}
                        label="Subject"
                        isOpen={hierarchyDropdowns.subject}
                        onToggle={() => toggleDropdown('subject')}
                        onSelect={(item) => handleIndividualSelection('subject', item)}
                        theme={theme}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Part Selector */}
                  {individualSelections.subject && (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('part')}
                        className="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm flex items-center space-x-2"
                        style={{
                          backgroundColor: individualSelections.part 
                            ? theme.colors.semantic.action.primary + '20' 
                            : theme.colors.semantic.surface.primary,
                          borderColor: individualSelections.part 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.border.secondary,
                          color: individualSelections.part 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.text.secondary
                        }}
                      >
                        <span>{individualSelections.part?.name || 'Part'}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <IndividualBreadcrumbSelector
                        level={3}
                        items={getAvailableItems('part')}
                        currentSelection={individualSelections.part || undefined}
                        label="Part"
                        isOpen={hierarchyDropdowns.part}
                        onToggle={() => toggleDropdown('part')}
                        onSelect={(item) => handleIndividualSelection('part', item)}
                        theme={theme}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Section Selector */}
                  {individualSelections.part && (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('section')}
                        className="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm flex items-center space-x-2"
                        style={{
                          backgroundColor: individualSelections.section 
                            ? theme.colors.semantic.action.primary + '20' 
                            : theme.colors.semantic.surface.primary,
                          borderColor: individualSelections.section 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.border.secondary,
                          color: individualSelections.section 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.text.secondary
                        }}
                      >
                        <span>{individualSelections.section?.name || 'Section'}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <IndividualBreadcrumbSelector
                        level={4}
                        items={getAvailableItems('section')}
                        currentSelection={individualSelections.section || undefined}
                        label="Section"
                        isOpen={hierarchyDropdowns.section}
                        onToggle={() => toggleDropdown('section')}
                        onSelect={(item) => handleIndividualSelection('section', item)}
                        theme={theme}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Chapter Selector */}
                  {individualSelections.section && (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('chapter')}
                        className="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm flex items-center space-x-2"
                        style={{
                          backgroundColor: individualSelections.chapter 
                            ? theme.colors.semantic.action.primary + '20' 
                            : theme.colors.semantic.surface.primary,
                          borderColor: individualSelections.chapter 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.border.secondary,
                          color: individualSelections.chapter 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.text.secondary
                        }}
                      >
                        <span>{individualSelections.chapter?.name || 'Chapter'}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <IndividualBreadcrumbSelector
                        level={5}
                        items={getAvailableItems('chapter')}
                        currentSelection={individualSelections.chapter || undefined}
                        label="Chapter"
                        isOpen={hierarchyDropdowns.chapter}
                        onToggle={() => toggleDropdown('chapter')}
                        onSelect={(item) => handleIndividualSelection('chapter', item)}
                        theme={theme}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* MCQ Selector */}
                  {individualSelections.chapter && (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown('mcq')}
                        className="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm flex items-center space-x-2"
                        style={{
                          backgroundColor: individualSelections.mcq 
                            ? theme.colors.semantic.action.primary + '20' 
                            : theme.colors.semantic.surface.primary,
                          borderColor: individualSelections.mcq 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.border.secondary,
                          color: individualSelections.mcq 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.text.secondary
                        }}
                      >
                        <span>{individualSelections.mcq?.name || 'MCQ'}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <IndividualBreadcrumbSelector
                        level={6}
                        items={getAvailableItems('mcq')}
                        currentSelection={individualSelections.mcq || undefined}
                        label="MCQ"
                        isOpen={hierarchyDropdowns.mcq}
                        onToggle={() => toggleDropdown('mcq')}
                        onSelect={(item) => handleIndividualSelection('mcq', item)}
                        theme={theme}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Clear Button */}
                  {(selectedHierarchyType || Object.values(individualSelections).some(Boolean)) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Hierarchy Selector */}
          <div className="mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
                Hierarchy Filter
              </h2>
              {(selectedHierarchyType || Object.values(individualSelections).some(Boolean)) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            
            <div 
              className="relative rounded-2xl p-6 border-2 bg-gradient-to-r overflow-hidden transition-all duration-300 hover:border-opacity-50 hover:shadow-lg"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.primary + '30',
                backgroundImage: `linear-gradient(135deg, ${theme.colors.semantic.surface.primary}, ${theme.colors.semantic.action.primary + '05'})`
              }}
            >
              {/* Animated Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-16 translate-x-16 animate-float"
                   style={{ backgroundColor: theme.colors.semantic.action.primary }} />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-5 translate-y-12 -translate-x-12 animate-float-delayed"
                   style={{ backgroundColor: theme.colors.semantic.action.primary }} />
              
              <div className="relative space-y-6">
                {/* Hierarchy Type Selector */}
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: theme.colors.semantic.text.primary }}>
                    Select Hierarchy Type
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('hierarchyType')}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 hover:shadow-md"
                      style={{
                        backgroundColor: selectedHierarchyType ? theme.colors.semantic.action.primary + '08' : theme.colors.semantic.surface.primary,
                        borderColor: selectedHierarchyType ? theme.colors.semantic.action.primary : theme.colors.semantic.border.primary,
                        color: selectedHierarchyType ? theme.colors.semantic.action.primary : theme.colors.semantic.text.primary
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H9m4 8H9m-4-8h2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7v10a2 2 0 002 2h2a2 2 0 002-2V7M7 7H5a2 2 0 00-2 2v8a2 2 0 002 2h2M7 7h8" />
                        </svg>
                        <span className="font-medium">
                          {selectedHierarchyType === 'question-bank' ? 'Question Bank' : 
                           selectedHierarchyType === 'previous-papers' ? 'Previous Papers' : 
                           'Select Hierarchy Type'}
                        </span>
                      </div>
                      <svg className={`w-5 h-5 transition-transform duration-300 ${hierarchyDropdowns.hierarchyType ? 'rotate-180' : ''}`} 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <HierarchyBreadcrumbSelector
                      currentSelection={selectedHierarchyType || undefined}
                      isOpen={hierarchyDropdowns.hierarchyType}
                      onToggle={() => toggleDropdown('hierarchyType')}
                      onSelect={(hierarchyType) => {
                        setSelectedHierarchyType(hierarchyType);
                        // Clear individual selections when hierarchy type changes
                        setIndividualSelections({
                          year: null,
                          subject: null,
                          part: null,
                          section: null,
                          chapter: null,
                          mcq: null
                        });
                      }}
                      theme={theme}
                    />
                  </div>
                </div>

                {/* Individual Level Selectors */}
                {selectedHierarchyType && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
                      Individual Level Selectors
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Year Selector */}
                      <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.semantic.text.secondary }}>
                          Year
                        </label>
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown('year')}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm"
                            style={{
                              backgroundColor: individualSelections.year ? theme.colors.semantic.action.primary + '08' : theme.colors.semantic.surface.primary,
                              borderColor: individualSelections.year ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary,
                              color: individualSelections.year ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                            }}
                          >
                            <span className="truncate">
                              {individualSelections.year?.name || 'Select Year'}
                            </span>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          <IndividualBreadcrumbSelector
                            level={1}
                            items={getAvailableItems('year')}
                            currentSelection={individualSelections.year || undefined}
                            label="Year"
                            isOpen={hierarchyDropdowns.year}
                            onToggle={() => toggleDropdown('year')}
                            onSelect={(item) => handleIndividualSelection('year', item)}
                            theme={theme}
                            compact={true}
                          />
                        </div>
                      </div>

                      {/* Subject Selector */}
                      {individualSelections.year && (
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.semantic.text.secondary }}>
                            Subject
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown('subject')}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm"
                              style={{
                                backgroundColor: individualSelections.subject ? theme.colors.semantic.action.primary + '08' : theme.colors.semantic.surface.primary,
                                borderColor: individualSelections.subject ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary,
                                color: individualSelections.subject ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                              }}
                            >
                              <span className="truncate">
                                {individualSelections.subject?.name || 'Select Subject'}
                              </span>
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            <IndividualBreadcrumbSelector
                              level={2}
                              items={getAvailableItems('subject')}
                              currentSelection={individualSelections.subject || undefined}
                              label="Subject"
                              isOpen={hierarchyDropdowns.subject}
                              onToggle={() => toggleDropdown('subject')}
                              onSelect={(item) => handleIndividualSelection('subject', item)}
                              theme={theme}
                              compact={true}
                            />
                          </div>
                        </div>
                      )}

                      {/* Part Selector */}
                      {individualSelections.subject && (
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.semantic.text.secondary }}>
                            Part
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown('part')}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm"
                              style={{
                                backgroundColor: individualSelections.part ? theme.colors.semantic.action.primary + '08' : theme.colors.semantic.surface.primary,
                                borderColor: individualSelections.part ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary,
                                color: individualSelections.part ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                              }}
                            >
                              <span className="truncate">
                                {individualSelections.part?.name || 'Select Part'}
                              </span>
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            <IndividualBreadcrumbSelector
                              level={3}
                              items={getAvailableItems('part')}
                              currentSelection={individualSelections.part || undefined}
                              label="Part"
                              isOpen={hierarchyDropdowns.part}
                              onToggle={() => toggleDropdown('part')}
                              onSelect={(item) => handleIndividualSelection('part', item)}
                              theme={theme}
                              compact={true}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section Selector */}
                      {individualSelections.part && (
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.semantic.text.secondary }}>
                            Section
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown('section')}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm"
                              style={{
                                backgroundColor: individualSelections.section ? theme.colors.semantic.action.primary + '08' : theme.colors.semantic.surface.primary,
                                borderColor: individualSelections.section ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary,
                                color: individualSelections.section ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                              }}
                            >
                              <span className="truncate">
                                {individualSelections.section?.name || 'Select Section'}
                              </span>
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            <IndividualBreadcrumbSelector
                              level={4}
                              items={getAvailableItems('section')}
                              currentSelection={individualSelections.section || undefined}
                              label="Section"
                              isOpen={hierarchyDropdowns.section}
                              onToggle={() => toggleDropdown('section')}
                              onSelect={(item) => handleIndividualSelection('section', item)}
                              theme={theme}
                              compact={true}
                            />
                          </div>
                        </div>
                      )}

                      {/* Chapter Selector */}
                      {individualSelections.section && (
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.semantic.text.secondary }}>
                            Chapter
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown('chapter')}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm"
                              style={{
                                backgroundColor: individualSelections.chapter ? theme.colors.semantic.action.primary + '08' : theme.colors.semantic.surface.primary,
                                borderColor: individualSelections.chapter ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary,
                                color: individualSelections.chapter ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                              }}
                            >
                              <span className="truncate">
                                {individualSelections.chapter?.name || 'Select Chapter'}
                              </span>
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            <IndividualBreadcrumbSelector
                              level={5}
                              items={getAvailableItems('chapter')}
                              currentSelection={individualSelections.chapter || undefined}
                              label="Chapter"
                              isOpen={hierarchyDropdowns.chapter}
                              onToggle={() => toggleDropdown('chapter')}
                              onSelect={(item) => handleIndividualSelection('chapter', item)}
                              theme={theme}
                              compact={true}
                            />
                          </div>
                        </div>
                      )}

                      {/* MCQ Selector */}
                      {individualSelections.chapter && (
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.semantic.text.secondary }}>
                            MCQ
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown('mcq')}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm"
                              style={{
                                backgroundColor: individualSelections.mcq ? theme.colors.semantic.action.primary + '08' : theme.colors.semantic.surface.primary,
                                borderColor: individualSelections.mcq ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary,
                                color: individualSelections.mcq ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                              }}
                            >
                              <span className="truncate">
                                {individualSelections.mcq?.name || 'Select MCQ'}
                              </span>
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            <IndividualBreadcrumbSelector
                              level={6}
                              items={getAvailableItems('mcq')}
                              currentSelection={individualSelections.mcq || undefined}
                              label="MCQ"
                              isOpen={hierarchyDropdowns.mcq}
                              onToggle={() => toggleDropdown('mcq')}
                              onSelect={(item) => handleIndividualSelection('mcq', item)}
                              theme={theme}
                              compact={true}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Original Breadcrumb for comparison */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: theme.colors.semantic.border.secondary + '30' }}>
                  <label className="block text-sm font-semibold mb-3" style={{ color: theme.colors.semantic.text.primary }}>
                    Breadcrumb View
                  </label>
                  <MCQHierarchyBreadcrumb
                    hierarchyPath={filters.hierarchyPath}
                    onHierarchyChange={handleHierarchyChange}
                    showEditButton={true}
                    isEditing={false}
                    compact={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
            <div 
              className="rounded-xl p-4 border transition-all duration-300 hover:scale-102 hover:shadow-lg"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold" style={{ color: theme.colors.semantic.text.primary }}>
                    {stats.total}
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                    Total Questions
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.semantic.action.primary + '10' }}
                >
                  <svg className="w-6 h-6" style={{ color: theme.colors.semantic.action.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl p-4 border transition-all duration-300 hover:scale-102 hover:shadow-lg"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold" style={{ color: theme.colors.semantic.text.primary }}>
                    {stats.filtered}
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                    Filtered Results
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.semantic.status.success + '10' }}
                >
                  <svg className="w-6 h-6" style={{ color: theme.colors.semantic.status.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl p-4 border transition-all duration-300 hover:scale-102 hover:shadow-lg"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold" style={{ color: theme.colors.semantic.text.primary }}>
                    {stats.active}
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                    Active Questions
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.semantic.status.warning + '10' }}
                >
                  <svg className="w-6 h-6" style={{ color: theme.colors.semantic.status.warning }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl p-4 border transition-all duration-300 hover:scale-102 hover:shadow-lg"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold" style={{ color: theme.colors.semantic.text.primary }}>
                    {selectedQuestions.length}
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                    Selected Items
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.semantic.status.info + '10' }}
                >
                  <svg className="w-6 h-6" style={{ color: theme.colors.semantic.status.info }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div
          className="bg-white border-b px-6 py-4 animate-slide-down"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '20'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                Search Questions
              </label>
              <input
                type="text"
                placeholder="Search by content or ID..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  borderColor: theme.colors.semantic.border.primary,
                  backgroundColor: theme.colors.semantic.surface.primary
                }}
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                Difficulty
              </label>
              <select
                multiple
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  difficulty: Array.from(e.target.selectedOptions, option => (option as HTMLOptionElement).value)
                }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  borderColor: theme.colors.semantic.border.primary,
                  backgroundColor: theme.colors.semantic.surface.primary
                }}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Question Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                Question Type
              </label>
              <select
                multiple
                value={filters.questionType}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  questionType: Array.from(e.target.selectedOptions, option => (option as HTMLOptionElement).value)
                }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  borderColor: theme.colors.semantic.border.primary,
                  backgroundColor: theme.colors.semantic.surface.primary
                }}
              >
                <option value="multipleChoice">Multiple Choice</option>
                <option value="assertionReasoning">Assertion-Reasoning</option>
                <option value="trueFalse">True/False</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                Status
              </label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  borderColor: theme.colors.semantic.border.primary,
                  backgroundColor: theme.colors.semantic.surface.primary
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
                View Mode
              </label>
              <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: theme.colors.semantic.border.primary }}>
                {(['grid', 'list', 'table'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 px-3 py-2 text-sm transition-all duration-200 ${
                      viewMode === mode ? 'text-white' : ''
                    }`}
                    style={{
                      backgroundColor: viewMode === mode ? theme.colors.semantic.action.primary : 'transparent',
                      color: viewMode === mode ? 'white' : theme.colors.semantic.text.secondary
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-transparent animate-spin"
                style={{ 
                  borderTopColor: theme.colors.semantic.action.primary,
                  borderRightColor: theme.colors.semantic.action.primary + '30'
                }}
              />
              <p className="text-lg font-medium" style={{ color: theme.colors.semantic.text.primary }}>
                Loading MCQ Dashboard...
              </p>
              <p className="text-sm mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
                Please wait while we fetch your questions
              </p>
            </div>
          </div>
        ) : sortedQuestions.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div 
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <svg className="w-12 h-12" style={{ color: theme.colors.semantic.text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.semantic.text.primary }}>
              No questions found
            </h3>
            <p className="text-sm mb-6" style={{ color: theme.colors.semantic.text.secondary }}>
              {questions.length === 0 
                ? "You haven't created any MCQs yet. Get started by creating your first question!" 
                : "No questions match your current filters. Try adjusting your search criteria."}
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: theme.colors.semantic.action.primary,
                boxShadow: `0 8px 25px ${theme.colors.semantic.action.primary}40`
              }}
            >
              Create Your First MCQ
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Questions Grid/List */}
            <div className={`
              ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 
                viewMode === 'list' ? 'space-y-4' : 
                'overflow-x-auto'}
            `}>
              {sortedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-xl border p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-102 animate-fade-in-up"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.primary,
                    borderColor: selectedQuestions.includes(question.id) 
                      ? theme.colors.semantic.action.primary 
                      : theme.colors.semantic.border.secondary + '30',
                    animationDelay: `${index * 50}ms`
                  }}
                  onClick={() => onQuestionSelect?.(question)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ 
                          backgroundColor: question.isActive 
                            ? theme.colors.semantic.status.success 
                            : theme.colors.semantic.status.error 
                        }}
                      />
                      <span className="text-sm font-mono" style={{ color: theme.colors.semantic.text.secondary }}>
                        {question.humanId}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedQuestions(prev => 
                          e.target.checked 
                            ? [...prev, question.id]
                            : prev.filter(id => id !== question.id)
                        );
                      }}
                      className="rounded transition-all duration-200"
                    />
                  </div>
                  
                  <h4 className="font-semibold mb-2 line-clamp-2" style={{ color: theme.colors.semantic.text.primary }}>
                    {question.question.slice(0, 100)}...
                  </h4>
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <span 
                      className="px-2 py-1 rounded-full transition-all duration-200 hover:scale-105"
                      style={{ 
                        backgroundColor: theme.colors.semantic.status.info + '20',
                        color: theme.colors.semantic.status.info 
                      }}
                    >
                      {question.type}
                    </span>
                    <span 
                      className="px-2 py-1 rounded-full transition-all duration-200 hover:scale-105"
                      style={{ 
                        backgroundColor: theme.colors.semantic.status.warning + '20',
                        color: theme.colors.semantic.status.warning 
                      }}
                    >
                      {question.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        .animate-fade-in-left {
          animation: fadeInLeft 0.6s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slide-down {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite 3s;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            height: auto;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedMCQDashboard;