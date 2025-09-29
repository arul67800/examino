'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/theme';
import {
  Upload, Image as ImageIcon, Link, Camera, FolderOpen, X, 
  Check, AlertCircle, RefreshCw, Eye, Settings, Trash2,
  Download, Copy, Edit3, ZoomIn, RotateCw, Crop
} from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';
import { ImageFile, ImageUploadMode, ImageInsertOptions } from '../types';

interface AdvancedImageUploaderProps {
  onImageInsert?: (image: ImageFile, options: ImageInsertOptions) => void;
  onImageSelect?: (image: ImageFile | null) => void;
  mode?: ImageUploadMode;
  maxFiles?: number;
  maxFileSize?: number;
  className?: string;
}

export function AdvancedImageUploader({
  onImageInsert,
  onImageSelect,
  mode = 'multiple',
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024,
  className = ''
}: AdvancedImageUploaderProps) {
  const { theme } = useTheme();
  const [currentMode, setCurrentMode] = useState<ImageUploadMode>(mode);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const {
    images,
    isUploading,
    totalProgress,
    stats,
    addFiles,
    uploadAll,
    removeImage,
    clearAll,
    retryUpload,
    openFileDialog,
    fileInputRef,
    handleFileInputChange
  } = useImageUpload({
    maxFiles,
    maxFileSize,
    enableResize: true,
    maxWidth: 1920,
    maxHeight: 1080,
    generateThumbnails: true
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) return;
    
    setIsLoadingUrl(true);
    try {
      // Create a temporary image to validate URL
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = urlInput;
      });

      // Create mock file from URL
      const response = await fetch(urlInput);
      const blob = await response.blob();
      const fileName = urlInput.split('/').pop() || 'image.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      await addFiles([file]);
      setUrlInput('');
    } catch (error) {
      console.error('Failed to load image from URL:', error);
      alert('Failed to load image from URL. Please check the URL and try again.');
    } finally {
      setIsLoadingUrl(false);
    }
  }, [urlInput, addFiles]);

  const handleImageSelect = useCallback((image: ImageFile) => {
    setSelectedImage(image);
    onImageSelect?.(image);
  }, [onImageSelect]);

  // Auto-select first successful upload for better UX
  useEffect(() => {
    const firstSuccessful = images.find(img => 
      img.status === 'success' && 
      (img.thumbnail || img.url) && 
      img.file instanceof File
    );
    
    console.log('🔍 Auto-selection check:', {
      totalImages: images.length,
      successfulImages: images.filter(img => img.status === 'success').length,
      firstSuccessful: firstSuccessful ? {
        id: firstSuccessful.id,
        name: firstSuccessful.name,
        status: firstSuccessful.status,
        hasUrl: !!firstSuccessful.url,
        hasThumbnail: !!firstSuccessful.thumbnail,
        hasValidFile: firstSuccessful.file instanceof File
      } : null,
      currentlySelected: !!selectedImage
    });
    
    if (firstSuccessful && !selectedImage) {
      console.log('🎯 Auto-selecting first successful image with valid data');
      handleImageSelect(firstSuccessful);
    }
  }, [images, selectedImage, handleImageSelect]);



  const modeButtons = [
    { mode: 'single' as const, label: 'Single', icon: ImageIcon },
    { mode: 'multiple' as const, label: 'Multiple', icon: Upload },
    { mode: 'url' as const, label: 'URL', icon: Link },
    { mode: 'gallery' as const, label: 'Gallery', icon: FolderOpen },
    { mode: 'camera' as const, label: 'Camera', icon: Camera }
  ];

  const containerStyle = {
    backgroundColor: theme.colors.semantic.surface.primary,
    borderColor: theme.colors.semantic.border.primary,
    borderRadius: theme.borderRadius.lg,
  };

  const dropZoneStyle = {
    backgroundColor: theme.colors.semantic.surface.secondary,
    borderColor: theme.colors.semantic.border.secondary,
    borderStyle: 'dashed',
    borderWidth: '2px',
    borderRadius: theme.borderRadius.md,
  };

  return (
    <div className={`p-6 border rounded-lg ${className}`} style={containerStyle}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
          Advanced Image Upload
        </h2>
        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <button
              onClick={clearAll}
              className="p-2 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            className="p-2 rounded-md hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {modeButtons.map(({ mode: btnMode, label, icon: Icon }) => (
          <button
            key={btnMode}
            onClick={() => setCurrentMode(btnMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
              currentMode === btnMode ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: currentMode === btnMode 
                ? theme.colors.semantic.action.primary 
                : theme.colors.semantic.surface.tertiary,
              color: currentMode === btnMode 
                ? theme.colors.semantic.text.inverse 
                : theme.colors.semantic.text.primary
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Upload Interface */}
      {currentMode === 'url' ? (
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter image URL..."
              className="flex-1 px-3 py-2 rounded-md border"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary,
                color: theme.colors.semantic.text.primary
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || isLoadingUrl}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.semantic.action.primary,
                color: theme.colors.semantic.text.inverse
              }}
            >
              {isLoadingUrl ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Load'}
            </button>
          </div>
        </div>
      ) : (
        <div
          className="p-8 text-center cursor-pointer transition-colors mb-6"
          style={dropZoneStyle}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFileDialog}
        >
          <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.semantic.text.secondary }} />
          <p className="text-lg font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>
            Drop files here or click to upload
          </p>
          <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
            Supports JPG, PNG, GIF, WebP up to {(maxFileSize / (1024 * 1024)).toFixed(0)}MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple={currentMode === 'multiple'}
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: theme.colors.semantic.text.primary }}>
              Uploading...
            </span>
            <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
              {totalProgress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                backgroundColor: theme.colors.semantic.action.primary,
                width: `${totalProgress}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Statistics */}
      {images.length > 0 && (
        <div className="flex items-center gap-4 mb-6 text-sm">
          <span style={{ color: theme.colors.semantic.text.secondary }}>
            Total: {stats.total}
          </span>
          {stats.pending > 0 && (
            <span style={{ color: theme.colors.semantic.status.warning }}>
              Pending: {stats.pending}
            </span>
          )}
          {stats.uploading > 0 && (
            <span style={{ color: theme.colors.semantic.action.primary }}>
              Uploading: {stats.uploading}
            </span>
          )}
          {stats.success > 0 && (
            <span style={{ color: theme.colors.semantic.status.success }}>
              Success: {stats.success}
            </span>
          )}
          {stats.error > 0 && (
            <span style={{ color: theme.colors.semantic.status.error }}>
              Error: {stats.error}
            </span>
          )}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border"
              style={{ borderColor: theme.colors.semantic.border.secondary }}
            >
              {/* Image Thumbnail */}
              <div className="aspect-square relative">
                <img
                  src={image.thumbnail || image.url}
                  alt={image.altText || image.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Status Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.status === 'uploading' && (
                    <div className="text-center text-white">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-1" />
                      <div className="text-xs">{image.uploadProgress}%</div>
                    </div>
                  )}
                  
                  {image.status === 'success' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleImageSelect(image)}
                        className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                        title="Select for Options"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                  
                  {image.status === 'error' && (
                    <div className="text-center text-white">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                      <button
                        onClick={() => retryUpload(image.id)}
                        className="text-xs underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="absolute top-2 right-2">
                  {image.status === 'success' && (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {image.status === 'error' && (
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {image.status === 'uploading' && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <RefreshCw className="w-3 h-3 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Image Info */}
              <div className="p-2" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
                <div className="text-xs font-medium truncate" style={{ color: theme.colors.semantic.text.primary }}>
                  {image.name}
                </div>
                <div className="text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
                  {image.dimensions && `${image.dimensions.width}×${image.dimensions.height}`}
                  {image.dimensions && ' • '}
                  {(image.size / 1024).toFixed(0)}KB
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {images.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={uploadAll}
            disabled={stats.pending === 0 || isUploading}
            className="flex-1 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            Upload All ({stats.pending})
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-md font-medium transition-colors"
            style={{
              backgroundColor: theme.colors.semantic.surface.tertiary,
              color: theme.colors.semantic.text.primary
            }}
          >
            Clear All
          </button>
        </div>
      )}


    </div>
  );
}