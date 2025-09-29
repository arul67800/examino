import { EditorTool, ToolbarGroup } from '../types';
import {
  Bold, Italic, Underline, Strikethrough, Code, Quote, List, ListOrdered,
  Link, Image, Video, Table, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Eye, Edit, Columns, Maximize2, Minimize2, Search, Settings,
  ChevronDown, Plus, Trash2, Edit3, Type, Palette, Monitor, Tablet, Smartphone,
  FileText, Save, Download, Upload, Share2, Hash, AtSign, Calendar, Clock,
  MapPin, Star, Bookmark, Flag, Bell, Camera, Film, Music, Paperclip
} from 'lucide-react';

// Color palettes
export const COLOR_PALETTES = {
  basic: [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#c0c0c0', '#808080'
  ],
  extended: [
    '#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff', '#99ffff', '#ffcc99', '#cc99ff',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f',
    '#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#95a5a6'
  ],
  professional: [
    '#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#ecf0f1',
    '#e74c3c', '#c0392b', '#d35400', '#e67e22', '#f39c12', '#f1c40f',
    '#27ae60', '#2ecc71', '#16a085', '#1abc9c', '#2980b9', '#3498db',
    '#8e44ad', '#9b59b6', '#34495e', '#2c3e50'
  ]
};

// Font families
export const FONT_FAMILIES = [
  { name: 'Default', value: 'inherit' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
  { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive, sans-serif' },
  { name: 'Roboto', value: '"Roboto", sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Lato', value: '"Lato", sans-serif' },
  { name: 'Montserrat', value: '"Montserrat", sans-serif' },
  { name: 'Poppins', value: '"Poppins", sans-serif' },
  { name: 'Inter', value: '"Inter", sans-serif' }
];

// Font sizes
export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48, 60, 72];

// Heading options
export const HEADING_OPTIONS = [
  { label: 'Normal Text', value: 'p', level: 0 },
  { label: 'Heading 1', value: 'h1', level: 1 },
  { label: 'Heading 2', value: 'h2', level: 2 },
  { label: 'Heading 3', value: 'h3', level: 3 },
  { label: 'Heading 4', value: 'h4', level: 4 },
  { label: 'Heading 5', value: 'h5', level: 5 },
  { label: 'Heading 6', value: 'h6', level: 6 }
];

// Editor keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  bold: 'Ctrl+B',
  italic: 'Ctrl+I',
  underline: 'Ctrl+U',
  strikethrough: 'Ctrl+Shift+X',
  code: 'Ctrl+E',
  link: 'Ctrl+K',
  save: 'Ctrl+S',
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  selectAll: 'Ctrl+A',
  find: 'Ctrl+F',
  replace: 'Ctrl+H',
  newLine: 'Shift+Enter',
  indent: 'Tab',
  outdent: 'Shift+Tab',
  insertTable: 'Ctrl+Shift+T',
  insertImage: 'Ctrl+Shift+I',
  fullscreen: 'F11',
  preview: 'Ctrl+Shift+P'
};

