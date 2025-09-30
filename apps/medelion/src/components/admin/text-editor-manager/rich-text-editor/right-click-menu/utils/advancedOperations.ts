import { EditorOperationsAdvanced, TableOperationsAdvanced } from './contextMenuConfigs';

// Utility functions for HTML processing and cleaning
const processFormattedContent = (container: HTMLElement): HTMLElement => {
  // Clone the container to avoid modifying the original
  const processed = container.cloneNode(true) as HTMLElement;
  
  // Get all elements in the processed content
  const elements = processed.querySelectorAll('*');
  
  elements.forEach(element => {
    const htmlElement = element as HTMLElement;
    
    // Get the original element from the document to capture live computed styles
    const originalElements = document.querySelectorAll('*');
    let originalElement: Element | null = null;
    
    // Find the corresponding original element by comparing content and position
    Array.from(originalElements).forEach(orig => {
      if (orig.tagName === element.tagName && 
          orig.textContent === element.textContent &&
          orig.getAttribute('style') === element.getAttribute('style')) {
        originalElement = orig;
      }
    });
    
    const computedStyle = originalElement ? 
      window.getComputedStyle(originalElement) : 
      window.getComputedStyle(element);
    
    // Comprehensive list of styles to preserve
    const stylesToPreserve = [
      'fontWeight', 'fontStyle', 'textDecoration', 'textDecorationLine',
      'textDecorationColor', 'textDecorationStyle', 'color', 'backgroundColor',
      'fontSize', 'fontFamily', 'textAlign', 'lineHeight', 'letterSpacing',
      'wordSpacing', 'textIndent', 'textTransform', 'whiteSpace',
      'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
      'borderWidth', 'borderStyle', 'borderColor', 'borderRadius',
      'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
      'verticalAlign', 'textShadow', 'boxShadow', 'opacity',
      'display', 'position', 'float', 'clear', 'overflow',
      'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'
    ];
    
    // Build complete inline style string
    let inlineStyle = htmlElement.getAttribute('style') || '';
    
    stylesToPreserve.forEach(property => {
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      const value = computedStyle.getPropertyValue(cssProperty);
      
      if (value && 
          value !== 'initial' && 
          value !== 'normal' && 
          value !== 'auto' && 
          value !== 'none' &&
          value !== 'transparent' &&
          value !== 'inherit' &&
          value !== '0px' &&
          !inlineStyle.includes(cssProperty)) {
        
        // Special handling for certain properties
        if (property === 'fontWeight' && value === '400') return; // Skip normal font weight
        if (property === 'fontSize' && value.includes('px')) {
          const sizeInPx = parseFloat(value);
          if (sizeInPx < 8 || sizeInPx > 100) return; // Skip unreasonable sizes
        }
        
        inlineStyle += (inlineStyle ? '; ' : '') + `${cssProperty}: ${value}`;
      }
    });
    
    if (inlineStyle) {
      htmlElement.setAttribute('style', inlineStyle);
    }
    
    // Preserve important attributes
    const attributesToPreserve = ['class', 'id', 'href', 'src', 'alt', 'title'];
    attributesToPreserve.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value && !htmlElement.hasAttribute(attr)) {
        htmlElement.setAttribute(attr, value);
      }
    });
  });
  
  return processed;
};

