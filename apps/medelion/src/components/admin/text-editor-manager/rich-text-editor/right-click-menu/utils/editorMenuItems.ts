import { 
  Copy, 
  Scissors, 
  Clipboard,
  Trash2,
  MousePointer,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Type,
  Search,
  FileText,
  RefreshCw,
  Divide
} from 'lucide-react';
import { ContextMenuItem } from '../types';
import { EditorOperations } from './editorOperations';

export const createEditorContextMenuItems = (operations: EditorOperations): ContextMenuItem[] => [
  // CLIPBOARD OPERATIONS
  {
    id: 'clipboard',
    label: 'Clipboard',
    icon: Clipboard,
    submenu: [
      { 
        id: 'copy', 
        label: 'Copy', 
        icon: Copy, 
        action: () => operations.copy()
      },
      { 
        id: 'cut', 
        label: 'Cut', 
        icon: Scissors, 
        action: () => operations.cut()
      },
      { 
        id: 'paste', 
        label: 'Paste', 
        icon: Clipboard, 
        action: () => operations.paste()
      }
    ]
  },

  { id: 'sep-1', label: '', icon: Divide, separator: true },

  // TEXT OPERATIONS
  {
    id: 'text-ops',
    label: 'Text Operations',
    icon: Type,
    submenu: [
      { 
        id: 'delete', 
        label: 'Delete', 
        icon: Trash2, 
        action: () => operations.delete()
      },
      { 
        id: 'select-all', 
        label: 'Select All', 
        icon: MousePointer, 
        action: () => operations.selectAll()
      },
      { id: 'sep-text-1', label: '', icon: Divide, separator: true },
      { 
        id: 'uppercase', 
        label: 'UPPERCASE', 
        icon: Type, 
        action: () => operations.uppercase()
      },
      { 
        id: 'lowercase', 
        label: 'lowercase', 
        icon: Type, 
        action: () => operations.lowercase()
      },
      { 
        id: 'capitalize', 
        label: 'Capitalize Words', 
        icon: Type, 
        action: () => operations.capitalize()
      }
    ]
  },

  { id: 'sep-2', label: '', icon: Divide, separator: true },

  // FORMATTING
  {
    id: 'formatting',
    label: 'Formatting',
    icon: Bold,
    submenu: [
      { 
        id: 'bold', 
        label: 'Bold', 
        icon: Bold, 
        action: () => operations.bold()
      },
      { 
        id: 'italic', 
        label: 'Italic', 
        icon: Italic, 
        action: () => operations.italic()
      },
      { 
        id: 'underline', 
        label: 'Underline', 
        icon: Underline, 
        action: () => operations.underline()
      },
      { id: 'sep-format-1', label: '', icon: Divide, separator: true },
      { 
        id: 'clear-formatting', 
        label: 'Clear Formatting', 
        icon: RefreshCw, 
        action: () => operations.clearFormatting()
      }
    ]
  },

  { id: 'sep-3', label: '', icon: Divide, separator: true },

  // HISTORY
  {
    id: 'history',
    label: 'History',
    icon: Undo,
    submenu: [
      { 
        id: 'undo', 
        label: 'Undo', 
        icon: Undo, 
        action: () => operations.undo()
      },
      { 
        id: 'redo', 
        label: 'Redo', 
        icon: Redo, 
        action: () => operations.redo()
      }
    ]
  },

  { id: 'sep-4', label: '', icon: Divide, separator: true },

  // TOOLS
  {
    id: 'tools',
    label: 'Tools',
    icon: Search,
    submenu: [
      { 
        id: 'find-replace', 
        label: 'Find & Replace', 
        icon: Search, 
        action: () => operations.findReplace()
      },
      { 
        id: 'word-count', 
        label: 'Word Count', 
        icon: FileText, 
        action: () => operations.wordCount()
      }
    ]
  }
];