// Default toolbar groups configuration
export const DEFAULT_TOOLBAR_GROUPS: ToolbarGroup[] = [
  {
    id: 'history',
    name: 'History',
    priority: 1,
    tools: [
      {
        id: 'undo',
        label: 'Undo',
        icon: Undo,
        action: () => {},
        shortcut: KEYBOARD_SHORTCUTS.undo,
        group: 'history',
        tooltip: 'Undo last action'
      },
      {
        id: 'redo',
        label: 'Redo',
        icon: Redo,
        action: () => {},
        shortcut: KEYBOARD_SHORTCUTS.redo,
        group: 'history',
        tooltip: 'Redo last undone action'
      }
    ]
  },
  {
    id: 'formatting',
    name: 'Text Formatting',
    priority: 2,
    tools: [
      {
        id: 'bold',
        label: 'Bold',
        icon: Bold,
        action: () => {},
        shortcut: KEYBOARD_SHORTCUTS.bold,
        group: 'formatting',
        tooltip: 'Make text bold'
      },
      {
        id: 'italic',
        label: 'Italic',
        icon: Italic,
        action: () => {},
        shortcut: KEYBOARD_SHORTCUTS.italic,
        group: 'formatting',
        tooltip: 'Make text italic'
      },
      {
        id: 'underline',
        label: 'Underline',
        icon: Underline,
        action: () => {},
        shortcut: KEYBOARD_SHORTCUTS.underline,
        group: 'formatting',
        tooltip: 'Underline text'
      },
      {
        id: 'strikethrough',
        label: 'Strikethrough',
        icon: Strikethrough,
        action: () => {},
        shortcut: KEYBOARD_SHORTCUTS.strikethrough,
        group: 'formatting',
        tooltip: 'Strike through text'
      },
      {
        id: 'code',
        label: 'Code',
        icon: Code,
        action: () => {},
        shortcut: KEYBOARD_SHORTCUTS.code,
        group: 'formatting',
        tooltip: 'Format as code'
      }
    ]
  },
  {
    id: 'alignment',
    name: 'Text Alignment',
    priority: 3,
    tools: [
      {
        id: 'alignLeft',
        label: 'Align Left',
        icon: AlignLeft,
        action: () => {},
        group: 'alignment',
        tooltip: 'Align text to the left'
      },
      {
        id: 'alignCenter',
        label: 'Align Center',
        icon: AlignCenter,
        action: () => {},
        group: 'alignment',
        tooltip: 'Center text'
      },
      {
        id: 'alignRight',
        label: 'Align Right',
        icon: AlignRight,
        action: () => {},
        group: 'alignment',
        tooltip: 'Align text to the right'
      },
      {
        id: 'alignJustify',
        label: 'Justify',
        icon: AlignJustify,
        action: () => {},
        group: 'alignment',
        tooltip: 'Justify text'
      }
    ]
  },
  {
    id: 'lists',
    name: 'Lists',
    priority: 4,
    tools: [
      {
        id: 'bulletList',
        label: 'Bullet List',
        icon: List,
        action: () => {},
        group: 'lists',
        tooltip: 'Create bullet list'
      },
      {
        id: 'numberedList',
        label: 'Numbered List',
        icon: ListOrdered,
        action: () => {},
        group: 'lists',
        tooltip: 'Create numbered list'
      }
    ]
  },
  {
    id: 'insert',
    name: 'Insert Elements',
    priority: 5,
    tools: [
      {
        id: 'link',
        label: 'Link',
        icon: Link,
        action: () => {},
        shortcut: KEYBOARD_SHORTCUTS.link,
        group: 'insert',
        tooltip: 'Insert link'
      },
      {
        id: 'image',
        label: 'Image',
        icon: Image,
        action: () => {},
        group: 'insert',
        tooltip: 'Insert image'
      },
      {
        id: 'video',
        label: 'Video',
        icon: Video,
        action: () => {},
        group: 'insert',
        tooltip: 'Insert video'
      },
      {
        id: 'table',
        label: 'Table',
        icon: Table,
        action: () => {},
        group: 'insert',
        tooltip: 'Insert table'
      }
    ]
  },
  {
    id: 'view',
    name: 'View Controls',
    priority: 6,
    responsive: {
      hideOnMobile: true
    },
    tools: [
      {
        id: 'preview',
        label: 'Preview',
        icon: Eye,
        action: () => {},
        group: 'view',
        tooltip: 'Toggle preview mode'
      },
      {
        id: 'fullscreen',
        label: 'Fullscreen',
        icon: Maximize2,
        action: () => {},
        group: 'view',
        tooltip: 'Toggle fullscreen mode'
      }
    ]
  }
];

// Media file types and limits
export const MEDIA_CONSTRAINTS = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    extensions: ['.mp4', '.webm', '.ogg']
  },
  audio: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'],
    extensions: ['.mp3', '.wav', '.ogg', '.aac']
  },
  document: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx']
  }
};

// Table default settings
export const TABLE_DEFAULTS = {
  rows: 3,
  columns: 3,
  headerRow: true,
  borderWidth: 1,
  borderColor: '#e2e8f0',
  cellPadding: 8,
  width: '100%',
  alignment: 'left' as const
};

// Auto-save settings
export const AUTO_SAVE_DEFAULTS = {
  interval: 30000, // 30 seconds
  maxHistorySize: 50,
  debounceDelay: 500
};

// Collaboration settings
export const COLLABORATION_DEFAULTS = {
  maxUsers: 10,
  cursorTimeout: 30000, // 30 seconds
  presenceUpdate: 5000, // 5 seconds
  conflictResolution: 'last-write-wins' as const
};

// Export formats
export const EXPORT_FORMATS = [
  { id: 'html', name: 'HTML', extension: '.html', mimeType: 'text/html' },
  { id: 'markdown', name: 'Markdown', extension: '.md', mimeType: 'text/markdown' },
  { id: 'pdf', name: 'PDF', extension: '.pdf', mimeType: 'application/pdf' },
  { id: 'docx', name: 'Word Document', extension: '.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { id: 'txt', name: 'Plain Text', extension: '.txt', mimeType: 'text/plain' }
];

// Language support
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];

// Emoji categories
export const EMOJI_CATEGORIES = [
  { id: 'recent', name: 'Recently Used', icon: '🕒' },
  { id: 'people', name: 'People & Body', icon: '😀' },
  { id: 'nature', name: 'Animals & Nature', icon: '🐶' },
  { id: 'food', name: 'Food & Drink', icon: '🍎' },
  { id: 'activity', name: 'Activities', icon: '⚽' },
  { id: 'travel', name: 'Travel & Places', icon: '🚗' },
  { id: 'objects', name: 'Objects', icon: '💡' },
  { id: 'symbols', name: 'Symbols', icon: '❤️' },
  { id: 'flags', name: 'Flags', icon: '🏁' }
];

// Default editor settings
export const EDITOR_DEFAULTS = {
  placeholder: 'Start writing your content...',
  height: '600px',
  autoSaveInterval: AUTO_SAVE_DEFAULTS.interval,
  maxLength: null,
  spellCheck: true,
  language: 'en',
  showWordCount: true,
  enableCollaboration: false,
  enableVersioning: false,
  theme: 'auto' as const,
  features: {
    tables: true,
    media: true,
    codeBlocks: true,
    mathFormulas: false,
    mentions: false,
    hashtags: false,
    emojis: true
  }
};