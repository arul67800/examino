'use client';

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useTheme } from '@/theme';
import {
  Bold, Italic, Underline, Strikethrough, Code, Quote, List, ListOrdered,
  Link, Image, Video, Table, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Eye, Edit, Columns, Maximize2, Minimize2, Search, Settings,
  ChevronDown, Plus, Trash2, Edit3, Move, Copy, Scissors, Type, Palette,
  Monitor, Tablet, Smartphone, FileText, Save, Download, Upload, Share2,
  MoreHorizontal, Target, Hash, AtSign, Calendar, Clock, MapPin, Star,
  Bookmark, Flag, Bell, Shield, Lock, Unlock, Camera, Film, Music,
  Paperclip, Zap, Layers, Grid3X3, RotateCw, Crop,
  Volume2, Play, Pause, SkipForward, SkipBack
} from 'lucide-react';

// Types and Interfaces
interface EditorContent {
  type: 'text' | 'heading' | 'paragraph' | 'list' | 'table' | 'image' | 'video' | 'code' | 'quote';
  content: any;
  attributes?: Record<string, any>;
  id?: string;
}

interface AdvancedRichTextEditorProps {
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
  onSave?: () => void;
  onAutoSave?: (content: string) => void;
  autoSaveInterval?: number;
  maxLength?: number;
  spellCheck?: boolean;
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
}

interface EditorRef {
  focus: () => void;
  blur: () => void;
  getContent: () => string;
  getHTML: () => string;
  setContent: (content: string) => void;
  insertText: (text: string) => void;
  undo: () => void;
  redo: () => void;
  selectAll: () => void;
  getSelection: () => Selection | null;
}

// Color Palette
const colorPalette = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#c0c0c0', '#808080',
  '#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff', '#99ffff', '#ffcc99', '#cc99ff',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'
];

