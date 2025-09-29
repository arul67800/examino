'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Move, RotateCw, Trash2, Copy, Link, Settings } from 'lucide-react';

interface ResizableImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  caption?: string;
  onResize?: (width: number, height: number) => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onEdit?: () => void;
}

export const ResizableImage: React.FC<ResizableImageProps> = ({
  src,
  alt = '',
  width: initialWidth,
  height: initialHeight,
  className = '',
  style = {},
  caption,
  onResize,
  onDelete,
  onCopy,
  onEdit
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: initialWidth || 0, height: initialHeight || 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      handleImageLoad();
    }
  }, [src]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
      setAspectRatio(naturalWidth / naturalHeight);
      
      if (!initialWidth && !initialHeight) {
        // Set initial dimensions to fit container with max 400px width
        const maxWidth = 400;
        const calculatedWidth = Math.min(maxWidth, naturalWidth);
        const calculatedHeight = calculatedWidth / (naturalWidth / naturalHeight);
        setDimensions({ width: calculatedWidth, height: calculatedHeight });
      }
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(!isSelected);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    setIsResizing(true);
    const rect = containerRef.current.getBoundingClientRect();
    
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: dimensions.width,
      startHeight: dimensions.height
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeRef.current) return;
      
      const deltaX = moveEvent.clientX - resizeRef.current.startX;
      const deltaY = moveEvent.clientY - resizeRef.current.startY;
      
      let newWidth = resizeRef.current.startWidth;
      let newHeight = resizeRef.current.startHeight;
      
      // Calculate new dimensions based on handle
      switch (handle) {
        case 'se': // Southeast handle
          newWidth = Math.max(50, resizeRef.current.startWidth + deltaX);
          break;
        case 'sw': // Southwest handle
          newWidth = Math.max(50, resizeRef.current.startWidth - deltaX);
          break;
        case 'ne': // Northeast handle
          newWidth = Math.max(50, resizeRef.current.startWidth + deltaX);
          break;
        case 'nw': // Northwest handle
          newWidth = Math.max(50, resizeRef.current.startWidth - deltaX);
          break;
      }
      
      // Maintain aspect ratio
      newHeight = newWidth / aspectRatio;
      
      // Don't exceed natural dimensions unless user wants to
      const maxWidth = Math.max(naturalDimensions.width, 800);
      const maxHeight = Math.max(naturalDimensions.height, 600);
      
      if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth / aspectRatio;
      }
      
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
      }
      
      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
      
      if (onResize) {
        onResize(dimensions.width, dimensions.height);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelected]);

  const formatDimensions = () => {
    return `${Math.round(dimensions.width)} × ${Math.round(dimensions.height)}px`;
  };

  return (
    <div
      ref={containerRef}
      className={`image-container ${isSelected ? 'selected' : ''} ${className}`}
      style={{
        ...style,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        position: 'relative',
        display: 'inline-block'
      }}
    >
      {/* Image Toolbar */}
      {isSelected && (
        <div className="image-toolbar">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            title="Edit Image"
          >
            <Settings size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy?.();
            }}
            title="Copy Image"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add link functionality
            }}
            title="Add Link"
          >
            <Link size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            title="Delete Image"
            style={{ color: '#ef4444' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Main Image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onClick={handleImageClick}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          cursor: isSelected ? 'move' : 'pointer'
        }}
        draggable={false}
      />

      {/* Resize Handles */}
      {isSelected && (
        <>
          <div
            className="resize-handle nw"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            title="Resize"
          />
          <div
            className="resize-handle ne"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            title="Resize"
          />
          <div
            className="resize-handle sw"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            title="Resize"
          />
          <div
            className="resize-handle se"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            title="Resize"
          />
        </>
      )}

      {/* Size Indicator */}
      {(isSelected || isResizing) && (
        <div className="image-size-indicator">
          {formatDimensions()}
          {naturalDimensions.width > 0 && (
            <span style={{ marginLeft: '8px', opacity: 0.7 }}>
              (Original: {naturalDimensions.width} × {naturalDimensions.height}px)
            </span>
          )}
        </div>
      )}

      {/* Caption */}
      {caption && (
        <div className="image-caption">
          {caption}
        </div>
      )}
    </div>
  );
};