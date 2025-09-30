'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTheme } from '@/theme';
import { createPortal } from 'react-dom';
import { FormatButton } from './FormatButton';
import { ColorPicker } from './ColorPicker';
import { HeadingDropdown } from './HeadingDropdown';
import { 
  Plus, Minus, Palette, AlignLeft, AlignCenter, AlignRight,
  Grid3X3, MoreHorizontal, Trash2, Table2, Square, 
  SquareDashedBottomCode, AlignJustify
} from 'lucide-react';

interface BubbleMenuProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onFormat: (command: string, value?: string) => void;
  activeFormats: Set<string>;
  isVisible: boolean;
  onClose?: () => void;
}

interface Position {
  x: number;
  y: number;
}

// Utility function to detect if selection is inside a table
const isSelectionInTable = (): { inTable: boolean; cell: HTMLElement | null; table: HTMLElement | null } => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { inTable: false, cell: null, table: null };
  }

  const range = selection.getRangeAt(0);
  let element = range.commonAncestorContainer;
  
  // If it's a text node, get the parent element
  if (element.nodeType === Node.TEXT_NODE) {
    element = element.parentElement as HTMLElement;
  }
  
  // Walk up the DOM tree to find table elements
  let currentElement = element as HTMLElement;
  let cell: HTMLElement | null = null;
  let table: HTMLElement | null = null;
  
  while (currentElement && currentElement !== document.body) {
    if (currentElement.tagName === 'TD' || currentElement.tagName === 'TH') {
      cell = currentElement;
    }
    if (currentElement.tagName === 'TABLE' || currentElement.classList.contains('advanced-table')) {
      table = currentElement;
      break;
    }
    const parent = currentElement.parentElement;
    if (!parent) break;
    currentElement = parent;
  }
  
  return { 
    inTable: !!(cell && table), 
    cell, 
    table 
  };
};

