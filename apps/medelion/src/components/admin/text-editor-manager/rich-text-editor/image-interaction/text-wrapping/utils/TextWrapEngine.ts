import { TextWrapMode, TextAlignment, ImagePosition, TextWrapSettings } from '../types';

export class TextWrapEngine {
  
  /**
   * Calculate text wrapping around an image
   */
  static calculateTextWrap(
    element: HTMLElement,
    imagePosition: ImagePosition,
    wrapSettings: TextWrapSettings
  ): void {
    const { mode, alignment, distanceFromText = 10 } = wrapSettings;
    
    // Reset any previous styles
    this.removeTextWrap(element);
    
    switch (mode) {
      case 'inline':
        this.applyInlineWrap(element, imagePosition, wrapSettings);
        break;
      case 'square':
        this.applySquareWrap(element, imagePosition, wrapSettings);
        break;
      case 'tight':
        this.applyTightWrap(element, imagePosition, wrapSettings);
        break;
      case 'topBottom':
        this.applyTopBottomWrap(element, imagePosition, wrapSettings);
        break;
      case 'behindText':
        this.applyBehindTextWrap(element, imagePosition, wrapSettings);
        break;
      case 'inFrontOfText':
        this.applyInFrontOfTextWrap(element, imagePosition, wrapSettings);
        break;
      case 'through':
        this.applyThroughWrap(element, imagePosition, wrapSettings);
        break;
      default:
        this.removeTextWrap(element);
    }
    
    // Trigger text reflow
    if (element.parentElement) {
      element.parentElement.style.display = 'block';
    }
  }

  /**
   * Apply tight text wrapping (text follows image contours)
   */
  private static applyTightWrap(
    element: HTMLElement,
    imagePosition: ImagePosition,
    wrapSettings: TextWrapSettings
  ): void {
    const { alignment, distanceFromText = 10 } = wrapSettings;
    
    // Create shape-outside property for CSS text wrapping
    const shapeMargin = `${distanceFromText}px`;
    
    if (alignment === 'left') {
      element.style.float = 'left';
      element.style.shapeOutside = `margin-box`;
      element.style.shapeMargin = shapeMargin;
      element.style.marginRight = `${distanceFromText}px`;
    } else if (alignment === 'right') {
      element.style.float = 'right';
      element.style.shapeOutside = `margin-box`;
      element.style.shapeMargin = shapeMargin;
      element.style.marginLeft = `${distanceFromText}px`;
    }
  }

  /**
   * Apply inline text wrapping (image flows with text like a character)
   */
  private static applyInlineWrap(
    element: HTMLElement,
    imagePosition: ImagePosition,
    wrapSettings: TextWrapSettings
  ): void {
    const { distanceFromText = 5 } = wrapSettings;
    
    // Make image behave like an inline element
    element.style.position = 'static';
    element.style.display = 'inline';
    element.style.verticalAlign = 'baseline';
    element.style.float = 'none';
    element.style.margin = `0 ${distanceFromText}px`;
    element.style.clear = 'none';
  }

  /**
   * Apply square text wrapping (rectangular boundary)
   */
  private static applySquareWrap(
    element: HTMLElement,
    imagePosition: ImagePosition,
    wrapSettings: TextWrapSettings
  ): void {
    const { alignment, distanceFromText = 10 } = wrapSettings;
    
    // Remove absolute positioning and set proper flow
    element.style.position = 'static';
    element.style.display = 'inline-block';
    element.style.verticalAlign = 'top';
    
    if (alignment === 'left') {
      element.style.float = 'left';
      element.style.marginRight = `${distanceFromText}px`;
      element.style.marginBottom = `${distanceFromText}px`;
      element.style.marginLeft = '0';
      element.style.marginTop = `${distanceFromText / 2}px`;
    } else if (alignment === 'right') {
      element.style.float = 'right';
      element.style.marginLeft = `${distanceFromText}px`;
      element.style.marginBottom = `${distanceFromText}px`;
      element.style.marginRight = '0';
      element.style.marginTop = `${distanceFromText / 2}px`;
    } else if (alignment === 'center') {
      element.style.float = 'none';
      element.style.display = 'block';
      element.style.margin = `${distanceFromText}px auto`;
      element.style.clear = 'both';
    }
  }

  /**
   * Apply through text wrapping (text flows through transparent areas)
   */
  private static applyThroughWrap(
    element: HTMLElement,
    imagePosition: ImagePosition,
    wrapSettings: TextWrapSettings
  ): void {
    element.style.position = 'absolute';
    element.style.left = `${imagePosition.x}px`;
    element.style.top = `${imagePosition.y}px`;
    element.style.width = `${imagePosition.width}px`;
    element.style.height = `${imagePosition.height}px`;
    element.style.zIndex = '1';
  }

