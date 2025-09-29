'use client';

import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { ImageIcon, Upload, Link } from 'lucide-react';
import { useTheme } from '../../../../../../theme/context';

interface ImageDialogProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageDialog: React.FC<ImageDialogProps> = ({ editor, isOpen, onClose }) => {
  const { theme } = useTheme();
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) return;

    editor.chain().focus().setImage({
      src: imageUrl,
      alt: altText,
    }).run();

    setImageUrl('');
    setAltText('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a data URL for preview (in a real app, you'd upload to a server)
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
      setAltText(file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 rounded-lg shadow-xl border z-50"
        style={{
          backgroundColor: theme.colors.semantic.surface.elevated,
          borderColor: theme.colors.semantic.border.secondary,
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon size={20} style={{ color: theme.colors.semantic.text.primary }} />
            <h3 
              className="text-lg font-semibold"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Insert Image
            </h3>
          </div>

          {/* Upload Mode Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setUploadMode('url')}
              className={`px-3 py-1 text-sm rounded transition-colors ${uploadMode === 'url' ? 'font-medium' : ''}`}
              style={{
                backgroundColor: uploadMode === 'url' ? theme.colors.semantic.action.primary : 'transparent',
                color: uploadMode === 'url' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary,
              }}
            >
              <Link size={14} className="inline mr-1" />
              URL
            </button>
            <button
              onClick={() => setUploadMode('upload')}
              className={`px-3 py-1 text-sm rounded transition-colors ${uploadMode === 'upload' ? 'font-medium' : ''}`}
              style={{
                backgroundColor: uploadMode === 'upload' ? theme.colors.semantic.action.primary : 'transparent',
                color: uploadMode === 'upload' ? theme.colors.semantic.text.inverse : theme.colors.semantic.text.primary,
              }}
            >
              <Upload size={14} className="inline mr-1" />
              Upload
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {uploadMode === 'url' ? (
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.primary,
                    borderColor: theme.colors.semantic.border.secondary,
                    color: theme.colors.semantic.text.primary,
                  }}
                  required
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.colors.semantic.text.primary }}
                >
                  Upload Image
                </label>
                <div 
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: theme.colors.semantic.border.secondary,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} className="mx-auto mb-2" style={{ color: theme.colors.semantic.text.secondary }} />
                  <p style={{ color: theme.colors.semantic.text.secondary }}>
                    Click to select an image
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-w-full h-32 object-contain mx-auto rounded"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.semantic.text.primary }}
              >
                Alt Text (for accessibility)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: theme.colors.semantic.surface.primary,
                  borderColor: theme.colors.semantic.border.secondary,
                  color: theme.colors.semantic.text.primary,
                }}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={!imageUrl}
                className="flex-1 px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: theme.colors.semantic.action.primary,
                  color: theme.colors.semantic.text.inverse,
                }}
              >
                Insert Image
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md transition-colors border"
                style={{
                  borderColor: theme.colors.semantic.border.secondary,
                  color: theme.colors.semantic.text.secondary,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};