const cleanPastedHTML = (html: string): string => {
  // Create a temporary container
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove potentially problematic elements and attributes
  const elementsToRemove = tempDiv.querySelectorAll('script, object, embed, iframe, form, meta, link[rel="stylesheet"]');
  elementsToRemove.forEach(el => el.remove());
  
  // Clean up attributes but preserve styling
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(element => {
    const htmlElement = element as HTMLElement;
    
    // Remove potentially dangerous attributes
    const dangerousAttrs = [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onkeydown',
      'onkeyup', 'onkeypress', 'onfocus', 'onblur', 'onchange', 'onsubmit'
    ];
    dangerousAttrs.forEach(attr => {
      if (htmlElement.hasAttribute(attr)) {
        htmlElement.removeAttribute(attr);
      }
    });
    
    // Clean up and preserve class attributes
    if (htmlElement.hasAttribute('class')) {
      const classes = htmlElement.className.split(' ').filter(cls => {
        const cleanCls = cls.toLowerCase().trim();
        // Keep formatting-related classes
        return ['bold', 'italic', 'underline', 'highlight', 'text-center', 
                'text-left', 'text-right', 'text-justify'].includes(cleanCls) ||
               cleanCls.startsWith('font-') || cleanCls.startsWith('text-') ||
               cleanCls.startsWith('bg-') || cleanCls.startsWith('border-');
      });
      
      if (classes.length > 0) {
        htmlElement.className = classes.join(' ');
      } else {
        htmlElement.removeAttribute('class');
      }
    }
    
    // Enhanced style attribute cleaning - keep more formatting styles
    if (htmlElement.hasAttribute('style')) {
      const style = htmlElement.getAttribute('style') || '';
      const safeStyles = style.split(';').filter(declaration => {
        const prop = declaration.split(':')[0]?.trim().toLowerCase();
        // Expanded list of safe CSS properties
        const safeProps = [
          'color', 'background-color', 'background', 'font-size', 'font-family', 
          'font-weight', 'font-style', 'text-decoration', 'text-decoration-line',
          'text-decoration-color', 'text-decoration-style', 'text-align', 
          'line-height', 'letter-spacing', 'word-spacing', 'text-indent',
          'text-transform', 'white-space', 'border', 'border-top', 'border-right', 
          'border-bottom', 'border-left', 'border-width', 'border-style', 
          'border-color', 'border-radius', 'padding', 'padding-top', 'padding-right',
          'padding-bottom', 'padding-left', 'margin', 'margin-top', 'margin-right',
          'margin-bottom', 'margin-left', 'vertical-align', 'text-shadow', 
          'box-shadow', 'opacity', 'display', 'width', 'height', 'min-width',
          'min-height', 'max-width', 'max-height'
        ];
        return prop && safeProps.includes(prop) && declaration.includes(':');
      }).filter(Boolean); // Remove empty declarations
      
      if (safeStyles.length > 0) {
        htmlElement.setAttribute('style', safeStyles.join('; '));
      } else {
        htmlElement.removeAttribute('style');
      }
    }
    
    // Preserve important structural attributes
    const structuralTags = ['table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot'];
    if (structuralTags.includes(htmlElement.tagName.toLowerCase())) {
      // Keep table-specific attributes
      const tableAttrs = ['colspan', 'rowspan', 'scope', 'headers'];
      tableAttrs.forEach(attr => {
        const value = htmlElement.getAttribute(attr);
        if (value && !isNaN(Number(value)) && Number(value) > 0) {
          htmlElement.setAttribute(attr, value);
        }
      });
    }
  });
  
  return tempDiv.innerHTML;
};

