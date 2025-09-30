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
  Clipboard
} from 'lucide-react';
import { ContextMenuItem, TableOperations, ColorTarget } from '../types';

export const createContextMenuItems = (
  operations: TableOperations,
  onColorSelect: (target: ColorTarget) => void
): ContextMenuItem[] => [
  {
    id: 'add-row',
    label: 'Add Row',
    icon: Plus,
    submenu: [
      { id: 'add-row-above', label: 'Add Row Above', icon: ArrowUp, action: operations.addRowAbove },
      { id: 'add-row-below', label: 'Add Row Below', icon: ArrowDown, action: operations.addRowBelow }
    ]
  },
  {
    id: 'add-column',
    label: 'Add Column', 
    icon: Plus,
    submenu: [
      { id: 'add-column-left', label: 'Add Column Left', icon: ArrowLeft, action: operations.addColumnLeft },
      { id: 'add-column-right', label: 'Add Column Right', icon: ArrowRight, action: operations.addColumnRight }
    ]
  },
  { id: 'sep1', label: '', icon: Divide, separator: true },
  {
    id: 'delete-row',
    label: 'Delete Row',
    icon: Minus,
    submenu: [
      { id: 'delete-row-above', label: 'Delete Row Above', icon: ArrowUp, action: operations.deleteRowAbove },
      { id: 'delete-row-below', label: 'Delete Row Below', icon: ArrowDown, action: operations.deleteRowBelow },
      { id: 'sep2', label: '', icon: Divide, separator: true },
      { 
        id: 'delete-current-row', 
        label: 'Delete Current Row', 
        icon: Trash2, 
        action: () => {
          const table = operations.findTable();
          if (!table) return;
          const cell = table.querySelector('td:focus, th:focus') as HTMLTableCellElement;
          if (!cell) return;
          const row = cell.closest('tr');
          if (row) row.remove();
        }
      }
    ]
  },
  {
    id: 'delete-column',
    label: 'Delete Column',
    icon: Minus,
    submenu: [
      { id: 'delete-column-left', label: 'Delete Column Left', icon: ArrowLeft, action: operations.deleteColumnLeft },
      { id: 'delete-column-right', label: 'Delete Column Right', icon: ArrowRight, action: operations.deleteColumnRight },
      { id: 'sep3', label: '', icon: Divide, separator: true },
      { 
        id: 'delete-current-column', 
        label: 'Delete Current Column', 
        icon: Trash2, 
        action: () => {
          const table = operations.findTable();
          if (!table) return;
          const cell = table.querySelector('td:focus, th:focus') as HTMLTableCellElement;
          if (!cell) return;
          const { col } = operations.findCellPosition(cell);
          
          const rows = Array.from(table.rows);
          rows.forEach(row => {
            if (row.cells[col]) {
              row.deleteCell(col);
            }
          });
        }
      }
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
        action: () => onColorSelect('header')
      },
      { 
        id: 'color-row', 
        label: 'Color Entire Row', 
        icon: RowsIcon, 
        color: true,
        action: () => onColorSelect('row')
      },
      { 
        id: 'color-alt-rows', 
        label: 'Color Alternative Rows', 
        icon: RowsIcon, 
        color: true,
        action: () => onColorSelect('alt-rows')
      },
      { 
        id: 'color-alt-columns', 
        label: 'Color Alternative Columns', 
        icon: ColumnsIcon, 
        color: true,
        action: () => onColorSelect('alt-columns')
      }
    ]
  },
  { id: 'sep5', label: '', icon: Divide, separator: true },
  {
    id: 'clipboard',
    label: 'Clipboard',
    icon: Clipboard,
    submenu: [
      { 
        id: 'copy', 
        label: 'Copy', 
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
        id: 'cut', 
        label: 'Cut', 
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
        id: 'paste', 
        label: 'Paste', 
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