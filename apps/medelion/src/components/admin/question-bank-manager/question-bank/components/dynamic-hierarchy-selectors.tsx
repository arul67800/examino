/**
 * Dynamic Hierarchy Selectors Component
 * Renders hierarchy selectors based on the selected hierarchy type
 */

'use client';

import React from 'react';
import { HierarchyItem } from '@/lib/types/hierarchy.types';
import { HierarchyMode, getHierarchyConfig, getLevelName, getLevelColor } from '@/components/admin/hierarchy/config/hierarchy-config';

interface IndividualSelections {
  level1: HierarchyItem | null;
  level2: HierarchyItem | null;
  level3: HierarchyItem | null;
  level4: HierarchyItem | null;
  level5: HierarchyItem | null;
  mcq: HierarchyItem | null;
}

interface DynamicHierarchySelectorsProps {
  hierarchyType: HierarchyMode;
  individualSelections: IndividualSelections;
  setIndividualSelections: (selections: IndividualSelections) => void;
  questionBankHierarchy?: { hierarchyItems: HierarchyItem[] };
  previousPapersHierarchy?: { hierarchyItems: HierarchyItem[] };
  theme: any;
  onSelectionChange?: (selections: IndividualSelections) => void;
}

export const DynamicHierarchySelectors: React.FC<DynamicHierarchySelectorsProps> = ({
  hierarchyType,
  individualSelections,
  setIndividualSelections,
  questionBankHierarchy,
  previousPapersHierarchy,
  theme,
  onSelectionChange
}) => {
  const config = getHierarchyConfig(hierarchyType);
  const currentHierarchy = hierarchyType === 'question-bank' ? questionBankHierarchy : previousPapersHierarchy;

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
    onSelectionChange?.(newSelections);
  };

  const renderSelector = (level: number) => {
    const items = getAvailableItems(level);
    const isDisabled = level > 1 && !individualSelections[`level${level - 1}` as keyof IndividualSelections];
    const levelName = getLevelName(level, hierarchyType);
    const levelColor = getLevelColor(level, hierarchyType);
    const currentSelection = level <= 5 
      ? individualSelections[`level${level}` as keyof IndividualSelections]
      : individualSelections.mcq;

    if (isDisabled && level > 1) return null;

    return (
      <div key={level} className="relative group">
        <select
          value={currentSelection?.id || ''}
          onChange={(e) => {
            const selectedItem = items.find(item => item.id === e.target.value) || null;
            handleLevelSelection(level, selectedItem);
          }}
          disabled={isDisabled}
          className="px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 hover:shadow-lg focus:shadow-xl focus:outline-none focus:ring-3 min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: currentSelection 
              ? `${levelColor}15`
              : theme.colors.semantic.surface.primary,
            borderColor: currentSelection 
              ? levelColor 
              : theme.colors.semantic.border.secondary,
            color: currentSelection 
              ? levelColor 
              : theme.colors.semantic.text.secondary,
            focusRingColor: levelColor + '25'
          }}
        >
          <option value="" style={{ backgroundColor: theme.colors.semantic.surface.primary }}>
            {levelName}
          </option>
          {items.map(item => (
            <option 
              key={item.id} 
              value={item.id}
              style={{ backgroundColor: theme.colors.semantic.surface.primary }}
            >
              {item.name}
            </option>
          ))}
        </select>
        
        {/* Level indicator */}
        <div 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
          style={{ backgroundColor: levelColor }}
        >
          {level}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Level selectors */}
      {Array.from({ length: config.maxLevels }, (_, i) => i + 1).map(level => renderSelector(level))}
      
      {/* MCQ selector if we're at chapter level */}
      {individualSelections.level5 && renderSelector(6)}
      
      {/* Active selection indicator */}
      {Object.values(individualSelections).some(Boolean) && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg"
             style={{
               backgroundColor: theme.colors.semantic.status.info + '10',
               border: `1px solid ${theme.colors.semantic.status.info}30`
             }}>
          <div className="w-2 h-2 rounded-full animate-pulse"
               style={{ backgroundColor: theme.colors.semantic.status.info }}></div>
          <span className="text-xs font-medium" 
                style={{ color: theme.colors.semantic.status.info }}>
            {Object.values(individualSelections).filter(Boolean).length} level(s) selected
          </span>
        </div>
      )}
    </div>
  );
};