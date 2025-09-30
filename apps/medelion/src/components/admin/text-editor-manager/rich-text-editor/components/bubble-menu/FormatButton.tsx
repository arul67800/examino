'use client';

import React from 'react';
import { useTheme } from '@/theme';

interface FormatButtonProps {
  icon: string;
  isActive: boolean;
  onClick: () => void;
  tooltip: string;
  weight?: 'normal' | 'bold';
  style?: 'normal' | 'italic';
  underline?: boolean;
}

export const FormatButton: React.FC<FormatButtonProps> = ({
  icon,
  isActive,
  onClick,
  tooltip,
  weight = 'normal',
  style = 'normal',
  underline = false
}) => {
  const { theme } = useTheme();

  return (
    <button
      className="relative group flex items-center justify-center w-7 h-7 rounded transition-all duration-150 hover:scale-105 active:scale-95"
      style={{
        backgroundColor: isActive 
          ? theme.colors.semantic.action.primary 
          : 'transparent',
        color: isActive 
          ? theme.colors.semantic.text.inverse 
          : theme.colors.semantic.text.primary,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isActive 
          ? theme.colors.semantic.action.primary 
          : theme.colors.semantic.surface.secondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isActive 
          ? theme.colors.semantic.action.primary 
          : 'transparent';
      }}
      title={tooltip}
    >
      <span
        className="text-xs font-medium select-none"
        style={{
          fontWeight: weight === 'bold' ? 'bold' : 'normal',
          fontStyle: style === 'italic' ? 'italic' : 'normal',
          textDecoration: underline ? 'underline' : 'none',
        }}
      >
        {icon}
      </span>
      
      {/* Tooltip */}
      <div
        className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
        style={{
          backgroundColor: theme.colors.semantic.surface.tertiary,
          color: theme.colors.semantic.text.primary,
        }}
      >
        {tooltip}
      </div>
    </button>
  );
};