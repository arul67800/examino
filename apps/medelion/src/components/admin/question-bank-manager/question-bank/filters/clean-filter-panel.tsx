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
        className="mb-3 rounded-lg border transition-all duration-200"
        style={{
          backgroundColor: activeTheme.colors.semantic.surface.primary,
          borderColor: activeTheme.colors.semantic.border.secondary
        }}
      >
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-4 py-3 text-left flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center space-x-3">
            {icon && (
              <div style={{ color: activeTheme.colors.semantic.text.secondary }}>
                {icon}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span 
                className="font-medium text-sm"
                style={{ color: activeTheme.colors.semantic.text.primary }}
              >
                {title}
              </span>
              {count !== undefined && count > 0 && (
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: activeTheme.colors.semantic.action.primary + '20',
                    color: activeTheme.colors.semantic.action.primary
                  }}
                >
                  {count}
                </span>
              )}
            </div>
          </div>
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            style={{ color: activeTheme.colors.semantic.text.secondary }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4">
            {children}
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
    <div className="space-y-2">
      {options.map((option) => (
        <label 
          key={option} 
          className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: selected.includes(option) 
              ? activeTheme.colors.semantic.action.primary + '08'
              : 'transparent'
          }}
        >
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={(e) => onChange(option, e.target.checked)}
            className="w-4 h-4 rounded border-2 focus:ring-0 focus:ring-offset-0"
            style={{
              color: activeTheme.colors.semantic.action.primary,
              borderColor: selected.includes(option) 
                ? activeTheme.colors.semantic.action.primary 
                : activeTheme.colors.semantic.border.secondary
            }}
          />
          <span 
            className="text-sm"
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

  const DifficultyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const TypeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const PointsIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  const TimeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const TagIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );

  const ContentIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const DateIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div 
      className={`h-full overflow-y-auto ${className}`}
      style={{ backgroundColor: activeTheme.colors.semantic.surface.secondary }}
    >
      {/* Clean Header */}
      <div 
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{
          backgroundColor: activeTheme.colors.semantic.surface.primary,
          borderColor: activeTheme.colors.semantic.border.primary
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: activeTheme.colors.semantic.text.secondary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            <h3 
              className="font-semibold"
              style={{ color: activeTheme.colors.semantic.text.primary }}
            >
              Filters
            </h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-2 py-1 rounded text-xs font-medium hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: activeTheme.colors.semantic.status.error + '10',
                color: activeTheme.colors.semantic.status.error
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="p-4 space-y-4">
          {/* Difficulty Filter */}
          <FilterSection 
            title="Difficulty" 
            id="difficulty"
            icon={<DifficultyIcon />}
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
            title="Type" 
            id="type"
            icon={<TypeIcon />}
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
          <FilterSection title="Points" id="points" icon={<PointsIcon />}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                value={filters.points?.min || ''}
                onChange={(e) => updateFilter('points', {
                  ...filters.points,
                  min: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1"
                style={{
                  backgroundColor: activeTheme.colors.semantic.surface.primary,
                  borderColor: activeTheme.colors.semantic.border.secondary,
                  color: activeTheme.colors.semantic.text.primary
                }}
                placeholder="Min"
              />
              <input
                type="number"
                min="0"
                value={filters.points?.max || ''}
                onChange={(e) => updateFilter('points', {
                  ...filters.points,
                  max: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1"
                style={{
                  backgroundColor: activeTheme.colors.semantic.surface.primary,
                  borderColor: activeTheme.colors.semantic.border.secondary,
                  color: activeTheme.colors.semantic.text.primary
                }}
                placeholder="Max"
              />
            </div>
          </FilterSection>

          {/* Content Flags */}
          <FilterSection title="Content" id="content" icon={<ContentIcon />}>
            <div className="space-y-2">
              {[
                { key: 'hasExplanation', label: 'Has Explanation' },
                { key: 'hasReferences', label: 'Has References' },
                { key: 'isActive', label: 'Active Only' }
              ].map(({ key, label }) => (
                <label 
                  key={key}
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: (filters as any)[key] === true
                      ? activeTheme.colors.semantic.action.primary + '08'
                      : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={(filters as any)[key] === true}
                    onChange={(e) => updateFilter(key as keyof QuestionFilters, e.target.checked ? true : undefined)}
                    className="w-4 h-4 rounded border-2 focus:ring-0 focus:ring-offset-0"
                    style={{
                      color: activeTheme.colors.semantic.action.primary,
                      borderColor: (filters as any)[key] === true
                        ? activeTheme.colors.semantic.action.primary 
                        : activeTheme.colors.semantic.border.secondary
                    }}
                  />
                  <span 
                    className="text-sm"
                    style={{
                      color: (filters as any)[key] === true
                        ? activeTheme.colors.semantic.action.primary 
                        : activeTheme.colors.semantic.text.primary
                    }}
                  >
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <FilterSection 
              title="Tags" 
              id="tags"
              icon={<TagIcon />}
              count={filters.tags?.length}
            >
              <CheckboxGroup
                options={availableTags.slice(0, 10)}
                selected={filters.tags || []}
                onChange={(value, checked) => {
                  if (checked) {
                    addToArrayFilter('tags', value);
                  } else {
                    removeFromArrayFilter('tags', value);
                  }
                }}
              />
            </FilterSection>
          )}
        </div>
      )}
    </div>
  );
};