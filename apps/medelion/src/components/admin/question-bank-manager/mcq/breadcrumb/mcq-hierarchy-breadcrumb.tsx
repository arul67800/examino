'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '@/theme';
import { HierarchyItem, getTypeByLevel } from '@/lib/types/hierarchy.types';
import { useQuestionBankHierarchy, usePreviousPapersHierarchy } from '@/components/admin/hierarchy';
import { getHierarchyConfig, getLevelName, getLevelColor, canHaveMCQs, type HierarchyMode } from '@/components/admin/hierarchy/config/hierarchy-config';
import { IndividualBreadcrumbSelector } from './individual-breadcrumb-selector';
import { HierarchyBreadcrumbSelector, HierarchyPath as NewHierarchyPath } from './hierarchy-breadcrumb-selector';

export type { NewHierarchyPath as HierarchyPath };

interface MCQHierarchyBreadcrumbProps {
  /** Current hierarchy path for the MCQ */
  hierarchyPath?: NewHierarchyPath;
  /** Callback when hierarchy path changes */
  onHierarchyChange?: (path: NewHierarchyPath) => void;
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
  const { hierarchyItems: questionBankItems, loading: questionBankLoading } = useQuestionBankHierarchy();
  const { hierarchyItems: previousPapersItems, loading: previousPapersLoading } = usePreviousPapersHierarchy();
  const [selectedPath, setSelectedPath] = useState<NewHierarchyPath>(hierarchyPath);
  const hierarchyTypeRef = useRef<string | undefined>(hierarchyPath.hierarchyType);
  const previousHierarchyTypeRef = useRef<string | undefined>(hierarchyPath.hierarchyType);

  // Get current hierarchy items based on selected type
  const getCurrentHierarchyItems = () => {
    if (selectedPath.hierarchyType === 'previous-papers') {
      return previousPapersItems || [];
    }
    return questionBankItems || [];
  };

  const hierarchyItems = getCurrentHierarchyItems();
  const hierarchyLoading = questionBankLoading || previousPapersLoading;
  
  // Update selectedPath when hierarchyPath prop changes
  useEffect(() => {
    console.log('MCQHierarchyBreadcrumb: hierarchyPath prop changed:', hierarchyPath);
    
    // Preserve the current hierarchyType if the incoming prop doesn't have one
    const preservedHierarchyType = hierarchyPath.hierarchyType || hierarchyTypeRef.current;
    const newPath = {
      ...hierarchyPath,
      hierarchyType: preservedHierarchyType as 'question-bank' | 'previous-papers' | undefined
    };
    
    console.log('MCQHierarchyBreadcrumb: Current hierarchyTypeRef:', hierarchyTypeRef.current);
    console.log('MCQHierarchyBreadcrumb: Setting selectedPath to:', newPath);
    console.log('MCQHierarchyBreadcrumb: [DEBUG] selectedPath.mcq changing from', selectedPath.mcq?.id, 'to', newPath.mcq?.id);
    
    // Update the ref with the final hierarchy type
    hierarchyTypeRef.current = newPath.hierarchyType;
    
    setSelectedPath(newPath);
  }, [hierarchyPath]);

