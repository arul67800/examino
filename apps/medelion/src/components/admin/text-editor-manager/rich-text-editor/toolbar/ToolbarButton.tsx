'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { EditorTool } from '../types';

interface ToolbarButtonProps {
  tool: EditorTool;
  isActive?: boolean;
  onClick: () => void;
  compact?: boolean;
  showLabel?: boolean;
  disabled?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  tool,
  isActive = false,
  onClick,
  compact = false,
  showLabel = false,
  disabled = false
}) => {
  const { theme } = useTheme();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onClick();
    }
  };

  const buttonClass = `
    inline-flex items-center justify-center
    ${compact ? 'p-1.5' : 'px-2 py-1.5'}
    rounded-md text-sm font-medium
    transition-all duration-200 ease-in-out
    hover:scale-105 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
    ${showLabel ? 'space-x-2' : ''}
    ${isActive ? 'shadow-sm' : 'hover:shadow-sm'}
  `.trim();

  const buttonStyle = {
    backgroundColor: isActive 
      ? theme.colors.semantic.action.primary 
      : 'transparent',
    color: isActive 
      ? theme.colors.semantic.text.inverse 
      : theme.colors.semantic.text.primary,
    borderColor: theme.colors.semantic.border.primary,
    focusRingColor: theme.colors.semantic.action.primary + '50'
  };

  const hoverStyle = !isActive ? {
    backgroundColor: theme.colors.semantic.action.hover
  } : {};

  return (
    <button
      className={buttonClass}
      style={buttonStyle}
      onClick={handleClick}
      disabled={disabled || tool.isDisabled}
      title={tool.tooltip || `${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
      data-tool={tool.id}
      onMouseEnter={(e) => {
        if (!isActive && !disabled) {
          Object.assign(e.currentTarget.style, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <tool.icon 
        className={compact ? 'w-4 h-4' : 'w-4 h-4'} 
      />
      {showLabel && !compact && (
        <span className="hidden sm:inline">{tool.label}</span>
      )}
      {tool.shortcut && !compact && (
        <kbd 
          className="hidden lg:inline-flex items-center px-1 py-0.5 text-xs rounded border"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.secondary,
            color: theme.colors.semantic.text.tertiary
          }}
        >
          {tool.shortcut.replace('Ctrl', '⌘').replace('+', '')}
        </kbd>
      )}
    </button>
  );
};