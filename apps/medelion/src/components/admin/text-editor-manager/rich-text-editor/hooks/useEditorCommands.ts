import { useCallback, useRef } from 'react';
import { EditorUtils } from '../utils/EditorUtils';

export function useEditorCommands() {
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return false;
    
    editorRef.current.focus();
    return EditorUtils.executeCommand(command, value);
  }, []);

  const formatText = useCallback((format: string, value?: string) => {
    switch (format) {
      case 'bold':
        return executeCommand('bold');
      case 'italic':
        return executeCommand('italic');
      case 'underline':
        return executeCommand('underline');
      case 'strikethrough':
        return executeCommand('strikethrough');
      case 'superscript':
        return executeCommand('superscript');
      case 'subscript':
        return executeCommand('subscript');
      case 'removeFormat':
        return executeCommand('removeFormat');
      case 'fontSize':
        return executeCommand('fontSize', value);
      case 'fontName':
        return executeCommand('fontName', value);
      case 'foreColor':
        return executeCommand('foreColor', value);
      case 'backColor':
        return executeCommand('backColor', value);
      default:
        return false;
    }
  }, [executeCommand]);

  const alignText = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    switch (alignment) {
      case 'left':
        return executeCommand('justifyLeft');
      case 'center':
        return executeCommand('justifyCenter');
      case 'right':
        return executeCommand('justifyRight');
      case 'justify':
        return executeCommand('justifyFull');
      default:
        return false;
    }
  }, [executeCommand]);

  const createList = useCallback((type: 'ordered' | 'unordered') => {
    return executeCommand(type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList');
  }, [executeCommand]);

  const setHeading = useCallback((level: number) => {
    if (level === 0) {
      return executeCommand('formatBlock', 'p');
    } else {
      return executeCommand('formatBlock', `h${level}`);
    }
  }, [executeCommand]);

  const insertLink = useCallback((url?: string, text?: string) => {
    if (url) {
      return executeCommand('createLink', url);
    } else {
      const selectedText = EditorUtils.getSelectedText();
      const linkUrl = prompt('Enter URL:');
      if (linkUrl) {
        if (selectedText) {
          return executeCommand('createLink', linkUrl);
        } else {
          const linkText = text || prompt('Enter link text:') || 'Link';
          EditorUtils.insertHTMLAtCursor(`<a href="${linkUrl}">${linkText}</a>`);
          return true;
        }
      }
    }
    return false;
  }, [executeCommand]);

  const insertImage = useCallback((url?: string, alt?: string) => {
    if (url) {
      return executeCommand('insertImage', url);
    } else {
      const imageUrl = prompt('Enter image URL:');
      if (imageUrl) {
        return executeCommand('insertImage', imageUrl);
      }
    }
    return false;
  }, [executeCommand]);

  const insertHTML = useCallback((html: string) => {
    EditorUtils.insertHTMLAtCursor(html);
  }, []);

  const insertText = useCallback((text: string) => {
    EditorUtils.insertTextAtCursor(text);
  }, []);

  const insertTable = useCallback((rows: number, cols: number) => {
    if (!editorRef.current) return false;

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.border = '1px solid #e2e8f0';
    table.setAttribute('contenteditable', 'true');

    for (let i = 0; i < rows; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement(i === 0 ? 'th' : 'td');
        cell.style.border = '1px solid #e2e8f0';
        cell.style.padding = '8px';
        cell.style.minWidth = '100px';
        cell.style.textAlign = 'left';
        cell.setAttribute('contenteditable', 'true');
        
        if (i === 0) {
          cell.style.backgroundColor = '#f8fafc';
          cell.style.fontWeight = 'bold';
          cell.textContent = `Header ${j + 1}`;
        } else {
          cell.textContent = `Cell ${i},${j + 1}`;
        }
        
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    insertHTML(table.outerHTML);
    return true;
  }, [insertHTML]);

  const insertQuote = useCallback(() => {
    return executeCommand('formatBlock', 'blockquote');
  }, [executeCommand]);

  const insertCodeBlock = useCallback(() => {
    return executeCommand('formatBlock', 'pre');
  }, [executeCommand]);

  const insertHorizontalRule = useCallback(() => {
    return executeCommand('insertHorizontalRule');
  }, [executeCommand]);

  const indent = useCallback(() => {
    return executeCommand('indent');
  }, [executeCommand]);

  const outdent = useCallback(() => {
    return executeCommand('outdent');
  }, [executeCommand]);

  const selectAll = useCallback(() => {
    if (editorRef.current) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return true;
    }
    return false;
  }, []);

  const focus = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  const blur = useCallback(() => {
    editorRef.current?.blur();
  }, []);

  const getContent = useCallback(() => {
    return editorRef.current?.textContent || '';
  }, []);

  const getHTML = useCallback(() => {
    return editorRef.current?.innerHTML || '';
  }, []);

  const setContent = useCallback((content: string) => {
    if (editorRef.current) {
      editorRef.current.textContent = content;
    }
  }, []);

  const setHTML = useCallback((html: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = EditorUtils.sanitizeHTML(html);
    }
  }, []);

  return {
    editorRef,
    executeCommand,
    formatText,
    alignText,
    createList,
    setHeading,
    insertLink,
    insertImage,
    insertHTML,
    insertText,
    insertTable,
    insertQuote,
    insertCodeBlock,
    insertHorizontalRule,
    indent,
    outdent,
    selectAll,
    focus,
    blur,
    getContent,
    getHTML,
    setContent,
    setHTML
  };
}