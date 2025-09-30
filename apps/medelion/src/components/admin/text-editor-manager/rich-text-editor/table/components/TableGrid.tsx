import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import { AdvancedTableData, TableSelection, TableCell as TableCellType } from '../types/table.types';
import { TableCell } from './TableCell';
import { useTable } from '../context/TableContext';
import { 
  ArrowUpDown, Filter, MoreHorizontal, Grip, 
  Plus, Trash2, Move, Eye, EyeOff, Lock, Unlock, Type
} from 'lucide-react';
import { generateCellId } from '../utils/table.utils';

export interface TableGridProps {
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  maxHeight?: number;
  maxWidth?: number;
  showMinimap?: boolean;
  enableVirtualScrolling?: boolean;
}

export const TableGrid = memo<TableGridProps>(({
  readOnly = false,
  className = '',
  style = {},
  maxHeight = 600,
  maxWidth,
  showMinimap = false,
  enableVirtualScrolling = false
}) => {
  const { 
    state, 
    updateCell, 
    setSelection, 
    startEditing, 
    stopEditing,
    showContextMenu,
    insertRow,
    insertColumn,
    deleteRow,
    deleteColumn,
    updateColumn
  } = useTable();

  const tableRef = useRef<HTMLTableElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [columnResizing, setColumnResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [headerInputValue, setHeaderInputValue] = useState<string>('');
  const [dragIndicator, setDragIndicator] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });
  const [contextMenuState, setContextMenuState] = useState<{ show: boolean; x: number; y: number; target: string; type: string }>({ show: false, x: 0, y: 0, target: '', type: '' });

  // Helper function to find cell by ID
  const findCellById = useCallback((cellId: string) => {
    for (const row of state.data.rows) {
      for (const cell of Object.values(row.cells)) {
        if (cell.id === cellId) {
          return cell;
        }
      }
    }
    return null;
  }, [state.data.rows]);

  // Handle complex cell selection with ranges
  const handleCellClick = useCallback((cellId: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (readOnly) return;

    const [, rowId, columnId] = cellId.split('-');
    const rowIndex = state.data.rows.findIndex(row => row.id === rowId);
    const columnIndex = state.data.columns.findIndex(col => col.id === columnId);

    if (e.ctrlKey || e.metaKey) {
      // Multi-select individual cells
      const newCells = state.selection.cells.includes(cellId)
        ? state.selection.cells.filter(id => id !== cellId)
        : [...state.selection.cells, cellId];
      
      setSelection({
        type: newCells.length > 1 ? 'range' : 'cell',
        cells: newCells,
        rows: [],
        columns: [],
        ranges: []
      });
    } else if (e.shiftKey && state.selection.cells.length > 0) {
      // Range selection
      const lastCellId = state.selection.cells[state.selection.cells.length - 1];
      const [, lastRowId, lastColumnId] = lastCellId.split('-');
      const lastRowIndex = state.data.rows.findIndex(row => row.id === lastRowId);
      const lastColumnIndex = state.data.columns.findIndex(col => col.id === lastColumnId);

      // Calculate rectangular range
      const startRow = Math.min(rowIndex, lastRowIndex);
      const endRow = Math.max(rowIndex, lastRowIndex);
      const startCol = Math.min(columnIndex, lastColumnIndex);
      const endCol = Math.max(columnIndex, lastColumnIndex);

      const rangeCells: string[] = [];
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          rangeCells.push(generateCellId(state.data.rows[r].id, state.data.columns[c].id));
        }
      }

      setSelection({
        type: 'range',
        cells: rangeCells,
        rows: [],
        columns: [],
        ranges: [{
          startRow: startRow,
          endRow: endRow,
          startColumn: startCol,
          endColumn: endCol
        }]
      });
    } else {
      // Single cell selection
      setSelection({
        type: 'cell',
        cells: [cellId],
        rows: [],
        columns: [],
        ranges: []
      });
    }
  }, [readOnly, state.selection, state.data, setSelection]);

  // Handle column header click for column selection
  const handleColumnClick = useCallback((columnId: string, e: React.MouseEvent) => {
    if (readOnly) return;
    
    e.preventDefault();
    const columnCells = state.data.rows.map(row => generateCellId(row.id, columnId));
    
    if (e.ctrlKey || e.metaKey) {
      const newColumns = state.selection.columns.includes(columnId)
        ? state.selection.columns.filter(id => id !== columnId)
        : [...state.selection.columns, columnId];
      
      setSelection({
        type: 'column',
        cells: state.data.rows.flatMap(row => 
          newColumns.map(colId => generateCellId(row.id, colId))
        ),
        rows: [],
        columns: newColumns,
        ranges: []
      });
    } else {
      setSelection({
        type: 'column',
        cells: columnCells,
        rows: [],
        columns: [columnId],
        ranges: []
      });
    }
  }, [readOnly, state.data, state.selection, setSelection]);

  // Handle row header click for row selection
  const handleRowClick = useCallback((rowId: string, e: React.MouseEvent) => {
    if (readOnly) return;
    
    e.preventDefault();
    const rowCells = state.data.columns.map(col => generateCellId(rowId, col.id));
    
    if (e.ctrlKey || e.metaKey) {
      const newRows = state.selection.rows.includes(rowId)
        ? state.selection.rows.filter(id => id !== rowId)
        : [...state.selection.rows, rowId];
      
      setSelection({
        type: 'row',
        cells: state.data.columns.flatMap(col => 
          newRows.map(rId => generateCellId(rId, col.id))
        ),
        rows: newRows,
        columns: [],
        ranges: []
      });
    } else {
      setSelection({
        type: 'row',
        cells: rowCells,
        rows: [rowId],
        columns: [],
        ranges: []
      });
    }
  }, [readOnly, state.data, state.selection, setSelection]);

  // Handle cell double-click for editing
  const handleCellDoubleClick = useCallback((cellId: string) => {
    if (readOnly) return;
    startEditing(cellId);
  }, [readOnly, startEditing]);

  // Handle cell context menu
  const handleCellContextMenu = useCallback((e: React.MouseEvent, cellId: string) => {
    if (readOnly) return;
    
    e.preventDefault();
    showContextMenu(
      { x: e.clientX, y: e.clientY },
      cellId,
      'cell'
    );
  }, [readOnly, showContextMenu]);

  // Advanced keyboard navigation and shortcuts
  const handleCellKeyDown = useCallback((e: React.KeyboardEvent, cellId: string) => {
    if (state.editingCell && state.editingCell !== cellId) return;

    const [, rowId, columnId] = cellId.split('-');
    const rowIndex = state.data.rows.findIndex(row => row.id === rowId);
    const columnIndex = state.data.columns.findIndex(col => col.id === columnId);

    let newRowIndex = rowIndex;
    let newColumnIndex = columnIndex;

    // Handle complex keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'c':
          // Copy cells
          if (state.selection.cells.length > 0) {
            e.preventDefault();
            const cellData = state.selection.cells.map(cId => {
              const cell = findCellById(cId);
              return cell ? { id: cId, content: cell.content, style: cell.style } : null;
            }).filter(Boolean);
            navigator.clipboard.writeText(JSON.stringify(cellData));
          }
          return;
        case 'v':
          // Paste cells
          e.preventDefault();
          navigator.clipboard.readText().then(text => {
            try {
              const cellData = JSON.parse(text);
              // Apply pasted data to selected cells
              if (Array.isArray(cellData) && cellData.length > 0) {
                cellData.forEach((data, index) => {
                  const targetCellId = state.selection.cells[index];
                  if (targetCellId && data.content !== undefined) {
                    updateCell(targetCellId, { content: data.content });
                  }
                });
              }
            } catch {
              // If not JSON, treat as plain text
              if (state.selection.cells.length > 0) {
                updateCell(state.selection.cells[0], { content: text });
              }
            }
          });
          return;
        case 'x':
          // Cut cells
          if (state.selection.cells.length > 0) {
            e.preventDefault();
            const cellData = state.selection.cells.map(cId => {
              const cell = findCellById(cId);
              return cell ? { id: cId, content: cell.content, style: cell.style } : null;
            }).filter(Boolean);
            navigator.clipboard.writeText(JSON.stringify(cellData));
            // Clear selected cells
            state.selection.cells.forEach(cId => {
              updateCell(cId, { content: '' });
            });
          }
          return;
        case 'a':
          // Select all
          e.preventDefault();
          const allCells = state.data.rows.flatMap(row => 
            state.data.columns.map(col => generateCellId(row.id, col.id))
          );
          setSelection({
            type: 'range',
            cells: allCells,
            rows: state.data.rows.map(r => r.id),
            columns: state.data.columns.map(c => c.id),
            ranges: [{
              startRow: 0,
              endRow: state.data.rows.length - 1,
              startColumn: 0,
              endColumn: state.data.columns.length - 1
            }]
          });
          return;
      }
    }

    // Navigation shortcuts
    switch (e.key) {
      case 'ArrowUp':
        newRowIndex = Math.max(0, rowIndex - 1);
        break;
      case 'ArrowDown':
        newRowIndex = Math.min(state.data.rows.length - 1, rowIndex + 1);
        break;
      case 'ArrowLeft':
        newColumnIndex = Math.max(0, columnIndex - 1);
        break;
      case 'ArrowRight':
        newColumnIndex = Math.min(state.data.columns.length - 1, columnIndex + 1);
        break;
      case 'Enter':
        if (state.editingCell === cellId) {
          stopEditing();
          newRowIndex = Math.min(state.data.rows.length - 1, rowIndex + 1);
        } else {
          startEditing(cellId);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (state.editingCell === cellId) {
          stopEditing();
        }
        newColumnIndex = e.shiftKey 
          ? Math.max(0, columnIndex - 1)
          : Math.min(state.data.columns.length - 1, columnIndex + 1);
        break;
      case 'Delete':
      case 'Backspace':
        if (state.editingCell !== cellId) {
          e.preventDefault();
          state.selection.cells.forEach(selectedCellId => {
            updateCell(selectedCellId, { content: '' });
          });
        }
        return;
      case 'Escape':
        if (state.editingCell === cellId) {
          stopEditing();
        } else {
          setSelection({
            type: 'cell',
            cells: [],
            rows: [],
            columns: [],
            ranges: []
          });
        }
        return;
      case 'F2':
        e.preventDefault();
        startEditing(cellId);
        return;
      default:
        // If typing a character, start editing
        if (!state.editingCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          startEditing(cellId);
        }
        return;
    }

    if (newRowIndex !== rowIndex || newColumnIndex !== columnIndex) {
      const newCellId = generateCellId(
        state.data.rows[newRowIndex].id,
        state.data.columns[newColumnIndex].id
      );
      setSelection({
        type: 'cell',
        cells: [newCellId],
        rows: [],
        columns: [],
        ranges: []
      });
      e.preventDefault();
    }
  }, [state, updateCell, setSelection, startEditing, stopEditing, findCellById]);

  // Enhanced column resize handlers with proper width persistence
  const handleColumnResizeStart = useCallback((e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const column = state.data.columns.find(col => col.id === columnId);
    if (column) {
      setColumnResizing({
        columnId,
        startX: e.clientX,
        startWidth: column.width || 120
      });
      
      // Add visual feedback
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      // Show drag indicator
      setDragIndicator({ show: true, x: e.clientX, y: e.clientY });
    }
  }, [state.data.columns]);

  const handleColumnResizeMove = useCallback((e: MouseEvent) => {
    if (columnResizing) {
      const deltaX = e.clientX - columnResizing.startX;
      const newWidth = Math.max(60, columnResizing.startWidth + deltaX);
      
      // Update drag indicator position
      setDragIndicator(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
      
      // Update column width in real-time
      if (updateColumn) {
        updateColumn(columnResizing.columnId, { width: newWidth });
      }
      
      // Update DOM for immediate visual feedback
      if (tableRef.current) {
        const headerCell = tableRef.current.querySelector(`[data-column-id="${columnResizing.columnId}"]`) as HTMLElement;
        if (headerCell) {
          headerCell.style.width = `${newWidth}px`;
          headerCell.style.minWidth = `${newWidth}px`;
        }
        
        // Update all cells in this column
        const columnIndex = state.data.columns.findIndex(col => col.id === columnResizing.columnId);
        const cells = tableRef.current.querySelectorAll(`tbody tr td:nth-child(${columnIndex + 2})`) as NodeListOf<HTMLElement>;
        cells.forEach(cell => {
          cell.style.width = `${newWidth}px`;
          cell.style.minWidth = `${newWidth}px`;
        });
      }
    }
  }, [columnResizing, updateColumn, state.data.columns]);

  const handleColumnResizeEnd = useCallback(() => {
    if (columnResizing && updateColumn) {
      // Finalize the resize
      const deltaX = 0; // Already updated in move handler
      setColumnResizing(null);
      setDragIndicator({ show: false, x: 0, y: 0 });
      
      // Reset cursor and selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [columnResizing, updateColumn]);

  // Header editing functionality
  const handleHeaderDoubleClick = useCallback((columnId: string, currentName: string) => {
    if (readOnly) return;
    setEditingHeader(columnId);
    setHeaderInputValue(currentName || columnId);
  }, [readOnly]);

  const handleHeaderInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderInputValue(e.target.value);
  }, []);

  const handleHeaderInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingHeader && updateColumn) {
        updateColumn(editingHeader, { name: headerInputValue.trim() || editingHeader });
      }
      setEditingHeader(null);
      setHeaderInputValue('');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingHeader(null);
      setHeaderInputValue('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Save current header and move to next
      if (editingHeader && updateColumn) {
        updateColumn(editingHeader, { name: headerInputValue.trim() || editingHeader });
      }
      
      const currentIndex = state.data.columns.findIndex(col => col.id === editingHeader);
      const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
      
      if (nextIndex >= 0 && nextIndex < state.data.columns.length) {
        const nextColumn = state.data.columns[nextIndex];
        setEditingHeader(nextColumn.id);
        setHeaderInputValue(nextColumn.name || `Column ${String.fromCharCode(65 + nextIndex)}`);
      } else {
        setEditingHeader(null);
        setHeaderInputValue('');
      }
    }
  }, [editingHeader, headerInputValue, updateColumn, state.data.columns]);

  const handleHeaderInputBlur = useCallback(() => {
    if (editingHeader && updateColumn) {
      updateColumn(editingHeader, { name: headerInputValue.trim() || editingHeader });
    }
    setEditingHeader(null);
    setHeaderInputValue('');
  }, [editingHeader, headerInputValue, updateColumn]);

  // Enhanced context menu functionality
  const handleAdvancedContextMenu = useCallback((e: React.MouseEvent, target: string, type: 'cell' | 'row' | 'column' | 'header') => {
    e.preventDefault();
    setContextMenuState({
      show: true,
      x: e.clientX,
      y: e.clientY,
      target,
      type
    });
    
    // Also call the existing context menu
    showContextMenu(
      { x: e.clientX, y: e.clientY },
      target,
      type as any
    );
  }, [showContextMenu]);

    // Close context menu on outside click\n  useEffect(() => {\n    const handleClickOutside = () => {\n      setContextMenuState(prev => ({ ...prev, show: false }));\n    };\n    \n    if (contextMenuState.show) {\n      document.addEventListener('click', handleClickOutside);\n      return () => document.removeEventListener('click', handleClickOutside);\n    }\n  }, [contextMenuState.show]);\n\n  // Set up resize event listeners\n  useEffect(() => {\n    if (columnResizing) {\n      document.addEventListener('mousemove', handleColumnResizeMove);\n      document.addEventListener('mouseup', handleColumnResizeEnd);\n      return () => {\n        document.removeEventListener('mousemove', handleColumnResizeMove);\n        document.removeEventListener('mouseup', handleColumnResizeEnd);\n      };\n    }\n  }, [columnResizing, handleColumnResizeMove, handleColumnResizeEnd]);

  // Render enhanced column headers with editing capabilities
  const renderColumnHeaders = () => (
    <thead className="bg-gray-50 sticky top-0 z-20">
      <tr>
        {/* Corner cell with table actions */}
        <th className="w-12 h-10 bg-gray-100 border border-gray-300 sticky left-0 z-30 relative group">
          <div className="flex items-center justify-center">
            <Grip className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
          </div>
          
          {/* Quick actions dropdown */}
          <div className="absolute top-full left-0 bg-white border border-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-40 min-w-[120px]">
            <button 
              className="w-full px-2 py-1 text-xs text-left hover:bg-gray-100 flex items-center gap-1"
              onClick={() => insertRow && insertRow()}
            >
              <Plus className="w-3 h-3" /> Add Row
            </button>
            <button 
              className="w-full px-2 py-1 text-xs text-left hover:bg-gray-100 flex items-center gap-1"
              onClick={() => insertColumn && insertColumn()}
            >
              <Plus className="w-3 h-3" /> Add Column
            </button>
          </div>
        </th>
        
        {/* Enhanced column headers */}
        {state.data.columns.map((column, index) => (
          <th
            key={column.id}
            data-column-id={column.id}
            className={`
              h-10 border border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100 text-xs font-semibold text-gray-700
              hover:from-gray-100 hover:to-gray-200 cursor-pointer select-none relative group transition-all
              ${state.selection.columns.includes(column.id) ? 'bg-blue-100 from-blue-50 to-blue-100' : ''}
              ${hoveredColumn === column.id ? 'from-gray-200 to-gray-300' : ''}
              ${editingHeader === column.id ? 'from-white to-gray-50' : ''}
            `}
            style={{ 
              width: column.width || 120,
              minWidth: 60,
              maxWidth: 500
            }}
            onClick={(e) => !editingHeader && handleColumnClick(column.id, e)}
            onDoubleClick={() => handleHeaderDoubleClick(column.id, column.name || '')}
            onContextMenu={(e) => handleAdvancedContextMenu(e, column.id, 'header')}
            onMouseEnter={() => setHoveredColumn(column.id)}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div className="flex items-center justify-between px-3 py-2">
              {/* Editable header content */}
              {editingHeader === column.id ? (
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={headerInputValue}
                    onChange={handleHeaderInputChange}
                    onKeyDown={handleHeaderInputKeyDown}
                    onBlur={handleHeaderInputBlur}
                    className="bg-transparent border-none outline-none w-full text-xs font-semibold text-gray-900 focus:bg-white focus:border focus:border-blue-400 focus:rounded px-1 py-0.5"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Enter column name..."
                    maxLength={50}
                  />
                  {/* Editing indicator */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Editing mode" />
                </div>
              ) : (
                <span 
                  className="truncate font-semibold cursor-text hover:bg-blue-50 hover:text-blue-800 transition-colors px-1 py-0.5 rounded"
                  title="Double-click to edit header"
                >
                  {column.name || `Column ${String.fromCharCode(65 + index)}`}
                </span>
              )}
              
              {/* Header action buttons */}
              {!editingHeader && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  {/* Edit button */}
                  <button 
                    className="p-0.5 hover:bg-blue-200 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeaderDoubleClick(column.id, column.name || '');
                    }}
                    title="Edit header name"
                  >
                    <Type className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                  </button>
                  
                  {/* Sort indicator and button */}
                  {column.sortable && (
                    <button 
                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement sorting
                      }}
                      title="Sort column"
                    >
                      <ArrowUpDown className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                  
                  {/* Filter button */}
                  {column.filterable && (
                    <button 
                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement filtering
                      }}
                      title="Filter column"
                    >
                      <Filter className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                  
                  {/* Column menu */}
                  <button 
                    className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdvancedContextMenu(e, column.id, 'column');
                    }}
                    title="Column options"
                  >
                    <MoreHorizontal className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Enhanced resize handle */}
            <div
              className={`
                absolute right-0 top-0 w-2 h-full cursor-col-resize transition-all
                hover:bg-blue-500 hover:opacity-100
                ${columnResizing?.columnId === column.id ? 'bg-blue-500 opacity-100' : 'opacity-0 group-hover:opacity-50'}
              `}
              onMouseDown={(e) => handleColumnResizeStart(e, column.id)}
              title="Resize column"
            />
            
            {/* Column type indicator */}
            {column.type && column.type !== 'text' && (
              <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-blue-400 opacity-75" title={`Type: ${column.type}`} />
            )}
            
            {/* Editable indicator */}
            {!readOnly && (
              <div className="absolute top-1 right-8 w-1.5 h-1.5 rounded-full bg-green-400 opacity-0 group-hover:opacity-75 transition-opacity" title="Double-click to edit" />
            )}
          </th>
        ))}
      </tr>
    </thead>
  );

  // Render row headers
  const renderRowHeaders = (row: any, rowIndex: number) => (
    <th
      className={`
        w-12 h-8 bg-gray-50 border border-gray-300 text-xs font-medium text-gray-700
        hover:bg-gray-100 cursor-pointer select-none sticky left-0 z-10
        ${state.selection.rows.includes(row.id) ? 'bg-blue-100' : ''}
        ${hoveredRow === row.id ? 'bg-gray-200' : ''}
      `}
      onClick={(e) => handleRowClick(row.id, e)}
      onMouseEnter={() => setHoveredRow(row.id)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      <div className="flex items-center justify-center">
        <span>{rowIndex + 1}</span>
      </div>
    </th>
  );

  // Main render
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto border border-gray-300 rounded-lg ${className}`}
      style={{ 
        maxHeight,
        maxWidth,
        ...style 
      }}
    >
      <table ref={tableRef} className="w-full border-collapse">
        {renderColumnHeaders()}
        
        <tbody>
          {state.data.rows.map((row, rowIndex) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {renderRowHeaders(row, rowIndex)}
              
              {state.data.columns.map((column) => {
                const cellId = generateCellId(row.id, column.id);
                const cell = row.cells[column.id];
                const isSelected = state.selection.cells.includes(cellId);
                const isEditing = state.editingCell === cellId;
                
                return (
                  <td
                    key={cellId}
                    className={`
                      border border-gray-300 p-0 relative
                      ${isSelected ? 'bg-blue-50' : ''}
                      ${hoveredCell === cellId ? 'bg-gray-100' : ''}
                      ${isEditing ? 'bg-white' : ''}
                    `}
                    style={{ 
                      width: column.width || 120,
                      height: row.height || 32 
                    }}
                    onClick={(e) => handleCellClick(cellId, e)}
                    onDoubleClick={() => handleCellDoubleClick(cellId)}
                    onContextMenu={(e) => handleCellContextMenu(e, cellId)}
                    onMouseEnter={() => setHoveredCell(cellId)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <TableCell
                      cell={cell}
                      rowId={row.id}
                      columnId={column.id}
                      rowIndex={rowIndex}
                      columnIndex={state.data.columns.findIndex(col => col.id === column.id)}
                      isSelected={isSelected}
                      isEditing={isEditing}
                      onKeyDown={(e) => handleCellKeyDown(e, cellId)}
                      onClick={(cId, e) => handleCellClick(cId, e)}
                      onDoubleClick={(cId) => handleCellDoubleClick(cId)}
                      onContextMenu={(e, cId) => handleCellContextMenu(e, cId)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Drag indicator during column resize */}
      {dragIndicator.show && (
        <div 
          className="fixed pointer-events-none z-50 w-0.5 bg-blue-500 shadow-lg"
          style={{
            left: dragIndicator.x,
            top: 0,
            height: '100vh'
          }}
        />
      )}
      
      {/* Enhanced context menu */}
      {contextMenuState.show && (
        <div 
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-1 min-w-[160px]"
          style={{
            left: contextMenuState.x,
            top: contextMenuState.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenuState.type === 'header' && (
            <>
              <button className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 flex items-center gap-2">
                <ArrowUpDown className="w-3 h-3" /> Sort Column
              </button>
              <button className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Add Filter
              </button>
              <hr className="my-1" />
              <button 
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 flex items-center gap-2"
                onClick={() => insertColumn && insertColumn(contextMenuState.target)}
              >
                <Plus className="w-3 h-3" /> Insert Column
              </button>
              <button 
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 text-red-600 flex items-center gap-2"
                onClick={() => deleteColumn && deleteColumn(contextMenuState.target)}
              >
                <Trash2 className="w-3 h-3" /> Delete Column
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

TableGrid.displayName = 'TableGrid';

export default TableGrid;