import { InsertionPoint } from './types';
import { getRangeFromPoint } from './utils';

/**
 * Find the best insertion point between text lines with Google Docs-like precision
 * This function provides intelligent insertion point detection for drag and drop
 */
export const findInsertionPoint = (
  x: number, 
  y: number, 
  editorElement: HTMLElement
): InsertionPoint => {
  const editorRect = editorElement.getBoundingClientRect();
  const relativeY = y - editorRect.top;
  
  // First, try to get precise line-level detection using range API
  try {
    const range = getRangeFromPoint(x, y, editorElement);
    if (range) {
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const rect = rects[0];
        const lineY = rect.top - editorRect.top;
        const lineBottom = rect.bottom - editorRect.top;
        
        // Fine-grained line detection - check if we're between lines
        if (Math.abs(relativeY - lineY) < 5) {
          // Near top of line - insert before
          let element = range.startContainer;
          if (element.nodeType === Node.TEXT_NODE && element.parentElement) {
            element = element.parentElement;
          }
          return { element: element as Element, insertBefore: true, isLineBoundary: true };
        } else if (Math.abs(relativeY - lineBottom) < 5) {
          // Near bottom of line - insert after
          let element = range.startContainer;
          if (element.nodeType === Node.TEXT_NODE && element.parentElement) {
            element = element.parentElement;
          }
          return { element: element as Element, insertBefore: false, isLineBoundary: true };
        }
      }
    }
  } catch (error) {
    // Fall back to block-level detection
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
      break;
    }
    
    // Check if we're very close to the bottom of this line/element  
    if (Math.abs(relativeY - candidateBottom) <= tolerance && relativeY >= candidateBottom - tolerance) {
      bestCandidate = { element: candidate.element, insertBefore: false };
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
        } else {
          bestCandidate = { element: nextCandidate.element, insertBefore: true };
        }
        break;
      }
    }
    
    // If this is the last candidate and we're below it
    if (i === candidates.length - 1 && relativeY > candidateBottom) {
      bestCandidate = { element: candidate.element, insertBefore: false };
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
  return { 
    element: editorElement.lastElementChild || editorElement, 
    insertBefore: false,
    isLineBoundary: false
  };
};