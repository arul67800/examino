import { Position } from './types';

/**
 * Calculate image position relative to the overlay
 * Handles coordinate transformation from image bounds to overlay coordinate system
 */
export const getImagePosition = (
  img: HTMLImageElement,
  editorElement: HTMLElement,
  overlayElement: HTMLElement
): Position => {
  if (!editorElement || !overlayElement) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const imgRect = img.getBoundingClientRect();
  const editorRect = editorElement.getBoundingClientRect();
  const overlayRect = overlayElement.getBoundingClientRect();
  
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
  
  return position;
};

/**
 * Setup scroll and resize event listeners for position updates
 */
export const setupPositionListeners = (
  editorElement: HTMLElement,
  selectedImage: HTMLImageElement | null,
  onUpdate: () => void
): (() => void) => {
  const handleUpdate = () => {
    onUpdate();
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

  // Return cleanup function
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
};