'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import {
  Table, Plus, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Trash2, Copy, Edit3, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Type, Palette, Settings,
  Download, Upload, Filter, ArrowUpDown, Search, MoreHorizontal,
  Columns, Rows, Grid, Calculator, Zap, Eye, ChevronDown
} from 'lucide-react';

interface TableCell {
  id: string;
  content: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'formula' | 'image' | 'link';
  style?: CellStyle;
  formula?: string;
  validation?: CellValidation;
  metadata?: {
    created: Date;
    updated: Date;
    author?: string;
    comment?: string;
  };
}

interface CellStyle {
  backgroundColor?: string;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: number;
  fontFamily?: string;
  border?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  padding?: number;
}

interface CellValidation {
  type: 'required' | 'email' | 'url' | 'pattern' | 'range' | 'length';
  rule: any;
  message: string;
}

interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'formula' | 'image' | 'link';
  width: number;
  minWidth?: number;
  maxWidth?: number;
  sortable: boolean;
  filterable: boolean;
  resizable: boolean;
  style?: CellStyle;
  format?: {
    type: 'currency' | 'percentage' | 'date' | 'custom';
    pattern?: string;
    locale?: string;
  };
}

interface TableRow {
  id: string;
  cells: { [columnId: string]: TableCell };
  height?: number;
  style?: CellStyle;
  isHeader?: boolean;
  isFooter?: boolean;
}

interface AdvancedTableData {
  id: string;
  columns: TableColumn[];
  rows: TableRow[];
  metadata: {
    title: string;
    description?: string;
    created: Date;
    updated: Date;
    version: number;
  };
  settings: {
    showHeaders: boolean;
    showFooters: boolean;
    showRowNumbers: boolean;
    alternateRowColors: boolean;
    sortable: boolean;
    filterable: boolean;
    resizable: boolean;
    selectable: 'none' | 'single' | 'multiple';
    pagination?: {
      enabled: boolean;
      pageSize: number;
    };
  };
}

