import { ContextMenuItem } from '../components/AdvancedContextMenu';
import {
  Copy, Scissors, Clipboard, ClipboardCheck, ClipboardType,
  Bold, Italic, Underline, Strikethrough, Type, Palette,
  Link, Unlink, Image, Table, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Indent, Outdent, Quote, Code, Hash,
  Search, Replace, Shell, Languages,
  MoreHorizontal, ChevronRight, Check,
  FileText, Download, Share2, Printer,
  Undo, Redo, Trash2, Edit3,
  Plus, Minus, RotateCw, Settings,
  Bookmark, Flag, MessageSquare, User,
  Calendar, Clock, MapPin, Phone,
  Mail, Globe, Shield, Lock,
  Rows, Columns, Grid, Move,
  PaintBucket, Square, X,
  ArrowUp, ArrowDown, Filter,
  Merge, Split, CornerDownRight
} from 'lucide-react';

export interface EditorOperationsAdvanced {
  // Clipboard operations
  copy: () => void;
  copyWithFormatting: () => void;
  cut: () => void;
  paste: () => void;
  pasteWithFormatting: () => void;
  
  // Text formatting
  bold: () => void;
  italic: () => void;
  underline: () => void;
  strikethrough: () => void;
  
  // Paragraph formatting
  alignLeft: () => void;
  alignCenter: () => void;
  alignRight: () => void;
  alignJustify: () => void;
  
  // Lists
  bulletList: () => void;
  numberedList: () => void;
  indent: () => void;
  outdent: () => void;
  
  // Content insertion
  insertLink: () => void;
  insertImage: () => void;
  insertTable: () => void;
  insertQuote: () => void;
  
  // Advanced operations
  find: () => void;
  replace: () => void;
  spellCheck: () => void;
  translate: () => void;
  
  // Document operations
  print: () => void;
  share: () => void;
  export: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
}

export interface TableOperationsAdvanced {
  // Clipboard operations (for cell content)
  copy: () => void;
  copyWithFormatting: () => void;
  cut: () => void;
  paste: () => void;
  pasteWithFormatting: () => void;
  
  // Row operations
  insertRowAbove: () => void;
  insertRowBelow: () => void;
  deleteRow: () => void;
  duplicateRow: () => void;
  
  // Column operations
  insertColumnLeft: () => void;
  insertColumnRight: () => void;
  deleteColumn: () => void;
  duplicateColumn: () => void;
  
  // Cell operations
  mergeCells: () => void;
  splitCell: () => void;
  clearCell: () => void;
  
  // Table structure
  deleteTable: () => void;
  tableProperties: () => void;
  
  // Formatting
  cellBackground: () => void;
  cellBorders: () => void;
  cellAlignment: () => void;
  
  // Data operations
  sortAscending: () => void;
  sortDescending: () => void;
  filterData: () => void;
  
  // Advanced
  convertToText: () => void;
  exportTable: () => void;
}

