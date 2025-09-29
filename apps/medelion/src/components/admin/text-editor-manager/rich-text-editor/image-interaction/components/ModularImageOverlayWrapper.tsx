'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSemanticColors } from '@/theme';
import { Move, Settings, Trash2 } from 'lucide-react';

type TextWrapMode = 'inline' | 'square' | 'topBottom' | 'behindText' | 'inFrontOfText';
type TextAlignment = 'left' | 'right' | 'center' | 'inline';

interface TextWrapSettings {
  mode: TextWrapMode;
  alignment: TextAlignment;
  distanceFromText: number;
}

interface ModularImageOverlayWrapperProps {
  editorElement: HTMLElement;
}

export const ModularImageOverlayWrapper: React.FC<ModularImageOverlayWrapperProps> = ({ editorElement }) => {
  const semanticColors = useSemanticColors();
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showWrapOptions, setShowWrapOptions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{x: number, y: number} | null>(null);
  const [wrapSettings, setWrapSettings] = useState<TextWrapSettings>({
    mode: 'topBottom',
    alignment: 'center',
    distanceFromText: 15
  });
  const overlayRef = useRef<HTMLDivElement>(null);
  const lastPositionRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartPositionRef = useRef<{x: number, y: number} | null>(null);

  // Enhanced coordinate mapper for precise drag-drop positioning
  const coordinateMapper = useRef({
    clientToEditor: (clientX: number, clientY: number) => {
      const editorRect = editorElement.getBoundingClientRect();
      return {
        x: clientX - editorRect.left,
        y: clientY - editorRect.top
      };
    },
    
    // Get precise drop coordinates accounting for scroll and transforms
    getPreciseDropCoordinates: (clientX: number, clientY: number) => {
      const editorRect = editorElement.getBoundingClientRect();
      
      // Account for any editor scrolling
      const editorScrollTop = editorElement.scrollTop;
      const editorScrollLeft = editorElement.scrollLeft;
      
      // Convert to editor-relative coordinates
      const x = clientX - editorRect.left + editorScrollLeft;
      const y = clientY - editorRect.top + editorScrollTop;
      
      return { x: Math.round(x), y: Math.round(y) };
    },
    
    // Check if coordinates are within editor bounds
    isWithinBounds: (clientX: number, clientY: number) => {
      const editorRect = editorElement.getBoundingClientRect();
      return (
        clientX >= editorRect.left &&
        clientX <= editorRect.right &&
        clientY >= editorRect.top &&
        clientY <= editorRect.bottom
      );
    }
  });

  // Cross-browser compatible function to get range from point
  const getRangeFromPoint = useCallback((x: number, y: number): Range | null => {
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
    
    // Fallback: find the closest element
    const element = document.elementFromPoint(x, y);
    if (element && editorElement.contains(element)) {
      const range = document.createRange();
      if (element.nodeType === Node.TEXT_NODE) {
        range.setStart(element, 0);
      } else {
        range.setStart(element, 0);
      }
      range.collapse(true);
      return range;
    }
    
    return null;
  }, [editorElement]);

  // Enhanced insertion point detection with coordinate precision
  const findInsertionPoint = useCallback((x: number, y: number) => {
    const editorRect = editorElement.getBoundingClientRect();
    const relativeY = y - editorRect.top;
    
    console.log('🎯 Finding insertion point:', { x, y, relativeY });
    
    // First, try to get precise line-level detection using range API
    try {
      const range = getRangeFromPoint(x, y);
      if (range) {
        const rects = range.getClientRects();
        if (rects.length > 0) {
          const rect = rects[0];
          const lineY = rect.top - editorRect.top;
          const lineBottom = rect.bottom - editorRect.top;
          
          console.log('📏 Range rect found:', { lineY, lineBottom, relativeY });
          
          // Fine-grained line detection - check if we're between lines
          if (Math.abs(relativeY - lineY) < 5) {
            // Near top of line - insert before
            let element = range.startContainer;
            if (element.nodeType === Node.TEXT_NODE && element.parentElement) {
              element = element.parentElement;
            }
            console.log('⬆️ Inserting before line element');
            return { element: element as Element, insertBefore: true, isLineBoundary: true };
          } else if (Math.abs(relativeY - lineBottom) < 5) {
            // Near bottom of line - insert after
            let element = range.startContainer;
            if (element.nodeType === Node.TEXT_NODE && element.parentElement) {
              element = element.parentElement;
            }
            console.log('⬇️ Inserting after line element');
            return { element: element as Element, insertBefore: false, isLineBoundary: true };
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Range detection failed, falling back to block-level');
    }
    
    // Enhanced block-level detection with better text node awareness
    const walker = document.createTreeWalker(
      editorElement,
      NodeFilter.SHOW_ALL,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text && text.length > 0) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }
          
          const element = node as Element;
          if (element.tagName) {
            const style = getComputedStyle(element);
            const isBlock = style.display === 'block' || 
                           style.display === 'list-item' ||
                           ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'BR'].includes(element.tagName);
            if (isBlock) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }
          
          return NodeFilter.FILTER_SKIP;
        }
      }
    );
    
    const candidates: Array<{element: Node, rect: DOMRect, isText: boolean}> = [];
    let node;
    
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        // For text nodes, create a range to get precise positioning
        try {
          const textRange = document.createRange();
          textRange.selectNodeContents(node);
          const rects = textRange.getClientRects();
          for (let i = 0; i < rects.length; i++) {
            candidates.push({
              element: node,
              rect: rects[i],
              isText: true
            });
          }
        } catch (error) {
          // Skip if range creation fails
        }
      } else {
        // For elements, use their bounding rect
        const rect = (node as Element).getBoundingClientRect();
        if (rect.height > 0) {
          candidates.push({
            element: node,
            rect: rect,
            isText: false
          });
        }
      }
    }
    
    // Sort candidates by Y position for precise insertion
    candidates.sort((a, b) => a.rect.top - b.rect.top);
    
    console.log('📋 Found candidates:', candidates.length);
    
    // Find the best insertion point with fine-grained control
    let bestCandidate: {element: Node, insertBefore: boolean} | null = null;
    const tolerance = 8; // pixels of tolerance for line detection
    
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const candidateY = candidate.rect.top - editorRect.top;
      const candidateBottom = candidate.rect.bottom - editorRect.top;
      
      // Check if we're very close to the top of this line/element
      if (Math.abs(relativeY - candidateY) <= tolerance && relativeY <= candidateY + tolerance) {
        bestCandidate = { element: candidate.element, insertBefore: true };
        console.log('🎯 Found top insertion point');
        break;
      }
      
      // Check if we're very close to the bottom of this line/element  
      if (Math.abs(relativeY - candidateBottom) <= tolerance && relativeY >= candidateBottom - tolerance) {
        bestCandidate = { element: candidate.element, insertBefore: false };
        console.log('🎯 Found bottom insertion point');
        break;
      }
      
      // Check if we're between this and the next candidate
      if (i < candidates.length - 1) {
        const nextCandidate = candidates[i + 1];
        const nextCandidateY = nextCandidate.rect.top - editorRect.top;
        
        if (relativeY > candidateBottom && relativeY < nextCandidateY) {
          // We're in the gap between elements - choose the closer one
          const distToCurrent = relativeY - candidateBottom;
          const distToNext = nextCandidateY - relativeY;
          
          if (distToCurrent <= distToNext) {
            bestCandidate = { element: candidate.element, insertBefore: false };
            console.log('🎯 Found gap insertion point (closer to current)');
          } else {
            bestCandidate = { element: nextCandidate.element, insertBefore: true };
            console.log('🎯 Found gap insertion point (closer to next)');
          }
          break;
        }
      }
      
      // If this is the last candidate and we're below it
      if (i === candidates.length - 1 && relativeY > candidateBottom) {
        bestCandidate = { element: candidate.element, insertBefore: false };
        console.log('🎯 Found end insertion point');
        break;
      }
    }
    
    if (bestCandidate) {
      // Find the appropriate parent element for insertion
      let targetElement = bestCandidate.element;
      
      if (targetElement.nodeType === Node.TEXT_NODE) {
        const parent = targetElement.parentElement || targetElement.parentNode;
        if (!parent) return { element: editorElement, insertBefore: false, isLineBoundary: false };
        targetElement = parent;
      }
      
      // Walk up to find a suitable block element
      while (targetElement && targetElement !== editorElement && 
             targetElement.nodeType === Node.ELEMENT_NODE) {
        const element = targetElement as Element;
        const style = getComputedStyle(element);
        const isBlock = style.display === 'block' ||
                       ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE'].includes(element.tagName);
        
        if (isBlock) {
          console.log('✅ Found block element for insertion');
          return { 
            element: element, 
            insertBefore: bestCandidate.insertBefore,
            isLineBoundary: true
          };
        }
        
        const parent = targetElement.parentElement || targetElement.parentNode;
        if (!parent) break;
        targetElement = parent;
      }
    }
    
    // Fallback: insert at the end of the editor
    console.log('🔄 Using fallback insertion point');
    return { 
      element: editorElement.lastElementChild || editorElement, 
      insertBefore: false,
      isLineBoundary: false
    };
  }, [editorElement, getRangeFromPoint]);

  // Determine alignment based on horizontal position
  const getAlignmentFromPosition = useCallback((x: number, targetElement?: Element) => {
    const editorRect = editorElement.getBoundingClientRect();
    const relativeX = x - editorRect.left;
    const editorWidth = editorRect.width;
    
    // If we have a target element, use its bounds for more precise alignment
    if (targetElement) {
      const targetRect = targetElement.getBoundingClientRect();
      const targetRelativeX = x - targetRect.left;
      const targetWidth = targetRect.width;
      
      const leftThreshold = targetWidth * 0.25;
      const rightThreshold = targetWidth * 0.75;
      
      if (targetRelativeX < leftThreshold) return 'left';
      if (targetRelativeX > rightThreshold) return 'right';
      return 'center';
    }
    
    // Fallback to editor-wide positioning
    const leftThreshold = editorWidth * 0.25;
    const rightThreshold = editorWidth * 0.75;
    
    if (relativeX < leftThreshold) return 'left';
    if (relativeX > rightThreshold) return 'right';
    return 'center';
  }, [editorElement]);

  // Apply wrap settings to an image
  const applyWrapSettings = useCallback((settings: TextWrapSettings, targetImage?: HTMLImageElement) => {
    const img = targetImage || selectedImage;
    if (!img) return;
    
    console.log('🎨 Applying wrap settings:', settings);
    
    // Clear any existing styles
    img.style.float = '';
    img.style.position = '';
    img.style.zIndex = '';
    img.style.margin = '';
    img.style.display = '';
    img.style.clear = '';
    img.style.verticalAlign = '';
    
    const distance = settings.distanceFromText;
    const gap = `${distance}px`;
    
    switch (settings.mode) {
      case 'inline':
        img.style.display = 'inline';
        img.style.verticalAlign = 'middle';
        img.style.margin = distance > 0 ? `0 ${gap}` : '0';
        break;
        
      case 'square':
        if (settings.alignment === 'center') {
          img.style.display = 'block';
          img.style.margin = distance > 0 ? `${gap} auto` : '0 auto';
        } else {
          img.style.float = settings.alignment === 'left' ? 'left' : 'right';
          if (distance > 0) {
            img.style.margin = settings.alignment === 'left' 
              ? `0 ${gap} ${gap} 0`
              : `0 0 ${gap} ${gap}`;
          }
        }
        break;
        
      case 'topBottom':
        if (settings.alignment === 'center') {
          img.style.display = 'block';
          img.style.clear = 'both';
          img.style.margin = distance > 0 ? `${gap} auto` : '0 auto';
        } else {
          // For left/right in topBottom mode, use float for proper text wrapping
          img.style.display = 'block';
          img.style.float = settings.alignment === 'left' ? 'left' : 'right';
          img.style.clear = 'none'; // Allow floating
          if (distance > 0) {
            img.style.margin = settings.alignment === 'left' 
              ? `0 ${gap} ${gap} 0`
              : `0 0 ${gap} ${gap}`;
          } else {
            img.style.margin = '0';
          }
        }
        
        // Force text reflow by triggering layout recalculation
        const container = img.parentElement;
        if (container) {
          container.style.display = 'none';
          container.offsetHeight; // Force reflow
          container.style.display = '';
        }
        break;
        
      case 'behindText':
        img.style.position = 'absolute';
        img.style.zIndex = '-1';
        img.style.pointerEvents = 'none'; // Allow text selection over image
        break;
        
      case 'inFrontOfText':
        img.style.position = 'absolute';
        img.style.zIndex = '999';
        break;
    }
    
    // Force repaint to ensure changes are visible
    img.offsetHeight;
  }, [selectedImage]);

  const handleImageSelect = useCallback((img: HTMLImageElement) => {
    console.log('✅ Selecting image:', img.src.substring(0, 50));
    setSelectedImage(img);
    
    // Detect current alignment from image styling
    const computedStyle = getComputedStyle(img);
    let currentAlignment: TextAlignment = 'center';
    let currentMode: TextWrapMode = 'topBottom';
    
    // Check float property first
    if (computedStyle.float === 'left') {
      currentAlignment = 'left';
      currentMode = 'topBottom'; // Use topBottom for floating images
    } else if (computedStyle.float === 'right') {
      currentAlignment = 'right';
      currentMode = 'topBottom'; // Use topBottom for floating images
    } else if (computedStyle.display === 'block') {
      // Check margin for alignment hints
      const marginLeft = computedStyle.marginLeft;
      const marginRight = computedStyle.marginRight;
      
      if (marginLeft === '0px' || marginLeft === '0') {
        if (marginRight === 'auto') {
          currentAlignment = 'left';
        }
      } else if (marginRight === '0px' || marginRight === '0') {
        if (marginLeft === 'auto') {
          currentAlignment = 'right';
        }
      } else if (marginLeft === 'auto' && marginRight === 'auto') {
        currentAlignment = 'center';
      }
      currentMode = 'topBottom';
    }
    
    const detectedSettings: TextWrapSettings = {
      mode: currentMode,
      alignment: currentAlignment,
      distanceFromText: 15
    };
    
    console.log('🔍 Detected current settings:', detectedSettings);
    setWrapSettings(detectedSettings);
    
    setUpdateTrigger(prev => prev + 1); // Force re-render
  }, []);

  // Initialize image tracking
  useEffect(() => {
    if (!editorElement) return;

    const updateImages = () => {
      const imageElements = editorElement.querySelectorAll('img');
      console.log('🖼️ Found images:', imageElements.length);
      
      imageElements.forEach((img) => {
        // Make images interactive
        if (!img.dataset.interactive) {
          img.dataset.interactive = 'true';
          img.style.cursor = 'move';
          img.style.userSelect = 'none';
          img.draggable = false;

          // Add click handler for selection
          img.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Image clicked:', img.src.substring(0, 50));
            handleImageSelect(img);
          });

          // Add drag functionality with enhanced coordinate mapping
          let dragStarted = false;
          let dragThreshold = 5; // pixels to move before starting drag
          
          img.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Select the image first
            handleImageSelect(img);
            
            const startX = e.clientX;
            const startY = e.clientY;
            const startPosition = img.getBoundingClientRect();
            const editorRect = editorElement.getBoundingClientRect();
            dragStarted = false;

            // Store precise start coordinates for accurate drop calculation
            dragStartPositionRef.current = {
              x: startX,
              y: startY
            };

            const handleMouseMove = (e: MouseEvent) => {
              const deltaX = e.clientX - startX;
              const deltaY = e.clientY - startY;
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              
              // Only start dragging after moving threshold distance
              if (!dragStarted && distance > dragThreshold) {
                dragStarted = true;
                document.body.style.cursor = 'move';
                document.body.style.userSelect = 'none';
                setIsDragging(true);
                // Close settings menu when dragging starts
                setShowWrapOptions(false);
                
                console.log('🎯 Starting enhanced drag with precise coordinates');
              }
              
              if (dragStarted) {
                // Get editor bounds for calculations with precise coordinate mapping
                const currentEditorRect = editorElement.getBoundingClientRect();
                
                // Use coordinate mapper for precise positioning
                const preciseCoords = coordinateMapper.current.getPreciseDropCoordinates(e.clientX, e.clientY);
                
                // Apply direct positioning without transform to prevent coordinate drift
                img.style.position = 'fixed'; // Use fixed instead of absolute for precise pixel alignment
                img.style.left = `${e.clientX - (startX - startPosition.left)}px`;
                img.style.top = `${e.clientY - (startY - startPosition.top)}px`;
                img.style.transform = 'none';
                img.style.zIndex = '1000';
                img.style.opacity = '0.8';
                
                // Track drag position for alignment determination with enhanced precision
                setDragPosition({ x: e.clientX, y: e.clientY });
                
                // Update drop indicator position with coordinate mapping
                const isInsideEditor = coordinateMapper.current.isWithinBounds(e.clientX, e.clientY);
                
                let existingPlaceholder = document.getElementById('drag-placeholder');
                
                if (isInsideEditor) {
                  const result = findInsertionPoint(e.clientX, e.clientY);
                  const { element: targetElement, insertBefore, isLineBoundary } = result;
                  
                  console.log('🎯 Drop target found:', { targetElement: targetElement.tagName, insertBefore, isLineBoundary });
                  
                  if (targetElement) {
                    // Create or update placeholder with enhanced styling
                    if (!existingPlaceholder) {
                      existingPlaceholder = document.createElement('div');
                      existingPlaceholder.id = 'drag-placeholder';
                    }
                    
                    // Update placeholder style based on precision level
                    const isHighPrecision = isLineBoundary;
                    existingPlaceholder.style.cssText = `
                      height: ${isHighPrecision ? '1px' : '2px'};
                      background: ${isHighPrecision 
                        ? 'linear-gradient(90deg, #10b981, #059669)' 
                        : 'linear-gradient(90deg, #3b82f6, #1d4ed8)'};
                      border-radius: ${isHighPrecision ? '0.5px' : '1px'};
                      margin: ${isHighPrecision ? '2px 0' : '4px 0'};
                      opacity: 0;
                      transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
                      box-shadow: ${isHighPrecision 
                        ? '0 0 8px rgba(16, 185, 129, 0.8), 0 1px 2px rgba(0, 0, 0, 0.1)'
                        : '0 0 12px rgba(59, 130, 246, 0.6), 0 2px 4px rgba(0, 0, 0, 0.1)'};
                      transform: scaleX(0);
                      transform-origin: left center;
                      position: relative;
                      pointer-events: none;
                    `;
                    
                    // Position the placeholder with improved logic and coordinate precision
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
                      
                      // Animate the placeholder with enhanced timing
                      if (insertionSuccessful) {
                        requestAnimationFrame(() => {
                          if (existingPlaceholder) {
                            existingPlaceholder.style.opacity = isHighPrecision ? '0.95' : '0.85';
                            existingPlaceholder.style.transform = 'scaleX(1)';
                            
                            // Add subtle pulse for high precision
                            if (isHighPrecision) {
                              existingPlaceholder.style.animation = 'pulse 0.8s ease-in-out infinite alternate';
                            }
                          }
                        });
                      }
                    } catch (error) {
                      console.log('⚠️ Could not insert placeholder:', error);
                      // Fallback: append to editor root
                      try {
                        if (existingPlaceholder && editorElement) {
                          editorElement.appendChild(existingPlaceholder);
                          requestAnimationFrame(() => {
                            if (existingPlaceholder) {
                              existingPlaceholder.style.opacity = '0.7';
                              existingPlaceholder.style.transform = 'scaleX(1)';
                            }
                          });
                        }
                      } catch (fallbackError) {
                        console.log('❌ Placeholder insertion fallback failed:', fallbackError);
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
                
                // Throttle overlay updates during drag for performance
                if (throttleTimeoutRef.current) {
                  clearTimeout(throttleTimeoutRef.current);
                }
                throttleTimeoutRef.current = setTimeout(() => {
                  setUpdateTrigger(prev => prev + 1);
                }, 16); // ~60fps
              }
            };

            const handleMouseUp = (e: MouseEvent) => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
              document.body.style.cursor = '';
              document.body.style.userSelect = '';
              setIsDragging(false);
              setDragPosition(null);
              
              if (dragStarted) {
                console.log('✅ Finished drag with enhanced coordinates');
                
                // Get precise drop coordinates using enhanced coordinate mapper
                const finalCoords = coordinateMapper.current.getPreciseDropCoordinates(e.clientX, e.clientY);
                console.log('📍 Final drop coordinates:', finalCoords);
                
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
                img.style.opacity = ''; // Restore full opacity
                
                // Find insertion point using the exact drop coordinates  
                const range = getRangeFromPoint(e.clientX, e.clientY);
                if (range && range.startContainer) {
                  try {
                    // Find the best insertion point using enhanced detection
                    const insertionResult = findInsertionPoint(e.clientX, e.clientY);
                    const { element: targetElement, insertBefore } = insertionResult;
                    
                    console.log('🎯 Final insertion target:', { 
                      element: targetElement.tagName, 
                      insertBefore,
                      dropCoords: finalCoords 
                    });
                    
                    // If the insertion point is within the editor, move the image there
                    if (editorElement.contains(targetElement as Node)) {
                      try {
                        // Create a new paragraph for the image to ensure proper layout
                        const wrapper = document.createElement('p');
                        wrapper.appendChild(img);
                        
                        if (insertBefore) {
                          if (targetElement.parentNode) {
                            targetElement.parentNode.insertBefore(wrapper, targetElement);
                            console.log('✅ Inserted image before target element');
                          } else {
                            editorElement.appendChild(wrapper);
                            console.log('✅ Appended image to editor (no parent)');
                          }
                        } else {
                          if (targetElement.parentNode) {
                            targetElement.parentNode.insertBefore(wrapper, targetElement.nextSibling);
                            console.log('✅ Inserted image after target element');
                          } else {
                            editorElement.appendChild(wrapper);
                            console.log('✅ Appended image to editor (end)');
                          }
                        }
                      } catch (error) {
                        console.log('❌ Drop insertion failed, keeping image in place:', error);
                        // If all else fails, just keep the image where it was
                      }
                    }
                  } catch (error) {
                    console.log('⚠️ Could not determine precise drop location:', error);
                  }
                }
                
                // Determine alignment based on precise drop position
                const targetAlignment = getAlignmentFromPosition(e.clientX) as TextAlignment;
                console.log('🎯 Drop alignment determined with precision:', targetAlignment);
                
                // Apply settings based on alignment - use topBottom for all alignments since it handles floating properly
                const dropSettings: TextWrapSettings = {
                  mode: 'topBottom', // topBottom mode now handles all alignments including floating left/right
                  alignment: targetAlignment,
                  distanceFromText: 15
                };
                
                setWrapSettings(dropSettings);
                
                setTimeout(() => {
                  applyWrapSettings(dropSettings, img);
                  setUpdateTrigger(prev => prev + 1);
                  console.log('🎨 Applied precise alignment after drop:', dropSettings);
                }, 10);
              }
              dragStarted = false;
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          });
        }
      });
    };

    // Initial setup
    updateImages();

    // Watch for changes in the editor
    const observer = new MutationObserver(() => {
      console.log('🔄 DOM changed, updating images');
      updateImages();
    });
    observer.observe(editorElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });

    return () => {
      observer.disconnect();
    };
  }, [editorElement, handleImageSelect, findInsertionPoint, getRangeFromPoint, getAlignmentFromPosition, applyWrapSettings]);

  // High-frequency position monitoring for selected image
  useEffect(() => {
    if (!selectedImage) return;

    let lastPosition = { x: 0, y: 0, width: 0, height: 0 };
    let animationFrameId: number;

    const monitorPosition = () => {
      const rect = selectedImage.getBoundingClientRect();
      const currentPosition = {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };

      // Only update if position actually changed
      if (
        currentPosition.x !== lastPosition.x ||
        currentPosition.y !== lastPosition.y ||
        currentPosition.width !== lastPosition.width ||
        currentPosition.height !== lastPosition.height
      ) {
        lastPosition = currentPosition;
        setUpdateTrigger(prev => prev + 1);
        console.log('🎯 Position changed:', currentPosition);
      }

      animationFrameId = requestAnimationFrame(monitorPosition);
    };

    // Start monitoring
    animationFrameId = requestAnimationFrame(monitorPosition);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectedImage]);

  const handleImageDelete = useCallback((img: HTMLImageElement) => {
    console.log('🗑️ Deleting image:', img.src.substring(0, 50));
    img.remove();
    setSelectedImage(null);
  }, []);

  // Handle clicks outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!selectedImage || isDragging) return; // Don't deselect during drag
      
      const target = e.target as HTMLElement;
      if (!target.closest('img') && 
          !target.closest('.image-controls') && 
          !target.closest('[data-settings-dropdown]')) {
        console.log('❌ Deselecting image');
        setSelectedImage(null);
        setShowWrapOptions(false); // Close settings when deselecting
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedImage, isDragging]);

  const getImagePosition = (img: HTMLImageElement) => {
    if (!editorElement || !overlayRef.current) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const imgRect = img.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();
    
    // Calculate position relative to the overlay container
    // The overlay is positioned absolutely within its container, so we need
    // to calculate the image position relative to the overlay's coordinate system
    const position = {
      x: Math.round(imgRect.left - overlayRect.left),
      y: Math.round(imgRect.top - overlayRect.top),
      width: Math.round(imgRect.width),
      height: Math.round(imgRect.height)
    };
    
    console.log('📏 Fixed image position calculation:', {
      imgRect: { x: imgRect.left, y: imgRect.top, w: imgRect.width, h: imgRect.height },
      overlayRect: { x: overlayRect.left, y: overlayRect.top, w: overlayRect.width, h: overlayRect.height },
      finalPosition: position
    });
    
    return position;
  };

  // Force update positions when scrolling or resizing
  useEffect(() => {
    const handleUpdate = () => {
      setUpdateTrigger(prev => prev + 1);
    };

    const handleScroll = () => {
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(handleUpdate);
    };
    
    const handleResize = () => {
      requestAnimationFrame(handleUpdate);
    };

    // Listen for scroll events on all parent containers
    let element = editorElement?.parentElement;
    const scrollElements: HTMLElement[] = [];
    
    while (element) {
      const style = getComputedStyle(element);
      if (style.overflow !== 'visible' || style.overflowY !== 'visible' || style.overflowX !== 'visible') {
        scrollElements.push(element);
        element.addEventListener('scroll', handleScroll, { passive: true });
      }
      element = element.parentElement;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Also listen for image load events to update positioning
    if (selectedImage) {
      selectedImage.addEventListener('load', handleUpdate);
    }

    return () => {
      scrollElements.forEach(el => {
        el.removeEventListener('scroll', handleScroll);
      });
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (selectedImage) {
        selectedImage.removeEventListener('load', handleUpdate);
      }
    };
  }, [editorElement, selectedImage]);

  return (
    <>
      {/* Add CSS for drag placeholder animations */}
      <style jsx>{`
        @keyframes pulse {
          from { box-shadow: 0 0 8px rgba(16, 185, 129, 0.6), 0 1px 2px rgba(0, 0, 0, 0.1); }
          to { box-shadow: 0 0 16px rgba(16, 185, 129, 0.8), 0 2px 4px rgba(0, 0, 0, 0.2); }
        }
      `}</style>
      
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          zIndex: 1000 
        }}
      >
      {selectedImage && (() => {
        const pos = getImagePosition(selectedImage);
        
        // Force re-render when position updates
        const key = `${selectedImage.src}-${updateTrigger}`;
        
        console.log('🎨 Rendering overlay for selected image:', { pos, key });
        
        return (
          <div key={key}>
            {/* Selection Border */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${pos.width}px`,
                height: `${pos.height}px`,
                border: '2px solid #3b82f6',
                borderRadius: '2px',
                boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.8), 0 0 10px rgba(59, 130, 246, 0.3)`,
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                // Force pixel alignment
                transform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden'
              }}
            />
            
            {/* Debug info with alignment preview */}
            <div
              className="absolute text-xs bg-black text-white p-1 rounded pointer-events-none font-mono"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y - 30}px`,
                zIndex: 1003,
                whiteSpace: 'nowrap'
              }}
            >
              {isDragging && dragPosition ? (
                `Drop: ${getAlignmentFromPosition(dragPosition.x)} | ${pos.width}×${pos.height} | Precise`
              ) : (
                `${wrapSettings.mode}:${wrapSettings.alignment} | ${pos.width}×${pos.height}`
              )}
            </div>

            {/* Resize Handles */}
            {(() => {
              const handleSize = 12; // w-3 h-3 = 12px
              const handleOffset = handleSize / 2; // 6px to center the handle
              
              return [
                { handlePos: 'nw', top: Math.round(pos.y - handleOffset), left: Math.round(pos.x - handleOffset), cursor: 'nw-resize' },
                { handlePos: 'ne', top: Math.round(pos.y - handleOffset), left: Math.round(pos.x + pos.width - handleOffset), cursor: 'ne-resize' },
                { handlePos: 'sw', top: Math.round(pos.y + pos.height - handleOffset), left: Math.round(pos.x - handleOffset), cursor: 'sw-resize' },
                { handlePos: 'se', top: Math.round(pos.y + pos.height - handleOffset), left: Math.round(pos.x + pos.width - handleOffset), cursor: 'se-resize' }
              ];
            })().map(({ handlePos, top, left, cursor }) => (
              <div
                key={handlePos}
                className="absolute w-3 h-3 rounded-full pointer-events-auto"
                style={{
                  top: `${top}px`,
                  left: `${left}px`,
                  backgroundColor: '#3b82f6',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  cursor,
                  zIndex: 1001,
                  // Force pixel alignment
                  transform: 'translate3d(0, 0, 0)',
                  backfaceVisibility: 'hidden'
                }}
                title={`Resize ${handlePos} (${left},${top})`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startWidth = selectedImage.offsetWidth;
                  const startHeight = selectedImage.offsetHeight;
                  const aspectRatio = startWidth / startHeight;

                  console.log(`🎯 Starting resize ${handlePos}:`, { startX, startY, startWidth, startHeight, aspectRatio });

                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    
                    let newWidth = startWidth;
                    let newHeight = startHeight;

                    switch (handlePos) {
                      case 'se':
                        newWidth = Math.max(50, startWidth + deltaX);
                        newHeight = newWidth / aspectRatio;
                        break;
                      case 'sw':
                        newWidth = Math.max(50, startWidth - deltaX);
                        newHeight = newWidth / aspectRatio;
                        break;
                      case 'ne':
                        newWidth = Math.max(50, startWidth + deltaX);
                        newHeight = newWidth / aspectRatio;
                        break;
                      case 'nw':
                        newWidth = Math.max(50, startWidth - deltaX);
                        newHeight = newWidth / aspectRatio;
                        break;
                    }

                    console.log(`🔄 Resizing ${handlePos}:`, { deltaX, deltaY, newWidth, newHeight });

                    selectedImage.style.width = `${newWidth}px`;
                    selectedImage.style.height = `${newHeight}px`;
                    
                    // Force overlay update
                    setUpdateTrigger(prev => prev + 1);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                    console.log(`✅ Finished resizing ${handlePos}`);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                  document.body.style.cursor = cursor;
                  document.body.style.userSelect = 'none';
                }}
              />
            ))}

            {/* Toolbar - positioned at top-right of image */}
            <div
              className="image-controls absolute flex items-center gap-1 p-1 rounded pointer-events-auto"
              style={{
                top: `${pos.y - 8}px`,
                left: `${pos.x + pos.width - 100}px`, // Reduced width since no convert button
                backgroundColor: semanticColors.surface.primary,
                border: `1px solid ${semanticColors.border.primary}`,
                boxShadow: `0 2px 8px ${semanticColors.shadow.medium}`,
                zIndex: 1002,
                transform: 'translateY(-100%)' // Move above the image
              }}
            >
              <button
                className="p-1 rounded transition-colors"
                style={{ 
                  backgroundColor: showWrapOptions ? '#3b82f6' : 'transparent',
                  color: showWrapOptions ? 'white' : semanticColors.text.secondary
                }}
                onMouseEnter={(e) => {
                  if (!showWrapOptions) {
                    e.currentTarget.style.backgroundColor = semanticColors.surface.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showWrapOptions) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDragging) { // Only toggle settings if not dragging
                    console.log('⚙️ Toggling text wrap settings');
                    setShowWrapOptions(!showWrapOptions);
                  }
                }}
                title="Text Wrap Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageDelete(selectedImage);
                }}
                className="p-1 rounded transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: semanticColors.status.error
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = semanticColors.status.error + '20'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}
      
      {/* Compact Settings Dropdown */}
      {showWrapOptions && selectedImage && !isDragging && (() => {
        const pos = getImagePosition(selectedImage);
        const toolbarY = pos.y - 35; // Position above the toolbar
        const toolbarX = pos.x + pos.width - 250; // Align with right side, accounting for dropdown width
        
        return (
          <>
            {/* Invisible backdrop to close dropdown */}
            <div
              className="fixed inset-0"
              style={{ zIndex: 1001 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowWrapOptions(false);
              }}
            />
            
            {/* Compact Settings Dropdown */}
            <div
              data-settings-dropdown="true"
              className="absolute p-3 rounded-lg shadow-lg border"
              style={{
                left: `${Math.max(10, toolbarX)}px`,
                top: `${Math.max(10, toolbarY - 180)}px`, // Position above toolbar with some spacing
                zIndex: 1002,
                backgroundColor: semanticColors.surface.primary,
                borderColor: semanticColors.border.primary,
                boxShadow: `0 8px 24px ${semanticColors.shadow.medium}`,
                width: '240px',
                maxHeight: '200px',
                fontSize: '13px'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium" style={{ color: semanticColors.text.primary }}>
                  Text Wrap
                </h4>
                <button
                  className="p-1 rounded transition-colors hover:bg-opacity-20"
                  style={{
                    color: semanticColors.text.secondary,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = semanticColors.status.error + '20'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowWrapOptions(false);
                  }}
                  title="Close"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {/* Text Wrap Mode Buttons */}
                <div className="grid grid-cols-2 gap-1">
                  {([
                    { mode: 'inline', label: 'Inline', icon: '📝' },
                    { mode: 'square', label: 'Wrap', icon: '📦' },
                    { mode: 'topBottom', label: 'Break', icon: '⬆️⬇️' },
                    { mode: 'behindText', label: 'Behind', icon: '🔄' },
                    { mode: 'inFrontOfText', label: 'Front', icon: '🔝' },
                    { mode: 'none', label: 'None', icon: '🚫' }
                  ] as Array<{mode: TextWrapMode | 'none', label: string, icon: string}>).map(({ mode, label, icon }) => (
                    <button
                      key={mode}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors border"
                      style={{
                        backgroundColor: wrapSettings.mode === mode ? semanticColors.action.primary : semanticColors.surface.secondary,
                        color: wrapSettings.mode === mode ? semanticColors.surface.primary : semanticColors.text.primary,
                        borderColor: wrapSettings.mode === mode ? semanticColors.action.primary : semanticColors.border.secondary,
                        fontSize: '11px'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newMode = mode === 'none' ? 'inline' : mode as TextWrapMode;
                        const newSettings = { ...wrapSettings, mode: newMode };
                        setWrapSettings(newSettings);
                        console.log('🎛️ Changed wrap mode to:', newMode);
                        applyWrapSettings(newSettings);
                      }}
                      title={`${label} text wrapping`}
                    >
                      <span>{icon}</span>
                      <span className="leading-none">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Alignment options for square and topBottom modes */}
                {(wrapSettings.mode === 'square' || wrapSettings.mode === 'topBottom') && (
                  <div className="pt-1">
                    <div className="flex gap-1">
                      {(['left', 'right', 'center'] as TextAlignment[]).map((align) => (
                        <button
                          key={align}
                          className="px-2 py-1 text-xs rounded transition-colors flex-1"
                          style={{
                            backgroundColor: wrapSettings.alignment === align ? semanticColors.action.primary : semanticColors.surface.secondary,
                            color: wrapSettings.alignment === align ? semanticColors.surface.primary : semanticColors.text.primary,
                            fontSize: '10px'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newSettings = { ...wrapSettings, alignment: align };
                            setWrapSettings(newSettings);
                            applyWrapSettings(newSettings);
                          }}
                        >
                          {align.charAt(0).toUpperCase() + align.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Distance slider */}
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs flex-shrink-0" style={{ color: semanticColors.text.secondary, fontSize: '10px' }}>
                      Gap: {wrapSettings.distanceFromText}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="5"
                      value={wrapSettings.distanceFromText}
                      onChange={(e) => {
                        const newSettings = { ...wrapSettings, distanceFromText: parseInt(e.target.value) };
                        setWrapSettings(newSettings);
                        applyWrapSettings(newSettings);
                      }}
                      className="flex-1 h-1"
                      style={{ 
                        accentColor: semanticColors.action.primary,
                        height: '4px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
      </div>
    </>
  );
};