import { useState, useEffect, useRef } from 'react';
import { ContextMenuState, Position } from '../types';

export interface EditorContextMenuState {
  isVisible: boolean;
  position: Position;
}

export const useContextMenu = (onBubbleMenuClose?: () => void) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    selectedCell: null
  });

  const [editorContextMenu, setEditorContextMenu] = useState<EditorContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 }
  });

  const closeContextMenu = () => {
    setContextMenu({
      isVisible: false,
      position: { x: 0, y: 0 },
      selectedCell: null
    });
  };

  const closeEditorContextMenu = () => {
    setEditorContextMenu({
      isVisible: false,
      position: { x: 0, y: 0 }
    });
  };

  const closeAllMenus = () => {
    closeContextMenu();
    closeEditorContextMenu();
  };

  const openContextMenu = (position: Position, selectedCell: HTMLTableCellElement) => {
    console.log('useContextMenu: openContextMenu called', { position, selectedCell });
    onBubbleMenuClose?.(); // Close bubble menu if callback provided
    closeEditorContextMenu(); // Close editor menu if open
    setContextMenu({
      isVisible: true,
      position,
      selectedCell
    });
    console.log('useContextMenu: table context menu state set to visible');
  };

  const openEditorContextMenu = (position: Position) => {
    console.log('useContextMenu: openEditorContextMenu called', { position });
    onBubbleMenuClose?.(); // Close bubble menu if callback provided
    closeContextMenu(); // Close table menu if open
    setEditorContextMenu({
      isVisible: true,
      position
    });
    console.log('useContextMenu: editor context menu state set to visible');
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (contextMenu.isVisible || editorContextMenu.isVisible)) {
        closeAllMenus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [contextMenu.isVisible, editorContextMenu.isVisible]);

  return {
    contextMenu,
    editorContextMenu,
    openContextMenu,
    openEditorContextMenu,
    closeContextMenu,
    closeEditorContextMenu,
    closeAllMenus
  };
};

export const useRightClickHandler = (
  editorRef: React.RefObject<HTMLDivElement | null>,
  onContextMenu: (position: Position, cell: HTMLTableCellElement) => void,
  onEditorContextMenu: (position: Position) => void
) => {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      console.log('useRightClickHandler: contextmenu event', event.target);
      
      // Check if the event target is within the editor
      const target = event.target as HTMLElement;
      const editor = editorRef.current;
      
      if (!editor || !editor.contains(target)) {
        console.log('useRightClickHandler: target not in editor, ignoring');
        return; // Let other elements handle their own context menus
      }
      
      // Always prevent default for editor area
      event.preventDefault();
      event.stopPropagation();
      
      console.log('useRightClickHandler: prevented default, processing...');
      
      const cell = target.closest('td, th') as HTMLTableCellElement;
      const table = target.closest('table');
      
      console.log('useRightClickHandler: table detection', { cell, table, targetTagName: target.tagName });
      
      if (cell && table) {
        // Table context menu
        console.log('useRightClickHandler: calling table context menu');
        onContextMenu({ x: event.clientX, y: event.clientY }, cell);
      } else {
        // General editor context menu
        console.log('useRightClickHandler: calling editor context menu');
        onEditorContextMenu({ x: event.clientX, y: event.clientY });
      }
    };

    // Add event listener to document to catch all context menu events
    console.log('useRightClickHandler: adding document context menu listener');
    document.addEventListener('contextmenu', handleContextMenu, true);
    
    return () => {
      console.log('useRightClickHandler: removing document context menu listener');
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [editorRef, onContextMenu, onEditorContextMenu]);
};