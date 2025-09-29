'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DragCoordinates } from './PreciseDragDropHandler';

export interface DragPreviewProps {
  isActive: boolean;
  coordinates: DragCoordinates | null;
  previewElement?: HTMLElement;
  offset?: { x: number; y: number };
  opacity?: number;
  scale?: number;
}

/**
 * VisualDragPreview - A component that provides pixel-perfect visual feedback during drag operations
 */
export const VisualDragPreview: React.FC<DragPreviewProps> = ({
  isActive,
  coordinates,
  previewElement,
  offset = { x: 0, y: 0 },
  opacity = 0.8,
  scale = 0.95
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  
  // Update preview content when element changes
  useEffect(() => {
    if (previewElement) {
      // Clone the element's appearance for preview
      const clonedElement = previewElement.cloneNode(true) as HTMLElement;
      
      // Reset any positioning styles
      clonedElement.style.position = 'static';
      clonedElement.style.transform = '';
      clonedElement.style.zIndex = '';
      clonedElement.style.opacity = '1';
      
      setPreviewContent(clonedElement.outerHTML);
    }
  }, [previewElement]);
  
  // Update preview position with precise coordinates
  useEffect(() => {
    if (!isActive || !coordinates || !previewRef.current) return;
    
    const preview = previewRef.current;
    const x = coordinates.clientX - offset.x;
    const y = coordinates.clientY - offset.y;
    
    // Use fixed positioning for precise pixel alignment
    preview.style.position = 'fixed';
    preview.style.left = `${x}px`;
    preview.style.top = `${y}px`;
    preview.style.transform = `scale(${scale})`;
    preview.style.transformOrigin = 'top left';
    preview.style.opacity = opacity.toString();
    preview.style.zIndex = '10002';
    preview.style.pointerEvents = 'none';
    preview.style.userSelect = 'none';
    
    // Hardware acceleration for smooth movement
    preview.style.willChange = 'transform, left, top';
    preview.style.backfaceVisibility = 'hidden';
  }, [isActive, coordinates, offset, opacity, scale]);
  
  if (!isActive || !coordinates) {
    return null;
  }
  
  return (
    <div
      ref={previewRef}
      className="drag-preview-container"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 10002,
        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
        transition: 'none' // Disable transitions for real-time positioning
      }}
      dangerouslySetInnerHTML={{ __html: previewContent }}
    />
  );
};

/**
 * Enhanced coordinate system that accounts for scroll, zoom, and viewport changes
 */
export class CoordinateMapper {
  private editorElement: HTMLElement;
  private baseRect!: DOMRect;
  private scrollOffset!: { x: number; y: number };
  private zoomLevel!: number;
  
  constructor(editorElement: HTMLElement) {
    this.editorElement = editorElement;
    this.updateBaseline();
  }
  
  /**
   * Update baseline measurements for accurate coordinate mapping
   */
  public updateBaseline(): void {
    this.baseRect = this.editorElement.getBoundingClientRect();
    this.scrollOffset = {
      x: window.scrollX,
      y: window.scrollY
    };
    
    // Detect zoom level
    this.zoomLevel = this.detectZoomLevel();
  }
  
  /**
   * Detect browser zoom level for accurate coordinate calculations
   */
  private detectZoomLevel(): number {
    // Method 1: Using devicePixelRatio (works in most modern browsers)
    if (window.devicePixelRatio) {
      return window.devicePixelRatio;
    }
    
    // Method 2: Using screen width comparison
    if (screen.width) {
      return screen.width / window.innerWidth;
    }
    
    return 1; // Default to no zoom
  }
  
  /**
   * Convert client coordinates to editor-relative coordinates with high precision
   */
  public clientToEditor(clientX: number, clientY: number): { x: number; y: number } {
    const currentRect = this.editorElement.getBoundingClientRect();
    
    // Account for any changes in editor position
    const x = (clientX - currentRect.left) / this.zoomLevel;
    const y = (clientY - currentRect.top) / this.zoomLevel;
    
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }; // Round to 2 decimal places
  }
  
  /**
   * Convert editor-relative coordinates to client coordinates
   */
  public editorToClient(editorX: number, editorY: number): { x: number; y: number } {
    const currentRect = this.editorElement.getBoundingClientRect();
    
    const x = (editorX * this.zoomLevel) + currentRect.left;
    const y = (editorY * this.zoomLevel) + currentRect.top;
    
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
  }
  
  /**
   * Get precise drop coordinates that account for all transformations
   */
  public getPreciseDropCoordinates(dragCoords: DragCoordinates): { x: number; y: number } {
    // Update baseline in case of scroll or resize
    this.updateBaseline();
    
    const editorCoords = this.clientToEditor(dragCoords.clientX, dragCoords.clientY);
    
    // Ensure coordinates are within editor bounds
    const currentRect = this.editorElement.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(editorCoords.x, currentRect.width));
    const clampedY = Math.max(0, Math.min(editorCoords.y, currentRect.height));
    
    return { x: clampedX, y: clampedY };
  }
  
  /**
   * Check if coordinates are within editor bounds with tolerance
   */
  public isWithinBounds(clientX: number, clientY: number, tolerance: number = 0): boolean {
    const currentRect = this.editorElement.getBoundingClientRect();
    
    return (
      clientX >= currentRect.left - tolerance &&
      clientX <= currentRect.right + tolerance &&
      clientY >= currentRect.top - tolerance &&
      clientY <= currentRect.bottom + tolerance
    );
  }
}

/**
 * React hook for coordinate mapping with automatic updates
 */
export function useCoordinateMapper(editorElement: HTMLElement | null) {
  const mapperRef = useRef<CoordinateMapper | null>(null);
  
  useEffect(() => {
    if (!editorElement) return;
    
    mapperRef.current = new CoordinateMapper(editorElement);
    
    // Update on scroll and resize
    const handleUpdate = () => {
      mapperRef.current?.updateBaseline();
    };
    
    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate);
    
    // Also update on editor scroll
    let scrollParent = editorElement.parentElement;
    const scrollElements: HTMLElement[] = [];
    
    while (scrollParent) {
      const style = getComputedStyle(scrollParent);
      if (style.overflow !== 'visible' || style.overflowY !== 'visible' || style.overflowX !== 'visible') {
        scrollElements.push(scrollParent);
        scrollParent.addEventListener('scroll', handleUpdate, { passive: true });
      }
      scrollParent = scrollParent.parentElement;
    }
    
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      scrollElements.forEach(el => {
        el.removeEventListener('scroll', handleUpdate);
      });
    };
  }, [editorElement]);
  
  return mapperRef.current;
}