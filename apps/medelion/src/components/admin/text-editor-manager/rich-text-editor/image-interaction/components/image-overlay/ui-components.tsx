import React from 'react';
import { RotateCcw, Move3D, Settings } from 'lucide-react';

export interface ResizeHandleProps {
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  onMouseDown: (e: React.MouseEvent, position: string) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ position, onMouseDown }) => {
  const getPositionStyles = (pos: string) => {
    switch (pos) {
      case 'nw': return { top: '-4px', left: '-4px', cursor: 'nw-resize' };
      case 'ne': return { top: '-4px', right: '-4px', cursor: 'ne-resize' };
      case 'sw': return { bottom: '-4px', left: '-4px', cursor: 'sw-resize' };
      case 'se': return { bottom: '-4px', right: '-4px', cursor: 'se-resize' };
      case 'n': return { top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' };
      case 's': return { bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' };
      case 'e': return { right: '-4px', top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' };
      case 'w': return { left: '-4px', top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' };
      default: return {};
    }
  };

  return (
    <div
      className="absolute w-2 h-2 bg-blue-500 rounded-full border border-white shadow-sm hover:bg-blue-600 transition-colors"
      style={getPositionStyles(position)}
      onMouseDown={(e) => onMouseDown(e, position)}
    />
  );
};

export interface DragPlaceholderProps {
  isHighPrecision?: boolean;
}

export const DragPlaceholder: React.FC<DragPlaceholderProps> = ({ isHighPrecision = false }) => {
  return (
    <div
      className={`
        ${isHighPrecision ? 'h-px bg-gradient-to-r from-emerald-500 to-emerald-600' : 'h-0.5 bg-gradient-to-r from-blue-500 to-blue-600'}
        ${isHighPrecision ? 'rounded-sm' : 'rounded'}
        ${isHighPrecision ? 'my-0.5' : 'my-1'}
        opacity-0 transition-all duration-120 ease-out
        shadow-lg
        transform scale-x-0 origin-left
        relative pointer-events-none
      `}
      style={{
        boxShadow: isHighPrecision 
          ? '0 0 8px rgba(16, 185, 129, 0.6), 0 1px 2px rgba(0, 0, 0, 0.1)'
          : '0 0 12px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    />
  );
};

export interface ImageToolbarProps {
  onRotate: () => void;
  onMove: () => void;
  onSettings: () => void;
  isDragging?: boolean;
}

export const ImageToolbar: React.FC<ImageToolbarProps> = ({ 
  onRotate, 
  onMove, 
  onSettings, 
  isDragging = false 
}) => {
  return (
    <div 
      className={`
        absolute -top-10 left-0 flex items-center gap-1 
        bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md shadow-md
        px-2 py-1 transition-opacity duration-200
        ${isDragging ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      <button
        onClick={onRotate}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Rotate Image"
      >
        <RotateCcw size={14} className="text-gray-600" />
      </button>
      <button
        onClick={onMove}
        className="p-1 hover:bg-gray-100 rounded transition-colors cursor-move"
        title="Move Image"
      >
        <Move3D size={14} className="text-gray-600" />
      </button>
      <button
        onClick={onSettings}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Image Settings"
      >
        <Settings size={14} className="text-gray-600" />
      </button>
    </div>
  );
};

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 20, 
  color = 'currentColor' 
}) => {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"
      style={{ 
        width: size, 
        height: size,
        borderTopColor: color 
      }}
    />
  );
};

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm rounded">
      <div className="text-center p-4">
        <p className="text-red-600 text-sm mb-2">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};