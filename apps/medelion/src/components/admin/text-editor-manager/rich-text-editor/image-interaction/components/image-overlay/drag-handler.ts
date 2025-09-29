import { TextWrapSettings } from './types';
import { findInsertionPoint } from './insertion-detection';
import { applyWrapSettings } from './text-wrap';
import { getRangeFromPoint, getAlignmentFromPosition } from './utils';

/**
 * Create and manage the drag placeholder element
 */
export const createDragPlaceholder = (): HTMLDivElement => {
  const placeholder = document.createElement('div');
  placeholder.id = 'drag-placeholder';
  return placeholder;
};

/**
 * Update drag placeholder styling based on precision level
 */
export const updatePlaceholderStyle = (placeholder: HTMLDivElement, isHighPrecision: boolean): void => {
  const height = isHighPrecision ? '1px' : '2px';
  const background = isHighPrecision 
    ? 'linear-gradient(90deg, #10b981, #059669)' 
    : 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
  const borderRadius = isHighPrecision ? '0.5px' : '1px';
  const margin = isHighPrecision ? '2px 0' : '4px 0';
  const boxShadow = isHighPrecision 
    ? '0 0 8px rgba(16, 185, 129, 0.6), 0 1px 2px rgba(0, 0, 0, 0.1)'
    : '0 0 12px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0, 0, 0, 0.1)';

  placeholder.style.height = height;
  placeholder.style.background = background;
  placeholder.style.borderRadius = borderRadius;
  placeholder.style.margin = margin;
  placeholder.style.opacity = '0';
  placeholder.style.transition = 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)';
  placeholder.style.boxShadow = boxShadow;
  placeholder.style.transform = 'scaleX(0)';
  placeholder.style.transformOrigin = 'left center';
  placeholder.style.position = 'relative';
  placeholder.style.pointerEvents = 'none';
};

/**
 * Animate placeholder into view
 */
export const animatePlaceholder = (placeholder: HTMLDivElement, isHighPrecision: boolean): void => {
  requestAnimationFrame(() => {
    placeholder.style.opacity = isHighPrecision ? '0.95' : '0.85';
    placeholder.style.transform = 'scaleX(1)';
    
    // Add subtle pulse for high precision
    if (isHighPrecision) {
      placeholder.style.animation = 'pulse 1s ease-in-out infinite alternate';
    }
  });
};

/**
 * Handle drag movement and placeholder positioning
 */
export const handleDragMovement = (
  e: MouseEvent,
  img: HTMLImageElement,
  editorElement: HTMLElement,
  startPosition: DOMRect,
  startX: number,
  startY: number,
  onDragPositionUpdate: (position: { x: number; y: number }) => void
): void => {
  const editorRect = editorElement.getBoundingClientRect();
  
  // Calculate new position relative to editor
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  const newX = startPosition.left - editorRect.left + deltaX;
  const newY = startPosition.top - editorRect.top + deltaY;
  
  // Apply temporary absolute positioning for smooth dragging
  img.style.position = 'absolute';
  img.style.left = `${Math.max(0, newX)}px`;
  img.style.top = `${Math.max(0, newY)}px`;
  img.style.transform = 'none';
  img.style.zIndex = '1000';
  img.style.opacity = '0.7';
  
  // Track drag position for alignment determination
  onDragPositionUpdate({ x: e.clientX, y: e.clientY });
  
  // Update drop indicator position
  const isInsideEditor = e.clientX >= editorRect.left && 
                        e.clientX <= editorRect.right && 
                        e.clientY >= editorRect.top && 
                        e.clientY <= editorRect.bottom;
  
  let existingPlaceholder = document.getElementById('drag-placeholder') as HTMLDivElement | null;
  
  if (isInsideEditor) {
    const result = findInsertionPoint(e.clientX, e.clientY, editorElement);
    const { element: targetElement, insertBefore, isLineBoundary } = result;
    
    if (targetElement) {
      // Create or update placeholder with enhanced styling
      if (!existingPlaceholder) {
        existingPlaceholder = createDragPlaceholder();
      }
      
      // Update placeholder style based on precision level
      const isHighPrecision = isLineBoundary || false;
      updatePlaceholderStyle(existingPlaceholder, isHighPrecision);
      
      // Position the placeholder with improved logic
      try {
        let insertionSuccessful = false;
        
        if (insertBefore) {
          if (targetElement.parentNode) {
            targetElement.parentNode.insertBefore(existingPlaceholder, targetElement);
            insertionSuccessful = true;
          }
        } else {
          if (targetElement.parentNode) {
            targetElement.parentNode.insertBefore(existingPlaceholder, targetElement.nextSibling);
            insertionSuccessful = true;
          } else if (targetElement === editorElement) {
            // Special case: inserting at the end of editor
            editorElement.appendChild(existingPlaceholder);
            insertionSuccessful = true;
          }
        }
        
        // Animate the placeholder with staggered timing for smoothness
        if (insertionSuccessful) {
          animatePlaceholder(existingPlaceholder, isHighPrecision || false);
        }
      } catch (error) {
        // Fallback: append to editor root
        try {
          if (existingPlaceholder && editorElement) {
            editorElement.appendChild(existingPlaceholder);
            animatePlaceholder(existingPlaceholder, false);
          }
        } catch (fallbackError) {
          console.log('Could not insert placeholder:', fallbackError);
        }
      }
    }
  } else {
    // Remove placeholder if cursor is outside editor
    if (existingPlaceholder) {
      existingPlaceholder.style.transform = 'scaleX(0)';
      existingPlaceholder.style.opacity = '0';
      setTimeout(() => {
        if (existingPlaceholder && existingPlaceholder.parentNode) {
          existingPlaceholder.remove();
        }
      }, 150);
    }
  }
};

