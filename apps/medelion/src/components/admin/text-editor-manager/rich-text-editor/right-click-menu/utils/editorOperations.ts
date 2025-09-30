export interface EditorOperations {
  // Basic Clipboard Operations
  copy: () => void;
  cut: () => void;
  paste: () => void;
  
  // Text Operations
  delete: () => void;
  selectAll: () => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  
  // Text Formatting
  bold: () => void;
  italic: () => void;
  underline: () => void;
  
  // Text Transformation
  uppercase: () => void;
  lowercase: () => void;
  capitalize: () => void;
  
  // Advanced Operations
  findReplace: () => void;
  wordCount: () => void;
  clearFormatting: () => void;
}

export const createEditorOperations = (editorRef: React.RefObject<HTMLDivElement | null>): EditorOperations => {
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const getSelectedText = (): string => {
    const selection = window.getSelection();
    return selection ? selection.toString() : '';
  };

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    }
  };

  const pasteFromClipboard = async () => {
    if (navigator.clipboard) {
      try {
        const text = await navigator.clipboard.readText();
        executeCommand('insertText', text);
      } catch (err) {
        // Fallback - let browser handle paste
        executeCommand('paste');
      }
    }
  };

  return {
    // Basic Clipboard Operations
    copy: () => {
      const selectedText = getSelectedText();
      if (selectedText) {
        copyToClipboard(selectedText);
      }
    },

    cut: () => {
      const selectedText = getSelectedText();
      if (selectedText) {
        copyToClipboard(selectedText);
        executeCommand('delete');
      }
    },

    paste: () => {
      pasteFromClipboard();
    },

    // Text Operations
    delete: () => {
      executeCommand('delete');
    },

    selectAll: () => {
      if (editorRef.current) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    },

    // Undo/Redo
    undo: () => {
      executeCommand('undo');
    },

    redo: () => {
      executeCommand('redo');
    },

    // Text Formatting
    bold: () => {
      executeCommand('bold');
    },

    italic: () => {
      executeCommand('italic');
    },

    underline: () => {
      executeCommand('underline');
    },

    // Text Transformation
    uppercase: () => {
      const selectedText = getSelectedText();
      if (selectedText) {
        executeCommand('insertText', selectedText.toUpperCase());
      }
    },

    lowercase: () => {
      const selectedText = getSelectedText();
      if (selectedText) {
        executeCommand('insertText', selectedText.toLowerCase());
      }
    },

    capitalize: () => {
      const selectedText = getSelectedText();
      if (selectedText) {
        const capitalized = selectedText.replace(/\b\w/g, l => l.toUpperCase());
        executeCommand('insertText', capitalized);
      }
    },

    // Advanced Operations
    findReplace: () => {
      // This would typically open a find/replace dialog
      // For now, we'll use the browser's find function
      executeCommand('find');
    },

    wordCount: () => {
      if (editorRef.current) {
        const text = editorRef.current.innerText || '';
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const charCount = text.length;
        alert(`Words: ${wordCount}\nCharacters: ${charCount}`);
      }
    },

    clearFormatting: () => {
      executeCommand('removeFormat');
    }
  };
};