export const createAdvancedEditorOperations = (
  editorRef: React.RefObject<HTMLDivElement | null>
): EditorOperationsAdvanced => {
  
  const getContentEditableElement = (): HTMLElement | null => {
    // First try to get the editor element directly (AdvancedRichTextEditor)
    if (editorRef.current?.hasAttribute('contenteditable')) {
      return editorRef.current;
    }
    
    // Then try to find contenteditable element inside the container (WordLikeLayout/EditorCanvas)
    const contentEditable = editorRef.current?.querySelector('[contenteditable="true"]') as HTMLElement;
    if (contentEditable) {
      return contentEditable;
    }
    
    // Fallback to any contenteditable element in the document
    return document.querySelector('[contenteditable="true"]') as HTMLElement;
  };

  const focusEditor = () => {
    const editor = getContentEditableElement();
    if (editor) {
      editor.focus();
    }
  };

  const execCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
  };

  return {
    // Clipboard operations
    copy: () => {
      try {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          const text = selection.toString();
          navigator.clipboard.writeText(text);
        }
      } catch (e) {
        execCommand('copy');
      }
    },

    copyWithFormatting: () => {
      try {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          const range = selection.getRangeAt(0);
          
          // Create a container to hold the cloned content
          const container = document.createElement('div');
          const clonedContent = range.cloneContents();
          container.appendChild(clonedContent);
          
          // Process the cloned content to preserve all styles
          const processedContent = processFormattedContent(container);
          
          const text = selection.toString();
          let html = processedContent.innerHTML;
          
          // Add CSS styles for better preservation
          const styleSheet = Array.from(document.styleSheets)
            .map(sheet => {
              try {
                return Array.from(sheet.cssRules)
                  .map(rule => rule.cssText)
                  .join('\n');
              } catch (e) {
                return ''; // Handle cross-origin stylesheets
              }
            })
            .join('\n');
          
          // Wrap content with styles for better preservation
          html = `<div style="font-family: inherit; font-size: inherit; line-height: inherit;">${html}</div>`;
          
          // Use modern clipboard API if available
          if (navigator.clipboard && 'write' in navigator.clipboard) {
            const data = [
              new ClipboardItem({
                'text/plain': new Blob([text], { type: 'text/plain' }),
                'text/html': new Blob([html], { type: 'text/html' })
              })
            ];
            navigator.clipboard.write(data);
          } else {
            // Enhanced fallback: create a temporary element for copying
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '1px';
            tempDiv.style.height = '1px';
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv);
            
            const tempRange = document.createRange();
            tempRange.selectNodeContents(tempDiv);
            const tempSelection = window.getSelection();
            tempSelection?.removeAllRanges();
            tempSelection?.addRange(tempRange);
            
            const success = document.execCommand('copy');
            
            document.body.removeChild(tempDiv);
            tempSelection?.removeAllRanges();
            tempSelection?.addRange(range);
            
            if (!success) {
              throw new Error('execCommand copy failed');
            }
          }
        }
      } catch (e) {
        console.warn('Copy with formatting failed, falling back to regular copy:', e);
        execCommand('copy');
      }
    },

    cut: () => {
      try {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          const text = selection.toString();
          navigator.clipboard.writeText(text);
          execCommand('delete');
        }
      } catch (e) {
        execCommand('cut');
      }
    },

    paste: async () => {
      try {
        const text = await navigator.clipboard.readText();
        execCommand('insertText', text);
      } catch (e) {
        execCommand('paste');
      }
    },

    pasteWithFormatting: async () => {
      try {
        const editor = getContentEditableElement();
        if (!editor) return;
        
        let html = '';
        let hasHTML = false;
        
        if (navigator.clipboard && 'read' in navigator.clipboard) {
          const clipboardItems = await navigator.clipboard.read();
          for (const clipboardItem of clipboardItems) {
            if (clipboardItem.types.includes('text/html')) {
              const htmlBlob = await clipboardItem.getType('text/html');
              html = await htmlBlob.text();
              hasHTML = true;
              break;
            }
          }
        }
        
        if (!hasHTML) {
          // Try to read from clipboard as text and apply basic formatting
          try {
            const text = await navigator.clipboard.readText();
            html = text.replace(/\n/g, '<br>');
          } catch (e) {
            execCommand('paste');
            return;
          }
        }
        
        if (html) {
          // Clean and process the HTML to ensure compatibility
          html = cleanPastedHTML(html);
          
          // Remove wrapper divs that might interfere with formatting
          if (html.startsWith('<div') && html.endsWith('</div>')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const innerContent = tempDiv.firstChild;
            if (innerContent && innerContent.nodeType === Node.ELEMENT_NODE) {
              const element = innerContent as HTMLElement;
              // If the wrapper div only has style attributes, extract content
              if (element.tagName === 'DIV' && !element.hasAttribute('class')) {
                html = element.innerHTML;
              }
            }
          }
          
          // Focus editor and insert the formatted content
          focusEditor();
          
          // Get current selection
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // Delete any selected content first
            if (!range.collapsed) {
              range.deleteContents();
            }
            
            // Create a document fragment from the HTML
            const fragment = document.createDocumentFragment();
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            
            // Move nodes from temp container to fragment
            while (tempContainer.firstChild) {
              fragment.appendChild(tempContainer.firstChild);
            }
            
            // Insert the fragment
            range.insertNode(fragment);
            
            // Move cursor to end of inserted content
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Trigger input event for framework integration
            editor.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            // Fallback: use insertHTML command
            document.execCommand('insertHTML', false, html);
          }
        } else {
          // Final fallback to regular paste
          execCommand('paste');
        }
      } catch (e) {
        console.warn('Paste with formatting failed, falling back to regular paste:', e);
        execCommand('paste');
      }
    },

    // Text formatting
    bold: () => execCommand('bold'),
    italic: () => execCommand('italic'),
    underline: () => execCommand('underline'),
    strikethrough: () => execCommand('strikeThrough'),

    // Paragraph formatting
    alignLeft: () => execCommand('justifyLeft'),
    alignCenter: () => execCommand('justifyCenter'),
    alignRight: () => execCommand('justifyRight'),
    alignJustify: () => execCommand('justifyFull'),

    // Lists
    bulletList: () => execCommand('insertUnorderedList'),
    numberedList: () => execCommand('insertOrderedList'),
    indent: () => execCommand('indent'),
    outdent: () => execCommand('outdent'),

    // Content insertion
    insertLink: () => {
      const url = prompt('Enter URL:');
      if (url) {
        execCommand('createLink', url);
      }
    },

    insertImage: () => {
      const url = prompt('Enter image URL:');
      if (url) {
        execCommand('insertImage', url);
      }
    },

    insertTable: () => {
      const rows = prompt('Number of rows:', '3');
      const cols = prompt('Number of columns:', '3');
      if (rows && cols) {
        const tableHtml = `
          <table border="1" style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
            ${Array(parseInt(rows)).fill(0).map(() => 
              `<tr>${Array(parseInt(cols)).fill(0).map(() => '<td style="padding: 8px; border: 1px solid #ccc;">Cell</td>').join('')}</tr>`
            ).join('')}
          </table>
        `;
        execCommand('insertHTML', tableHtml);
      }
    },

    insertQuote: () => {
      execCommand('formatBlock', 'blockquote');
    },

    // Advanced operations
    find: () => {
      const searchTerm = prompt('Find:');
      if (searchTerm) {
        // Use browser's built-in find functionality
        if ('find' in window) {
          (window as any).find(searchTerm);
        } else {
          // Fallback for browsers that don't support window.find
          const editor = getContentEditableElement();
          if (editor) {
            const content = editor.textContent || '';
            const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
            if (index !== -1) {
              alert(`Found "${searchTerm}" at position ${index}`);
            } else {
              alert(`"${searchTerm}" not found`);
            }
          }
        }
      }
    },

    replace: () => {
      const searchTerm = prompt('Find:');
      const replaceTerm = prompt('Replace with:');
      if (searchTerm && replaceTerm !== null) {
        const editor = getContentEditableElement();
        if (editor) {
          const content = editor.innerHTML;
          const newContent = content.replace(new RegExp(searchTerm, 'g'), replaceTerm);
          editor.innerHTML = newContent;
        }
      }
    },

    spellCheck: () => {
      const editor = getContentEditableElement();
      if (editor) {
        editor.spellcheck = !editor.spellcheck;
        alert(`Spell check ${editor.spellcheck ? 'enabled' : 'disabled'}`);
      }
    },

    translate: () => {
      const selection = window.getSelection();
      const text = selection?.toString() || '';
      if (text) {
        window.open(`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}`, '_blank');
      }
    },

    // Document operations
    print: () => {
      window.print();
    },

    share: () => {
      if (navigator.share) {
        const editor = getContentEditableElement();
        const content = editor?.textContent || '';
        navigator.share({
          title: 'Document',
          text: content.substring(0, 100) + '...'
        });
      } else {
        alert('Share not supported in this browser');
      }
    },

    export: () => {
      const editor = getContentEditableElement();
      if (editor) {
        const content = editor.innerHTML;
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
      }
    },

    // History
    undo: () => execCommand('undo'),
    redo: () => execCommand('redo')
  };
};

