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
  Upload
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
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');

  // Calculate word and character count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setCharCount(content.length);
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
      action: () => insertText('[Link text](url)'),
      shortcut: 'Ctrl+K',
      group: 'media'
    },
    {
      id: 'image',
      label: 'Image',
      icon: Image,
      action: () => insertText('![Alt text](image-url)'),
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
      action: () => insertText('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'),
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
            insertText('[Link text](url)');
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
  }, [wrapText, insertText, undo, redo, onSave, updateSelection]);

  const renderMarkdownPreview = (text: string) => {
    // Simple markdown preview (in a real app, use a proper markdown parser)
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br />');
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
          {/* Mode Toggle */}
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

            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <Redo className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.semantic.text.primary }}
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
              <button className="px-3 py-1 rounded text-sm" style={{ color: theme.colors.semantic.text.primary }}>
                Replace
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
                  {groupName !== 'tools' && (
                    <div className="w-px h-6 mx-2" style={{ backgroundColor: theme.colors.semantic.border.secondary }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
        {/* Write Mode */}
        {(mode === 'write' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2 border-r' : 'w-full'}`} style={{ borderColor: theme.colors.semantic.border.secondary }}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full p-4 resize-none border-0 focus:outline-none"
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.semantic.text.primary,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace'
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
              className="prose max-w-none"
              style={{ color: theme.colors.semantic.text.primary }}
              dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(content) }}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      {showWordCount && (
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
            <span>Line {content.slice(0, selection.start).split('\n').length}</span>
          </div>
          {enableCollaboration && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Auto-saving</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};