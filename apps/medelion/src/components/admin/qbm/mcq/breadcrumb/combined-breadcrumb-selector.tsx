'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HierarchyItem } from '@/lib/types/hierarchy.types';

// Mock data for demo - in real app this would come from API
const MOCK_HIERARCHY_DATA: HierarchyItem[] = [
  {
    id: 'first-year',
    name: 'First Year',
    level: 1,
    type: 'Year',
    color: '#8B5CF6',
    order: 1,
    questionCount: 0,
    parentId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'anatomy',
        name: 'Anatomy',
        level: 2,
        type: 'Subject',
        color: '#7C3AED',
        order: 1,
        questionCount: 0,
        parentId: 'first-year',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: [
          {
            id: 'head-neck',
            name: 'Head & Neck',
            level: 3,
            type: 'Part',
            color: '#10B981',
            order: 2,
            questionCount: 0,
            parentId: 'anatomy',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            children: [
              {
                id: 'cranial-nerves',
                name: 'Cranial Nerves',
                level: 4,
                type: 'Section',
                color: '#059669',
                order: 1,
                questionCount: 0,
                parentId: 'head-neck',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                children: [
                  {
                    id: 'maxillary-nerve',
                    name: 'Maxillary Nerve',
                    level: 5,
                    type: 'Chapter',
                    color: '#047857',
                    order: 2,
                    questionCount: 14,
                    parentId: 'cranial-nerves',
                    createdAt: '2024-01-01T00:00:00Z',
                    updatedAt: '2024-01-01T00:00:00Z',
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export interface HierarchyPath {
  year?: HierarchyItem;
  subject?: HierarchyItem;
  part?: HierarchyItem;
  section?: HierarchyItem;
  chapter?: HierarchyItem;
  mcq?: HierarchyItem;
}

export interface CombinedBreadcrumbSelectorProps {
  /** Current hierarchy path */
  hierarchyPath: HierarchyPath;
  /** Callback when hierarchy path changes */
  onHierarchyChange: (path: HierarchyPath) => void;
  /** Whether the selector is open */
  isOpen: boolean;
  /** Callback to close the selector */
  onClose: () => void;
  /** Theme object for styling */
  theme: any;
  /** Compact mode for smaller displays */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

export const CombinedBreadcrumbSelector: React.FC<CombinedBreadcrumbSelectorProps> = ({
  hierarchyPath,
  onHierarchyChange,
  isOpen,
  onClose,
  theme,
  compact = false,
  className = ''
}) => {
  const [selectedPath, setSelectedPath] = useState<HierarchyPath>(hierarchyPath);
  const [availableOptions, setAvailableOptions] = useState<{
    years: HierarchyItem[];
    subjects: HierarchyItem[];
    parts: HierarchyItem[];
    sections: HierarchyItem[];
    chapters: HierarchyItem[];
  }>({
    years: [],
    subjects: [],
    parts: [],
    sections: [],
    chapters: []
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize available options when path changes
  useEffect(() => {
    setAvailableOptions({
      years: MOCK_HIERARCHY_DATA,
      subjects: selectedPath.year?.children || [],
      parts: selectedPath.subject?.children || [],
      sections: selectedPath.part?.children || [],
      chapters: selectedPath.section?.children || []
    });
  }, [selectedPath.year, selectedPath.subject, selectedPath.part, selectedPath.section]);

  // Update internal state when external path changes
  useEffect(() => {
    setSelectedPath(hierarchyPath);
  }, [hierarchyPath]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleLevelSelect = (level: number, item: HierarchyItem | null) => {
    const newPath = { ...selectedPath };

    // Clear all levels from the selected level and below
    if (level <= 1) {
      newPath.year = item || undefined;
      newPath.subject = undefined;
      newPath.part = undefined;
      newPath.section = undefined;
      newPath.chapter = undefined;
    } else if (level <= 2) {
      newPath.subject = item || undefined;
      newPath.part = undefined;
      newPath.section = undefined;
      newPath.chapter = undefined;
    } else if (level <= 3) {
      newPath.part = item || undefined;
      newPath.section = undefined;
      newPath.chapter = undefined;
    } else if (level <= 4) {
      newPath.section = item || undefined;
      newPath.chapter = undefined;
    } else if (level <= 5) {
      newPath.chapter = item || undefined;
    }

    setSelectedPath(newPath);
  };

  const renderLevelDropdown = (
    level: number, 
    items: HierarchyItem[], 
    currentSelection: HierarchyItem | undefined, 
    label: string
  ) => (
    <div className={compact ? 'mb-4' : 'mb-5'}>
      <label 
        className={`block font-semibold mb-2 ${compact ? 'text-sm' : 'text-base'}`}
        style={{ color: theme.colors.semantic.text.primary }}
      >
        <div className="flex items-center space-x-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.colors.semantic.action.primary }}
          />
          <span>{label}</span>
        </div>
      </label>
      <div className="relative">
        <select
          value={currentSelection?.id || ''}
          onChange={(e) => {
            const item = items.find(i => i.id === e.target.value);
            handleLevelSelect(level, item || null);
          }}
          className={`w-full border rounded-lg focus:ring-2 focus:border-transparent appearance-none bg-white transition-all duration-200 hover:shadow-sm ${
            compact ? 'p-3 text-sm' : 'p-4 text-base'
          }`}
          style={{ 
            borderColor: theme.colors.semantic.border.primary
          }}
        >
          <option value="" disabled>Select {label}</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} {item.level === 5 && item.questionCount > 0 && `(${item.questionCount} questions)`}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );

  const applyChanges = () => {
    onHierarchyChange(selectedPath);
    onClose();
  };

  const cancelChanges = () => {
    setSelectedPath(hierarchyPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={`absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl z-50 min-w-96 max-w-2xl ${className}`}
      style={{ 
        border: `1px solid ${theme.colors.semantic.border.primary}`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        backgroundColor: theme.colors.semantic.surface.primary
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: theme.colors.semantic.border.secondary + '30' }}>
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: theme.colors.semantic.action.primary + '10' }}
          >
            <svg className="w-5 h-5" style={{ color: theme.colors.semantic.action.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
              Select Hierarchy Path
            </h3>
            <p className="text-sm mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
              Choose the complete academic hierarchy for your questions
            </p>
          </div>
        </div>
        <button
          onClick={cancelChanges}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all duration-200"
          style={{ color: theme.colors.semantic.text.tertiary }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Hierarchy Selection Form */}
      <div className="px-8 py-6 space-y-6 max-h-96 overflow-y-auto">
        {/* Academic Year */}
        {renderLevelDropdown(1, availableOptions.years, selectedPath.year, 'Academic Year')}
        
        {/* Subject */}
        {selectedPath.year && availableOptions.subjects.length > 0 && 
          renderLevelDropdown(2, availableOptions.subjects, selectedPath.subject, 'Subject')}
        
        {/* Part */}
        {selectedPath.subject && availableOptions.parts.length > 0 && 
          renderLevelDropdown(3, availableOptions.parts, selectedPath.part, 'Part')}
        
        {/* Section */}
        {selectedPath.part && availableOptions.sections.length > 0 && 
          renderLevelDropdown(4, availableOptions.sections, selectedPath.section, 'Section')}
        
        {/* Chapter */}
        {selectedPath.section && availableOptions.chapters.length > 0 && 
          renderLevelDropdown(5, availableOptions.chapters, selectedPath.chapter, 'Chapter')}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center px-8 py-6 border-t bg-gray-50/50" style={{ borderColor: theme.colors.semantic.border.secondary + '30' }}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-sm font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
            {Object.values(selectedPath).filter(Boolean).length} of 5 levels selected
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={cancelChanges}
            className="px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100"
            style={{ 
              color: theme.colors.semantic.text.secondary,
              border: `1px solid ${theme.colors.semantic.border.primary}`
            }}
          >
            Cancel
          </button>
          <button
            onClick={applyChanges}
            className="px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:opacity-90 shadow-md"
            style={{ 
              backgroundColor: theme.colors.semantic.action.primary,
              boxShadow: `0 4px 12px ${theme.colors.semantic.action.primary}30`
            }}
          >
            Apply Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombinedBreadcrumbSelector;