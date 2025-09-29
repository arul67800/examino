'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface DragAndDropWrapperProps {
  children: React.ReactNode;
  items: any[];
  onReorder: (activeId: string, overId: string) => void;
  renderDragOverlay?: (activeId: string) => React.ReactNode;
}

export default function DragAndDropWrapper({
  children,
  items,
  onReorder,
  renderDragOverlay
}: DragAndDropWrapperProps) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  
  // Flatten all items to get all IDs for the sortable context
  const getAllIds = (items: any[]): string[] => {
    const ids: string[] = [];
    const traverse = (items: any[]) => {
      items.forEach(item => {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(items);
    return ids;
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    // Store drag start info but don't log it
  };

    const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, collisions } = event;
    
    if (!active || !over) {
      return;
    }

    if (collisions && collisions.length > 0) {
      // Get the target item from collision data
      const collision = collisions[0];
      if (collision && active.id !== over.id) {
        onReorder(active.id as string, over.id as string);
      }
    }
  };

  const handleDragOver = (event: any) => {
    // Add visual feedback for valid drop zones if needed
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const allItemIds = getAllIds(items);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      
      <DragOverlay>
        {activeId && renderDragOverlay ? renderDragOverlay(activeId as string) : null}
      </DragOverlay>
    </DndContext>
  );
}