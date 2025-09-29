import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TextWrapSettings, TextWrapMode, TextAlignment } from './types';
import { applyWrapSettings, detectImageAlignment } from './text-wrap';
import { 
  useDragHandler, 
  usePositionMonitor, 
  useResizeHandler 
} from './hooks';
import { 
  ResizeHandle, 
  ImageToolbar, 
  LoadingSpinner, 
  ErrorMessage 
} from './ui-components';

export interface ImageOverlayProps {
  imageElement: HTMLImageElement;
  editorElement: HTMLElement | null;
  onRemove?: () => void;
  initialSettings?: Partial<TextWrapSettings>;
  showControls?: boolean;
  isReadOnly?: boolean;
  isSelected?: boolean;
}

export const ImageOverlay: React.FC<ImageOverlayProps> = ({
  imageElement,
  editorElement,
  onRemove,
  initialSettings = {},
  showControls = true,
  isReadOnly = false,
  isSelected = true
}) => {
  const imageRef = useRef<HTMLImageElement>(imageElement);
  const [isLoading, setIsLoading] = useState(!imageElement.complete);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  
  // Current text wrap settings
  const [settings, setSettings] = useState<TextWrapSettings>({
    mode: 'square',
    alignment: 'left',
    distanceFromText: 15,
    ...initialSettings
  });

  // Custom hooks for functionality
  const { dragState, startDrag } = useDragHandler({
    imageRef,
    editorElement,
    onSettingsUpdate: setSettings
  });

  const { currentAlignment } = usePositionMonitor({
    imageRef,
    editorElement,
    onAlignmentChange: (alignment: TextAlignment) => {
      setSettings((prev: TextWrapSettings) => ({ ...prev, alignment }));
    }
  });

  const { isResizing, startResize } = useResizeHandler({
    imageRef,
    onResize: (width: number, height: number) => {
      console.log('Image resized:', { width, height });
    }
  });

  // Handle image loading
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const handleLoad = () => {
      setIsLoading(false);
      setError(null);
      
      // Apply initial settings and detect current alignment
      applyWrapSettings(settings, img);
      const detectedSettings = detectImageAlignment(img);
      if (detectedSettings.alignment !== settings.alignment) {
        setSettings((prev: TextWrapSettings) => ({ ...prev, alignment: detectedSettings.alignment }));
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load image');
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [settings]);

  // Apply settings when they change
  useEffect(() => {
    if (imageRef.current && !isLoading && !error) {
      applyWrapSettings(settings, imageRef.current);
    }
  }, [settings, isLoading, error]);

  // Handle wrap mode changes
  const handleModeChange = useCallback((mode: TextWrapMode) => {
    setSettings((prev: TextWrapSettings) => ({ ...prev, mode }));
  }, []);

  // Handle alignment changes
  const handleAlignmentChange = useCallback((alignment: TextAlignment) => {
    setSettings((prev: TextWrapSettings) => ({ ...prev, alignment }));
  }, []);

  // Handle rotation
  const handleRotate = useCallback(() => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    
    if (imageRef.current) {
      imageRef.current.style.transform = `rotate(${newRotation}deg)`;
    }
  }, [rotation]);

  // Handle move (start dragging)
  const handleMove = useCallback(() => {
    if (!isReadOnly && imageRef.current) {
      // Create a synthetic mouse event to trigger drag
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        clientX: 0,
        clientY: 0
      } as React.MouseEvent;
      startDrag(syntheticEvent);
    }
  }, [startDrag, isReadOnly]);

  // Handle settings toggle
  const handleSettings = useCallback(() => {
    // This could open a settings dropdown/modal
    console.log('Settings clicked for image:', imageRef.current?.src);
  }, []);

  // Error retry handler
  const handleRetry = useCallback(() => {
    if (imageRef.current) {
      setIsLoading(true);
      setError(null);
      imageRef.current.src = imageRef.current.src; // Trigger reload
    }
  }, []);

  // Don't render if no editor element
  if (!editorElement) {
    return null;
  }

  const shouldShowControls = showControls && isSelected && !isReadOnly && !dragState.isDragging;
  const shouldShowResizeHandles = isSelected && !isReadOnly && !dragState.isDragging && !isResizing;

  return (
    <div 
      className={`
        relative inline-block
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${dragState.isDragging ? 'opacity-70' : ''}
        transition-all duration-200
      `}
      style={{ 
        userSelect: 'none',
        cursor: dragState.isDragging ? 'grabbing' : (isSelected && !isReadOnly ? 'grab' : 'pointer')
      }}
    >
      {/* Main image */}
      <img
        ref={imageRef}
        className={`
          max-w-full h-auto
          ${dragState.isDragging ? 'pointer-events-none' : ''}
          transition-transform duration-200
        `}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
        draggable={false}
        onMouseDown={!isReadOnly ? (e) => startDrag(e) : undefined}
        alt=""
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm rounded">
          <LoadingSpinner size={24} />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <ErrorMessage message={error} onRetry={handleRetry} />
      )}

      {/* Toolbar */}
      {shouldShowControls && (
        <ImageToolbar
          onRotate={handleRotate}
          onMove={handleMove}
          onSettings={handleSettings}
          isDragging={dragState.isDragging}
        />
      )}

      {/* Resize handles */}
      {shouldShowResizeHandles && (
        <>
          <ResizeHandle position="nw" onMouseDown={(e, pos) => startResize(e, pos)} />
          <ResizeHandle position="ne" onMouseDown={(e, pos) => startResize(e, pos)} />
          <ResizeHandle position="sw" onMouseDown={(e, pos) => startResize(e, pos)} />
          <ResizeHandle position="se" onMouseDown={(e, pos) => startResize(e, pos)} />
          <ResizeHandle position="n" onMouseDown={(e, pos) => startResize(e, pos)} />
          <ResizeHandle position="s" onMouseDown={(e, pos) => startResize(e, pos)} />
          <ResizeHandle position="e" onMouseDown={(e, pos) => startResize(e, pos)} />
          <ResizeHandle position="w" onMouseDown={(e, pos) => startResize(e, pos)} />
        </>
      )}

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && isSelected && (
        <div className="absolute -bottom-8 left-0 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
          Mode: {settings.mode} | Align: {settings.alignment} | Drag: {dragState.isDragging ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
};

export default ImageOverlay;