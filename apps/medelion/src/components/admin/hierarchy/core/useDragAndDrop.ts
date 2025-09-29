'use client';

import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

// Utility functions for hierarchical operations
const findItemPath = (items: any[], targetId: string, path: number[] = []): number[] | null => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.id === targetId) {
      return [...path, i];
    }
    if (item.children && item.children.length > 0) {
      const childPath = findItemPath(item.children, targetId, [...path, i]);
      if (childPath) return childPath;
    }
  }
  return null;
};

const findParentAndSiblings = (items: any[], targetId: string): { parent: any | null, siblings: any[], parentPath: number[] | null } => {
  console.log(`🔍 Looking for ${targetId} in items:`, items.map(i => ({ id: i.id, name: i.name, childrenCount: i.children?.length || 0 })));
  
  // Check if it's a root level item
  const rootIndex = items.findIndex(item => item.id === targetId);
  if (rootIndex !== -1) {
    console.log(`✅ Found ${targetId} at root level, index ${rootIndex}`);
    return { parent: null, siblings: items, parentPath: null };
  }

  // Search in nested levels
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.children && item.children.length > 0) {
      console.log(`🔍 Checking children of ${item.name} (${item.id}):`, item.children.map((c: any) => ({ id: c.id, name: c.name })));
      
      // Check if targetId is a direct child
      const childIndex = item.children.findIndex((child: any) => child.id === targetId);
      if (childIndex !== -1) {
        console.log(`✅ Found ${targetId} as direct child of ${item.name}, index ${childIndex}`);
        return { parent: item, siblings: item.children, parentPath: [i] };
      }
      
      // Recursively search in grandchildren
      const result = findParentAndSiblings(item.children, targetId);
      if (result.parent !== null || result.siblings.length > 0) {
        console.log(`✅ Found ${targetId} in nested children of ${item.name}`);
        return {
          ...result,
          parentPath: result.parentPath ? [i, ...result.parentPath] : [i]
        };
      }
    }
  }
  
  console.log(`❌ Could not find ${targetId} anywhere`);
  return { parent: null, siblings: [], parentPath: null };
};

const updateItemsAtPath = (items: any[], path: number[] | null, newSiblings: any[]): any[] => {
  if (!path) {
    // Root level update
    return newSiblings;
  }
  
  // Deep clone the entire structure to avoid mutation issues
  const deepClone = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    return { ...obj, children: obj.children ? obj.children.map(deepClone) : undefined };
  };
  
  const newItems = items.map(deepClone);
  
  // Navigate to the correct position and update
  const updateAtPath = (current: any[], currentPath: number[], targetPath: number[]): void => {
    if (currentPath.length === targetPath.length - 1) {
      // We're at the parent level, update the children
      const parentIndex = targetPath[targetPath.length - 1];
      current[parentIndex] = { ...current[parentIndex], children: newSiblings };
    } else {
      // Continue navigating deeper
      const nextIndex = targetPath[currentPath.length];
      current[nextIndex] = { ...current[nextIndex] };
      if (!current[nextIndex].children) current[nextIndex].children = [];
      updateAtPath(current[nextIndex].children, [...currentPath, nextIndex], targetPath);
    }
  };
  
  updateAtPath(newItems, [], path);
  return newItems;
};

export const useDragAndDrop = () => {
  const handleReorder = useCallback(async (activeId: string, overId: string, items: any[], updateItems: (newItems: any[]) => void) => {
    if (activeId === overId) return items;

    console.log('🔄 Hierarchical Reordering START:', { activeId, overId });
    console.log('🔍 Total items structure:', JSON.stringify(items.map(item => ({
      id: item.id,
      name: item.name,
      level: item.level,
      childrenCount: item.children?.length || 0,
      children: item.children?.map((child: any) => ({ id: child.id, name: child.name })) || []
    })), null, 2));

    // Find the siblings of both active and over items
    const activeResult = findParentAndSiblings(items, activeId);
    const overResult = findParentAndSiblings(items, overId);

    console.log('Active item context:', {
      parent: activeResult.parent?.name || 'root',
      siblingsCount: activeResult.siblings.length,
      parentPath: activeResult.parentPath
    });

    console.log('Over item context:', {
      parent: overResult.parent?.name || 'root', 
      siblingsCount: overResult.siblings.length,
      parentPath: overResult.parentPath
    });

    // Check if both items are at the same level (have the same parent)
    const activeParentId = activeResult.parent?.id || 'root';
    const overParentId = overResult.parent?.id || 'root';

    if (activeParentId !== overParentId) {
      console.warn('Cannot reorder items from different hierarchy levels');
      return items;
    }

    // Find indices within the sibling group
    const siblings = activeResult.siblings;
    const activeIndex = siblings.findIndex(item => item.id === activeId);
    const overIndex = siblings.findIndex(item => item.id === overId);

    if (activeIndex === -1 || overIndex === -1) {
      console.warn('Could not find items in sibling group');
      return items;
    }

    console.log('Reordering within siblings:', {
      activeIndex,
      overIndex,
      activeItem: siblings[activeIndex].name,
      overItem: siblings[overIndex].name
    });

    // Create the reordered sibling array
    const newSiblings = arrayMove(siblings, activeIndex, overIndex);
    
    // Update the order property for each sibling based on new position
    const updatedSiblings = newSiblings.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    // Update the entire hierarchy with the new sibling order
    const updatedItems = updateItemsAtPath(items, activeResult.parentPath, updatedSiblings);

    console.log('✅ Hierarchy updated successfully');

    // Update the items immediately for visual feedback
    updateItems(updatedItems);

    // TODO: Implement API call to persist the new order
    try {
      console.log('Order updated successfully');
    } catch (error) {
      console.error('Failed to update order:', error);
      // If API call fails, revert the changes
      // updateItems(items);
    }

    return updatedItems;
  }, []);

  return {
    handleReorder
  };
};