  /**
   * Apply top and bottom text wrapping (break text - no text on sides)
   */
  private static applyTopBottomWrap(
    element: HTMLElement,
    imagePosition: ImagePosition,
    wrapSettings: TextWrapSettings
  ): void {
    const { distanceFromText = 15, alignment = 'center' } = wrapSettings;
    
    // Remove any floating or positioning
    element.style.position = 'static';
    element.style.float = 'none';
    element.style.display = 'block';
    element.style.clear = 'both';
    
    // Set margins to create clear text breaks above and below
    element.style.marginTop = `${distanceFromText}px`;
    element.style.marginBottom = `${distanceFromText}px`;
    
    // Handle horizontal alignment
    if (alignment === 'center') {
      element.style.marginLeft = 'auto';
      element.style.marginRight = 'auto';
    } else if (alignment === 'left') {
      element.style.marginLeft = '0';
      element.style.marginRight = 'auto';
    } else if (alignment === 'right') {
      element.style.marginLeft = 'auto';
      element.style.marginRight = '0';
    }
    
    // Ensure the image creates a complete line break
    element.style.width = `${imagePosition.width}px`;
    element.style.height = `${imagePosition.height}px`;
    
    // Add pseudo-elements to enforce text breaking (using CSS custom properties)
    element.style.setProperty('--text-break-before', '"\\A"');
    element.style.setProperty('--text-break-after', '"\\A"');
  }

  /**
   * Apply behind text wrapping (image as background)
   */
  private static applyBehindTextWrap(
    element: HTMLElement,
    imagePosition: ImagePosition,
    wrapSettings: TextWrapSettings
  ): void {
    element.style.position = 'absolute';
    element.style.left = `${imagePosition.x}px`;
    element.style.top = `${imagePosition.y}px`;
    element.style.width = `${imagePosition.width}px`;
    element.style.height = `${imagePosition.height}px`;
    element.style.zIndex = '-1';
  }

  /**
   * Apply in front of text wrapping (image covers text)
   */
  private static applyInFrontOfTextWrap(
    element: HTMLElement,
    imagePosition: ImagePosition,
    wrapSettings: TextWrapSettings
  ): void {
    element.style.position = 'absolute';
    element.style.left = `${imagePosition.x}px`;
    element.style.top = `${imagePosition.y}px`;
    element.style.width = `${imagePosition.width}px`;
    element.style.height = `${imagePosition.height}px`;
    element.style.zIndex = '999';
  }

  /**
   * Remove all text wrapping styles
   */
  static removeTextWrap(element: HTMLElement): void {
    element.style.float = '';
    element.style.shapeOutside = '';
    element.style.shapeMargin = '';
    element.style.position = '';
    element.style.left = '';
    element.style.top = '';
    element.style.width = '';
    element.style.height = '';
    element.style.zIndex = '';
    element.style.margin = '';
    element.style.marginTop = '';
    element.style.marginRight = '';
    element.style.marginBottom = '';
    element.style.marginLeft = '';
    element.style.clear = '';
    element.style.textAlign = '';
    element.style.display = '';
  }

  /**
   * Update text wrapping when image is moved
   */
  static updateTextWrapOnMove(
    element: HTMLElement,
    newPosition: ImagePosition,
    wrapSettings: TextWrapSettings
  ): void {
    this.calculateTextWrap(element, newPosition, wrapSettings);
  }

  /**
   * Apply text breaking effect for topBottom wrap mode
   */
  static applyTextBreaking(element: HTMLElement): void {
    const container = element.closest('[contenteditable]') as HTMLElement;
    if (!container) return;

    // Add CSS class for text breaking if not already present
    if (!element.classList.contains('text-break-wrapper')) {
      element.classList.add('text-break-wrapper');
      
      // Add CSS rules dynamically if they don't exist
      const styleId = 'text-break-styles';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
          .text-break-wrapper {
            page-break-before: always;
            page-break-after: always;
          }
          
          .text-break-wrapper::before,
          .text-break-wrapper::after {
            content: "";
            display: block;
            height: 0;
            clear: both;
          }
        `;
        document.head.appendChild(styleElement);
      }
    }

    // Force a reflow to ensure text breaks are applied
    container.style.overflow = 'hidden';
    container.offsetHeight; // Trigger reflow
    container.style.overflow = '';
  }

  /**
   * Get optimal text wrap settings based on image position in container
   */
  static getOptimalWrapSettings(
    imagePosition: ImagePosition,
    containerWidth: number,
    containerHeight: number
  ): TextWrapSettings {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Determine best alignment based on position
    let alignment: TextAlignment;
    if (imagePosition.x < centerX * 0.3) {
      alignment = 'left';
    } else if (imagePosition.x > centerX * 1.7) {
      alignment = 'right';
    } else {
      alignment = 'center';
    }

    return {
      mode: 'square',
      alignment,
      distanceFromText: 15,
      marginTop: 10,
      marginRight: 15,
      marginBottom: 10,
      marginLeft: 15
    };
  }
}