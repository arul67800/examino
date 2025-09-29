/**
 * Clean Advanced Filter Panel Component
 * Neat theme-compliant filtering with minimal design
 */

'use client';

import React, { useState } from 'react';
import { QuestionFilters, Difficulty, QuestionType, HierarchyItem } from '../types';
import { Theme, useTheme } from '@/theme';

// Define HierarchyType locally since it's a simple type
type HierarchyType = 'question-bank' | 'previous-papers';

interface IndividualSelections {
  year: HierarchyItem | null;
  subject: HierarchyItem | null;
  part: HierarchyItem | null;
  section: HierarchyItem | null;
  chapter: HierarchyItem | null;
  mcq: HierarchyItem | null;
}

export interface FilterPanelProps {
  filters: QuestionFilters;
  availableTags: string[];
  availableHierarchies: HierarchyItem[];
  onFiltersChange: (filters: QuestionFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  className?: string;
  // Hierarchy selector props
  selectedHierarchyType?: HierarchyType | null;
  individualSelections?: IndividualSelections;
  onHierarchyTypeChange?: (type: HierarchyType | null) => void;
  onIndividualSelection?: (level: keyof IndividualSelections, item: HierarchyItem | null) => void;
  getAvailableItems?: (level: keyof IndividualSelections) => HierarchyItem[];
  onClearHierarchy?: () => void;
  theme?: Theme;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  availableTags,
  availableHierarchies,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
  className = '',
  // Hierarchy props
  selectedHierarchyType,
  individualSelections,
  onHierarchyTypeChange,
  onIndividualSelection,
  getAvailableItems,
  onClearHierarchy,
  theme: passedTheme
}) => {
  const { theme } = useTheme();
  const activeTheme = passedTheme || theme;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['difficulty', 'type']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const updateFilter = (key: keyof QuestionFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const addToArrayFilter = (key: keyof QuestionFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    if (!currentArray.includes(value)) {
      updateFilter(key, [...currentArray, value]);
    }
  };

  const removeFromArrayFilter = (key: keyof QuestionFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    updateFilter(key, currentArray.filter(item => item !== value));
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return value !== undefined && value !== null && value !== '';
  });

  const FilterSection: React.FC<{
    title: string;
    id: string;
    children: React.ReactNode;
    count?: number;
    icon?: React.ReactNode;
  }> = ({ title, id, children, count, icon }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div 
        className="mb-4 last:mb-0 overflow-hidden rounded-2xl shadow-lg backdrop-blur-xl border transition-all duration-500 hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${activeTheme.colors.semantic.surface.primary}F8 0%, ${activeTheme.colors.semantic.surface.secondary}F0 50%, ${activeTheme.colors.semantic.surface.primary}F5 100%)`,
          borderColor: activeTheme.colors.semantic.border.primary + '20',
          boxShadow: `0 10px 30px ${activeTheme.colors.semantic.action.primary}10`
        }}
      >
        {/* Animated Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${activeTheme.colors.semantic.action.primary} 1.5px, transparent 1.5px), radial-gradient(circle at 75% 75%, ${activeTheme.colors.semantic.status.info} 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        ></div>

        <button
          onClick={() => toggleSection(id)}
          className="relative w-full px-6 py-4 text-left flex items-center justify-between transition-all duration-300 hover:scale-[1.02] group"
          style={{
            background: isExpanded 
              ? `linear-gradient(135deg, ${activeTheme.colors.semantic.action.primary}15, ${activeTheme.colors.semantic.status.info}10)` 
              : 'transparent'
          }}
        >
          <div className="flex items-center space-x-3">
            {icon && (
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.colors.semantic.action.primary}, ${activeTheme.colors.semantic.status.info})`,
                  color: 'white'
                }}
              >
                {icon}
              </div>
            )}
            <div>
              <span 
                className="font-bold text-lg bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${activeTheme.colors.semantic.text.primary}, ${activeTheme.colors.semantic.action.primary})`
                }}
              >
                {title}
              </span>
              {count !== undefined && count > 0 && (
                <div 
                  className="inline-flex items-center ml-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse"
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme.colors.semantic.status.success}, ${activeTheme.colors.semantic.status.info})`,
                    color: 'white'
                  }}
                >
                  {count} active
                </div>
              )}
            </div>
          </div>
          <div 
            className={`transform transition-all duration-500 ${isExpanded ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`}
            style={{ color: activeTheme.colors.semantic.action.primary }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {isExpanded && (
          <div 
            className="relative px-6 pb-6 animate-fade-in"
            style={{
              background: `linear-gradient(135deg, ${activeTheme.colors.semantic.surface.primary}F0 0%, ${activeTheme.colors.semantic.surface.secondary}E8 100%)`
            }}
          >
            <div className="pt-2">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  const CheckboxGroup: React.FC<{
    options: string[];
    selected: string[];
    onChange: (value: string, checked: boolean) => void;
    formatter?: (value: string) => string;
  }> = ({ options, selected, onChange, formatter = (v) => v }) => (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
      {options.map((option, index) => (
        <label 
          key={option} 
          className="flex items-center space-x-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          style={{
            background: selected.includes(option) 
              ? `linear-gradient(135deg, ${activeTheme.colors.semantic.action.primary}15, ${activeTheme.colors.semantic.status.success}10)`
              : `linear-gradient(135deg, ${activeTheme.colors.semantic.surface.primary}50, ${activeTheme.colors.semantic.surface.secondary}30)`,
            border: `2px solid ${selected.includes(option) ? activeTheme.colors.semantic.action.primary + '40' : 'transparent'}`,
            animationDelay: `${index * 50}ms`
          }}
        >
          <div className="relative">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(e) => onChange(option, e.target.checked)}
              className="sr-only"
            />
            <div 
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                selected.includes(option) 
                  ? 'shadow-lg transform scale-110' 
                  : 'group-hover:scale-110'
              }`}
              style={{
                backgroundColor: selected.includes(option) 
                  ? activeTheme.colors.semantic.action.primary 
                  : 'transparent',
                borderColor: selected.includes(option) 
                  ? activeTheme.colors.semantic.action.primary 
                  : activeTheme.colors.semantic.border.secondary,
                boxShadow: selected.includes(option) 
                  ? `0 8px 20px ${activeTheme.colors.semantic.action.primary}40` 
                  : 'none'
              }}
            >
              {selected.includes(option) && (
                <svg className="w-4 h-4 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span 
            className={`text-sm font-medium transition-all duration-300 ${
              selected.includes(option) ? 'font-bold' : 'group-hover:font-semibold'
            }`}
            style={{
              color: selected.includes(option) 
                ? activeTheme.colors.semantic.action.primary 
                : activeTheme.colors.semantic.text.primary
            }}
          >
            {formatter(option)}
          </span>
        </label>
      ))}
    </div>
  );

  const difficultyOptions = Object.values(Difficulty);
  const typeOptions = Object.values(QuestionType);

  const formatQuestionType = (type: string) => {
    switch (type) {
      case 'SINGLE_CHOICE': return 'Single Choice';
      case 'MULTIPLE_CHOICE': return 'Multiple Choice';
      case 'TRUE_FALSE': return 'True/False';
      case 'ASSERTION_REASONING': return 'Assertion & Reasoning';
      default: return type;
    }
  };

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  };

  return (
    <div 
      className={`h-full overflow-y-auto custom-scrollbar ${className}`}
      style={{
        background: `linear-gradient(180deg, ${activeTheme.colors.semantic.surface.primary}F8 0%, ${activeTheme.colors.semantic.surface.secondary}F0 50%, ${activeTheme.colors.semantic.surface.primary}F8 100%)`
      }}
    >
      {/* Enhanced Header */}
      <div 
        className="sticky top-0 z-20 backdrop-blur-xl shadow-xl border-b"
        style={{
          background: `linear-gradient(135deg, ${activeTheme.colors.semantic.surface.primary}F8 0%, ${activeTheme.colors.semantic.surface.secondary}F0 100%)`,
          borderColor: activeTheme.colors.semantic.border.primary + '20'
        }}
      >
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.colors.semantic.action.primary}, ${activeTheme.colors.semantic.status.info})`
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 
                  className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${activeTheme.colors.semantic.text.primary}, ${activeTheme.colors.semantic.action.primary})`
                  }}
                >
                  Smart Filters
                </h3>
                <p className="text-xs opacity-75" style={{ color: activeTheme.colors.semantic.text.secondary }}>
                  Precision filtering system
                </p>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-110 flex items-center space-x-2 group"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.colors.semantic.status.error}15, ${activeTheme.colors.semantic.status.warning}10)`,
                  borderColor: activeTheme.colors.semantic.status.error + '40',
                  color: activeTheme.colors.semantic.status.error,
                  border: '2px solid'
                }}
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-28"></div>
                  <div className="h-3 bg-gray-300 rounded w-36"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && (
        <div>
          {/* Hierarchy Filter */}
          {(selectedHierarchyType !== undefined || individualSelections) && (
            <FilterSection title="Hierarchy" id="hierarchy">
              <div className="space-y-3">
                {/* Hierarchy Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedHierarchyType || ''}
                    onChange={(e) => {
                      const value = e.target.value as HierarchyType | '';
                      onHierarchyTypeChange?.(value || null);
                    }}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      backgroundColor: theme?.colors.semantic.surface.primary || '#ffffff',
                      borderColor: theme?.colors.semantic.border.secondary || '#e5e7eb',
                      color: theme?.colors.semantic.text.primary || '#1f2937'
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="question-bank">📚 Question Bank</option>
                    <option value="previous-papers">📋 Previous Papers</option>
                  </select>
                </div>

                {/* Level Selectors */}
                {selectedHierarchyType && individualSelections && getAvailableItems && (
                  <div className="space-y-3">
                    {/* Year */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Year</label>
                      <select
                        value={individualSelections.year?.id || ''}
                        onChange={(e) => {
                          const selectedItem = getAvailableItems('year').find(item => item.id === e.target.value);
                          onIndividualSelection?.('year', selectedItem || null);
                        }}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{
                          backgroundColor: individualSelections.year 
                            ? (theme?.colors.semantic.action.primary || '#3b82f6') + '10' 
                            : theme?.colors.semantic.surface.primary || '#ffffff',
                          borderColor: individualSelections.year 
                            ? theme?.colors.semantic.action.primary || '#3b82f6'
                            : theme?.colors.semantic.border.secondary || '#e5e7eb',
                          color: theme?.colors.semantic.text.primary || '#1f2937'
                        }}
                      >
                        <option value="">Select Year</option>
                        {getAvailableItems('year').map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    {individualSelections.year && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Subject</label>
                        <select
                          value={individualSelections.subject?.id || ''}
                          onChange={(e) => {
                            const selectedItem = getAvailableItems('subject').find(item => item.id === e.target.value);
                            onIndividualSelection?.('subject', selectedItem || null);
                          }}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{
                            backgroundColor: individualSelections.subject 
                              ? (theme?.colors.semantic.action.primary || '#3b82f6') + '10' 
                              : theme?.colors.semantic.surface.primary || '#ffffff',
                            borderColor: individualSelections.subject 
                              ? theme?.colors.semantic.action.primary || '#3b82f6'
                              : theme?.colors.semantic.border.secondary || '#e5e7eb',
                            color: theme?.colors.semantic.text.primary || '#1f2937'
                          }}
                        >
                          <option value="">Select Subject</option>
                          {getAvailableItems('subject').map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Part */}
                    {individualSelections.subject && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Part</label>
                        <select
                          value={individualSelections.part?.id || ''}
                          onChange={(e) => {
                            const selectedItem = getAvailableItems('part').find(item => item.id === e.target.value);
                            onIndividualSelection?.('part', selectedItem || null);
                          }}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{
                            backgroundColor: individualSelections.part 
                              ? (theme?.colors.semantic.action.primary || '#3b82f6') + '10' 
                              : theme?.colors.semantic.surface.primary || '#ffffff',
                            borderColor: individualSelections.part 
                              ? theme?.colors.semantic.action.primary || '#3b82f6'
                              : theme?.colors.semantic.border.secondary || '#e5e7eb',
                            color: theme?.colors.semantic.text.primary || '#1f2937'
                          }}
                        >
                          <option value="">Select Part</option>
                          {getAvailableItems('part').map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Section */}
                    {individualSelections.part && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Section</label>
                        <select
                          value={individualSelections.section?.id || ''}
                          onChange={(e) => {
                            const selectedItem = getAvailableItems('section').find(item => item.id === e.target.value);
                            onIndividualSelection?.('section', selectedItem || null);
                          }}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{
                            backgroundColor: individualSelections.section 
                              ? (theme?.colors.semantic.action.primary || '#3b82f6') + '10' 
                              : theme?.colors.semantic.surface.primary || '#ffffff',
                            borderColor: individualSelections.section 
                              ? theme?.colors.semantic.action.primary || '#3b82f6'
                              : theme?.colors.semantic.border.secondary || '#e5e7eb',
                            color: theme?.colors.semantic.text.primary || '#1f2937'
                          }}
                        >
                          <option value="">Select Section</option>
                          {getAvailableItems('section').map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Chapter */}
                    {individualSelections.section && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Chapter</label>
                        <select
                          value={individualSelections.chapter?.id || ''}
                          onChange={(e) => {
                            const selectedItem = getAvailableItems('chapter').find(item => item.id === e.target.value);
                            onIndividualSelection?.('chapter', selectedItem || null);
                          }}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{
                            backgroundColor: individualSelections.chapter 
                              ? (theme?.colors.semantic.action.primary || '#3b82f6') + '10' 
                              : theme?.colors.semantic.surface.primary || '#ffffff',
                            borderColor: individualSelections.chapter 
                              ? theme?.colors.semantic.action.primary || '#3b82f6'
                              : theme?.colors.semantic.border.secondary || '#e5e7eb',
                            color: theme?.colors.semantic.text.primary || '#1f2937'
                          }}
                        >
                          <option value="">Select Chapter</option>
                          {getAvailableItems('chapter').map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* MCQ */}
                    {individualSelections.chapter && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">MCQ</label>
                        <select
                          value={individualSelections.mcq?.id || ''}
                          onChange={(e) => {
                            const selectedItem = getAvailableItems('mcq').find(item => item.id === e.target.value);
                            onIndividualSelection?.('mcq', selectedItem || null);
                          }}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{
                            backgroundColor: individualSelections.mcq 
                              ? (theme?.colors.semantic.action.primary || '#3b82f6') + '10' 
                              : theme?.colors.semantic.surface.primary || '#ffffff',
                            borderColor: individualSelections.mcq 
                              ? theme?.colors.semantic.action.primary || '#3b82f6'
                              : theme?.colors.semantic.border.secondary || '#e5e7eb',
                            color: theme?.colors.semantic.text.primary || '#1f2937'
                          }}
                        >
                          <option value="">Select MCQ</option>
                          {getAvailableItems('mcq').map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Clear Button */}
                    {Object.values(individualSelections).some(Boolean) && (
                      <button
                        onClick={onClearHierarchy}
                        className="w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 hover:shadow-sm text-red-600 border-red-300 hover:bg-red-50"
                      >
                        ✕ Clear Hierarchy
                      </button>
                    )}
                  </div>
                )}
              </div>
            </FilterSection>
          )}

          {/* Difficulty Filter */}
          <FilterSection 
            title="Difficulty Levels" 
            id="difficulty"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>}
            count={filters.difficulty?.length}
          >
            <CheckboxGroup
              options={difficultyOptions}
              selected={filters.difficulty || []}
              onChange={(value, checked) => {
                if (checked) {
                  addToArrayFilter('difficulty', value);
                } else {
                  removeFromArrayFilter('difficulty', value);
                }
              }}
              formatter={formatDifficulty}
            />
          </FilterSection>

          {/* Question Type Filter */}
          <FilterSection 
            title="Question Types" 
            id="type"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>}
            count={filters.type?.length}
          >
            <CheckboxGroup
              options={typeOptions}
              selected={filters.type || []}
              onChange={(value, checked) => {
                if (checked) {
                  addToArrayFilter('type', value);
                } else {
                  removeFromArrayFilter('type', value);
                }
              }}
              formatter={formatQuestionType}
            />
          </FilterSection>

          {/* Points Range */}
          <FilterSection title="Points Range" id="points" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold" style={{ color: activeTheme.colors.semantic.text.primary }}>
                  Minimum Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.points?.min || ''}
                  onChange={(e) => updateFilter('points', {
                    ...filters.points,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:shadow-lg focus:shadow-xl focus:outline-none focus:ring-4"
                  style={{
                    backgroundColor: activeTheme.colors.semantic.surface.primary,
                    borderColor: filters.points?.min ? activeTheme.colors.semantic.action.primary : activeTheme.colors.semantic.border.secondary,
                    color: activeTheme.colors.semantic.text.primary
                  }}
                  placeholder="Min"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold" style={{ color: activeTheme.colors.semantic.text.primary }}>
                  Maximum Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.points?.max || ''}
                  onChange={(e) => updateFilter('points', {
                    ...filters.points,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:shadow-lg focus:shadow-xl focus:outline-none focus:ring-4"
                  style={{
                    backgroundColor: activeTheme.colors.semantic.surface.primary,
                    borderColor: filters.points?.max ? activeTheme.colors.semantic.action.primary : activeTheme.colors.semantic.border.secondary,
                    color: activeTheme.colors.semantic.text.primary
                  }}
                  placeholder="Max"
                />
              </div>
            </div>
          </FilterSection>

          {/* Time Limit Range */}
          <FilterSection title="Time Limits" id="timeLimit" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold" style={{ color: activeTheme.colors.semantic.text.primary }}>
                  Min Time (sec)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.timeLimit?.min || ''}
                  onChange={(e) => updateFilter('timeLimit', {
                    ...filters.timeLimit,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:shadow-lg focus:shadow-xl focus:outline-none"
                  style={{
                    backgroundColor: activeTheme.colors.semantic.surface.primary,
                    borderColor: filters.timeLimit?.min ? activeTheme.colors.semantic.action.primary : activeTheme.colors.semantic.border.secondary,
                    color: activeTheme.colors.semantic.text.primary
                  }}
                  placeholder="Min"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold" style={{ color: activeTheme.colors.semantic.text.primary }}>
                  Max Time (sec)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.timeLimit?.max || ''}
                  onChange={(e) => updateFilter('timeLimit', {
                    ...filters.timeLimit,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:shadow-lg focus:shadow-xl focus:outline-none"
                  style={{
                    backgroundColor: activeTheme.colors.semantic.surface.primary,
                    borderColor: filters.timeLimit?.max ? activeTheme.colors.semantic.action.primary : activeTheme.colors.semantic.border.secondary,
                    color: activeTheme.colors.semantic.text.primary
                  }}
                  placeholder="Max"
                />
              </div>
            </div>
          </FilterSection>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <FilterSection 
              title="Question Tags" 
              id="tags"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>}
              count={filters.tags?.length}
            >
              <CheckboxGroup
                options={availableTags.slice(0, 20)}
                selected={filters.tags || []}
                onChange={(value, checked) => {
                  if (checked) {
                    addToArrayFilter('tags', value);
                  } else {
                    removeFromArrayFilter('tags', value);
                  }
                }}
              />
              {availableTags.length > 20 && (
                <div 
                  className="text-xs font-medium mt-3 p-2 rounded-lg text-center"
                  style={{
                    backgroundColor: activeTheme.colors.semantic.status.info + '10',
                    color: activeTheme.colors.semantic.status.info
                  }}
                >
                  +{availableTags.length - 20} more tags available
                </div>
              )}
            </FilterSection>
          )}

          {/* Content Flags */}
          <FilterSection title="Content Features" id="content" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>}>
            <div className="space-y-4">
              {[
                { 
                  key: 'hasExplanation', 
                  label: 'Has Explanation', 
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                },
                { 
                  key: 'hasReferences', 
                  label: 'Has References', 
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                },
                { 
                  key: 'isActive', 
                  label: 'Active Only', 
                  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              ].map(({ key, label, icon }, index) => (
                <label 
                  key={key}
                  className="flex items-center space-x-3 cursor-pointer group p-3 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                  style={{
                    background: (filters as any)[key] === true
                      ? `linear-gradient(135deg, ${activeTheme.colors.semantic.status.success}15, ${activeTheme.colors.semantic.action.primary}10)`
                      : `linear-gradient(135deg, ${activeTheme.colors.semantic.surface.primary}50, ${activeTheme.colors.semantic.surface.secondary}30)`,
                    border: `2px solid ${(filters as any)[key] === true ? activeTheme.colors.semantic.status.success + '40' : 'transparent'}`,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="text-lg">{icon}</div>
                  <input
                    type="checkbox"
                    checked={(filters as any)[key] === true}
                    onChange={(e) => updateFilter(key as keyof QuestionFilters, e.target.checked ? true : undefined)}
                    className="sr-only"
                  />
                  <div 
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      (filters as any)[key] === true
                        ? 'shadow-lg transform scale-110' 
                        : 'group-hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: (filters as any)[key] === true
                        ? activeTheme.colors.semantic.status.success 
                        : 'transparent',
                      borderColor: (filters as any)[key] === true
                        ? activeTheme.colors.semantic.status.success 
                        : activeTheme.colors.semantic.border.secondary,
                      boxShadow: (filters as any)[key] === true
                        ? `0 8px 20px ${activeTheme.colors.semantic.status.success}40` 
                        : 'none'
                    }}
                  >
                    {(filters as any)[key] === true && (
                      <svg className="w-4 h-4 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span 
                    className={`text-sm font-medium transition-all duration-300 ${
                      (filters as any)[key] === true ? 'font-bold' : 'group-hover:font-semibold'
                    }`}
                    style={{
                      color: (filters as any)[key] === true
                        ? activeTheme.colors.semantic.status.success 
                        : activeTheme.colors.semantic.text.primary
                    }}
                  >
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Date Range */}
          <FilterSection title="Created Date" id="dateRange">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange?.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    from: e.target.value ? new Date(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange?.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    to: e.target.value ? new Date(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </FilterSection>
        </div>
      )}
      
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${activeTheme.colors.semantic.action.primary}40 transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${activeTheme.colors.semantic.action.primary}40;
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${activeTheme.colors.semantic.action.primary}60;
          background-clip: content-box;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};