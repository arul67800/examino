'use client';

import React from 'react';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '@/theme';
import HierarchyItemActions from './hierarchy-item-actions';
import HierarchyItemCount from './hierarchy-item-count';
import AddItemForm from './add-item-form';

interface HierarchyItemProps {
  item: any;
  depth?: number;
  parentId?: string;
  isLastChild?: boolean;
  expandedItems: Set<string>;
  showAddForm: string | null;
  newItemName: string;
  editingItem?: string | null;
  editingName?: string;
  showDeleteButton?: boolean;
  onToggleExpanded: (id: string) => void;
  onAddSibling: (parentId: string, itemId: string) => void;
  onAddChild: (parentId: string, itemId: string) => void;
  onSaveNewItem: (parentId: string, itemId: string, level: number) => void;
  onCancelAdd: () => void;
  onNameChange: (value: string) => void;
  onEdit?: (item: any) => void;
  onDelete?: (itemId: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onEditNameChange?: (value: string) => void;
  getTypeByLevel: (level: number) => string;
}

export default function HierarchyItem({ 
  item,
  depth = 0,
  parentId = '',
  isLastChild = false,
  expandedItems,
  showAddForm,
  newItemName,
  editingItem,
  editingName = '',
  showDeleteButton = false,
  onToggleExpanded,
  onAddSibling,
  onAddChild,
  onSaveNewItem,
  onCancelAdd,
  onNameChange,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  getTypeByLevel
}: HierarchyItemProps) {
  const { theme } = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const isExpanded = expandedItems.has(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const siblingFormKey = `sibling-${item.id}`;
  const childFormKey = `child-${item.id}`;
  const showingAddForm = showAddForm === siblingFormKey || showAddForm === childFormKey;

  const isAddingSibling = showAddForm === siblingFormKey;
  const isAddingChild = showAddForm === childFormKey;

  return (
    <div className="space-y-2">
      {/* Main Item */}
      <div
        ref={setNodeRef}
        style={{
          ...dragStyle,
          backgroundColor: `${theme.colors.semantic.surface.secondary}40`,
          backdropFilter: 'blur(8px)',
          marginLeft: `${depth * 24}px`
        }}
        className={`relative flex items-center p-3 rounded-lg transition-all duration-200 group ${
          isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : 'hover:shadow-md hover:bg-opacity-60'
        }`}
        {...attributes}
        {...listeners}
      >
        {/* Indentation Lines - adjusted for background indentation */}
        {depth > 0 && (
          <div className="absolute pointer-events-none" style={{ left: `-${depth * 24}px`, top: 0, bottom: 0 }}>
            {/* Vertical lines for all ancestor levels */}
            {Array.from({ length: depth - 1 }).map((_, index) => (
              <div
                key={`ancestor-line-${index}`}
                className="absolute"
                style={{
                  left: `${index * 24 + 12}px`,
                  top: '-50px',
                  bottom: '-50px',
                  width: '1px',
                  backgroundColor: theme.colors.semantic.border.primary
                }}
              />
            ))}
            
            {/* Current level vertical line - from parent, stops at last child */}
            <div
              className="absolute"
              style={{
                left: `${(depth - 1) * 24 + 12}px`,
                top: 0,
                bottom: isLastChild ? '50%' : '-50px',
                width: '1px',
                backgroundColor: theme.colors.semantic.border.primary
              }}
            />
            
            {/* Vertical line extending down through children if expanded */}
            {hasChildren && isExpanded && (
              <div
                className="absolute"
                style={{
                  left: `${(depth - 1) * 24 + 12}px`,
                  top: '50%',
                  bottom: '-50px',
                  width: '1px',
                  backgroundColor: theme.colors.semantic.border.primary
                }}
              />
            )}
            
            {/* Horizontal connector from vertical line to item */}
            <div
              className="absolute"
              style={{
                left: `${(depth - 1) * 24 + 12}px`,
                top: '50%',
                width: '16px',
                height: '1px',
                backgroundColor: theme.colors.semantic.border.primary,
                transform: 'translateY(-50%)'
              }}
            />
          </div>
        )}

        {/* Main Content Area - no additional margin since background handles indentation */}
        <div 
          className="flex items-center space-x-2 flex-1"
        >
          {/* 16-Dot Drag Handle (4x4 Grid) */}
          <div 
            {...attributes}
            {...listeners}
            className="drag-handle cursor-grab active:cursor-grabbing grid grid-cols-4 gap-0.5 rounded-md transition-all duration-200 hover:scale-105"
            style={{ 
              width: '28px',
              height: '28px',
              padding: '6px',
              backgroundColor: isDragging ? item.color : `${item.color}15`,
              border: `1px solid ${item.color}40`,
            }}
            title="Drag to reorder"
          >
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 h-0.5 rounded-full"
                style={{ 
                  backgroundColor: isDragging ? 'white' : item.color,
                  opacity: 0.8
                }}
              />
            ))}
          </div>

