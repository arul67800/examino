'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSemanticColors } from '@/theme';
import { Move, RotateCw, Settings, Trash2, Grip } from 'lucide-react';
import { TextWrapEngine } from '../utils/TextWrapEngine';
import { ImagePosition, TextWrapSettings, TextWrapMode, TextAlignment } from '../types';

interface MovableImageProps {
  src: string;
  alt?: string;
  imageId?: string;
  initialPosition: ImagePosition;
  initialWrapSettings?: TextWrapSettings;
  onPositionChange?: (position: ImagePosition) => void;
  onWrapSettingsChange?: (settings: TextWrapSettings) => void;
  onDelete?: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
  editorElement?: HTMLElement;
}

export const MovableImage: React.FC<MovableImageProps> = ({
  src,
  alt = '',
  imageId,
  initialPosition,
  initialWrapSettings = {
    mode: 'square',
    alignment: 'left',
    distanceFromText: 15
  },
  onPositionChange,
  onWrapSettingsChange,
  onDelete,
  isSelected = false,
  onSelect,
  editorElement
}) => {
  const semanticColors = useSemanticColors();
  const imageRef = useRef<HTMLImageElement>(null);
  const settingsToggleRef = useRef<boolean>(false);
  const [position, setPosition] = useState<ImagePosition>(initialPosition);
  const [wrapSettings, setWrapSettings] = useState<TextWrapSettings>(initialWrapSettings);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showWrapOptions, setShowWrapOptions] = useState(false);
  
  // Debug log for settings panel state
  useEffect(() => {
    console.log('🎛️ showWrapOptions changed:', showWrapOptions, 'for imageId:', imageId, 'isSelected:', isSelected);
  }, [showWrapOptions, imageId, isSelected]);

  // Listen for auto-open settings events
  useEffect(() => {
    const handleAutoOpenSettings = (event: CustomEvent) => {
      const { imageId: targetImageId } = event.detail;
      console.log('🎯 Received autoOpenSettings event for:', targetImageId, 'current imageId:', imageId);
      
      // Check if this event is for this specific image component
      if (imageId && imageId === targetImageId) {
        console.log('🎯 Auto-opening settings for this image:', targetImageId);
        onSelect?.(); // Select the image first
        setTimeout(() => {
          setShowWrapOptions(true); // Then open settings
          console.log('🎯 Settings modal should now be open, showWrapOptions=', true);
        }, 100);
      }
    };

    const handleOpenMovableImageSettings = (event: CustomEvent) => {
      const { imageId: targetImageId } = event.detail;
      console.log('🎯 Received openMovableImageSettings event for:', targetImageId, 'current imageId:', imageId);
      
      if (imageId && imageId === targetImageId) {
        console.log('🎯 Opening settings via openMovableImageSettings for:', targetImageId);
        onSelect?.();
        setTimeout(() => {
          setShowWrapOptions(true);
          console.log('🎯 Settings modal opened via openMovableImageSettings');
        }, 150);
      }
    };

    window.addEventListener('autoOpenSettings', handleAutoOpenSettings as EventListener);
    window.addEventListener('openMovableImageSettings', handleOpenMovableImageSettings as EventListener);
    
    return () => {
      window.removeEventListener('autoOpenSettings', handleAutoOpenSettings as EventListener);
      window.removeEventListener('openMovableImageSettings', handleOpenMovableImageSettings as EventListener);
    };
  }, [imageId, onSelect]);

  // Auto-open settings if this is a newly created image that should show settings
  useEffect(() => {
    // Check sessionStorage for auto-open flag immediately when component mounts
    if (imageId) {
      const shouldAutoOpen = sessionStorage.getItem(`autoOpenSettings_${imageId}`);
      console.log('🎯 Checking sessionStorage for imageId:', imageId, 'shouldAutoOpen:', shouldAutoOpen);
      
      if (shouldAutoOpen === 'true') {
        console.log('🎯 Auto-opening settings from sessionStorage for:', imageId);
        // Clear the flag first to prevent re-triggering
        sessionStorage.removeItem(`autoOpenSettings_${imageId}`);
        
        // Select the image and open settings
        onSelect?.();
        setTimeout(() => {
          setShowWrapOptions(true);
          console.log('🎯 Settings modal opened from sessionStorage check');
        }, 300);
      }
    }
  }, [imageId, onSelect]); // Remove showWrapOptions from deps to avoid conflicts

  // Update internal state when props change
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  useEffect(() => {
    setWrapSettings(initialWrapSettings);
  }, [initialWrapSettings]);

  // Apply text wrapping when position or settings change
  useEffect(() => {
    if (imageRef.current && !isDragging) {
      console.log('Applying text wrap:', wrapSettings.mode, 'at position:', position);
      
      // Clear any existing styles first to prevent conflicts
      TextWrapEngine.removeTextWrap(imageRef.current);
      
      // Apply new text wrapping after clearing
      setTimeout(() => {
        if (imageRef.current) {
          TextWrapEngine.calculateTextWrap(imageRef.current, position, wrapSettings);
          
          // Apply special text breaking for topBottom mode
          if (wrapSettings.mode === 'topBottom') {
            TextWrapEngine.applyTextBreaking(imageRef.current);
          }
          
          // Force reflow of surrounding text
          const container = imageRef.current.closest('[contenteditable]') as HTMLElement;
          if (container) {
            // Trigger text reflow by temporarily changing a style
            const display = container.style.display;
            container.style.display = 'none';
            container.offsetHeight; // Force reflow
            container.style.display = display || 'block';
          }
        }
      }, 50);
    }
  }, [position, wrapSettings, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start dragging if clicking on control elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.image-controls')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Select the image if onSelect is provided
    onSelect?.();

    const startX = e.clientX;
    const startY = e.clientY;
    
    // Get current position relative to the container
    const container = imageRef.current?.closest('[contenteditable]') as HTMLElement;
    if (!container || !imageRef.current) return;
    
    const containerRect = container.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    const startPosition = {
      ...position,
      x: imageRect.left - containerRect.left,
      y: imageRect.top - containerRect.top
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newPosition = {
        ...startPosition,
        x: Math.max(0, startPosition.x + deltaX), // Prevent negative positioning
        y: Math.max(0, startPosition.y + deltaY),
        width: position.width, // Preserve width and height
        height: position.height
      };

      console.log('Dragging to position:', newPosition); // Debug log
      setPosition(newPosition);
      onPositionChange?.(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Reapply text wrapping after drag is complete
      setTimeout(() => {
        if (imageRef.current) {
          const currentPosition = position; // Use current position state
          TextWrapEngine.calculateTextWrap(imageRef.current, currentPosition, wrapSettings);
          if (wrapSettings.mode === 'topBottom') {
            TextWrapEngine.applyTextBreaking(imageRef.current);
          }
        }
      }, 50);
    };

    setIsDragging(true);
    
    // Clear text wrapping styles temporarily during drag
    if (imageRef.current) {
      TextWrapEngine.removeTextWrap(imageRef.current);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
  }, [position, onPositionChange, onSelect]);

  const handleWrapModeChange = useCallback((mode: TextWrapMode) => {
    console.log('Changing wrap mode to:', mode, 'from:', wrapSettings.mode);
    
    let alignment: TextAlignment = wrapSettings.alignment;
    
    // Auto-adjust alignment based on wrap mode
    if (mode === 'topBottom') {
      alignment = 'center'; // Break text mode typically centers the image
    } else if (mode === 'inline') {
      alignment = 'inline'; // Inline mode flows with text
    } else if (mode === 'square' || mode === 'tight') {
      // Keep current alignment or default to left for floating modes
      alignment = alignment === 'center' || alignment === 'inline' ? 'left' : alignment;
    } else if (mode === 'behindText' || mode === 'inFrontOfText' || mode === 'through') {
      // Absolute positioning modes don't need alignment
      alignment = 'center';
    }

    const newSettings = { ...wrapSettings, mode, alignment };
    console.log('New wrap settings:', newSettings);
    
    setWrapSettings(newSettings);
    onWrapSettingsChange?.(newSettings);
    
    // Force reapply text wrapping after a brief delay to prevent distortion
    setTimeout(() => {
      if (imageRef.current) {
        TextWrapEngine.calculateTextWrap(imageRef.current, position, newSettings);
        if (newSettings.mode === 'topBottom') {
          TextWrapEngine.applyTextBreaking(imageRef.current);
        }
      }
    }, 100);
  }, [wrapSettings, onWrapSettingsChange, position]);

  const handleAlignmentChange = useCallback((alignment: TextAlignment) => {
    const newSettings = { ...wrapSettings, alignment };
    setWrapSettings(newSettings);
    onWrapSettingsChange?.(newSettings);
  }, [wrapSettings, onWrapSettingsChange]);

  const SettingsModal = () => (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        style={{
          zIndex: 999999,
          backdropFilter: 'blur(2px)'
        }}
        onMouseDown={(e) => {
          // Only close if clicking directly on backdrop, not on child elements
          if (e.target === e.currentTarget) {
            console.log('🎯 Backdrop clicked, closing modal');
            setShowWrapOptions(false);
          }
        }}
      />

      {/* Text Wrap Options Panel */}
      <div
        className="fixed p-4 rounded-lg shadow-2xl border-2 min-w-80"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000000,
          backgroundColor: '#ffffff',
          borderColor: '#3b82f6',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          maxHeight: '80vh',
          maxWidth: '90vw',
          overflow: 'auto'
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium" style={{ color: semanticColors.text.primary }}>
            Text Wrap Settings
          </h4>
          <button
            className="p-2 rounded transition-colors hover:bg-red-100"
            style={{
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '2px solid #dc2626',
              minWidth: '32px',
              minHeight: '32px'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('CLOSING modal');
              setShowWrapOptions(false);
            }}
            title="Close Settings Panel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: semanticColors.text.primary }}>
              Text Wrap Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { mode: 'inline', label: 'Inline with text', icon: '📝' },
                { mode: 'square', label: 'Wrap text', icon: '📦' },
                { mode: 'topBottom', label: 'Break text', icon: '⬆️⬇️' },
                { mode: 'behindText', label: 'Behind text', icon: '🔄' },
                { mode: 'inFrontOfText', label: 'In front of text', icon: '🔝' }
              ] as Array<{mode: TextWrapMode, label: string, icon: string}>).map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  className="flex flex-col items-center p-2 text-xs rounded transition-colors border"
                  style={{
                    backgroundColor: wrapSettings.mode === mode ? semanticColors.action.primary : semanticColors.surface.secondary,
                    color: wrapSettings.mode === mode ? 'white' : semanticColors.text.primary,
                    borderColor: wrapSettings.mode === mode ? semanticColors.action.primary : semanticColors.border.secondary
                  }}
                  onClick={() => handleWrapModeChange(mode)}
                  title={label}
                >
                  <span className="text-lg mb-1">{icon}</span>
                  <span className="text-xs leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {(wrapSettings.mode === 'square' || wrapSettings.mode === 'tight') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: semanticColors.text.primary }}>
                Alignment
              </label>
              <div className="flex gap-2">
                {(['left', 'right', 'center'] as TextAlignment[]).map((align) => (
                  <button
                    key={align}
                    className="px-2 py-1 text-xs rounded transition-colors"
                    style={{
                      backgroundColor: wrapSettings.alignment === align ? semanticColors.action.primary : semanticColors.surface.secondary,
                      color: wrapSettings.alignment === align ? 'white' : semanticColors.text.primary
                    }}
                    onClick={() => handleAlignmentChange(align)}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: semanticColors.text.primary }}>
              Distance from Text: {wrapSettings.distanceFromText}px
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={wrapSettings.distanceFromText || 15}
              onChange={(e) => {
                const newSettings = { ...wrapSettings, distanceFromText: parseInt(e.target.value) };
                setWrapSettings(newSettings);
                onWrapSettingsChange?.(newSettings);
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Movable Image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        data-movable-image="true"
        data-movable-image-id={imageId || `img-${Date.now()}`}
        className={`cursor-move transition-all duration-200 hover:shadow-lg ${
          isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        } ${isDragging ? 'shadow-lg scale-105' : 'shadow-md'}`}
        style={{
          width: `${position.width}px`,
          height: `${position.height}px`,
          maxWidth: 'none',
          zIndex: isDragging ? 1000 : (
            wrapSettings.mode === 'behindText' ? -1 : 
            wrapSettings.mode === 'inFrontOfText' ? 999 : 10
          ),
          userSelect: 'none' as const,
          pointerEvents: 'auto' as const,
          // Use absolute positioning when dragging OR for overlay modes
          ...(isDragging || ['through', 'behindText', 'inFrontOfText'].includes(wrapSettings.mode) ? {
            position: 'absolute' as const,
            left: `${position.x}px`,
            top: `${position.y}px`,
            // Override any float or other positioning during drag
            float: isDragging ? 'none' as const : undefined,
            display: isDragging ? 'block' as const : undefined
          } : {})
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect?.();
        }}
        draggable={false}
      />

      {/* Drag Handle - always visible for better UX */}
      <div
        className={`absolute flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded cursor-move shadow-lg transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-75'
        }`}
        style={{
          // Position relative to image position for all modes
          left: ['through', 'behindText', 'inFrontOfText'].includes(wrapSettings.mode) || isDragging
            ? `${position.x - 12}px` 
            : '50%',
          top: ['through', 'behindText', 'inFrontOfText'].includes(wrapSettings.mode) || isDragging
            ? `${position.y - 12}px` 
            : '-12px',
          transform: ['through', 'behindText', 'inFrontOfText'].includes(wrapSettings.mode) || isDragging
            ? 'none'
            : 'translateX(-50%)',
          zIndex: 1001
        }}
        onMouseDown={handleMouseDown}
        title="Drag to move"
      >
        <Grip className="w-3 h-3" />
      </div>

      {/* Debug Info */}
      {isSelected && (
        <div
          className="absolute px-2 py-1 text-xs font-mono bg-black text-white rounded"
          style={{
            left: '0px',
            top: '-20px',
            zIndex: 10000
          }}
        >
          Selected: {isSelected ? 'YES' : 'NO'} | Settings: {showWrapOptions ? 'OPEN' : 'CLOSED'}
        </div>
      )}

      {/* Controls - only show when selected */}
      {isSelected && (
        <>
          {/* Resize Handles */}
          {(() => {
            const handleSize = 12;
            const handleOffset = handleSize / 2;
            
            return [
              { handlePos: 'nw', top: -handleOffset, left: -handleOffset, cursor: 'nw-resize' },
              { handlePos: 'ne', top: -handleOffset, left: position.width - handleOffset, cursor: 'ne-resize' },
              { handlePos: 'sw', top: position.height - handleOffset, left: -handleOffset, cursor: 'sw-resize' },
              { handlePos: 'se', top: position.height - handleOffset, left: position.width - handleOffset, cursor: 'se-resize' }
            ];
          })().map(({ handlePos, top, left, cursor }) => (
            <div
              key={handlePos}
              className="absolute w-3 h-3 rounded-full"
              style={{
                top: `${top}px`,
                left: `${left}px`,
                backgroundColor: '#3b82f6',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                cursor,
                zIndex: 10001,
                transform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden' as const
              }}
              title={`Resize ${handlePos}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = position.width;
                const startHeight = position.height;
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

                  const newPosition = { ...position, width: newWidth, height: newHeight };
                  setPosition(newPosition);
                  onPositionChange?.(newPosition);
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

          {/* Control Panel */}
          <div
            className="absolute flex items-center gap-1 p-1 rounded shadow-lg border image-controls"
            style={{
              // Position based on wrap mode
              left: ['through', 'behindText', 'inFrontOfText'].includes(wrapSettings.mode)
                ? `${position.x + position.width - 120}px`
                : 'calc(100% - 120px)',
              top: ['through', 'behindText', 'inFrontOfText'].includes(wrapSettings.mode)
                ? `${position.y - 35}px`
                : '-35px',
              zIndex: 9998,
              backgroundColor: semanticColors.surface.primary,
              borderColor: semanticColors.border.primary
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Wrap Mode Toggle */}
            <button
              className="p-2 rounded transition-all hover:shadow-md hover:scale-105"
              style={{ 
                backgroundColor: showWrapOptions ? '#3b82f6' : '#e5e7eb',
                color: showWrapOptions ? 'white' : '#374151',
                border: `2px solid ${showWrapOptions ? '#3b82f6' : '#9ca3af'}`,
                minWidth: '32px',
                minHeight: '32px'
              }}
              onMouseDown={(e) => {
                // Prevent any interference from drag handlers
                e.preventDefault();
                e.stopPropagation();
                
                // Set flag to prevent rapid toggling
                settingsToggleRef.current = true;
                setTimeout(() => {
                  settingsToggleRef.current = false;
                }, 300);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Ignore clicks if we're in rapid toggle prevention
                if (settingsToggleRef.current) {
                  return;
                }
                
                console.log('🎛️ Settings button clicked! Current state:', showWrapOptions, '-> toggling to:', !showWrapOptions);
                const newState = !showWrapOptions;
                setShowWrapOptions(newState);
                
                console.log('🎛️ Settings modal state set to:', newState);
              }}
              title="Text Wrap Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Move Button */}
            <button
              className="p-1 rounded transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: semanticColors.text.secondary
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = semanticColors.surface.secondary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Just show a tooltip or visual feedback instead of triggering drag
                console.log('Use drag handle or image to move');
              }}
              title="Use drag handle or click image to move"
            >
              <Move className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            <button
              className="p-1 rounded transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: semanticColors.status.error
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = semanticColors.status.error + '20'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.();
              }}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Debug: Show if panel should be visible */}
          {showWrapOptions && (
            <div 
              className="fixed top-4 right-4 bg-green-500 text-white p-4 text-lg font-bold rounded border-4 border-white"
              style={{ zIndex: 2147483647 }}
            >
              🟢 SETTINGS MODAL IS OPEN! 🟢
            </div>
          )}
        </>
      )}

      {/* Portal Modal to Body - Renders outside canvas hierarchy */}
      {showWrapOptions && typeof window !== 'undefined' && (
        <>
          {console.log('🎯 Rendering portal modal for imageId:', imageId, 'showWrapOptions:', showWrapOptions)}
          {createPortal(
            <SettingsModal />,
            document.body
          )}
        </>
      )}
    </>
  );
};