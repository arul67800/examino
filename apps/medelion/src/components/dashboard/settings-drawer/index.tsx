'use client';

import { useState } from 'react';
import { useTheme, THEME_MODES, COLOR_NAMES } from '@/theme';
import type { ThemeMode, ColorName } from '@/theme';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'theme' | 'general' | 'notifications' | 'account';

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');
  const { 
    theme, 
    colorName, 
    mode, 
    direction, 
    setColorName, 
    setMode, 
    setDirection, 
    toggleMode, 
    toggleDirection 
  } = useTheme();

  const tabs = [
    {
      id: 'theme' as const,
      label: 'Theme',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
    },
    {
      id: 'general' as const,
      label: 'General',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      id: 'account' as const,
      label: 'Account',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const colorOptions = [
    { name: 'blue', label: 'Blue', color: '#3b82f6' },
    { name: 'green', label: 'Green', color: '#22c55e' },
    { name: 'pink', label: 'Pink', color: '#ec4899' },
    { name: 'orange', label: 'Orange', color: '#f97316' },
    { name: 'red', label: 'Red', color: '#ef4444' },
    { name: 'gray', label: 'Gray', color: '#6b7280' },
  ];

  const modeOptions = [
    { 
      value: 'light' as ThemeMode, 
      label: 'Light', 
      description: 'Clean and bright interface',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    { 
      value: 'dark' as ThemeMode, 
      label: 'Dark', 
      description: 'Easy on the eyes in low light',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    { 
      value: 'black' as ThemeMode, 
      label: 'Black', 
      description: 'Pure black for AMOLED displays',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
  ];

  const renderThemeSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Appearance
        </h3>
        
        {/* Color Theme Selection */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Color Theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            {colorOptions.map((color) => (
              <button
                key={color.name}
                onClick={() => setColorName(color.name as ColorName)}
                className="relative p-3 rounded-lg border-2 transition-all duration-200 aspect-square"
                style={{
                  borderColor: colorName === color.name 
                    ? theme.colors.semantic.action.primary
                    : theme.colors.semantic.border.primary,
                  backgroundColor: colorName === color.name 
                    ? theme.colors.semantic.surface.elevated 
                    : 'transparent',
                }}
              >
                <div className="flex items-center justify-center">
                  <div 
                    className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0"
                    style={{ 
                      backgroundColor: color.color,
                      borderColor: 'rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Display Mode Selection */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Display Mode
          </label>
          <div className="space-y-3">
            {modeOptions.map((modeOption) => (
              <button
                key={modeOption.value}
                onClick={() => setMode(modeOption.value)}
                className="w-full p-4 rounded-lg border-2 text-left transition-all duration-200"
                style={{
                  borderColor: mode === modeOption.value 
                    ? theme.colors.semantic.action.primary
                    : theme.colors.semantic.border.primary,
                  backgroundColor: mode === modeOption.value 
                    ? theme.colors.semantic.surface.elevated
                    : 'transparent',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      style={{ 
                        color: mode === modeOption.value 
                          ? theme.colors.semantic.action.primary 
                          : theme.colors.semantic.text.tertiary 
                      }}
                    >
                      {modeOption.icon}
                    </div>
                    <div>
                      <div 
                        className="font-medium"
                        style={{ color: theme.colors.semantic.text.primary }}
                      >
                        {modeOption.label}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: theme.colors.semantic.text.tertiary }}
                      >
                        {modeOption.description}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Direction Setting */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Text Direction
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setDirection('ltr')}
              className="flex-1 p-3 rounded-lg border-2 transition-all duration-200"
              style={{
                borderColor: direction === 'ltr' 
                  ? theme.colors.semantic.action.primary
                  : theme.colors.semantic.border.primary,
                backgroundColor: direction === 'ltr' 
                  ? theme.colors.semantic.surface.elevated
                  : 'transparent',
              }}
            >
              <div 
                className="flex items-center justify-center space-x-2"
                style={{ 
                  color: direction === 'ltr' 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.secondary 
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-sm font-medium">LTR</span>
              </div>
            </button>
            <button
              onClick={() => setDirection('rtl')}
              className="flex-1 p-3 rounded-lg border-2 transition-all duration-200"
              style={{
                borderColor: direction === 'rtl' 
                  ? theme.colors.semantic.action.primary
                  : theme.colors.semantic.border.primary,
                backgroundColor: direction === 'rtl' 
                  ? theme.colors.semantic.surface.elevated
                  : 'transparent',
              }}
            >
              <div 
                className="flex items-center justify-center space-x-2"
                style={{ 
                  color: direction === 'rtl' 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.secondary 
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span className="text-sm font-medium">RTL</span>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className="pt-4 border-t"
          style={{ borderColor: theme.colors.semantic.border.secondary }}
        >
          <div className="flex space-x-3">
            <button
              onClick={toggleMode}
              className="flex-1 px-4 py-2 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.semantic.action.primary,
                color: theme.colors.semantic.text.inverse,
              }}
            >
              Toggle Mode
            </button>
            <button
              onClick={toggleDirection}
              className="flex-1 px-4 py-2 border rounded-lg transition-colors duration-200"
              style={{
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.secondary,
                backgroundColor: 'transparent',
              }}
            >
              Toggle Direction
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'theme':
        return renderThemeSettings();
      case 'general':
        return (
          <div className="space-y-4">
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              General Settings
            </h3>
            <p 
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              General application settings will go here.
            </p>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Notification Settings
            </h3>
            <p 
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Notification preferences will go here.
            </p>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
            <p className="text-gray-600">Account management options will go here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>      
      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 h-full w-96 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
        style={{
          backgroundColor: theme.colors.semantic.surface.elevated,
          borderLeft: `1px solid ${theme.colors.semantic.border.primary}`
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b transition-colors duration-200"
          style={{ borderColor: theme.colors.semantic.border.secondary }}
        >
          <h2 
            className="text-xl font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors duration-200 hover:opacity-80"
            style={{ 
              backgroundColor: 'transparent',
              color: theme.colors.semantic.text.secondary 
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-full">
          {/* Vertical Tabs */}
          <div 
            className="w-20 border-r py-4"
            style={{ borderColor: theme.colors.semantic.border.secondary }}
          >
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full p-3 flex flex-col items-center space-y-1 transition-colors duration-200
                    ${activeTab === tab.id ? 'border-r-2' : ''}
                  `}
                  style={{
                    backgroundColor: activeTab === tab.id 
                      ? theme.colors.semantic.surface.tertiary 
                      : 'transparent',
                    color: activeTab === tab.id 
                      ? theme.colors.semantic.text.primary 
                      : theme.colors.semantic.text.secondary,
                    borderRightColor: activeTab === tab.id 
                      ? theme.colors.semantic.action.primary 
                      : 'transparent'
                  }}
                  title={tab.label}
                >
                  {tab.icon}
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </>
  );
}