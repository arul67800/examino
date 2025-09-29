'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { useTheme } from '../../../../../../theme/context';

interface ColorPickerProps {
  editor: Editor;
  type: 'color' | 'highlight';
  onClose: () => void;
}

const DEFAULT_COLORS = [
  '#000000', '#ffffff', '#888888', '#cccccc',
  '#ff0000', '#ff6b6b', '#ff9f43', '#feca57',
  '#48dbfb', '#0abde3', '#6c5ce7', '#a29bfe',
  '#2ed573', '#5f27cd', '#ff3838', '#ff9ff3',
  '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ editor, type, onClose }) => {
  const { theme } = useTheme();
  const [customColor, setCustomColor] = useState('#000000');

  const applyColor = (color: string) => {
    if (type === 'color') {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().setHighlight({ color }).run();
    }
    onClose();
  };

  const removeColor = () => {
    if (type === 'color') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      
      {/* Color Picker Panel */}
      <div 
        className="absolute top-full left-0 mt-1 p-3 rounded-md shadow-lg border z-20 w-64"
        style={{
          backgroundColor: theme.colors.semantic.surface.elevated,
          borderColor: theme.colors.semantic.border.secondary,
        }}
      >
        <div className="mb-3">
          <h4 
            className="text-sm font-medium mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {type === 'color' ? 'Text Color' : 'Highlight Color'}
          </h4>
          
          {/* Predefined Colors */}
          <div className="grid grid-cols-8 gap-1 mb-3">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => applyColor(color)}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Custom Color Input */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
              style={{ borderColor: theme.colors.semantic.border.secondary }}
            />
            <button
              onClick={() => applyColor(customColor)}
              className="px-3 py-1 text-sm rounded transition-colors"
              style={{
                backgroundColor: theme.colors.semantic.action.primary,
                color: theme.colors.semantic.text.inverse,
              }}
            >
              Apply
            </button>
          </div>

          {/* Remove Color */}
          <button
            onClick={removeColor}
            className="w-full px-3 py-1 text-sm rounded transition-colors border"
            style={{
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.secondary,
            }}
          >
            {type === 'color' ? 'Remove Color' : 'Remove Highlight'}
          </button>
        </div>
      </div>
    </>
  );
};