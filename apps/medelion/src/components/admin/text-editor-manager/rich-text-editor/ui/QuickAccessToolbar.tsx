'use client';

import React from 'react';
import { useTheme } from '@/theme';
import {
  Save, Undo2, Redo2, Download, Share2, FileText, Maximize2,
  Minimize2, X, HelpCircle, Settings, User
} from 'lucide-react';

interface QuickAccessToolbarProps {
  onCommand: (command: string, value?: any) => void;
  documentTitle?: string;
  onTitleChange?: (title: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  unsavedChanges?: boolean;
}

export function QuickAccessToolbar({
  onCommand,
  documentTitle = 'Document1',
  onTitleChange,
  isFullscreen = false,
  onToggleFullscreen,
  unsavedChanges = false
}: QuickAccessToolbarProps) {
  const { theme } = useTheme();

  const iconButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.colors.semantic.text.primary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const hoverStyle = {
    backgroundColor: theme.colors.semantic.action.hover,
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b"
      style={{
        backgroundColor: theme.colors.semantic.background.primary,
        borderColor: theme.colors.semantic.border.primary,
        minHeight: '48px',
      }}
    >
      {/* Left Section - Quick Access */}
      <div className="flex items-center gap-2">
        {/* App Icon */}
        <div className="w-8 h-8 flex items-center justify-center">
          <FileText 
            className="w-6 h-6" 
            style={{ color: theme.colors.semantic.action.primary }}
          />
        </div>

        {/* Quick Access Buttons */}
        <div className="flex items-center gap-1 ml-2">
          <button
            style={iconButtonStyle}
            onClick={() => onCommand('save')}
            className="hover:bg-opacity-80"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            style={iconButtonStyle}
            onClick={() => onCommand('undo')}
            className="hover:bg-opacity-80"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            style={iconButtonStyle}
            onClick={() => onCommand('redo')}
            className="hover:bg-opacity-80"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 mx-2" style={{ backgroundColor: theme.colors.semantic.border.secondary }} />
          
          <button
            style={iconButtonStyle}
            onClick={() => onCommand('download')}
            className="hover:bg-opacity-80"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            style={iconButtonStyle}
            onClick={() => onCommand('share')}
            className="hover:bg-opacity-80"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Section - Document Title */}
      <div className="flex-1 flex items-center justify-center max-w-md mx-4">
        <div className="flex flex-col items-center">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="text-lg font-medium text-center bg-transparent border-none outline-none px-2 py-1 rounded"
            style={{
              color: theme.colors.semantic.text.primary,
              minWidth: '200px',
            }}
            placeholder="Document Title"
          />
          <div className="flex items-center gap-2 text-xs mt-1">
            <span style={{ color: theme.colors.semantic.text.tertiary }}>
              {unsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </span>
            {unsavedChanges && (
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.colors.semantic.status.warning }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Window Controls */}
      <div className="flex items-center gap-2">
        {/* User Account */}
        <button
          style={iconButtonStyle}
          onClick={() => onCommand('account')}
          className="hover:bg-opacity-80 rounded-full"
          title="Account"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          style={iconButtonStyle}
          onClick={() => onCommand('settings')}
          className="hover:bg-opacity-80"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Help */}
        <button
          style={iconButtonStyle}
          onClick={() => onCommand('help')}
          className="hover:bg-opacity-80"
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="w-px h-6 mx-2" style={{ backgroundColor: theme.colors.semantic.border.secondary }} />

        {/* Window Controls */}
        <button
          style={iconButtonStyle}
          onClick={onToggleFullscreen}
          className="hover:bg-opacity-80"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {!isFullscreen && (
          <button
            style={iconButtonStyle}
            onClick={() => onCommand('close')}
            className="hover:bg-red-500 hover:text-white"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}