interface AdvancedTableEditorProps {
  data: AdvancedTableData;
  onDataChange: (data: AdvancedTableData) => void;
  selectedCells: string[];
  onCellSelect: (cellIds: string[]) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdvancedTableEditor: React.FC<AdvancedTableEditorProps> = ({
  data,
  onDataChange,
  selectedCells,
  onCellSelect,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { theme } = useTheme();
  
  // Component state
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; cellId: string } | null>(null);
  const [showFormatting, setShowFormatting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [sortColumn, setSortColumn] = useState<{ columnId: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<{ [columnId: string]: string }>({});
  const [dragColumn, setDragColumn] = useState<string | null>(null);
  const [resizeColumn, setResizeColumn] = useState<string | null>(null);
  
  // Refs
  const tableRef = useRef<HTMLTableElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus edit input
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // Get cell content with formula evaluation
  const getCellDisplayContent = useCallback((cell: TableCell): string => {
    if (cell.formula && cell.formula.startsWith('=')) {
      try {
        // Simple formula evaluation (expand this for more complex formulas)
        const formula = cell.formula.slice(1); // Remove '='
        if (formula.includes('SUM(')) {
          // Extract range and calculate sum
          const rangeMatch = formula.match(/SUM\(([A-Z]+\d+:[A-Z]+\d+)\)/);
          if (rangeMatch) {
            // Calculate sum logic would go here
            return '42'; // Placeholder
          }
        }
        return cell.content;
      } catch (error) {
        return '#ERROR';
      }
    }
    return cell.content;
  }, []);

  // Add column
  const addColumn = useCallback((insertAfter?: string) => {
    const newColumnId = `col-${Date.now()}`;
    const newColumn: TableColumn = {
      id: newColumnId,
      name: `Column ${data.columns.length + 1}`,
      type: 'text',
      width: 150,
      sortable: true,
      filterable: true,
      resizable: true
    };

    const insertIndex = insertAfter 
      ? data.columns.findIndex(col => col.id === insertAfter) + 1
      : data.columns.length;

    const newColumns = [...data.columns];
    newColumns.splice(insertIndex, 0, newColumn);

    // Add cell to each row
    const newRows = data.rows.map(row => ({
      ...row,
      cells: {
        ...row.cells,
        [newColumnId]: {
          id: `cell-${row.id}-${newColumnId}`,
          content: '',
          type: 'text' as const,
          metadata: {
            created: new Date(),
            updated: new Date()
          }
        }
      }
    }));

    onDataChange({
      ...data,
      columns: newColumns,
      rows: newRows,
      metadata: { ...data.metadata, updated: new Date(), version: data.metadata.version + 1 }
    });
  }, [data, onDataChange]);

  // Add row
  const addRow = useCallback((insertAfter?: string) => {
    const newRowId = `row-${Date.now()}`;
    const newCells: { [columnId: string]: TableCell } = {};
    
    data.columns.forEach(column => {
      newCells[column.id] = {
        id: `cell-${newRowId}-${column.id}`,
        content: '',
        type: column.type,
        metadata: {
          created: new Date(),
          updated: new Date()
        }
      };
    });

    const newRow: TableRow = {
      id: newRowId,
      cells: newCells
    };

    const insertIndex = insertAfter 
      ? data.rows.findIndex(row => row.id === insertAfter) + 1
      : data.rows.length;

    const newRows = [...data.rows];
    newRows.splice(insertIndex, 0, newRow);

    onDataChange({
      ...data,
      rows: newRows,
      metadata: { ...data.metadata, updated: new Date(), version: data.metadata.version + 1 }
    });
  }, [data, onDataChange]);

  // Delete column
  const deleteColumn = useCallback((columnId: string) => {
    if (data.columns.length <= 1) return; // Keep at least one column

    const newColumns = data.columns.filter(col => col.id !== columnId);
    const newRows = data.rows.map(row => {
      const { [columnId]: deletedCell, ...remainingCells } = row.cells;
      return { ...row, cells: remainingCells };
    });

    onDataChange({
      ...data,
      columns: newColumns,
      rows: newRows,
      metadata: { ...data.metadata, updated: new Date(), version: data.metadata.version + 1 }
    });
  }, [data, onDataChange]);

  // Delete row
  const deleteRow = useCallback((rowId: string) => {
    if (data.rows.length <= 1) return; // Keep at least one row

    const newRows = data.rows.filter(row => row.id !== rowId);
    onDataChange({
      ...data,
      rows: newRows,
      metadata: { ...data.metadata, updated: new Date(), version: data.metadata.version + 1 }
    });
  }, [data, onDataChange]);

  // Update cell content
  const updateCell = useCallback((cellId: string, content: string) => {
    const [rowId, columnId] = cellId.split('-').slice(1); // Remove 'cell' prefix
    
    const newRows = data.rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [columnId]: {
              ...row.cells[columnId],
              content,
              metadata: {
                created: row.cells[columnId].metadata?.created || new Date(),
                updated: new Date(),
                author: row.cells[columnId].metadata?.author,
                comment: row.cells[columnId].metadata?.comment
              }
            }
          }
        };
      }
      return row;
    });

