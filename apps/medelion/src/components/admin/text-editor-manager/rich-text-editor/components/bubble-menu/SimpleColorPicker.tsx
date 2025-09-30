import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface SimpleColorPickerProps {
  onColorSelect: (color: string) => void;
  onClose: () => void;
}

const colorPalette = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#c0c0c0', '#808080',
  '#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff', '#99ffff', '#ffcc99', '#cc99ff',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f',
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#95a5a6'
];

export const SimpleColorPicker: React.FC<SimpleColorPickerProps> = ({
  onColorSelect,
  onClose
}) => {
  const [customColor, setCustomColor] = useState('#000000');

  return (
    <div className="p-4 w-80">
      <div className="grid grid-cols-8 gap-2 mb-4">
        {colorPalette.map((color) => (
          <button
            key={color}
            className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors relative group"
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            title={color}
          >
            <span className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded transition-opacity" />
          </button>
        ))}
      </div>
      
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <button
            onClick={() => onColorSelect(customColor)}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Use Custom Color
          </button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};