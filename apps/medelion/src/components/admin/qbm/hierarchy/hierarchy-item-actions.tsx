'use client';

import { useTheme } from '@/theme';

interface HierarchyItemActionsProps {
  item: any;
  onAddSibling: (e: React.MouseEvent) => void;
  onAddChild?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  getTypeByLevel: (level: number) => string;
  showDeleteButton?: boolean;
}

export default function HierarchyItemActions({ 
  item, 
  onAddSibling,
  onAddChild,
  onEdit,
  onDelete,
  getTypeByLevel,
  showDeleteButton = false
}: HierarchyItemActionsProps) {
  const { theme } = useTheme();
  
  // Get the child type name for the "+ Child" button
  const childTypeName = item.level < 5 ? getTypeByLevel(item.level + 1) : null;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="flex items-center space-x-2">
      {/* Always visible "+ Subject/Part/etc" button when no children exist */}
      {childTypeName && onAddChild && !hasChildren && (
        <button 
          className="px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 border" 
          style={{ 
            backgroundColor: `${theme.colors.semantic.status.info}15`,
            border: `1px solid ${theme.colors.semantic.status.info}40`,
            color: theme.colors.semantic.status.info
          }}
          title={`Add ${childTypeName}`}
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(e);
          }}
        >
          + {childTypeName}
        </button>
      )}
      
      {/* Show child count when children exist */}
      {hasChildren && (
        <span 
          className="px-2 py-1.5 text-xs font-semibold rounded-lg"
          style={{
            backgroundColor: `${item.color}15`,
            color: item.color,
            border: `1px solid ${item.color}30`
          }}
        >
          {item.children.length} {childTypeName}
          {item.children.length !== 1 ? 's' : ''}
        </span>
      )}

      {/* Hover-only buttons group */}
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        {(item.level === 4 || item.level === 5) && (
          <>
            <button 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 border shadow-sm"
              style={{
                backgroundColor: theme.colors.semantic.status.info,
                color: theme.colors.semantic.text.inverse,
                border: `1px solid ${theme.colors.semantic.status.info}80`
              }}
            >
              MCQ
            </button>
            <button 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 border shadow-sm"
              style={{
                backgroundColor: theme.colors.semantic.status.success,
                color: theme.colors.semantic.text.inverse,
                border: `1px solid ${theme.colors.semantic.status.success}80`
              }}
            >
              ARTICLE
            </button>
            <button 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 border shadow-sm"
              style={{
                backgroundColor: theme.colors.semantic.status.warning,
                color: theme.colors.semantic.text.inverse,
                border: `1px solid ${theme.colors.semantic.status.warning}80`
              }}
            >
              VIDEO
            </button>
            <button 
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 border shadow-sm"
              style={{
                backgroundColor: theme.colors.semantic.status.error,
                color: theme.colors.semantic.text.inverse,
                border: `1px solid ${theme.colors.semantic.status.error}80`
              }}
            >
              NOTE
            </button>
          </>
        )}
        
        {/* Edit button */}
        <button 
          className="p-2 rounded-lg hover:scale-105 transition-all duration-200 border" 
          style={{ 
            backgroundColor: `${theme.colors.semantic.surface.tertiary}80`,
            border: `1px solid ${theme.colors.semantic.border.secondary}30`
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(e);
          }}
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={theme.colors.semantic.text.secondary} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="m18.5 2.5 a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
          </svg>
        </button>
        
        {/* Delete button - conditionally shown based on settings */}
        {showDeleteButton && onDelete && (
          <button 
            className="p-2 rounded-lg hover:scale-105 transition-all duration-200 border" 
            style={{ 
              backgroundColor: `${theme.colors.semantic.surface.tertiary}80`,
              border: `1px solid ${theme.colors.semantic.border.secondary}30`
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(e);
            }}
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={theme.colors.semantic.status.error} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="3,6 5,6 21,6"/>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2V6"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        )}
        
        {/* Add Sibling Button (+ only) - at the end */}
        <button 
          className="p-2 rounded-lg hover:scale-105 transition-all duration-200 border" 
          style={{ 
            backgroundColor: `${theme.colors.semantic.status.success}15`,
            border: `1px solid ${theme.colors.semantic.status.success}40`,
            color: theme.colors.semantic.status.success
          }}
          title="Add Sibling"
          onClick={(e) => {
            e.stopPropagation();
            onAddSibling(e);
          }}
        >
          ➕
        </button>
      </div>
    </div>
  );
}