    onDataChange({
      ...data,
      rows: newRows,
      metadata: { ...data.metadata, updated: new Date(), version: data.metadata.version + 1 }
    });
  }, [data, onDataChange]);

  // Apply cell formatting
  const formatCells = useCallback((cellIds: string[], style: Partial<CellStyle>) => {
    const newRows = data.rows.map(row => ({
      ...row,
      cells: Object.fromEntries(
        Object.entries(row.cells).map(([columnId, cell]) => {
          if (cellIds.includes(cell.id)) {
            return [columnId, {
              ...cell,
              style: { ...cell.style, ...style },
              metadata: { ...cell.metadata, updated: new Date() }
            }];
          }
          return [columnId, cell];
        })
      )
    }));

    onDataChange({
      ...data,
      rows: newRows,
      metadata: { ...data.metadata, updated: new Date(), version: data.metadata.version + 1 }
    });
  }, [data, onDataChange]);

  // Sort table by column
  const sortByColumn = useCallback((columnId: string, direction: 'asc' | 'desc') => {
    const column = data.columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    const sortedRows = [...data.rows].sort((a, b) => {
      const aValue = getCellDisplayContent(a.cells[columnId]);
      const bValue = getCellDisplayContent(b.cells[columnId]);

      let comparison = 0;
      if (column.type === 'number') {
        comparison = parseFloat(aValue) - parseFloat(bValue);
      } else if (column.type === 'date') {
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
      } else {
        comparison = aValue.localeCompare(bValue);
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    setSortColumn({ columnId, direction });
    onDataChange({
      ...data,
      rows: sortedRows,
      metadata: { ...data.metadata, updated: new Date(), version: data.metadata.version + 1 }
    });
  }, [data, onDataChange, getCellDisplayContent]);

  // Handle cell double-click for editing
  const handleCellDoubleClick = useCallback((cellId: string) => {
    setEditingCell(cellId);
  }, []);

  // Handle cell right-click for context menu
  const handleCellRightClick = useCallback((e: React.MouseEvent, cellId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, cellId });
  }, []);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle key navigation in table
  const handleKeyDown = useCallback((e: React.KeyboardEvent, cellId: string) => {
    if (editingCell) return;

    const [rowId, columnId] = cellId.split('-').slice(1);
    const rowIndex = data.rows.findIndex(row => row.id === rowId);
    const columnIndex = data.columns.findIndex(col => col.id === columnId);

    let newRowIndex = rowIndex;
    let newColumnIndex = columnIndex;

    switch (e.key) {
      case 'ArrowUp':
        newRowIndex = Math.max(0, rowIndex - 1);
        break;
      case 'ArrowDown':
        newRowIndex = Math.min(data.rows.length - 1, rowIndex + 1);
        break;
      case 'ArrowLeft':
        newColumnIndex = Math.max(0, columnIndex - 1);
        break;
      case 'ArrowRight':
        newColumnIndex = Math.min(data.columns.length - 1, columnIndex + 1);
        break;
      case 'Enter':
        setEditingCell(cellId);
        return;
      case 'Delete':
        updateCell(cellId, '');
        return;
      default:
        return;
    }

    const newCellId = `cell-${data.rows[newRowIndex].id}-${data.columns[newColumnIndex].id}`;
    onCellSelect([newCellId]);
    e.preventDefault();
  }, [editingCell, data.rows, data.columns, onCellSelect, updateCell]);

  if (isCollapsed) {
    return (
      <div 
        className={`border rounded-lg p-2 ${className}`}
        style={{ 
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.primary
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-full p-2 rounded transition-colors"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Table className="w-5 h-5" />
          <span className="ml-2 text-sm">Table</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`border rounded-lg overflow-hidden ${className}`}
      style={{ 
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <div className="flex items-center space-x-2">
          <Table className="w-5 h-5" style={{ color: theme.colors.semantic.action.primary }} />
          <h3 className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
            Advanced Table Editor
          </h3>
          <span 
            className="px-2 py-1 text-xs rounded"
            style={{ 
              backgroundColor: theme.colors.semantic.action.secondary,
              color: theme.colors.semantic.text.primary
            }}
          >
            {data.rows.length}×{data.columns.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFormatting(!showFormatting)}
            className="p-2 rounded transition-colors"
            style={{ color: theme.colors.semantic.text.secondary }}
            title="Toggle formatting panel"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded transition-colors"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div 
        className="flex items-center justify-between p-3 border-b space-x-2"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={() => addRow()}
            className="p-2 rounded border transition-colors"
            style={{
              backgroundColor: theme.colors.semantic.action.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
            title="Add row"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => addColumn()}
            className="p-2 rounded border transition-colors"
            style={{
              backgroundColor: theme.colors.semantic.action.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
            title="Add column"
          >
            <Columns className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {selectedCells.length > 0 && (
            <>
              <button
                onClick={() => formatCells(selectedCells, { fontWeight: 'bold' })}
                className="p-2 rounded transition-colors"
                style={{ color: theme.colors.semantic.text.secondary }}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatCells(selectedCells, { fontStyle: 'italic' })}
                className="p-2 rounded transition-colors"
                style={{ color: theme.colors.semantic.text.secondary }}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatCells(selectedCells, { textAlign: 'left' })}
                className="p-2 rounded transition-colors"
                style={{ color: theme.colors.semantic.text.secondary }}
                title="Align left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatCells(selectedCells, { textAlign: 'center' })}
                className="p-2 rounded transition-colors"
                style={{ color: theme.colors.semantic.text.secondary }}
                title="Align center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatCells(selectedCells, { textAlign: 'right' })}
                className="p-2 rounded transition-colors"
                style={{ color: theme.colors.semantic.text.secondary }}
                title="Align right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-auto max-h-96">
        <table 
          ref={tableRef}
          className="w-full border-collapse"
          style={{ minWidth: '100%' }}
        >
          {/* Header */}
          <thead>
            <tr>
              {data.settings.showRowNumbers && (
                <th 
                  className="border p-2 text-center font-medium text-xs"
                  style={{ 
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.secondary,
                    width: '40px'
                  }}
                >
                  #
                </th>
              )}
              {data.columns.map(column => (
                <th
                  key={column.id}
                  className="border p-2 text-left font-medium relative group"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.primary,
                    width: `${column.width}px`,
                    minWidth: `${column.minWidth || 100}px`,
                    maxWidth: column.maxWidth ? `${column.maxWidth}px` : 'none'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{column.name}</span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {column.sortable && (
                        <button
                          onClick={() => {
                            const newDirection = 
                              sortColumn?.columnId === column.id && sortColumn.direction === 'asc' 
                                ? 'desc' 
                                : 'asc';
                            sortByColumn(column.id, newDirection);
                          }}
                          className="p-1 rounded transition-colors"
                          style={{ color: theme.colors.semantic.text.secondary }}
                        >
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteColumn(column.id)}
                        className="p-1 rounded transition-colors"
                        style={{ color: theme.colors.semantic.status.error }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                style={{
                  backgroundColor: data.settings.alternateRowColors && rowIndex % 2 === 1
                    ? theme.colors.semantic.surface.secondary + '50'
                    : 'transparent'
                }}
              >
                {data.settings.showRowNumbers && (
                  <td 
                    className="border p-2 text-center text-xs"
                    style={{ 
                      backgroundColor: theme.colors.semantic.surface.secondary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.secondary
                    }}
                  >
                    {rowIndex + 1}
                  </td>
                )}
                {data.columns.map(column => {
                  const cell = row.cells[column.id];
                  const isSelected = selectedCells.includes(cell.id);
                  const isEditing = editingCell === cell.id;

                  return (
                    <td
                      key={cell.id}
                      className={`border p-0 relative group ${isSelected ? 'ring-2 ring-inset' : ''}`}
                      style={{
                        borderColor: theme.colors.semantic.border.primary,
                        backgroundColor: isSelected 
                          ? theme.colors.semantic.action.primary + '10'
                          : cell.style?.backgroundColor || 'transparent',
                        color: cell.style?.color || theme.colors.semantic.text.primary,
                        fontWeight: cell.style?.fontWeight || 'normal',
                        fontStyle: cell.style?.fontStyle || 'normal',
                        textDecoration: cell.style?.textDecoration || 'none',
                        textAlign: cell.style?.textAlign || 'left'
                      }}
                      onClick={() => onCellSelect([cell.id])}
                      onDoubleClick={() => handleCellDoubleClick(cell.id)}
                      onContextMenu={(e) => handleCellRightClick(e, cell.id)}
                      onKeyDown={(e) => handleKeyDown(e, cell.id)}
                      tabIndex={0}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={cell.content}
                          onChange={(e) => updateCell(cell.id, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          className="w-full h-full p-2 bg-transparent border-none outline-none"
                          style={{ 
                            color: 'inherit',
                            fontWeight: 'inherit',
                            fontStyle: 'inherit',
                            textAlign: 'inherit'
                          }}
                        />
                      ) : (
                        <div className="p-2 min-h-[32px] flex items-center">
                          {getCellDisplayContent(cell)}
                        </div>
                      )}

                      {/* Cell actions (visible on hover) */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellRightClick(e, cell.id);
                          }}
                          className="p-1 rounded shadow-sm"
                          style={{
                            backgroundColor: theme.colors.semantic.surface.primary,
                            color: theme.colors.semantic.text.secondary
                          }}
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-50 py-2 rounded-lg shadow-lg border"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary
            }}
          >
            <button
              onClick={() => {
                // Copy cell content
                const cell = data.rows.flatMap(row => Object.values(row.cells)).find(c => c.id === contextMenu.cellId);
                if (cell) {
                  navigator.clipboard.writeText(cell.content);
                }
                closeContextMenu();
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm w-full text-left hover:bg-opacity-80 transition-colors"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => {
                setEditingCell(contextMenu.cellId);
                closeContextMenu();
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm w-full text-left hover:bg-opacity-80 transition-colors"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                updateCell(contextMenu.cellId, '');
                closeContextMenu();
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm w-full text-left hover:bg-opacity-80 transition-colors"
              style={{ color: theme.colors.semantic.status.error }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};