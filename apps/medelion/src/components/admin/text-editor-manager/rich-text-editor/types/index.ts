export interface EditorContent {
  type: 'text' | 'heading' | 'paragraph' | 'list' | 'table' | 'image' | 'video' | 'code' | 'quote' | 'blockquote' | 'divider';
  content: any;
  attributes?: Record<string, any>;
  id?: string;
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
    author?: string;
  };
}

export interface EditorSelection {
  start: number;
  end: number;
  text: string;
  range?: Range;
}

export interface EditorHistory {
  content: string;
  timestamp: Date;
  operation: string;
}

export interface EditorTheme {
  mode: 'light' | 'dark' | 'auto';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
}

export interface FontStyle {
  family: string;
  size: number;
  weight: number;
  style: 'normal' | 'italic';
  color: string;
  backgroundColor: string;
}

export interface TableCell {
  content: string;
  colspan?: number;
  rowspan?: number;
  style?: React.CSSProperties;
  type: 'th' | 'td';
}

export interface TableRow {
  cells: TableCell[];
  style?: React.CSSProperties;
}

export interface TableData {
  rows: TableRow[];
  caption?: string;
  style?: React.CSSProperties;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ToolbarGroup {
  id: string;
  name: string;
  tools: EditorTool[];
  priority: number;
  responsive?: {
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
  };
}

export interface EditorTool {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  group: string;
  isActive?: boolean;
  isDisabled?: boolean;
  tooltip?: string;
  showLabel?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface EditorState {
  content: string;
  selection: EditorSelection | null;
  history: EditorHistory[];
  historyIndex: number;
  activeFormats: Set<string>;
  currentFont: FontStyle;
  isReadOnly: boolean;
  isDirty: boolean;
  lastSaved?: Date;
}

export interface AdvancedRichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onHTMLChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  readOnly?: boolean;
  showWordCount?: boolean;
  enableCollaboration?: boolean;
  enableVersioning?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  onVideoUpload?: (file: File) => Promise<string>;
  onFileUpload?: (file: File) => Promise<string>;
  onSave?: () => Promise<void>;
  onAutoSave?: (content: string) => Promise<void>;
  autoSaveInterval?: number;
  maxLength?: number;
  spellCheck?: boolean;
  language?: string;
  theme?: EditorTheme;
  customTools?: EditorTool[];
  toolbarGroups?: ToolbarGroup[];
  features?: {
    tables?: boolean;
    media?: boolean;
    codeBlocks?: boolean;
    mathFormulas?: boolean;
    mentions?: boolean;
    hashtags?: boolean;
    emojis?: boolean;
  };
}

export interface EditorRef {
  focus: () => void;
  blur: () => void;
  getContent: () => string;
  getHTML: () => string;
  setContent: (content: string) => void;
  insertText: (text: string) => void;
  insertHTML: (html: string) => void;
  undo: () => void;
  redo: () => void;
  selectAll: () => void;
  getSelection: () => Selection | null;
  formatText: (format: string, value?: string) => void;
  insertImage: (url: string, alt?: string) => void;
  insertTable: (rows: number, cols: number) => void;
  insertLink: (url: string, text?: string) => void;
  save: () => Promise<void>;
  export: (format: 'html' | 'markdown' | 'pdf') => string | Blob;
}

export type EditorMode = 'write' | 'preview' | 'split';
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
export type AlignmentType = 'left' | 'center' | 'right' | 'justify';
export type ListType = 'ordered' | 'unordered' | 'checklist';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: EditorSelection;
}

export interface Comment {
  id: string;
  content: string;
  author: CollaborationUser;
  timestamp: Date;
  resolved: boolean;
  replies?: Comment[];
  position: EditorSelection;
}

export interface Version {
  id: string;
  content: string;
  timestamp: Date;
  author: CollaborationUser;
  message?: string;
  changes: {
    added: number;
    removed: number;
    modified: number;
  };
}