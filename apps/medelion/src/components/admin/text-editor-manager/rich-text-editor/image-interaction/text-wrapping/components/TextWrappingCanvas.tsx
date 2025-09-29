'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSemanticColors } from '@/theme';
import { MovableImage } from './MovableImage';
import { TextWrapEngine } from '../utils/TextWrapEngine';
import { MovableImageData, ImagePosition, TextWrapSettings } from '../types';

interface TextWrappingCanvasProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onImagesChange?: (images: MovableImageData[]) => void;
}

export const TextWrappingCanvas: React.FC<TextWrappingCanvasProps> = ({
  children,
  className = '',
  style = {},
  onImagesChange
}) => {
  const semanticColors = useSemanticColors();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<MovableImageData[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Expose addImage function globally for external access
  const addImage = useCallback((
    src: string,
    alt: string = '',
    position?: Partial<ImagePosition>,
    wrapSettings?: Partial<TextWrapSettings>
  ) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const defaultPosition: ImagePosition = {
      x: position?.x ?? 100,
      y: position?.y ?? 100,
      width: position?.width ?? 300,
      height: position?.height ?? 200
    };

    // Get optimal wrap settings based on position
    const optimalSettings = canvasRect 
      ? TextWrapEngine.getOptimalWrapSettings(defaultPosition, canvasRect.width, canvasRect.height)
      : { mode: 'square' as const, alignment: 'left' as const, distanceFromText: 15 };

    const finalWrapSettings: TextWrapSettings = {
      ...optimalSettings,
      ...wrapSettings
    };

    const newImage: MovableImageData = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      src,
      alt,
      position: defaultPosition,
      wrapSettings: finalWrapSettings,
      zIndex: images.length + 1
    };

    setImages(prev => [...prev, newImage]);
    setSelectedImageId(newImage.id);
    
    return newImage.id;
  }, [images.length]);

  // Expose insertImageAtPosition globally
  React.useEffect(() => {
    (window as any).insertMovableImageAtPosition = (src: string, alt: string = '', position?: { x: number, y: number }) => {
      return addImage(src, alt, position);
    };
  }, [addImage]);

  const updateImagePosition = useCallback((imageId: string, newPosition: ImagePosition) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, position: newPosition }
        : img
    ));
  }, []);

  const updateImageWrapSettings = useCallback((imageId: string, newWrapSettings: TextWrapSettings) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, wrapSettings: newWrapSettings }
        : img
    ));
  }, []);

  const deleteImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
  }, [selectedImageId]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // If clicking on the canvas itself, deselect all images
    if (e.target === e.currentTarget) {
      setSelectedImageId(null);
    }
  }, []);

  // Notify parent of changes
  useEffect(() => {
    onImagesChange?.(images);
  }, [images, onImagesChange]);

  return (
    <div
      ref={canvasRef}
      className={`relative ${className}`}
      style={{
        minHeight: '400px',
        backgroundColor: semanticColors.surface.primary,
        overflow: 'visible',
        ...style
      }}
      onClick={handleCanvasClick}
    >
      {/* Content (text, etc.) with inline images for text wrapping */}
      <div className="relative z-0">
        {/* Inline images for text wrapping modes (inline, square, tight, topBottom) */}
        {images
          .filter(img => ['inline', 'square', 'tight', 'topBottom'].includes(img.wrapSettings.mode))
          .map((image) => (
          <MovableImage
            key={`inline-${image.id}`}
            src={image.src}
            alt={image.alt}
            initialPosition={image.position}
            initialWrapSettings={image.wrapSettings}
            isSelected={selectedImageId === image.id}
            onSelect={() => setSelectedImageId(image.id)}
            onPositionChange={(position) => updateImagePosition(image.id, position)}
            onWrapSettingsChange={(settings) => updateImageWrapSettings(image.id, settings)}
            onDelete={() => deleteImage(image.id)}
            editorElement={canvasRef.current || undefined}
          />
        ))}
        
        {/* Text content */}
        {children}
      </div>

      {/* Absolutely positioned images (through, behind, inFront modes) */}
      {images
        .filter(img => ['through', 'behindText', 'inFrontOfText'].includes(img.wrapSettings.mode))
        .map((image) => (
        <MovableImage
          key={`absolute-${image.id}`}
          src={image.src}
          alt={image.alt}
          initialPosition={image.position}
          initialWrapSettings={image.wrapSettings}
          isSelected={selectedImageId === image.id}
          onSelect={() => setSelectedImageId(image.id)}
          onPositionChange={(position) => updateImagePosition(image.id, position)}
          onWrapSettingsChange={(settings) => updateImageWrapSettings(image.id, settings)}
          onDelete={() => deleteImage(image.id)}
          editorElement={canvasRef.current || undefined}
        />
      ))}

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
          Image Selected ({images.find(img => img.id === selectedImageId)?.wrapSettings.mode})
        </div>
      )}

      {/* Instructions */}
      {images.length === 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ color: semanticColors.text.tertiary }}
        >
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Text Wrapping Canvas</p>
            <p className="text-sm">Insert images from the toolbar to see text wrapping in action</p>
          </div>
        </div>
      )}
    </div>
  );
};