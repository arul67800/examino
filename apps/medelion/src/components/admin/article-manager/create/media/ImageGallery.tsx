'use client';

import React, { useState, useRef } from 'react';
import { useTheme } from '@/theme';
import {
  Image,
  Grid,
  List,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Move,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { MediaItem } from '../../types';

interface ImageGalleryProps {
  gallery: MediaItem[];
  onGalleryChange: (gallery: MediaItem[]) => void;
  allMedia: MediaItem[];
  onAddMedia: (media: MediaItem) => void;
  onRemoveMedia: (id: string) => void;
  maxImages?: number;
}

interface GallerySettings {
  layout: 'grid' | 'masonry' | 'carousel' | 'justified';
  columns: number;
  spacing: number;
  showCaptions: boolean;
  showThumbnails: boolean;
  lightbox: boolean;
  autoplay: boolean;
  transitionEffect: 'fade' | 'slide' | 'zoom';
  aspectRatio: 'original' | 'square' | '16:9' | '4:3';
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  gallery,
  onGalleryChange,
  allMedia,
  onAddMedia,
  onRemoveMedia,
  maxImages = 50
}) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<GallerySettings>({
    layout: 'grid',
    columns: 3,
    spacing: 16,
    showCaptions: true,
    showThumbnails: true,
    lightbox: true,
    autoplay: false,
    transitionEffect: 'fade',
    aspectRatio: 'original'
  });

  // Filter available media (only images)
  const availableImages = allMedia.filter(item => 
    item.type === 'image' && 
    !gallery.find(g => g.id === item.id) &&
    (searchTerm === '' || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Move item in gallery
  const moveItem = (fromIndex: number, toIndex: number) => {
    const newGallery = [...gallery];
    const [movedItem] = newGallery.splice(fromIndex, 1);
    newGallery.splice(toIndex, 0, movedItem);
    onGalleryChange(newGallery);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, id: string, index: number) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', id);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      moveItem(dragIndex, dropIndex);
    }
    
    setDraggedItem(null);
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(imageId => imageId !== id)
        : [...prev, id]
    );
  };

  // Select all
  const selectAll = () => {
    setSelectedImages(gallery.map(item => item.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedImages([]);
  };

  // Delete selected
  const deleteSelected = () => {
    const newGallery = gallery.filter(item => !selectedImages.includes(item.id));
    onGalleryChange(newGallery);
    setSelectedImages([]);
  };

  // Update image metadata
  const updateImageMetadata = (id: string, field: 'caption' | 'alt', value: string) => {
    const newGallery = gallery.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onGalleryChange(newGallery);
  };

  // Get grid style based on settings
  const getGridStyle = () => {
    const styles: React.CSSProperties = {
      gap: `${settings.spacing}px`
    };

    switch (settings.layout) {
      case 'grid':
        styles.display = 'grid';
        styles.gridTemplateColumns = `repeat(${settings.columns}, 1fr)`;
        break;
      case 'masonry':
        styles.columnCount = settings.columns;
        styles.columnGap = `${settings.spacing}px`;
        break;
      case 'justified':
        styles.display = 'flex';
        styles.flexWrap = 'wrap';
        styles.justifyContent = 'space-between';
        break;
      default:
        styles.display = 'grid';
        styles.gridTemplateColumns = `repeat(${settings.columns}, 1fr)`;
    }

    return styles;
  };

  // Get image style based on aspect ratio
  const getImageStyle = () => {
    const styles: React.CSSProperties = {};

    switch (settings.aspectRatio) {
      case 'square':
        styles.aspectRatio = '1/1';
        break;
      case '16:9':
        styles.aspectRatio = '16/9';
        break;
      case '4:3':
        styles.aspectRatio = '4/3';
        break;
      default:
        styles.height = 'auto';
    }

    return styles;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 
            className="text-lg font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Image Gallery ({gallery.length})
          </h3>
          <p 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Manage your article's image gallery
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: theme.colors.semantic.border.primary }}>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'edit' ? 'bg-blue-500 text-white' : ''}`}
              style={{ 
                backgroundColor: viewMode === 'edit' ? theme.colors.semantic.action.primary : 'transparent',
                color: viewMode === 'edit' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
              }}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'preview' ? 'bg-blue-500 text-white' : ''}`}
              style={{ 
                backgroundColor: viewMode === 'preview' ? theme.colors.semantic.action.primary : 'transparent',
                color: viewMode === 'preview' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
              }}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowMediaSelector(true)}
            className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Images</span>
          </button>
        </div>
      </div>

      {/* Gallery Settings */}
      <div 
        className="p-4 rounded-lg border space-y-4"
        style={{ 
          backgroundColor: theme.colors.semantic.surface.secondary,
          borderColor: theme.colors.semantic.border.primary 
        }}
      >
        <h4 
          className="font-medium"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Gallery Settings
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Layout */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Layout
            </label>
            <select
              value={settings.layout}
              onChange={(e) => setSettings(prev => ({ ...prev, layout: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value="grid">Grid</option>
              <option value="masonry">Masonry</option>
              <option value="carousel">Carousel</option>
              <option value="justified">Justified</option>
            </select>
          </div>

          {/* Columns */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Columns
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.columns}
              onChange={(e) => setSettings(prev => ({ ...prev, columns: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-xs text-center mt-1">{settings.columns}</div>
          </div>

          {/* Spacing */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Spacing (px)
            </label>
            <input
              type="range"
              min="0"
              max="32"
              value={settings.spacing}
              onChange={(e) => setSettings(prev => ({ ...prev, spacing: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-xs text-center mt-1">{settings.spacing}px</div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Aspect Ratio
            </label>
            <select
              value={settings.aspectRatio}
              onChange={(e) => setSettings(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value="original">Original</option>
              <option value="square">Square (1:1)</option>
              <option value="16:9">Widescreen (16:9)</option>
              <option value="4:3">Standard (4:3)</option>
            </select>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showCaptions}
              onChange={(e) => setSettings(prev => ({ ...prev, showCaptions: e.target.checked }))}
              className="rounded"
            />
            <span 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Show Captions
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showThumbnails}
              onChange={(e) => setSettings(prev => ({ ...prev, showThumbnails: e.target.checked }))}
              className="rounded"
            />
            <span 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Show Thumbnails
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.lightbox}
              onChange={(e) => setSettings(prev => ({ ...prev, lightbox: e.target.checked }))}
              className="rounded"
            />
            <span 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Lightbox
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.autoplay}
              onChange={(e) => setSettings(prev => ({ ...prev, autoplay: e.target.checked }))}
              className="rounded"
            />
            <span 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Autoplay
            </span>
          </label>
        </div>
      </div>

      {/* Selection Actions */}
      {selectedImages.length > 0 && (
        <div 
          className="p-3 rounded-lg border flex items-center justify-between"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.tertiary,
            borderColor: theme.colors.semantic.border.secondary 
          }}
        >
          <span 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {selectedImages.length} images selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={deleteSelected}
              className="px-3 py-1 rounded-lg text-sm transition-colors duration-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 rounded-lg text-sm transition-colors duration-200"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {gallery.length === 0 ? (
        <div 
          className="text-center py-12 border-2 border-dashed rounded-lg"
          style={{ 
            borderColor: theme.colors.semantic.border.primary,
            backgroundColor: theme.colors.semantic.surface.secondary 
          }}
        >
          <Image 
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            style={{ color: theme.colors.semantic.text.secondary }}
          />
          <p 
            className="text-lg mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            No images in gallery
          </p>
          <p 
            className="text-sm mb-4"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Add images to create your gallery
          </p>
          <button
            onClick={() => setShowMediaSelector(true)}
            className="px-4 py-2 rounded-lg transition-colors duration-200"
            style={{
              backgroundColor: theme.colors.semantic.action.primary,
              color: theme.colors.semantic.text.inverse
            }}
          >
            Add Images
          </button>
        </div>
      ) : (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary 
          }}
        >
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: theme.colors.semantic.border.secondary }}
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={selectAll}
                className="text-sm hover:underline"
                style={{ color: theme.colors.semantic.action.primary }}
              >
                Select All
              </button>
              <span 
                className="text-sm"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                |
              </span>
              <button
                onClick={clearSelection}
                className="text-sm hover:underline"
                style={{ color: theme.colors.semantic.action.primary }}
              >
                Clear Selection
              </button>
            </div>
          </div>

          <div className="p-4">
            <div style={getGridStyle()}>
              {gallery.map((item, index) => (
                <div 
                  key={item.id}
                  className={`group relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImages.includes(item.id) ? 'border-blue-500' : 'border-transparent'
                  } ${draggedItem === item.id ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
                  draggable={viewMode === 'edit'}
                  onDragStart={(e) => handleDragStart(e, item.id, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Selection Checkbox */}
                  {viewMode === 'edit' && (
                    <button
                      onClick={() => toggleSelection(item.id)}
                      className="absolute top-2 left-2 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-all duration-200 z-10"
                      style={{ 
                        borderColor: selectedImages.includes(item.id) ? theme.colors.semantic.action.primary : '#d1d5db',
                        backgroundColor: selectedImages.includes(item.id) ? theme.colors.semantic.action.primary : 'white'
                      }}
                    >
                      {selectedImages.includes(item.id) && (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </button>
                  )}

                  {/* Image */}
                  <div className="relative">
                    <img 
                      src={item.url} 
                      alt={item.alt || item.name}
                      className="w-full object-cover"
                      style={getImageStyle()}
                    />
                    
                    {/* Overlay Actions */}
                    {viewMode === 'edit' && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const newIndex = Math.max(0, index - 1);
                              moveItem(index, newIndex);
                            }}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const newIndex = Math.min(gallery.length - 1, index + 1);
                              moveItem(index, newIndex);
                            }}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                            disabled={index === gallery.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRemoveMedia(item.id)}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  {settings.showCaptions && (
                    <div className="p-3">
                      {viewMode === 'edit' ? (
                        <textarea
                          value={item.caption || ''}
                          onChange={(e) => updateImageMetadata(item.id, 'caption', e.target.value)}
                          placeholder="Add caption..."
                          className="w-full text-sm border-none resize-none focus:outline-none bg-transparent"
                          style={{ color: theme.colors.semantic.text.primary }}
                          rows={2}
                        />
                      ) : (
                        <p 
                          className="text-sm"
                          style={{ color: theme.colors.semantic.text.primary }}
                        >
                          {item.caption || 'No caption'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Selector Modal */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
            style={{ backgroundColor: theme.colors.semantic.surface.primary }}
          >
            <div 
              className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: theme.colors.semantic.border.secondary }}
            >
              <h3 
                className="text-xl font-semibold"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Select Images for Gallery
              </h3>
              <button
                onClick={() => setShowMediaSelector(false)}
                className="p-2 hover:opacity-70"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search 
                    className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search images..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary,
                      borderColor: theme.colors.semantic.border.primary,
                      color: theme.colors.semantic.text.primary
                    }}
                  />
                </div>
              </div>

              {/* Available Images */}
              <div className="max-h-96 overflow-y-auto">
                {availableImages.length === 0 ? (
                  <div 
                    className="text-center py-8"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No images available</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-sm mt-2 hover:underline"
                        style={{ color: theme.colors.semantic.action.primary }}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {availableImages.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onAddMedia(item);
                          setShowMediaSelector(false);
                        }}
                        className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200"
                        style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
                      >
                        <img 
                          src={item.url} 
                          alt={item.alt || item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div 
                          className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent"
                        >
                          <p className="text-white text-xs truncate">{item.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};