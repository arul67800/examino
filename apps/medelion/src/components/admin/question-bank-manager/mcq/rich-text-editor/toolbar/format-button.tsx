'use client';

import React from 'react';
import { useTheme } from '../../../../../../theme/context';

interface FormatButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormatButton: React.FC<FormatButtonProps> = ({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
  className = '',
}) => {
  const { theme } = useTheme();

  const baseStyles = {
    padding: '6px 8px',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
  };

  const dynamicStyles = {
    backgroundColor: isActive 
      ? theme.colors.semantic.action.primary 
      : 'transparent',
    color: isActive 
      ? theme.colors.semantic.text.inverse 
      : theme.colors.semantic.text.primary,
  };

  const hoverStyles = !disabled && !isActive ? {
    backgroundColor: theme.colors.semantic.action.hover,
  } : {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`format-button ${className}`}
      style={{
        ...baseStyles,
        ...dynamicStyles,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
};