export const createAdvancedTableOperations = (
  selectedCell: HTMLTableCellElement | null
): TableOperationsAdvanced => {
  
  const getTable = (): HTMLTableElement | null => {
    return selectedCell?.closest('table') as HTMLTableElement;
  };

  const getRow = (): HTMLTableRowElement | null => {
    return selectedCell?.closest('tr') as HTMLTableRowElement;
  };

  const getCellIndex = (): number => {
    const row = getRow();
    if (!row || !selectedCell) return -1;
    return Array.from(row.cells).indexOf(selectedCell);
  };

  const getRowIndex = (): number => {
    const table = getTable();
    const row = getRow();
    if (!table || !row) return -1;
    return Array.from(table.rows).indexOf(row);
  };

  return {
    // Clipboard operations (for cell content)
    copy: () => {
      if (selectedCell) {
        try {
          const text = selectedCell.textContent || '';
          navigator.clipboard.writeText(text);
        } catch (e) {
          // Fallback: create a temporary selection
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(selectedCell);
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.execCommand('copy');
          selection?.removeAllRanges();
        }
      }
    },

    copyWithFormatting: () => {
      if (selectedCell) {
        try {
          const text = selectedCell.textContent || '';
          
          // Create a complete copy of the cell with all its formatting
          const cellClone = selectedCell.cloneNode(true) as HTMLTableCellElement;
          
          // Ensure all styles are preserved as inline styles
          const computedStyle = window.getComputedStyle(selectedCell);
          const importantStyles = [
            'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight',
            'fontStyle', 'textAlign', 'verticalAlign', 'padding', 'border',
            'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
            'textDecoration', 'lineHeight'
          ];
          
          importantStyles.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (value && value !== 'initial' && value !== 'normal') {
              (cellClone.style as any)[prop] = value;
            }
          });
          
          const html = cellClone.outerHTML;
          
          if (navigator.clipboard && 'write' in navigator.clipboard) {
            const data = [
              new ClipboardItem({
                'text/plain': new Blob([text], { type: 'text/plain' }),
                'text/html': new Blob([html], { type: 'text/html' })
              })
            ];
            navigator.clipboard.write(data);
          } else {
            // Fallback: create a temporary div with the formatted content
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.appendChild(cellClone);
            document.body.appendChild(tempDiv);
            
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(tempDiv);
            selection?.removeAllRanges();
            selection?.addRange(range);
            
            document.execCommand('copy');
            
            document.body.removeChild(tempDiv);
            selection?.removeAllRanges();
          }
        } catch (e) {
          console.warn('Table copy with formatting failed, falling back to regular copy:', e);
          // Fallback to regular copy
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(selectedCell);
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.execCommand('copy');
          selection?.removeAllRanges();
        }
      }
    },

    cut: () => {
      if (selectedCell) {
        try {
          const text = selectedCell.textContent || '';
          navigator.clipboard.writeText(text);
          selectedCell.textContent = '';
        } catch (e) {
          // Fallback: create a temporary selection
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(selectedCell);
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.execCommand('cut');
          selection?.removeAllRanges();
        }
      }
    },

    paste: async () => {
      if (selectedCell) {
        try {
          const text = await navigator.clipboard.readText();
          selectedCell.textContent = text;
        } catch (e) {
          // Fallback: focus cell and use execCommand
          selectedCell.focus();
          document.execCommand('paste');
        }
      }
    },

    pasteWithFormatting: async () => {
      if (selectedCell) {
        try {
          if (navigator.clipboard && 'read' in navigator.clipboard) {
            const clipboardItems = await navigator.clipboard.read();
            for (const clipboardItem of clipboardItems) {
              if (clipboardItem.types.includes('text/html')) {
                const htmlBlob = await clipboardItem.getType('text/html');
                let html = await htmlBlob.text();
                
                // Clean the HTML and extract content for cell
                html = cleanPastedHTML(html);
                
                // If the pasted content is a table cell, extract its inner content
                if (html.includes('<td') || html.includes('<th')) {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = html;
                  const cell = tempDiv.querySelector('td, th');
                  if (cell) {
                    // Copy styles from the pasted cell
                    if (cell.hasAttribute('style')) {
                      const pastedStyles = cell.getAttribute('style');
                      const currentStyles = selectedCell.getAttribute('style') || '';
                      selectedCell.setAttribute('style', currentStyles + '; ' + pastedStyles);
                    }
                    selectedCell.innerHTML = cell.innerHTML;
                  } else {
                    selectedCell.innerHTML = html;
                  }
                } else {
                  selectedCell.innerHTML = html;
                }
                
                // Trigger any change events
                selectedCell.dispatchEvent(new Event('input', { bubbles: true }));
                return;
              }
            }
          }
          
          // Fallback to regular paste
          selectedCell.focus();
          document.execCommand('paste');
        } catch (e) {
          console.warn('Table paste with formatting failed, falling back to regular paste:', e);
          // Fallback: focus cell and use execCommand
          selectedCell.focus();
          document.execCommand('paste');
        }
      }
    },

    // Row operations
    insertRowAbove: () => {
      const table = getTable();
      const row = getRow();
      const rowIndex = getRowIndex();
      
      if (table && row && rowIndex >= 0) {
        const newRow = table.insertRow(rowIndex);
        const cellCount = row.cells.length;
        
        for (let i = 0; i < cellCount; i++) {
          const cell = newRow.insertCell();
          cell.style.padding = '8px';
          cell.style.border = '1px solid #ccc';
          cell.contentEditable = 'true';
          cell.textContent = 'New cell';
        }
      }
    },

    insertRowBelow: () => {
      const table = getTable();
      const row = getRow();
      const rowIndex = getRowIndex();
      
      if (table && row && rowIndex >= 0) {
        const newRow = table.insertRow(rowIndex + 1);
        const cellCount = row.cells.length;
        
        for (let i = 0; i < cellCount; i++) {
          const cell = newRow.insertCell();
          cell.style.padding = '8px';
          cell.style.border = '1px solid #ccc';
          cell.contentEditable = 'true';
          cell.textContent = 'New cell';
        }
      }
    },

    deleteRow: () => {
      const table = getTable();
      const rowIndex = getRowIndex();
      
      if (table && rowIndex >= 0 && table.rows.length > 1) {
        if (confirm('Delete this row?')) {
          table.deleteRow(rowIndex);
        }
      }
    },

    duplicateRow: () => {
      const table = getTable();
      const row = getRow();
      const rowIndex = getRowIndex();
      
      if (table && row && rowIndex >= 0) {
        const newRow = table.insertRow(rowIndex + 1);
        
        Array.from(row.cells).forEach((cell, index) => {
          const newCell = newRow.insertCell();
          newCell.innerHTML = cell.innerHTML;
          newCell.style.cssText = cell.style.cssText;
          newCell.contentEditable = 'true';
        });
      }
    },

    // Column operations
    insertColumnLeft: () => {
      const table = getTable();
      const cellIndex = getCellIndex();
      
      if (table && cellIndex >= 0) {
        Array.from(table.rows).forEach(row => {
          const cell = row.insertCell(cellIndex);
          cell.style.padding = '8px';
          cell.style.border = '1px solid #ccc';
          cell.contentEditable = 'true';
          cell.textContent = 'New cell';
        });
      }
    },

    insertColumnRight: () => {
      const table = getTable();
      const cellIndex = getCellIndex();
      
      if (table && cellIndex >= 0) {
        Array.from(table.rows).forEach(row => {
          const cell = row.insertCell(cellIndex + 1);
          cell.style.padding = '8px';
          cell.style.border = '1px solid #ccc';
          cell.contentEditable = 'true';
          cell.textContent = 'New cell';
        });
      }
    },

    deleteColumn: () => {
      const table = getTable();
      const cellIndex = getCellIndex();
      
      if (table && cellIndex >= 0 && table.rows[0]?.cells.length > 1) {
        if (confirm('Delete this column?')) {
          Array.from(table.rows).forEach(row => {
            if (row.cells[cellIndex]) {
              row.deleteCell(cellIndex);
            }
          });
        }
      }
    },

    duplicateColumn: () => {
      const table = getTable();
      const cellIndex = getCellIndex();
      
      if (table && cellIndex >= 0) {
        Array.from(table.rows).forEach(row => {
          const originalCell = row.cells[cellIndex];
          if (originalCell) {
            const newCell = row.insertCell(cellIndex + 1);
            newCell.innerHTML = originalCell.innerHTML;
            newCell.style.cssText = originalCell.style.cssText;
            newCell.contentEditable = 'true';
          }
        });
      }
    },

    // Cell operations
    mergeCells: () => {
      alert('Merge cells functionality would need more complex implementation');
    },

    splitCell: () => {
      alert('Split cell functionality would need more complex implementation');
    },

    clearCell: () => {
      if (selectedCell) {
        selectedCell.textContent = '';
      }
    },

    // Table structure
    deleteTable: () => {
      const table = getTable();
      if (table && confirm('Delete entire table?')) {
        table.remove();
      }
    },

    tableProperties: () => {
      const table = getTable();
      if (table) {
        const width = prompt('Table width (%):', '100');
        if (width) {
          table.style.width = width + '%';
        }
      }
    },

    // Formatting
    cellBackground: () => {
      if (selectedCell) {
        const color = prompt('Enter background color (hex):');
        if (color) {
          selectedCell.style.backgroundColor = color;
        }
      }
    },

    cellBorders: () => {
      if (selectedCell) {
        const border = prompt('Enter border style (e.g., 1px solid black):', '1px solid black');
        if (border) {
          selectedCell.style.border = border;
        }
      }
    },

    cellAlignment: () => {
      if (selectedCell) {
        const alignment = prompt('Text alignment (left, center, right):', 'left');
        if (alignment) {
          selectedCell.style.textAlign = alignment;
        }
      }
    },

    // Data operations
    sortAscending: () => {
      alert('Sort functionality would need more complex implementation');
    },

    sortDescending: () => {
      alert('Sort functionality would need more complex implementation');
    },

    filterData: () => {
      alert('Filter functionality would need more complex implementation');
    },

    // Advanced
    convertToText: () => {
      const table = getTable();
      if (table) {
        const text = Array.from(table.rows).map(row => 
          Array.from(row.cells).map(cell => cell.textContent).join('\t')
        ).join('\n');
        
        const textNode = document.createTextNode(text);
        table.parentNode?.replaceChild(textNode, table);
      }
    },

    exportTable: () => {
      const table = getTable();
      if (table) {
        const csvContent = Array.from(table.rows).map(row => 
          Array.from(row.cells).map(cell => `"${cell.textContent}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };
};