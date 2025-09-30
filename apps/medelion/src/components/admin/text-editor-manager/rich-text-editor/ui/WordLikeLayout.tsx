'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/theme';
import { QuickAccessToolbar } from './QuickAccessToolbar';
import { RibbonToolbar } from './RibbonToolbar';
import { EditorCanvas } from './EditorCanvas';
import { StatusBar } from './StatusBar';
import { ImageFile, ImageInsertOptions } from '../image-upload/types';
import { EditorUtils } from '../utils/EditorUtils';
import { BubbleMenu } from '../components/bubble-menu';
import { WordTableIntegration } from '../table/WordTableIntegration';
import { AdvancedContextMenu } from '../right-click-menu/components/AdvancedContextMenu';
import { createEditorContextMenu, createTableContextMenu } from '../right-click-menu/utils/contextMenuConfigs';
import { useAdvancedContextMenu } from '../right-click-menu/hooks/useAdvancedContextMenu';

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

  // Advanced Context Menu State
  const { 
    contextMenu, 
    showContextMenu, 
    hideContextMenu,
    getCurrentOperations,
    selectedCell
  } = useAdvancedContextMenu(editorCanvasRef);

  // Handle context menu opening - close bubble menu
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    setCurrentSelection(null); // Close bubble menu when context menu opens
    showContextMenu(event);
  }, [showContextMenu]);

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

  // Handle table insertion
  const handleTableInsert = useCallback((tableData: any) => {
    console.log('🔥 Advanced table inserted:', tableData);
    
    // Add table-specific keyboard shortcuts and interactions
    setTimeout(() => {
      const tables = document.querySelectorAll('.advanced-table');
      tables.forEach(table => {
        // Add keyboard navigation
        table.addEventListener('keydown', (e: any) => {
          const target = e.target;
          if (target.tagName === 'TD' || target.tagName === 'TH') {
            switch (e.key) {
              case 'Tab':
                e.preventDefault();
                const nextCell = e.shiftKey ? 
                  target.previousElementSibling || target.parentElement?.previousElementSibling?.lastElementChild :
                  target.nextElementSibling || target.parentElement?.nextElementSibling?.firstElementChild;
                if (nextCell) nextCell.focus();
                break;
              case 'Enter':
                e.preventDefault();
                const belowCell = target.parentElement?.nextElementSibling?.children[target.cellIndex];
                if (belowCell) belowCell.focus();
                break;
              case 'ArrowUp':
                e.preventDefault();
                const aboveCell = target.parentElement?.previousElementSibling?.children[target.cellIndex];
                if (aboveCell) aboveCell.focus();
                break;
              case 'ArrowDown':
                e.preventDefault();
                const belowCell2 = target.parentElement?.nextElementSibling?.children[target.cellIndex];
                if (belowCell2) belowCell2.focus();
                break;
            }
          }
        });
        
        // Add cell selection highlighting
        const cells = table.querySelectorAll('td, th');
        cells.forEach(cell => {
          cell.addEventListener('focus', () => {
            cells.forEach(c => c.classList.remove('selected-cell'));
            cell.classList.add('selected-cell');
          });
        });
      });
    }, 200);
    
    // Update content to trigger re-render and word count update
    const newContent = (document.querySelector('[contenteditable="true"]') as HTMLElement)?.innerHTML || content;
    handleContentChange(newContent);
  }, [content, handleContentChange]);

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
        // Legacy simple table - keeping for compatibility
        const tableHtml = `
          <table border="1" style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
            <tr><td style="padding: 8px;">Cell 1</td><td style="padding: 8px;">Cell 2</td></tr>
            <tr><td style="padding: 8px;">Cell 3</td><td style="padding: 8px;">Cell 4</td></tr>
          </table>
        `;
        document.execCommand('insertHTML', false, tableHtml);
        break;
      case 'insertAdvancedTable':
        // This will be handled by the RibbonToolbar's table menu
        console.log('Advanced table insertion triggered');
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

  // Add click outside handler and table-specific styles
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const bubble = document.querySelector('.bubble-menu-root');
      if (bubble && !bubble.contains(e.target as Node)) {
        setCurrentSelection(null);
      }
    }
    
    // Add table-specific CSS styles
    const tableStyles = `
      <style>
        .advanced-table-container {
          position: relative;
          margin: 20px 0;
        }
        
        .advanced-table td:focus,
        .advanced-table th:focus {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -2px;
          background-color: #eff6ff !important;
        }
        
        .advanced-table .selected-cell {
          background-color: #dbeafe !important;
          position: relative;
        }
        
        .advanced-table .selected-cell::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid #3b82f6;
          pointer-events: none;
        }
        
        .advanced-table th:hover .resize-handle {
          opacity: 1 !important;
          background-color: #3b82f6;
        }
        
        .advanced-table tbody tr:hover {
          background-color: #f8fafc;
        }
        
        .table-actions button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      </style>
    `;
    
    // Insert styles if not already present
    if (!document.querySelector('#advanced-table-styles')) {
      const styleElement = document.createElement('div');
      styleElement.id = 'advanced-table-styles';
      styleElement.innerHTML = tableStyles;
      document.head.appendChild(styleElement);
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        onTableInsert={handleTableInsert}
      />

      {/* Main Editor Area */}
      <div style={mainContentStyle} onContextMenu={handleContextMenu}>
        <EditorCanvas
          ref={editorCanvasRef}
          content={content}
          onContentChange={handleContentChange}
          viewMode={viewMode}
          zoomLevel={zoomLevel}
          onSelectionChange={setCurrentSelection}
          placeholder="Start typing your document..."
        />
        <BubbleMenu
          editorRef={editorCanvasRef}
          onFormat={(command, value) => {
            if (!editorCanvasRef.current) return;
            editorCanvasRef.current.focus();
            document.execCommand(command, false, value);
          }}
          activeFormats={new Set([...(currentSelection && !currentSelection.isCollapsed ? [
            document.queryCommandState('bold') ? 'bold' : '',
            document.queryCommandState('italic') ? 'italic' : '',
            document.queryCommandState('underline') ? 'underline' : ''
          ].filter(Boolean) : [])])}
          isVisible={!!currentSelection && !currentSelection.isCollapsed && currentSelection.toString().trim().length > 0}
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

      {/* Advanced Right-click Context Menu */}
      {contextMenu.isVisible && (
        <AdvancedContextMenu
          isVisible={contextMenu.isVisible}
          position={contextMenu.position}
          onClose={hideContextMenu}
          items={contextMenu.contextType === 'table' 
            ? createTableContextMenu(getCurrentOperations() as any) 
            : createEditorContextMenu(getCurrentOperations() as any)
          }
          context={contextMenu.contextType === 'table' ? 'table' : 'text'}
        />
      )}
    </div>
  );
}