/**
 * Handle drag end and image positioning
 */
export const handleDragEnd = (
  e: MouseEvent,
  img: HTMLImageElement,
  editorElement: HTMLElement,
  onSettingsUpdate: (settings: TextWrapSettings) => void
): void => {
  console.log('✅ Finished dragging image');
  
  // Clean up drag placeholder
  const placeholder = document.getElementById('drag-placeholder');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Clear temporary drag positioning
  img.style.position = '';
  img.style.left = '';
  img.style.top = '';
  img.style.zIndex = '';
  img.style.opacity = '';
  
  // Find the closest text node or element to insert the image
  const range = getRangeFromPoint(e.clientX, e.clientY, editorElement);
  if (range && range.startContainer) {
    try {
      // Find the best insertion point
      let insertionPoint = range.startContainer;
      
      // If we're in a text node, go to its parent
      if (insertionPoint.nodeType === Node.TEXT_NODE && insertionPoint.parentNode) {
        insertionPoint = insertionPoint.parentNode;
      }
      
      // If the insertion point is within the editor, move the image there
      if (editorElement.contains(insertionPoint as Node)) {
        try {
          // Find the best insertion target - look for paragraph elements
          let targetElement = insertionPoint as Element;
          while (targetElement && targetElement !== editorElement && 
                 !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(targetElement.tagName)) {
            const parent = targetElement.parentElement;
            if (!parent) break;
            targetElement = parent;
          }
          
          if (targetElement && targetElement.parentNode) {
            // Create a new paragraph for the image
            const wrapper = document.createElement('p');
            wrapper.appendChild(img);
            
            // Insert after the target element
            targetElement.parentNode.insertBefore(wrapper, targetElement.nextSibling);
          } else {
            // Fallback: append to editor
            const wrapper = document.createElement('p');
            wrapper.appendChild(img);
            editorElement.appendChild(wrapper);
          }
        } catch (error) {
          console.log('Drop insertion failed, keeping image in place:', error);
        }
      }
    } catch (error) {
      console.log('📍 Could not determine drop location, keeping current position');
    }
  }
  
  // Determine alignment based on drop position
  const targetAlignment = getAlignmentFromPosition(e.clientX, editorElement);
  console.log('🎯 Drop alignment determined:', targetAlignment);
  
  // Apply settings based on alignment and maintain position
  const dropSettings: TextWrapSettings = {
    mode: targetAlignment === 'center' ? 'topBottom' : 'square',
    alignment: targetAlignment,
    distanceFromText: 15
  };
  
  onSettingsUpdate(dropSettings);
  
  setTimeout(() => {
    applyWrapSettings(dropSettings, img);
    console.log('🎨 Applied alignment after drop:', dropSettings);
  }, 10);
};