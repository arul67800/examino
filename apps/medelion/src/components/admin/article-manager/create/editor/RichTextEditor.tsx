'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@/theme';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Link,
  Image,
  Video,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette,
  Maximize2,
  Minimize2,
  Eye,
  Edit,
  Columns,
  Undo,
  Redo,
  Save,
  Search,
  Replace,
  Zap,
  Hash,
  AtSign,
  FileText,
  Download,
  Upload,
  Settings,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  showWordCount?: boolean;
  enableCollaboration?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  onSave?: () => void;
}

interface EditorTool {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  group: 'format' | 'structure' | 'media' | 'layout' | 'tools';
  isActive?: boolean;
  isDisabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing your article...',
  className = '',
  height = '500px',
  showWordCount = true,
  enableCollaboration = false,
  onImageUpload,
  onSave
}) => {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [mode, setMode] = useState<'write' | 'preview' | 'split'>('write');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [showLineNumbers, setShowLineNumbers] = useState(false);

  // Calculate statistics
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const lines = content.split('\n').length;
    setWordCount(words);
    setCharCount(content.length);
    setLineCount(lines);
  }, [content]);

  // Handle text selection
  const updateSelection = useCallback(() => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setSelection({ start, end });
    }
  }, []);

  // Insert text at cursor position
  const insertText = useCallback((text: string, selectText = false) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + text + content.slice(end);
      
      onChange(newContent);
      
      // Update history
      const newHistory = [...history.slice(0, historyIndex + 1), newContent];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      // Set cursor position
      setTimeout(() => {
        if (selectText) {
          textarea.setSelectionRange(start, start + text.length);
        } else {
          textarea.setSelectionRange(start + text.length, start + text.length);
        }
        textarea.focus();
      }, 0);
    }
  }, [content, onChange, history, historyIndex]);

  // Wrap selected text
  const wrapText = useCallback((before: string, after?: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.slice(start, end);
      const wrapAfter = after || before;
      
      let newText;
      if (selectedText) {
        newText = before + selectedText + wrapAfter;
      } else {
        newText = before + wrapAfter;
      }
      
      insertText(newText, !selectedText);
    }
  }, [content, insertText]);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [history, historyIndex, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [history, historyIndex, onChange]);

  // Insert media
  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      const alt = prompt('Enter alt text:') || 'Image';
      insertText(`![${alt}](${url})`);
    }
  }, [insertText]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = prompt('Enter link text:') || 'Link';
      insertText(`[${text}](${url})`);
    }
  }, [insertText]);

  const insertTable = useCallback(() => {
    const rows = parseInt(prompt('Number of rows:') || '3');
    const cols = parseInt(prompt('Number of columns:') || '3');
    
    let table = '\n|';
    for (let i = 0; i < cols; i++) {
      table += ` Header ${i + 1} |`;
    }
    table += '\n|';
    for (let i = 0; i < cols; i++) {
      table += '----------|';
    }
    table += '\n';
    
    for (let r = 0; r < rows - 1; r++) {
      table += '|';
      for (let c = 0; c < cols; c++) {
        table += ` Cell ${r + 1},${c + 1} |`;
      }
      table += '\n';
    }
    
    insertText(table);
  }, [insertText]);

  // Define editor tools
  const tools: EditorTool[] = [
    // Formatting tools
    {
      id: 'bold',
      label: 'Bold',
      icon: Bold,
      action: () => wrapText('**'),
      shortcut: 'Ctrl+B',
      group: 'format'
    },
    {
      id: 'italic',
      label: 'Italic',
      icon: Italic,
      action: () => wrapText('*'),
      shortcut: 'Ctrl+I',
      group: 'format'
    },
    {
      id: 'underline',
      label: 'Underline',
      icon: Underline,
      action: () => wrapText('<u>', '</u>'),
      group: 'format'
    },
    {
      id: 'strikethrough',
      label: 'Strikethrough',
      icon: Strikethrough,
      action: () => wrapText('~~'),
      group: 'format'
    },
    {
      id: 'code',
      label: 'Inline Code',
      icon: Code,
      action: () => wrapText('`'),
      group: 'format'
    },
    
    // Structure tools
    {
      id: 'h1',
      label: 'Heading 1',
      icon: Heading1,
      action: () => insertText('\n# '),
      group: 'structure'
    },
    {
      id: 'h2',
      label: 'Heading 2',
      icon: Heading2,
      action: () => insertText('\n## '),
      group: 'structure'
    },
    {
      id: 'h3',
      label: 'Heading 3',
      icon: Heading3,
      action: () => insertText('\n### '),
      group: 'structure'
    },
    {
      id: 'quote',
      label: 'Quote',
      icon: Quote,
      action: () => insertText('\n> '),
      group: 'structure'
    },
    {
      id: 'list',
      label: 'Bullet List',
      icon: List,
      action: () => insertText('\n- '),
      group: 'structure'
    },
    {
      id: 'ordered-list',
      label: 'Numbered List',
      icon: ListOrdered,
      action: () => insertText('\n1. '),
      group: 'structure'
    },
    
    // Media tools
    {
      id: 'link',
      label: 'Link',
      icon: Link,
      action: insertLink,
      shortcut: 'Ctrl+K',
      group: 'media'
    },
    {
      id: 'image',
      label: 'Image',
      icon: Image,
      action: insertImage,
      group: 'media'
    },
    {
      id: 'video',
      label: 'Video',
      icon: Video,
      action: () => insertText('\n<video controls>\n  <source src="video-url" type="video/mp4">\n</video>\n'),
      group: 'media'
    },
    {
      id: 'table',
      label: 'Table',
      icon: Table,
      action: insertTable,
      group: 'media'
    }
  ];

  // Group tools by category
  const toolGroups = tools.reduce((groups, tool) => {
    if (!groups[tool.group]) groups[tool.group] = [];
    groups[tool.group].push(tool);
    return groups;
  }, {} as Record<string, EditorTool[]>);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            wrapText('**');
            break;
          case 'i':
            e.preventDefault();
            wrapText('*');
            break;
          case 'k':
            e.preventDefault();
            insertLink();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            onSave?.();
            break;
        }
      }
    };

    if (textareaRef.current) {
      textareaRef.current.addEventListener('keydown', handleKeyDown);
      textareaRef.current.addEventListener('select', updateSelection);
    }

    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('keydown', handleKeyDown);
        textareaRef.current.removeEventListener('select', updateSelection);
      }
    };
  }, [wrapText, insertLink, undo, redo, onSave, updateSelection]);

  const renderMarkdownPreview = (text: string) => {
    // Enhanced markdown preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 4px;">$1</code>')
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5rem; font-weight: bold; margin: 0.75rem 0;">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0;">$1</h3>')
      .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #ccc; padding-left: 1rem; margin: 1rem 0; font-style: italic;">$1</blockquote>')
      .replace(/^\- (.*$)/gm, '<li style="margin: 0.25rem 0;">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li style="margin: 0.25rem 0;">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #3b82f6; text-decoration: underline;">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;" />')
      .replace(/\n/g, '<br />');
  };

  const getDeviceStyles = () => {
    switch (previewDevice) {
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      default:
        return {};
    }
  };

  return (
    <div 
      className={`border rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
      style={{ 
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary
      }}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div 
          className="border-b p-4 space-y-3"
          style={{ borderColor: theme.colors.semantic.border.secondary }}
        >
          {/* Mode Toggle & Device Preview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMode('write')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  mode === 'write' ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: mode === 'write' ? theme.colors.semantic.action.primary : 'transparent',
                  color: mode === 'write' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                }}
              >
                <Edit className="w-4 h-4 inline mr-1" />
                Write
              </button>
              <button
                onClick={() => setMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  mode === 'preview' ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: mode === 'preview' ? theme.colors.semantic.action.primary : 'transparent',
                  color: mode === 'preview' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                }}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
              <button
                onClick={() => setMode('split')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  mode === 'split' ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: mode === 'split' ? theme.colors.semantic.action.primary : 'transparent',
                  color: mode === 'split' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                }}
              >
                <Columns className="w-4 h-4 inline mr-1" />
                Split
              </button>
            </div>

            {/* Preview Device Toggle */}
            {(mode === 'preview' || mode === 'split') && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewDevice === 'desktop' ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: previewDevice === 'desktop' ? theme.colors.semantic.action.primary + '20' : 'transparent',
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewDevice === 'tablet' ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: previewDevice === 'tablet' ? theme.colors.semantic.action.primary + '20' : 'transparent',
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-lg transition-colors ${
                    previewDevice === 'mobile' ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: previewDevice === 'mobile' ? theme.colors.semantic.action.primary + '20' : 'transparent',
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ color: theme.colors.semantic.text.primary }}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ color: theme.colors.semantic.text.primary }}
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.semantic.text.primary }}
                title="Search & Replace"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.semantic.text.primary }}
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-1 rounded border-0 bg-transparent focus:outline-none"
                style={{ color: theme.colors.semantic.text.primary }}
              />
              <input
                type="text"
                placeholder="Replace..."
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                className="flex-1 px-3 py-1 rounded border-0 bg-transparent focus:outline-none"
                style={{ color: theme.colors.semantic.text.primary }}
              />
              <button 
                className="px-3 py-1 rounded text-sm hover:opacity-80" 
                style={{ 
                  backgroundColor: theme.colors.semantic.action.primary,
                  color: theme.colors.semantic.text.inverse
                }}
              >
                Replace All
              </button>
            </div>
          )}

          {/* Tool Groups */}
          {mode !== 'preview' && (
            <div className="space-y-2">
              {Object.entries(toolGroups).map(([groupName, groupTools]) => (
                <div key={groupName} className="flex items-center flex-wrap gap-1">
                  {groupTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={tool.action}
                      disabled={tool.isDisabled}
                      className="p-2 rounded-lg transition-colors hover:bg-opacity-80 disabled:opacity-50"
                      style={{ 
                        backgroundColor: tool.isActive ? theme.colors.semantic.action.primary + '20' : 'transparent',
                        color: theme.colors.semantic.text.primary
                      }}
                      title={`${tool.label} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
                    >
                      <tool.icon className="w-4 h-4" />
                    </button>
                  ))}
                  {groupName !== 'tools' && Object.keys(toolGroups).indexOf(groupName) < Object.keys(toolGroups).length - 1 && (
                    <div className="w-px h-6 mx-2" style={{ backgroundColor: theme.colors.semantic.border.secondary }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 250px)' : height }}>
        {/* Write Mode */}
        {(mode === 'write' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2 border-r' : 'w-full'} relative`} style={{ borderColor: theme.colors.semantic.border.secondary }}>
            {showLineNumbers && (
              <div 
                className="absolute left-0 top-0 w-12 h-full text-xs leading-6 text-right pr-2 select-none"
                style={{ 
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  color: theme.colors.semantic.text.secondary,
                  borderRight: `1px solid ${theme.colors.semantic.border.secondary}`
                }}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full resize-none border-0 focus:outline-none"
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.semantic.text.primary,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                padding: showLineNumbers ? '1rem 1rem 1rem 3.5rem' : '1rem'
              }}
              onSelect={updateSelection}
            />
          </div>
        )}

        {/* Preview Mode */}
        {(mode === 'preview' || mode === 'split') && (
          <div 
            className={`${mode === 'split' ? 'w-1/2' : 'w-full'} p-4 overflow-auto`}
            style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
          >
            <div 
              className="prose max-w-none transition-all duration-300"
              style={{ 
                color: theme.colors.semantic.text.primary,
                ...getDeviceStyles()
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }}
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
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>Line {content.slice(0, selection.start).split('\n').length} of {lineCount}</span>
          <span>Col {selection.start - content.lastIndexOf('\n', selection.start - 1)}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {enableCollaboration && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Auto-saving</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <label className="text-xs">Font:</label>
            <input
              type="range"
              min="10"
              max="20"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-16"
            />
            <span className="text-xs">{fontSize}px</span>
          </div>
          
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="text-xs hover:opacity-80"
            style={{ color: showLineNumbers ? theme.colors.semantic.action.primary : 'inherit' }}
          >
            Line Numbers
          </button>
        </div>
      </div>
    </div>
  );
};