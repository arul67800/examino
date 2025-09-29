'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/theme';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, Palette, List, ListOrdered, Quote, Link, Image, Video, Table,
  Code, Undo2, Redo2, Copy, Clipboard, Scissors, Highlighter,
  ChevronDown, MoreHorizontal, FileText, Plus, Layout, 
  PaintBucket, Settings, Download, Share2, Save
} from 'lucide-react';
import { ImageModal } from '../image-upload';
import { ImageFile, ImageInsertOptions } from '../image-upload/types';
import { EditorUtils } from '../utils/EditorUtils';
import { fileToBase64, validateImageUrl } from '../utils/imageUtils';

type RibbonTab = 'home' | 'insert' | 'design' | 'layout' | 'review';

interface RibbonToolbarProps {
  onCommand: (command: string, value?: any) => void;
  activeTab?: RibbonTab;
  onTabChange?: (tab: RibbonTab) => void;
  onImageInsert?: (image: ImageFile, options: ImageInsertOptions) => void;
}

export function RibbonToolbar({ onCommand, activeTab = 'home', onTabChange, onImageInsert }: RibbonToolbarProps) {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<RibbonTab>(activeTab);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleTabClick = (tab: RibbonTab) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

    const handleImageInsert = useCallback(async (image: ImageFile, options: ImageInsertOptions) => {
    console.log('🖼️ RibbonToolbar: Inserting image:', image);
    
    try {
      let imageUrl = image.url;
      
      // If no URL, convert file to base64
      if (!imageUrl && image.file) {
        imageUrl = await fileToBase64(image.file);
      }
      
      if (!imageUrl) {
        console.error('❌ No image URL available');
        return;
      }
      
      const imageHtml = `<img src="${imageUrl}" alt="${image.name || 'Inserted Image'}" style="max-width: 100%; height: auto; cursor: move;" />`;
      EditorUtils.insertImageAtCursor(imageHtml);
      console.log('✅ Successfully inserted image');
    } catch (error) {
      console.error('❌ Failed to insert image:', error);
    }
  }, []);

  const generateImageHtml = (image: ImageFile, options: ImageInsertOptions): string => {
    const { alignment, size, customWidth, customHeight, altText, caption, borderRadius, shadow, margin } = options;
    
    console.log('Generating image HTML for:', { 
      url: image.url, 
      name: image.name, 
      type: image.type,
      size: image.size 
    });
    
    // Use the URL from the validated image object
    const imageUrl = image.url;
    console.log('Using validated image URL for HTML generation:', imageUrl ? imageUrl.substring(0, 50) + '...' : 'No URL');
    
    // Determine container class based on alignment
    let containerClass = 'image-container';
    if (alignment === 'left') containerClass += ' float-left';
    else if (alignment === 'right') containerClass += ' float-right';
    else containerClass += ' align-center';

    // Build image styles
    let width = '';
    let height = '';
    
    switch (size) {
      case 'small':
        width = '200px';
        break;
      case 'medium':
        width = '400px';
        break;
      case 'large':
        width = '600px';
        break;
      case 'custom':
        if (customWidth) width = `${customWidth}px`;
        if (customHeight) height = `${customHeight}px`;
        break;
    }

    const imageStyles = [
      width && `width: ${width}`,
      height && `height: ${height}`,
      `border-radius: ${borderRadius}px`,
      shadow && 'box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)',
      `margin: ${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
      'display: block' // Ensure image is displayed
    ].filter(Boolean).join('; ');

    // Add data attributes for enhancement
    const dataAttributes = [
      `data-image-id="${image.id}"`,
      caption ? `data-caption="${caption.replace(/"/g, '&quot;')}"` : '',
      `data-original-width="${image.dimensions?.width || ''}"`,
      `data-original-height="${image.dimensions?.height || ''}"`,
      `data-debug-name="${image.name || 'unknown'}"`
    ].filter(Boolean).join(' ');

    // Generate clean image HTML
    const imageHtml = `<img 
      src="${imageUrl}" 
      alt="${altText}" 
      style="${imageStyles}" 
      ${dataAttributes} 
      onload="console.log('✅ Image loaded:', this.naturalWidth + 'x' + this.naturalHeight)" 
      onerror="console.error('❌ Image failed to load:', this.src)"
    />`;
    
    if (caption) {
      return `
        <div class="${containerClass}">
          ${imageHtml}
          <div class="image-caption">${caption}</div>
        </div>
      `;
    } else {
      return `<div class="${containerClass}">${imageHtml}</div>`;
    }
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.colors.semantic.text.primary,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme.colors.semantic.surface.tertiary,
    color: theme.colors.semantic.action.primary,
  };

  const toolGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    borderRight: `1px solid ${theme.colors.semantic.border.secondary}`,
  };

  const renderHomeTab = () => (
    <div className="flex items-center gap-1">
      {/* Clipboard Group */}
      <div style={toolGroupStyle}>
        <div className="flex flex-col items-center gap-1">
          <button
            style={buttonStyle}
            onClick={() => onCommand('paste')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Clipboard className="w-6 h-6" />
            <span className="text-xs">Paste</span>
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <button
            style={buttonStyle}
            onClick={() => onCommand('cut')}
            className="hover:bg-opacity-80 flex items-center gap-1 p-1"
          >
            <Scissors className="w-4 h-4" />
            <span className="text-xs">Cut</span>
          </button>
          <button
            style={buttonStyle}
            onClick={() => onCommand('copy')}
            className="hover:bg-opacity-80 flex items-center gap-1 p-1"
          >
            <Copy className="w-4 h-4" />
            <span className="text-xs">Copy</span>
          </button>
        </div>
      </div>

      {/* Font Group */}
      <div style={toolGroupStyle}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              className="px-2 py-1 rounded border text-sm"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary,
                color: theme.colors.semantic.text.primary,
              }}
              onChange={(e) => onCommand('fontFamily', e.target.value)}
            >
              <option value="Inter">Inter</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
            </select>
            <select
              className="px-2 py-1 rounded border text-sm w-16"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary,
                color: theme.colors.semantic.text.primary,
              }}
              onChange={(e) => onCommand('fontSize', e.target.value)}
            >
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="24">24</option>
              <option value="28">28</option>
              <option value="32">32</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              style={buttonStyle}
              onClick={() => onCommand('bold')}
              className="hover:bg-opacity-80 p-1"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('italic')}
              className="hover:bg-opacity-80 p-1"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('underline')}
              className="hover:bg-opacity-80 p-1"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('highlight')}
              className="hover:bg-opacity-80 p-1"
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('textColor')}
              className="hover:bg-opacity-80 p-1 flex items-center gap-1"
            >
              <Type className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Paragraph Group */}
      <div style={toolGroupStyle}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <button
              style={buttonStyle}
              onClick={() => onCommand('alignLeft')}
              className="hover:bg-opacity-80 p-1"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('alignCenter')}
              className="hover:bg-opacity-80 p-1"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('alignRight')}
              className="hover:bg-opacity-80 p-1"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('alignJustify')}
              className="hover:bg-opacity-80 p-1"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              style={buttonStyle}
              onClick={() => onCommand('bulletList')}
              className="hover:bg-opacity-80 p-1"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('orderedList')}
              className="hover:bg-opacity-80 p-1"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              style={buttonStyle}
              onClick={() => onCommand('quote')}
              className="hover:bg-opacity-80 p-1"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editing Group */}
      <div style={toolGroupStyle}>
        <div className="flex flex-col items-center gap-1">
          <button
            style={buttonStyle}
            onClick={() => onCommand('find')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <div className="text-lg">🔍</div>
            <span className="text-xs">Find</span>
          </button>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            style={buttonStyle}
            onClick={() => onCommand('replace')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <div className="text-lg">🔄</div>
            <span className="text-xs">Replace</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderInsertTab = () => (
    <div className="flex items-center gap-1">
      {/* Pages Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('pageBreak')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <FileText className="w-6 h-6" />
          <span className="text-xs">Page Break</span>
        </button>
      </div>

      {/* Tables Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('insertTable')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <Table className="w-6 h-6" />
          <span className="text-xs">Table</span>
        </button>
      </div>

      {/* Illustrations Group */}
      <div style={toolGroupStyle}>
        <div className="flex items-center gap-2">
          <button
            style={buttonStyle}
            onClick={() => {
              // Save cursor position before opening modal
              EditorUtils.saveCursorPosition();
              setShowImageModal(true);
            }}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Image className="w-6 h-6" />
            <span className="text-xs">Image</span>
          </button>

          <button
            style={buttonStyle}
            onClick={() => onCommand('insertVideo')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Video className="w-6 h-6" />
            <span className="text-xs">Video</span>
          </button>
        </div>
      </div>

      {/* Links Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('insertLink')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <Link className="w-6 h-6" />
          <span className="text-xs">Link</span>
        </button>
      </div>

      {/* Text Group */}
      <div style={toolGroupStyle}>
        <div className="flex items-center gap-2">
          <button
            style={buttonStyle}
            onClick={() => onCommand('insertCode')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Code className="w-6 h-6" />
            <span className="text-xs">Code Block</span>
          </button>
          <button
            style={buttonStyle}
            onClick={() => onCommand('insertQuote')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <Quote className="w-6 h-6" />
            <span className="text-xs">Quote</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDesignTab = () => (
    <div className="flex items-center gap-1">
      {/* Themes Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('documentThemes')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <PaintBucket className="w-6 h-6" />
          <span className="text-xs">Themes</span>
        </button>
      </div>

      {/* Page Color Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('pageColor')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <Palette className="w-6 h-6" />
          <span className="text-xs">Page Color</span>
        </button>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="flex items-center gap-1">
      {/* Page Setup Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('margins')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <Layout className="w-6 h-6" />
          <span className="text-xs">Margins</span>
        </button>
      </div>

      {/* Paragraph Group */}
      <div style={toolGroupStyle}>
        <div className="flex items-center gap-2">
          <button
            style={buttonStyle}
            onClick={() => onCommand('indent')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <div className="text-lg">→</div>
            <span className="text-xs">Indent</span>
          </button>
          <button
            style={buttonStyle}
            onClick={() => onCommand('outdent')}
            className="hover:bg-opacity-80 flex flex-col items-center p-2"
          >
            <div className="text-lg">←</div>
            <span className="text-xs">Outdent</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderReviewTab = () => (
    <div className="flex items-center gap-1">
      {/* Proofing Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('spellCheck')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <div className="text-lg">✓</div>
          <span className="text-xs">Spelling</span>
        </button>
      </div>

      {/* Comments Group */}
      <div style={toolGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => onCommand('newComment')}
          className="hover:bg-opacity-80 flex flex-col items-center p-2"
        >
          <div className="text-lg">💬</div>
          <span className="text-xs">New Comment</span>
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'home', label: 'Home', content: renderHomeTab },
    { id: 'insert', label: 'Insert', content: renderInsertTab },
    { id: 'design', label: 'Design', content: renderDesignTab },
    { id: 'layout', label: 'Layout', content: renderLayoutTab },
    { id: 'review', label: 'Review', content: renderReviewTab },
  ] as const;

  return (
    <div
      className="border-b"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.primary,
      }}
    >
      {/* Tab Headers */}
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id as RibbonTab)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: currentTab === tab.id 
                ? theme.colors.semantic.surface.secondary 
                : 'transparent',
              color: currentTab === tab.id 
                ? theme.colors.semantic.action.primary 
                : theme.colors.semantic.text.primary,
              borderBottom: currentTab === tab.id 
                ? `2px solid ${theme.colors.semantic.action.primary}` 
                : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className="p-2"
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          minHeight: '80px',
        }}
      >
        {tabs.find(tab => tab.id === currentTab)?.content()}
      </div>

      {/* Image Upload Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          // Clear saved cursor position if modal is closed without inserting
          EditorUtils.clearSavedCursorPosition();
        }}
        onImageInsert={handleImageInsert}
        defaultTab="upload"
      />
    </div>
  );
}