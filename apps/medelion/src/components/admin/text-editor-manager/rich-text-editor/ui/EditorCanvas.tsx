'use client';

import React, { useRef, useEffect, useState, forwardRef, useCallback } from 'react';
import { useSemanticColors } from '@/theme';
import { ModularImageOverlayWrapper as ImageOverlay } from '../image-interaction/components/ModularImageOverlayWrapper';
import { MovableImage } from '../image-interaction/text-wrapping/components/MovableImage';
import { MovableImageData, ImagePosition, TextWrapSettings } from '../image-interaction/text-wrapping/types';
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
  const [movableImages, setMovableImages] = useState<MovableImageData[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Image management functions
  const updateImagePosition = useCallback((imageId: string, newPosition: ImagePosition) => {
    setMovableImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, position: newPosition }
        : img
    ));
  }, []);

  const updateImageWrapSettings = useCallback((imageId: string, newWrapSettings: TextWrapSettings) => {
    setMovableImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, wrapSettings: newWrapSettings }
        : img
    ));
  }, []);

  const deleteImage = useCallback((imageId: string) => {
    setMovableImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
  }, [selectedImageId]);

  const addMovableImage = useCallback((src: string, alt: string = '', position?: Partial<ImagePosition>) => {
    const defaultPosition: ImagePosition = {
      x: position?.x ?? 100,
      y: position?.y ?? 100,
      width: position?.width ?? 300,
      height: position?.height ?? 200
    };
    
    console.log('🖼️ Adding movable image with position:', defaultPosition);

    const newImage: MovableImageData = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      src,
      alt,
      position: defaultPosition,
      wrapSettings: {
        mode: 'square',
        alignment: 'left',
        distanceFromText: 15
      },
      zIndex: movableImages.length + 1
    };

    setMovableImages(prev => [...prev, newImage]);
    
    // Force selection after a short delay to ensure component is rendered
    setTimeout(() => {
      setSelectedImageId(newImage.id);
      console.log('🎯 MovableImage selected:', newImage.id);
    }, 50);
    
    console.log('🖼️ Created movable image with ID:', newImage.id, 'and position:', newImage.position);
    return newImage.id;
  }, [movableImages.length]);

  // Expose addMovableImage globally for toolbar access
  useEffect(() => {
    (window as any).insertMovableImageAtPosition = (src: string, alt: string = '', position?: { x: number, y: number, width?: number, height?: number }) => {
      return addMovableImage(src, alt, position);
    };

    // Listen for auto-open settings events
    const handleAutoOpenSettings = (event: CustomEvent) => {
      const { imageId } = event.detail;
      console.log('Auto-opening settings for image:', imageId);
      
      // Select the image and trigger settings after a short delay
      setTimeout(() => {
        setSelectedImageId(imageId);
        
        // Find the image in our state and auto-open its settings
        const targetImage = movableImages.find(img => img.id === imageId);
        if (targetImage) {
          // Trigger settings opening by dispatching a custom event to the MovableImage
          const settingsEvent = new CustomEvent('autoOpenSettings', {
            detail: { imageId }
          });
          window.dispatchEvent(settingsEvent);
        }
      }, 100);
    };

    window.addEventListener('openMovableImageSettings', handleAutoOpenSettings as EventListener);
    
    return () => {
      window.removeEventListener('openMovableImageSettings', handleAutoOpenSettings as EventListener);
    };
  }, [addMovableImage, movableImages]);

  const editorStyle = {
    padding: '48px',
    minHeight: '100vh',
    backgroundColor: semanticColors.surface.secondary,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transform: `scale(${zoomLevel / 100})`,
    transformOrigin: 'top center',
  };

  const pageStyle: React.CSSProperties = {
    maxWidth: '816px', // A4 width at 96 DPI
    margin: '0 auto',
    backgroundColor: semanticColors.surface.primary,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    borderRadius: '8px',
    padding: '96px 72px', // 1 inch margins
    minHeight: '1056px', // A4 height at 96 DPI
    position: 'relative',
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    onContentChange?.(content);
  };

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
      const imageUtils = await import('../utils/imageUtils');

      for (const file of imageFiles) {
        try {
          console.log('🖼️ Processing dropped image:', file.name);
          
          // Convert to base64 for immediate display
          const base64Url = await imageUtils.fileToBase64(file);
          
          // Calculate drop position relative to editor
          const rect = e.currentTarget.getBoundingClientRect();
          const dropX = e.clientX - rect.left;
          const dropY = e.clientY - rect.top;
          
          // Create movable image instead of static HTML
          addMovableImage(base64Url, file.name, {
            x: dropX,
            y: dropY,
            width: 300,
            height: 200
          });
          
          console.log('✅ Created movable image at position:', { x: dropX, y: dropY });
        } catch (error) {
          console.error('❌ Error processing image:', error);
        }
      }
    } catch (error) {
      console.error('❌ Error importing utilities:', error);
    }
  };

  // Update editor content when content prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  // Handle selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!editorRef.current) {
        onSelectionChange?.(null);
        return;
      }
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Check if selection is inside the editor
        if (editorRef.current.contains(range.startContainer) && editorRef.current.contains(range.endContainer)) {
          // Only trigger if actual text is selected
          if (!range.collapsed && range.toString().trim().length > 0) {
            onSelectionChange?.(selection);
            return;
          }
        }
      }
      onSelectionChange?.(null);
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [onSelectionChange]);

  if (viewMode === 'split') {
    return (
      <div ref={ref} className={`flex ${className}`}>
        <div className="flex-1 overflow-auto" style={editorStyle}>
          <div 
            style={pageStyle}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="relative" style={{ minHeight: '100%' }}>
              {/* Inline movable images for text wrapping modes */}
              {movableImages
                .filter(img => ['inline', 'square', 'tight', 'topBottom'].includes(img.wrapSettings.mode))
                .map((image) => (
                <MovableImage
                  key={`inline-${image.id}`}
                  imageId={image.id}
                  src={image.src}
                  alt={image.alt}
                  initialPosition={image.position}
                  initialWrapSettings={image.wrapSettings}
                  isSelected={selectedImageId === image.id}
                  onSelect={() => setSelectedImageId(image.id)}
                  onPositionChange={(position) => updateImagePosition(image.id, position)}
                  onWrapSettingsChange={(settings) => updateImageWrapSettings(image.id, settings)}
                  onDelete={() => deleteImage(image.id)}
                  editorElement={editorRef.current || undefined}
                />
              ))}
              
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
                  position: 'relative',
                  zIndex: 1
                }}
                className="prose prose-lg max-w-none focus:outline-none"
                onClick={() => setSelectedImageId(null)}
              />
              
              {/* Absolutely positioned images (overlay modes) */}
              {movableImages
                .filter(img => ['through', 'behindText', 'inFrontOfText'].includes(img.wrapSettings.mode))
                .map((image) => (
                <MovableImage
                  key={`absolute-${image.id}`}
                  imageId={image.id}
                  src={image.src}
                  alt={image.alt}
                  initialPosition={image.position}
                  initialWrapSettings={image.wrapSettings}
                  isSelected={selectedImageId === image.id}
                  onSelect={() => setSelectedImageId(image.id)}
                  onPositionChange={(position) => updateImagePosition(image.id, position)}
                  onWrapSettingsChange={(settings) => updateImageWrapSettings(image.id, settings)}
                  onDelete={() => deleteImage(image.id)}
                  editorElement={editorRef.current || undefined}
                />
              ))}
            </div>

            {/* Selection Indicator */}
            {selectedImageId && (
              <div 
                className="absolute top-2 right-2 px-3 py-1 rounded text-sm font-medium pointer-events-none"
                style={{
                  backgroundColor: semanticColors.action.primary,
                  color: 'white',
                  zIndex: 1004
                }}
              >
                Image Selected ({movableImages.find(img => img.id === selectedImageId)?.wrapSettings.mode})
              </div>
            )}

            {/* Drag over indicator */}
            {isDragOver && (
              <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                  Drop image here to insert
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-gray-50" style={editorStyle}>
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
        <div className="relative" style={{ minHeight: '100%' }}>
          {/* Inline movable images for text wrapping modes */}
          {movableImages
            .filter(img => ['inline', 'square', 'tight', 'topBottom'].includes(img.wrapSettings.mode))
            .map((image) => (
            <MovableImage
              key={`inline-${image.id}`}
              imageId={image.id}
              src={image.src}
              alt={image.alt}
              initialPosition={image.position}
              initialWrapSettings={image.wrapSettings}
              isSelected={selectedImageId === image.id}
              onSelect={() => setSelectedImageId(image.id)}
              onPositionChange={(position) => updateImagePosition(image.id, position)}
              onWrapSettingsChange={(settings) => updateImageWrapSettings(image.id, settings)}
              onDelete={() => deleteImage(image.id)}
              editorElement={editorRef.current || undefined}
            />
          ))}
          
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
              position: 'relative',
              zIndex: 1
            }}
            className="prose prose-lg max-w-none focus:outline-none"
            onClick={() => setSelectedImageId(null)}
          />
          
          {/* Absolutely positioned images (overlay modes) */}
          {movableImages
            .filter(img => ['through', 'behindText', 'inFrontOfText'].includes(img.wrapSettings.mode))
            .map((image) => (
            <MovableImage
              key={`absolute-${image.id}`}
              imageId={image.id}
              src={image.src}
              alt={image.alt}
              initialPosition={image.position}
              initialWrapSettings={image.wrapSettings}
              isSelected={selectedImageId === image.id}
              onSelect={() => setSelectedImageId(image.id)}
              onPositionChange={(position) => updateImagePosition(image.id, position)}
              onWrapSettingsChange={(settings) => updateImageWrapSettings(image.id, settings)}
              onDelete={() => deleteImage(image.id)}
              editorElement={editorRef.current || undefined}
            />
          ))}
        </div>

        {/* Selection Indicator */}
        {selectedImageId && (
          <div 
            className="absolute top-2 right-2 px-3 py-1 rounded text-sm font-medium pointer-events-none"
            style={{
              backgroundColor: semanticColors.action.primary,
              color: 'white',
              zIndex: 1004
            }}
          >
            Image Selected ({movableImages.find(img => img.id === selectedImageId)?.wrapSettings.mode})
          </div>
        )}

        {/* Drag over indicator */}
        {isDragOver && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
              Drop image here to insert
            </div>
          </div>
        )}

        {/* Modular ImageOverlay for existing static images */}
        {editorRef.current && !readOnly && (
          <ImageOverlay editorElement={editorRef.current} />
        )}
      </div>
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';