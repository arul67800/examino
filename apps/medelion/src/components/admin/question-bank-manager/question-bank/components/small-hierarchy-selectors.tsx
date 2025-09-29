/**
 * Small Hierarchy Selectors Component
 * Compact version for sidebar use
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

interface SmallHierarchySelectorsProps {
  hierarchyType: HierarchyMode;
  individualSelections: IndividualSelections;
  setIndividualSelections: (selections: IndividualSelections) => void;
  questionBankHierarchy?: { hierarchyItems: HierarchyItem[] };
  previousPapersHierarchy?: { hierarchyItems: HierarchyItem[] };
  theme: any;
  onSelectionChange?: (selections: IndividualSelections) => void;
}

export const SmallHierarchySelectors: React.FC<SmallHierarchySelectorsProps> = ({
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
      <div key={level} className="w-full">
        <select
          value={currentSelection?.id || ''}
          onChange={(e) => {
            const selectedItem = items.find(item => item.id === e.target.value) || null;
            handleLevelSelection(level, selectedItem);
          }}
          disabled={isDisabled}
          className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-300 hover:shadow-sm focus:shadow-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: currentSelection 
              ? `${levelColor}10`
              : theme.colors.semantic.surface.primary,
            borderColor: currentSelection 
              ? levelColor + '60'
              : theme.colors.semantic.border.secondary,
            color: currentSelection 
              ? levelColor 
              : theme.colors.semantic.text.secondary
          }}
        >
          <option value="">{levelName}</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Level selectors */}
      {Array.from({ length: config.maxLevels }, (_, i) => i + 1).map(level => renderSelector(level))}
      
      {/* MCQ selector if we're at chapter level */}
      {individualSelections.level5 && renderSelector(6)}
      
      {/* Active selection summary */}
      {Object.values(individualSelections).some(Boolean) && (
        <div className="mt-3 p-2 rounded-lg text-center"
             style={{
               backgroundColor: theme.colors.semantic.status.info + '10',
               border: `1px solid ${theme.colors.semantic.status.info}20`
             }}>
          <div className="text-xs font-medium" 
               style={{ color: theme.colors.semantic.status.info }}>
            {Object.values(individualSelections).filter(Boolean).length} selected
          </div>
        </div>
      )}
    </div>
  );
};