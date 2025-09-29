'use client';

import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { useSemanticColors } from '@/theme';
import { ImageEnhancer } from '../utils/ImageEnhancer';
import { ImageOverlay } from '../image-interaction/components/ImageOverlay';
import '../styles/editor.css';

interface EditorCanvasProps {
  content: string;
  onContentChange?: (content: string) => void;
  viewMode?: 'edit' | 'preview' | 'split';
  zoomLevel?: number;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  onSelectionChange?: (selection: Selection | null) => void;
}

export const EditorCanvas = forwardRef<HTMLDivElement, EditorCanvasProps>(({
  content,
  onContentChange,
  viewMode = 'edit',
  zoomLevel = 100,
  className = '',
  placeholder = 'Start writing...',
  readOnly = false,
  onSelectionChange
}, ref) => {
  const semanticColors = useSemanticColors();
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const editorStyle = {
    padding: '48px',
    minHeight: '100vh',
    backgroundColor: semanticColors.surface.secondary,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transform: `scale(${zoomLevel / 100})`,
    transformOrigin: 'top center',
  };

  const pageStyle = {
    maxWidth: '816px', // A4 width at 96 DPI
    margin: '0 auto',
    backgroundColor: semanticColors.surface.primary,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    borderRadius: '8px',
    padding: '96px 72px', // 1 inch margins
    minHeight: '1056px', // A4 height at 96 DPI
    border: isDragOver ? '2px dashed #3b82f6' : 'none',
  };

  // Handle drag and drop for images
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const hasFiles = e.dataTransfer.types.includes('Files');
    if (hasFiles) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only hide drag over if we're leaving the editor canvas entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    console.log('📁 Dropped image files:', imageFiles);

    // Import utilities dynamically
    try {
      const EditorUtils = await import('../utils/EditorUtils');
      const imageUtils = await import('../utils/imageUtils');

      for (const file of imageFiles) {
        try {
          console.log('🖼️ Processing dropped image:', file.name);
          
          // Convert to base64 for immediate display
          const base64Url = await imageUtils.fileToBase64(file);
          
          // Insert image directly into editor
          const imageHtml = `<img src="${base64Url}" alt="${file.name}" title="${file.name}" style="max-width: 100%; height: auto; cursor: move;" />`;
          EditorUtils.EditorUtils.insertImageAtCursor(imageHtml);
          
          console.log('✅ Successfully inserted dropped image');
        } catch (error) {
          console.error('❌ Failed to insert dropped image:', error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to import utilities:', error);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (onContentChange && editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  const handleSelectionChange = () => {
    if (onSelectionChange) {
      const selection = window.getSelection();
      onSelectionChange(selection);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [onSelectionChange]);

  // Update editor content when content prop changes
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
    if (previewRef.current && content !== previewRef.current.innerHTML) {
      previewRef.current.innerHTML = content;
    }
  }, [content]);

  // Initialize ImageEnhancer for the editor
  useEffect(() => {
    if (editorRef.current && !readOnly) {
      const enhancer = new ImageEnhancer();
      // Temporarily disabled for debugging
      // enhancer.initialize();
      
      return () => {
        // enhancer.destroy();
      };
    }
  }, [readOnly]);

  if (viewMode === 'split') {
    return (
      <div ref={ref} className={`flex ${className}`}>
        {/* Editor Side */}
        <div className="flex-1 overflow-auto border-r relative" style={{ borderColor: semanticColors.border.primary }}>
          <div 
            style={editorStyle}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div style={pageStyle}>
              <div
                ref={editorRef}
                contentEditable={!readOnly}
                onInput={handleInput}
                suppressContentEditableWarning={true}
                data-placeholder={placeholder}
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  outline: 'none',
                }}
                className="prose prose-lg max-w-none focus:outline-none"
              />
              {editorRef.current && !readOnly && (
                <ImageOverlay editorElement={editorRef.current} />
              )}
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="flex-1 overflow-auto">
          <div style={editorStyle}>
            <div style={pageStyle}>
              <div
                ref={previewRef}
                dangerouslySetInnerHTML={{ __html: content }}
                style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                }}
                className="prose prose-lg max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'preview') {
    return (
      <div ref={ref} className={`flex-1 overflow-auto ${className}`} style={editorStyle}>
        <div style={pageStyle}>
          <div
            ref={previewRef}
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
            }}
            className="prose prose-lg max-w-none"
          />
        </div>
      </div>
    );
  }

  // Edit mode (default)
  return (
    <div ref={ref} className={`flex-1 overflow-auto ${className} relative`} style={editorStyle}>
      <div 
        style={pageStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            outline: 'none',
            minHeight: '100%',
          }}
          className="prose prose-lg max-w-none focus:outline-none"
        />
        {editorRef.current && !readOnly && (
          <ImageOverlay editorElement={editorRef.current} />
        )}
      </div>
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';

// CSS for placeholder
const placeholderCSS = `
  [data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: #9CA3AF;
    pointer-events: none;
  }
  
  [data-placeholder]:empty:focus::before {
    content: '';
  }
`;

// Inject placeholder CSS
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = placeholderCSS;
  document.head.appendChild(styleElement);
}