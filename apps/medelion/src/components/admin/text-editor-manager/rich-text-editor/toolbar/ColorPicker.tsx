'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import { ChevronDown, Palette, Type, Highlighter } from 'lucide-react';
import { COLOR_PALETTES } from '../utils/constants';

interface ColorPickerProps {
  type: 'text' | 'background';
  onColorChange: (color: string) => void;
  compact?: boolean;
  currentColor?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  type,
  onColorChange,
  compact = false,
  currentColor = type === 'text' ? '#000000' : 'transparent'
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'extended' | 'professional' | 'custom'>('basic');
  const [customColor, setCustomColor] = useState('#000000');
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

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onColorChange(color);
  };

  const Icon = type === 'text' ? Type : Highlighter;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`
          inline-flex items-center justify-between
          ${compact ? 'px-2 py-1.5' : 'px-3 py-1.5'}
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
          <div className="relative">
            <Icon className="w-4 h-4" />
            <div 
              className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded"
              style={{ backgroundColor: currentColor === 'transparent' ? '#ccc' : currentColor }}
            />
          </div>
          {!compact && (
            <ChevronDown 
              className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          )}
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-md shadow-lg border min-w-[280px]"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary
          }}
        >
          {/* Color Tabs */}
          <div className="flex border-b" style={{ borderColor: theme.colors.semantic.border.secondary }}>
            {['basic', 'extended', 'professional', 'custom'].map((tab) => (
              <button
                key={tab}
                className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  activeTab === tab ? '' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: activeTab === tab 
                    ? theme.colors.semantic.action.primary + '20' 
                    : 'transparent',
                  color: theme.colors.semantic.text.primary
                }}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-3">
            {activeTab === 'custom' ? (
              /* Custom Color Picker */
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-12 h-8 rounded border cursor-pointer"
                    style={{ borderColor: theme.colors.semantic.border.primary }}
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.primary
                    }}
                  />
                </div>
                <button
                  onClick={() => handleColorSelect(customColor)}
                  className="w-full px-3 py-2 text-sm rounded transition-colors"
                  style={{
                    backgroundColor: theme.colors.semantic.action.primary,
                    color: theme.colors.semantic.text.inverse
                  }}
                >
                  Apply Color
                </button>
              </div>
            ) : (
              /* Color Palette */
              <div className="grid grid-cols-8 gap-1">
                {/* Transparent/Remove color option */}
                {type === 'background' && (
                  <button
                    onClick={() => handleColorSelect('transparent')}
                    className="w-6 h-6 border-2 rounded relative hover:scale-110 transition-transform"
                    style={{ borderColor: theme.colors.semantic.border.primary }}
                    title="No background color"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-500 opacity-20 rounded"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-0.5 bg-red-500 rotate-45 absolute"></div>
                    </div>
                  </button>
                )}
                
                {COLOR_PALETTES[activeTab as keyof typeof COLOR_PALETTES].map((color, index) => (
                  <button
                    key={`${activeTab}-${index}`}
                    onClick={() => handleColorSelect(color)}
                    className={`w-6 h-6 rounded border hover:scale-110 transition-transform ${
                      currentColor === color ? 'ring-2 ring-offset-1' : ''
                    }`}
                    style={{
                      backgroundColor: color,
                      borderColor: theme.colors.semantic.border.primary,
                      ...(currentColor === color && {
                        boxShadow: `0 0 0 2px ${theme.colors.semantic.action.primary}`
                      })
                    }}
                    title={color}
                  />
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t space-y-1" style={{ borderColor: theme.colors.semantic.border.secondary }}>
              {type === 'background' && (
                <button
                  onClick={() => handleColorSelect('transparent')}
                  className="w-full px-2 py-1 text-xs rounded transition-colors text-left"
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.colors.semantic.text.secondary
                  }}
                >
                  Remove background color
                </button>
              )}
              {type === 'text' && (
                <button
                  onClick={() => handleColorSelect('#000000')}
                  className="w-full px-2 py-1 text-xs rounded transition-colors text-left"
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.colors.semantic.text.secondary
                  }}
                >
                  Reset to default text color
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};