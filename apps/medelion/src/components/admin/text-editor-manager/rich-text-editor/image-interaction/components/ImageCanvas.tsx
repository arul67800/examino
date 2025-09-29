'use client';

import React, { useRef, useCallback } from 'react';
import { useSemanticColors } from '@/theme';
import { ResizableImage } from './ResizableImage';
import { useImageInteraction } from '../hooks/useImageInteraction';
import '../styles/interactive-images.css';

interface ImageCanvasProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onImageAdd?: (imageData: any) => void;
  onImageUpdate?: (id: string, updates: any) => void;
  onImageDelete?: (id: string) => void;
  onImageSelect?: (id: string | null) => void;
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  children,
  className = '',
  style = {},
  onImageAdd,
  onImageUpdate,
  onImageDelete,
  onImageSelect
}) => {
  const semanticColors = useSemanticColors();
  const canvasRef = useRef<HTMLDivElement>(null);

  const {
    images,
    selectedImageId,
    addImage,
    updateImage,
    deleteImage,
    selectImage,
    moveImage,
    resizeImage,
    duplicateImage
  } = useImageInteraction({
    onImageAdd,
    onImageUpdate,
    onImageDelete,
    onImageSelect
  });

  // Handle image insertion from external sources
  const insertImageAtPosition = useCallback((src: string, alt: string = '', position?: { x: number, y: number }) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const defaultPosition = position || {
      x: canvasRect ? canvasRect.width / 2 - 150 : 100, // Center horizontally, default width 300
      y: canvasRect ? 50 : 50 // Near top
    };

    return addImage({
      src,
      alt,
      width: 300,
      height: 200,
      x: defaultPosition.x,
      y: defaultPosition.y,
      textWrap: 'none',
      rotation: 0
    });
  }, [addImage]);

  // Expose insertImageAtPosition globally for external access
  React.useEffect(() => {
    (window as any).insertImageAtPosition = insertImageAtPosition;
  }, [insertImageAtPosition]);

  const handleImagePositionChange = useCallback((id: string, position: { x: number, y: number }) => {
    moveImage(id, position.x, position.y);
  }, [moveImage]);

  const handleImageDimensionsChange = useCallback((id: string, dimensions: { width: number, height: number }) => {
    resizeImage(id, dimensions.width, dimensions.height);
  }, [resizeImage]);

  const handleImageSelect = useCallback((id: string) => {
    selectImage(id);
  }, [selectImage]);

  const handleImageDelete = useCallback((id: string) => {
    deleteImage(id);
  }, [deleteImage]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // If clicking on the canvas itself (not on an image), deselect all
    if (e.target === e.currentTarget) {
      selectImage(null);
    }
  }, [selectImage]);

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        minHeight: '400px',
        backgroundColor: semanticColors.surface.primary,
        ...style
      }}
      onClick={handleCanvasClick}
    >
      {/* Content (text, etc.) */}
      {children}

      {/* Interactive Images */}
      {images.map((image) => (
        <ResizableImage
          key={image.id}
          src={image.src}
          alt={image.alt}
          initialWidth={image.width}
          initialHeight={image.height}
          initialPosition={{ x: image.x, y: image.y }}
          textWrap={image.textWrap}
          zIndex={image.zIndex}
          allowDrag={true}
          allowResize={true}
          maintainAspectRatio={true}
          onDimensionsChange={(dimensions) => handleImageDimensionsChange(image.id, dimensions)}
          onPositionChange={(position) => handleImagePositionChange(image.id, position)}
          onSelect={() => handleImageSelect(image.id)}
          onDelete={() => handleImageDelete(image.id)}
          className={selectedImageId === image.id ? 'selected' : ''}
        />
      ))}

      {/* Selection Indicator */}
      {selectedImageId && (
        <div className="absolute top-2 right-2 px-3 py-1 rounded-md text-sm font-medium"
          style={{
            backgroundColor: semanticColors.action.primary,
            color: semanticColors.text.inverse,
            zIndex: 9999
          }}
        >
          Image Selected
        </div>
      )}
    </div>
  );
};