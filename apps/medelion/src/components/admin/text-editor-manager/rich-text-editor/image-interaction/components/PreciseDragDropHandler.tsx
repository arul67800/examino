'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';

export interface DragCoordinates {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  offsetX: number;
  offsetY: number;
}

export interface DropTarget {
  element: Element;
  insertBefore: boolean;
  isLineBoundary: boolean;
  coordinates: DragCoordinates;
}

export interface PreciseDragDropConfig {
  editorElement: HTMLElement;
  onDragStart?: (coordinates: DragCoordinates) => void;
  onDragMove?: (coordinates: DragCoordinates, target: DropTarget | null) => void;
  onDragEnd?: (coordinates: DragCoordinates, target: DropTarget | null) => void;
  dragThreshold?: number;
  showVisualFeedback?: boolean;
}

export interface DragPreviewElement {
  element: HTMLElement;
  originalPosition: DOMRect;
  offset: { x: number; y: number };
}

/**
 * PreciseDragDropHandler - A specialized component for handling precise drag-and-drop operations
 * with pixel-perfect positioning and accurate coordinate mapping.
 */
export class PreciseDragDropHandler {
  private config: PreciseDragDropConfig;
  private isDragging = false;
  private dragStartCoords: DragCoordinates | null = null;
  private currentTarget: DropTarget | null = null;
  private dragPreview: DragPreviewElement | null = null;
  private visualIndicator: HTMLElement | null = null;
  private animationFrameId: number | null = null;

  constructor(config: PreciseDragDropConfig) {
    this.config = config;
  }

  /**
   * Cross-browser compatible function to get range from point with enhanced precision
   */
  private getRangeFromPoint(x: number, y: number): Range | null {
    // Try the standard API first (WebKit/Blink)
    if (typeof (document as any).caretRangeFromPoint === 'function') {
      return (document as any).caretRangeFromPoint(x, y);
    }
    
    // Try Firefox API
    if (typeof (document as any).caretPositionFromPoint === 'function') {
      const position = (document as any).caretPositionFromPoint(x, y);
      if (position) {
        const range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        range.collapse(true);
        return range;
      }
    }
    
    // Enhanced fallback with more precision
    const element = document.elementFromPoint(x, y);
    if (element && this.config.editorElement.contains(element)) {
      const range = document.createRange();
      
      // Try to get more precise positioning within the element
      if (element.nodeType === Node.TEXT_NODE) {
        const textNode = element as unknown as Text;
        const textLength = textNode.textContent?.length || 0;
        
        // Use element bounds to estimate character position
        const elementRect = element.parentElement?.getBoundingClientRect();
        if (elementRect) {
          const relativeX = x - elementRect.left;
          const charWidth = elementRect.width / textLength;
          const charPosition = Math.round(relativeX / charWidth);
          const offset = Math.min(Math.max(0, charPosition), textLength);
          
          range.setStart(textNode, offset);
        } else {
          range.setStart(textNode, 0);
        }
      } else {
        range.setStart(element, 0);
      }
      range.collapse(true);
      return range;
    }
    
    return null;
  }

  /**
   * Enhanced insertion point detection with improved coordinate mapping
   */
  private findPreciseInsertionPoint(coordinates: DragCoordinates): DropTarget | null {
    const { clientX, clientY } = coordinates;
    const editorRect = this.config.editorElement.getBoundingClientRect();
    
    // Check if coordinates are within editor bounds
    if (clientX < editorRect.left || clientX > editorRect.right ||
        clientY < editorRect.top || clientY > editorRect.bottom) {
      return null;
    }

    const relativeY = clientY - editorRect.top;
    const relativeX = clientX - editorRect.left;
    
    // Enhanced precision using range API with multiple sampling points
    const samplePoints = [
      { x: clientX, y: clientY },
      { x: clientX - 2, y: clientY },
      { x: clientX + 2, y: clientY },
      { x: clientX, y: clientY - 1 },
      { x: clientX, y: clientY + 1 }
    ];
    
    let bestTarget: DropTarget | null = null;
    let bestDistance = Infinity;
    
    for (const point of samplePoints) {
      try {
        const range = this.getRangeFromPoint(point.x, point.y);
        if (range) {
          const rects = range.getClientRects();
          if (rects.length > 0) {
            const rect = rects[0];
            const lineY = rect.top - editorRect.top;
            const lineBottom = rect.bottom - editorRect.top;
            const lineLeft = rect.left - editorRect.left;
            const lineRight = rect.right - editorRect.left;
            
            // Calculate distance to determine best match
            const centerY = (lineY + lineBottom) / 2;
            const centerX = (lineLeft + lineRight) / 2;
            const distance = Math.sqrt(
              Math.pow(relativeX - centerX, 2) + Math.pow(relativeY - centerY, 2)
            );
            
            if (distance < bestDistance) {
              bestDistance = distance;
              
              let element = range.startContainer;
              if (element.nodeType === Node.TEXT_NODE && element.parentElement) {
                element = element.parentElement;
              }
              
              // Determine insertion position with enhanced precision
              const verticalTolerance = 3;
              const horizontalTolerance = 5;
              
              let insertBefore = false;
              let isLineBoundary = false;
              
              // Enhanced boundary detection
              if (Math.abs(relativeY - lineY) <= verticalTolerance) {
                insertBefore = true;
                isLineBoundary = true;
              } else if (Math.abs(relativeY - lineBottom) <= verticalTolerance) {
                insertBefore = false;
                isLineBoundary = true;
              } else if (relativeY >= lineY && relativeY <= lineBottom) {
                // Within line bounds - use horizontal position
                const charPosition = (relativeX - lineLeft) / (lineRight - lineLeft);
                insertBefore = charPosition < 0.5;
                isLineBoundary = true;
              }
              
              bestTarget = {
                element: element as Element,
                insertBefore,
                isLineBoundary,
                coordinates: { ...coordinates }
              };
            }
          }
        }
      } catch (error) {
        // Continue to next sample point
      }
    }
    
    // Fallback to block-level detection if no precise target found
    if (!bestTarget) {
      const blockElements = this.config.editorElement.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, blockquote');
      let closestElement: Element | null = null;
      let closestDistance = Infinity;
      
      blockElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementY = rect.top - editorRect.top;
        const elementBottom = rect.bottom - editorRect.top;
        const elementCenter = (elementY + elementBottom) / 2;
        
        const distance = Math.abs(relativeY - elementCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestElement = element;
        }
      });
      
