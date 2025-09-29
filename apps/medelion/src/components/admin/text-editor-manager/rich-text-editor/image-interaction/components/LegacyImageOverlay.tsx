import React, { useEffect, useState, useCallback } from 'react';
import { ImageOverlay } from './image-overlay/ImageOverlay';

interface LegacyImageOverlayProps {
  editorElement: HTMLElement;
}

/**
 * Legacy wrapper component that maintains backward compatibility
 * with the original ImageOverlay API while using the new modular system
 */
export const LegacyImageOverlay: React.FC<LegacyImageOverlayProps> = ({ 
  editorElement 
}) => {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

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
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // Handle clicks outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!selectedImage) return;
      
      const target = e.target as HTMLElement;
      if (!target.closest('img') && 
          !target.closest('.image-controls') && 
          !target.closest('[data-settings-dropdown]')) {
        console.log('❌ Deselecting image');
        setSelectedImage(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedImage]);

  // Only render overlay if there's a selected image
  if (!selectedImage) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      <ImageOverlay
        imageElement={selectedImage}
        editorElement={editorElement}
        onRemove={() => {
          selectedImage.remove();
          setSelectedImage(null);
        }}
        showControls={true}
        isReadOnly={false}
      />
    </div>
  );
};

export default LegacyImageOverlay;