import { TextWrapSettings } from './types';

/**
 * Apply wrap settings to an image element
 * Handles all text wrapping modes: inline, square, topBottom, behindText, inFrontOfText
 */
export const applyWrapSettings = (
  settings: TextWrapSettings, 
  img: HTMLImageElement
): void => {
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
      img.style.display = 'block';
      img.style.clear = 'both';
      
      // Apply alignment-specific margins
      if (settings.alignment === 'left') {
        img.style.margin = distance > 0 ? `${gap} auto ${gap} 0` : '0 auto 0 0';
      } else if (settings.alignment === 'right') {
        img.style.margin = distance > 0 ? `${gap} 0 ${gap} auto` : '0 0 0 auto';
      } else {
        img.style.margin = distance > 0 ? `${gap} auto` : '0 auto';
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
};

/**
 * Detect current alignment from image styling
 * Returns the current wrap settings based on the image's computed styles
 */
export const detectImageAlignment = (img: HTMLImageElement): TextWrapSettings => {
  const computedStyle = getComputedStyle(img);
  let currentAlignment: 'left' | 'right' | 'center' | 'inline' = 'center';
  let currentMode: TextWrapSettings['mode'] = 'topBottom';
  
  // Check float property first
  if (computedStyle.float === 'left') {
    currentAlignment = 'left';
    currentMode = 'square';
  } else if (computedStyle.float === 'right') {
    currentAlignment = 'right';
    currentMode = 'square';
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
  
  return {
    mode: currentMode,
    alignment: currentAlignment,
    distanceFromText: 15
  };
};