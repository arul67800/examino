'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/theme';
import { HierarchyItem, getTypeByLevel } from '@/lib/types/hierarchy.types';
import { IndividualBreadcrumbSelector } from './individual-breadcrumb-selector';
import { CombinedBreadcrumbSelector, HierarchyPath as CombinedHierarchyPath } from './combined-breadcrumb-selector';

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
                questionCount: 8,
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
                    children: [
                      {
                        id: 'mcq-1',
                        name: 'Maxillary Nerve Anatomy MCQ',
                        level: 6,
                        type: 'MCQ',
                        color: '#065F46',
                        order: 1,
                        questionCount: 1,
                        parentId: 'maxillary-nerve',
                        createdAt: '2024-01-01T00:00:00Z',
                        updatedAt: '2024-01-01T00:00:00Z',
                        children: []
                      },
                      {
                        id: 'mcq-2',
                        name: 'Maxillary Nerve Function MCQ',
                        level: 6,
                        type: 'MCQ',
                        color: '#065F46',
                        order: 2,
                        questionCount: 1,
                        parentId: 'maxillary-nerve',
                        createdAt: '2024-01-01T00:00:00Z',
                        updatedAt: '2024-01-01T00:00:00Z',
                        children: []
                      }
                    ]
                  },
                  // MCQs can also be added directly to Section level
                  {
                    id: 'section-mcq-1',
                    name: 'Cranial Nerves Overview MCQ',
                    level: 6,
                    type: 'MCQ',
                    color: '#065F46',
                    order: 3,
                    questionCount: 1,
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

export type { CombinedHierarchyPath as HierarchyPath };

interface MCQHierarchyBreadcrumbProps {
  /** Current hierarchy path for the MCQ */
  hierarchyPath?: CombinedHierarchyPath;
  /** Callback when hierarchy path changes */
  onHierarchyChange?: (path: CombinedHierarchyPath) => void;
  /** Whether the component is in editing mode */
  isEditing?: boolean;
  /** Custom class name */
  className?: string;
  /** Show edit button even when not in editing mode */
  showEditButton?: boolean;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

export default function MCQHierarchyBreadcrumb({
  hierarchyPath = {},
  onHierarchyChange,
  isEditing = false,
  className = '',
  showEditButton = true,
  compact = false
}: MCQHierarchyBreadcrumbProps) {
  const { theme } = useTheme();
  const [selectedPath, setSelectedPath] = useState<CombinedHierarchyPath>(hierarchyPath);
  const [availableOptions, setAvailableOptions] = useState<{
    years: HierarchyItem[];
    subjects: HierarchyItem[];
    parts: HierarchyItem[];
    sections: HierarchyItem[];
    chapters: HierarchyItem[];
    mcqs: HierarchyItem[];
  }>({
    years: [],
    subjects: [],
    parts: [],
    sections: [],
    chapters: [],
    mcqs: []
  });
  
  const [openSelectorLevel, setOpenSelectorLevel] = useState<number | null>(null);
  const [showCombinedSelector, setShowCombinedSelector] = useState(false);

  // Initialize available options
  useEffect(() => {
    // For MCQs, get children from either chapter (level 5) or section (level 4) if no chapter is selected
    let mcqOptions: HierarchyItem[] = [];
    if (selectedPath.chapter) {
      // If chapter is selected, get MCQs from chapter
      mcqOptions = selectedPath.chapter.children || [];
    } else if (selectedPath.section) {
      // If section is selected but no chapter, get MCQs directly from section
      mcqOptions = selectedPath.section.children.filter(child => child.level === 6) || [];
    }

    setAvailableOptions({
      years: MOCK_HIERARCHY_DATA,
      subjects: selectedPath.year?.children || [],
      parts: selectedPath.subject?.children || [],
      sections: selectedPath.part?.children || [],
      chapters: selectedPath.section?.children.filter(child => child.level === 5) || [],
      mcqs: mcqOptions
    });
  }, [selectedPath.year, selectedPath.subject, selectedPath.part, selectedPath.section, selectedPath.chapter]);

  const handleLevelSelect = (level: number, item: HierarchyItem | null) => {
    const newPath = { ...selectedPath };

    // Clear all levels from the selected level and below
    if (level <= 1) {
      newPath.year = item || undefined;
      newPath.subject = undefined;
      newPath.part = undefined;
      newPath.section = undefined;
      newPath.chapter = undefined;
      newPath.mcq = undefined;
    } else if (level <= 2) {
      newPath.subject = item || undefined;
      newPath.part = undefined;
      newPath.section = undefined;
      newPath.chapter = undefined;
      newPath.mcq = undefined;
    } else if (level <= 3) {
      newPath.part = item || undefined;
      newPath.section = undefined;
      newPath.chapter = undefined;
      newPath.mcq = undefined;
    } else if (level <= 4) {
      newPath.section = item || undefined;
      newPath.chapter = undefined;
      newPath.mcq = undefined;
    } else if (level <= 5) {
      newPath.chapter = item || undefined;
      newPath.mcq = undefined;
    } else if (level <= 6) {
      newPath.mcq = item || undefined;
    }

    setSelectedPath(newPath);
    onHierarchyChange?.(newPath);
  };

  const renderBreadcrumbItem = (item: HierarchyItem | undefined, index: number, isLast: boolean, level: number, label: string) => (
    <React.Fragment key={`breadcrumb-${level}`}>
      <div className="relative">
        <button
          onClick={() => setOpenSelectorLevel(openSelectorLevel === level ? null : level)}
          className={`
            inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 group hover:scale-105 hover:shadow-md
            ${compact ? 'px-2.5 py-1.5 text-xs' : ''}
            ${item && isLast 
              ? 'text-white shadow-lg hover:shadow-xl' 
              : 'hover:bg-white hover:shadow-sm'
            }
          `}
          style={item && isLast ? {
            background: `linear-gradient(135deg, ${theme.colors.semantic.action.primary}, ${theme.colors.semantic.action.primary}dd)`,
            boxShadow: `0 4px 12px ${theme.colors.semantic.action.primary}40`
          } : !item ? {
            color: theme.colors.semantic.text.tertiary,
            backgroundColor: theme.colors.semantic.surface.secondary + '20'
          } : {
            color: theme.colors.semantic.text.secondary,
            backgroundColor: theme.colors.semantic.surface.secondary + '30'
          }}
        >
          <div 
            className={`rounded-full mr-2 transition-all duration-300 group-hover:scale-110 ${compact ? 'w-2 h-2 mr-1.5' : 'w-2.5 h-2.5'}`}
            style={{ 
              backgroundColor: item && isLast 
                ? 'white' 
                : item 
                  ? (item.color || theme.colors.semantic.action.primary)
                  : theme.colors.semantic.border.secondary
            }}
          />
          <span className={`truncate ${compact ? 'max-w-20' : 'max-w-32'}`}>
            {item ? item.name : `Select ${label}`}
          </span>
          {item && item.level === 5 && item.questionCount > 0 && (
            <span 
              className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-300 ${compact ? 'ml-1.5 px-1.5' : ''}`}
              style={{
                backgroundColor: isLast ? 'rgba(255,255,255,0.2)' : theme.colors.semantic.surface.secondary + '60',
                color: isLast ? 'white' : theme.colors.semantic.text.secondary
              }}
            >
              {item.questionCount}
            </span>
          )}
          {item && item.level === 6 && (
            <span 
              className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-300 ${compact ? 'ml-1.5 px-1.5' : ''}`}
              style={{
                backgroundColor: isLast ? 'rgba(255,255,255,0.2)' : theme.colors.semantic.action.primary + '20',
                color: isLast ? 'white' : theme.colors.semantic.action.primary
              }}
            >
              {item.id === 'new-mcq' ? 'NEW' : item.questionCount}
            </span>
          )}
          <svg 
            className={`w-4 h-4 ml-2 transition-transform duration-300 group-hover:rotate-180 ${
              openSelectorLevel === level ? 'rotate-180' : ''
            } ${compact ? 'w-3 h-3 ml-1.5' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Individual Level Selector */}
        <IndividualBreadcrumbSelector
          level={level}
          items={getItemsForLevel(level)}
          currentSelection={getSelectionForLevel(level)}
          label={getLabelForLevel(level)}
          isOpen={openSelectorLevel === level}
          onToggle={() => setOpenSelectorLevel(null)}
          onSelect={(item) => handleLevelSelect(level, item)}
          theme={theme}
        />
      </div>
      
      {!isLast && (
        <svg className={`text-gray-400 ${compact ? 'w-3 h-3 mx-1' : 'w-3.5 h-3.5 mx-1.5'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </React.Fragment>
  );

  const getItemsForLevel = (level: number): HierarchyItem[] => {
    switch (level) {
      case 1: return availableOptions.years;
      case 2: return availableOptions.subjects;
      case 3: return availableOptions.parts;
      case 4: return availableOptions.sections;
      case 5: return availableOptions.chapters;
      case 6: return availableOptions.mcqs;
      default: return [];
    }
  };

  const getSelectionForLevel = (level: number): HierarchyItem | undefined => {
    switch (level) {
      case 1: return selectedPath.year;
      case 2: return selectedPath.subject;
      case 3: return selectedPath.part;
      case 4: return selectedPath.section;
      case 5: return selectedPath.chapter;
      case 6: return selectedPath.mcq;
      default: return undefined;
    }
  };

  const getLabelForLevel = (level: number): string => {
    switch (level) {
      case 1: return 'Academic Year';
      case 2: return 'Subject';
      case 3: return 'Part';
      case 4: return 'Section';
      case 5: return 'Chapter';
      case 6: return 'MCQ';
      default: return 'Item';
    }
  };

  // Build breadcrumb path array with levels - show all levels including empty ones
  const buildBreadcrumbPath = () => {
    const levels = [
      { item: selectedPath.year, level: 1, label: 'Year' },
      { item: selectedPath.subject, level: 2, label: 'Subject' },
      { item: selectedPath.part, level: 3, label: 'Part' },
      { item: selectedPath.section, level: 4, label: 'Section' },
      { item: selectedPath.chapter, level: 5, label: 'Chapter' },
      { item: selectedPath.mcq, level: 6, label: 'MCQ' }
    ];

    // Show levels up to the last selected + 1 (to show next available level)
    let lastFilledIndex = -1;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].item) {
        lastFilledIndex = i;
      }
    }

    // Special handling: Show MCQ level if we're at level 4 (Section) or 5 (Chapter)
    // since both levels can add MCQs
    let maxLevelToShow = Math.min(lastFilledIndex + 2, levels.length);
    
    // If we have section (level 4) or chapter (level 5) selected, show MCQ level
    if (selectedPath.section && !selectedPath.chapter) {
      // At section level, show both chapter and MCQ options
      maxLevelToShow = Math.max(maxLevelToShow, 6); // Show up to MCQ level
    } else if (selectedPath.chapter) {
      // At chapter level, show MCQ level
      maxLevelToShow = Math.max(maxLevelToShow, 6); // Show up to MCQ level
    }

    return levels.slice(0, Math.max(maxLevelToShow, 1));
  };

  const breadcrumbPath = buildBreadcrumbPath();

  return (
    <div className={`relative ${className}`}>
      {/* Breadcrumb Display */}
      <div className={`flex items-center flex-wrap gap-2 ${compact ? 'py-2' : 'py-3'}`}>
        <div className="relative">
          <button
            onClick={() => setShowCombinedSelector(!showCombinedSelector)}
            className={`
              inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 
              hover:shadow-md hover:scale-105 border backdrop-blur-sm
              ${compact ? 'px-2.5 py-1.5 text-xs' : ''}
              ${showCombinedSelector 
                ? 'shadow-lg' 
                : 'hover:bg-white/80'
              }
            `}
            style={{ 
              color: theme.colors.semantic.text.secondary,
              backgroundColor: showCombinedSelector 
                ? theme.colors.semantic.action.primary + '15' 
                : theme.colors.semantic.surface.primary + '50',
              borderColor: showCombinedSelector 
                ? theme.colors.semantic.action.primary + '40'
                : theme.colors.semantic.border.primary,
              boxShadow: showCombinedSelector 
                ? `0 4px 12px ${theme.colors.semantic.action.primary}30`
                : 'none'
            }}
          >
            <div 
              className={`rounded-full mr-2 transition-all duration-300 ${compact ? 'w-2 h-2 mr-1.5' : 'w-2.5 h-2.5'}`}
              style={{ backgroundColor: theme.colors.semantic.action.primary }}
            />
            <span className="font-semibold">
              {compact ? 'Path' : 'Hierarchy'}
            </span>
            <svg 
              className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                showCombinedSelector ? 'rotate-180' : ''
              } ${compact ? 'w-3 h-3 ml-1.5' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Combined Hierarchy Selector */}
          <CombinedBreadcrumbSelector
            hierarchyPath={selectedPath}
            onHierarchyChange={(path: CombinedHierarchyPath) => {
              setSelectedPath(path);
              onHierarchyChange?.(path);
            }}
            isOpen={showCombinedSelector}
            onClose={() => setShowCombinedSelector(false)}
            theme={theme}
          />
        </div>

        <div className="flex items-center flex-wrap gap-1 flex-1">
          {breadcrumbPath.length > 0 ? (
            breadcrumbPath.map(({ item, level, label }, index) =>
              renderBreadcrumbItem(item, index, index === breadcrumbPath.length - 1, level, label)
            )
          ) : (
            <button
              onClick={() => setShowCombinedSelector(true)}
              className={`
                inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                hover:shadow-md hover:scale-105 border-2 border-dashed backdrop-blur-sm
                ${compact ? 'px-3 py-1.5 text-xs' : ''}
              `}
              style={{ 
                color: theme.colors.semantic.text.tertiary,
                backgroundColor: theme.colors.semantic.surface.secondary + '20',
                borderColor: theme.colors.semantic.border.secondary + '60'
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Click to select hierarchy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}