          {/* Expand/Collapse Button and Item Details */}
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <button 
                className="text-base font-medium transition-all duration-300 hover:scale-125 rounded-full w-7 h-7 flex items-center justify-center"
                style={{ 
                  color: item.color,
                  backgroundColor: `${item.color}10`,
                  border: `1px solid ${item.color}30`
                }}
                onClick={() => onToggleExpanded(item.id)}
              >
                {isExpanded ? '−' : '+'}
              </button>
            )}

            {/* Item Details */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                {editingItem === item.id ? (
                  <div className="flex items-center space-x-2 flex-grow">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => onEditNameChange?.(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          onSaveEdit?.();
                        } else if (e.key === 'Escape') {
                          onCancelEdit?.();
                        }
                      }}
                      className="flex-grow px-2 py-1 border rounded-md text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: item.color }}
                      autoFocus
                      onBlur={() => {
                        // Save if changes were made, otherwise cancel
                        const hasChanges = editingName.trim() !== item.name.trim() && editingName.trim() !== '';
                        if (hasChanges) {
                          onSaveEdit?.();
                        } else {
                          onCancelEdit?.();
                        }
                      }}
                    />
                    <button
                      onClick={onSaveEdit}
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      ✓
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span 
                    className="text-base font-bold"
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </span>
                )}
                <span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium border"
                  style={{
                    backgroundColor: `${item.color}08`,
                    color: item.color,
                    border: `1px solid ${item.color}30`
                  }}
                >
                  {item.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Count and Actions - positioned absolutely to avoid indentation */}
        <div className="flex items-center space-x-2 ml-auto">
          <HierarchyItemCount 
            item={item} 
            hasChildren={hasChildren} 
            getTypeByLevel={getTypeByLevel} 
          />

          <HierarchyItemActions
            item={item}
            getTypeByLevel={getTypeByLevel}
            showDeleteButton={showDeleteButton}
            onAddSibling={(e) => {
              e.stopPropagation();
              // Add sibling at the same level, so parentId stays the same
              onAddSibling(parentId, item.id);
            }}
            onAddChild={(e) => {
              e.stopPropagation();
              // Add child under this item, so this item becomes the parent
              onAddChild(item.id, item.id);
            }}
            onEdit={onEdit ? () => onEdit(item) : undefined}
            onDelete={onDelete && showDeleteButton ? () => onDelete(item.id) : undefined}
          />
        </div>
      </div>

      {/* Add Form Container - maintains consistent spacing */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          showingAddForm 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform -translate-y-2 pointer-events-none'
        }`}
        style={{ 
          height: showingAddForm ? 'auto' : '0px',
          overflow: showingAddForm ? 'visible' : 'hidden',
          marginTop: showingAddForm ? '8px' : '0px',
          marginBottom: showingAddForm ? '8px' : '0px'
        }}
      >
        <AddItemForm
          itemName={newItemName}
          itemType={
            showAddForm === childFormKey 
              ? getTypeByLevel(item.level + 1) // Adding child (next level down)
              : getTypeByLevel(item.level)     // Adding sibling (same level)
          }
          onNameChange={onNameChange}
          onSave={() => {
            if (showAddForm === childFormKey) {
              // Adding child: parent is current item, level is next level down
              onSaveNewItem(item.id, item.id, item.level + 1);
            } else {
              // Adding sibling: parent stays the same, level stays the same
              onSaveNewItem(parentId, item.id, item.level);
            }
          }}
          onCancel={onCancelAdd}
          depth={depth}
        />
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-2 mt-2">
          {item.children.map((child: any, index: number) => (
            <HierarchyItem
              key={child.id}
              item={child}
              depth={depth + 1}
              parentId={item.id}
              isLastChild={index === item.children.length - 1}
              expandedItems={expandedItems}
              showAddForm={showAddForm}
              newItemName={newItemName}
              editingItem={editingItem}
              editingName={editingName}
              showDeleteButton={showDeleteButton}
              onToggleExpanded={onToggleExpanded}
              onAddSibling={onAddSibling}
              onAddChild={onAddChild}
              onSaveNewItem={onSaveNewItem}
              onCancelAdd={onCancelAdd}
              onNameChange={onNameChange}
              onEdit={onEdit}
              onDelete={onDelete}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onEditNameChange={onEditNameChange}
              getTypeByLevel={getTypeByLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}