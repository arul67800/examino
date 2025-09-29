/**
 * Image enhancement utility for making images in the editor resizable and interactive
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { ResizableImage } from '../components/ResizableImage';

export class ImageEnhancer {
  private static instances = new Map<string, any>();

  /**
   * Enhance all images in a contenteditable element with resizable functionality
   */
  static enhanceImages(containerElement: HTMLElement): void {
    const images = containerElement.querySelectorAll('img');
    
    images.forEach((img, index) => {
      if (img.dataset.enhanced === 'true') return; // Already enhanced
      
      this.enhanceImage(img, `img-${Date.now()}-${index}`);
    });
  }

  /**
   * Enhance a single image element
   */
  static enhanceImage(imgElement: HTMLImageElement, imageId: string): void {
    if (imgElement.dataset.enhanced === 'true') return;

    // Create wrapper container
    const wrapper = document.createElement('div');
    wrapper.className = 'enhanced-image-wrapper';
    wrapper.dataset.imageId = imageId;
    wrapper.style.display = 'inline-block';
    wrapper.style.position = 'relative';

    // Get image properties
    const src = imgElement.src;
    const alt = imgElement.alt || '';
    const width = imgElement.width || imgElement.naturalWidth || 400;
    const height = imgElement.height || imgElement.naturalHeight || 300;
    const caption = imgElement.dataset.caption || '';

    // Insert wrapper before image
    imgElement.parentNode?.insertBefore(wrapper, imgElement);
    
    // Remove original image
    imgElement.remove();

    // Create ResizableImage component
    const root = createRoot(wrapper);
    
    const handleResize = (newWidth: number, newHeight: number) => {
      console.log(`Image ${imageId} resized to: ${newWidth}x${newHeight}`);
      // Update the underlying HTML structure if needed
      wrapper.style.width = `${newWidth}px`;
      wrapper.style.height = `${newHeight}px`;
      
      // Trigger editor content change event
      const editor = wrapper.closest('[contenteditable="true"]');
      if (editor) {
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
      }
    };

    const handleDelete = () => {
      wrapper.remove();
      this.instances.delete(imageId);
      
      // Trigger editor content change event
      const editor = document.querySelector('[contenteditable="true"]');
      if (editor) {
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
      }
    };

    const handleCopy = () => {
      // Create a copy of the image
      const copy = wrapper.cloneNode(true) as HTMLElement;
      const newId = `img-copy-${Date.now()}`;
      copy.dataset.imageId = newId;
      
      // Insert after current image
      wrapper.parentNode?.insertBefore(copy, wrapper.nextSibling);
      
      // Enhance the copy
      const copyImg = copy.querySelector('img');
      if (copyImg) {
        this.enhanceImage(copyImg, newId);
      }
    };

    const resizableImageComponent = React.createElement(ResizableImage, {
      src,
      alt,
      width,
      height,
      caption,
      onResize: handleResize,
      onDelete: handleDelete,
      onCopy: handleCopy,
      onEdit: () => {
        console.log('Edit image:', imageId);
        // Could open image editing modal here
      }
    });

    root.render(resizableImageComponent);
    
    // Store instance for cleanup
    this.instances.set(imageId, root);
    
    // Mark as enhanced
    wrapper.dataset.enhanced = 'true';
  }

  /**
   * Clean up enhanced images when editor content changes
   */
  static cleanup(): void {
    this.instances.forEach((root, imageId) => {
      try {
        root.unmount();
      } catch (error) {
        console.warn(`Failed to unmount image ${imageId}:`, error);
      }
    });
    this.instances.clear();
  }

  /**
   * Re-enhance images after content changes
   */
  static refresh(containerElement: HTMLElement): void {
    // Clean up old instances that no longer exist in DOM
    this.instances.forEach((root, imageId) => {
      const element = containerElement.querySelector(`[data-image-id="${imageId}"]`);
      if (!element) {
        try {
          root.unmount();
          this.instances.delete(imageId);
        } catch (error) {
          console.warn(`Failed to unmount missing image ${imageId}:`, error);
        }
      }
    });

    // Enhance new images
    this.enhanceImages(containerElement);
  }

  /**
   * Convert enhanced images back to HTML for saving
   */
  static serializeImages(containerElement: HTMLElement): string {
    const clone = containerElement.cloneNode(true) as HTMLElement;
    
    // Replace enhanced image wrappers with simple img tags
    const wrappers = clone.querySelectorAll('.enhanced-image-wrapper');
    wrappers.forEach(wrapper => {
      const wrapperElement = wrapper as HTMLElement;
      const resizableImg = wrapper.querySelector('img');
      if (resizableImg) {
        const img = document.createElement('img');
        img.src = resizableImg.src;
        img.alt = resizableImg.alt;
        img.width = parseInt(wrapperElement.style.width) || resizableImg.width;
        img.height = parseInt(wrapperElement.style.height) || resizableImg.height;
        
        // Preserve caption as data attribute
        const caption = wrapper.querySelector('.image-caption')?.textContent;
        if (caption) {
          img.dataset.caption = caption;
        }
        
        wrapper.parentNode?.replaceChild(img, wrapper);
      }
    });
    
    return clone.innerHTML;
  }
}