  // Clear hierarchy levels when hierarchy type changes
  useEffect(() => {
    console.log('MCQBreadcrumb: hierarchyType useEffect triggered', {
      currentType: selectedPath.hierarchyType,
      previousType: previousHierarchyTypeRef.current,
      hasSelectedPath: !!selectedPath,
      selectedPathMcq: selectedPath.mcq?.id
    });
    
    // Only clear if hierarchy type actually changed to a different value (not just initialization)
    if (selectedPath.hierarchyType && 
        previousHierarchyTypeRef.current !== undefined && 
        previousHierarchyTypeRef.current !== selectedPath.hierarchyType) {
      
      console.log('MCQBreadcrumb: Hierarchy type changed, checking if should clear...', {
        from: previousHierarchyTypeRef.current,
        to: selectedPath.hierarchyType
      });
      
      // Only clear if the new hierarchy type is actually different and we have other data to clear
      const hasOtherData = selectedPath.year || selectedPath.subject || selectedPath.part || 
                          selectedPath.section || selectedPath.chapter || selectedPath.mcq;
      
      // Don't clear if we have a "new-mcq" selected - this is intentional state that shouldn't be cleared
      const hasNewMcqSelected = selectedPath.mcq?.id === 'new-mcq';
      
      if (hasOtherData && !hasNewMcqSelected) {
        console.log('MCQBreadcrumb: CLEARING PATH due to hierarchy type change! This will clear mcq:', selectedPath.mcq?.id);
        const clearedPath = {
          hierarchyType: selectedPath.hierarchyType,
          year: undefined,
          subject: undefined,
          part: undefined,
          section: undefined,
          chapter: undefined,
          mcq: undefined
        };
        setSelectedPath(clearedPath);
        console.log('MCQBreadcrumb: [DEBUG] Calling onHierarchyChange from CLEAR useEffect with:', clearedPath);
        onHierarchyChange?.(clearedPath);
      } else {
        if (hasNewMcqSelected) {
          console.log('MCQBreadcrumb: NOT clearing because new-mcq is selected - preserving intentional state');
        } else {
          console.log('MCQBreadcrumb: No other data to clear, skipping clear');
        }
      }
    } else {
      console.log('MCQBreadcrumb: Not clearing - hierarchy type unchanged or initializing');
    }
    
    // Update the previous hierarchy type ref
    previousHierarchyTypeRef.current = selectedPath.hierarchyType;
  }, [selectedPath.hierarchyType]);
  

  
  const [openSelectorLevel, setOpenSelectorLevel] = useState<number | null>(null);
  const [showCombinedSelector, setShowCombinedSelector] = useState(false);

  // Initialize available options using useMemo to reduce unnecessary calculations
  const availableOptions = useMemo<{
    years: HierarchyItem[];
    subjects: HierarchyItem[];
    parts: HierarchyItem[];
    sections: HierarchyItem[];
    chapters: HierarchyItem[];
    mcqs: HierarchyItem[];
  }>(() => {
    const hierarchyMode = (selectedPath.hierarchyType || 'question-bank') as HierarchyMode;
    const config = getHierarchyConfig(hierarchyMode);
    
    // For MCQs, collect from the appropriate level based on current selection and hierarchy type
    let mcqOptions: HierarchyItem[] = [];
    
    if (hierarchyMode === 'previous-papers') {
      // For Previous Papers: MCQs are available after selecting Year (level 2, stored in subject field)
      if (selectedPath.subject) {
        mcqOptions = (selectedPath.subject.children || []).filter(child => child.level === config.maxLevels + 1);
      }
    } else {
      // For Main Bank: MCQs are available at Section (level 4) and Chapter (level 5) levels
      if (selectedPath.chapter) {
        // If chapter is selected, get MCQs from chapter only
        mcqOptions = (selectedPath.chapter.children || []).filter(child => child.level === 6);
      } else if (selectedPath.section) {
        // If section is selected but no chapter, get:
        // 1. MCQs directly attached to section (level 6)
        // 2. MCQs from all chapters under this section
        const directMCQs = (selectedPath.section.children || []).filter(child => child.level === 6);
        const chapterMCQs: HierarchyItem[] = [];
        
        // Get MCQs from all chapters under this section
        const chapters = (selectedPath.section.children || []).filter(child => child.level === 5);
        chapters.forEach(chapter => {
          const chapterMCQsItems = (chapter.children || []).filter(child => child.level === 6);
          chapterMCQs.push(...chapterMCQsItems);
        });
        
        mcqOptions = [...directMCQs, ...chapterMCQs];
      }
    }

    // If we have a "new-mcq" item in the selectedPath, make sure it's included in mcqOptions
    if (selectedPath.mcq && selectedPath.mcq.id === 'new-mcq') {
      // Add the new-mcq item to the options if not already present
      const hasNewMcqOption = mcqOptions.some(mcq => mcq.id === 'new-mcq');
      if (!hasNewMcqOption) {
        mcqOptions.unshift(selectedPath.mcq); // Add at the beginning
      }
    }

    const currentHierarchyItems = getCurrentHierarchyItems();
    return {
      years: currentHierarchyItems || [],
      subjects: selectedPath.year?.children || [],
      parts: selectedPath.subject?.children || [],
      sections: selectedPath.part?.children || [],
      chapters: (selectedPath.section?.children || []).filter(child => child.level === 5),
      mcqs: mcqOptions
    };
  }, [selectedPath.year, selectedPath.subject, selectedPath.part, selectedPath.section, selectedPath.chapter, selectedPath.mcq, selectedPath.hierarchyType, questionBankItems, previousPapersItems]);

