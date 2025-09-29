'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HierarchyItem } from '@/lib/types/hierarchy.types';
import { useQuestionBankHierarchy, usePreviousPapersHierarchy } from '@/components/admin/hierarchy';

export type HierarchyType = 'question-bank' | 'previous-papers';

export interface HierarchyPath {
  hierarchyType?: HierarchyType;
  year?: HierarchyItem;
  subject?: HierarchyItem;
  part?: HierarchyItem;
  section?: HierarchyItem;
  chapter?: HierarchyItem;
  mcq?: HierarchyItem;
}

export interface HierarchyBreadcrumbSelectorProps {
  /** Current hierarchy type selection */
  currentSelection?: HierarchyType;
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Callback to toggle dropdown visibility */
  onToggle: () => void;
  /** Callback when hierarchy type is selected */
  onSelect: (hierarchyType: HierarchyType | null) => void;
  /** Theme object for styling */
  theme: any;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

export const HierarchyBreadcrumbSelector: React.FC<HierarchyBreadcrumbSelectorProps> = ({
  currentSelection,
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

  const handleHierarchyTypeSelect = (hierarchyType: HierarchyType | null) => {
    console.log('HierarchyBreadcrumbSelector: Selecting hierarchy type:', hierarchyType);
    onSelect(hierarchyType);
    // Small delay to ensure selection completes before closing
    setTimeout(() => onToggle(), 10);
  };

  const hierarchyOptions: { value: HierarchyType; label: string; icon: React.ReactNode }[] = [
    {
      value: 'question-bank',
      label: 'Question Bank',
      icon: (
        <svg className={`w-5 h-5 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      value: 'previous-papers',
      label: 'Previous Papers',
      icon: (
        <svg className={`w-5 h-5 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

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
              Hierarchy Type
            </span>
          </div>
        </div>

        {/* Options List */}
        <div className="max-h-64 overflow-y-auto py-2">
          {/* Clear selection option */}
          {currentSelection && (
            <>
              <button
                onClick={() => handleHierarchyTypeSelect(null)}
                className={`w-full text-left flex items-center space-x-3 transition-all duration-200 hover:bg-red-50 mx-2 rounded-lg ${
                  compact ? 'px-3 py-2.5 text-xs' : 'px-3 py-3 text-sm'
                }`}
                style={{ color: theme.colors.semantic.status.error }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Hierarchy Type</span>
              </button>
              <div className="mx-4 my-2 h-px" style={{ backgroundColor: theme.colors.semantic.border.secondary + '30' }} />
            </>
          )}
          
          {/* Hierarchy type options */}
          {hierarchyOptions.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                console.log('Button clicked for:', option.value);
                e.preventDefault();
                e.stopPropagation();
                handleHierarchyTypeSelect(option.value);
              }}
              className={`w-full text-left flex items-center justify-between transition-all duration-200 hover:bg-gray-50 mx-2 rounded-lg group ${
                compact ? 'px-3 py-2.5 text-xs' : 'px-3 py-3 text-sm'
              }`}
              style={{ 
                backgroundColor: currentSelection === option.value 
                  ? theme.colors.semantic.action.primary + '08' 
                  : 'transparent',
                color: currentSelection === option.value 
                  ? theme.colors.semantic.action.primary 
                  : theme.colors.semantic.text.primary,
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              <div className="flex items-center min-w-0 flex-1 space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0" style={{ 
                  color: currentSelection === option.value 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.secondary 
                }}>
                  {option.icon}
                </div>
                <span className="truncate font-medium group-hover:text-gray-900 transition-colors">
                  {option.label}
                </span>
              </div>

              {/* Selection indicator */}
              {currentSelection === option.value && (
                <div className="flex-shrink-0 ml-2">
                  <svg className="w-4 h-4" style={{ color: theme.colors.semantic.action.primary }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HierarchyBreadcrumbSelector;