// Font families
const fontFamilies = [
  { name: 'Default', value: 'inherit' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
  { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive, sans-serif' }
];

// Font sizes
const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

export const AdvancedRichTextEditor = forwardRef<EditorRef, AdvancedRichTextEditorProps>(({
  content = '',
  onChange,
  onHTMLChange,
  placeholder = 'Start writing your content...',
  className = '',
  height = '600px',
  readOnly = false,
  showWordCount = true,
  enableCollaboration = false,
  enableVersioning = false,
  onImageUpload,
  onVideoUpload,
  onSave,
  onAutoSave,
  autoSaveInterval = 30000,
  maxLength,
  spellCheck = true,
  language = 'en',
  theme: propTheme = 'auto'
}, ref) => {
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Editor State
  const [editorContent, setEditorContent] = useState(content);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mode, setMode] = useState<'write' | 'preview' | 'split'>('write');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showToolbar, setShowToolbar] = useState(true);
  
  // History Management
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Selection and Formatting State
  const [currentSelection, setCurrentSelection] = useState<Range | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [currentFontFamily, setCurrentFontFamily] = useState('inherit');
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentBgColor, setCurrentBgColor] = useState('transparent');
  
  // UI State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
  
  // Statistics
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [readingTime, setReadingTime] = useState(0);
  
  // Auto-save timer
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Calculate statistics
  useEffect(() => {
    const text = editorRef.current?.textContent || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = text.length;
    const lines = text.split('\n').length;
    const avgWordsPerMinute = 200;
    const reading = Math.ceil(words / avgWordsPerMinute);
    
    setWordCount(words);
    setCharCount(chars);
    setLineCount(lines);
    setReadingTime(reading);
  }, [editorContent]);

  // Auto-save functionality
  useEffect(() => {
    if (onAutoSave && autoSaveInterval > 0) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        onAutoSave(editorContent);
      }, autoSaveInterval);
      
      return () => {
        if (autoSaveTimer.current) {
          clearTimeout(autoSaveTimer.current);
        }
      };
    }
  }, [editorContent, onAutoSave, autoSaveInterval]);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current && !readOnly) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.textContent || '';
      
      setEditorContent(text);
      onChange?.(text);
      onHTMLChange?.(html);
      
      // Update history
      if (text !== history[historyIndex]) {
        const newHistory = [...history.slice(0, historyIndex + 1), text];
        if (newHistory.length > 50) { // Limit history size
          newHistory.shift();
        } else {
          setHistoryIndex(newHistory.length - 1);
        }
        setHistory(newHistory);
      }
    }
  }, [onChange, onHTMLChange, history, historyIndex, readOnly]);

  // Update active formats based on selection
  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    setCurrentSelection(range);
    
    // Check for active formatting
    const formats = new Set<string>();
    
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikethrough')) formats.add('strikethrough');
    if (document.queryCommandState('insertOrderedList')) formats.add('orderedList');
    if (document.queryCommandState('insertUnorderedList')) formats.add('unorderedList');
    if (document.queryCommandState('justifyLeft')) formats.add('alignLeft');
    if (document.queryCommandState('justifyCenter')) formats.add('alignCenter');
    if (document.queryCommandState('justifyRight')) formats.add('alignRight');
    if (document.queryCommandState('justifyFull')) formats.add('alignJustify');
    
    setActiveFormats(formats);
    
    // Update font properties
    const computedStyle = window.getComputedStyle(range.commonAncestorContainer.parentElement || document.body);
    setCurrentFontFamily(computedStyle.fontFamily);
    setCurrentFontSize(parseInt(computedStyle.fontSize));
    setCurrentTextColor(computedStyle.color);
    setCurrentBgColor(computedStyle.backgroundColor);
  }, []);

  // Execute editor command
  const execCommand = useCallback((command: string, value?: string) => {
    if (readOnly) return;
    
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateActiveFormats();
    handleContentChange();
  }, [readOnly, updateActiveFormats, handleContentChange]);

  // Formatting commands
  const formatText = useCallback((format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'underline':
        execCommand('underline');
        break;
      case 'strikethrough':
        execCommand('strikethrough');
        break;
      case 'code':
        execCommand('formatBlock', 'pre');
        break;
      case 'superscript':
        execCommand('superscript');
        break;
      case 'subscript':
        execCommand('subscript');
        break;
      case 'removeFormat':
        execCommand('removeFormat');
        break;
    }
  }, [execCommand]);

  // Alignment commands
  const alignText = useCallback((alignment: string) => {
    switch (alignment) {
      case 'left':
        execCommand('justifyLeft');
        break;
      case 'center':
        execCommand('justifyCenter');
        break;
      case 'right':
        execCommand('justifyRight');
        break;
      case 'justify':
        execCommand('justifyFull');
        break;
    }
  }, [execCommand]);

  // List commands
  const createList = useCallback((type: 'ordered' | 'unordered') => {
    execCommand(type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList');
  }, [execCommand]);

  // Heading commands
  const setHeading = useCallback((level: number) => {
    if (level === 0) {
      execCommand('formatBlock', 'p');
    } else {
      execCommand('formatBlock', `h${level}`);
    }
  }, [execCommand]);

  // Insert link
  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  // Insert image
  const insertImage = useCallback(async (file?: File) => {
    if (file && onImageUpload) {
      try {
        const url = await onImageUpload(file);
        execCommand('insertImage', url);
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    } else {
      const url = prompt('Enter image URL:');
      if (url) {
        execCommand('insertImage', url);
      }
    }
  }, [execCommand, onImageUpload]);

  // Insert table
  const insertTable = useCallback((rows: number, cols: number) => {
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.border = `1px solid ${theme.colors.semantic.border.primary}`;
    
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement(i === 0 ? 'th' : 'td');
        cell.style.border = `1px solid ${theme.colors.semantic.border.primary}`;
        cell.style.padding = '8px';
        cell.style.minWidth = '100px';
        cell.contentEditable = 'true';
        cell.textContent = i === 0 ? `Header ${j + 1}` : `Cell ${i},${j + 1}`;
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    
    if (currentSelection) {
      currentSelection.deleteContents();
      currentSelection.insertNode(table);
      handleContentChange();
    }
  }, [currentSelection, handleContentChange, theme.colors.semantic.border.primary]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (editorRef.current) {
        editorRef.current.textContent = history[newIndex];
        onChange?.(history[newIndex]);
      }
    }
  }, [history, historyIndex, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      if (editorRef.current) {
        editorRef.current.textContent = history[newIndex];
        onChange?.(history[newIndex]);
      }
    }
  }, [history, historyIndex, onChange]);

  // Imperative methods
  useImperativeHandle(ref, () => ({
    focus: () => editorRef.current?.focus(),
    blur: () => editorRef.current?.blur(),
    getContent: () => editorRef.current?.textContent || '',
    getHTML: () => editorRef.current?.innerHTML || '',
    setContent: (newContent: string) => {
      if (editorRef.current) {
        editorRef.current.textContent = newContent;
        handleContentChange();
      }
    },
    insertText: (text: string) => {
      if (currentSelection) {
        currentSelection.deleteContents();
        const textNode = document.createTextNode(text);
        currentSelection.insertNode(textNode);
        handleContentChange();
      }
    },
    undo,
    redo,
    selectAll: () => {
      if (editorRef.current) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    },
    getSelection: () => window.getSelection()
  }), [currentSelection, handleContentChange, undo, redo]);

  // Event handlers
  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveFormats]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            formatText('bold');
            break;
          case 'i':
            e.preventDefault();
            formatText('italic');
            break;
          case 'u':
            e.preventDefault();
            formatText('underline');
            break;
          case 'k':
            e.preventDefault();
            insertLink();
            break;
          case 's':
            e.preventDefault();
            onSave?.();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'a':
            e.preventDefault();
            if (typeof ref !== 'function' && ref?.current) {
              ref.current.selectAll();
            }
            break;
        }
      }
    };

    if (editorRef.current) {
      editorRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [formatText, insertLink, onSave, undo, redo, ref]);

  return (
    <div 
      className={`border rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
      style={{ 
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary,
        height: isFullscreen ? '100vh' : height
      }}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach(insertImage);
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onVideoUpload) {
            onVideoUpload(file).then(url => {
              if (currentSelection) {
                const video = document.createElement('video');
                video.src = url;
                video.controls = true;
                video.style.maxWidth = '100%';
                currentSelection.insertNode(video);
                handleContentChange();
              }
            });
          }
        }}
      />

      {/* Toolbar will be added in the next component */}
      
      {/* Editor Content */}
      <div className="flex h-full">
        {(mode === 'write' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2 border-r' : 'w-full'} flex flex-col`} style={{ borderColor: theme.colors.semantic.border.secondary }}>
            <div
              ref={editorRef}
              className="flex-1 p-4 overflow-auto focus:outline-none"
              contentEditable={!readOnly}
              suppressContentEditableWarning
              onInput={handleContentChange}
              onBlur={updateActiveFormats}
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.semantic.text.primary,
                fontFamily: currentFontFamily,
                fontSize: `${currentFontSize}px`,
                lineHeight: 1.6,
                minHeight: '400px'
              }}
              spellCheck={spellCheck}
              lang={language}
            >
              {!content && (
                <div 
                  style={{ 
                    color: theme.colors.semantic.text.tertiary,
                    pointerEvents: 'none'
                  }}
                >
                  {placeholder}
                </div>
              )}
            </div>
          </div>
        )}

        {(mode === 'preview' || mode === 'split') && (
          <div 
            className={`${mode === 'split' ? 'w-1/2' : 'w-full'} p-4 overflow-auto`}
            style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
          >
            <div 
              className="prose max-w-none"
              style={{ 
                color: theme.colors.semantic.text.primary,
                ...(previewDevice === 'tablet' ? { maxWidth: '768px', margin: '0 auto' } :
                   previewDevice === 'mobile' ? { maxWidth: '375px', margin: '0 auto' } : {})
              }}
              dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || '' }}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div 
        className="border-t px-4 py-2 flex items-center justify-between text-sm"
        style={{ 
          borderColor: theme.colors.semantic.border.secondary,
          backgroundColor: theme.colors.semantic.surface.secondary,
          color: theme.colors.semantic.text.secondary
        }}
      >
        <div className="flex items-center space-x-4">
          {showWordCount && (
            <>
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              <span>{readingTime} min read</span>
            </>
          )}
          {maxLength && (
            <span style={{ color: charCount > maxLength ? theme.colors.semantic.status.error : 'inherit' }}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {enableCollaboration && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Live collaboration</span>
            </div>
          )}
          <span>Language: {language.toUpperCase()}</span>
          {enableVersioning && <span>v1.0</span>}
        </div>
      </div>
    </div>
  );
});

AdvancedRichTextEditor.displayName = 'AdvancedRichTextEditor';