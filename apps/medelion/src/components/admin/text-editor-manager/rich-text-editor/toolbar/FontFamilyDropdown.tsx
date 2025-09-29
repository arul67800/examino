'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import { ChevronDown, Type } from 'lucide-react';
import { FONT_FAMILIES } from '../utils/constants';

interface FontFamilyDropdownProps {
  onFontChange: (fontFamily: string) => void;
  compact?: boolean;
  currentFont?: string;
}

export const FontFamilyDropdown: React.FC<FontFamilyDropdownProps> = ({
  onFontChange,
  compact = false,
  currentFont = 'inherit'
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
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

  const currentFontFamily = FONT_FAMILIES.find(font => font.value === currentFont) || FONT_FAMILIES[0];

  const handleFontSelect = (fontValue: string) => {
    onFontChange(fontValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`
          inline-flex items-center justify-between
          ${compact ? 'px-2 py-1.5' : 'px-3 py-1.5 min-w-[140px]'}
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
          <Type className="w-4 h-4" />
          {!compact && (
            <span 
              className="truncate"
              style={{ fontFamily: currentFontFamily.value }}
            >
              {currentFontFamily.name}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-md shadow-lg border min-w-[200px] max-h-64 overflow-y-auto"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary
          }}
        >
          <div className="py-1">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.value}
                className={`
                  w-full px-3 py-2 text-left hover:opacity-80 transition-colors
                  ${font.value === currentFont ? 'font-medium' : ''}
                `}
                style={{
                  backgroundColor: font.value === currentFont 
                    ? theme.colors.semantic.action.primary + '20' 
                    : 'transparent',
                  color: theme.colors.semantic.text.primary,
                  fontFamily: font.value
                }}
                onClick={() => handleFontSelect(font.value)}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};