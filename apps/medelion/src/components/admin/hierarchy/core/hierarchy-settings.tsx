'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/theme';
import { MCQViewIcons } from './mcq-view-icons';
import ColorPicker from '@/components/ui/color-picker';

interface HierarchySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    mcqEditView: 'inline' | 'modal' | 'page';
    showDeleteButton: boolean;
    levelColors: {
      1: string; // Year - Violet
      2: string; // Subject - Indigo  
      3: string; // Part - Dark Green
      4: string; // Section - Medium Green
      5: string; // Chapter - Medium Green
    };
  };
  onSettingsChange: (settings: {
    mcqEditView: 'inline' | 'modal' | 'page';
    showDeleteButton: boolean;
    levelColors: {
      1: string;
      2: string; 
      3: string;
      4: string;
      5: string;
    };
  }) => void;
}

export default function HierarchySettings({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}: HierarchySettingsProps) {
  const { theme } = useTheme();
  const [tempSettings, setTempSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Update temp settings when props change
  useEffect(() => {
    setTempSettings(settings);
    setHasChanges(false);
  }, [settings, isOpen]);

  // Check for changes
  useEffect(() => {
    const changed = tempSettings.mcqEditView !== settings.mcqEditView || 
                   tempSettings.showDeleteButton !== settings.showDeleteButton ||
                   JSON.stringify(tempSettings.levelColors) !== JSON.stringify(settings.levelColors);
    setHasChanges(changed);
  }, [tempSettings, settings]);

  if (!isOpen) return null;

  const handleMcqEditViewChange = (view: 'inline' | 'modal' | 'page') => {
    setTempSettings(prev => ({
      ...prev,
      mcqEditView: view
    }));
  };

  const handleShowDeleteButtonToggle = () => {
    setTempSettings(prev => ({
      ...prev,
      showDeleteButton: !prev.showDeleteButton
    }));
  };

  const handleLevelColorChange = (level: number, color: string) => {
    setTempSettings(prev => ({
      ...prev,
      levelColors: {
        ...prev.levelColors,
        [level]: color
      }
    }));
  };

  const handleSave = () => {
    onSettingsChange(tempSettings);
    onClose();
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setHasChanges(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (hasChanges) {
        // Could add a confirmation dialog here if needed
        handleCancel();
      } else {
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div 
        className="relative rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.primary,
          border: `1px solid ${theme.colors.semantic.border.secondary}20`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`
        }}
      >
        {/* Animated Header with Gradient */}
        <div 
          className="relative px-8 py-6 border-b overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${theme.colors.semantic.status.info}15, ${theme.colors.semantic.status.success}15)`,
            borderColor: theme.colors.semantic.border.secondary + '30'
          }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute top-0 right-0 w-32 h-32 border-2 rounded-full transform translate-x-16 -translate-y-16"
              style={{ borderColor: theme.colors.semantic.status.info }}
            />
            <div 
              className="absolute bottom-0 left-0 w-24 h-24 border-2 rounded-full transform -translate-x-12 translate-y-12"
              style={{ borderColor: theme.colors.semantic.status.success }}
            />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.success})`
                }}
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: theme.colors.semantic.text.inverse }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
              <div>
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Hierarchy Settings
                </h2>
                <p 
                  className="text-sm mt-1"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Customize your question bank management experience
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCancel}
              className="p-3 rounded-xl hover:bg-opacity-80 transition-all duration-200 group"
              style={{ 
                backgroundColor: theme.colors.semantic.surface.tertiary + '60'
              }}
            >
              <svg 
                className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Changes indicator */}
          {hasChanges && (
            <div 
              className="absolute top-2 right-16 px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: theme.colors.semantic.status.warning + '20',
                color: theme.colors.semantic.status.warning
              }}
            >
              Unsaved changes
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-10 max-h-[60vh] overflow-y-auto">
          
          {/* MCQ Edit View Settings */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mt-1 shadow-sm"
                style={{ backgroundColor: theme.colors.semantic.status.info + '15' }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: theme.colors.semantic.status.info }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  MCQ Edit View Mode
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Choose how you prefer to edit multiple choice questions in your hierarchy
                </p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {[
                { 
                  value: 'inline', 
                  label: 'Inline View', 
                  description: 'Edit questions directly within the hierarchy list for quick changes',
                  icon: <MCQViewIcons.Inline size={20} />,
                  color: theme.colors.semantic.status.success
                },
                { 
                  value: 'modal', 
                  label: 'Modal View', 
                  description: 'Open questions in a focused popup modal with more editing space',
                  icon: <MCQViewIcons.Modal size={20} />,
                  color: theme.colors.semantic.status.info
                },
                { 
                  value: 'page', 
                  label: 'Page View', 
                  description: 'Navigate to a dedicated page with full editing capabilities',
                  icon: <MCQViewIcons.Page size={20} />,
                  color: theme.colors.semantic.status.warning
                }
              ].map((option) => (
                <label 
                  key={option.value} 
                  className="flex items-center space-x-4 cursor-pointer group p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
                  style={{ 
                    borderColor: tempSettings.mcqEditView === option.value 
                      ? option.color + '40'
                      : theme.colors.semantic.border.secondary + '30',
                    backgroundColor: tempSettings.mcqEditView === option.value 
                      ? option.color + '08'
                      : theme.colors.semantic.surface.secondary + '50'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="mcqEditView"
                      value={option.value}
                      checked={tempSettings.mcqEditView === option.value}
                      onChange={() => handleMcqEditViewChange(option.value as 'inline' | 'modal' | 'page')}
                      className="w-5 h-5"
                      style={{ 
                        accentColor: option.color
                      }}
                    />
                    <div 
                      className="p-2 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: option.color + '15' }}
                    >
                      <div style={{ color: option.color }}>
                        {option.icon}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div 
                      className="font-semibold text-lg group-hover:opacity-90 transition-opacity"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {option.label}
                    </div>
                    <div 
                      className="text-sm mt-1 leading-relaxed"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {option.description}
                    </div>
                  </div>
                  {tempSettings.mcqEditView === option.value && (
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* MCQ View Demo Section */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mt-1 shadow-sm"
                style={{ backgroundColor: theme.colors.semantic.status.success + '15' }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: theme.colors.semantic.status.success }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Live Preview
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  See how your selected MCQ edit view will appear in the question bank interface
                </p>
              </div>
            </div>

            {/* MCQ View Mode Preview */}
            <div 
              className="rounded-lg border-2 p-6"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary + '30',
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              <div className="text-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ 
                    backgroundColor: tempSettings.mcqEditView === 'page' 
                      ? theme.colors.semantic.status.warning + '20'
                      : tempSettings.mcqEditView === 'modal'
                      ? theme.colors.semantic.status.info + '20'
                      : theme.colors.semantic.status.success + '20'
                  }}
                >
                  {tempSettings.mcqEditView === 'page' && (
                    <MCQViewIcons.Page size={32} color={theme.colors.semantic.status.warning} />
                  )}
                  {tempSettings.mcqEditView === 'modal' && (
                    <MCQViewIcons.Modal size={32} color={theme.colors.semantic.status.info} />
                  )}
                  {tempSettings.mcqEditView === 'inline' && (
                    <MCQViewIcons.Inline size={32} color={theme.colors.semantic.status.success} />
                  )}
                </div>
                
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  {tempSettings.mcqEditView === 'page' && 'Page View Mode'}
                  {tempSettings.mcqEditView === 'modal' && 'Modal View Mode'}
                  {tempSettings.mcqEditView === 'inline' && 'Inline View Mode'}
                </h4>
                
                <p 
                  className="text-sm"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  {tempSettings.mcqEditView === 'page' && 'MCQ editing will open in a dedicated full page'}
                  {tempSettings.mcqEditView === 'modal' && 'MCQ editing will open in a popup overlay'}
                  {tempSettings.mcqEditView === 'inline' && 'MCQ editing will expand directly in the hierarchy'}
                </p>
              </div>

              {/* View Mode Selection Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'inline', label: 'Inline', icon: <MCQViewIcons.Inline size={16} />, color: theme.colors.semantic.status.success },
                  { key: 'modal', label: 'Modal', icon: <MCQViewIcons.Modal size={16} />, color: theme.colors.semantic.status.info },
                  { key: 'page', label: 'Page', icon: <MCQViewIcons.Page size={16} />, color: theme.colors.semantic.status.warning }
                ].map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => handleMcqEditViewChange(mode.key as any)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center space-y-1 ${
                      tempSettings.mcqEditView === mode.key ? 'shadow-md' : 'hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: tempSettings.mcqEditView === mode.key
                        ? mode.color + '20'
                        : theme.colors.semantic.surface.primary,
                      borderColor: tempSettings.mcqEditView === mode.key
                        ? mode.color + '40'
                        : theme.colors.semantic.border.secondary + '30',
                      border: '1px solid',
                      color: tempSettings.mcqEditView === mode.key
                        ? mode.color
                        : theme.colors.semantic.text.primary
                    }}
                  >
                    <div style={{ color: tempSettings.mcqEditView === mode.key ? mode.color : theme.colors.semantic.text.secondary }}>
                      {mode.icon}
                    </div>
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div 
            className="h-px"
            style={{ backgroundColor: theme.colors.semantic.border.secondary + '40' }}
          />

          {/* Hierarchy Level Colors */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mt-1 shadow-sm"
                style={{ backgroundColor: theme.colors.semantic.status.warning + '15' }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: theme.colors.semantic.status.warning }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Hierarchy Level Colors
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Customize the colors used for each level in your hierarchy structure
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { level: 1, name: 'Year', description: 'Top-level academic year organization', icon: '📅' },
                { level: 2, name: 'Subject', description: 'Individual subjects within each year', icon: '📚' },
                { level: 3, name: 'Part', description: 'Major parts or modules within subjects', icon: '📖' },
                { level: 4, name: 'Section', description: 'Sections within each part', icon: '📝' },
                { level: 5, name: 'Chapter', description: 'Individual chapters or topics', icon: '📄' }
              ].map((levelInfo) => (
                <div 
                  key={levelInfo.level}
                  className="p-4 rounded-xl border-2 transition-all duration-200"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.secondary + '50',
                    borderColor: theme.colors.semantic.border.secondary + '30',
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                      style={{ 
                        backgroundColor: tempSettings.levelColors[levelInfo.level as keyof typeof tempSettings.levelColors] + '15',
                        border: `2px solid ${tempSettings.levelColors[levelInfo.level as keyof typeof tempSettings.levelColors]}30`
                      }}
                    >
                      {levelInfo.icon}
                    </div>
                    <div className="flex-1">
                      <div className="mb-3">
                        <h4 
                          className="text-lg font-semibold"
                          style={{ color: theme.colors.semantic.text.primary }}
                        >
                          Level {levelInfo.level}: {levelInfo.name}
                        </h4>
                        <p 
                          className="text-sm mt-1"
                          style={{ color: theme.colors.semantic.text.secondary }}
                        >
                          {levelInfo.description}
                        </p>
                      </div>
                      <div className="w-full max-w-xs">
                        <ColorPicker
                          value={tempSettings.levelColors[levelInfo.level as keyof typeof tempSettings.levelColors]}
                          onChange={(color) => handleLevelColorChange(levelInfo.level, color)}
                          label={`${levelInfo.name} Color`}
                          presetColors={[
                            '#8B5CF6', // Violet (Year)
                            '#6366F1', // Indigo (Subject)
                            '#3B82F6', // Blue (Part)
                            '#047857', // Dark Green (Section)
                            '#10B981', // Light Green (Chapter)
                            '#7C3AED', // Deep Violet  
                            '#4F46E5', // Deep Indigo
                            '#2563EB', // Deep Blue
                            '#059669', // Medium Green
                            '#065F46', // Very Dark Green
                            '#EF4444', // Red
                            '#F97316', // Orange
                            '#EAB308', // Yellow
                            '#84CC16', // Lime
                            '#06B6D4', // Cyan
                            '#EC4899', // Pink
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Color Preview */}
            <div 
              className="rounded-xl p-6 border-2"
              style={{ 
                backgroundColor: theme.colors.semantic.surface.secondary + '30',
                borderColor: theme.colors.semantic.border.secondary + '30'
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.semantic.status.info + '15' }}
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: theme.colors.semantic.status.info }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h4 
                  className="font-semibold text-lg"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Color Hierarchy Preview
                </h4>
              </div>
              <div className="space-y-2">
                {[
                  { level: 1, name: 'Year 2024', indent: 0 },
                  { level: 2, name: 'Mathematics', indent: 1 },
                  { level: 3, name: 'Algebra Part', indent: 2 },
                  { level: 4, name: 'Linear Equations', indent: 3 },
                  { level: 5, name: 'Chapter 1: Introduction', indent: 4 }
                ].map((item) => (
                  <div 
                    key={`${item.level}-${item.name}`}
                    className="flex items-center space-x-3 p-2 rounded-lg"
                    style={{ 
                      marginLeft: `${item.indent * 16}px`,
                      backgroundColor: tempSettings.levelColors[item.level as keyof typeof tempSettings.levelColors] + '10'
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded"
                      style={{ 
                        backgroundColor: tempSettings.levelColors[item.level as keyof typeof tempSettings.levelColors]
                      }}
                    />
                    <span 
                      className="text-sm font-medium"
                      style={{ 
                        color: tempSettings.levelColors[item.level as keyof typeof tempSettings.levelColors]
                      }}
                    >
                      {item.name}
                    </span>
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: tempSettings.levelColors[item.level as keyof typeof tempSettings.levelColors] + '20',
                        color: tempSettings.levelColors[item.level as keyof typeof tempSettings.levelColors]
                      }}
                    >
                      Level {item.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div 
            className="h-px"
            style={{ backgroundColor: theme.colors.semantic.border.secondary + '40' }}
          />

          {/* Delete Button Visibility */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mt-1 shadow-sm"
                style={{ backgroundColor: theme.colors.semantic.status.error + '15' }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: theme.colors.semantic.status.error }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Interface Controls
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  Configure which action buttons are visible in your hierarchy interface
                </p>
              </div>
            </div>

            <div 
              className="p-6 rounded-xl border-2 transition-all duration-200"
              style={{ 
                borderColor: tempSettings.showDeleteButton 
                  ? theme.colors.semantic.status.success + '40'
                  : theme.colors.semantic.border.secondary + '30',
                backgroundColor: tempSettings.showDeleteButton 
                  ? theme.colors.semantic.status.success + '08'
                  : theme.colors.semantic.surface.secondary + '50'
              }}
            >
              <label className="flex items-center space-x-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={tempSettings.showDeleteButton}
                    onChange={handleShowDeleteButtonToggle}
                    className="sr-only"
                  />
                  {/* Custom Toggle Switch */}
                  <div 
                    className="w-14 h-8 rounded-full transition-colors duration-200 relative"
                    style={{ 
                      backgroundColor: tempSettings.showDeleteButton 
                        ? theme.colors.semantic.status.success 
                        : theme.colors.semantic.surface.tertiary 
                    }}
                  >
                    <div 
                      className="absolute w-6 h-6 rounded-full top-1 transition-transform duration-200 shadow-lg"
                      style={{ 
                        backgroundColor: theme.colors.semantic.text.inverse,
                        transform: tempSettings.showDeleteButton ? 'translateX(24px)' : 'translateX(4px)'
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="text-2xl p-2 rounded-lg"
                    style={{ 
                      backgroundColor: tempSettings.showDeleteButton 
                        ? theme.colors.semantic.status.error + '15'
                        : theme.colors.semantic.surface.tertiary 
                    }}
                  >
                    🗑️
                  </div>
                  <div>
                    <div 
                      className="font-semibold text-lg group-hover:opacity-90 transition-opacity"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      Show Delete Buttons
                    </div>
                    <div 
                      className="text-sm mt-1 leading-relaxed"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      Display delete buttons on hierarchy items for quick removal actions
                    </div>
                  </div>
                </div>

                <div 
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    tempSettings.showDeleteButton ? 'shadow-sm' : 'opacity-60'
                  }`}
                  style={{ 
                    backgroundColor: tempSettings.showDeleteButton 
                      ? theme.colors.semantic.status.success + '20'
                      : theme.colors.semantic.surface.tertiary,
                    color: tempSettings.showDeleteButton 
                      ? theme.colors.semantic.status.success 
                      : theme.colors.semantic.text.secondary
                  }}
                >
                  {tempSettings.showDeleteButton ? 'Enabled' : 'Disabled'}
                </div>
              </label>
            </div>
          </div>

          {/* Preview Section */}
          <div 
            className="rounded-xl p-6 border-2"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.secondary + '30',
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.colors.semantic.status.info + '15' }}
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: theme.colors.semantic.status.info }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h4 
                className="font-semibold text-lg"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Settings Preview
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div 
                className="flex justify-between items-center py-2 px-3 rounded-lg"
                style={{ backgroundColor: theme.colors.semantic.surface.primary + '50' }}
              >
                <span style={{ color: theme.colors.semantic.text.secondary }}>MCQ Edit Mode:</span>
                <span 
                  className="font-semibold capitalize px-2 py-1 rounded text-xs"
                  style={{ 
                    color: theme.colors.semantic.text.primary,
                    backgroundColor: theme.colors.semantic.status.info + '20'
                  }}
                >
                  {tempSettings.mcqEditView} View
                </span>
              </div>
              <div 
                className="flex justify-between items-center py-2 px-3 rounded-lg"
                style={{ backgroundColor: theme.colors.semantic.surface.primary + '50' }}
              >
                <span style={{ color: theme.colors.semantic.text.secondary }}>Delete Buttons:</span>
                <span 
                  className={`font-semibold px-2 py-1 rounded text-xs ${tempSettings.showDeleteButton ? '' : 'opacity-60'}`}
                  style={{ 
                    color: tempSettings.showDeleteButton 
                      ? theme.colors.semantic.status.success 
                      : theme.colors.semantic.text.secondary,
                    backgroundColor: tempSettings.showDeleteButton 
                      ? theme.colors.semantic.status.success + '20'
                      : theme.colors.semantic.surface.tertiary
                  }}
                >
                  {tempSettings.showDeleteButton ? '✓ Visible' : '✗ Hidden'}
                </span>
              </div>
              <div 
                className="flex justify-between items-center py-2 px-3 rounded-lg md:col-span-2"
                style={{ backgroundColor: theme.colors.semantic.surface.primary + '50' }}
              >
                <span style={{ color: theme.colors.semantic.text.secondary }}>Level Colors:</span>
                <div className="flex items-center space-x-1">
                  {Object.entries(tempSettings.levelColors).map(([level, color]) => (
                    <div
                      key={level}
                      className="w-4 h-4 rounded border"
                      style={{ 
                        backgroundColor: color,
                        borderColor: theme.colors.semantic.border.primary + '40'
                      }}
                      title={`Level ${level}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-8 py-6 border-t backdrop-blur-sm"
          style={{ 
            borderColor: theme.colors.semantic.border.secondary + '30',
            background: `linear-gradient(135deg, ${theme.colors.semantic.surface.secondary}80, ${theme.colors.semantic.surface.tertiary}60)`
          }}
        >
          <div className="flex items-center justify-between">
            {/* Status indicator */}
            <div className="flex items-center space-x-3">
              {hasChanges ? (
                <>
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: theme.colors.semantic.status.warning }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: theme.colors.semantic.status.warning }}
                  >
                    You have unsaved changes
                  </span>
                </>
              ) : (
                <>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.colors.semantic.status.success }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    All changes saved
                  </span>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 border"
                style={{ 
                  backgroundColor: theme.colors.semantic.surface.primary,
                  color: theme.colors.semantic.text.secondary,
                  borderColor: theme.colors.semantic.border.secondary + '60'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg ${
                  hasChanges ? 'hover:shadow-xl' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ 
                  background: hasChanges 
                    ? `linear-gradient(135deg, ${theme.colors.semantic.status.info}, ${theme.colors.semantic.status.success})`
                    : theme.colors.semantic.surface.tertiary
                }}
              >
                {hasChanges ? (
                  <div className="flex items-center space-x-2">
                    <span>💾 Save Changes</span>
                  </div>
                ) : (
                  <span>✓ Saved</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}