'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/theme';
import {
  Search, Filter, Grid, List, SortAsc, SortDesc, Eye,
  Download, Trash2, Edit3, Tag, Calendar, FileType,
  Heart, Share2, Copy, ExternalLink, RefreshCw
} from 'lucide-react';
import { ImageFile, ImageGalleryItem, ImageInsertOptions } from '../types';
import { UploadService } from '../utils/UploadService';

interface ImageGalleryProps {
  onImageSelect?: (image: ImageFile) => void;
  onImageInsert?: (image: ImageFile, options: ImageInsertOptions) => void;
  multiSelect?: boolean;
  className?: string;
}

export function ImageGallery({
  onImageSelect,
  onImageInsert,
  multiSelect = false,
  className = ''
}: ImageGalleryProps) {
  const { theme } = useTheme();
  const [images, setImages] = useState<ImageGalleryItem[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const uploadService = new UploadService({
    maxFileSize: 10 * 1024 * 1024,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 10,
    quality: 0.9,
    enableResize: false,
    generateThumbnails: false,
    thumbnailSize: 150,
    enableWatermark: false
  });

  const loadImages = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const result = await uploadService.getUploadedImages(
        currentPage,
        20,
        searchTerm,
        filterCategory
      );

      const galleryImages: ImageGalleryItem[] = result.images.map(img => ({
        ...img,
        selected: false
      }));

      if (reset) {
        setImages(galleryImages);
        setPage(2);
      } else {
        setImages(prev => [...prev, ...galleryImages]);
        setPage(prev => prev + 1);
      }

      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, filterCategory]);

  useEffect(() => {
    loadImages(true);
  }, [searchTerm, filterCategory, sortBy, sortOrder]);

  const handleImageClick = useCallback((image: ImageGalleryItem) => {
    if (multiSelect) {
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(image.id)) {
          newSet.delete(image.id);
        } else {
          newSet.add(image.id);
        }
        return newSet;
      });
    } else {
      setSelectedImages(new Set([image.id]));
    }
    
    onImageSelect?.(image);
  }, [multiSelect, onImageSelect]);

  const handleImageInsert = useCallback((image: ImageFile) => {
    const defaultOptions: ImageInsertOptions = {
      alignment: 'center',
      size: 'medium',
      altText: image.altText || image.name,
      borderRadius: 0,
      shadow: false,
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    };
    
    onImageInsert?.(image, defaultOptions);
  }, [onImageInsert]);

  const sortedImages = images.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = (a.uploadedAt?.getTime() || 0) - (b.uploadedAt?.getTime() || 0);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredImages = sortedImages.filter(image => {
    const matchesSearch = !searchTerm || 
      image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || image.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.semantic.border.secondary }}>
        <h2 className="text-lg font-semibold" style={{ color: theme.colors.semantic.text.primary }}>
          Image Gallery
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadImages(true)}
            className="p-2 rounded-md hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b space-y-3" style={{ borderColor: theme.colors.semantic.border.secondary }}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
            style={{ color: theme.colors.semantic.text.tertiary }} />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary,
              color: theme.colors.semantic.text.primary
            }}
          />
        </div>

        {/* Filters and View Options */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
              className="px-3 py-1 rounded border text-sm"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
            
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1 rounded border text-sm"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value="">All Categories</option>
              <option value="photos">Photos</option>
              <option value="graphics">Graphics</option>
              <option value="icons">Icons</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'font-medium' : ''}`}
              style={{
                backgroundColor: viewMode === 'grid' 
                  ? theme.colors.semantic.action.primary 
                  : theme.colors.semantic.surface.tertiary,
                color: viewMode === 'grid' 
                  ? theme.colors.semantic.text.inverse 
                  : theme.colors.semantic.text.primary
              }}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'font-medium' : ''}`}
              style={{
                backgroundColor: viewMode === 'list' 
                  ? theme.colors.semantic.action.primary 
                  : theme.colors.semantic.surface.tertiary,
                color: viewMode === 'list' 
                  ? theme.colors.semantic.text.inverse 
                  : theme.colors.semantic.text.primary
              }}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Images Grid/List */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading && images.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin" style={{ color: theme.colors.semantic.text.secondary }} />
            <span className="ml-2" style={{ color: theme.colors.semantic.text.secondary }}>Loading images...</span>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <FileType className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.semantic.text.tertiary }} />
            <p className="text-lg font-medium mb-2" style={{ color: theme.colors.semantic.text.secondary }}>
              No images found
            </p>
            <p className="text-sm" style={{ color: theme.colors.semantic.text.tertiary }}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Upload some images to get started'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedImages.has(image.id) ? 'ring-2' : ''
                    }`}
                    style={{
                      borderColor: selectedImages.has(image.id) 
                        ? theme.colors.semantic.action.primary 
                        : theme.colors.semantic.border.secondary
                    }}
                    onClick={() => handleImageClick(image)}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={image.thumbnail || image.url}
                        alt={image.altText || image.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Preview functionality
                            }}
                            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                          {onImageInsert && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageInsert(image);
                              }}
                              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                              title="Insert"
                            >
                              <Download className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Selection Indicator */}
                      {selectedImages.has(image.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.colors.semantic.action.primary }}
                        >
                          <div className="w-3 h-3 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
                      <div className="text-xs font-medium truncate" style={{ color: theme.colors.semantic.text.primary }}>
                        {image.name}
                      </div>
                      <div className="text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
                        {(image.size / 1024).toFixed(0)}KB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedImages.has(image.id) ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: theme.colors.semantic.surface.secondary,
                      borderColor: selectedImages.has(image.id) 
                        ? theme.colors.semantic.action.primary 
                        : theme.colors.semantic.border.secondary
                    }}
                    onClick={() => handleImageClick(image)}
                  >
                    <img
                      src={image.thumbnail || image.url}
                      alt={image.altText || image.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" style={{ color: theme.colors.semantic.text.primary }}>
                        {image.name}
                      </div>
                      <div className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                        {image.dimensions && `${image.dimensions.width}×${image.dimensions.height} • `}
                        {(image.size / 1024).toFixed(0)}KB
                        {image.uploadedAt && ` • ${image.uploadedAt.toLocaleDateString()}`}
                      </div>
                      {image.tags && image.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {image.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 text-xs rounded"
                              style={{
                                backgroundColor: theme.colors.semantic.surface.tertiary,
                                color: theme.colors.semantic.text.secondary
                              }}
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Preview functionality
                        }}
                        className="p-2 rounded hover:bg-opacity-80 transition-colors"
                        style={{ backgroundColor: theme.colors.semantic.surface.tertiary }}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {onImageInsert && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageInsert(image);
                          }}
                          className="p-2 rounded hover:bg-opacity-80 transition-colors"
                          style={{ backgroundColor: theme.colors.semantic.action.primary, color: theme.colors.semantic.text.inverse }}
                          title="Insert"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && !loading && (
              <div className="text-center mt-6">
                <button
                  onClick={() => loadImages()}
                  className="px-6 py-2 rounded-md font-medium transition-colors"
                  style={{
                    backgroundColor: theme.colors.semantic.action.secondary,
                    color: theme.colors.semantic.text.primary
                  }}
                >
                  Load More
                </button>
              </div>
            )}

            {loading && images.length > 0 && (
              <div className="text-center mt-6">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto" style={{ color: theme.colors.semantic.text.secondary }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected Images Info */}
      {selectedImages.size > 0 && (
        <div className="p-4 border-t" style={{ borderColor: theme.colors.semantic.border.secondary }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
              {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
            </span>
            {onImageInsert && selectedImages.size === 1 && (
              <button
                onClick={() => {
                  const selectedImage = filteredImages.find(img => selectedImages.has(img.id));
                  if (selectedImage) handleImageInsert(selectedImage);
                }}
                className="px-4 py-2 rounded-md font-medium transition-colors"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary,
                  color: theme.colors.semantic.text.inverse
                }}
              >
                Insert Selected
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}