export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  editorRef,
  onFormat,
  activeFormats,
  isVisible,
  onClose
}) => {
  const { theme } = useTheme();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [tableContext, setTableContext] = useState<{ inTable: boolean; cell: HTMLElement | null; table: HTMLElement | null }>({ 
    inTable: false, 
    cell: null, 
    table: null 
  });

  // Use the right-click menu hook
  // Removed: Context menu handling moved to parent component

  // Calculate position based on text selection
  const calculatePosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      return { x: 0, y: 0 };
    }

    // Check table context
    const tableInfo = isSelectionInTable();
    setTableContext(tableInfo);

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    
    if (rect.width === 0 && rect.height === 0) {
      return { x: 0, y: 0 };
    }

    // Position bubble menu above the selection
    const bubbleWidth = bubbleRef.current?.offsetWidth || (tableInfo.inTable ? 480 : 220);
    const bubbleHeight = bubbleRef.current?.offsetHeight || (tableInfo.inTable ? 80 : 36);
    
    let x = rect.left + (rect.width / 2) - (bubbleWidth / 2);
    let y = rect.top - bubbleHeight - 12;

    // Ensure bubble stays within viewport
    const padding = 12;
    x = Math.max(padding, Math.min(x, window.innerWidth - bubbleWidth - padding));
    
    // If bubble would be above viewport, position it below selection
    if (y < padding) {
      y = rect.bottom + 12;
    }

    // Ensure bubble doesn't go outside editor bounds horizontally
    if (editorRect.left > 0) {
      x = Math.max(editorRect.left + padding, x);
      x = Math.min(editorRect.right - bubbleWidth - padding, x);
    }

    return { x, y };
  }, [editorRef]);

  // Update position when selection changes
  useEffect(() => {
    if (isVisible) {
      const newPosition = calculatePosition();
      setPosition(newPosition);
    }
  }, [isVisible, calculatePosition]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        const newPosition = calculatePosition();
        setPosition(newPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible, calculatePosition]);

  // Set mounted state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Table manipulation functions
  const handleTableAction = (action: string) => {
    if (!tableContext.table) return;

    // Find a cell to work with - either selected or first cell
    let targetCell = tableContext.cell;
    if (!targetCell) {
      targetCell = tableContext.table.querySelector('td, th');
    }
    
    if (!targetCell && action !== 'deleteTable') {
      // Create a temporary reference for operations that need a cell context
      const firstRow = tableContext.table.querySelector('tbody tr, tr');
      targetCell = firstRow?.querySelector('td, th') || null;
    }

    switch (action) {
      case 'addRowAbove':
        if (targetCell) {
          const row = targetCell.closest('tr');
          (window as any).addTableRow?.(tableContext.table, 'above', row);
        } else {
          (window as any).addTableRow?.(tableContext.table, 'above');
        }
        break;
      case 'addRowBelow':
        if (targetCell) {
          const row = targetCell.closest('tr');
          (window as any).addTableRow?.(tableContext.table, 'below', row);
        } else {
          (window as any).addTableRow?.(tableContext.table, 'below');
        }
        break;
      case 'addColumnLeft':
        (window as any).addTableColumn?.(tableContext.table, 'left', targetCell);
        break;
      case 'addColumnRight':
        (window as any).addTableColumn?.(tableContext.table, 'right', targetCell);
        break;
      case 'deleteRow':
        if (targetCell) {
          (window as any).deleteTableRow?.(targetCell);
        }
        break;
      case 'deleteColumn':
        if (targetCell) {
          (window as any).deleteTableColumn?.(targetCell);
        }
        break;
      case 'deleteTable':
        if (confirm('Are you sure you want to delete this table?')) {
          tableContext.table.remove();
        }
        break;

      case 'tableBorders':
        handleTableBorders();
        break;
      case 'tableAlignment':
        handleTableAlignment();
        break;
    }
  };

  // Advanced table formatting functions
  const handleTableBorders = () => {
    if (!tableContext.table) return;
    
    const currentBorder = tableContext.table.style.borderCollapse === 'collapse' ? 'bordered' : 'borderless';
    const newStyle = currentBorder === 'bordered' ? 'borderless' : 'bordered';
    
    if (newStyle === 'bordered') {
      tableContext.table.style.borderCollapse = 'collapse';
      const cells = tableContext.table.querySelectorAll('td, th');
      cells.forEach(cell => {
        (cell as HTMLElement).style.border = '1px solid #e2e8f0';
      });
    } else {
      tableContext.table.style.borderCollapse = 'separate';
      const cells = tableContext.table.querySelectorAll('td, th');
      cells.forEach(cell => {
        (cell as HTMLElement).style.border = 'none';
      });
    }
  };

  const handleTableAlignment = () => {
    if (!tableContext.table) return;
    
    const container = tableContext.table.closest('.advanced-table-container') as HTMLElement;
    if (!container) return;
    
    const currentAlign = container.style.textAlign || 'left';
    const alignments = ['left', 'center', 'right'];
    const currentIndex = alignments.indexOf(currentAlign);
    const nextAlign = alignments[(currentIndex + 1) % alignments.length];
    
    container.style.textAlign = nextAlign;
  };

  if (!mounted || !isVisible) return null;

  // Main bubble menu return
  return createPortal(
    <>
      <div
        ref={bubbleRef}
        className="fixed z-[9999] animate-in fade-in-0 zoom-in-95 duration-200 bubble-menu-root"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translateZ(0)', // Force hardware acceleration
        }}
      >
      <div
        className="rounded-lg shadow-lg border backdrop-blur-md"
        style={{
          backgroundColor: `${theme.colors.semantic.surface.primary}f8`,
          borderColor: theme.colors.semantic.border.primary,
          boxShadow: `0 8px 32px ${theme.colors.semantic.surface.tertiary}60, 0 2px 8px ${theme.colors.semantic.surface.tertiary}20`,
          minWidth: tableContext.inTable ? '480px' : '220px',
        }}
      >
        {tableContext.inTable ? (
          // Advanced table context menu with both text and table options
          <div className="flex flex-col gap-1 p-1.5">
            {/* Top Row: Standard Text Formatting */}
            <div className="flex items-center gap-0.5 px-1 py-0.5">
              <span 
                className="text-xs font-medium mr-2"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Text:
              </span>
              <FormatButton
                icon="B"
                isActive={activeFormats.has('bold')}
                onClick={() => onFormat('bold')}
                tooltip="Bold (Ctrl+B)"
                weight="bold"
              />
              <FormatButton
                icon="I"
                isActive={activeFormats.has('italic')}
                onClick={() => onFormat('italic')}
                tooltip="Italic (Ctrl+I)"
                style="italic"
              />
              <FormatButton
                icon="U"
                isActive={activeFormats.has('underline')}
                onClick={() => onFormat('underline')}
                tooltip="Underline (Ctrl+U)"
                underline={true}
              />
              
              {/* Separator */}
              <div
                className="w-px h-5 mx-1"
                style={{ backgroundColor: theme.colors.semantic.border.secondary }}
              />

              {/* Text Color */}
              <ColorPicker
                type="text"
                onColorChange={(color: string) => onFormat('foreColor', color)}
                tooltip="Text Color"
              />

              {/* Background Color - Only show for non-table contexts */}
              {!tableContext.inTable && (
                <ColorPicker
                  type="background"
                  onColorChange={(color: string) => onFormat('backColor', color)}
                  tooltip="Text Background"
                />
              )}

              {/* Separator */}
              <div
                className="w-px h-5 mx-1"
                style={{ backgroundColor: theme.colors.semantic.border.secondary }}
              />

              {/* Heading Dropdown */}
              <HeadingDropdown
                onHeadingChange={(level: number) => onFormat('formatBlock', level === 0 ? 'p' : `h${level}`)}
                tooltip="Heading Level"
              />
            </div>

            {/* Separator Line */}
            <div
              className="w-full h-px mx-1"
              style={{ backgroundColor: theme.colors.semantic.border.primary }}
            />

            {/* Bottom Row: Table-Specific Options */}
            <div className="flex items-center gap-0.5 px-1 py-0.5">
              <span 
                className="text-xs font-medium mr-2"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Table:
              </span>

              {/* Add Row Above */}
              <button
                onClick={() => handleTableAction('addRowAbove')}
                className="flex items-center justify-center w-7 h-7 rounded hover:bg-opacity-10 transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.colors.semantic.text.primary 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.colors.semantic.action.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Add Row Above"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Add Row Below */}
              <button
                onClick={() => handleTableAction('addRowBelow')}
                className="flex items-center justify-center w-7 h-7 rounded hover:bg-opacity-10 transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.colors.semantic.text.primary 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.colors.semantic.action.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Add Row Below"
              >
                <Plus className="w-4 h-4 rotate-90" />
              </button>

              {/* Add Column Left */}
              <button
                onClick={() => handleTableAction('addColumnLeft')}
                className="flex items-center justify-center w-7 h-7 rounded hover:bg-opacity-10 transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.colors.semantic.text.primary 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.colors.semantic.action.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Add Column Left"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>

              {/* Add Column Right */}
              <button
                onClick={() => handleTableAction('addColumnRight')}
                className="flex items-center justify-center w-7 h-7 rounded hover:bg-opacity-10 transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.colors.semantic.text.primary 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.colors.semantic.action.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Add Column Right"
              >
                <Grid3X3 className="w-4 h-4 rotate-90" />
              </button>

              {/* Separator */}
              <div
                className="w-px h-5 mx-1"
                style={{ backgroundColor: theme.colors.semantic.border.secondary }}
              />

              {/* Table Borders Toggle */}
              <button
                onClick={() => handleTableAction('tableBorders')}
                className="flex items-center justify-center w-7 h-7 rounded hover:bg-opacity-10 transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.colors.semantic.text.primary 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.colors.semantic.action.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Toggle Table Borders"
              >
                <Square className="w-4 h-4" />
              </button>

              {/* Table Alignment */}
              <button
                onClick={() => handleTableAction('tableAlignment')}
                className="flex items-center justify-center w-7 h-7 rounded hover:bg-opacity-10 transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.colors.semantic.text.primary 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.colors.semantic.action.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Table Alignment"
              >
                <AlignCenter className="w-4 h-4" />
              </button>

              {/* Separator */}
              <div
                className="w-px h-5 mx-1"
                style={{ backgroundColor: theme.colors.semantic.border.secondary }}
              />

              {/* Delete Row */}
              <button
                onClick={() => handleTableAction('deleteRow')}
                className="flex items-center justify-center w-7 h-7 rounded hover:bg-opacity-10 transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#f59e0b' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f59e0b15';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Delete Row"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Delete Column */}
              <button
                onClick={() => handleTableAction('deleteColumn')}
                className="flex items-center justify-center w-7 h-7 rounded hover:bg-opacity-10 transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#f59e0b' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f59e0b15';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Delete Column"
              >
                <Minus className="w-4 h-4 rotate-90" />
              </button>

              {/* Delete Table */}
              <button
                onClick={() => handleTableAction('deleteTable')}
                className="flex items-center justify-center w-7 h-7 rounded hover:bg-opacity-10 transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#ef4444' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef444415';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Delete Table"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Standard text formatting menu
          <div className="flex items-center gap-0.5 px-1.5 py-1">
            {/* Bold, Italic, Underline */}
            <div className="flex items-center">
              <FormatButton
                icon="B"
                isActive={activeFormats.has('bold')}
                onClick={() => onFormat('bold')}
                tooltip="Bold (Ctrl+B)"
                weight="bold"
              />
              <FormatButton
                icon="I"
                isActive={activeFormats.has('italic')}
                onClick={() => onFormat('italic')}
                tooltip="Italic (Ctrl+I)"
                style="italic"
              />
              <FormatButton
                icon="U"
                isActive={activeFormats.has('underline')}
                onClick={() => onFormat('underline')}
                tooltip="Underline (Ctrl+U)"
                underline={true}
              />
            </div>

            {/* Separator */}
            <div
              className="w-px h-5 mx-0.5"
              style={{ backgroundColor: theme.colors.semantic.border.secondary }}
            />

            {/* Text Color */}
            <ColorPicker
              type="text"
              onColorChange={(color: string) => onFormat('foreColor', color)}
              tooltip="Text Color"
            />

            {/* Background Color */}
            <ColorPicker
              type="background"
              onColorChange={(color: string) => onFormat('backColor', color)}
              tooltip="Background Color"
            />

            {/* Separator */}
            <div
              className="w-px h-5 mx-0.5"
              style={{ backgroundColor: theme.colors.semantic.border.secondary }}
            />

            {/* Heading Dropdown */}
            <HeadingDropdown
              onHeadingChange={(level: number) => onFormat('formatBlock', level === 0 ? 'p' : `h${level}`)}
              tooltip="Heading Level"
            />
          </div>
        )}
      </div>

      {/* Arrow pointing down */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0"
        style={{
          top: '100%',
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `4px solid ${theme.colors.semantic.surface.primary}`,
          filter: `drop-shadow(0 1px 2px ${theme.colors.semantic.surface.tertiary}20)`,
        }}
      />
    </div>
    </>,
    document.body
  );
};