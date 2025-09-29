import { EditorHistory, EditorSelection } from '../types';

export class EditorUtils {
  // Saved cursor position for restoration
  private static savedRange: Range | null = null;

  // Text manipulation utilities
  static getTextStatistics(text: string) {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    const avgWordsPerMinute = 200;
    const readingTime = Math.ceil(words.length / avgWordsPerMinute);
    
    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      lines,
      paragraphs,
      readingTime,
      sentences: text.split(/[.!?]+/).filter(s => s.trim()).length
    };
  }

  // Selection utilities
  static getSelection(): Selection | null {
    return window.getSelection();
  }

  static saveSelection(): Range | null {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  }

  static saveCursorPosition(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.savedRange = selection.getRangeAt(0).cloneRange();
      console.log('Cursor position saved at:', {
        startContainer: this.savedRange.startContainer.nodeName,
        startOffset: this.savedRange.startOffset,
        endContainer: this.savedRange.endContainer.nodeName,
        endOffset: this.savedRange.endOffset
      });
    } else {
      // If no selection, try to create one at the editor's current position
      const editableElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
      if (editableElement) {
        editableElement.focus();
        const range = document.createRange();
        
        // Try to find the last text node or place at end of content
        const walker = document.createTreeWalker(
          editableElement,
          NodeFilter.SHOW_TEXT
        );
        
        let lastTextNode = null;
        while (walker.nextNode()) {
          lastTextNode = walker.currentNode;
        }
        
        if (lastTextNode) {
          range.setStart(lastTextNode, lastTextNode.textContent?.length || 0);
          range.setEnd(lastTextNode, lastTextNode.textContent?.length || 0);
        } else {
          range.selectNodeContents(editableElement);
          range.collapse(false);
        }
        
        this.savedRange = range.cloneRange();
        console.log('Created cursor position at end of editor');
      } else {
        console.log('No contenteditable element found to save cursor position');
      }
    }
  }

  static restoreCursorPosition(): boolean {
    if (this.savedRange) {
      const selection = window.getSelection();
      if (selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(this.savedRange);
          console.log('Cursor position restored successfully');
          return true;
        } catch (error) {
          console.error('Failed to restore cursor position, trying fallback:', error);
          
          // Fallback: place cursor at end of editor
          const editableElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
          if (editableElement) {
            const range = document.createRange();
            range.selectNodeContents(editableElement);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            console.log('Cursor placed at end of editor as fallback');
            return true;
          }
        }
      }
    } else {
      console.log('No saved cursor position to restore');
    }
    return false;
  }

  static clearSavedCursorPosition(): void {
    this.savedRange = null;
  }

  static debugCursorPosition(): void {
    if (this.savedRange) {
      console.log('Debugging saved cursor position...');
      
      // Create a temporary marker to show where the cursor was saved
      const marker = document.createElement('span');
      marker.id = 'cursor-debug-marker';
      marker.style.backgroundColor = 'red';
      marker.style.color = 'white';
      marker.style.padding = '2px 4px';
      marker.style.fontSize = '10px';
      marker.textContent = 'CURSOR';
      
      try {
        const tempRange = this.savedRange.cloneRange();
        tempRange.insertNode(marker);
        
        // Remove marker after 2 seconds
        setTimeout(() => {
          const existingMarker = document.getElementById('cursor-debug-marker');
          if (existingMarker) {
            existingMarker.remove();
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to create debug marker:', error);
      }
    } else {
      console.log('No saved cursor position to debug');
    }
  }

  static restoreSelection(range: Range): void {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  static getSelectedText(): string {
    const selection = window.getSelection();
    return selection ? selection.toString() : '';
  }

  // Content manipulation
  static insertTextAtCursor(text: string): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  static insertImageAtCursor(imageHtml: string): void {
    console.log('insertImageAtCursor called with HTML:', imageHtml);
    
    // Ensure editor has focus first
    const editableElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (!editableElement) {
      console.error('Could not find contenteditable element for image insertion');
      return;
    }
    
    editableElement.focus();
    console.log('Editor focused for image insertion');
    
    // Try immediate insertion first
    console.log('Attempting immediate insertion...');
    
    // Simple approach - just insert the HTML directly
    try {
      if (document.execCommand('insertHTML', false, imageHtml)) {
        console.log('Image inserted successfully with execCommand');
        return;
      }
    } catch (error) {
      console.log('execCommand failed:', error);
    }
    
    // Fallback to our enhanced method
    console.log('Falling back to enhanced insertion method...');
    const wrappedHtml = `<p><br></p>${imageHtml}<p><br></p>`;
    this.insertHTMLAtCursor(wrappedHtml);
  }

  static insertHTMLAtCursor(html: string): void {
    let selection = window.getSelection();
    
    // First, try to restore saved cursor position if available
    if (this.savedRange) {
      const restored = this.restoreCursorPosition();
      if (restored) {
        selection = window.getSelection();
        // Clear the saved position after use
        this.clearSavedCursorPosition();
      }
    }
    
    // If no selection, try to focus editor and create one
    if (!selection || selection.rangeCount === 0) {
      const editableElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
      if (editableElement) {
        editableElement.focus();
        
        // Create a range at the end of the content
        const range = document.createRange();
        range.selectNodeContents(editableElement);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
        
        // Retry insertion
        return this.insertHTMLAtCursor(html);
      }
      return;
    }

    // Method 1: Try document.execCommand first
    try {
      if (document.execCommand('insertHTML', false, html)) {
        return;
      }
    } catch (error) {
      console.log('execCommand failed, using manual insertion:', error);
    }

    // Method 2: Manual DOM insertion
    try {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const fragment = range.createContextualFragment(html);
      range.insertNode(fragment);
      
      // Move cursor to end of inserted content
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Trigger input event to update editor state
      const editableElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
      if (editableElement) {
        const event = new Event('input', { bubbles: true });
        editableElement.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Failed to insert HTML:', error);
    }
  }

  // Formatting utilities
  static isFormatActive(command: string): boolean {
    return document.queryCommandState(command);
  }

  static executeCommand(command: string, value?: string): boolean {
    return document.execCommand(command, false, value);
  }

  // History management
  static createHistoryEntry(content: string, operation: string): EditorHistory {
    return {
      content,
      operation,
      timestamp: new Date()
    };
  }

  static limitHistory(history: EditorHistory[], maxSize: number = 50): EditorHistory[] {
    if (history.length > maxSize) {
      return history.slice(-maxSize);
    }
    return history;
  }

  // HTML sanitization
  static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Remove script tags and other dangerous elements
    const dangerousElements = div.querySelectorAll('script, object, embed, iframe[src*="javascript:"]');
    dangerousElements.forEach(el => el.remove());
    
    // Remove dangerous attributes
    const allElements = div.querySelectorAll('*');
    allElements.forEach(el => {
      const attributes = Array.from(el.attributes);
      attributes.forEach(attr => {
        if (attr.name.startsWith('on') || attr.value.includes('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    return div.innerHTML;
  }

  // Color utilities
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  static getContrastColor(hexColor: string): string {
    const rgb = this.hexToRgb(hexColor);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  // File utilities
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoTypes = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'aac'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (videoTypes.includes(extension)) return 'video';
    if (audioTypes.includes(extension)) return 'audio';
    return 'file';
  }

  // DOM utilities
  static findParentElement(element: Element, selector: string): Element | null {
    let current = element.parentElement;
    while (current) {
      if (current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  static isElementInEditor(element: Element, editorElement: Element): boolean {
    return editorElement.contains(element);
  }

  // Keyboard utilities
  static getShortcutDisplay(shortcut: string): string {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return shortcut
      .replace('Ctrl', isMac ? '⌘' : 'Ctrl')
      .replace('Alt', isMac ? '⌥' : 'Alt')
      .replace('Shift', '⇧')
      .replace('+', ' ');
  }

  // Export utilities
  static exportToMarkdown(html: string): string {
    // Basic HTML to Markdown conversion
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
      .replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/\n{3,}/g, '\n\n'); // Normalize line breaks
  }

  // Validation utilities
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Debounce utility
  static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle utility
  static throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}