export const createEditorContextMenu = (operations: EditorOperationsAdvanced): ContextMenuItem[] => [
  // Quick Actions
  {
    id: 'copy',
    label: 'Copy',
    icon: Copy,
    shortcut: 'Ctrl+C',
    action: operations.copy
  },
  {
    id: 'copyWithFormatting',
    label: 'Copy with formatting',
    icon: ClipboardType,
    shortcut: 'Ctrl+Shift+C',
    action: operations.copyWithFormatting
  },
  {
    id: 'cut',
    label: 'Cut',
    icon: Scissors,
    shortcut: 'Ctrl+X',
    action: operations.cut
  },
  {
    id: 'paste',
    label: 'Paste',
    icon: Clipboard,
    shortcut: 'Ctrl+V',
    action: operations.paste
  },
  {
    id: 'pasteWithFormatting',
    label: 'Paste with formatting',
    icon: ClipboardType,
    shortcut: 'Ctrl+Shift+V',
    action: operations.pasteWithFormatting
  },
  { id: 'divider1', label: '', divider: true },
  
  // Text Formatting
  {
    id: 'formatting',
    label: 'Text Formatting',
    icon: Type,
    submenu: [
      {
        id: 'bold',
        label: 'Bold',
        icon: Bold,
        shortcut: 'Ctrl+B',
        action: operations.bold
      },
      {
        id: 'italic',
        label: 'Italic',
        icon: Italic,
        shortcut: 'Ctrl+I',
        action: operations.italic
      },
      {
        id: 'underline',
        label: 'Underline',
        icon: Underline,
        shortcut: 'Ctrl+U',
        action: operations.underline
      },
      {
        id: 'strikethrough',
        label: 'Strikethrough',
        icon: Strikethrough,
        action: operations.strikethrough
      }
    ]
  },
  
  // Paragraph Formatting
  {
    id: 'paragraph',
    label: 'Paragraph',
    icon: AlignLeft,
    submenu: [
      {
        id: 'align-left',
        label: 'Align Left',
        icon: AlignLeft,
        shortcut: 'Ctrl+L',
        action: operations.alignLeft
      },
      {
        id: 'align-center',
        label: 'Align Center',
        icon: AlignCenter,
        shortcut: 'Ctrl+E',
        action: operations.alignCenter
      },
      {
        id: 'align-right',
        label: 'Align Right',
        icon: AlignRight,
        shortcut: 'Ctrl+R',
        action: operations.alignRight
      },
      {
        id: 'align-justify',
        label: 'Justify',
        icon: AlignJustify,
        shortcut: 'Ctrl+J',
        action: operations.alignJustify
      },
      { id: 'para-divider', label: '', divider: true },
      {
        id: 'bullet-list',
        label: 'Bullet List',
        icon: List,
        action: operations.bulletList
      },
      {
        id: 'numbered-list',
        label: 'Numbered List',
        icon: ListOrdered,
        action: operations.numberedList
      },
      {
        id: 'indent',
        label: 'Increase Indent',
        icon: Indent,
        shortcut: 'Tab',
        action: operations.indent
      },
      {
        id: 'outdent',
        label: 'Decrease Indent',
        icon: Outdent,
        shortcut: 'Shift+Tab',
        action: operations.outdent
      }
    ]
  },
  
  // Insert Content
  {
    id: 'insert',
    label: 'Insert',
    icon: Plus,
    submenu: [
      {
        id: 'insert-link',
        label: 'Link',
        icon: Link,
        shortcut: 'Ctrl+K',
        action: operations.insertLink
      },
      {
        id: 'insert-image',
        label: 'Image',
        icon: Image,
        action: operations.insertImage
      },
      {
        id: 'insert-table',
        label: 'Table',
        icon: Table,
        action: operations.insertTable
      },
      {
        id: 'insert-quote',
        label: 'Quote',
        icon: Quote,
        action: operations.insertQuote
      }
    ]
  },
  
  { id: 'divider2', label: '', divider: true },
  
  // Tools
  {
    id: 'tools',
    label: 'Tools',
    icon: Settings,
    submenu: [
      {
        id: 'find',
        label: 'Find & Replace',
        icon: Search,
        shortcut: 'Ctrl+F',
        action: operations.find
      },
      {
        id: 'spell-check',
        label: 'Spell Check',
        icon: Shell,
        shortcut: 'F7',
        action: operations.spellCheck
      },
      {
        id: 'translate',
        label: 'Translate',
        icon: Languages,
        action: operations.translate
      }
    ]
  },
  
  // Document Actions
  {
    id: 'document',
    label: 'Document',
    icon: FileText,
    submenu: [
      {
        id: 'print',
        label: 'Print',
        icon: Printer,
        shortcut: 'Ctrl+P',
        action: operations.print
      },
      {
        id: 'share',
        label: 'Share',
        icon: Share2,
        action: operations.share
      },
      {
        id: 'export',
        label: 'Export',
        icon: Download,
        action: operations.export
      }
    ]
  },
  
  { id: 'divider3', label: '', divider: true },
  
  // History
  {
    id: 'undo',
    label: 'Undo',
    icon: Undo,
    shortcut: 'Ctrl+Z',
    action: operations.undo
  },
  {
    id: 'redo',
    label: 'Redo',
    icon: Redo,
    shortcut: 'Ctrl+Y',
    action: operations.redo
  }
];

