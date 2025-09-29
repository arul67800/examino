'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { Eye, Download, Edit3, Trash2, Copy, ExternalLink } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function ImagePreview({
  src,
  alt = '',
  width,
  height,
  caption,
  onEdit,
  onDelete,
  onDownload,
  className = ''
}: ImagePreviewProps) {
  const { theme } = useTheme();

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(src);
      // You could add a toast notification here
      console.log('Image URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(src, '_blank');
  };

  return (
    <div className={`relative group inline-block ${className}`}>
      {/* Image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="max-w-full h-auto rounded-lg"
        style={{
          boxShadow: theme.shadows.md
        }}
      />

      {/* Overlay Actions */}
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
        <button
          onClick={onEdit}
          className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          title="Edit Image"
        >
          <Edit3 className="w-4 h-4 text-white" />
        </button>
        
        <button
          onClick={handleCopyUrl}
          className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          title="Copy URL"
        >
          <Copy className="w-4 h-4 text-white" />
        </button>
        
        <button
          onClick={handleOpenInNewTab}
          className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
          title="Open in New Tab"
        >
          <ExternalLink className="w-4 h-4 text-white" />
        </button>
        
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 rounded-full bg-red-500 bg-opacity-70 hover:bg-opacity-90 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div 
          className="mt-2 text-sm italic text-center"
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}