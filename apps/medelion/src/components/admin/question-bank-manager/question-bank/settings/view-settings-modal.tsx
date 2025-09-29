/**
 * View Settings Modal Component
 * Comprehensive settings for customizing question bank display and behavior
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ViewSettings, ViewMode } from '../types';
import { useViewSettings } from '../hooks';

export interface ViewSettingsModalProps {
  settings: ViewSettings;
  onSave: (settings: ViewSettings) => void;
  onClose: () => void;
  className?: string;
}

export const ViewSettingsModal: React.FC<ViewSettingsModalProps> = ({
  settings: initialSettings,
  onSave,
  onClose,
  className = ''
}) => {
  const [settings, setSettings] = useState<ViewSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = useCallback(<K extends keyof ViewSettings>(
    key: K,
    value: ViewSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(initialSettings));
      return newSettings;
    });
  }, [initialSettings]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(false);
  };

  const handleDefaults = () => {
    const defaultSettings: ViewSettings = {
      mode: ViewMode.GRID,
      showPreviews: true,
      showHierarchy: true,
      showStatistics: false,
      compactMode: false,
      cardSize: 'medium',
      columnsToShow: ['question', 'type', 'difficulty', 'created'],
    };
    setSettings(defaultSettings);
    setHasChanges(JSON.stringify(defaultSettings) !== JSON.stringify(initialSettings));
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">⚙️</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">View Settings</h2>
                  <p className="text-sm text-gray-600">Customize how questions are displayed</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* View Mode */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Display Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { 
                    mode: ViewMode.GRID, 
                    label: 'Grid View', 
                    icon: '▦',
                    description: 'Card-based grid layout'
                  },
                  { 
                    mode: ViewMode.LIST, 
                    label: 'List View', 
                    icon: '☰',
                    description: 'Compact list format'
                  },
                  { 
                    mode: ViewMode.TABLE, 
                    label: 'Table View', 
                    icon: '⊞',
                    description: 'Detailed table format'
                  },
                ].map((option) => (
                  <button
                    key={option.mode}
                    onClick={() => updateSetting('mode', option.mode)}
                    className={`p-4 text-left border-2 rounded-lg transition-colors ${
                      settings.mode === option.mode
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center mb-2 text-2xl">{option.icon}</div>
                    <div className="font-medium text-gray-900 text-center">{option.label}</div>
                    <div className="text-xs text-gray-600 text-center mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Display Options</label>
              <div className="space-y-3">
                {[
                  {
                    key: 'showPreviews',
                    label: 'Show Question Previews',
                    description: 'Display question text preview in cards',
                    icon: '👁️'
                  },
                  {
                    key: 'showHierarchy',
                    label: 'Show Hierarchy Path',
                    description: 'Display hierarchy location information',
                    icon: '🗂️'
                  },
                  {
                    key: 'showStatistics',
                    label: 'Show Statistics Panel',
                    description: 'Display analytics and statistics sidebar',
                    icon: '📊'
                  },
                  {
                    key: 'compactMode',
                    label: 'Compact Mode',
                    description: 'Reduce spacing and show more content',
                    icon: '📏'
                  },
                ].map((option) => (
                  <label key={option.key} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 text-xl">{option.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <input
                          type="checkbox"
                          checked={settings[option.key as keyof ViewSettings] as boolean}
                          onChange={(e) => updateSetting(option.key as keyof ViewSettings, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Card Size (only for grid mode) */}
            {settings.mode === ViewMode.GRID && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Card Size</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'small', label: 'Small', width: 'w-16' },
                    { value: 'medium', label: 'Medium', width: 'w-20' },
                    { value: 'large', label: 'Large', width: 'w-24' },
                  ].map((size) => (
                    <button
                      key={size.value}
                      onClick={() => updateSetting('cardSize', size.value as any)}
                      className={`p-3 border-2 rounded-lg transition-colors ${
                        settings.cardSize === size.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`${size.width} h-12 bg-gray-300 rounded mx-auto mb-2`}></div>
                      <div className="text-sm font-medium text-gray-900 text-center">{size.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Table Columns (only for table mode) */}
            {settings.mode === ViewMode.TABLE && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Table Columns</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-blue-800">
                    Select which columns to display in table view. Drag to reorder columns.
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'question', label: 'Question', icon: '❓' },
                    { key: 'type', label: 'Type', icon: '🔘' },
                    { key: 'difficulty', label: 'Difficulty', icon: '⚡' },
                    { key: 'points', label: 'Points', icon: '🏆' },
                    { key: 'tags', label: 'Tags', icon: '🏷️' },
                    { key: 'hierarchy', label: 'Hierarchy', icon: '🗂️' },
                    { key: 'created', label: 'Created', icon: '📅' },
                    { key: 'updated', label: 'Updated', icon: '🔄' },
                    { key: 'status', label: 'Status', icon: '✅' },
                  ].map((column) => (
                    <label key={column.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={settings.columnsToShow?.includes(column.key) ?? false}
                        onChange={(e) => {
                          const currentColumns = settings.columnsToShow || [];
                          if (e.target.checked) {
                            updateSetting('columnsToShow', [...currentColumns, column.key]);
                          } else {
                            updateSetting('columnsToShow', currentColumns.filter(c => c !== column.key));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-lg">{column.icon}</div>
                      <div className="font-medium text-gray-900">{column.label}</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Advanced Options</label>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium mb-1">Performance Note</div>
                    <div>Some settings may affect performance with large question sets. Consider using compact mode or disabling previews for better performance.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Preview</label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">Current settings preview:</div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-medium text-gray-700">Display Mode</div>
                    <div className="text-gray-600">{settings.mode}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Options</div>
                    <div className="text-gray-600">
                      {settings.showPreviews ? '✓' : '✗'} Previews{' '}
                      {settings.showHierarchy ? '✓' : '✗'} Hierarchy{' '}
                      {settings.compactMode ? '✓' : '✗'} Compact
                    </div>
                  </div>
                  {settings.mode === ViewMode.GRID && (
                    <div>
                      <div className="font-medium text-gray-700">Card Size</div>
                      <div className="text-gray-600 capitalize">{settings.cardSize}</div>
                    </div>
                  )}
                  {settings.mode === ViewMode.TABLE && (
                    <div>
                      <div className="font-medium text-gray-700">Columns</div>
                      <div className="text-gray-600">{settings.columnsToShow?.length || 0} selected</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={handleDefaults}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Restore Defaults
                </button>
                
                {hasChanges && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    Reset Changes
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    hasChanges
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};