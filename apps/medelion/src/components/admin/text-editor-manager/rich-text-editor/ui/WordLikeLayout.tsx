'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/theme';
import { QuickAccessToolbar } from './QuickAccessToolbar';
import { RibbonToolbar } from './RibbonToolbar';
import { EditorCanvas } from './EditorCanvas';
import { StatusBar } from './StatusBar';
import { ImageFile, ImageInsertOptions } from '../image-upload/types';
import { EditorUtils } from '../utils/EditorUtils';

interface WordLikeLayoutProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  documentTitle?: string;
  onDocumentTitleChange?: (title: string) => void;
}

export function WordLikeLayout({
  initialContent = '<h1>Welcome to the Advanced Rich Text Editor</h1><p>Start typing to create your document...</p>',
  onContentChange,
  documentTitle = 'Document1',
  onDocumentTitleChange
}: WordLikeLayoutProps) {
  const { theme } = useTheme();
  const editorCanvasRef = React.useRef<HTMLDivElement>(null);
  
  // Editor state
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(null);
  
  // Document stats
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [readabilityScore, setReadabilityScore] = useState(85);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setUnsavedChanges(true);
    onContentChange?.(newContent);
    
    // Calculate word count
    const textContent = newContent.replace(/<[^>]*>/g, '').trim();
    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Simple page calculation (assuming ~250 words per page)
    setPageCount(Math.max(1, Math.ceil(words.length / 250)));
    
    // Mock readability score calculation
    const avgWordsPerSentence = textContent.split(/[.!?]+/).length > 0 
      ? words.length / textContent.split(/[.!?]+/).length 
      : 0;
    const mockScore = Math.max(50, Math.min(100, 100 - (avgWordsPerSentence * 2)));
    setReadabilityScore(Math.round(mockScore));
  }, [onContentChange]);

  // Handle image insertion
  const handleImageInsert = useCallback((image: ImageFile, options: ImageInsertOptions) => {
    console.log('Image inserted:', image, options);
    // Ensure the editor has focus for document.execCommand to work
    const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (editorElement) {
      editorElement.focus();
    }
    // The RibbonToolbar will handle the actual HTML insertion via onCommand('insertHTML', ...)
  }, []);

  // Handle ribbon commands
  const handleRibbonCommand = useCallback((command: string, value?: any) => {
    console.log('Ribbon command:', command, value);
    
    switch (command) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'alignLeft':
        document.execCommand('justifyLeft');
        break;
      case 'alignCenter':
        document.execCommand('justifyCenter');
        break;
      case 'alignRight':
        document.execCommand('justifyRight');
        break;
      case 'alignJustify':
        document.execCommand('justifyFull');
        break;
      case 'bulletList':
        document.execCommand('insertUnorderedList');
        break;
      case 'orderedList':
        document.execCommand('insertOrderedList');
        break;
      case 'fontFamily':
        document.execCommand('fontName', false, value);
        break;
      case 'fontSize':
        document.execCommand('fontSize', false, '7'); // Then adjust with CSS
        break;
      case 'insertTable':
        const tableHtml = `
          <table border="1" style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
            <tr><td style="padding: 8px;">Cell 1</td><td style="padding: 8px;">Cell 2</td></tr>
            <tr><td style="padding: 8px;">Cell 3</td><td style="padding: 8px;">Cell 4</td></tr>
          </table>
        `;
        document.execCommand('insertHTML', false, tableHtml);
        break;
      case 'insertHTML':
        EditorUtils.insertHTMLAtCursor(value);
        break;
      case 'insertImage':
        console.log('WordLikeLayout received insertImage command with value:', value);
        EditorUtils.insertImageAtCursor(value);
        break;
      case 'insertLink':
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      default:
        console.log('Unhandled command:', command);
    }
  }, []);

  // Handle quick access commands
  const handleQuickAccessCommand = useCallback((command: string, value?: any) => {
    console.log('Quick access command:', command, value);
    
    switch (command) {
      case 'save':
        setUnsavedChanges(false);
        // Implement actual save logic here
        break;
      case 'undo':
        document.execCommand('undo');
        break;
      case 'redo':
        document.execCommand('redo');
        break;
      case 'download':
        // Implement download logic here
        break;
      case 'share':
        // Implement share logic here
        break;
      default:
        console.log('Unhandled quick access command:', command);
    }
  }, []);

  const containerStyle = {
    height: isFullscreen ? '100vh' : '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.colors.semantic.background.primary,
  };

  const mainContentStyle = {
    backgroundColor: '#f5f5f5', // Paper-like background
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  };

  return (
    <div 
      style={containerStyle}
      className={isFullscreen ? 'fixed inset-0 z-50' : ''}
    >
      {/* Quick Access Toolbar */}
      <QuickAccessToolbar
        onCommand={handleQuickAccessCommand}
        documentTitle={documentTitle}
        onTitleChange={onDocumentTitleChange}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        unsavedChanges={unsavedChanges}
      />

      {/* Ribbon Toolbar */}
      <RibbonToolbar
        onCommand={handleRibbonCommand}
        onImageInsert={handleImageInsert}
      />

      {/* Main Editor Area */}
      <div style={mainContentStyle}>
        <EditorCanvas
          ref={editorCanvasRef}
          content={content}
          onContentChange={handleContentChange}
          viewMode={viewMode}
          zoomLevel={zoomLevel}
          onSelectionChange={setCurrentSelection}
          placeholder="Start typing your document..."
        />
      </div>

      {/* Status Bar */}
      <StatusBar
        wordCount={wordCount}
        pageCount={pageCount}
        currentPage={1}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isOnline={true}
        collaborators={0}
        readabilityScore={readabilityScore}
      />
    </div>
  );
}