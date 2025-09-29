/**
 * Clean Professional Dashboard Component
 * Neat theme-compliant dashboard without gradients or emojis
 */

'use client';

import React from 'react';
import { useTheme } from '@/theme';

// Define types for hierarchy navigation
interface HierarchyItem {
  id: string;
  name: string;
  description?: string;
  level: number;
  parentId?: string;
  children?: HierarchyItem[];
}

type HierarchyType = 'question-bank' | 'previous-papers';

interface IndividualSelections {
  year: HierarchyItem | null;
  subject: HierarchyItem | null;
  part: HierarchyItem | null;
  section: HierarchyItem | null;
  chapter: HierarchyItem | null;
  mcq: HierarchyItem | null;
}

interface CleanDashboardProps {
  selectedHierarchyType: HierarchyType | null;
  individualSelections: IndividualSelections;
  onHierarchyTypeChange: (type: HierarchyType | null) => void;
  onIndividualSelection: (level: keyof IndividualSelections, item: HierarchyItem | null) => void;
  getAvailableItems: (level: keyof IndividualSelections) => HierarchyItem[];
  onClearHierarchy: () => void;
  viewMode: 'grid' | 'list' | 'table';
  onViewModeChange: (mode: 'grid' | 'list' | 'table') => void;
  className?: string;
}

export const CleanDashboard: React.FC<CleanDashboardProps> = ({
  selectedHierarchyType,
  individualSelections,
  onHierarchyTypeChange,
  onIndividualSelection,
  getAvailableItems,
  onClearHierarchy,
  viewMode,
  onViewModeChange,
  className = '',
}) => {
  const { theme } = useTheme();

  const hierarchyConfigs = {
    'question-bank': {
      maxLevels: 5,
      levelNames: ['Year', 'Subject', 'Part', 'Section', 'Chapter'],
      levelKeys: ['year', 'subject', 'part', 'section', 'chapter'] as const,
      description: 'Organized academic curriculum structure'
    },
    'previous-papers': {
      maxLevels: 4,
      levelNames: ['Year', 'Exam', 'Subject', 'Section'],
      levelKeys: ['year', 'subject', 'part', 'section'] as const,
      description: 'Historical examination papers'
    }
  };

  const config = selectedHierarchyType ? hierarchyConfigs[selectedHierarchyType] : null;

  const SmartHierarchySelector = () => {
    if (!config) {
      return (
        <div 
          className="p-8 border-2 border-dashed rounded-xl text-center"
          style={{ 
            borderColor: theme.colors.semantic.border.secondary,
            backgroundColor: theme.colors.semantic.surface.primary
          }}
        >
          <div className="max-w-md mx-auto space-y-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.text.secondary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
              Choose Navigation Structure
            </h3>
            <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
              Select how you want to organize and navigate your content
            </p>
          </div>
        </div>
      );
    }

    const renderLevelSelector = (level: number) => {
      const levelKey = config.levelKeys[level - 1] as keyof IndividualSelections;
      const levelName = config.levelNames[level - 1];
      const isActive = Boolean(individualSelections[levelKey]);
      const availableItems = getAvailableItems(levelKey);
      const canSelect = level === 1 || individualSelections[config.levelKeys[level - 2] as keyof IndividualSelections];

      return (
        <div key={level} className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: theme.colors.semantic.text.primary }}>
            Level {level}: {levelName}
          </label>
          <select
            value={individualSelections[levelKey]?.id || ''}
            onChange={(e) => {
              const item = availableItems.find(item => item.id === e.target.value) || null;
              onIndividualSelection(levelKey, item);
            }}
            disabled={!canSelect}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canSelect ? theme.colors.semantic.surface.primary : theme.colors.semantic.surface.secondary,
              borderColor: isActive ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary,
              color: canSelect ? theme.colors.semantic.text.primary : theme.colors.semantic.text.secondary
            }}
          >
            <option value="">Select {levelName}...</option>
            {availableItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.text.secondary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm font-medium" style={{ color: theme.colors.semantic.text.primary }}>
              Navigate Levels
            </span>
          </div>
          
          {Object.values(individualSelections).some(Boolean) && (
            <button
              onClick={onClearHierarchy}
              className="px-3 py-1 text-xs font-medium rounded-full hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: theme.colors.semantic.status.error + '10',
                color: theme.colors.semantic.status.error
              }}
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: config.maxLevels }, (_, i) => i + 1).map(level => renderLevelSelector(level))}
          {individualSelections.chapter && renderLevelSelector(6)}
        </div>
        
        {/* Selection summary */}
        {Object.values(individualSelections).some(Boolean) && (
          <div 
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: theme.colors.semantic.status.success + '08',
              borderColor: theme.colors.semantic.status.success + '20'
            }}
          >
            <div className="flex items-center justify-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.colors.semantic.status.success }}
              ></div>
              <span className="text-sm font-medium" style={{ color: theme.colors.semantic.status.success }}>
                {Object.values(individualSelections).filter(Boolean).length} level(s) selected
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render question content based on view mode
  const renderQuestionContent = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
            Questions
          </h3>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 p-1 rounded-lg" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
            {(['grid', 'list', 'table'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className="px-3 py-1.5 text-sm font-medium rounded transition-all duration-200"
                style={{
                  backgroundColor: viewMode === mode ? theme.colors.semantic.action.primary : 'transparent',
                  color: viewMode === mode ? '#FFFFFF' : theme.colors.semantic.text.secondary
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div 
          className="min-h-64 flex items-center justify-center rounded-lg border-2 border-dashed"
          style={{ 
            borderColor: theme.colors.semantic.border.secondary,
            backgroundColor: theme.colors.semantic.surface.primary + '50'
          }}
        >
          <div className="text-center space-y-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.text.secondary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
              No questions found for current selection
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`space-y-6 ${className}`}
      style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
    >
      {/* Header */}
      <div 
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.primary
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: theme.colors.semantic.text.primary }}>
              Question Bank Dashboard
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
              Professional hierarchy navigation and content management
            </p>
          </div>
        </div>

        {/* Hierarchy Type Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium" style={{ color: theme.colors.semantic.text.primary }}>
            Navigation Structure
          </label>
          <select
            value={selectedHierarchyType || ''}
            onChange={(e) => onHierarchyTypeChange(e.target.value as HierarchyType | null || null)}
            className="w-full max-w-md px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="">Choose Navigation Type...</option>
            <option value="question-bank">Question Bank Structure</option>
            <option value="previous-papers">Previous Papers Structure</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Panel */}
        <div className="lg:col-span-1">
          <div 
            className="p-6 rounded-xl border h-fit"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary
            }}
          >
            <SmartHierarchySelector />
          </div>
        </div>

        {/* Questions Panel */}
        <div className="lg:col-span-2">
          <div 
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary
            }}
          >
            {renderQuestionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};