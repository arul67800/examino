import { useEffect, useRef, useCallback } from 'react';
import { EditorUtils } from '../utils/EditorUtils';

interface UseAutoSaveOptions {
  content: string;
  onSave: (content: string) => Promise<void> | void;
  interval?: number;
  enabled?: boolean;
  debounceDelay?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave({
  content,
  onSave,
  interval = 30000, // 30 seconds
  enabled = true,
  debounceDelay = 1000, // 1 second
  onSaveSuccess,
  onSaveError
}: UseAutoSaveOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef(content);
  const isSavingRef = useRef(false);

  const save = useCallback(async () => {
    if (isSavingRef.current || !enabled) return;
    
    try {
      isSavingRef.current = true;
      await onSave(content);
      lastSavedContent.current = content;
      onSaveSuccess?.();
    } catch (error) {
      onSaveError?.(error as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [content, onSave, enabled, onSaveSuccess, onSaveError]);

  const debouncedSave = useCallback(
    EditorUtils.debounce(save, debounceDelay),
    [save, debounceDelay]
  );

  // Auto-save on interval
  useEffect(() => {
    if (!enabled || interval <= 0) return;

    intervalRef.current = setInterval(() => {
      if (content !== lastSavedContent.current && !isSavingRef.current) {
        save();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [save, interval, enabled, content]);

  // Debounced auto-save on content change
  useEffect(() => {
    if (!enabled || content === lastSavedContent.current) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debouncedSave();

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [content, enabled, debouncedSave]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (content !== lastSavedContent.current && enabled) {
        // Attempt synchronous save
        try {
          onSave(content);
        } catch (error) {
          console.warn('Failed to save on page unload:', error);
        }
        
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [content, onSave, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    save,
    isSaving: isSavingRef.current,
    hasUnsavedChanges: content !== lastSavedContent.current,
    lastSavedContent: lastSavedContent.current
  };
}