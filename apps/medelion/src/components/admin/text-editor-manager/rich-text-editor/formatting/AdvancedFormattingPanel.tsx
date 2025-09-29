'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/theme';
import {
  Type, Palette, Sliders, Eye, RotateCcw, Save, Download,
  ChevronDown, ChevronUp, Info, Zap, Layers, Grid, Target
} from 'lucide-react';
import { AdvancedTypographyEngine, TypographyStyle, TextEffect } from '../utils/AdvancedTypographyEngine';
import { FONT_FAMILIES, FONT_SIZES } from '../utils/constants';

interface AdvancedFormattingPanelProps {
  selectedElement?: HTMLElement;
  onStyleChange: (styles: TypographyStyle) => void;
  onEffectApply: (effect: TextEffect) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface FormattingSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
}

export const AdvancedFormattingPanel: React.FC<AdvancedFormattingPanelProps> = ({
  selectedElement,
  onStyleChange,
  onEffectApply,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { theme } = useTheme();
  
  // State for typography controls
  const [currentStyles, setCurrentStyles] = useState<TypographyStyle>({});
  const [readabilityScore, setReadabilityScore] = useState<number>(0);
  const [readabilityIssues, setReadabilityIssues] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog.');
  const [selectedEffect, setSelectedEffect] = useState<string>('');
  
  // Section state management
  const [sections, setSections] = useState<FormattingSection[]>([
    { id: 'font', title: 'Font Properties', icon: Type, isOpen: true },
    { id: 'spacing', title: 'Spacing & Layout', icon: Sliders, isOpen: false },
    { id: 'effects', title: 'Text Effects', icon: Zap, isOpen: false },
    { id: 'advanced', title: 'Advanced Typography', icon: Target, isOpen: false },
    { id: 'analysis', title: 'Readability Analysis', icon: Eye, isOpen: false }
  ]);

  // Available fonts state
  const [availableFonts, setAvailableFonts] = useState<string[]>(FONT_FAMILIES.map(f => f.name));
  const [customFonts, setCustomFonts] = useState<string[]>([]);

  // Load system fonts on mount
  useEffect(() => {
    AdvancedTypographyEngine.loadSystemFonts().then(setAvailableFonts);
  }, []);

  // Analyze readability when element changes
  useEffect(() => {
    if (selectedElement) {
      const analysis = AdvancedTypographyEngine.analyzeTextReadability(selectedElement);
      setReadabilityScore(analysis.score);
      setReadabilityIssues(analysis.issues);
      
      // Extract current styles from element
      const computedStyles = window.getComputedStyle(selectedElement);
      setCurrentStyles({
        fontFamily: computedStyles.fontFamily,
        fontSize: parseFloat(computedStyles.fontSize),
        fontWeight: computedStyles.fontWeight,
        fontStyle: computedStyles.fontStyle as any,
        letterSpacing: computedStyles.letterSpacing,
        lineHeight: computedStyles.lineHeight,
        color: computedStyles.color,
        textAlign: computedStyles.textAlign as any
      });
    }
  }, [selectedElement]);

  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isOpen: !section.isOpen }
        : section
    ));
  }, []);

  const handleStyleChange = useCallback((property: keyof TypographyStyle, value: any) => {
    const newStyles = { ...currentStyles, [property]: value };
    setCurrentStyles(newStyles);
    onStyleChange(newStyles);
    
    // Apply to selected element immediately for preview
    if (selectedElement) {
      AdvancedTypographyEngine.applyTypography(selectedElement, { [property]: value });
    }
  }, [currentStyles, onStyleChange, selectedElement]);

  const applyTextEffect = useCallback((effectId: string) => {
    const effect = AdvancedTypographyEngine.TEXT_EFFECTS.find(e => e.id === effectId);
    if (effect && selectedElement) {
      setSelectedEffect(effectId);
      Object.assign(selectedElement.style, effect.styles);
      onEffectApply(effect);
    }
  }, [selectedElement, onEffectApply]);

  const resetFormatting = useCallback(() => {
    const defaultStyles: TypographyStyle = {
      fontFamily: 'inherit',
      fontSize: 16,
      fontWeight: 400,
      fontStyle: 'normal',
      letterSpacing: 'normal',
      lineHeight: 1.5,
      color: theme.colors.semantic.text.primary,
      textAlign: 'left'
    };
    setCurrentStyles(defaultStyles);
    onStyleChange(defaultStyles);
    setSelectedEffect('');
    
    if (selectedElement) {
      AdvancedTypographyEngine.applyTypography(selectedElement, defaultStyles);
    }
  }, [theme.colors.semantic.text.primary, onStyleChange, selectedElement]);

  const loadGoogleFont = useCallback(async (fontName: string) => {
    try {
      await AdvancedTypographyEngine.loadGoogleFont(fontName);
      if (!customFonts.includes(fontName)) {
        setCustomFonts(prev => [...prev, fontName]);
      }
    } catch (error) {
      console.error('Failed to load Google Font:', error);
    }
  }, [customFonts]);

  if (isCollapsed) {
    return (
      <div 
        className={`border rounded-lg p-2 ${className}`}
        style={{ 
          backgroundColor: theme.colors.semantic.surface.primary,
          borderColor: theme.colors.semantic.border.primary
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-full p-2 rounded transition-colors"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          <Type className="w-5 h-5" />
          <ChevronUp className="w-4 h-4 ml-2" />
        </button>
      </div>
    );
  }

  const renderFontSection = () => (
    <div className="space-y-4">
      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
          Font Family
        </label>
        <div className="flex space-x-2">
          <select
            value={currentStyles.fontFamily || ''}
            onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md text-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="">Select font...</option>
            {availableFonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
            {customFonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font} (Google Font)
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const fontName = prompt('Enter Google Font name:');
              if (fontName) loadGoogleFont(fontName);
            }}
            className="px-3 py-2 border rounded-md text-sm"
            style={{
              backgroundColor: theme.colors.semantic.action.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          >
            Add Font
          </button>
        </div>
      </div>

      {/* Font Size and Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
            Size
          </label>
          <div className="flex space-x-2">
            <select
              value={currentStyles.fontSize || ''}
              onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <input
              type="range"
              min="8"
              max="72"
              value={currentStyles.fontSize || 16}
              onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
            Weight
          </label>
          <select
            value={currentStyles.fontWeight || '400'}
            onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="100">Thin (100)</option>
            <option value="200">Extra Light (200)</option>
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>
      </div>

      {/* Font Style and Variant */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
            Style
          </label>
          <select
            value={currentStyles.fontStyle || 'normal'}
            onChange={(e) => handleStyleChange('fontStyle', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
            <option value="oblique">Oblique</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
            Variant
          </label>
          <select
            value={currentStyles.fontVariant || 'normal'}
            onChange={(e) => handleStyleChange('fontVariant', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <option value="normal">Normal</option>
            <option value="small-caps">Small Caps</option>
            <option value="all-small-caps">All Small Caps</option>
            <option value="petite-caps">Petite Caps</option>
            <option value="unicase">Unicase</option>
            <option value="titling-caps">Titling Caps</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSpacingSection = () => (
    <div className="space-y-4">
      {/* Letter Spacing */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
          Letter Spacing
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="-2"
            max="5"
            step="0.1"
            value={parseFloat(String(currentStyles.letterSpacing || '0'))}
            onChange={(e) => handleStyleChange('letterSpacing', `${e.target.value}px`)}
            className="flex-1"
          />
          <span className="text-sm font-mono w-16" style={{ color: theme.colors.semantic.text.secondary }}>
            {currentStyles.letterSpacing || '0px'}
          </span>
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
          Line Height
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={parseFloat(String(currentStyles.lineHeight || '1.5'))}
            onChange={(e) => handleStyleChange('lineHeight', parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-mono w-16" style={{ color: theme.colors.semantic.text.secondary }}>
            {Number(currentStyles.lineHeight || 1.5).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Word Spacing */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
          Word Spacing
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="-5"
            max="10"
            step="0.5"
            value={parseFloat(String(currentStyles.wordSpacing || '0'))}
            onChange={(e) => handleStyleChange('wordSpacing', `${e.target.value}px`)}
            className="flex-1"
          />
          <span className="text-sm font-mono w-16" style={{ color: theme.colors.semantic.text.secondary }}>
            {currentStyles.wordSpacing || '0px'}
          </span>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
          Text Alignment
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['left', 'center', 'right', 'justify'] as const).map(align => (
            <button
              key={align}
              onClick={() => handleStyleChange('textAlign', align)}
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                currentStyles.textAlign === align ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: currentStyles.textAlign === align 
                  ? theme.colors.semantic.action.primary 
                  : theme.colors.semantic.surface.secondary,
                color: currentStyles.textAlign === align 
                  ? theme.colors.semantic.text.inverse 
                  : theme.colors.semantic.text.primary,
                borderColor: theme.colors.semantic.border.primary
              }}
            >
              {align}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEffectsSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {AdvancedTypographyEngine.TEXT_EFFECTS.map(effect => (
          <button
            key={effect.id}
            onClick={() => applyTextEffect(effect.id)}
            className={`p-3 text-left rounded border transition-all ${
              selectedEffect === effect.id ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: selectedEffect === effect.id 
                ? theme.colors.semantic.action.primary + '10'
                : theme.colors.semantic.surface.secondary,
              borderColor: selectedEffect === effect.id 
                ? theme.colors.semantic.action.primary
                : theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.primary
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{effect.name}</span>
              <span 
                className="px-2 py-1 text-xs rounded"
                style={{ 
                  backgroundColor: theme.colors.semantic.action.secondary,
                  color: theme.colors.semantic.text.primary
                }}
              >
                {effect.category}
              </span>
            </div>
            <p className="text-sm opacity-75 mb-2">{effect.description}</p>
            <div 
              className="text-sm font-mono p-2 rounded"
              style={{ 
                backgroundColor: theme.colors.semantic.surface.primary,
                ...(effect.styles as React.CSSProperties)
              }}
            >
              Sample Text
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderAnalysisSection = () => (
    <div className="space-y-4">
      {/* Readability Score */}
      <div className="p-4 rounded-lg border" style={{ borderColor: theme.colors.semantic.border.primary }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>
            Readability Score
          </span>
          <div className="flex items-center space-x-2">
            <div 
              className="w-16 h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            >
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${readabilityScore}%`,
                  backgroundColor: readabilityScore > 80 ? '#10b981' : 
                                 readabilityScore > 60 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <span className="text-sm font-medium" style={{ color: theme.colors.semantic.text.primary }}>
              {readabilityScore}/100
            </span>
          </div>
        </div>
        
        {readabilityIssues.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
              Issues Found:
            </span>
            {readabilityIssues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.semantic.status.warning }} />
                <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                  {issue}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Text */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
          Preview Text
        </label>
        <textarea
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm resize-none"
          rows={3}
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.primary,
            color: theme.colors.semantic.text.primary
          }}
        />
        <div 
          className="mt-2 p-3 border rounded-md"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary,
            ...(currentStyles as React.CSSProperties)
          }}
        >
          {previewText}
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`border rounded-lg overflow-hidden ${className}`}
      style={{ 
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary,
        maxHeight: '80vh'
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
            Advanced Formatting
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetFormatting}
            className="p-2 rounded transition-colors"
            style={{ color: theme.colors.semantic.text.secondary }}
            title="Reset formatting"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded transition-colors"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-96">
        {sections.map(section => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:opacity-80 transition-colors"
              style={{ 
                backgroundColor: section.isOpen ? theme.colors.semantic.surface.secondary : 'transparent',
                color: theme.colors.semantic.text.primary
              }}
            >
              <div className="flex items-center space-x-2">
                <section.icon className="w-4 h-4" />
                <span className="font-medium">{section.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${section.isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {section.isOpen && (
              <div className="px-4 pb-4">
                {section.id === 'font' && renderFontSection()}
                {section.id === 'spacing' && renderSpacingSection()}
                {section.id === 'effects' && renderEffectsSection()}
                {section.id === 'analysis' && renderAnalysisSection()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};