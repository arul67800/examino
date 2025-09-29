'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { ToolbarGroup as ToolbarGroupType, EditorTool } from '../types';
import { ToolbarButton } from './ToolbarButton';
import { HeadingsDropdown } from './HeadingsDropdown';
import { FontFamilyDropdown } from './FontFamilyDropdown';
import { FontSizeDropdown } from './FontSizeDropdown';
import { ColorPicker } from './ColorPicker';
import { TableDropdown } from './TableDropdown';
import { MediaDropdown } from './MediaDropdown';
import { MoreOptionsDropdown } from './MoreOptionsDropdown';

interface ToolbarProps {
  groups: ToolbarGroupType[];
  activeFormats: Set<string>;
  onToolAction: (tool: EditorTool) => void;
  onHeadingChange: (level: number) => void;
  onFontFamilyChange: (family: string) => void;
  onFontSizeChange: (size: number) => void;
  onColorChange: (color: string, type: 'text' | 'background') => void;
  onTableInsert: (rows: number, cols: number) => void;
  onImageInsert: (file?: File) => void;
  onVideoInsert: (file?: File) => void;
  onLinkInsert: () => void;
  className?: string;
  compact?: boolean;
  showLabels?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  groups,
  activeFormats,
  onToolAction,
  onHeadingChange,
  onFontFamilyChange,
  onFontSizeChange,
  onColorChange,
  onTableInsert,
  onImageInsert,
  onVideoInsert,
  onLinkInsert,
  className = '',
  compact = false,
  showLabels = false
}) => {
  const { theme } = useTheme();

  const renderSpecialTool = (tool: EditorTool) => {
    switch (tool.id) {
      case 'headings':
        return (
          <HeadingsDropdown
            key={tool.id}
            onHeadingChange={onHeadingChange}
            compact={compact}
          />
        );
      case 'fontFamily':
        return (
          <FontFamilyDropdown
            key={tool.id}
            onFontChange={onFontFamilyChange}
            compact={compact}
          />
        );
      case 'fontSize':
        return (
          <FontSizeDropdown
            key={tool.id}
            onSizeChange={onFontSizeChange}
            compact={compact}
          />
        );
      case 'textColor':
        return (
          <ColorPicker
            key={tool.id}
            type="text"
            onColorChange={(color) => onColorChange(color, 'text')}
            compact={compact}
          />
        );
      case 'backgroundColor':
        return (
          <ColorPicker
            key={tool.id}
            type="background"
            onColorChange={(color) => onColorChange(color, 'background')}
            compact={compact}
          />
        );
      case 'table':
        return (
          <TableDropdown
            key={tool.id}
            onTableInsert={onTableInsert}
            compact={compact}
          />
        );
      case 'media':
        return (
          <MediaDropdown
            key={tool.id}
            onImageInsert={onImageInsert}
            onVideoInsert={onVideoInsert}
            onLinkInsert={onLinkInsert}
            compact={compact}
          />
        );
      default:
        return null;
    }
  };

  const renderToolbarGroup = (group: ToolbarGroupType) => {
    // Filter tools based on responsive settings
    const visibleTools = group.tools.filter(tool => {
      if (compact) {
        return !group.responsive?.hideOnMobile;
      }
      return true;
    });

    if (visibleTools.length === 0) return null;

    return (
      <div
        key={group.id}
        className="flex items-center space-x-1"
        data-group={group.id}
      >
        {visibleTools.map(tool => {
          const specialTool = renderSpecialTool(tool);
          if (specialTool) return specialTool;

          return (
            <ToolbarButton
              key={tool.id}
              tool={tool}
              isActive={activeFormats.has(tool.id)}
              onClick={() => onToolAction(tool)}
              compact={compact}
              showLabel={showLabels}
            />
          );
        })}
      </div>
    );
  };

  // Sort groups by priority
  const sortedGroups = [...groups].sort((a, b) => a.priority - b.priority);

  // Split groups for responsive layout
  const primaryGroups = sortedGroups.filter(g => g.priority <= 3);
  const secondaryGroups = sortedGroups.filter(g => g.priority > 3);

  return (
    <div 
      className={`border-b ${className}`}
      style={{ 
        borderColor: theme.colors.semantic.border.secondary,
        backgroundColor: theme.colors.semantic.surface.primary 
      }}
    >
      {/* Primary Toolbar */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center flex-wrap gap-2">
          {primaryGroups.map((group, index) => (
            <React.Fragment key={group.id}>
              {renderToolbarGroup(group)}
              {index < primaryGroups.length - 1 && (
                <div 
                  className="w-px h-6"
                  style={{ backgroundColor: theme.colors.semantic.border.secondary }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* More Options */}
        {secondaryGroups.length > 0 && (
          <MoreOptionsDropdown
            groups={secondaryGroups}
            activeFormats={activeFormats}
            onToolAction={onToolAction}
            compact={compact}
          />
        )}
      </div>

      {/* Secondary Toolbar (for non-compact mode) */}
      {!compact && secondaryGroups.length > 0 && (
        <div className="flex items-center p-3 pt-0">
          <div className="flex items-center flex-wrap gap-2">
            {secondaryGroups.map((group, index) => (
              <React.Fragment key={group.id}>
                {renderToolbarGroup(group)}
                {index < secondaryGroups.length - 1 && (
                  <div 
                    className="w-px h-6"
                    style={{ backgroundColor: theme.colors.semantic.border.secondary }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};