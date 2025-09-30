import React, { memo, useCallback, useState } from 'react';
import { useTheme } from '@/theme';
import { CellStyle } from '../types/table.types';
import { 
  Type, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, Square, Grid,
  PaintBucket, Minus, Plus, RotateCcw, Eye, EyeOff,
  ChevronDown, ChevronRight, Sliders, X
} from 'lucide-react';

export interface FormattingPanelProps {
  selectedCells: string[];
  currentStyle?: Partial<CellStyle>;
  onStyleChange: (style: Partial<CellStyle>) => void;
  onClose?: () => void;
  className?: string;
}

export const FormattingPanel = memo<FormattingPanelProps>(({
  selectedCells,
  currentStyle = {},
  onStyleChange,
  onClose,
  className = ''
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'font' | 'background' | 'border' | 'spacing'>('font');
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'background' | 'border' | null>(null);

  // Common colors palette
  const colorPalette = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF3366', '#FF9933', '#FFFF33', '#33FF33', '#3399FF', '#9933FF',
    '#CC0000', '#CC6600', '#CCCC00', '#00CC00', '#0066CC', '#6600CC'
  ];

  const handleStyleUpdate = useCallback((updates: Partial<CellStyle>) => {
    onStyleChange({ ...currentStyle, ...updates });
  }, [currentStyle, onStyleChange]);

  const ColorPicker = useCallback(({ type, value, onChange }: {
    type: 'text' | 'background' | 'border';
    value?: string;
    onChange: (color: string) => void;
  }) => (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-1">
        {colorPalette.map(color => (
          <button
            key={color}
            className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
            style={{ 
              backgroundColor: color,
              borderColor: value === color ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary
            }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border cursor-pointer"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter color"
          className="flex-1 px-2 py-1 text-sm border rounded"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary,
            color: theme.colors.semantic.text.primary
          }}
        />
      </div>
    </div>
  ), [colorPalette, theme]);

  const TabButton = useCallback(({ tab, label, icon: Icon }: {
    tab: typeof activeTab;
    label: string;
    icon: React.ElementType;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg transition-colors ${
        activeTab === tab ? 'border-b-2' : ''
      }`}
      style={{
        backgroundColor: activeTab === tab 
          ? theme.colors.semantic.surface.primary 
          : theme.colors.semantic.surface.secondary,
        color: activeTab === tab 
          ? theme.colors.semantic.text.primary 
          : theme.colors.semantic.text.secondary,
        borderBottomColor: activeTab === tab ? theme.colors.semantic.action.primary : 'transparent'
      }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </button>
  ), [activeTab, theme]);

  const SectionHeader = useCallback(({ title, children }: { title: string; children?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-sm" style={{ color: theme.colors.semantic.text.primary }}>
        {title}
      </h4>
      {children}
    </div>
  ), [theme]);

  const ControlGroup = useCallback(({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-2 mb-4">
      <label className="block text-xs font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
        {label}
      </label>
      {children}
    </div>
  ), [theme]);

  return (
    <div 
      className={`formatting-panel w-80 border rounded-lg shadow-lg ${className}`}
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5" style={{ color: theme.colors.semantic.action.primary }} />
          <h3 className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
            Format Cells
          </h3>
        </div>
        {selectedCells.length > 0 && (
          <span 
            className="px-2 py-1 text-xs rounded"
            style={{ 
              backgroundColor: theme.colors.semantic.action.secondary,
              color: theme.colors.semantic.text.primary 
            }}
          >
            {selectedCells.length} cells
          </span>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            ×
          </button>
        )}
      </div>

      {/* Tabs */}
      <div 
        className="flex border-b"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <TabButton tab="font" label="Font" icon={Type} />
        <TabButton tab="background" label="Fill" icon={PaintBucket} />
        <TabButton tab="border" label="Border" icon={Square} />
        <TabButton tab="spacing" label="Spacing" icon={Sliders} />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {activeTab === 'font' && (
          <div className="space-y-4">
            {/* Text Styling */}
            <ControlGroup label="Text Style">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleStyleUpdate({ 
                    fontWeight: currentStyle.fontWeight === 'bold' ? 'normal' : 'bold' 
                  })}
                  className={`p-2 rounded transition-colors ${
                    currentStyle.fontWeight === 'bold' ? 'bg-blue-100' : ''
                  }`}
                  style={{ 
                    backgroundColor: currentStyle.fontWeight === 'bold' 
                      ? theme.colors.semantic.action.primary + '20' 
                      : 'transparent',
                    color: theme.colors.semantic.text.primary
                  }}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleStyleUpdate({ 
                    fontStyle: currentStyle.fontStyle === 'italic' ? 'normal' : 'italic' 
                  })}
                  className={`p-2 rounded transition-colors ${
                    currentStyle.fontStyle === 'italic' ? 'bg-blue-100' : ''
                  }`}
                  style={{ 
                    backgroundColor: currentStyle.fontStyle === 'italic' 
                      ? theme.colors.semantic.action.primary + '20' 
                      : 'transparent',
                    color: theme.colors.semantic.text.primary
                  }}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleStyleUpdate({ 
                    textDecoration: currentStyle.textDecoration === 'underline' ? 'none' : 'underline' 
                  })}
                  className={`p-2 rounded transition-colors ${
                    currentStyle.textDecoration === 'underline' ? 'bg-blue-100' : ''
                  }`}
                  style={{ 
                    backgroundColor: currentStyle.textDecoration === 'underline' 
                      ? theme.colors.semantic.action.primary + '20' 
                      : 'transparent',
                    color: theme.colors.semantic.text.primary
                  }}
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>
            </ControlGroup>

            {/* Text Alignment */}
            <ControlGroup label="Text Alignment">
              <div className="flex space-x-1">
                {[
                  { align: 'left', icon: AlignLeft },
                  { align: 'center', icon: AlignCenter },
                  { align: 'right', icon: AlignRight },
                  { align: 'justify', icon: AlignJustify }
                ].map(({ align, icon: Icon }) => (
                  <button
                    key={align}
                    onClick={() => handleStyleUpdate({ textAlign: align as CellStyle['textAlign'] })}
                    className={`p-2 rounded transition-colors ${
                      currentStyle.textAlign === align ? 'bg-blue-100' : ''
                    }`}
                    style={{ 
                      backgroundColor: currentStyle.textAlign === align 
                        ? theme.colors.semantic.action.primary + '20' 
                        : 'transparent',
                      color: theme.colors.semantic.text.primary
                    }}
                    title={`Align ${align}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </ControlGroup>

            {/* Font Size */}
            <ControlGroup label="Font Size">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStyleUpdate({ 
                    fontSize: Math.max(8, (currentStyle.fontSize || 14) - 1) 
                  })}
                  className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={currentStyle.fontSize || 14}
                  onChange={(e) => handleStyleUpdate({ fontSize: parseInt(e.target.value) || 14 })}
                  className="w-16 px-2 py-1 text-sm text-center border rounded"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.primary,
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.primary
                  }}
                  min="8"
                  max="72"
                />
                <button
                  onClick={() => handleStyleUpdate({ 
                    fontSize: Math.min(72, (currentStyle.fontSize || 14) + 1) 
                  })}
                  className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </ControlGroup>

            {/* Text Color */}
            <ControlGroup label="Text Color">
              <div className="space-y-2">
                <button
                  onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                  className="flex items-center space-x-2 w-full p-2 border rounded hover:bg-opacity-5 hover:bg-gray-500 transition-colors"
                  style={{
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ 
                      backgroundColor: currentStyle.color || '#000000',
                      borderColor: theme.colors.semantic.border.primary
                    }}
                  />
                  <span className="text-sm">{currentStyle.color || 'Default'}</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </button>
                {showColorPicker === 'text' && (
                  <ColorPicker
                    type="text"
                    value={currentStyle.color}
                    onChange={(color) => handleStyleUpdate({ color })}
                  />
                )}
              </div>
            </ControlGroup>
          </div>
        )}

        {activeTab === 'background' && (
          <div className="space-y-4">
            <ControlGroup label="Background Color">
              <div className="space-y-2">
                <button
                  onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                  className="flex items-center space-x-2 w-full p-2 border rounded hover:bg-opacity-5 hover:bg-gray-500 transition-colors"
                  style={{
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ 
                      backgroundColor: currentStyle.backgroundColor || 'transparent',
                      borderColor: theme.colors.semantic.border.primary
                    }}
                  />
                  <span className="text-sm">{currentStyle.backgroundColor || 'None'}</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </button>
                {showColorPicker === 'background' && (
                  <ColorPicker
                    type="background"
                    value={currentStyle.backgroundColor}
                    onChange={(color) => handleStyleUpdate({ backgroundColor: color })}
                  />
                )}
              </div>
            </ControlGroup>

            <ControlGroup label="Quick Actions">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStyleUpdate({ backgroundColor: undefined })}
                  className="flex-1 p-2 text-sm border rounded hover:bg-opacity-5 hover:bg-gray-500 transition-colors"
                  style={{
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  Clear Fill
                </button>
              </div>
            </ControlGroup>
          </div>
        )}

        {activeTab === 'border' && (
          <div className="space-y-4">
            <ControlGroup label="Border Style">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { style: 'none', label: 'None' },
                  { style: 'solid', label: 'Solid' },
                  { style: 'dashed', label: 'Dashed' },
                  { style: 'dotted', label: 'Dotted' }
                ].map(({ style, label }) => (
                  <button
                    key={style}
                    onClick={() => handleStyleUpdate({
                      borders: {
                        ...currentStyle.borders,
                        outer: {
                          width: 1,
                          style: style as any,
                          color: currentStyle.borders?.outer?.color || '#000000'
                        }
                      }
                    })}
                    className="p-2 text-sm border rounded hover:bg-opacity-5 hover:bg-gray-500 transition-colors"
                    style={{
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.primary
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Border Color">
              <div className="space-y-2">
                <button
                  onClick={() => setShowColorPicker(showColorPicker === 'border' ? null : 'border')}
                  className="flex items-center space-x-2 w-full p-2 border rounded hover:bg-opacity-5 hover:bg-gray-500 transition-colors"
                  style={{
                    borderColor: theme.colors.semantic.border.primary,
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ 
                      backgroundColor: currentStyle.borders?.outer?.color || '#000000',
                      borderColor: theme.colors.semantic.border.primary
                    }}
                  />
                  <span className="text-sm">{currentStyle.borders?.outer?.color || 'Default'}</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </button>
                {showColorPicker === 'border' && (
                  <ColorPicker
                    type="border"
                    value={currentStyle.borders?.outer?.color}
                    onChange={(color) => handleStyleUpdate({
                      borders: {
                        ...currentStyle.borders,
                        outer: {
                          width: currentStyle.borders?.outer?.width || 1,
                          style: currentStyle.borders?.outer?.style || 'solid',
                          color
                        }
                      }
                    })}
                  />
                )}
              </div>
            </ControlGroup>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <ControlGroup label="Padding">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'top', label: 'Top' },
                  { key: 'right', label: 'Right' },
                  { key: 'bottom', label: 'Bottom' },
                  { key: 'left', label: 'Left' }
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
                      {label}
                    </label>
                    <input
                      type="number"
                      value={currentStyle.padding?.[key as keyof typeof currentStyle.padding] || 8}
                      onChange={(e) => handleStyleUpdate({
                        padding: {
                          ...currentStyle.padding,
                          [key]: parseInt(e.target.value) || 0
                        } as any
                      })}
                      className="w-full px-2 py-1 text-sm border rounded"
                      style={{
                        backgroundColor: theme.colors.semantic.surface.primary,
                        borderColor: theme.colors.semantic.border.primary,
                        color: theme.colors.semantic.text.primary
                      }}
                      min="0"
                      max="50"
                    />
                  </div>
                ))}
              </div>
            </ControlGroup>
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className="flex items-center justify-between p-4 border-t"
        style={{ borderColor: theme.colors.semantic.border.secondary }}
      >
        <button
          onClick={() => handleStyleUpdate({})}
          className="flex items-center space-x-2 px-3 py-2 text-sm border rounded hover:bg-opacity-5 hover:bg-gray-500 transition-colors"
          style={{
            borderColor: theme.colors.semantic.border.primary,
            color: theme.colors.semantic.text.secondary
          }}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
        
        <div className="text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
          Changes apply to selected cells
        </div>
      </div>
    </div>
  );
});

FormattingPanel.displayName = 'FormattingPanel';