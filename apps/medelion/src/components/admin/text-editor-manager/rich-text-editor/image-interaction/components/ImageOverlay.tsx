'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSemanticColors } from '@/theme';
import { Move, RotateCw, Trash2, Settings } from 'lucide-react';

interface ImageOverlayProps {
  editorElement: HTMLElement;
}

export const ImageOverlay: React.FC<ImageOverlayProps> = ({ editorElement }) => {
  const semanticColors = useSemanticColors();
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

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
          img.style.cursor = 'pointer';
          img.style.userSelect = 'none';
          img.draggable = false;

          // Add click handler
          img.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Image clicked:', img.src.substring(0, 50));
            handleImageSelect(img);
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
  }, [editorElement]);

  const handleImageSelect = useCallback((img: HTMLImageElement) => {
    console.log('✅ Selecting image:', img.src.substring(0, 50));
    setSelectedImage(img);
    setUpdateTrigger(prev => prev + 1); // Force re-render
  }, []);

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
      if (!selectedImage) return;
      
      const target = e.target as HTMLElement;
      if (!target.closest('img') && !target.closest('.image-controls')) {
        console.log('❌ Deselecting image');
        setSelectedImage(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedImage]);

  const getImagePosition = (img: HTMLImageElement) => {
    if (!editorElement || !overlayRef.current) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const imgRect = img.getBoundingClientRect();
    const editorRect = editorElement.getBoundingClientRect();
    const overlayRect = overlayRef.current.getBoundingClientRect();
    
    // Calculate position relative to the editor, then relative to overlay
    const relativeToEditor = {
      x: imgRect.left - editorRect.left,
      y: imgRect.top - editorRect.top,
      width: imgRect.width,
      height: imgRect.height
    };
    
    // Convert to overlay coordinate system
    const position = {
      x: Math.round(relativeToEditor.x + editorRect.left - overlayRect.left),
      y: Math.round(relativeToEditor.y + editorRect.top - overlayRect.top),
      width: Math.round(relativeToEditor.width),
      height: Math.round(relativeToEditor.height)
    };
    
    console.log('📏 Image position calculation:', {
      imgRect: { x: imgRect.left, y: imgRect.top, w: imgRect.width, h: imgRect.height },
      editorRect: { x: editorRect.left, y: editorRect.top, w: editorRect.width, h: editorRect.height },
      overlayRect: { x: overlayRect.left, y: overlayRect.top, w: overlayRect.width, h: overlayRect.height },
      relativeToEditor,
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
            
            {/* Debug info */}
            <div
              className="absolute text-xs bg-black text-white p-1 rounded pointer-events-none font-mono"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y - 30}px`,
                zIndex: 1003,
                whiteSpace: 'nowrap'
              }}
            >
              IMG: {pos.x},{pos.y} {pos.width}×{pos.height}
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

            {/* Toolbar */}
            <div
              className="image-controls absolute flex items-center gap-1 px-2 py-1 rounded-md shadow-lg pointer-events-auto"
              style={{
                top: `${pos.y - 40}px`,
                left: `${pos.x}px`,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1002
              }}
            >
              <button
                className="p-1 rounded hover:bg-gray-100"
                style={{ backgroundColor: '#f3f4f6' }}
                title="Move"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const imgRect = selectedImage.getBoundingClientRect();

                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    
                    selectedImage.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                    
                    // Force overlay update
                    setUpdateTrigger(prev => prev + 1);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    document.body.style.cursor = '';
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                  document.body.style.cursor = 'move';
                }}
              >
                <Move className="w-4 h-4" />
              </button>
              
              <button
                className="p-1 rounded hover:bg-gray-100"
                style={{ backgroundColor: '#f3f4f6' }}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageDelete(selectedImage);
                }}
                className="p-1 rounded hover:bg-red-600"
                style={{ backgroundColor: '#ef4444' }}
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};