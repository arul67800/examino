'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '@/theme';
import {
  Upload,
  Image,
  Video,
  File,
  Trash2,
  Edit,
  Eye,
  Copy,
  Download,
  Grid,
  List,
  Search,
  Filter,
  Plus,
  X,
  Check,
  AlertCircle,
  Loader,
  Folder,
  FolderOpen
} from 'lucide-react';
import { MediaItem } from '../../types';

interface MediaManagerProps {
  media: MediaItem[];
  onMediaChange: (media: MediaItem[]) => void;
  featuredImage: string;
  onFeaturedImageChange: (url: string) => void;
  gallery: MediaItem[];
  onGalleryChange: (gallery: MediaItem[]) => void;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
}

interface MediaUploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  media,
  onMediaChange,
  featuredImage,
  onFeaturedImageChange,
  gallery,
  onGalleryChange,
  allowedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  maxFileSize = 10, // 10MB default
  maxFiles = 20
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');

  // Filter media based on search and type
  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.caption && item.caption.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        return false;
      }
      return true;
    });

    if (media.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    // Start upload process for each file
    const newUploads: MediaUploadProgress[] = validFiles.map(file => ({
      id: Date.now() + Math.random().toString(),
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newUploads]);

    // Simulate upload process (replace with actual upload logic)
    for (const upload of newUploads) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => 
            prev.map(u => u.id === upload.id ? { ...u, progress } : u)
          );
        }

        // Create media item
        const mediaItem: MediaItem = {
          id: upload.id,
          url: URL.createObjectURL(upload.file), // In real app, this would be the uploaded URL
          type: upload.file.type.startsWith('image/') ? 'image' :
                upload.file.type.startsWith('video/') ? 'video' :
                upload.file.type.startsWith('audio/') ? 'audio' : 'document',
          name: upload.file.name,
          size: upload.file.size,
          caption: '',
          alt: upload.file.name
        };

        // Add to media list
        onMediaChange([...media, mediaItem]);

        // Mark as completed
        setUploadProgress(prev => 
          prev.map(u => u.id === upload.id ? { ...u, status: 'completed' } : u)
        );

      } catch (error) {
        setUploadProgress(prev => 
          prev.map(u => u.id === upload.id ? { 
            ...u, 
            status: 'error', 
            error: 'Upload failed' 
          } : u)
        );
      }
    }

    // Clean up completed uploads after delay
    setTimeout(() => {
      setUploadProgress(prev => prev.filter(u => u.status === 'uploading'));
    }, 2000);
  }, [media, onMediaChange, maxFileSize, maxFiles]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Add media from URL
  const handleAddFromUrl = () => {
    if (urlInput.trim()) {
      const mediaItem: MediaItem = {
        id: Date.now().toString(),
        url: urlInput.trim(),
        type: urlInput.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' :
              urlInput.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' :
              urlInput.match(/\.(mp3|wav|ogg|flac)$/i) ? 'audio' : 'document',
        name: urlInput.split('/').pop() || 'Media file',
        size: 0,
        caption: '',
        alt: ''
      };

      onMediaChange([...media, mediaItem]);
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  // Delete media
  const deleteMedia = (id: string) => {
    onMediaChange(media.filter(item => item.id !== id));
    setSelectedMedia(prev => prev.filter(mediaId => mediaId !== id));
  };

  // Update media caption/alt
  const updateMediaMetadata = (id: string, field: 'caption' | 'alt', value: string) => {
    onMediaChange(media.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Set as featured image
  const setAsFeatured = (url: string) => {
    onFeaturedImageChange(url);
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedMedia(prev => 
      prev.includes(id) 
        ? prev.filter(mediaId => mediaId !== id)
        : [...prev, id]
    );
  };

  // Add to gallery
  const addToGallery = (mediaItem: MediaItem) => {
    if (!gallery.find(item => item.id === mediaItem.id)) {
      onGalleryChange([...gallery, mediaItem]);
    }
  };

  // Remove from gallery
  const removeFromGallery = (id: string) => {
    onGalleryChange(gallery.filter(item => item.id !== id));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <File className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
          isDragOver ? 'border-blue-400 bg-blue-50' : ''
        }`}
        style={{ 
          borderColor: isDragOver ? '#3b82f6' : theme.colors.semantic.border.primary,
          backgroundColor: isDragOver ? '#eff6ff' : theme.colors.semantic.surface.primary
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center">
          <Upload 
            className="w-12 h-12 mx-auto mb-4" 
            style={{ color: theme.colors.semantic.text.secondary }}
          />
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Upload Media Files
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Drag and drop files here, or click to browse
          </p>
          
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              style={{
                backgroundColor: theme.colors.semantic.action.primary,
                color: theme.colors.semantic.text.inverse
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Choose Files</span>
            </button>
            
            <button
              onClick={() => setShowUrlInput(true)}
              className="px-4 py-2 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                color: theme.colors.semantic.text.primary
              }}
            >
              Add from URL
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />

          <div 
            className="text-xs mt-4"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Maximum file size: {maxFileSize}MB • Supported formats: Images, Videos, Audio, Documents
          </div>
        </div>
      </div>

      {/* URL Input Modal */}
      {showUrlInput && (
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.primary
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 
              className="font-medium"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Add Media from URL
            </h4>
            <button
              onClick={() => setShowUrlInput(false)}
              className="p-1 hover:opacity-70"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex space-x-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter media URL..."
              className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFromUrl()}
            />
            <button
              onClick={handleAddFromUrl}
              className="px-4 py-2 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.semantic.action.primary,
                color: theme.colors.semantic.text.inverse
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div 
          className="p-4 rounded-lg space-y-3"
          style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
        >
          <h4 
            className="font-medium"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Upload Progress
          </h4>
          {uploadProgress.map((upload) => (
            <div key={upload.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: theme.colors.semantic.text.primary }}>
                  {upload.file.name}
                </span>
                <div className="flex items-center space-x-2">
                  {upload.status === 'uploading' && (
                    <Loader className="w-4 h-4 animate-spin" />
                  )}
                  {upload.status === 'completed' && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>{upload.progress}%</span>
                </div>
              </div>
              <div 
                className="w-full bg-gray-200 rounded-full h-2"
                style={{ backgroundColor: theme.colors.semantic.surface.primary }}
              >
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${upload.progress}%`,
                    backgroundColor: upload.status === 'error' ? '#ef4444' : 
                                   upload.status === 'completed' ? '#10b981' : 
                                   theme.colors.semantic.action.primary
                  }}
                />
              </div>
              {upload.error && (
                <div className="text-xs text-red-500">{upload.error}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Library */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.colors.semantic.border.secondary }}
        >
          <h3 
            className="text-lg font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            Media Library ({filteredMedia.length})
          </h3>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search 
                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: theme.colors.semantic.text.secondary }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search media..."
                className="pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 w-48"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 rounded-lg border focus:outline-none"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>

            {/* View Mode */}
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: theme.colors.semantic.border.primary }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : ''}`}
                style={{ 
                  backgroundColor: viewMode === 'grid' ? theme.colors.semantic.action.primary : 'transparent',
                  color: viewMode === 'grid' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                }}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : ''}`}
                style={{ 
                  backgroundColor: viewMode === 'list' ? theme.colors.semantic.action.primary : 'transparent',
                  color: viewMode === 'list' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary
                }}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        <div className="p-4">
          {filteredMedia.length === 0 ? (
            <div 
              className="text-center py-12"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No media files found</p>
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
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>
              {filteredMedia.map((item) => (
                <div 
                  key={item.id}
                  className={`group relative rounded-lg border transition-all duration-200 ${
                    selectedMedia.includes(item.id) ? 'ring-2' : ''
                  } ${viewMode === 'list' ? 'flex items-center p-3' : 'p-3'}`}
                  style={{ 
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    borderColor: theme.colors.semantic.border.primary,
                    '--ring-color': theme.colors.semantic.action.primary
                  } as React.CSSProperties}
                >
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleSelection(item.id)}
                    className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedMedia.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {selectedMedia.includes(item.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>

                  {viewMode === 'grid' ? (
                    <>
                      {/* Media Preview */}
                      <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={item.alt || item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: theme.colors.semantic.surface.primary }}
                          >
                            {getFileIcon(item.type)}
                          </div>
                        )}
                      </div>

                      {/* Media Info */}
                      <div className="space-y-2">
                        <div 
                          className="text-sm font-medium truncate"
                          style={{ color: theme.colors.semantic.text.primary }}
                          title={item.name}
                        >
                          {item.name}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: theme.colors.semantic.text.secondary }}
                        >
                          {formatFileSize(item.size)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setAsFeatured(item.url)}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Set as featured"
                              style={{ 
                                color: featuredImage === item.url ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => addToGallery(item)}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Add to gallery"
                              style={{ 
                                color: gallery.find(g => g.id === item.id) ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                              }}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(item.url)}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Copy URL"
                              style={{ color: theme.colors.semantic.text.secondary }}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteMedia(item.id)}
                              className="p-1 rounded hover:bg-red-100 transition-colors text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: theme.colors.semantic.surface.primary }}
                        >
                          {item.type === 'image' ? (
                            <img 
                              src={item.url} 
                              alt={item.alt || item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            getFileIcon(item.type)
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-medium truncate"
                            style={{ color: theme.colors.semantic.text.primary }}
                          >
                            {item.name}
                          </div>
                          <div 
                            className="text-sm"
                            style={{ color: theme.colors.semantic.text.secondary }}
                          >
                            {formatFileSize(item.size)} • {item.type}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setAsFeatured(item.url)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Set as featured"
                            style={{ 
                              color: featuredImage === item.url ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => addToGallery(item)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Add to gallery"
                            style={{ 
                              color: gallery.find(g => g.id === item.id) ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(item.url)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Copy URL"
                            style={{ color: theme.colors.semantic.text.secondary }}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMedia(item.id)}
                            className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};