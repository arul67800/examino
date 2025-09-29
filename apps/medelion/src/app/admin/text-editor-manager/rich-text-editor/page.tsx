'use client';

import React, { useState, useRef } from 'react';
import { useTheme } from '@/theme';
import {
  Save, Download, Eye, Maximize2, Minimize2, Undo2, Redo2,
  FileText, Type, Plus, Bold, Italic, Underline, Users
} from 'lucide-react';

// Import the advanced components we created
import { AdvancedFormattingPanel } from '@/components/admin/text-editor-manager/rich-text-editor/formatting/AdvancedFormattingPanel';
import { SmartContentBlocks } from '@/components/admin/text-editor-manager/rich-text-editor/editor/SmartContentBlocks';
import { TypographyStyle, TextEffect } from '@/components/admin/text-editor-manager/rich-text-editor/utils/AdvancedTypographyEngine';
import { useEditorState } from '@/components/admin/text-editor-manager/rich-text-editor/hooks/useEditorState';
import { useEditorCommands } from '@/components/admin/text-editor-manager/rich-text-editor/hooks/useEditorCommands';

// ContentBlock interface
interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'image' | 'table' | 'list' | 'quote' | 'code';
  data?: any;
  style?: React.CSSProperties;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export default function RichTextEditorPage() {
  const { theme } = useTheme();
  
  // Refs for editor components
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Use the existing hooks properly
  const editorState = useEditorState('');
  const editorCommands = useEditorCommands();
  
  // Component state
  const [currentViewMode, setCurrentViewMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFormatting, setShowFormatting] = useState(true);
  const [showBlocks, setShowBlocks] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Handle block changes
  const handleBlocksChange = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
    setUnsavedChanges(true);
  };

  // Handle block selection
  const handleBlockSelect = (block: ContentBlock) => {
    setSelectedBlocks([block.id]);
  };

  // Handle typography style changes
  const handleStyleChange = (styles: TypographyStyle) => {
    if (selectedBlocks.length > 0 && editorRef.current) {
      const selectedElement = editorRef.current.querySelector(`[data-block-id="${selectedBlocks[0]}"]`) as HTMLElement;
      if (selectedElement) {
        Object.assign(selectedElement.style, styles);
      }
    }
  };

  // Handle text effect application
  const handleEffectApply = (effect: TextEffect) => {
    if (selectedBlocks.length > 0 && editorRef.current) {
      selectedBlocks.forEach(blockId => {
        const blockElement = editorRef.current?.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
        if (blockElement) {
          Object.assign(blockElement.style, effect.styles);
        }
      });
    }
  };

  // Save functionality
  const handleSave = async () => {
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      setUnsavedChanges(false);
      console.log('Content saved');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const containerClassName = isFullscreen 
    ? 'fixed inset-0 z-50 flex flex-col'
    : 'min-h-screen flex flex-col';

  return (
    <div 
      className={containerClassName}
      style={{ backgroundColor: theme.colors.semantic.surface.primary }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.colors.semantic.border.primary }}
      >
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
              Advanced Rich Text Editor
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                {blocks.length} blocks
              </span>
              <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
              {unsavedChanges && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm" style={{ color: theme.colors.semantic.status.warning }}>
                    Unsaved changes
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Selector */}
          <div className="flex items-center space-x-1 p-1 rounded-lg" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
            <button
              onClick={() => setCurrentViewMode('edit')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                currentViewMode === 'edit' ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: currentViewMode === 'edit' 
                  ? theme.colors.semantic.action.primary 
                  : 'transparent',
                color: currentViewMode === 'edit' 
                  ? theme.colors.semantic.text.inverse 
                  : theme.colors.semantic.text.primary
              }}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Edit
            </button>
            <button
              onClick={() => setCurrentViewMode('preview')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                currentViewMode === 'preview' ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: currentViewMode === 'preview' 
                  ? theme.colors.semantic.action.primary 
                  : 'transparent',
                color: currentViewMode === 'preview' 
                  ? theme.colors.semantic.text.inverse 
                  : theme.colors.semantic.text.primary
              }}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Preview
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={editorState.undo}
              disabled={!editorState.canUndo}
              className="p-2 rounded transition-colors disabled:opacity-50"
              style={{ color: theme.colors.semantic.text.secondary }}
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={editorState.redo}
              disabled={!editorState.canRedo}
              className="p-2 rounded transition-colors disabled:opacity-50"
              style={{ color: theme.colors.semantic.text.secondary }}
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={!unsavedChanges}
              className="px-4 py-2 rounded border transition-colors disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.semantic.action.primary,
                borderColor: theme.colors.semantic.action.primary,
                color: theme.colors.semantic.text.inverse
              }}
              title="Save"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded transition-colors"
              style={{ color: theme.colors.semantic.text.secondary }}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Formatting & Blocks */}
        {currentViewMode === 'edit' && (
          <div 
            className="w-80 border-r flex flex-col overflow-hidden"
            style={{ borderColor: theme.colors.semantic.border.primary }}
          >
            {/* Panel Tabs */}
            <div 
              className="flex border-b"
              style={{ borderColor: theme.colors.semantic.border.secondary }}
            >
              <button
                onClick={() => { setShowFormatting(true); setShowBlocks(false); }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  showFormatting ? 'border-b-2' : ''
                }`}
                style={{
                  color: showFormatting 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.secondary,
                  borderBottomColor: showFormatting 
                    ? theme.colors.semantic.action.primary 
                    : 'transparent'
                }}
              >
                <Type className="w-4 h-4 inline mr-2" />
                Format
              </button>
              <button
                onClick={() => { setShowFormatting(false); setShowBlocks(true); }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  showBlocks ? 'border-b-2' : ''
                }`}
                style={{
                  color: showBlocks 
                    ? theme.colors.semantic.action.primary 
                    : theme.colors.semantic.text.secondary,
                  borderBottomColor: showBlocks 
                    ? theme.colors.semantic.action.primary 
                    : 'transparent'
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Blocks
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {showFormatting && (
                <AdvancedFormattingPanel
                  selectedElement={selectedBlocks.length > 0 ? editorRef.current?.querySelector(`[data-block-id="${selectedBlocks[0]}"]`) as HTMLElement : undefined}
                  onStyleChange={handleStyleChange}
                  onEffectApply={handleEffectApply}
                  className="h-full"
                />
              )}
              
              {showBlocks && (
                <div className="p-4">
                  <div className="text-center py-8">
                    <Plus className="w-8 h-8 mx-auto mb-2" style={{ color: theme.colors.semantic.text.secondary }} />
                    <p style={{ color: theme.colors.semantic.text.secondary }}>
                      Smart Content Blocks Panel
                    </p>
                    <p className="text-sm mt-1" style={{ color: theme.colors.semantic.text.secondary }}>
                      Drag and drop content blocks coming soon
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Basic Toolbar */}
          {currentViewMode === 'edit' && (
            <div 
              className="flex items-center space-x-2 p-3 border-b"
              style={{ borderColor: theme.colors.semantic.border.secondary }}
            >
              <button
                onClick={() => editorCommands.formatText('bold')}
                className="p-2 rounded transition-colors"
                style={{ color: theme.colors.semantic.text.secondary }}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editorCommands.formatText('italic')}
                className="p-2 rounded transition-colors"
                style={{ color: theme.colors.semantic.text.secondary }}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => editorCommands.formatText('underline')}
                className="p-2 rounded transition-colors"
                style={{ color: theme.colors.semantic.text.secondary }}
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Content Editor/Preview */}
          <div className="flex-1 overflow-hidden">
            {currentViewMode === 'edit' ? (
              <div 
                ref={editorRef}
                className="h-full p-6 overflow-y-auto focus:outline-none"
                contentEditable
                style={{ 
                  backgroundColor: theme.colors.semantic.surface.primary,
                  color: theme.colors.semantic.text.primary,
                  lineHeight: 1.6
                }}
              >
                {blocks.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.semantic.text.secondary }} />
                    <p className="text-lg font-medium mb-2" style={{ color: theme.colors.semantic.text.secondary }}>
                      Start writing or add content blocks
                    </p>
                    <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                      Use the blocks panel to add rich content to your document
                    </p>
                  </div>
                ) : (
                  blocks.map(block => (
                    <div
                      key={block.id}
                      data-block-id={block.id}
                      className="mb-4 p-4 rounded-lg transition-all cursor-pointer"
                      style={{
                        backgroundColor: selectedBlocks.includes(block.id) 
                          ? theme.colors.semantic.action.primary + '10'
                          : 'transparent',
                        border: selectedBlocks.includes(block.id) 
                          ? `2px solid ${theme.colors.semantic.action.primary}`
                          : '2px solid transparent'
                      }}
                      onClick={() => setSelectedBlocks([block.id])}
                    >
                      {/* Render block content based on type */}
                      {block.type === 'text' && (
                        <div className="prose max-w-none">
                          {block.data?.content || 'Click to edit...'}
                        </div>
                      )}
                      {block.type === 'heading' && (
                        React.createElement(
                          `h${block.data?.level || 2}`,
                          { className: 'font-bold mb-2' },
                          block.data?.content || 'Heading'
                        )
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div 
                className="h-full p-6 overflow-y-auto"
                style={{ 
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  color: theme.colors.semantic.text.primary
                }}
              >
                <article className="prose prose-lg max-w-none">
                  {blocks.map(block => (
                    <div key={block.id}>
                      {block.type === 'text' && (
                        <div>{block.data?.content || ''}</div>
                      )}
                      {block.type === 'heading' && (
                        React.createElement(
                          `h${block.data?.level || 2}`,
                          { className: 'font-bold mb-4 mt-6' },
                          block.data?.content
                        )
                      )}
                    </div>
                  ))}
                </article>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2 border-t text-sm"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.primary,
          color: theme.colors.semantic.text.secondary
        }}
      >
        <div className="flex items-center space-x-4">
          <span>{blocks.length} blocks</span>
          <span>•</span>
          <span>Advanced Rich Text Editor</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: unsavedChanges ? theme.colors.semantic.status.warning : theme.colors.semantic.status.success }}
            />
            <span>{unsavedChanges ? 'Unsaved' : 'Saved'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}