      if (closestElement && 'getBoundingClientRect' in closestElement) {
        const rect = (closestElement as Element).getBoundingClientRect();
        const elementY = rect.top - editorRect.top;
        const elementBottom = rect.bottom - editorRect.top;
        
        bestTarget = {
          element: closestElement,
          insertBefore: relativeY < (elementY + elementBottom) / 2,
          isLineBoundary: false,
          coordinates: { ...coordinates }
        };
      }
    }
    
    return bestTarget;
  }

  /**
   * Create or update visual feedback indicators
   */
  private updateVisualFeedback(coordinates: DragCoordinates, target: DropTarget | null): void {
    if (!this.config.showVisualFeedback) return;
    
    // Remove existing indicator
    if (this.visualIndicator) {
      this.visualIndicator.remove();
      this.visualIndicator = null;
    }
    
    if (!target) return;
    
    const editorRect = this.config.editorElement.getBoundingClientRect();
    
    // Create high-precision drop indicator
    this.visualIndicator = document.createElement('div');
    this.visualIndicator.id = 'precise-drop-indicator';
    
    const isHighPrecision = target.isLineBoundary;
    this.visualIndicator.style.cssText = `
      position: absolute;
      height: ${isHighPrecision ? '1px' : '2px'};
      background: ${isHighPrecision 
        ? 'linear-gradient(90deg, #10b981, #059669)' 
        : 'linear-gradient(90deg, #3b82f6, #1d4ed8)'};
      border-radius: ${isHighPrecision ? '0.5px' : '1px'};
      margin: ${isHighPrecision ? '1px 0' : '2px 0'};
      opacity: 0;
      transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: ${isHighPrecision 
        ? '0 0 6px rgba(16, 185, 129, 0.8), 0 1px 2px rgba(0, 0, 0, 0.1)'
        : '0 0 8px rgba(59, 130, 246, 0.6), 0 2px 4px rgba(0, 0, 0, 0.1)'};
      transform: scaleX(0);
      transform-origin: left center;
      pointer-events: none;
      z-index: 10000;
    `;
    
    // Position the indicator precisely
    try {
      let insertionSuccessful = false;
      
      if (target.insertBefore) {
        if (target.element.parentNode) {
          target.element.parentNode.insertBefore(this.visualIndicator, target.element);
          insertionSuccessful = true;
        }
      } else {
        if (target.element.parentNode) {
          target.element.parentNode.insertBefore(this.visualIndicator, target.element.nextSibling);
          insertionSuccessful = true;
        } else if (target.element === this.config.editorElement) {
          this.config.editorElement.appendChild(this.visualIndicator);
          insertionSuccessful = true;
        }
      }
      
      // Animate the indicator
      if (insertionSuccessful) {
        requestAnimationFrame(() => {
          if (this.visualIndicator) {
            this.visualIndicator.style.opacity = isHighPrecision ? '0.95' : '0.85';
            this.visualIndicator.style.transform = 'scaleX(1)';
            
            if (isHighPrecision) {
              this.visualIndicator.style.animation = 'pulse 0.8s ease-in-out infinite alternate';
            }
          }
        });
      }
    } catch (error) {
      console.warn('Could not position visual indicator:', error);
    }
  }

  /**
   * Create precise coordinate mapping from mouse event
   */
  private createCoordinates(event: MouseEvent): DragCoordinates {
    const editorRect = this.config.editorElement.getBoundingClientRect();
    
    return {
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      offsetX: event.clientX - editorRect.left,
      offsetY: event.clientY - editorRect.top
    };
  }

  /**
   * Start drag operation with precise coordinate tracking
   */
  public startDrag(event: MouseEvent, dragElement: HTMLElement): void {
    if (this.isDragging) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.dragStartCoords = this.createCoordinates(event);
    
    // Create drag preview if element provided
    if (dragElement) {
      const rect = dragElement.getBoundingClientRect();
      const editorRect = this.config.editorElement.getBoundingClientRect();
      
      this.dragPreview = {
        element: dragElement,
        originalPosition: rect,
        offset: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        }
      };
    }
    
    // Set up move and end listeners
    document.addEventListener('mousemove', this.handleMouseMove, { passive: false });
    document.addEventListener('mouseup', this.handleMouseUp, { passive: false });
    
    // Prevent text selection and set cursor
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    
    // Notify start
    this.config.onDragStart?.(this.dragStartCoords);
  }

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.dragStartCoords) return;
    
    event.preventDefault();
    
    const currentCoords = this.createCoordinates(event);
    const threshold = this.config.dragThreshold || 5;
    
    // Check if we should start dragging
    if (!this.isDragging) {
      const deltaX = currentCoords.clientX - this.dragStartCoords.clientX;
      const deltaY = currentCoords.clientY - this.dragStartCoords.clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance >= threshold) {
        this.isDragging = true;
      } else {
        return;
      }
    }
    
    // Update drag preview position with precise coordinates
    if (this.dragPreview && this.isDragging) {
      const newX = currentCoords.clientX - this.dragPreview.offset.x;
      const newY = currentCoords.clientY - this.dragPreview.offset.y;
      
      // Apply precise positioning without transforms to prevent coordinate drift
      this.dragPreview.element.style.position = 'fixed';
      this.dragPreview.element.style.left = `${newX}px`;
      this.dragPreview.element.style.top = `${newY}px`;
      this.dragPreview.element.style.transform = 'none';
      this.dragPreview.element.style.zIndex = '10001';
      this.dragPreview.element.style.opacity = '0.8';
      this.dragPreview.element.style.pointerEvents = 'none';
    }
    
    // Find precise insertion target
    const target = this.findPreciseInsertionPoint(currentCoords);
    this.currentTarget = target;
    
    // Update visual feedback with throttling for smooth performance
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      this.updateVisualFeedback(currentCoords, target);
      this.config.onDragMove?.(currentCoords, target);
    });
  };

  private handleMouseUp = (event: MouseEvent): void => {
    const finalCoords = this.createCoordinates(event);
    
    // Clean up
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    // Clean up visual feedback
    if (this.visualIndicator) {
      this.visualIndicator.remove();
      this.visualIndicator = null;
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Restore drag preview element
    if (this.dragPreview) {
      this.dragPreview.element.style.position = '';
      this.dragPreview.element.style.left = '';
      this.dragPreview.element.style.top = '';
      this.dragPreview.element.style.transform = '';
      this.dragPreview.element.style.zIndex = '';
      this.dragPreview.element.style.opacity = '';
      this.dragPreview.element.style.pointerEvents = '';
    }
    
    // Notify end with final coordinates and target
    if (this.isDragging) {
      this.config.onDragEnd?.(finalCoords, this.currentTarget);
    }
    
    // Reset state
    this.isDragging = false;
    this.dragStartCoords = null;
    this.currentTarget = null;
    this.dragPreview = null;
  };

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.isDragging) {
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
    }
    
    if (this.visualIndicator) {
      this.visualIndicator.remove();
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }
}

/**
 * React hook for using PreciseDragDropHandler
 */
export function usePreciseDragDrop(config: PreciseDragDropConfig) {
  const handlerRef = useRef<PreciseDragDropHandler | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<DropTarget | null>(null);
  
  // Create handler instance
  useEffect(() => {
    const enhancedConfig: PreciseDragDropConfig = {
      ...config,
      onDragStart: (coords) => {
        setIsDragging(true);
        config.onDragStart?.(coords);
      },
      onDragMove: (coords, target) => {
        setCurrentTarget(target);
        config.onDragMove?.(coords, target);
      },
      onDragEnd: (coords, target) => {
        setIsDragging(false);
        setCurrentTarget(null);
        config.onDragEnd?.(coords, target);
      }
    };
    
    handlerRef.current = new PreciseDragDropHandler(enhancedConfig);
    
    return () => {
      handlerRef.current?.destroy();
    };
  }, [config.editorElement]);
  
  const startDrag = useCallback((event: MouseEvent, dragElement: HTMLElement) => {
    handlerRef.current?.startDrag(event, dragElement);
  }, []);
  
  return {
    startDrag,
    isDragging,
    currentTarget,
    handler: handlerRef.current
  };
}