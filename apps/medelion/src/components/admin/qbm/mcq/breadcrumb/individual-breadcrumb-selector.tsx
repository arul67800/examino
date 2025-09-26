'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HierarchyItem } from '@/lib/types/hierarchy.types';

export interface IndividualBreadcrumbSelectorProps {
  /** Hierarchy level (1=Year, 2=Subject, 3=Part, 4=Section, 5=Chapter) */
  level: number;
  /** Available items for this level */
  items: HierarchyItem[];
  /** Currently selected item */
  currentSelection?: HierarchyItem;
  /** Display label for the selector */
  label: string;
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Callback to toggle dropdown visibility */
  onToggle: () => void;
  /** Callback when an item is selected */
  onSelect: (item: HierarchyItem | null) => void;
  /** Theme object for styling */
  theme: any;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

export const IndividualBreadcrumbSelector: React.FC<IndividualBreadcrumbSelectorProps> = ({
  level,
  items,
  currentSelection,
  label,
  isOpen,
  onToggle,
  onSelect,
  theme,
  compact = false
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  const handleItemSelect = (item: HierarchyItem | null) => {
    onSelect(item);
    onToggle();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl z-50 border ${
          isOpen ? 'block' : 'hidden'
        } ${compact ? 'min-w-48' : 'min-w-56'}`}
        style={{ 
          borderColor: theme.colors.semantic.border.primary,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          backgroundColor: theme.colors.semantic.surface.primary
        }}
      >
        {/* Header */}
        <div 
          className={`px-4 py-3 border-b bg-gradient-to-r ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
          style={{ 
            borderColor: theme.colors.semantic.border.secondary + '20',
            background: `linear-gradient(135deg, ${theme.colors.semantic.action.primary}08, ${theme.colors.semantic.action.primary}03)`
          }}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme.colors.semantic.action.primary }}
            />
            <span 
              className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Options List */}
        <div className="max-h-64 overflow-y-auto py-2">
          {/* Special handling for MCQ level - show "Create New MCQ" option */}
          {level === 6 && (
            <>
              <button
                onClick={() => handleItemSelect({ 
                  id: 'new-mcq', 
                  name: 'Create New MCQ', 
                  level: 6, 
                  type: 'MCQ', 
                  color: theme.colors.semantic.action.primary,
                  order: 0, 
                  questionCount: 0, 
                  parentId: '', 
                  createdAt: new Date().toISOString(), 
                  updatedAt: new Date().toISOString(), 
                  children: [] 
                } as HierarchyItem)}
                className={`w-full text-left flex items-center space-x-3 transition-all duration-200 hover:bg-blue-50 mx-2 rounded-lg ${
                  compact ? 'px-3 py-2.5 text-xs' : 'px-3 py-3 text-sm'
                }`}
                style={{ color: theme.colors.semantic.action.primary }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-semibold">Create New MCQ</span>
              </button>
              {items.length > 0 && (
                <div className="mx-4 my-2 h-px" style={{ backgroundColor: theme.colors.semantic.border.secondary + '30' }} />
              )}
            </>
          )}

          {/* Clear selection option */}
          {currentSelection && currentSelection.id !== 'new-mcq' && (
            <>
              <button
                onClick={() => handleItemSelect(null)}
                className={`w-full text-left flex items-center space-x-3 transition-all duration-200 hover:bg-red-50 mx-2 rounded-lg ${
                  compact ? 'px-3 py-2.5 text-xs' : 'px-3 py-3 text-sm'
                }`}
                style={{ color: theme.colors.semantic.status.error }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear {label}</span>
              </button>
              <div className="mx-4 my-2 h-px" style={{ backgroundColor: theme.colors.semantic.border.secondary + '30' }} />
            </>
          )}
          
          {/* No items available */}
          {items.length === 0 && level !== 6 ? (
            <div 
              className={`text-center py-8 ${compact ? 'px-3 text-xs' : 'px-4 text-sm'}`}
              style={{ color: theme.colors.semantic.text.tertiary }}
            >
              <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              No {label.toLowerCase()} available
            </div>
          ) : (
            items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleItemSelect(item)}
                className={`w-full text-left flex items-center justify-between transition-all duration-200 hover:bg-gray-50 mx-2 rounded-lg group ${
                  compact ? 'px-3 py-2.5 text-xs' : 'px-3 py-3 text-sm'
                } ${index > 0 ? 'mt-1' : ''}`}
                style={{ 
                  backgroundColor: currentSelection?.id === item.id 
                    ? theme.colors.semantic.action.primary + '08' 
                    : 'transparent',
                  color: currentSelection?.id === item.id 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.primary
                }}
              >
                <div className="flex items-center min-w-0 flex-1 space-x-3">
                  {/* Color indicator */}
                  <div 
                    className={`rounded-full flex-shrink-0 transition-all duration-200 ${
                      compact ? 'w-2 h-2' : 'w-2.5 h-2.5'
                    } ${currentSelection?.id === item.id ? 'ring-2 ring-offset-1' : ''}`}
                    style={{ 
                      backgroundColor: item.color || theme.colors.semantic.action.primary,
                      '--tw-ring-color': currentSelection?.id === item.id ? theme.colors.semantic.action.primary + '40' : 'transparent'
                    } as React.CSSProperties}
                  />
                  <span className="truncate font-medium group-hover:text-gray-900 transition-colors">
                    {item.name}
                  </span>
                </div>

                {/* Question count badge for chapters and MCQs */}
                {(item.level === 5 || item.level === 6) && item.questionCount >= 0 && (
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-3">
                    <span 
                      className={`rounded-full font-semibold transition-all duration-200 ${
                        compact ? 'text-xs px-2 py-1' : 'text-xs px-2.5 py-1'
                      }`}
                      style={{ 
                        backgroundColor: currentSelection?.id === item.id 
                          ? theme.colors.semantic.action.primary + '15' 
                          : theme.colors.semantic.surface.secondary + '60',
                        color: currentSelection?.id === item.id 
                          ? theme.colors.semantic.action.primary 
                          : theme.colors.semantic.text.secondary 
                      }}
                    >
                      {item.questionCount}
                    </span>
                    <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} opacity-40`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}

                {/* Selection indicator */}
                {currentSelection?.id === item.id && (
                  <div className="flex-shrink-0 ml-2">
                    <svg className="w-4 h-4" style={{ color: theme.colors.semantic.action.primary }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualBreadcrumbSelector;