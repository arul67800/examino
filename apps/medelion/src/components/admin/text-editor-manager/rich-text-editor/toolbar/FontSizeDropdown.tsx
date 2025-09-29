'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import { ChevronDown, Type } from 'lucide-react';
import { FONT_SIZES } from '../utils/constants';

interface FontSizeDropdownProps {
  onSizeChange: (fontSize: number) => void;
  compact?: boolean;
  currentSize?: number;
}

export const FontSizeDropdown: React.FC<FontSizeDropdownProps> = ({
  onSizeChange,
  compact = false,
  currentSize = 16
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSizeSelect = (size: number) => {
    onSizeChange(size);
    setIsOpen(false);
  };

  const handleCustomSizeSubmit = () => {
    const size = parseInt(customSize);
    if (size >= 8 && size <= 72) {
      onSizeChange(size);
      setCustomSize('');
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSizeSubmit();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`
          inline-flex items-center justify-between
          ${compact ? 'px-2 py-1.5' : 'px-3 py-1.5 min-w-[80px]'}
          text-sm font-medium rounded-md
          transition-all duration-200 ease-in-out
          hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1
        `}
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          color: theme.colors.semantic.text.primary,
          borderColor: theme.colors.semantic.border.primary,
          border: `1px solid ${theme.colors.semantic.border.primary}`
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center space-x-2">
          {compact ? (
            <Type className="w-4 h-4" />
          ) : (
            <span className="font-mono">{currentSize}px</span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-md shadow-lg border min-w-[120px] max-h-64 overflow-y-auto"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary
          }}
        >
          {/* Custom size input */}
          <div className="p-2 border-b" style={{ borderColor: theme.colors.semantic.border.secondary }}>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="8"
                max="72"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Custom"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
              />
              <button
                onClick={handleCustomSizeSubmit}
                className="px-2 py-1 text-xs rounded transition-colors"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary,
                  color: theme.colors.semantic.text.inverse
                }}
              >
                Set
              </button>
            </div>
          </div>

          {/* Predefined sizes */}
          <div className="py-1">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                className={`
                  w-full px-3 py-2 text-left hover:opacity-80 transition-colors flex items-center justify-between
                  ${size === currentSize ? 'font-medium' : ''}
                `}
                style={{
                  backgroundColor: size === currentSize 
                    ? theme.colors.semantic.action.primary + '20' 
                    : 'transparent',
                  color: theme.colors.semantic.text.primary
                }}
                onClick={() => handleSizeSelect(size)}
              >
                <span>{size}px</span>
                <span 
                  className="font-mono text-xs opacity-70"
                  style={{ fontSize: Math.min(size, 16) + 'px' }}
                >
                  Aa
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};