  const handleLevelSelect = (level: number, item: HierarchyItem | null) => {
    const hierarchyMode = (selectedPath.hierarchyType || 'question-bank') as HierarchyMode;
    const config = getHierarchyConfig(hierarchyMode);
    const newPath = { ...selectedPath };

    // Clear all levels from the selected level and below
    if (level === 1) {
      // Level 1: Always Year for both hierarchies (but stored differently)
      newPath.year = item || undefined;
      newPath.subject = undefined;
      newPath.part = undefined;
      newPath.section = undefined;
      newPath.chapter = undefined;
      newPath.mcq = undefined;
    } else if (level === 2) {
      // Level 2: Subject for Main Bank, Year for Previous Papers (but both stored in subject field)
      newPath.subject = item || undefined;
      newPath.part = undefined;
      newPath.section = undefined;
      newPath.chapter = undefined;
      newPath.mcq = undefined;
    } else if (level === 3 && config.maxLevels >= 3) {
      newPath.part = item || undefined;
      newPath.section = undefined;
      newPath.chapter = undefined;
      newPath.mcq = undefined;
    } else if (level === 4 && config.maxLevels >= 4) {
      newPath.section = item || undefined;
      newPath.chapter = undefined;
      newPath.mcq = undefined;
    } else if (level === 5 && config.maxLevels >= 5) {
      newPath.chapter = item || undefined;
      newPath.mcq = undefined;
    } else if (level > config.maxLevels) {
      // MCQ level
      newPath.mcq = item || undefined;
    }

    setSelectedPath(newPath);
    
    // Always call onHierarchyChange for explicit user selections
    // The previous prevention logic was too aggressive and blocked legitimate breadcrumb navigation
    console.log('MCQBreadcrumb: [DEBUG] Calling onHierarchyChange from handleLevelSelect with:', newPath);
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
            backgroundColor: item.id === 'creating-new-mcq' 
              ? theme.colors.semantic.action.primary + '20'  // Special styling for "New MCQ" state
              : theme.colors.semantic.surface.secondary + '30'
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
            {item ? 
              (item.id === 'new-mcq' ? 'New MCQ' : 
               item.id === 'creating-new-mcq' ? 'New MCQ' : 
               item.name) 
              : `Select ${label}`}
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
              {(item.id === 'new-mcq' || item.id === 'creating-new-mcq') ? 'NEW' : item.questionCount}
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
    const hierarchyMode = (selectedPath.hierarchyType || 'question-bank') as HierarchyMode;
    const config = getHierarchyConfig(hierarchyMode);
    
    if (level > config.maxLevels) {
      // MCQ level
      return availableOptions.mcqs;
    }
    
    switch (level) {
      case 1: return availableOptions.years;
      case 2: return availableOptions.subjects; // For both Main Bank (Subject) and Previous Papers (Year)
      case 3: return availableOptions.parts;
      case 4: return availableOptions.sections;
      case 5: return availableOptions.chapters;
      default: return [];
    }
  };

