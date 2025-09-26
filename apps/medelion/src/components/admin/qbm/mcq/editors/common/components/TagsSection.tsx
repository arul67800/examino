'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';

interface TagsSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function TagsSection({
  tags,
  onAddTag,
  onRemoveTag
}: TagsSectionProps) {
  const { theme } = useTheme();
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      setNewTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div 
      className="rounded-xl p-6 border-2"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.secondary + '30'
      }}
    >
      <h2 
        className="text-lg font-semibold mb-4"
        style={{ color: theme.colors.semantic.text.primary }}
      >
        Tags (Optional)
      </h2>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
            style={{
              backgroundColor: theme.colors.semantic.status.info + '20',
              color: theme.colors.semantic.status.info
            }}
          >
            <span>{tag}</span>
            <button
              onClick={() => onRemoveTag(tag)}
              className="hover:bg-red-100 rounded-full p-0.5 transition-all"
              style={{ color: theme.colors.semantic.status.error }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a tag..."
          className="flex-1 p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary + '30',
            border: `1px solid ${theme.colors.semantic.border.secondary}40`,
            color: theme.colors.semantic.text.primary
          }}
        />
        <button
          onClick={handleAddTag}
          disabled={!newTag.trim()}
          className="px-4 py-2 rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.colors.semantic.status.info + '15',
            border: `1px solid ${theme.colors.semantic.status.info}40`,
            color: theme.colors.semantic.status.info
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}