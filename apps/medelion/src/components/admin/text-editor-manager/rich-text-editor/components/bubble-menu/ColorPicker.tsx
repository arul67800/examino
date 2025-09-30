'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import { Palette, Type, Highlighter } from 'lucide-react';

interface ColorPickerProps {
  type: 'text' | 'background';
  onColorChange: (color: string) => void;
  tooltip: string;
}

const colorPalette = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#c0c0c0', '#808080',
  '#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff', '#99ffff', '#ffcc99', '#cc99ff',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f',
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#95a5a6'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  type,
  onColorChange,
  tooltip
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#000000');
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

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  const Icon = type === 'text' ? Type : Highlighter;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="group flex items-center justify-center w-7 h-7 rounded transition-all duration-150 hover:scale-105 active:scale-95"
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
        <Icon size={12} />
        
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
          className="absolute top-full mt-2 p-3 rounded-lg shadow-lg border animate-in fade-in-0 zoom-in-95 duration-200 z-20"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary,
            minWidth: '200px',
          }}
        >
          {/* Color Palette */}
          <div className="grid grid-cols-8 gap-1 mb-3">
            {colorPalette.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform duration-150 ring-2 ring-transparent hover:ring-gray-300"
                style={{
                  backgroundColor: color,
                  borderColor: color === '#ffffff' ? theme.colors.semantic.border.primary : 'transparent',
                }}
                onClick={() => handleColorSelect(color)}
                title={color}
              />
            ))}
          </div>

          {/* Custom Color Input */}
          <div className="space-y-2">
            <label
              className="block text-xs font-medium"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Custom Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ borderColor: theme.colors.semantic.border.primary }}
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    onColorChange(e.target.value);
                  }
                }}
                className="flex-1 px-2 py-1 text-xs rounded border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary,
                }}
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Remove Color Button */}
          <button
            className="w-full mt-3 px-3 py-2 text-xs rounded hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              color: theme.colors.semantic.text.secondary,
            }}
            onClick={() => handleColorSelect(type === 'text' ? '#000000' : 'transparent')}
          >
            Remove {type === 'text' ? 'Color' : 'Background'}
          </button>
        </div>
      )}
    </div>
  );
};