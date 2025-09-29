'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useTheme } from '@/theme';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  showToast: (message: string, type: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

let nextId = 1;

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { theme } = useTheme();

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-80 transform transition-all duration-300 animate-fade-in"
            style={{
              backgroundColor: toast.type === 'success' ? theme.colors.semantic.status.success
                : toast.type === 'error' ? theme.colors.semantic.status.error
                : toast.type === 'warning' ? theme.colors.semantic.status.warning
                : theme.colors.semantic.status.info,
              color: theme.colors.semantic.text.inverse
            }}
          >
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-70 hover:opacity-100">
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}