export const createTableContextMenu = (operations: TableOperationsAdvanced): ContextMenuItem[] => [
  // Quick Actions
  {
    id: 'copy',
    label: 'Copy',
    icon: Copy,
    shortcut: 'Ctrl+C',
    action: operations.copy
  },
  {
    id: 'copyWithFormatting',
    label: 'Copy with formatting',
    icon: ClipboardType,
    shortcut: 'Ctrl+Shift+C',
    action: operations.copyWithFormatting
  },
  {
    id: 'cut',
    label: 'Cut',
    icon: Scissors,
    shortcut: 'Ctrl+X',
    action: operations.cut
  },
  {
    id: 'paste',
    label: 'Paste',
    icon: Clipboard,
    shortcut: 'Ctrl+V',
    action: operations.paste
  },
  {
    id: 'pasteWithFormatting',
    label: 'Paste with formatting',
    icon: ClipboardType,
    shortcut: 'Ctrl+Shift+V',
    action: operations.pasteWithFormatting
  },
  { id: 'divider-clipboard', label: '', divider: true },
  
  // Row Operations
  {
    id: 'row-operations',
    label: 'Row Operations',
    icon: Rows,
    submenu: [
      {
        id: 'insert-row-above',
        label: 'Insert Row Above',
        icon: Plus,
        action: operations.insertRowAbove
      },
      {
        id: 'insert-row-below',
        label: 'Insert Row Below',
        icon: Plus,
        action: operations.insertRowBelow
      },
      {
        id: 'duplicate-row',
        label: 'Duplicate Row',
        icon: Copy,
        action: operations.duplicateRow
      },
      { id: 'row-divider', label: '', divider: true },
      {
        id: 'delete-row',
        label: 'Delete Row',
        icon: Trash2,
        destructive: true,
        action: operations.deleteRow
      }
    ]
  },
  
  // Column Operations
  {
    id: 'column-operations',
    label: 'Column Operations',
    icon: Columns,
    submenu: [
      {
        id: 'insert-column-left',
        label: 'Insert Column Left',
        icon: Plus,
        action: operations.insertColumnLeft
      },
      {
        id: 'insert-column-right',
        label: 'Insert Column Right',
        icon: Plus,
        action: operations.insertColumnRight
      },
      {
        id: 'duplicate-column',
        label: 'Duplicate Column',
        icon: Copy,
        action: operations.duplicateColumn
      },
      { id: 'col-divider', label: '', divider: true },
      {
        id: 'delete-column',
        label: 'Delete Column',
        icon: Trash2,
        destructive: true,
        action: operations.deleteColumn
      }
    ]
  },
  
  // Cell Operations
  {
    id: 'cell-operations',
    label: 'Cell Operations',
    icon: Grid,
    submenu: [
      {
        id: 'merge-cells',
        label: 'Merge Cells',
        icon: Merge,
        action: operations.mergeCells
      },
      {
        id: 'split-cell',
        label: 'Split Cell',
        icon: Split,
        action: operations.splitCell
      },
      {
        id: 'clear-cell',
        label: 'Clear Cell',
        icon: Trash2,
        action: operations.clearCell
      }
    ]
  },
  
  { id: 'divider1', label: '', divider: true },
  
  // Formatting
  {
    id: 'cell-formatting',
    label: 'Cell Formatting',
    icon: Palette,
    submenu: [
      {
        id: 'cell-background',
        label: 'Background Color',
        icon: PaintBucket,
        action: operations.cellBackground
      },
      {
        id: 'cell-borders',
        label: 'Borders',
        icon: Square,
        action: operations.cellBorders
      },
      {
        id: 'cell-alignment',
        label: 'Text Alignment',
        icon: AlignCenter,
        action: operations.cellAlignment
      }
    ]
  },
  
  // Data Operations
  {
    id: 'data-operations',
    label: 'Data Operations',
    icon: CornerDownRight,
    submenu: [
      {
        id: 'sort-ascending',
        label: 'Sort Ascending',
        icon: ArrowUp,
        action: operations.sortAscending
      },
      {
        id: 'sort-descending',
        label: 'Sort Descending',
        icon: ArrowDown,
        action: operations.sortDescending
      },
      {
        id: 'filter-data',
        label: 'Filter Data',
        icon: Filter,
        action: operations.filterData
      }
    ]
  },
  
  { id: 'divider2', label: '', divider: true },
  
  // Table Management
  {
    id: 'table-properties',
    label: 'Table Properties',
    icon: Settings,
    action: operations.tableProperties
  },
  {
    id: 'convert-to-text',
    label: 'Convert to Text',
    icon: Type,
    action: operations.convertToText
  },
  {
    id: 'export-table',
    label: 'Export Table',
    icon: Download,
    action: operations.exportTable
  },
  
  { id: 'divider3', label: '', divider: true },
  
  // Destructive Actions
  {
    id: 'delete-table',
    label: 'Delete Table',
    icon: Trash2,
    destructive: true,
    action: operations.deleteTable
  }
];