import { useState, useCallback, useRef, useEffect } from 'react';
import { EditorState, EditorHistory, EditorSelection } from '../types';
import { EditorUtils } from '../utils/EditorUtils';
import { AUTO_SAVE_DEFAULTS } from '../utils/constants';

export function useEditorState(initialContent: string = '') {
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    selection: null,
    history: [EditorUtils.createHistoryEntry(initialContent, 'initialize')],
    historyIndex: 0,
    activeFormats: new Set(),
    currentFont: {
      family: 'inherit',
      size: 16,
      weight: 400,
      style: 'normal',
      color: '#000000',
      backgroundColor: 'transparent'
    },
    isReadOnly: false,
    isDirty: false
  });

  const updateContent = useCallback((content: string, operation: string = 'edit') => {
    setState(prevState => {
      const historyEntry = EditorUtils.createHistoryEntry(content, operation);
      const newHistory = [
        ...prevState.history.slice(0, prevState.historyIndex + 1),
        historyEntry
      ];
      const limitedHistory = EditorUtils.limitHistory(newHistory);
      
      return {
        ...prevState,
        content,
        history: limitedHistory,
        historyIndex: limitedHistory.length - 1,
        isDirty: true,
        lastSaved: undefined
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(prevState => {
      if (prevState.historyIndex > 0) {
        const newIndex = prevState.historyIndex - 1;
        return {
          ...prevState,
          content: prevState.history[newIndex].content,
          historyIndex: newIndex,
          isDirty: true
        };
      }
      return prevState;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prevState => {
      if (prevState.historyIndex < prevState.history.length - 1) {
        const newIndex = prevState.historyIndex + 1;
        return {
          ...prevState,
          content: prevState.history[newIndex].content,
          historyIndex: newIndex,
          isDirty: true
        };
      }
      return prevState;
    });
  }, []);

  const updateSelection = useCallback((selection: EditorSelection | null) => {
    setState(prevState => ({
      ...prevState,
      selection
    }));
  }, []);

  const updateActiveFormats = useCallback((formats: Set<string>) => {
    setState(prevState => ({
      ...prevState,
      activeFormats: formats
    }));
  }, []);

  const markSaved = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isDirty: false,
      lastSaved: new Date()
    }));
  }, []);

  return {
    state,
    updateContent,
    undo,
    redo,
    updateSelection,
    updateActiveFormats,
    markSaved,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1
  };
}