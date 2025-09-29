'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '@/theme';
import {
  Upload,
  File,
  FileText,
  Download,
  Trash2,
  Eye,
  Copy,
  Edit,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  X,
  Check,
  AlertCircle,
  Loader,
  Folder,
  Archive,
  Image,
  Video,
  Music,
  FileCode,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import { MediaItem } from '../../types';

interface FileManagerProps {
  files: MediaItem[];
  onFilesChange: (files: MediaItem[]) => void;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  downloadLinks?: MediaItem[];
  onDownloadLinksChange?: (links: MediaItem[]) => void;
}

interface FileCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  types: string[];
  color: string;
}

const fileCategories: FileCategory[] = [
  {
    id: 'documents',
    name: 'Documents',
    icon: <FileText className="w-5 h-5" />,
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    color: '#3b82f6'
  },
  {
    id: 'spreadsheets',
    name: 'Spreadsheets',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    types: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    color: '#10b981'
  },
  {
    id: 'presentations',
    name: 'Presentations',
    icon: <Presentation className="w-5 h-5" />,
    types: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    color: '#f59e0b'
  },
  {
    id: 'images',
    name: 'Images',
    icon: <Image className="w-5 h-5" />,
    types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    color: '#8b5cf6'
  },
  {
    id: 'videos',
    name: 'Videos',
    icon: <Video className="w-5 h-5" />,
    types: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    color: '#ef4444'
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: <Music className="w-5 h-5" />,
    types: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    color: '#f97316'
  },
  {
    id: 'code',
    name: 'Code',
    icon: <FileCode className="w-5 h-5" />,
    types: ['text/javascript', 'text/html', 'text/css', 'application/json'],
    color: '#06b6d4'
  },
  {
    id: 'archives',
    name: 'Archives',
    icon: <Archive className="w-5 h-5" />,
    types: ['application/zip', 'application/x-rar-compressed', 'application/x-tar'],
    color: '#6b7280'
  }
];

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  onFilesChange,
  allowedTypes = ['*'],
  maxFileSize = 50, // 50MB default
  maxFiles = 100,
  downloadLinks = [],
  onDownloadLinksChange
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Get file category
  const getFileCategory = (mimeType: string): FileCategory => {
    return fileCategories.find(cat => 
      cat.types.some(type => mimeType.includes(type))
    ) || {
      id: 'other',
      name: 'Other',
      icon: <File className="w-5 h-5" />,
      types: [],
      color: '#6b7280'
    };
  };

  // Filter and sort files
  const processedFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const category = getFileCategory(file.type || '');
      const matchesCategory = filterCategory === 'all' || category.id === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'date':
          // In real app, you'd have upload date
          comparison = a.id.localeCompare(b.id);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle file upload
  const handleFileUpload = useCallback(async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    // Create media items
    const newFiles: MediaItem[] = validFiles.map(file => ({
      id: Date.now() + Math.random().toString(),
      url: URL.createObjectURL(file), // In real app, this would be the uploaded URL
      type: file.type.startsWith('image/') ? 'image' :
            file.type.startsWith('video/') ? 'video' :
            file.type.startsWith('audio/') ? 'audio' : 'document',
      name: file.name,
      size: file.size,
      caption: '',
      alt: file.name
    }));

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange, maxFileSize, maxFiles]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
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

  // Add download link
  const addDownloadLink = () => {
    if (urlInput.trim() && urlTitle.trim() && onDownloadLinksChange) {
      const newLink: MediaItem = {
        id: Date.now().toString(),
        url: urlInput.trim(),
        type: 'document',
        name: urlTitle.trim(),
        size: 0,
        caption: 'Download link',
        alt: urlTitle.trim()
      };

      onDownloadLinksChange([...(downloadLinks || []), newLink]);
      setUrlInput('');
      setUrlTitle('');
      setShowUrlInput(false);
    }
  };

  // Delete file
  const deleteFile = (id: string) => {
    onFilesChange(files.filter(file => file.id !== id));
    setSelectedFiles(prev => prev.filter(fileId => fileId !== id));
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedFiles(prev => 
      prev.includes(id) 
        ? prev.filter(fileId => fileId !== id)
        : [...prev, id]
    );
  };

  // Select all
  const selectAll = () => {
    setSelectedFiles(processedFiles.map(file => file.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedFiles([]);
  };

  // Delete selected
  const deleteSelected = () => {
    onFilesChange(files.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (file: MediaItem) => {
    const category = getFileCategory(file.type || '');
    return (
      <div style={{ color: category.color }}>
        {category.icon}
      </div>
    );
  };

  // Get file stats
  const getFileStats = () => {
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    const categoryCounts = fileCategories.reduce((acc, cat) => {
      acc[cat.id] = files.filter(file => getFileCategory(file.type || '').id === cat.id).length;
      return acc;
    }, {} as Record<string, number>);

    return { totalSize, categoryCounts };
  };

  const { totalSize, categoryCounts } = getFileStats();

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
            Upload Files
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
            
            {onDownloadLinksChange && (
              <button
                onClick={() => setShowUrlInput(true)}
                className="px-4 py-2 rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  color: theme.colors.semantic.text.primary
                }}
              >
                Add Download Link
              </button>
            )}
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
            Maximum file size: {maxFileSize}MB • Maximum files: {maxFiles}
          </div>
        </div>
      </div>

      {/* Download Link Input */}
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
              Add Download Link
            </h4>
            <button
              onClick={() => setShowUrlInput(false)}
              className="p-1 hover:opacity-70"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
              placeholder="Link title..."
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            />
            <div className="flex space-x-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter download URL..."
                className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
                onKeyPress={(e) => e.key === 'Enter' && addDownloadLink()}
              />
              <button
                onClick={addDownloadLink}
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
        </div>
      )}

      {/* File Statistics */}
      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.primary 
          }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {files.length}
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Total Files
          </div>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.primary 
          }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {formatFileSize(totalSize)}
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Total Size
          </div>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.primary 
          }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {categoryCounts.documents || 0}
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Documents
          </div>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.colors.semantic.surface.secondary,
            borderColor: theme.colors.semantic.border.primary 
          }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            {categoryCounts.images || 0}
          </div>
          <div 
            className="text-sm"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            Images
          </div>
        </div>
      </div>

      {/* File Manager */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: theme.colors.semantic.surface.primary }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0"
          style={{ borderColor: theme.colors.semantic.border.secondary }}
        >
          <h3 
            className="text-lg font-semibold"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            File Library ({processedFiles.length})
          </h3>
          
          <div className="flex flex-wrap items-center gap-3">
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
                placeholder="Search files..."
                className="pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 w-48"
                style={{
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary,
                  color: theme.colors.semantic.text.primary
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border focus:outline-none"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value="all">All Categories</option>
              {fileCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({categoryCounts[cat.id] || 0})
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="px-3 py-2 rounded-lg border focus:outline-none"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                borderColor: theme.colors.semantic.border.primary,
                color: theme.colors.semantic.text.primary
              }}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="size-asc">Size (Small to Large)</option>
              <option value="size-desc">Size (Large to Small)</option>
              <option value="type-asc">Type A-Z</option>
              <option value="type-desc">Type Z-A</option>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
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

        {/* Selection Actions */}
        {selectedFiles.length > 0 && (
          <div 
            className="p-3 border-b flex items-center justify-between"
            style={{ 
              backgroundColor: theme.colors.semantic.surface.tertiary,
              borderColor: theme.colors.semantic.border.secondary 
            }}
          >
            <span 
              className="text-sm"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              {selectedFiles.length} files selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={deleteSelected}
                className="px-3 py-1 rounded-lg text-sm transition-colors duration-200 text-red-600 hover:bg-red-50"
              >
                Delete Selected
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                style={{ color: theme.colors.semantic.text.secondary }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="p-4">
          {processedFiles.length === 0 ? (
            <div 
              className="text-center py-12"
              style={{ color: theme.colors.semantic.text.secondary }}
            >
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No files found</p>
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
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
              {processedFiles.map((file) => (
                <div 
                  key={file.id}
                  className={`group relative border rounded-lg transition-all duration-200 ${
                    selectedFiles.includes(file.id) ? 'ring-2' : ''
                  } ${viewMode === 'list' ? 'flex items-center p-3' : 'p-4'}`}
                  style={{ 
                    backgroundColor: theme.colors.semantic.surface.secondary,
                    borderColor: theme.colors.semantic.border.primary,
                    '--ring-color': theme.colors.semantic.action.primary
                  } as React.CSSProperties}
                >
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleSelection(file.id)}
                    className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 z-10 ${
                      selectedFiles.includes(file.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedFiles.includes(file.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>

                  {viewMode === 'grid' ? (
                    <>
                      {/* File Icon */}
                      <div className="flex items-center justify-center mb-4 pt-4">
                        <div className="w-12 h-12 flex items-center justify-center">
                          {getFileIcon(file)}
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="space-y-2">
                        <div 
                          className="text-sm font-medium truncate"
                          style={{ color: theme.colors.semantic.text.primary }}
                          title={file.name}
                        >
                          {file.name}
                        </div>
                        <div 
                          className="text-xs"
                          style={{ color: theme.colors.semantic.text.secondary }}
                        >
                          {formatFileSize(file.size || 0)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-1">
                            <a
                              href={file.url}
                              download={file.name}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Download"
                              style={{ color: theme.colors.semantic.text.secondary }}
                            >
                              <Download className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => navigator.clipboard.writeText(file.url)}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Copy URL"
                              style={{ color: theme.colors.semantic.text.secondary }}
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteFile(file.id)}
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
                      <div className="flex items-center space-x-4 flex-1 pl-6">
                        <div className="flex-shrink-0">
                          {getFileIcon(file)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div 
                            className="font-medium truncate"
                            style={{ color: theme.colors.semantic.text.primary }}
                          >
                            {file.name}
                          </div>
                          <div 
                            className="text-sm"
                            style={{ color: theme.colors.semantic.text.secondary }}
                          >
                            {formatFileSize(file.size || 0)} • {getFileCategory(file.type || '').name}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <a
                            href={file.url}
                            download={file.name}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Download"
                            style={{ color: theme.colors.semantic.text.secondary }}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => navigator.clipboard.writeText(file.url)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Copy URL"
                            style={{ color: theme.colors.semantic.text.secondary }}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFile(file.id)}
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

      {/* Download Links Section */}
      {downloadLinks && downloadLinks.length > 0 && (
        <div 
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: theme.colors.semantic.surface.primary }}
        >
          <div 
            className="p-4 border-b"
            style={{ borderColor: theme.colors.semantic.border.secondary }}
          >
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Download Links ({downloadLinks.length})
            </h3>
          </div>

          <div className="p-4 space-y-2">
            {downloadLinks.map((link) => (
              <div 
                key={link.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ 
                  backgroundColor: theme.colors.semantic.surface.secondary,
                  borderColor: theme.colors.semantic.border.primary
                }}
              >
                <div className="flex items-center space-x-3">
                  <Download 
                    className="w-5 h-5"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  />
                  <div>
                    <div 
                      className="font-medium"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {link.name}
                    </div>
                    <div 
                      className="text-sm truncate max-w-md"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {link.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(link.url, '_blank')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Open link"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(link.url)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Copy URL"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {onDownloadLinksChange && (
                    <button
                      onClick={() => {
                        const newLinks = downloadLinks.filter(l => l.id !== link.id);
                        onDownloadLinksChange(newLinks);
                      }}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};