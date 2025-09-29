'use client';

import { useState, useCallback, useRef } from 'react';

interface ImageElement {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  x: number;
  y: number;
  textWrap: 'none' | 'left' | 'right' | 'both';
  rotation: number;
  zIndex: number;
}

interface UseImageInteractionOptions {
  onImageAdd?: (image: ImageElement) => void;
  onImageUpdate?: (id: string, updates: Partial<ImageElement>) => void;
  onImageDelete?: (id: string) => void;
  onImageSelect?: (id: string | null) => void;
}

export function useImageInteraction({
  onImageAdd,
  onImageUpdate,
  onImageDelete,
  onImageSelect
}: UseImageInteractionOptions = {}) {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const nextId = useRef(1);

  const generateId = useCallback(() => {
    return `image-${nextId.current++}`;
  }, []);

  const addImage = useCallback((imageData: Omit<ImageElement, 'id' | 'zIndex'>) => {
    const newImage: ImageElement = {
      ...imageData,
      id: generateId(),
      zIndex: Date.now() // Use timestamp for z-index to ensure newest is on top
    };

    setImages(prev => [...prev, newImage]);
    setSelectedImageId(newImage.id);
    onImageAdd?.(newImage);
    onImageSelect?.(newImage.id);

    return newImage.id;
  }, [generateId, onImageAdd, onImageSelect]);

  const updateImage = useCallback((id: string, updates: Partial<ImageElement>) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ));
    onImageUpdate?.(id, updates);
  }, [onImageUpdate]);

  const deleteImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
      onImageSelect?.(null);
    }
    onImageDelete?.(id);
  }, [selectedImageId, onImageDelete, onImageSelect]);

  const selectImage = useCallback((id: string | null) => {
    setSelectedImageId(id);
    onImageSelect?.(id);
  }, [onImageSelect]);

  const moveImage = useCallback((id: string, x: number, y: number) => {
    updateImage(id, { x, y });
  }, [updateImage]);

  const resizeImage = useCallback((id: string, width: number, height: number) => {
    updateImage(id, { width, height });
  }, [updateImage]);

  const setTextWrap = useCallback((id: string, textWrap: 'none' | 'left' | 'right' | 'both') => {
    updateImage(id, { textWrap });
  }, [updateImage]);

  const rotateImage = useCallback((id: string, rotation: number) => {
    updateImage(id, { rotation });
  }, [updateImage]);

  const bringToFront = useCallback((id: string) => {
    const maxZ = Math.max(...images.map(img => img.zIndex), 0);
    updateImage(id, { zIndex: maxZ + 1 });
  }, [images, updateImage]);

  const sendToBack = useCallback((id: string) => {
    const minZ = Math.min(...images.map(img => img.zIndex), 0);
    updateImage(id, { zIndex: minZ - 1 });
  }, [images, updateImage]);

  const duplicateImage = useCallback((id: string) => {
    const originalImage = images.find(img => img.id === id);
    if (originalImage) {
      const duplicated = {
        ...originalImage,
        x: originalImage.x + 20,
        y: originalImage.y + 20
      };
      delete (duplicated as any).id;
      delete (duplicated as any).zIndex;
      return addImage(duplicated);
    }
    return null;
  }, [images, addImage]);

  const clearAllImages = useCallback(() => {
    setImages([]);
    setSelectedImageId(null);
    onImageSelect?.(null);
  }, [onImageSelect]);

  const getImageById = useCallback((id: string) => {
    return images.find(img => img.id === id) || null;
  }, [images]);

  const getSelectedImage = useCallback(() => {
    return selectedImageId ? getImageById(selectedImageId) : null;
  }, [selectedImageId, getImageById]);

  return {
    // State
    images,
    selectedImageId,
    selectedImage: getSelectedImage(),

    // Actions
    addImage,
    updateImage,
    deleteImage,
    selectImage,
    moveImage,
    resizeImage,
    setTextWrap,
    rotateImage,
    bringToFront,
    sendToBack,
    duplicateImage,
    clearAllImages,
    getImageById,
    getSelectedImage
  };
}