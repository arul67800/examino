'use client';

import React from 'react';
import { useTheme } from '@/theme';
import {
  Check, AlertCircle, Users, Zap, Eye, Edit3, 
  FileText, Globe, Wifi, WifiOff
} from 'lucide-react';

interface StatusBarProps {
  wordCount?: number;
  pageCount?: number;
  currentPage?: number;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  viewMode?: 'edit' | 'preview' | 'split';
  onViewModeChange?: (mode: 'edit' | 'preview' | 'split') => void;
  isOnline?: boolean;
  collaborators?: number;
  language?: string;
  readabilityScore?: number;
}

export function StatusBar({
  wordCount = 0,
  pageCount = 1,
  currentPage = 1,
  zoomLevel = 100,
  onZoomChange,
  viewMode = 'edit',
  onViewModeChange,
  isOnline = true,
  collaborators = 0,
  language = 'English (US)',
  readabilityScore = 85
}: StatusBarProps) {
  const { theme } = useTheme();

  const statusItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    color: theme.colors.semantic.text.secondary,
    cursor: 'pointer',
    borderRadius: '2px',
    transition: 'background-color 0.2s ease',
  };

  const zoomLevels = [50, 75, 100, 125, 150, 175, 200];

  return (
    <div
      className="flex items-center justify-between px-4 py-1 border-t text-xs"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.secondary,
        height: '24px',
      }}
    >
      {/* Left Section - Document Stats */}
      <div className="flex items-center gap-4">
        <div style={statusItemStyle} title="Word Count">
          <FileText className="w-3 h-3" />
          <span>{wordCount.toLocaleString()} words</span>
        </div>

        <div style={statusItemStyle} title="Page Information">
          <span>Page {currentPage} of {pageCount}</span>
        </div>

        <div style={statusItemStyle} title="Readability Score">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: readabilityScore >= 80 
                ? theme.colors.semantic.status.success 
                : readabilityScore >= 60 
                ? theme.colors.semantic.status.warning 
                : theme.colors.semantic.status.error 
            }}
          />
          <span>Readability: {readabilityScore}%</span>
        </div>

        <div style={statusItemStyle} title="Language">
          <Globe className="w-3 h-3" />
          <span>{language}</span>
        </div>
      </div>

      {/* Center Section - View Mode */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded border" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <button
            onClick={() => onViewModeChange?.('edit')}
            className="px-2 py-1 text-xs"
            style={{
              backgroundColor: viewMode === 'edit' 
                ? theme.colors.semantic.action.primary 
                : 'transparent',
              color: viewMode === 'edit' 
                ? theme.colors.semantic.text.inverse 
                : theme.colors.semantic.text.secondary,
            }}
            title="Edit Mode"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onViewModeChange?.('preview')}
            className="px-2 py-1 text-xs"
            style={{
              backgroundColor: viewMode === 'preview' 
                ? theme.colors.semantic.action.primary 
                : 'transparent',
              color: viewMode === 'preview' 
                ? theme.colors.semantic.text.inverse 
                : theme.colors.semantic.text.secondary,
            }}
            title="Preview Mode"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={() => onViewModeChange?.('split')}
            className="px-2 py-1 text-xs"
            style={{
              backgroundColor: viewMode === 'split' 
                ? theme.colors.semantic.action.primary 
                : 'transparent',
              color: viewMode === 'split' 
                ? theme.colors.semantic.text.inverse 
                : theme.colors.semantic.text.secondary,
            }}
            title="Split Mode"
          >
            <div className="flex gap-0.5">
              <div className="w-1 h-3 bg-current" />
              <div className="w-1 h-3 bg-current" />
            </div>
          </button>
        </div>
      </div>

      {/* Right Section - Connection & Zoom */}
      <div className="flex items-center gap-4">
        {/* Collaboration Status */}
        <div style={statusItemStyle} title={`${collaborators} collaborators online`}>
          <Users className="w-3 h-3" />
          <span>{collaborators}</span>
        </div>

        {/* Connection Status */}
        <div style={statusItemStyle} title={isOnline ? 'Online' : 'Offline'}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" style={{ color: theme.colors.semantic.status.success }} />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" style={{ color: theme.colors.semantic.status.error }} />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Auto-save Status */}
        <div style={statusItemStyle} title="Auto-save enabled">
          <Zap className="w-3 h-3" style={{ color: theme.colors.semantic.status.success }} />
          <span>Auto-save</span>
        </div>

        {/* Zoom Control */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onZoomChange?.(Math.max(50, zoomLevel - 25))}
            className="px-1 py-0.5 text-xs rounded hover:bg-opacity-80"
            style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            disabled={zoomLevel <= 50}
          >
            -
          </button>
          <select
            value={zoomLevel}
            onChange={(e) => onZoomChange?.(Number(e.target.value))}
            className="px-1 py-0.5 text-xs bg-transparent border-none outline-none"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            {zoomLevels.map(zoom => (
              <option key={zoom} value={zoom}>{zoom}%</option>
            ))}
          </select>
          <button
            onClick={() => onZoomChange?.(Math.min(200, zoomLevel + 25))}
            className="px-1 py-0.5 text-xs rounded hover:bg-opacity-80"
            style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
            disabled={zoomLevel >= 200}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}