  const getSelectionForLevel = (level: number): HierarchyItem | undefined => {
    const hierarchyMode = (selectedPath.hierarchyType || 'question-bank') as HierarchyMode;
    const config = getHierarchyConfig(hierarchyMode);
    
    if (level > config.maxLevels) {
      // MCQ level
      return selectedPath.mcq;
    }
    
    switch (level) {
      case 1: return selectedPath.year;
      case 2: return selectedPath.subject; // For both Main Bank (Subject) and Previous Papers (Year)
      case 3: return selectedPath.part;
      case 4: return selectedPath.section;
      case 5: return selectedPath.chapter;
      default: return undefined;
    }
  };

  const getLabelForLevel = (level: number): string => {
    const hierarchyMode = (selectedPath.hierarchyType || 'question-bank') as HierarchyMode;
    const config = getHierarchyConfig(hierarchyMode);
    
    // For MCQ level, always return 'MCQ' regardless of hierarchy type
    if (level > config.maxLevels) {
      return 'MCQ';
    }
    
    return config.levelNames[level] || 'Item';
  };

  // Build breadcrumb path array with levels - show all levels including empty ones
  const buildBreadcrumbPath = () => {
    console.log('MCQHierarchyBreadcrumb: [BREADCRUMB] buildBreadcrumbPath called with selectedPath:', selectedPath);
    
    const hierarchyMode = (selectedPath.hierarchyType || 'question-bank') as HierarchyMode;
    const config = getHierarchyConfig(hierarchyMode);
    
    console.log('MCQHierarchyBreadcrumb: [BREADCRUMB] hierarchyMode:', hierarchyMode, 'config.maxLevels:', config.maxLevels);
    
    // Build levels dynamically based on hierarchy config
    const levels: Array<{ item: HierarchyItem | undefined; level: number; label: string }> = [];
    
    // Add configured hierarchy levels
    for (let level = 1; level <= config.maxLevels; level++) {
      const levelName = config.levelNames[level];
      let item: HierarchyItem | undefined;
      
      // Map level to the appropriate selectedPath property
      switch (level) {
        case 1:
          item = selectedPath.year;
          break;
        case 2:
          if (hierarchyMode === 'question-bank') {
            item = selectedPath.subject;
          } else {
            // For previous-papers, level 2 is Year but stored in selectedPath.subject for consistency
            item = selectedPath.subject;
          }
          break;
        case 3:
          item = selectedPath.part;
          break;
        case 4:
          item = selectedPath.section;
          break;
        case 5:
          item = selectedPath.chapter;
          break;
      }
      
      levels.push({ item, level, label: levelName });
    }
    
    // Add MCQ level if we can have MCQs at the current selected level
    const lastSelectedLevelIndex = levels.findLastIndex(l => l.item);
    const lastSelectedItem = lastSelectedLevelIndex >= 0 ? levels[lastSelectedLevelIndex] : null;
    
    console.log('MCQHierarchyBreadcrumb: Last selected item:', lastSelectedItem ? { level: lastSelectedItem.level, name: lastSelectedItem.item?.name } : 'none');
    console.log('MCQHierarchyBreadcrumb: selectedPath.mcq:', selectedPath.mcq);
    
    // Check if MCQ level should be shown based on hierarchy configuration
    // MCQs can be created if we have a selected item at a level that supports MCQs
    const canHaveCheck = lastSelectedItem ? canHaveMCQs(lastSelectedItem.level, hierarchyMode) : 'no item';
    console.log('MCQHierarchyBreadcrumb: canHaveMCQs check:', canHaveCheck);
    
    const shouldShowMCQLevel = lastSelectedItem && canHaveMCQs(lastSelectedItem.level, hierarchyMode);
    
    if (shouldShowMCQLevel) {
      console.log('MCQHierarchyBreadcrumb: ✅ Adding MCQ level - can create MCQs at level', lastSelectedItem.level, 'MCQ item:', selectedPath.mcq);
      
      // If we have an MCQ item, use it; otherwise check if we should auto-create a "new-mcq" item
      let mcqItem = selectedPath.mcq;
      
      // Auto-create "new-mcq" item if missing but we're in new mode (check URL params)
      if (!mcqItem) {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'new') {
          mcqItem = {
            id: 'new-mcq',
            name: 'Create New MCQ',
            level: 6,
            type: 'MCQ' as const,
            color: '#3B82F6',
            order: 0,
            questionCount: 0,
            parentId: lastSelectedItem.item?.id || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            children: [],
            isPublished: false
          };
          console.log('MCQHierarchyBreadcrumb: Auto-created new-mcq item for mode=new');
        }
      }
      
      levels.push({ item: mcqItem, level: config.maxLevels + 1, label: 'MCQ' });
      console.log('MCQHierarchyBreadcrumb: [BREADCRUMB] After adding MCQ level, levels.length:', levels.length);
    } else {
      console.log('MCQHierarchyBreadcrumb: ❌ No selected item found, cannot determine MCQ eligibility');
    }

