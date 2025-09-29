'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSemanticColors } from '@/theme';
import { Move, RotateCw, Copy, Trash2, Settings, Link } from 'lucide-react';

interface ImageDimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface ResizableImageProps {
  src: string;
  alt?: string;
  initialWidth?: number;
  initialHeight?: number;
  initialPosition?: Position;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  allowDrag?: boolean;
  allowResize?: boolean;
  textWrap?: 'none' | 'left' | 'right' | 'both';
  zIndex?: number;
  onDimensionsChange?: (dimensions: ImageDimensions) => void;
  onPositionChange?: (position: Position) => void;
  onSelect?: () => void;
  onDelete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ResizableImage: React.FC<ResizableImageProps> = ({
  src,
  alt = '',
  initialWidth = 300,
  initialHeight = 200,
  initialPosition = { x: 0, y: 0 },
  minWidth = 50,
  minHeight = 50,
  maxWidth = 800,
  maxHeight = 600,
  maintainAspectRatio = true,
  allowDrag = true,
  allowResize = true,
  textWrap = 'none',
  zIndex = 1,
  onDimensionsChange,
  onPositionChange,
  onSelect,
  onDelete,
  className = '',
  style = {}
}) => {
  const semanticColors = useSemanticColors();
  const imageRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: initialWidth,
    height: initialHeight
  });
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<{
    dimensions: ImageDimensions;
    position: Position;
    mouse: Position;
    handle: string;
  } | null>(null);

  const aspectRatio = initialWidth / initialHeight;

  // Handle image selection
  const handleSelect = useCallback(() => {
    setIsSelected(true);
    onSelect?.();
  }, [onSelect]);

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!allowDrag || isResizing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    handleSelect();
  }, [allowDrag, isResizing, position, handleSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && allowDrag) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPosition(newPosition);
      onPositionChange?.(newPosition);
    } else if (isResizing && resizeStart) {
      const deltaX = e.clientX - resizeStart.mouse.x;
      const deltaY = e.clientY - resizeStart.mouse.y;
      
      let newWidth = dimensions.width;
      let newHeight = dimensions.height;
      let newX = position.x;
      let newY = position.y;

      switch (resizeStart.handle) {
        case 'se': // Southeast (bottom-right)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.dimensions.width + deltaX));
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.dimensions.height + deltaY));
          }
          break;
        case 'sw': // Southwest (bottom-left)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.dimensions.width - deltaX));
          newX = resizeStart.position.x + deltaX;
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.dimensions.height + deltaY));
          }
          break;
        case 'ne': // Northeast (top-right)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.dimensions.width + deltaX));
          newY = resizeStart.position.y + deltaY;
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
            newY = resizeStart.position.y + (resizeStart.dimensions.height - newHeight);
          } else {
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.dimensions.height - deltaY));
          }
          break;
        case 'nw': // Northwest (top-left)
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.dimensions.width - deltaX));
          newX = resizeStart.position.x + deltaX;
          newY = resizeStart.position.y + deltaY;
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
            newY = resizeStart.position.y + (resizeStart.dimensions.height - newHeight);
          } else {
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.dimensions.height - deltaY));
          }
          break;
      }

      setDimensions({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
      onDimensionsChange?.({ width: newWidth, height: newHeight });
      onPositionChange?.({ x: newX, y: newY });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, allowDrag, dimensions, position, minWidth, minHeight, maxWidth, maxHeight, maintainAspectRatio, aspectRatio, onDimensionsChange, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeStart(null);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    if (!allowResize) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      dimensions: { ...dimensions },
      position: { ...position },
      mouse: { x: e.clientX, y: e.clientY },
      handle
    });
  }, [allowResize, dimensions, position]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'move' : 'nw-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Handle clicks outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (imageRef.current && !imageRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const textWrapStyles = {
    none: {},
    left: { float: 'left' as const, marginRight: '16px', marginBottom: '8px' },
    right: { float: 'right' as const, marginLeft: '16px', marginBottom: '8px' },
    both: { display: 'block' as const, margin: '8px auto' }
  };

  return (
    <div
      ref={imageRef}
      className={`absolute select-none ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        ...textWrapStyles[textWrap],
        zIndex: isSelected ? 1000 : zIndex,
        ...style
      }}
      onMouseDown={handleMouseDown}
      onClick={handleSelect}
    >
      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded-md"
        style={{
          border: isSelected ? `2px solid ${semanticColors.action.primary}` : 'none',
          boxShadow: isSelected ? `0 0 10px ${semanticColors.action.primary}40` : 'none'
        }}
        draggable={false}
      />

      {/* Resize Handles */}
      {isSelected && allowResize && (
        <>
          {/* Corner Handles */}
          <div
            className="absolute w-3 h-3 rounded-full cursor-nw-resize"
            style={{
              top: '-6px',
              left: '-6px',
              backgroundColor: semanticColors.action.primary,
              border: `2px solid ${semanticColors.surface.primary}`
            }}
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute w-3 h-3 rounded-full cursor-ne-resize"
            style={{
              top: '-6px',
              right: '-6px',
              backgroundColor: semanticColors.action.primary,
              border: `2px solid ${semanticColors.surface.primary}`
            }}
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute w-3 h-3 rounded-full cursor-sw-resize"
            style={{
              bottom: '-6px',
              left: '-6px',
              backgroundColor: semanticColors.action.primary,
              border: `2px solid ${semanticColors.surface.primary}`
            }}
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="absolute w-3 h-3 rounded-full cursor-se-resize"
            style={{
              bottom: '-6px',
              right: '-6px',
              backgroundColor: semanticColors.action.primary,
              border: `2px solid ${semanticColors.surface.primary}`
            }}
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
        </>
      )}

      {/* Toolbar */}
      {isSelected && (
        <div
          className="absolute flex items-center gap-1 px-2 py-1 rounded-md shadow-lg"
          style={{
            top: '-40px',
            left: '0px',
            backgroundColor: semanticColors.surface.primary,
            border: `1px solid ${semanticColors.border.primary}`
          }}
        >
          <button
            className="p-1 rounded hover:bg-opacity-80"
            style={{ backgroundColor: semanticColors.surface.secondary }}
            title="Move"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-opacity-80"
            style={{ backgroundColor: semanticColors.surface.secondary }}
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-opacity-80"
            style={{ backgroundColor: semanticColors.surface.secondary }}
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-opacity-80"
            style={{ backgroundColor: semanticColors.surface.secondary }}
            title="Link"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-opacity-80"
            style={{ backgroundColor: semanticColors.surface.secondary }}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-1 rounded hover:bg-opacity-80"
            style={{ backgroundColor: semanticColors.status.error }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Drag Indicator */}
      {isDragging && (
        <div
          className="absolute inset-0 border-2 border-dashed rounded-md pointer-events-none"
          style={{ borderColor: semanticColors.action.primary }}
        />
      )}
    </div>
  );
};