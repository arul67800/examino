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
  Copy,
  Scissors,
  Clipboard,
  Move,
  Merge,
  Split,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Settings,
  Download,
  Upload,
  Calculator,
  Filter,
  SortAsc,
  SortDesc,
  Maximize,
  Minimize,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  FileText,
  Database,
  Table,
  Crown,
  Layers,
  Brush,
  Zap,
  Target,
  MoreVertical
} from 'lucide-react';
import { ContextMenuItem, TableOperations } from '../types';

export const createAdvancedContextMenuItems = (
  operations: TableOperations
): ContextMenuItem[] => [
  // INSERT OPERATIONS
  {
    id: 'insert',
    label: 'Insert',
    icon: Plus,
    submenu: [
      {
        id: 'insert-rows',
        label: 'Insert Rows',
        icon: RowsIcon,
        submenu: [
          { id: 'insert-row-above', label: 'Insert Row Above', icon: ArrowUp, action: operations.addRowAbove },
          { id: 'insert-row-below', label: 'Insert Row Below', icon: ArrowDown, action: operations.addRowBelow },
          { id: 'sep-insert-1', label: '', icon: Divide, separator: true },
          { 
            id: 'insert-multiple-rows', 
            label: 'Insert Multiple Rows...', 
            icon: RowsIcon, 
            action: () => {
              const count = parseInt(prompt('Number of rows to insert:') || '1');
              if (count > 0) operations.addMultipleRows(count, 'below');
            }
          },
          { id: 'duplicate-row', label: 'Duplicate Row', icon: Copy, action: operations.duplicateRow }
        ]
      },
      {
        id: 'insert-columns',
        label: 'Insert Columns',
        icon: ColumnsIcon,
        submenu: [
          { id: 'insert-column-left', label: 'Insert Column Left', icon: ArrowLeft, action: operations.addColumnLeft },
          { id: 'insert-column-right', label: 'Insert Column Right', icon: ArrowRight, action: operations.addColumnRight },
          { id: 'sep-insert-2', label: '', icon: Divide, separator: true },
          { 
            id: 'insert-multiple-columns', 
            label: 'Insert Multiple Columns...', 
            icon: ColumnsIcon, 
            action: () => {
              const count = parseInt(prompt('Number of columns to insert:') || '1');
              if (count > 0) operations.addMultipleColumns(count, 'right');
            }
          },
          { id: 'duplicate-column', label: 'Duplicate Column', icon: Copy, action: operations.duplicateColumn }
        ]
      },
      { id: 'sep-insert-3', label: '', icon: Divide, separator: true },
      { id: 'insert-header', label: 'Insert Header Row', icon: Crown, action: operations.addHeaderRow },
      { id: 'insert-footer', label: 'Insert Footer Row', icon: Layers, action: operations.addFooterRow },
      { 
        id: 'insert-caption', 
        label: 'Insert Caption', 
        icon: FileText, 
        action: () => {
          const caption = prompt('Enter table caption:');
          if (caption) operations.setTableCaption(caption);
        }
      }
    ]
  },

  // DELETE OPERATIONS
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    submenu: [
      {
        id: 'delete-rows',
        label: 'Delete Rows',
        icon: Minus,
        submenu: [
          { id: 'delete-row-above', label: 'Delete Row Above', icon: ArrowUp, action: operations.deleteRowAbove },
          { id: 'delete-row-below', label: 'Delete Row Below', icon: ArrowDown, action: operations.deleteRowBelow },
          { id: 'delete-current-row', label: 'Delete Current Row', icon: Trash2, action: operations.deleteCurrentRow },
          { id: 'delete-selected-rows', label: 'Delete Selected Rows', icon: Trash2, action: operations.deleteSelectedRows }
        ]
      },
      {
        id: 'delete-columns',
        label: 'Delete Columns',
        icon: Minus,
        submenu: [
          { id: 'delete-column-left', label: 'Delete Column Left', icon: ArrowLeft, action: operations.deleteColumnLeft },
          { id: 'delete-column-right', label: 'Delete Column Right', icon: ArrowRight, action: operations.deleteColumnRight },
          { id: 'delete-current-column', label: 'Delete Current Column', icon: Trash2, action: operations.deleteCurrentColumn },
          { id: 'delete-selected-columns', label: 'Delete Selected Columns', icon: Trash2, action: operations.deleteSelectedColumns }
        ]
      },
      { id: 'sep-delete-1', label: '', icon: Divide, separator: true },
      { id: 'remove-header', label: 'Remove Header Row', icon: Crown, action: operations.removeHeaderRow },
      { id: 'remove-footer', label: 'Remove Footer Row', icon: Layers, action: operations.removeFooterRow },
      { id: 'remove-caption', label: 'Remove Caption', icon: FileText, action: operations.removeTableCaption }
    ]
  },

  { id: 'sep-main-1', label: '', icon: Divide, separator: true },

  // SELECTION OPERATIONS
  {
    id: 'select',
    label: 'Select',
    icon: Target,
    submenu: [
      { id: 'select-row', label: 'Select Row', icon: RowsIcon, action: operations.selectRow },
      { id: 'select-column', label: 'Select Column', icon: ColumnsIcon, action: operations.selectColumn },
      { id: 'select-table', label: 'Select Entire Table', icon: Table, action: operations.selectTable },
      { id: 'sep-select-1', label: '', icon: Divide, separator: true },
      {
        id: 'select-range',
        label: 'Select Range...',
        icon: Grid3X3,
        action: () => {
          // TODO: Implement range selection dialog
          console.log('Select range dialog');
        }
      }
    ]
  },

  // MOVE OPERATIONS
  {
    id: 'move',
    label: 'Move',
    icon: Move,
    submenu: [
      { id: 'move-row-up', label: 'Move Row Up', icon: ArrowUp, action: operations.moveRowUp },
      { id: 'move-row-down', label: 'Move Row Down', icon: ArrowDown, action: operations.moveRowDown },
      { id: 'sep-move-1', label: '', icon: Divide, separator: true },
      { id: 'move-column-left', label: 'Move Column Left', icon: ArrowLeft, action: operations.moveColumnLeft },
      { id: 'move-column-right', label: 'Move Column Right', icon: ArrowRight, action: operations.moveColumnRight }
    ]
  },

  // MERGE & SPLIT OPERATIONS
  {
    id: 'merge-split',
    label: 'Merge & Split',
    icon: Merge,
    submenu: [
      { id: 'merge-cells', label: 'Merge Selected Cells', icon: Merge, action: operations.mergeCells },
      { id: 'merge-right', label: 'Merge Right', icon: ArrowRight, action: operations.mergeRight },
      { id: 'merge-down', label: 'Merge Down', icon: ArrowDown, action: operations.mergeDown },
      { id: 'sep-merge-1', label: '', icon: Divide, separator: true },
      { 
        id: 'split-cell', 
        label: 'Split Cell...', 
        icon: Split, 
        action: () => {
          const rows = parseInt(prompt('Number of rows:') || '1');
          const cols = parseInt(prompt('Number of columns:') || '1');
          if (rows > 0 && cols > 0) operations.splitCell(rows, cols);
        }
      }
    ]
  },

  { id: 'sep-main-2', label: '', icon: Divide, separator: true },

  // COLOR & FORMATTING
  {
    id: 'formatting',
    label: 'Formatting',
    icon: Brush,
    submenu: [
      {
        id: 'alignment',
        label: 'Alignment',
        icon: AlignCenter,
        submenu: [
          { id: 'align-left', label: 'Align Left', icon: AlignLeft, action: () => operations.setCellAlignment('left', 'middle') },
          { id: 'align-center', label: 'Align Center', icon: AlignCenter, action: () => operations.setCellAlignment('center', 'middle') },
          { id: 'align-right', label: 'Align Right', icon: AlignRight, action: () => operations.setCellAlignment('right', 'middle') },
          { id: 'align-justify', label: 'Justify', icon: AlignJustify, action: () => operations.setCellAlignment('left', 'middle') },
          { id: 'sep-align-1', label: '', icon: Divide, separator: true },
          { id: 'valign-top', label: 'Vertical Align Top', icon: ArrowUp, action: () => operations.setCellAlignment('left', 'top') },
          { id: 'valign-middle', label: 'Vertical Align Middle', icon: Minus, action: () => operations.setCellAlignment('left', 'middle') },
          { id: 'valign-bottom', label: 'Vertical Align Bottom', icon: ArrowDown, action: () => operations.setCellAlignment('left', 'bottom') }
        ]
      },
      {
        id: 'borders',
        label: 'Borders',
        icon: Grid3X3,
        submenu: [
          { id: 'border-all', label: 'All Borders', icon: Grid3X3, action: () => operations.setBorders({ width: 1, style: 'solid', color: '#000000' }, ['top', 'right', 'bottom', 'left']) },
          { id: 'border-outside', label: 'Outside Borders', icon: Grid3X3, action: () => operations.setBorders({ width: 1, style: 'solid', color: '#000000' }, ['top', 'right', 'bottom', 'left']) },
          { id: 'border-inside', label: 'Inside Borders', icon: Grid3X3, action: () => operations.setBorders({ width: 1, style: 'solid', color: '#000000' }, ['top', 'right', 'bottom', 'left']) },
          { id: 'sep-border-1', label: '', icon: Divide, separator: true },
          { id: 'remove-borders', label: 'Remove All Borders', icon: Minimize, action: operations.removeBorders }
        ]
      },
      { id: 'sep-format-1', label: '', icon: Divide, separator: true },
      { id: 'clear-content', label: 'Clear Content', icon: Trash2, action: operations.clearCellContent },
      { id: 'clear-formatting', label: 'Clear Formatting', icon: RotateCcw, action: operations.clearCellFormatting }
    ]
  },

  // TABLE THEMES
  {
    id: 'themes',
    label: 'Table Themes',
    icon: Zap,
    submenu: [
      { id: 'theme-light', label: 'Light Theme', icon: Eye, action: () => operations.applyTableTheme('light') },
      { id: 'theme-dark', label: 'Dark Theme', icon: EyeOff, action: () => operations.applyTableTheme('dark') },
      { id: 'theme-colorful', label: 'Colorful Theme', icon: Palette, action: () => operations.applyTableTheme('colorful') },
      { id: 'theme-minimal', label: 'Minimal Theme', icon: Minimize, action: () => operations.applyTableTheme('minimal') },
      { id: 'theme-professional', label: 'Professional Theme', icon: Settings, action: () => operations.applyTableTheme('professional') },
      { id: 'sep-theme-1', label: '', icon: Divide, separator: true },
      { id: 'toggle-alt-rows', label: 'Toggle Alternating Rows', icon: RowsIcon, action: operations.toggleAlternatingRowColors },
      { id: 'toggle-alt-cols', label: 'Toggle Alternating Columns', icon: ColumnsIcon, action: operations.toggleAlternatingColumnColors }
    ]
  },

  { id: 'sep-main-3', label: '', icon: Divide, separator: true },

  // DATA OPERATIONS
  {
    id: 'data',
    label: 'Data Operations',
    icon: Database,
    submenu: [
      {
        id: 'sort',
        label: 'Sort',
        icon: SortAsc,
        submenu: [
          { 
            id: 'sort-asc', 
            label: 'Sort Ascending', 
            icon: SortAsc, 
            action: () => {
              const col = parseInt(prompt('Column index to sort by:') || '0');
              operations.sortTableByColumn(col, true);
            }
          },
          { 
            id: 'sort-desc', 
            label: 'Sort Descending', 
            icon: SortDesc, 
            action: () => {
              const col = parseInt(prompt('Column index to sort by:') || '0');
              operations.sortTableByColumn(col, false);
            }
          }
        ]
      },
      {
        id: 'filter',
        label: 'Filter',
        icon: Filter,
        submenu: [
          { 
            id: 'apply-filter', 
            label: 'Apply Filter...', 
            icon: Filter, 
            action: () => {
              const col = parseInt(prompt('Column index to filter:') || '0');
              const value = prompt('Filter value:') || '';
              operations.filterTable(col, value);
            }
          },
          { id: 'clear-filter', label: 'Clear Filter', icon: RotateCcw, action: operations.clearFilter }
        ]
      },
      { id: 'sep-data-1', label: '', icon: Divide, separator: true },
      {
        id: 'calculate',
        label: 'Calculate',
        icon: Calculator,
        submenu: [
          { 
            id: 'sum', 
            label: 'Sum Range...', 
            icon: Plus, 
            action: () => {
              // TODO: Implement range selection for calculation
              console.log('Sum calculation');
            }
          },
          { 
            id: 'average', 
            label: 'Average Range...', 
            icon: Calculator, 
            action: () => {
              // TODO: Implement range selection for calculation
              console.log('Average calculation');
            }
          },
          { 
            id: 'insert-formula', 
            label: 'Insert Formula...', 
            icon: FileText, 
            action: () => {
              const formula = prompt('Enter formula:');
              if (formula) operations.insertFormula(formula);
            }
          }
        ]
      }
    ]
  },

  // LAYOUT & SIZE
  {
    id: 'layout',
    label: 'Layout & Size',
    icon: Maximize,
    submenu: [
      { id: 'autofit-columns', label: 'AutoFit Columns', icon: ColumnsIcon, action: operations.autoFitColumns },
      { id: 'autofit-table', label: 'AutoFit Table', icon: Table, action: operations.autoFitTable },
      { id: 'distribute-rows', label: 'Distribute Rows Evenly', icon: RowsIcon, action: operations.distributeRowsEvenly },
      { id: 'distribute-columns', label: 'Distribute Columns Evenly', icon: ColumnsIcon, action: operations.distributeColumnsEvenly },
      { id: 'sep-layout-1', label: '', icon: Divide, separator: true },
      { 
        id: 'set-column-width', 
        label: 'Set Column Width...', 
        icon: ColumnsIcon, 
        action: () => {
          const width = prompt('Enter column width (px or auto):');
          if (width) {
            const numWidth = parseInt(width);
            operations.setColumnWidth(isNaN(numWidth) ? 'auto' : numWidth);
          }
        }
      },
      { 
        id: 'set-row-height', 
        label: 'Set Row Height...', 
        icon: RowsIcon, 
        action: () => {
          const height = prompt('Enter row height (px or auto):');
          if (height) {
            const numHeight = parseInt(height);
            operations.setRowHeight(isNaN(numHeight) ? 'auto' : numHeight);
          }
        }
      },
      { 
        id: 'set-table-width', 
        label: 'Set Table Width...', 
        icon: Table, 
        action: () => {
          const width = prompt('Enter table width (px, %, or auto):');
          if (width) operations.setTableWidth(width);
        }
      },
      { id: 'sep-layout-2', label: '', icon: Divide, separator: true },
      { id: 'align-table-left', label: 'Align Table Left', icon: AlignLeft, action: () => operations.setTableAlignment('left') },
      { id: 'align-table-center', label: 'Align Table Center', icon: AlignCenter, action: () => operations.setTableAlignment('center') },
      { id: 'align-table-right', label: 'Align Table Right', icon: AlignRight, action: () => operations.setTableAlignment('right') }
    ]
  },

  { id: 'sep-main-4', label: '', icon: Divide, separator: true },

  // CONVERSION & STRUCTURE
  {
    id: 'conversion',
    label: 'Conversion & Structure',
    icon: RotateCcw,
    submenu: [
      { id: 'row-to-header', label: 'Convert First Row to Header', icon: Crown, action: operations.convertFirstRowToHeader },
      { id: 'header-to-row', label: 'Convert Header to Row', icon: RowsIcon, action: operations.convertHeaderToRow },
      { id: 'sep-convert-1', label: '', icon: Divide, separator: true },
      { 
        id: 'table-to-text', 
        label: 'Convert to Text...', 
        icon: FileText, 
        action: () => {
          const delimiter = prompt('Enter delimiter (default: tab):', '\t') || '\t';
          const text = operations.convertTableToText(delimiter);
          navigator.clipboard.writeText(text);
          alert('Table copied as text to clipboard');
        }
      },
      { 
        id: 'text-to-table', 
        label: 'Convert Text to Table...', 
        icon: Table, 
        action: async () => {
          try {
            const text = await navigator.clipboard.readText();
            const delimiter = prompt('Enter delimiter:', '\t') || '\t';
            const rows = parseInt(prompt('Max rows:') || '10');
            const cols = parseInt(prompt('Max columns:') || '5');
            operations.convertTextToTable(text, delimiter, rows, cols);
          } catch (err) {
            alert('Failed to read clipboard');
          }
        }
      }
    ]
  },

  // CLIPBOARD OPERATIONS
  {
    id: 'clipboard',
    label: 'Clipboard',
    icon: Clipboard,
    submenu: [
      { 
        id: 'copy-cell', 
        label: 'Copy Cell', 
        icon: Copy, 
        action: () => {
          const table = operations.findTable();
          if (!table) return;
          const cell = table.querySelector('td:focus, th:focus') as HTMLTableCellElement;
          if (cell) {
            navigator.clipboard.writeText(cell.textContent || '');
          }
        }
      },
      { 
        id: 'cut-cell', 
        label: 'Cut Cell', 
        icon: Scissors, 
        action: () => {
          const table = operations.findTable();
          if (!table) return;
          const cell = table.querySelector('td:focus, th:focus') as HTMLTableCellElement;
          if (cell) {
            navigator.clipboard.writeText(cell.textContent || '');
            cell.textContent = '';
          }
        }
      },
      { 
        id: 'paste-cell', 
        label: 'Paste Cell', 
        icon: Clipboard, 
        action: async () => {
          const table = operations.findTable();
          if (!table) return;
          const cell = table.querySelector('td:focus, th:focus') as HTMLTableCellElement;
          if (cell) {
            try {
              const text = await navigator.clipboard.readText();
              cell.textContent = text;
            } catch (err) {
              console.warn('Failed to paste:', err);
            }
          }
        }
      }
    ]
  },

  // IMPORT/EXPORT
  {
    id: 'import-export',
    label: 'Import/Export',
    icon: Database,
    submenu: [
      { 
        id: 'export-csv', 
        label: 'Export as CSV', 
        icon: Download, 
        action: () => {
          const csv = operations.exportTableAsCSV();
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'table.csv';
          a.click();
          URL.revokeObjectURL(url);
        }
      },
      { 
        id: 'export-json', 
        label: 'Export as JSON', 
        icon: Download, 
        action: () => {
          const json = operations.exportTableAsJSON();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'table.json';
          a.click();
          URL.revokeObjectURL(url);
        }
      },
      { id: 'sep-export-1', label: '', icon: Divide, separator: true },
      { 
        id: 'import-csv', 
        label: 'Import from CSV', 
        icon: Upload, 
        action: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.csv';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const csv = e.target?.result as string;
                operations.importFromCSV(csv);
              };
              reader.readAsText(file);
            }
          };
          input.click();
        }
      }
    ]
  },

  { id: 'sep-main-5', label: '', icon: Divide, separator: true },

  // ACCESSIBILITY & PROPERTIES
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: Eye,
    submenu: [
      { id: 'set-headers-row', label: 'Set Row Headers', icon: RowsIcon, action: () => operations.setTableHeaders('row') },
      { id: 'set-headers-column', label: 'Set Column Headers', icon: ColumnsIcon, action: () => operations.setTableHeaders('column') },
      { id: 'set-headers-both', label: 'Set Both Headers', icon: Grid3X3, action: () => operations.setTableHeaders('both') },
      { id: 'sep-access-1', label: '', icon: Divide, separator: true },
      { id: 'add-scope', label: 'Add Table Scope', icon: Target, action: operations.addTableScope },
      { 
        id: 'set-summary', 
        label: 'Set Table Summary...', 
        icon: FileText, 
        action: () => {
          const summary = prompt('Enter table summary for screen readers:');
          if (summary) operations.setTableSummary(summary);
        }
      }
    ]
  },

  // TABLE PROPERTIES
  {
    id: 'properties',
    label: 'Table Properties',
    icon: Settings,
    submenu: [
      { 
        id: 'table-info', 
        label: 'Table Information', 
        icon: FileText, 
        action: () => {
          const table = operations.findTable();
          if (table) {
            const rows = table.rows.length;
            const cols = table.rows[0]?.cells.length || 0;
            alert(`Table: ${rows} rows × ${cols} columns`);
          }
        }
      },
      { id: 'sep-props-1', label: '', icon: Divide, separator: true },
      { 
        id: 'set-padding', 
        label: 'Set Cell Padding...', 
        icon: Maximize, 
        action: () => {
          const padding = parseInt(prompt('Enter cell padding (px):') || '8');
          operations.setCellPadding(padding);
        }
      },
      { 
        id: 'table-role', 
        label: 'Set Table Role...', 
        icon: Crown, 
        action: () => {
          const role = prompt('Enter table role:') || 'table';
          operations.setTableRole(role);
        }
      }
    ]
  },

  { id: 'sep-main-6', label: '', icon: Divide, separator: true },

  // ADVANCED OPTIONS
  {
    id: 'advanced',
    label: 'Advanced',
    icon: MoreVertical,
    submenu: [
      { 
        id: 'batch-operations', 
        label: 'Batch Operations...', 
        icon: Zap, 
        action: () => {
          alert('Batch operations dialog would open here');
        }
      },
      { 
        id: 'table-wizard', 
        label: 'Table Wizard...', 
        icon: Settings, 
        action: () => {
          alert('Table wizard would open here');
        }
      },
      { 
        id: 'custom-styles', 
        label: 'Custom Styles...', 
        icon: Brush, 
        action: () => {
          alert('Custom styles dialog would open here');
        }
      }
    ]
  }
];