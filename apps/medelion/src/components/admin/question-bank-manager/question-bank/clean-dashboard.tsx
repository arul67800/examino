/**
 * Clean Question Bank Dashboard - Theme Compliant
 * Simplified version with advanced styling and proper hierarchy handling
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '@/theme';
import { useRouter } from 'next/navigation';
import { useQuestionBankHierarchy, usePreviousPapersHierarchy } from '@/components/admin/hierarchy';
import { HierarchyItem } from '@/lib/types/hierarchy.types';
import { 
  HierarchyMode, 
  getHierarchyConfig, 
  getLevelName, 
  getLevelColor 
} from '@/components/admin/hierarchy/config/hierarchy-config';
import { 
  useQuestionBank, 
  useQuestionSelection, 
  useQuestionSearch
} from './hooks';
import { 
  Question, 
  ViewSettings, 
  ViewMode
} from './types';

// Component imports
import { QuestionGrid } from './components/question-grid';
import { QuestionList } from './components/question-list';
import { QuestionTable } from './components/question-table';
import { SearchBar } from './search/search-bar';
import { FilterPanel } from './filters/filter-panel';

interface IndividualSelections {
  level1: HierarchyItem | null;
  level2: HierarchyItem | null;
  level3: HierarchyItem | null;
  level4: HierarchyItem | null;
  level5: HierarchyItem | null;
  mcq: HierarchyItem | null;
}

export default function CleanQuestionBankDashboard() {
  const { theme } = useTheme();
  const router = useRouter();
  
  // Main hooks
  const questionBank = useQuestionBank();
  const selection = useQuestionSelection(questionBank.questions);
  const search = useQuestionSearch();
  
  // Hierarchy state
  const [selectedHierarchyType, setSelectedHierarchyType] = useState<HierarchyMode | null>(null);
  const [individualSelections, setIndividualSelections] = useState<IndividualSelections>({
    level1: null, level2: null, level3: null, level4: null, level5: null, mcq: null
  });
  
  // UI state
  const [filterPanelVisible, setFilterPanelVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    mode: ViewMode.GRID,
    showStatistics: true,
    showTags: true,
    compactMode: false
  });
  
  // Hierarchy hooks
  const questionBankHierarchy = useQuestionBankHierarchy();
  const previousPapersHierarchy = usePreviousPapersHierarchy();

  const currentHierarchy = selectedHierarchyType === 'question-bank' 
    ? questionBankHierarchy 
    : selectedHierarchyType === 'previous-papers' 
    ? previousPapersHierarchy 
    : null;

  // Enhanced Hierarchy Selectors Component
  const SmartHierarchySelector = () => {
    if (!selectedHierarchyType) return null;
    
    const config = getHierarchyConfig(selectedHierarchyType);
    
    const getAvailableItems = (level: number): HierarchyItem[] => {
      if (!currentHierarchy?.hierarchyItems) return [];
      
      switch (level) {
        case 1:
          return currentHierarchy.hierarchyItems.filter(item => item.level === 1) || [];
        case 2:
          return individualSelections.level1?.children || [];
        case 3:
          return individualSelections.level2?.children || [];
        case 4:
          return individualSelections.level3?.children || [];
        case 5:
          return individualSelections.level4?.children || [];
        case 6:
          return individualSelections.level5?.children || [];
        default:
          return [];
      }
    };

    const handleLevelSelection = (level: number, item: HierarchyItem | null) => {
      const newSelections: IndividualSelections = { ...individualSelections };

      // Set the selected item
      if (level <= 5) {
        newSelections[`level${level}` as keyof IndividualSelections] = item;
      } else {
        newSelections.mcq = item;
      }

      // Clear dependent levels
      for (let i = level + 1; i <= 5; i++) {
        newSelections[`level${i}` as keyof IndividualSelections] = null;
      }
      if (level <= 5) {
        newSelections.mcq = null;
      }

      setIndividualSelections(newSelections);
      
      // Update question bank filters
      const lastSelected = Object.values(newSelections).find(Boolean);
      questionBank.setFilters({
        ...questionBank.filters,
        hierarchyItemId: lastSelected?.id
      });
    };

    const renderLevelSelector = (level: number) => {
      const items = getAvailableItems(level);
      const isDisabled = level > 1 && !individualSelections[`level${level - 1}` as keyof IndividualSelections];
      const levelName = getLevelName(level, selectedHierarchyType);
      const levelColor = getLevelColor(level, selectedHierarchyType);
      const currentSelection = level <= 5 
        ? individualSelections[`level${level}` as keyof IndividualSelections]
        : individualSelections.mcq;

      if (isDisabled && level > 1) return null;

      return (
        <div key={level} className="relative group min-w-0 flex-1">
          <select
            value={currentSelection?.id || ''}
            onChange={(e) => {
              const selectedItem = items.find(item => item.id === e.target.value) || null;
              handleLevelSelection(level, selectedItem);
            }}
            disabled={isDisabled}
            className="w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-300 hover:shadow-lg focus:shadow-xl focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right pr-8"
            style={{
              backgroundColor: currentSelection 
                ? `${levelColor}08`
                : theme.colors.semantic.surface.primary,
              borderColor: currentSelection 
                ? levelColor 
                : theme.colors.semantic.border.secondary,
              color: currentSelection 
                ? levelColor 
                : theme.colors.semantic.text.secondary,
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px'
            }}
          >
            <option value="">{levelName}</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          
          {/* Level badge */}
          {currentSelection && (
            <div 
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse"
              style={{ backgroundColor: levelColor }}
            >
              {level}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-px flex-1 opacity-20" 
               style={{ backgroundColor: theme.colors.semantic.border.primary }}></div>
          <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ 
                  backgroundColor: theme.colors.semantic.action.primary + '10',
                  color: theme.colors.semantic.action.primary 
                }}>
            🎯 Navigate Levels
          </span>
          <div className="h-px flex-1 opacity-20" 
               style={{ backgroundColor: theme.colors.semantic.border.primary }}></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: config.maxLevels }, (_, i) => i + 1).map(level => renderLevelSelector(level))}
          {individualSelections.level5 && renderLevelSelector(6)}
        </div>
        
        {/* Selection summary */}
        {Object.values(individualSelections).some(Boolean) && (
          <div className="mt-4 p-3 rounded-xl text-center animate-fade-in"
               style={{
                 background: `linear-gradient(135deg, ${theme.colors.semantic.status.success}10 0%, ${theme.colors.semantic.status.info}08 100%)`,
                 border: `1px solid ${theme.colors.semantic.status.success}20`
               }}>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse"
                   style={{ backgroundColor: theme.colors.semantic.status.success }}></div>
              <span className="text-sm font-medium" 
                   style={{ color: theme.colors.semantic.status.success }}>
                {Object.values(individualSelections).filter(Boolean).length} level(s) actively filtering
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render question content based on view mode
  const renderQuestionContent = () => {
    if (questionBank.isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      );
    }

    if (questionBank.error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-gray-600">{questionBank.error}</p>
        </div>
      );
    }

    const props = {
      questions: questionBank.questions,
      selection,
      onPreview: (question: Question) => console.log('Preview:', question),
      onEdit: (question: Question) => console.log('Edit:', question),
      onDelete: (questionId: string) => console.log('Delete:', questionId)
    };

    switch (viewSettings.mode) {
      case ViewMode.LIST:
        return <QuestionList {...props} />;
      case ViewMode.TABLE:
        return <QuestionTable {...props} />;
      default:
        return <QuestionGrid {...props} />;
    }
  };

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.semantic.surface.primary} 0%, ${theme.colors.semantic.surface.secondary}40 50%, ${theme.colors.semantic.surface.primary} 100%)`
      }}
    >
      {/* Enhanced Header */}
      <div 
        className="sticky top-0 z-50 backdrop-blur-xl shadow-xl border-b"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.semantic.surface.primary}F8 0%, ${theme.colors.semantic.surface.secondary}F0 100%)`,
          borderColor: theme.colors.semantic.border.primary + '20'
        }}
      >
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Enhanced Title Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.colors.semantic.action.primary}, ${theme.colors.semantic.status.info})`
                  }}
                >
                  📚
                </div>
                <div 
                  className="absolute -inset-1 w-14 h-14 rounded-2xl blur-lg opacity-40"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.colors.semantic.action.primary}, ${theme.colors.semantic.status.info})`
                  }}
                ></div>
              </div>
              <div>
                <h1 
                  className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.colors.semantic.text.primary}, ${theme.colors.semantic.action.primary})`
                  }}
                >
                  Question Bank Manager
                </h1>
                <p className="text-sm opacity-75 mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
                  Advanced question management with smart hierarchy navigation
                </p>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setFilterPanelVisible(!filterPanelVisible)}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 transform flex items-center space-x-2"
                style={{
                  backgroundColor: filterPanelVisible 
                    ? theme.colors.semantic.action.primary + '15' 
                    : theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: filterPanelVisible 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.secondary,
                  border: '2px solid'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span>Smart Filters</span>
              </button>

              <button
                className="px-8 py-3 rounded-xl text-white font-bold shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-110 transform flex items-center space-x-2"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.colors.semantic.action.primary}, ${theme.colors.semantic.status.success})`,
                  boxShadow: `0 10px 40px ${theme.colors.semantic.action.primary}30`
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Advanced Search Bar */}
          <div className="mt-6">
            <SearchBar
              value={search.query}
              onChange={search.setQuery}
              placeholder="🔍 Search questions with AI-powered smart matching..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex">
        {/* Enhanced Sidebar */}
        <div 
          className={`transition-all duration-500 border-r ${sidebarCollapsed ? 'w-16' : 'w-96'}`}
          style={{
            background: `linear-gradient(180deg, ${theme.colors.semantic.surface.primary}F5 0%, ${theme.colors.semantic.surface.secondary}F0 100%)`,
            borderColor: theme.colors.semantic.border.primary + '15'
          }}
        >
          <div className="p-6">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-lg group"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '50',
                borderColor: theme.colors.semantic.border.primary + '20',
                border: '2px solid'
              }}
            >
              <span className={sidebarCollapsed ? 'hidden' : 'text-sm font-bold'} style={{ color: theme.colors.semantic.text.primary }}>
                🚀 Advanced Controls
              </span>
              <div 
                className={`transform transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''} group-hover:scale-125`}
                style={{ color: theme.colors.semantic.action.primary }}
              >
                →
              </div>
            </button>
          </div>

          {!sidebarCollapsed && filterPanelVisible && (
            <div className="px-6 pb-6 space-y-8">
              {/* Standard Filters */}
              <FilterPanel
                filters={questionBank.filters}
                onFiltersChange={(filters) => questionBank.setFilters(filters)}
                onClearFilters={() => questionBank.setFilters({})}
                availableTags={[]}
                availableHierarchies={[]}
              />

              {/* Enhanced Hierarchy Navigation */}
              <div 
                className="relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl border-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.semantic.surface.primary}F8 0%, ${theme.colors.semantic.surface.secondary}F0 50%, ${theme.colors.semantic.surface.primary}F5 100%)`,
                  borderColor: theme.colors.semantic.border.primary + '25',
                  boxShadow: `0 30px 60px -12px ${theme.colors.semantic.action.primary}20`
                }}
              >
                {/* Animated Background */}
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 30%, ${theme.colors.semantic.action.primary} 2px, transparent 2px), radial-gradient(circle at 80% 70%, ${theme.colors.semantic.status.info} 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                    animation: 'float 20s ease-in-out infinite'
                  }}
                ></div>

                <div className="relative p-8">
                  {/* Header */}
                  <div className="flex items-center space-x-4 mb-8">
                    <div 
                      className="w-3 h-10 rounded-full shadow-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.colors.semantic.action.primary}, ${theme.colors.semantic.status.info})` 
                      }}
                    ></div>
                    <div>
                      <h3 
                        className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${theme.colors.semantic.text.primary}, ${theme.colors.semantic.action.primary})`
                        }}
                      >
                        🎯 Smart Hierarchy
                      </h3>
                      <p className="text-sm opacity-80 mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
                        Navigate with precision and style
                      </p>
                    </div>
                  </div>

                  {/* Hierarchy Type Selector */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold uppercase tracking-wider" style={{ color: theme.colors.semantic.text.primary }}>
                        📊 Navigation Mode
                      </label>
                      <select
                        value={selectedHierarchyType || ''}
                        onChange={(e) => {
                          const hierarchyType = e.target.value as HierarchyMode;
                          setSelectedHierarchyType(hierarchyType || null);
                          setIndividualSelections({
                            level1: null, level2: null, level3: null, level4: null, level5: null, mcq: null
                          });
                          questionBank.setFilters({
                            ...questionBank.filters,
                            hierarchyItemId: undefined
                          });
                        }}
                        className="w-full px-6 py-4 rounded-xl border-2 text-sm font-bold transition-all duration-300 hover:shadow-xl focus:shadow-2xl focus:outline-none appearance-none bg-no-repeat bg-right pr-12"
                        style={{
                          backgroundColor: selectedHierarchyType 
                            ? theme.colors.semantic.action.primary + '08'
                            : theme.colors.semantic.surface.primary,
                          borderColor: selectedHierarchyType 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.border.primary,
                          color: selectedHierarchyType 
                            ? theme.colors.semantic.action.primary 
                            : theme.colors.semantic.text.primary,
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${theme.colors.semantic.action.primary.slice(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 16px center',
                          backgroundSize: '20px'
                        }}
                      >
                        <option value="">🎯 Choose Your Adventure</option>
                        <option value="question-bank">📚 Question Bank Journey</option>
                        <option value="previous-papers">📋 Previous Papers Explorer</option>
                      </select>
                    </div>

                    {/* Smart Hierarchy Selector */}
                    {selectedHierarchyType && <SmartHierarchySelector />}

                    {/* Clear All Button */}
                    {(selectedHierarchyType || Object.values(individualSelections).some(Boolean)) && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => {
                            setSelectedHierarchyType(null);
                            setIndividualSelections({
                              level1: null, level2: null, level3: null, level4: null, level5: null, mcq: null
                            });
                            questionBank.setFilters({
                              ...questionBank.filters,
                              hierarchyItemId: undefined
                            });
                          }}
                          className="px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-xl transform hover:scale-110 flex items-center space-x-3 group"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.semantic.status.error}15, ${theme.colors.semantic.status.warning}10)`,
                            borderColor: theme.colors.semantic.status.error + '40',
                            color: theme.colors.semantic.status.error,
                            border: '2px solid'
                          }}
                        >
                          <svg className="w-5 h-5 transition-transform group-hover:rotate-180 duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>🔄 Reset Adventure</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Content Header with Statistics */}
          <div 
            className="border-b px-8 py-6"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary + 'F8',
              borderColor: theme.colors.semantic.border.primary + '20'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                  {questionBank.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <span>Loading questions...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <span className="font-bold" style={{ color: theme.colors.semantic.text.primary }}>
                        📊 Showing {questionBank.questions.length} of {questionBank.pagination?.total || 0} questions
                      </span>
                      {selectedHierarchyType && (
                        <div 
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: theme.colors.semantic.action.primary + '15',
                            color: theme.colors.semantic.action.primary
                          }}
                        >
                          {selectedHierarchyType === 'question-bank' ? '📚 Question Bank' : '📋 Previous Papers'}
                        </div>
                      )}
                      {Object.values(individualSelections).filter(Boolean).length > 0 && (
                        <div 
                          className="px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                          style={{
                            backgroundColor: theme.colors.semantic.status.success + '15',
                            color: theme.colors.semantic.status.success
                          }}
                        >
                          🎯 {Object.values(individualSelections).filter(Boolean).length} Filter(s) Active
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* View Mode Selector */}
              <div className="flex items-center space-x-2">
                {[
                  { mode: ViewMode.GRID, icon: '▦', title: 'Grid View' },
                  { mode: ViewMode.LIST, icon: '☰', title: 'List View' },
                  { mode: ViewMode.TABLE, icon: '⊞', title: 'Table View' },
                ].map((option) => (
                  <button
                    key={option.mode}
                    onClick={() => setViewSettings({ ...viewSettings, mode: option.mode })}
                    className="p-3 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-110"
                    style={{
                      backgroundColor: viewSettings.mode === option.mode 
                        ? theme.colors.semantic.action.primary + '20' 
                        : theme.colors.semantic.surface.secondary,
                      color: viewSettings.mode === option.mode 
                        ? theme.colors.semantic.action.primary 
                        : theme.colors.semantic.text.secondary,
                      border: `2px solid ${viewSettings.mode === option.mode ? theme.colors.semantic.action.primary : 'transparent'}`
                    }}
                    title={option.title}
                  >
                    <span className="text-lg font-bold">{option.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions Content */}
          <div className="flex-1 p-8" style={{ backgroundColor: theme.colors.semantic.surface.primary + '40' }}>
            {renderQuestionContent()}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
          75% { transform: translateY(-15px) rotate(0.5deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}