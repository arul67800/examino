import { useState, useCallback, useRef, useEffect } from 'react';
import { TextWrapSettings, TextAlignment } from './types';
import { handleDragMovement, handleDragEnd } from './drag-handler';
import { applyWrapSettings } from './text-wrap';
import { getAlignmentFromPosition } from './utils';

export interface UseDragHandlerProps {
  imageRef: React.RefObject<HTMLImageElement>;
  editorElement: HTMLElement | null;
  onSettingsUpdate: (settings: TextWrapSettings) => void;
}

export interface DragState {
  isDragging: boolean;
  dragPosition: { x: number; y: number } | null;
  startPosition: DOMRect | null;
  startCoords: { x: number; y: number } | null;
}

export const useDragHandler = ({ imageRef, editorElement, onSettingsUpdate }: UseDragHandlerProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragPosition: null,
    startPosition: null,
    startCoords: null
  });

  const dragRef = useRef<DragState>(dragState);
  dragRef.current = dragState;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { isDragging, startPosition, startCoords } = dragRef.current;
    
    if (!isDragging || !imageRef.current || !editorElement || !startPosition || !startCoords) {
      return;
    }

    handleDragMovement(
      e,
      imageRef.current,
      editorElement,
      startPosition,
      startCoords.x,
      startCoords.y,
      (position: { x: number; y: number }) => {
        setDragState(prev => ({ ...prev, dragPosition: position }));
      }
    );
  }, [imageRef, editorElement]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const { isDragging } = dragRef.current;
    
    if (!isDragging || !imageRef.current || !editorElement) {
      return;
    }

    handleDragEnd(e, imageRef.current, editorElement, onSettingsUpdate);

    setDragState({
      isDragging: false,
      dragPosition: null,
      startPosition: null,
      startCoords: null
    });

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [imageRef, editorElement, onSettingsUpdate, handleMouseMove]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!imageRef.current || !editorElement) return;

    const rect = imageRef.current.getBoundingClientRect();
    const startCoords = { x: e.clientX, y: e.clientY };

    setDragState({
      isDragging: true,
      dragPosition: null,
      startPosition: rect,
      startCoords
    });

    // Apply drag mode styling
    if (imageRef.current) {
      applyWrapSettings({ mode: 'inline', alignment: 'left', distanceFromText: 0 }, imageRef.current);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    console.log('🚀 Started dragging image');
  }, [imageRef, editorElement, handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    dragState,
    startDrag
  };
};

export interface UseImageSelectionProps {
  imageRef: React.RefObject<HTMLImageElement>;
  onSelectionChange?: (isSelected: boolean) => void;
}

export const useImageSelection = ({ imageRef, onSelectionChange }: UseImageSelectionProps) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newSelectedState = !isSelected;
    setIsSelected(newSelectedState);
    onSelectionChange?.(newSelectedState);
  }, [isSelected, onSelectionChange]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (imageRef.current && !imageRef.current.contains(e.target as Node)) {
      setIsSelected(false);
      onSelectionChange?.(false);
    }
  }, [imageRef, onSelectionChange]);

  useEffect(() => {
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelected, handleClickOutside]);

  return {
    isSelected,
    handleImageClick,
    setIsSelected
  };
};

export interface UsePositionMonitorProps {
  imageRef: React.RefObject<HTMLImageElement>;
  editorElement: HTMLElement | null;
  onAlignmentChange?: (alignment: TextAlignment) => void;
}

export const usePositionMonitor = ({ 
  imageRef, 
  editorElement, 
  onAlignmentChange 
}: UsePositionMonitorProps) => {
  const [currentAlignment, setCurrentAlignment] = useState<TextAlignment>('left');

  const updateAlignment = useCallback(() => {
    if (!imageRef.current || !editorElement) return;

    const imageRect = imageRef.current.getBoundingClientRect();
    const imageCenterX = imageRect.left + imageRect.width / 2;
    
    const alignment = getAlignmentFromPosition(imageCenterX, editorElement);
    
    if (alignment !== currentAlignment) {
      setCurrentAlignment(alignment);
      onAlignmentChange?.(alignment);
    }
  }, [imageRef, editorElement, currentAlignment, onAlignmentChange]);

  // Monitor position changes
  useEffect(() => {
    if (!imageRef.current || !editorElement) return;

    const observer = new MutationObserver(updateAlignment);
    const resizeObserver = new ResizeObserver(updateAlignment);

    // Observe changes to the image and editor
    observer.observe(editorElement, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['style', 'class'] 
    });

    resizeObserver.observe(imageRef.current);
    resizeObserver.observe(editorElement);

    // Initial alignment check
    updateAlignment();

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [updateAlignment, imageRef, editorElement]);

  return {
    currentAlignment,
    updateAlignment
  };
};

export interface UseResizeHandlerProps {
  imageRef: React.RefObject<HTMLImageElement>;
  onResize?: (width: number, height: number) => void;
}

export const useResizeHandler = ({ imageRef, onResize }: UseResizeHandlerProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  const resizeStateRef = useRef({ isResizing: false, handle: null as string | null });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { isResizing, handle } = resizeStateRef.current;
    
    if (!isResizing || !handle || !imageRef.current) return;

    e.preventDefault();

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    
    // Calculate new dimensions based on resize handle
    let newWidth = rect.width;
    let newHeight = rect.height;
    
    switch (handle) {
      case 'se':
        newWidth = Math.max(50, e.clientX - rect.left);
        newHeight = Math.max(50, e.clientY - rect.top);
        break;
      case 'sw':
        newWidth = Math.max(50, rect.right - e.clientX);
        newHeight = Math.max(50, e.clientY - rect.top);
        break;
      case 'ne':
        newWidth = Math.max(50, e.clientX - rect.left);
        newHeight = Math.max(50, rect.bottom - e.clientY);
        break;
      case 'nw':
        newWidth = Math.max(50, rect.right - e.clientX);
        newHeight = Math.max(50, rect.bottom - e.clientY);
        break;
      case 'e':
        newWidth = Math.max(50, e.clientX - rect.left);
        break;
      case 'w':
        newWidth = Math.max(50, rect.right - e.clientX);
        break;
      case 's':
        newHeight = Math.max(50, e.clientY - rect.top);
        break;
      case 'n':
        newHeight = Math.max(50, rect.bottom - e.clientY);
        break;
    }

    // Apply new dimensions
    img.style.width = `${newWidth}px`;
    img.style.height = `${newHeight}px`;
    
    onResize?.(newWidth, newHeight);
  }, [imageRef, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
    resizeStateRef.current = { isResizing: false, handle: null };

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const startResize = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeHandle(handle);
    resizeStateRef.current = { isResizing: true, handle };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    isResizing,
    resizeHandle,
    startResize
  };
};