'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, AcademicCapIcon, BookOpenIcon, DocumentTextIcon, TargetIcon } from '@/components/dashboard/sidebar/sidebar-icons';
import { useTheme } from '@/theme';

interface HierarchyItem {
  id: string;
  name: string;
  level: number;
  type: string;
  questionCount: number;
  isPublished?: boolean;
  parent?: HierarchyItem;
  children?: HierarchyItem[];
}

interface QbSubjectNavigatorProps {
  hierarchyItems: HierarchyItem[];
  currentSubjectId: string;
  currentYearId: string;
}

export default function QbSubjectNavigator({ hierarchyItems, currentSubjectId, currentYearId }: QbSubjectNavigatorProps) {
  const { theme } = useTheme();
  const router = useRouter();
  
  console.log('QbSubjectNavigator rendered for subject:', currentSubjectId);
  console.log('Hierarchy items count:', hierarchyItems.length);
  console.log('Current year ID:', currentYearId);
  console.log('Raw hierarchyItems:', hierarchyItems);

  // Mock data fallback for testing
  const mockHierarchyItems = [
    {
      id: 'first-year',
      name: 'First Year',
      level: 1,
      type: 'Year',
      questionCount: 0,
      isPublished: true,
      children: [
        {
          id: 'anatomy',
          name: 'Anatomy',
          level: 2,
          type: 'Subject',
          questionCount: 25,
          isPublished: true,
          children: [
            {
              id: 'upper-limb',
              name: 'Upper Limb',
              level: 3,
              type: 'Part',
              questionCount: 10,
              isPublished: true,
              children: []
            },
            {
              id: 'lower-limb',
              name: 'Lower Limb',
              level: 3,
              type: 'Part',
              questionCount: 15,
              isPublished: true,
              children: []
            }
          ]
        }
      ]
    }
  ];

  // Use mock data if no real data is available
  const dataToUse = hierarchyItems.length > 0 ? hierarchyItems : mockHierarchyItems;

  // Find the current year and its subjects
  const currentYear = dataToUse.find(item => item.id === currentYearId);
  const yearSubjects = currentYear?.children || [];

  // Find the current subject from the year's children
  const currentSubject = yearSubjects.find(subject => subject.id === currentSubjectId);

  console.log('Found current year:', currentYear?.name);
  console.log('Year subjects count:', yearSubjects.length);
  console.log('Found current subject:', currentSubject?.name);
  console.log('Current subject children:', currentSubject?.children?.length || 0);

  // Derive expanded state directly from the subject - always show everything expanded
  const getAllItemIds = (item: HierarchyItem): string[] => {
    let ids: string[] = [item.id];
    if (item.children && item.children.length > 0) {
      item.children.forEach((child: HierarchyItem) => {
        ids = ids.concat(getAllItemIds(child));
      });
    }
    return ids;
  };

  // State for manually collapsed items (items user has collapsed)
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState<boolean>(false);

  // Reset collapsed state when subject changes
  useEffect(() => {
    console.log('Resetting collapsed state for subject:', currentSubjectId);
    setCollapsedItems(new Set());
    setSelectedItem(null);
  }, [currentSubjectId]);

  // Determine if an item is expanded (expanded by default, unless manually collapsed)
  const isItemExpanded = (itemId: string) => !collapsedItems.has(itemId);

  const toggleExpanded = (itemId: string) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        // Remove from collapsed = expand it
        newSet.delete(itemId);
        console.log('Expanding item:', itemId);
      } else {
        // Add to collapsed = collapse it
        newSet.add(itemId);
        console.log('Collapsing item:', itemId);
      }
      return newSet;
    });
  };

  const getIconForLevel = (level: number) => {
    switch (level) {
      case 2: return <TargetIcon />; // Subject
      case 3: return <BookOpenIcon />; // Part
      case 4: return <DocumentTextIcon />; // Section  
      case 5: return <DocumentTextIcon />; // Chapter
      default: return <DocumentTextIcon />;
    }
  };

  const getTypeByLevel = (level: number): string => {
    switch (level) {
      case 1: return 'Year';
      case 2: return 'Subject';
      case 3: return 'Part';
      case 4: return 'Section';
      case 5: return 'Chapter';
      case 6: return 'MCQ';
      default: return 'Item';
    }
  };

  const renderHierarchyItem = (item: HierarchyItem, depth: number = 0, isCompact: boolean = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = isItemExpanded(item.id);
    const isSelected = selectedItem === item.id;
    const isCurrentSubject = item.id === currentSubjectId;
    const indentLevel = depth * (isCompact ? 12 : 16); // Equal 12/16px increment per level
    const isLastChild = false; // We'll implement this for more advanced tree lines

    return (
      <div key={item.id} className="select-none">
        {/* Advanced Tree Item */}
        <div
          className={`
            relative flex items-center cursor-pointer group
            transition-all duration-300 ease-out
            ${isCompact ? 'py-2 px-2' : 'py-3 px-3'}
            rounded-lg hover:shadow-md hover:shadow-black/5
            ${hasChildren ? 'hover:-translate-y-0.5' : 'hover:translate-x-1'}
          `}
          style={{
            paddingLeft: `${12 + indentLevel}px`,
            backgroundColor: 'transparent', // Remove background from main container
            minHeight: isCompact ? '40px' : '48px',
          }}
          onMouseEnter={(e) => {
            // Find the content area within this container
            const contentArea = e.currentTarget.querySelector('[data-content-area]') as HTMLElement;
            if (contentArea && !isSelected) {
              contentArea.style.background = `linear-gradient(135deg, 
                ${theme.colors.semantic.surface.secondary}40, 
                ${theme.colors.semantic.action.primary}25,
                ${theme.colors.semantic.surface.tertiary}35
              )`;
              contentArea.style.boxShadow = `
                0 4px 20px rgba(0,0,0,0.15),
                0 2px 8px ${theme.colors.semantic.action.primary}35
              `;
              contentArea.style.color = theme.colors.semantic.text.primary;
            }
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
          }}
          onMouseLeave={(e) => {
            // Find the content area within this container
            const contentArea = e.currentTarget.querySelector('[data-content-area]') as HTMLElement;
            if (contentArea) {
              if (isSelected) {
                contentArea.style.background = `linear-gradient(135deg, 
                  ${theme.colors.semantic.surface.secondary}40, 
                  ${theme.colors.semantic.action.primary}25,
                  ${theme.colors.semantic.surface.tertiary}35
                )`;
                contentArea.style.boxShadow = `
                  0 4px 20px rgba(0,0,0,0.15),
                  0 2px 8px ${theme.colors.semantic.action.primary}35
                `;
                contentArea.style.color = theme.colors.semantic.text.primary;
              } else {
                contentArea.style.background = 'transparent';
                contentArea.style.boxShadow = 'none';
                contentArea.style.color = 'inherit';
              }
            }
            e.currentTarget.style.transform = 'none';
          }}
          onClick={() => {
            // Set this item as selected
            setSelectedItem(item.id);
            // Expand/collapse if it has children
            if (hasChildren) {
              toggleExpanded(item.id);
            }
          }}
        >
          {/* Advanced Tree Connector */}
          <div className="flex items-center mr-3 relative">
            {/* Enhanced Expand/Collapse Control */}
            {hasChildren ? (
              <div
                className={`
                  relative transition-all duration-200 cursor-pointer rounded
                  ${isExpanded ? 'rotate-90' : 'rotate-0'}
                  hover:scale-105 active:scale-95 flex items-center justify-center
                  hover:bg-opacity-15
                `}
                style={{ 
                  backgroundColor: `${theme.colors.semantic.action.primary}10`,
                  color: theme.colors.semantic.action.primary,
                  width: isCompact ? '22px' : '26px',
                  height: isCompact ? '22px' : '26px',
                }}
              >
                <svg 
                  className={isCompact ? "w-3.5 h-3.5" : "w-4 h-4"}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            ) : (
              <div className={isCompact ? 'w-5.5 h-5.5' : 'w-6.5 h-6.5'} />
            )}
          </div>

          {/* Content Area with Selection Background */}
          <div 
            data-content-area
            className="flex items-center flex-1 rounded-lg transition-all duration-300"
            style={{
              background: isSelected
                ? `linear-gradient(135deg, 
                    ${theme.colors.semantic.surface.secondary}40, 
                    ${theme.colors.semantic.action.primary}25,
                    ${theme.colors.semantic.surface.tertiary}35
                  )`
                : isCurrentSubject
                ? `${theme.colors.semantic.action.primary}20`
                : 'transparent',
              color: isSelected
                ? theme.colors.semantic.text.primary
                : isCurrentSubject
                ? theme.colors.semantic.action.primary
                : 'inherit',
              boxShadow: isSelected
                ? `0 4px 20px rgba(0,0,0,0.15), 0 2px 8px ${theme.colors.semantic.action.primary}35`
                : isCurrentSubject
                ? `0 2px 8px ${theme.colors.semantic.action.primary}30`
                : 'none',
              padding: '8px 12px',
            }}
          >
            {/* Enhanced Icon */}
            <div className="relative mr-3">
              <div
                className={`
                  rounded-lg transition-all duration-300 group-hover:scale-105 flex items-center justify-center
                  shadow-sm group-hover:shadow-md
                  ${isCompact ? 'p-1.5' : 'p-2'}
                `}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.semantic.action.secondary}20, ${theme.colors.semantic.action.secondary}10)`,
                  border: `1px solid ${theme.colors.semantic.action.secondary}25`,
                  color: theme.colors.semantic.text.primary,
                  width: isCompact ? '32px' : '38px',
                  height: isCompact ? '32px' : '38px',
                }}
              >
                <div className={isCompact ? "w-4 h-4" : "w-5 h-5"}>
                  {getIconForLevel(item.level)}
                </div>
              </div>
            </div>

            {/* Advanced Content Display */}
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* Enhanced Title with Truncation */}
                <div className="flex items-center space-x-2 mb-1">
                  <h4
                    className={`
                      font-semibold transition-all duration-200 truncate
                      ${isCompact ? 'text-sm' : 'text-base'}
                      group-hover:text-opacity-95 leading-tight
                    `}
                    style={{ 
                      color: theme.colors.semantic.text.primary,
                      letterSpacing: '-0.01em',
                      maxWidth: '180px'
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                </div>
                
                {/* Advanced Metadata Row */}
                <div className="flex items-center space-x-2">
                  {/* Type Badge */}
                  <span
                    className={`
                      inline-flex items-center font-medium rounded-full transition-all duration-200
                      ${isCompact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
                    `}
                    style={{
                      backgroundColor: `${theme.colors.semantic.action.secondary}15`,
                      color: theme.colors.semantic.text.secondary,
                      border: `1px solid ${theme.colors.semantic.action.secondary}25`,
                    }}
                  >
                    {getTypeByLevel(item.level)}
                  </span>

                  {/* Question Count Badge */}
                  {item.questionCount > 0 && (
                    <span
                      className={`
                        inline-flex items-center font-bold rounded-full transition-all duration-200
                        ${isCompact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
                      `}
                      style={{
                        backgroundColor: `${theme.colors.semantic.status.info}20`,
                        color: theme.colors.semantic.status.info,
                        border: `1px solid ${theme.colors.semantic.status.info}35`,
                      }}
                    >
                      {item.questionCount} MCQs
                    </span>
                  )}

                  {/* Progress Indicator */}
                  {item.questionCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.semantic.status.success}60, ${theme.colors.semantic.status.success}40)`
                        }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: theme.colors.semantic.status.success }}
                      >
                        Ready
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* End Content Area with Selection Background */}
        </div>

        {/* Advanced Children Rendering with Perfect Arrow-Line Alignment */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Dotted Vertical Connection Line - From Parent Arrow Center */}
            <div
              className="absolute transition-all duration-200"
              style={{
                // Parent arrow center position: 12 (base) + indentLevel + (11/13 arrow offset)
                left: `${12 + indentLevel + (isCompact ? 11 : 13)}px`,
                top: '0px',
                bottom: '8px',
                width: '2px',
                background: 'transparent',
                borderLeft: `2px dotted ${theme.colors.semantic.border.primary}`,
              }}
            />
            
            {/* Children Container */}
            <div className={isCompact ? "space-y-0.5 pt-1" : "space-y-1 pt-2"}>
              {item.children!.map((child, index) => (
                <div key={child.id} className="relative">
                  {/* Horizontal Connector - Parent Arrow to Child Arrow Center */}
                  <div
                    className="absolute transition-all duration-200"
                    style={{
                      // Start: Parent arrow center
                      left: `${12 + indentLevel + (isCompact ? 11 : 13)}px`,
                      top: `${isCompact ? '19px' : '23px'}`,
                      // Width: Exactly one indentation level (12/16px) to reach child arrow center
                      // Child arrow will be at: 12 + (indentLevel + 12/16) + (11/13) = parent + 12/16
                      width: `${isCompact ? 12 : 16}px`,
                      height: '2px',
                      background: 'transparent',
                      borderTop: `2px dotted ${theme.colors.semantic.border.primary}`,
                    }}
                  />
                  
                  {renderHierarchyItem(child, depth + 1, isCompact)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border p-4 sticky top-4 hide-scrollbar transition-all duration-300 ${
        isNavigatorCollapsed ? 'w-16' : ''
      }`}
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        border: `1px solid ${theme.colors.semantic.border.primary}30`,
        maxHeight: '85vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
        // Hide scrollbars while maintaining functionality
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE and Edge
        minWidth: isNavigatorCollapsed ? '64px' : '280px',
        width: isNavigatorCollapsed ? '64px' : 'auto',
      }}
    >
      {/* Clean Header */}
      <div className={`flex items-center ${isNavigatorCollapsed ? 'justify-center' : 'justify-between'} mb-5 pb-4 border-b`}
        style={{ borderColor: `${theme.colors.semantic.border.secondary}30` }}
      >
        {!isNavigatorCollapsed && (
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{
                background: `${theme.colors.semantic.action.primary}15`,
                color: theme.colors.semantic.action.primary
              }}
            >
              <DocumentTextIcon />
            </div>
            <div>
              <h3
                className="font-bold text-base"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                {currentSubject ? currentSubject.name : 'Subject Structure'}
              </h3>
              <p
                className="text-xs opacity-75"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Navigate content hierarchy
              </p>
            </div>
          </div>
        )}
        
        {isNavigatorCollapsed && (
          <div 
            className="p-2 rounded-lg"
            style={{
              background: `${theme.colors.semantic.action.primary}15`,
              color: theme.colors.semantic.action.primary
            }}
          >
            <DocumentTextIcon />
          </div>
        )}
        
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsNavigatorCollapsed(!isNavigatorCollapsed)}
          className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            background: `${theme.colors.semantic.surface.secondary}80`,
            color: theme.colors.semantic.text.secondary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${theme.colors.semantic.action.primary}20`;
            e.currentTarget.style.color = theme.colors.semantic.action.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${theme.colors.semantic.surface.secondary}80`;
            e.currentTarget.style.color = theme.colors.semantic.text.secondary;
          }}
        >
          <svg 
            className={`h-4 w-4 transition-transform duration-300 ${
              isNavigatorCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main Content - Hidden when collapsed */}
      {!isNavigatorCollapsed && (
        <>
          {/* Data Source Indicator */}
          {hierarchyItems.length === 0 && (
            <div className="mb-3 px-3 py-2 rounded-lg text-xs" 
              style={{ 
                backgroundColor: `${theme.colors.semantic.status.warning}15`,
                color: theme.colors.semantic.status.warning,
                border: `1px solid ${theme.colors.semantic.status.warning}30`
              }}
            >
              📝 Using mock data - API server may be offline
            </div>
          )}
          
          {/* Overview Menu Item */}
          <div className="mb-4">
        <button
          onClick={() => router.push('/dashboard/question-bank')}
          className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] group flex items-center space-x-3"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            border: `1px solid ${theme.colors.semantic.border.primary}20`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, 
              ${theme.colors.semantic.surface.secondary}40, 
              ${theme.colors.semantic.action.primary}25,
              ${theme.colors.semantic.surface.tertiary}35
            )`;
            e.currentTarget.style.boxShadow = `
              0 4px 20px rgba(0,0,0,0.15),
              0 2px 8px ${theme.colors.semantic.action.primary}35
            `;
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.semantic.surface.secondary;
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div
            className="p-2 rounded-lg transition-all duration-200 group-hover:scale-110"
            style={{
              background: `${theme.colors.semantic.action.primary}15`,
              color: theme.colors.semantic.action.primary
            }}
          >
            <CalendarIcon />
          </div>
          <div>
            <h4
              className="font-semibold text-sm"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Overview
            </h4>
            <p
              className="text-xs"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Back to Question Bank
            </p>
          </div>
        </button>
      </div>

      {/* Tree Content */}
      {dataToUse.length === 0 ? (
        <div className="text-center py-10">
          <div 
            className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4"
            style={{
              backgroundColor: `${theme.colors.semantic.action.secondary}15`,
              color: theme.colors.semantic.action.secondary
            }}
          >
            <DocumentTextIcon />
          </div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Loading Structure
          </h3>
          <p
            className="text-xs opacity-75"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Loading hierarchy data...
          </p>
        </div>
      ) : !currentYear ? (
        <div className="text-center py-10">
          <div 
            className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4"
            style={{
              backgroundColor: `${theme.colors.semantic.status.warning}15`,
              color: theme.colors.semantic.status.warning
            }}
          >
            <DocumentTextIcon />
          </div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Year Not Found
          </h3>
          <p
            className="text-xs opacity-75"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Could not find the selected year data.
          </p>
        </div>
      ) : !currentSubject ? (
        <div className="text-center py-10">
          <div 
            className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4"
            style={{
              backgroundColor: `${theme.colors.semantic.status.warning}15`,
              color: theme.colors.semantic.status.warning
            }}
          >
            <DocumentTextIcon />
          </div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Subject Not Found
          </h3>
          <p
            className="text-xs opacity-75"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Could not find the selected subject data.
          </p>
        </div>
      ) : currentSubject.children && currentSubject.children.length > 0 ? (
        <div className="space-y-1">
          {/* Render only the current subject and its children */}
          {currentSubject.children.map((child: HierarchyItem) => renderHierarchyItem(child, 0, true))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div 
            className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4"
            style={{
              backgroundColor: `${theme.colors.semantic.action.secondary}15`,
              color: theme.colors.semantic.action.secondary
            }}
          >
            <DocumentTextIcon />
          </div>
          <h3
            className="text-sm font-medium mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            No Content Available
          </h3>
          <p
            className="text-xs opacity-75"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            This subject doesn't have any structured content yet.
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
}