'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import { ChevronDown, Type } from 'lucide-react';
import { HEADING_OPTIONS } from '../utils/constants';

interface HeadingsDropdownProps {
  onHeadingChange: (level: number) => void;
  compact?: boolean;
  currentHeading?: number;
}

export const HeadingsDropdown: React.FC<HeadingsDropdownProps> = ({
  onHeadingChange,
  compact = false,
  currentHeading = 0
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

  const currentOption = HEADING_OPTIONS.find(opt => opt.level === currentHeading) || HEADING_OPTIONS[0];

  const handleHeadingSelect = (level: number) => {
    onHeadingChange(level);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`
          inline-flex items-center justify-between
          ${compact ? 'px-2 py-1.5' : 'px-3 py-1.5 min-w-[120px]'}
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
          {!compact && <span>{currentOption.label}</span>}
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-md shadow-lg border min-w-[180px]"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary
          }}
        >
          <div className="py-1">
            {HEADING_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`
                  w-full px-3 py-2 text-left hover:opacity-80 transition-colors
                  ${option.level === currentHeading ? 'font-medium' : ''}
                `}
                style={{
                  backgroundColor: option.level === currentHeading 
                    ? theme.colors.semantic.action.primary + '20' 
                    : 'transparent',
                  color: theme.colors.semantic.text.primary
                }}
                onClick={() => handleHeadingSelect(option.level)}
              >
                <div 
                  className={`
                    ${option.level === 1 ? 'text-2xl font-bold' : ''}
                    ${option.level === 2 ? 'text-xl font-bold' : ''}
                    ${option.level === 3 ? 'text-lg font-bold' : ''}
                    ${option.level === 4 ? 'text-base font-bold' : ''}
                    ${option.level === 5 ? 'text-sm font-bold' : ''}
                    ${option.level === 6 ? 'text-xs font-bold' : ''}
                    ${option.level === 0 ? 'text-base' : ''}
                  `}
                >
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};