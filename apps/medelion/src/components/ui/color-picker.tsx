'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  presetColors?: string[];
}

const defaultPresetColors = [
  '#8B5CF6', // Violet (Year)
  '#6366F1', // Indigo (Subject)
  '#3B82F6', // Blue (Part)
  '#047857', // Dark Green (Section)
  '#10B981', // Light Green (Chapter)
  '#7C3AED', // Deep Violet  
  '#4F46E5', // Deep Indigo
  '#059669', // Medium Green
  '#065F46', // Very Dark Green
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export default function ColorPicker({ 
  value, 
  onChange, 
  label, 
  presetColors = defaultPresetColors 
}: ColorPickerProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handlePresetColorClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  const handleCustomColorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) {
      onChange(customColor);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <label 
        className="block text-sm font-medium mb-2"
        style={{ color: theme.colors.semantic.text.primary }}
      >
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md w-full"
        style={{
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.secondary + '40',
        }}
      >
        <div
          className="w-8 h-8 rounded-lg border-2 shadow-sm"
          style={{
            backgroundColor: value,
            borderColor: theme.colors.semantic.border.primary + '40',
          }}
        />
        <div className="flex-1 text-left">
          <div 
            className="font-medium"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {value.toUpperCase()}
          </div>
          <div 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Click to change color
          </div>
        </div>
        <div 
          className="transition-transform duration-200"
          style={{ 
            color: theme.colors.semantic.text.secondary,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          ▼
        </div>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 z-50 mt-2 p-4 rounded-xl shadow-2xl border"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.secondary + '40',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <div className="space-y-4">
            {/* Preset Colors */}
            <div>
              <h4 
                className="text-sm font-medium mb-3"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Preset Colors
              </h4>
              <div className="grid grid-cols-8 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePresetColorClick(color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                      value === color ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{
                      backgroundColor: color,
                      borderColor: theme.colors.semantic.border.primary + '40',
                      ...(value === color && {
                        '--tw-ring-color': color,
                      } as React.CSSProperties),
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color */}
            <div>
              <h4 
                className="text-sm font-medium mb-3"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Custom Color
              </h4>
              <form onSubmit={handleCustomColorSubmit} className="flex items-center space-x-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-12 h-10 rounded-lg border cursor-pointer"
                  style={{
                    borderColor: theme.colors.semantic.border.secondary + '40',
                  }}
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1 px-3 py-2 rounded-lg border text-sm font-mono"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary + '50',
                    borderColor: theme.colors.semantic.border.secondary + '40',
                    color: theme.colors.semantic.text.primary,
                  }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.success})`
                  }}
                >
                  Apply
                </button>
              </form>
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t" style={{ borderColor: theme.colors.semantic.border.secondary + '30' }}>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-opacity-80"
                style={{
                  backgroundColor: theme.colors.semantic.surface.tertiary + '60',
                  color: theme.colors.semantic.text.secondary,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}