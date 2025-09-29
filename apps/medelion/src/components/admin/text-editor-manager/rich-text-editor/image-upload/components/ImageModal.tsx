'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/theme';
import { X, Upload, FolderOpen, Settings, HelpCircle, Image as ImageIcon } from 'lucide-react';
import { AdvancedImageUploader } from './AdvancedImageUploader';
import { ImageGallery } from './ImageGallery';
import { ImageFile, ImageInsertOptions } from '../types';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageInsert?: (image: ImageFile, options: ImageInsertOptions) => void;
  defaultTab?: 'upload' | 'gallery';
  maxFiles?: number;
  maxFileSize?: number;
}

export function ImageModal({
  isOpen,
  onClose,
  onImageInsert,
  defaultTab = 'upload',
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024
}: ImageModalProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>(defaultTab);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [insertOptions, setInsertOptions] = useState<ImageInsertOptions>({
    alignment: 'center',
    size: 'medium',
    altText: '',
    borderRadius: 0,
    shadow: false,
    margin: { top: 10, right: 10, bottom: 10, left: 10 }
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageInsert = (image: ImageFile, options?: ImageInsertOptions) => {
    const finalOptions = options || {
      ...insertOptions,
      altText: image.altText || image.name
    };
    
    onImageInsert?.(image, finalOptions);
    onClose();
  };

  const handleImageSelect = (image: ImageFile | null) => {
    console.log('🔄 Image selected for options panel:', {
      id: image?.id,
      name: image?.name,
      status: image?.status,
      hasUrl: !!image?.url,
      hasThumbnail: !!image?.thumbnail,
      url: image?.url,
      thumbnail: image?.thumbnail
    });
    setSelectedImage(image);
    if (image) {
      setInsertOptions(prev => ({
        ...prev,
        altText: image.altText || image.name
      }));
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'gallery', label: 'Gallery', icon: FolderOpen }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div
        className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col rounded-lg overflow-hidden"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme.colors.semantic.border.primary }}
        >
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
              Insert Image
            </h2>
            
            {/* Tab Navigation */}
            <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'upload' | 'gallery')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id ? '' : ''
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id 
                      ? theme.colors.semantic.action.primary 
                      : 'transparent',
                    color: activeTab === tab.id 
                      ? theme.colors.semantic.text.inverse 
                      : theme.colors.semantic.text.primary
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'upload' ? (
              <AdvancedImageUploader
                onImageInsert={handleImageInsert}
                onImageSelect={handleImageSelect}
                maxFiles={maxFiles}
                maxFileSize={maxFileSize}
                className="h-full"
              />
            ) : (
              <ImageGallery
                onImageSelect={handleImageSelect}
                onImageInsert={handleImageInsert}
                className="h-full"
              />
            )}
          </div>

          {/* Insert Options Sidebar */}
          {selectedImage && selectedImage.status === 'success' && (selectedImage.thumbnail || selectedImage.url) && (
            <div 
              className="w-80 border-l p-4 overflow-y-auto"
              style={{ 
                borderColor: theme.colors.semantic.border.primary,
                backgroundColor: theme.colors.semantic.surface.secondary 
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.semantic.text.primary }}>
                Insert Options
              </h3>

              {/* Image Preview */}
              <div className="mb-4">
                <div className="aspect-video rounded-lg overflow-hidden border mb-2" 
                  style={{ borderColor: theme.colors.semantic.border.secondary }}>
                  {(selectedImage.thumbnail || selectedImage.url) ? (
                    <img
                      src={selectedImage.thumbnail || selectedImage.url}
                      alt={selectedImage.altText || selectedImage.name}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log('✅ Preview image loaded successfully')}
                      onError={(e) => {
                        console.error('❌ Preview image failed to load:', {
                          thumbnail: selectedImage.thumbnail,
                          url: selectedImage.url,
                          name: selectedImage.name,
                          error: e
                        });
                      }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
                    >
                      <div className="text-center" style={{ color: theme.colors.semantic.text.secondary }}>
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Loading preview...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                  <div className="font-medium">{selectedImage.name}</div>
                  <div>
                    {selectedImage.dimensions && 
                      `${selectedImage.dimensions.width}×${selectedImage.dimensions.height} • `
                    }
                    {(selectedImage.size / 1024).toFixed(0)}KB
                  </div>
                  {/* Debug info */}
                  <div className="text-xs mt-1 opacity-70">
                    Thumbnail: {selectedImage.thumbnail ? '✓' : '✗'} | URL: {selectedImage.url ? '✓' : '✗'}
                  </div>
                </div>
              </div>

              {/* Alt Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" 
                  style={{ color: theme.colors.semantic.text.primary }}>
                  Alt Text
                </label>
                <input
                  type="text"
                  value={insertOptions.altText}
                  onChange={(e) => setInsertOptions(prev => ({ ...prev, altText: e.target.value }))}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.primary,
                    borderColor: theme.colors.semantic.border.secondary,
                    color: theme.colors.semantic.text.primary
                  }}
                  placeholder="Describe this image..."
                />
              </div>

              {/* Alignment */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" 
                  style={{ color: theme.colors.semantic.text.primary }}>
                  Alignment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['left', 'center', 'right', 'inline'].map(align => (
                    <button
                      key={align}
                      onClick={() => setInsertOptions(prev => ({ 
                        ...prev, 
                        alignment: align as 'left' | 'center' | 'right' | 'inline'
                      }))}
                      className={`px-3 py-2 text-sm rounded border capitalize ${
                        insertOptions.alignment === align ? 'font-medium' : ''
                      }`}
                      style={{
                        backgroundColor: insertOptions.alignment === align 
                          ? theme.colors.semantic.action.primary 
                          : theme.colors.semantic.surface.primary,
                        borderColor: theme.colors.semantic.border.secondary,
                        color: insertOptions.alignment === align 
                          ? theme.colors.semantic.text.inverse 
                          : theme.colors.semantic.text.primary
                      }}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" 
                  style={{ color: theme.colors.semantic.text.primary }}>
                  Size
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {['small', 'medium', 'large', 'custom'].map(size => (
                    <button
                      key={size}
                      onClick={() => setInsertOptions(prev => ({ 
                        ...prev, 
                        size: size as 'small' | 'medium' | 'large' | 'custom'
                      }))}
                      className={`px-3 py-2 text-sm rounded border capitalize ${
                        insertOptions.size === size ? 'font-medium' : ''
                      }`}
                      style={{
                        backgroundColor: insertOptions.size === size 
                          ? theme.colors.semantic.action.primary 
                          : theme.colors.semantic.surface.primary,
                        borderColor: theme.colors.semantic.border.secondary,
                        color: insertOptions.size === size 
                          ? theme.colors.semantic.text.inverse 
                          : theme.colors.semantic.text.primary
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {insertOptions.size === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: theme.colors.semantic.text.secondary }}>
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={insertOptions.customWidth || ''}
                        onChange={(e) => setInsertOptions(prev => ({ 
                          ...prev, 
                          customWidth: parseInt(e.target.value) || undefined 
                        }))}
                        className="w-full px-2 py-1 rounded border text-sm"
                        style={{
                          backgroundColor: theme.colors.semantic.surface.primary,
                          borderColor: theme.colors.semantic.border.secondary,
                          color: theme.colors.semantic.text.primary
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: theme.colors.semantic.text.secondary }}>
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={insertOptions.customHeight || ''}
                        onChange={(e) => setInsertOptions(prev => ({ 
                          ...prev, 
                          customHeight: parseInt(e.target.value) || undefined 
                        }))}
                        className="w-full px-2 py-1 rounded border text-sm"
                        style={{
                          backgroundColor: theme.colors.semantic.surface.primary,
                          borderColor: theme.colors.semantic.border.secondary,
                          color: theme.colors.semantic.text.primary
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" 
                  style={{ color: theme.colors.semantic.text.primary }}>
                  Caption
                </label>
                <textarea
                  value={insertOptions.caption || ''}
                  onChange={(e) => setInsertOptions(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full px-3 py-2 rounded border text-sm resize-none"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.primary,
                    borderColor: theme.colors.semantic.border.secondary,
                    color: theme.colors.semantic.text.primary
                  }}
                  rows={2}
                  placeholder="Optional caption..."
                />
              </div>

              {/* Style Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" 
                  style={{ color: theme.colors.semantic.text.primary }}>
                  Style Options
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: theme.colors.semantic.text.secondary }}>
                      Border Radius: {insertOptions.borderRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={insertOptions.borderRadius}
                      onChange={(e) => setInsertOptions(prev => ({ 
                        ...prev, 
                        borderRadius: parseInt(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={insertOptions.shadow}
                      onChange={(e) => setInsertOptions(prev => ({ 
                        ...prev, 
                        shadow: e.target.checked 
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: theme.colors.semantic.text.primary }}>
                      Add shadow
                    </span>
                  </label>
                </div>
              </div>

              {/* Insert Button */}
              <button
                onClick={() => handleImageInsert(selectedImage, insertOptions)}
                className="w-full px-4 py-2 rounded-md font-medium transition-colors"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary,
                  color: theme.colors.semantic.text.inverse
                }}
              >
                Insert Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}