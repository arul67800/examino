import React, { useState, useRef, useEffect } from 'react';
import { 
  RowsIcon, 
  ColumnsIcon, 
  Trash2, 
  Plus, 
  Minus, 
  Palette, 
  PaintBucket,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  Divide,
  MoreHorizontal,
  Copy,
  Scissors,
  Clipboard
} from 'lucide-react';
import { SimpleColorPicker } from './SimpleColorPicker';

interface TableContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  selectedCell?: HTMLTableCellElement | null;
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action?: () => void;
  submenu?: ContextMenuItem[];
  separator?: boolean;
  disabled?: boolean;
  color?: boolean;
}

export const TableContextMenu: React.FC<TableContextMenuProps> = ({
  isVisible,
  position,
  onClose,
  selectedCell
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [colorPickerTarget, setColorPickerTarget] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Helper functions for table operations
  const findTable = () => {
    if (!selectedCell) return null;
    return selectedCell.closest('table');
  };

  const findCellPosition = (cell: HTMLTableCellElement) => {
    const table = findTable();
    if (!table) return { row: -1, col: -1 };
    
    const rows = Array.from(table.rows);
    for (let i = 0; i < rows.length; i++) {
      const cells = Array.from(rows[i].cells);
      const colIndex = cells.indexOf(cell);
      if (colIndex !== -1) {
        return { row: i, col: colIndex };
      }
    }
    return { row: -1, col: -1 };
  };

  const applyColorToElement = (element: HTMLElement, color: string, type: 'background' | 'text') => {
    if (type === 'background') {
      element.style.backgroundColor = color;
    } else {
      element.style.color = color;
    }
  };

  const colorEntireHeader = (color: string) => {
    const table = findTable();
    if (!table || !table.rows[0]) return;
    
    const headerCells = Array.from(table.rows[0].cells);
    headerCells.forEach(cell => applyColorToElement(cell, color, 'background'));
  };

  const colorEntireRow = (color: string) => {
    if (!selectedCell) return;
    const row = selectedCell.closest('tr');
    if (!row) return;
    
    const cells = Array.from(row.cells);
    cells.forEach(cell => applyColorToElement(cell, color, 'background'));
  };

  const colorAlternativeRows = (color: string) => {
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach((row, index) => {
      if (index % 2 === 1) { // Odd rows (0-indexed)
        const cells = Array.from(row.cells);
        cells.forEach(cell => applyColorToElement(cell, color, 'background'));
      }
    });
  };

  const colorAlternativeColumns = (color: string) => {
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    if (rows.length === 0) return;
    
    const maxCols = Math.max(...rows.map(row => row.cells.length));
    
    for (let col = 1; col < maxCols; col += 2) { // Odd columns (0-indexed)
      rows.forEach(row => {
        if (row.cells[col]) {
          applyColorToElement(row.cells[col], color, 'background');
        }
      });
    }
  };

  const deleteRowAbove = () => {
    if (!selectedCell) return;
    const { row } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table || row <= 0) return; // Don't delete if it's the first row or invalid
    
    table.deleteRow(row - 1);
  };

  const deleteRowBelow = () => {
    if (!selectedCell) return;
    const { row } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table || row >= table.rows.length - 1) return; // Don't delete if it's the last row
    
    table.deleteRow(row + 1);
  };

  const deleteColumnLeft = () => {
    if (!selectedCell) return;
    const { col } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table || col <= 0) return; // Don't delete if it's the first column
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      if (row.cells[col - 1]) {
        row.deleteCell(col - 1);
      }
    });
  };

  const deleteColumnRight = () => {
    if (!selectedCell) return;
    const { col } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    const maxCols = Math.max(...rows.map(row => row.cells.length));
    if (col >= maxCols - 1) return; // Don't delete if it's the last column
    
    rows.forEach(row => {
      if (row.cells[col + 1]) {
        row.deleteCell(col + 1);
      }
    });
  };

  const addRowAbove = () => {
    if (!selectedCell) return;
    const { row, col } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const newRow = table.insertRow(row);
    const colCount = table.rows[row + 1]?.cells.length || 1;
    
    for (let i = 0; i < colCount; i++) {
      const cell = newRow.insertCell();
      cell.contentEditable = 'true';
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.minHeight = '20px';
    }
  };

  const addRowBelow = () => {
    if (!selectedCell) return;
    const { row } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const newRow = table.insertRow(row + 1);
    const colCount = table.rows[row]?.cells.length || 1;
    
    for (let i = 0; i < colCount; i++) {
      const cell = newRow.insertCell();
      cell.contentEditable = 'true';
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.minHeight = '20px';
    }
  };

  const addColumnLeft = () => {
    if (!selectedCell) return;
    const { col } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      const cell = row.insertCell(col);
      cell.contentEditable = 'true';
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.minHeight = '20px';
    });
  };

  const addColumnRight = () => {
    if (!selectedCell) return;
    const { col } = findCellPosition(selectedCell);
    const table = findTable();
    if (!table) return;
    
    const rows = Array.from(table.rows);
    rows.forEach(row => {
      const cell = row.insertCell(col + 1);
      cell.contentEditable = 'true';
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '8px';
      cell.style.minHeight = '20px';
    });
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'add-row',
      label: 'Add Row',
      icon: Plus,
      submenu: [
        { id: 'add-row-above', label: 'Add Row Above', icon: ArrowUp, action: addRowAbove },
        { id: 'add-row-below', label: 'Add Row Below', icon: ArrowDown, action: addRowBelow }
      ]
    },
    {
      id: 'add-column',
      label: 'Add Column', 
      icon: Plus,
      submenu: [
        { id: 'add-column-left', label: 'Add Column Left', icon: ArrowLeft, action: addColumnLeft },
        { id: 'add-column-right', label: 'Add Column Right', icon: ArrowRight, action: addColumnRight }
      ]
    },
    { id: 'sep1', label: '', icon: Divide, separator: true },
    {
      id: 'delete-row',
      label: 'Delete Row',
      icon: Minus,
      submenu: [
        { id: 'delete-row-above', label: 'Delete Row Above', icon: ArrowUp, action: deleteRowAbove },
        { id: 'delete-row-below', label: 'Delete Row Below', icon: ArrowDown, action: deleteRowBelow },
        { id: 'sep2', label: '', icon: Divide, separator: true },
        { id: 'delete-current-row', label: 'Delete Current Row', icon: Trash2, action: () => {
          if (!selectedCell) return;
          const row = selectedCell.closest('tr');
          if (row) row.remove();
        }}
      ]
    },
    {
      id: 'delete-column',
      label: 'Delete Column',
      icon: Minus,
      submenu: [
        { id: 'delete-column-left', label: 'Delete Column Left', icon: ArrowLeft, action: deleteColumnLeft },
        { id: 'delete-column-right', label: 'Delete Column Right', icon: ArrowRight, action: deleteColumnRight },
        { id: 'sep3', label: '', icon: Divide, separator: true },
        { id: 'delete-current-column', label: 'Delete Current Column', icon: Trash2, action: () => {
          if (!selectedCell) return;
          const { col } = findCellPosition(selectedCell);
          const table = findTable();
          if (!table) return;
          
          const rows = Array.from(table.rows);
          rows.forEach(row => {
            if (row.cells[col]) {
              row.deleteCell(col);
            }
          });
        }}
      ]
    },
    { id: 'sep4', label: '', icon: Divide, separator: true },
    {
      id: 'color-options',
      label: 'Color Options',
      icon: Palette,
      submenu: [
        { 
          id: 'color-header', 
          label: 'Color Entire Header', 
          icon: PaintBucket, 
          color: true,
          action: () => setColorPickerTarget('header')
        },
        { 
          id: 'color-row', 
          label: 'Color Entire Row', 
          icon: RowsIcon, 
          color: true,
          action: () => setColorPickerTarget('row')
        },
        { 
          id: 'color-alt-rows', 
          label: 'Color Alternative Rows', 
          icon: RowsIcon, 
          color: true,
          action: () => setColorPickerTarget('alt-rows')
        },
        { 
          id: 'color-alt-columns', 
          label: 'Color Alternative Columns', 
          icon: ColumnsIcon, 
          color: true,
          action: () => setColorPickerTarget('alt-columns')
        }
      ]
    },
    { id: 'sep5', label: '', icon: Divide, separator: true },
    {
      id: 'clipboard',
      label: 'Clipboard',
      icon: Clipboard,
      submenu: [
        { id: 'copy', label: 'Copy', icon: Copy, action: () => {
          if (selectedCell) {
            navigator.clipboard.writeText(selectedCell.textContent || '');
          }
        }},
        { id: 'cut', label: 'Cut', icon: Scissors, action: () => {
          if (selectedCell) {
            navigator.clipboard.writeText(selectedCell.textContent || '');
            selectedCell.textContent = '';
          }
        }},
        { id: 'paste', label: 'Paste', icon: Clipboard, action: async () => {
          if (selectedCell) {
            try {
              const text = await navigator.clipboard.readText();
              selectedCell.textContent = text;
            } catch (err) {
              console.warn('Failed to paste:', err);
            }
          }
        }}
      ]
    },
    { id: 'sep6', label: '', icon: Divide, separator: true },
    {
      id: 'table-properties',
      label: 'Table Properties',
      icon: Grid3X3,
      action: () => {
        // TODO: Open table properties dialog
        console.log('Open table properties');
      }
    }
  ];

  const handleColorSelect = (color: string) => {
    switch (colorPickerTarget) {
      case 'header':
        colorEntireHeader(color);
        break;
      case 'row':
        colorEntireRow(color);
        break;
      case 'alt-rows':
        colorAlternativeRows(color);
        break;
      case 'alt-columns':
        colorAlternativeColumns(color);
        break;
    }
    setColorPickerTarget(null);
    onClose();
  };

  const renderMenuItem = (item: ContextMenuItem, level = 0) => {
    if (item.separator) {
      return (
        <div 
          key={item.id}
          className="border-b border-gray-200 dark:border-gray-700 my-1"
        />
      );
    }

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = activeSubmenu === item.id;

    return (
      <div key={item.id} className="relative">
        <button
          className={`
            w-full px-3 py-2 text-left flex items-center justify-between
            hover:bg-gray-100 dark:hover:bg-gray-700
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${level > 0 ? 'pl-6' : ''}
          `}
          onClick={() => {
            if (item.disabled) return;
            
            if (hasSubmenu) {
              setActiveSubmenu(isActive ? null : item.id);
            } else if (item.action) {
              item.action();
              onClose();
            }
          }}
          onMouseEnter={() => {
            if (hasSubmenu) {
              setActiveSubmenu(item.id);
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <item.icon size={16} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-800 dark:text-gray-200">
              {item.label}
            </span>
          </div>
          {hasSubmenu && (
            <ArrowRight size={14} className="text-gray-500" />
          )}
        </button>

        {hasSubmenu && isActive && (
          <div className="absolute left-full top-0 ml-1 min-w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            {item.submenu!.map(subItem => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-48 z-40"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {contextMenuItems.map(item => renderMenuItem(item))}
      </div>

      {colorPickerTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
              Select Color for {colorPickerTarget.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <SimpleColorPicker
              onColorSelect={handleColorSelect}
              onClose={() => setColorPickerTarget(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};