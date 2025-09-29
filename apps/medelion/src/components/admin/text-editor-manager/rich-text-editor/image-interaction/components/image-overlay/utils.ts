// Browser compatibility utilities for cross-platform support

/**
 * Cross-browser compatible function to get range from point coordinates
 * Handles WebKit, Firefox, and fallback implementations
 */
export const getRangeFromPoint = (x: number, y: number, editorElement: HTMLElement): Range | null => {
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
};

/**
 * Determine alignment based on horizontal position within the editor
 */
export const getAlignmentFromPosition = (x: number, editorElement: HTMLElement, targetElement?: Element): 'left' | 'right' | 'center' => {
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
};