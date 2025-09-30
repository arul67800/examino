'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import { Heading, ChevronDown } from 'lucide-react';

interface HeadingDropdownProps {
  onHeadingChange: (level: number) => void;
  tooltip: string;
}

const headingLevels = [
  { level: 0, label: 'Paragraph', style: { fontSize: '14px', fontWeight: 'normal' } },
  { level: 1, label: 'Heading 1', style: { fontSize: '24px', fontWeight: 'bold' } },
  { level: 2, label: 'Heading 2', style: { fontSize: '20px', fontWeight: 'bold' } },
  { level: 3, label: 'Heading 3', style: { fontSize: '18px', fontWeight: 'bold' } },
  { level: 4, label: 'Heading 4', style: { fontSize: '16px', fontWeight: 'bold' } },
  { level: 5, label: 'Heading 5', style: { fontSize: '14px', fontWeight: 'bold' } },
  { level: 6, label: 'Heading 6', style: { fontSize: '12px', fontWeight: 'bold' } },
];

export const HeadingDropdown: React.FC<HeadingDropdownProps> = ({
  onHeadingChange,
  tooltip
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeadingSelect = (level: number) => {
    setSelectedLevel(level);
    onHeadingChange(level);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="group flex items-center gap-0.5 px-1.5 h-7 rounded transition-all duration-150 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: isOpen 
            ? theme.colors.semantic.surface.secondary 
            : 'transparent',
          color: theme.colors.semantic.text.primary,
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.surface.secondary;
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
        title={tooltip}
      >
        <Heading size={12} />
        <span className="text-xs font-medium">
          {selectedLevel === 0 ? 'P' : `H${selectedLevel}`}
        </span>
        <ChevronDown 
          size={10} 
          className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
        
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

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 py-1 rounded-lg shadow-lg border animate-in fade-in-0 zoom-in-95 duration-200 z-20"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary,
            minWidth: '160px',
          }}
        >
          {headingLevels.map((heading) => (
            <button
              key={heading.level}
              className="w-full px-3 py-2 text-left hover:opacity-80 transition-opacity flex items-center gap-2"
              style={{
                backgroundColor: selectedLevel === heading.level 
                  ? theme.colors.semantic.surface.secondary 
                  : 'transparent',
                color: theme.colors.semantic.text.primary,
              }}
              onClick={() => handleHeadingSelect(heading.level)}
              onMouseEnter={(e) => {
                if (selectedLevel !== heading.level) {
                  e.currentTarget.style.backgroundColor = theme.colors.semantic.surface.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedLevel !== heading.level) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="text-xs font-medium w-6">
                {heading.level === 0 ? 'P' : `H${heading.level}`}
              </span>
              <span style={heading.style}>
                {heading.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};