    // Show levels up to the last selected + 1 (to show next available level)
    let maxLevelToShow = Math.min(lastSelectedLevelIndex + 2, levels.length);
    
    // If we added an MCQ level, make sure we show it
    if (shouldShowMCQLevel) {
      maxLevelToShow = levels.length; // Show all levels including the MCQ level
    }
    
    // Always show at least the first level
    maxLevelToShow = Math.max(maxLevelToShow, 1);
    
    console.log('MCQHierarchyBreadcrumb: [BREADCRUMB] maxLevelToShow:', maxLevelToShow, 'levels.length:', levels.length, 'lastSelectedLevelIndex:', lastSelectedLevelIndex, 'shouldShowMCQLevel:', shouldShowMCQLevel);

    const finalLevels = levels.slice(0, maxLevelToShow);
    console.log('MCQHierarchyBreadcrumb: [BREADCRUMB] Returning levels (slice):', finalLevels);
    
    return finalLevels;
  };

  const breadcrumbPath = buildBreadcrumbPath();
  
  console.log('MCQHierarchyBreadcrumb: [BREADCRUMB] Final breadcrumbPath:', breadcrumbPath);

  // Show loading state while hierarchy data is being fetched
  if (hierarchyLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className={`flex items-center flex-wrap gap-2 ${compact ? 'py-2' : 'py-3'}`}>
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Loading hierarchy...</span>
          </div>
        </div>
      </div>
    );
  }

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
              {selectedPath.hierarchyType === 'previous-papers' 
                ? (compact ? 'Prev Papers' : 'Previous Papers')
                : selectedPath.hierarchyType === 'question-bank'
                ? (compact ? 'Q Bank' : 'Question Bank')
                : (compact ? 'Select' : 'Select Hierarchy')
              }
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

          {/* Hierarchy Breadcrumb Selector */}
          <HierarchyBreadcrumbSelector
            currentSelection={selectedPath.hierarchyType}
            isOpen={showCombinedSelector}
            onToggle={() => {
              setShowCombinedSelector(false);
            }}
            onSelect={(hierarchyType) => {
              // When changing hierarchy type, clear all hierarchy levels since they're incompatible
              const newPath = { 
                hierarchyType: hierarchyType || undefined,
                year: undefined,
                subject: undefined,
                part: undefined,
                section: undefined,
                chapter: undefined,
                mcq: undefined
              };
              
              // Update the ref to remember this hierarchy type
              hierarchyTypeRef.current = newPath.hierarchyType;
              
              setSelectedPath(newPath);
              console.log('MCQBreadcrumb: [DEBUG] Calling onHierarchyChange from hierarchy selector with:', newPath);
              onHierarchyChange?.(newPath);
            }}
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