'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/theme';

// Types for tag management
export interface TagCategory {
  sources: string[];
  exams: string[];
}

interface PersistentTag {
  id: string;
  name: string;
  category: 'sources' | 'exams';
  createdAt: string;
  usageCount: number;
}

// Local storage key for persistent tags
const PERSISTENT_TAGS_KEY = 'mcq_persistent_tags';
const HIDDEN_PRESETS_KEY = 'mcq_hidden_preset_tags';

// Tag management service
export class TagService {
  static getPersistentTags(): PersistentTag[] {
    try {
      const stored = localStorage.getItem(PERSISTENT_TAGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getHiddenPresetTags(): Record<string, string[]> {
    try {
      const stored = localStorage.getItem(HIDDEN_PRESETS_KEY);
      return stored ? JSON.parse(stored) : { sources: [], exams: [] };
    } catch {
      return { sources: [], exams: [] };
    }
  }

  static hidePresetTag(tagName: string, category: 'sources' | 'exams'): void {
    const hidden = this.getHiddenPresetTags();
    if (!hidden[category].includes(tagName)) {
      hidden[category].push(tagName);
      localStorage.setItem(HIDDEN_PRESETS_KEY, JSON.stringify(hidden));
    }
  }

  static savePersistentTags(tags: PersistentTag[]): void {
    try {
      localStorage.setItem(PERSISTENT_TAGS_KEY, JSON.stringify(tags));
    } catch (error) {
      console.error('Failed to save persistent tags:', error);
    }
  }

  static addPersistentTag(name: string, category: 'sources' | 'exams'): PersistentTag {
    const tags = this.getPersistentTags();
    const newTag: PersistentTag = {
      id: `${category}_${Date.now()}`,
      name: name.trim(),
      category,
      createdAt: new Date().toISOString(),
      usageCount: 1
    };
    
    const existingIndex = tags.findIndex(t => t.name === newTag.name && t.category === category);
    if (existingIndex >= 0) {
      tags[existingIndex].usageCount++;
      this.savePersistentTags(tags);
      return tags[existingIndex];
    } else {
      tags.push(newTag);
      this.savePersistentTags(tags);
      return newTag;
    }
  }

  static getTagsByCategory(category: 'sources' | 'exams'): PersistentTag[] {
    const allTags = this.getPersistentTags();
    const filteredTags = allTags.filter(tag => tag.category === category);
    return filteredTags.sort((a, b) => b.usageCount - a.usageCount);
  }

  // Predefined preset tags for each category
  static getPresetTags(category: 'sources' | 'exams'): string[] {
    const hiddenTags = this.getHiddenPresetTags();
    const presets = {
      sources: [
        'Textbook',
        'NCERT',
        'Reference Book',
        'Study Guide',
        'Online Course',
        'Video Lecture',
        'Research Paper',
        'Academic Journal',
        'Reference Material',
        'Online Resource'
      ],
      exams: [
        'JEE Main',
        'JEE Advanced', 
        'NEET',
        'Board Exam',
        'CBSE',
        'ICSE',
        'State Board',
        'Competitive Exam',
        'Mock Test',
        'Practice Test'
      ]
    };
    
    // Filter out hidden preset tags
    const categoryTags = presets[category] || [];
    const hiddenForCategory = hiddenTags[category] || [];
    return categoryTags.filter(tag => !hiddenForCategory.includes(tag));
  }

  static deletePersistentTag(id: string): void {
    const tags = this.getPersistentTags().filter(tag => tag.id !== id);
    this.savePersistentTags(tags);
  }
}

interface TagInputWithSuggestionsProps {
  category: 'sources' | 'exams';
  placeholder: string;
  selectedTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

function TagInputWithSuggestions({
  category,
  placeholder,
  selectedTags,
  onAddTag,
  onRemoveTag
}: TagInputWithSuggestionsProps) {
  const { theme } = useTheme();
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [persistentTags, setPersistentTags] = useState<PersistentTag[]>([]);
  const [presetTags, setPresetTags] = useState<string[]>([]);

  useEffect(() => {
    setPersistentTags(TagService.getTagsByCategory(category));
    setPresetTags(TagService.getPresetTags(category));
  }, [category]);

  const handleAddTag = (tagName: string = newTag) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      TagService.addPersistentTag(trimmedTag, category);
      setPersistentTags(TagService.getTagsByCategory(category));
      setNewTag('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Filter persistent tags (user-created)
  const filteredPersistentTags = persistentTags.filter(
    tag => 
      tag.name.toLowerCase().includes(newTag.toLowerCase()) &&
      !selectedTags.includes(tag.name)
  );

  // Filter preset tags
  const filteredPresetTags = presetTags.filter(
    tag => 
      tag.toLowerCase().includes(newTag.toLowerCase()) &&
      !selectedTags.includes(tag) &&
      !persistentTags.some(pTag => pTag.name === tag) // Don't show presets that are already in persistent
  );

  const handleDeletePersistentTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    TagService.deletePersistentTag(tagId);
    setPersistentTags(TagService.getTagsByCategory(category));
  };

  const handleDeletePresetTag = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Hide the preset tag from suggestions
    TagService.hidePresetTag(tagName, category);
    setPresetTags(TagService.getPresetTags(category));
    
    // Also remove from persistent tags if it exists there
    const existingTag = persistentTags.find(tag => tag.name === tagName);
    if (existingTag) {
      TagService.deletePersistentTag(existingTag.id);
      setPersistentTags(TagService.getTagsByCategory(category));
    }
  };

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2"
            style={{
              backgroundColor: category === 'sources' 
                ? theme.colors.semantic.status.success + '20'
                : theme.colors.semantic.status.warning + '20',
              color: category === 'sources'
                ? theme.colors.semantic.status.success
                : theme.colors.semantic.status.warning
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

      {/* Common Tags - Always visible */}
      <div className="mb-4">
        <div className="text-xs mb-2 font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
          Common Tags:
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Show most used persistent tags first (top 3) */}
          {persistentTags.slice(0, 3).map((tag) => 
            !selectedTags.includes(tag.name) ? (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag.name)}
                className="px-3 py-1 text-sm rounded-full transition-all hover:opacity-80 flex items-center space-x-1"
                style={{
                  backgroundColor: category === 'sources'
                    ? theme.colors.semantic.status.success + '15'
                    : theme.colors.semantic.status.warning + '15',
                  border: `1px solid ${category === 'sources'
                    ? theme.colors.semantic.status.success + '40'
                    : theme.colors.semantic.status.warning + '40'
                  }`,
                  color: category === 'sources'
                    ? theme.colors.semantic.status.success
                    : theme.colors.semantic.status.warning
                }}
              >
                <span>{tag.name}</span>
                <span 
                  className="text-xs px-1 rounded"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    fontSize: '10px'
                  }}
                >
                  {tag.usageCount}
                </span>
              </button>
            ) : null
          )}
          
          {/* Show top preset tags */}
          {presetTags.slice(0, 6).map((tag) => 
            !selectedTags.includes(tag) && !persistentTags.some(pTag => pTag.name === tag) ? (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="px-3 py-1 text-sm rounded-full transition-all hover:opacity-80"
                style={{
                  backgroundColor: category === 'sources'
                    ? theme.colors.semantic.status.success + '10'
                    : theme.colors.semantic.status.warning + '10',
                  border: `1px solid ${category === 'sources'
                    ? theme.colors.semantic.status.success + '30'
                    : theme.colors.semantic.status.warning + '30'
                  }`,
                  color: category === 'sources'
                    ? theme.colors.semantic.status.success
                    : theme.colors.semantic.status.warning
                }}
              >
                {tag}
              </button>
            ) : null
          )}
        </div>
      </div>
      
      <div className="flex space-x-2 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder={`${placeholder} (Press Enter to add)`}
            className="w-full p-2 rounded focus:ring-2 focus:ring-offset-1 transition-all"
            style={{
              backgroundColor: theme.colors.semantic.surface.secondary + '30',
              border: `1px solid ${theme.colors.semantic.border.secondary}40`,
              color: theme.colors.semantic.text.primary
            }}
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && (filteredPersistentTags.length > 0 || filteredPresetTags.length > 0 || newTag.trim()) && (
            <div 
              className="absolute z-10 w-full mt-1 rounded-lg shadow-lg border max-h-48 overflow-y-auto"
              style={{
                backgroundColor: theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.secondary
              }}
            >
              {/* User-created tags section */}
              {filteredPersistentTags.length > 0 && (
                <div>
                  <div 
                    className="px-3 py-1 text-xs font-medium border-b"
                    style={{ 
                      color: theme.colors.semantic.text.secondary,
                      backgroundColor: theme.colors.semantic.surface.tertiary,
                      borderColor: theme.colors.semantic.border.secondary
                    }}
                  >
                    Your Tags
                  </div>
                  {filteredPersistentTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => handleAddTag(tag.name)}
                    >
                      <div className="flex items-center space-x-2">
                        <span style={{ color: theme.colors.semantic.text.primary }}>{tag.name}</span>
                        <span 
                          className="text-xs px-1 rounded"
                          style={{ 
                            color: theme.colors.semantic.text.secondary,
                            backgroundColor: theme.colors.semantic.surface.tertiary
                          }}
                        >
                          {tag.usageCount}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeletePersistentTag(tag.id, e)}
                        className="text-xs p-1 rounded hover:bg-red-100 transition-all"
                        style={{ color: theme.colors.semantic.status.error }}
                        title="Delete persistent tag"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Preset tags section */}
              {filteredPresetTags.length > 0 && (
                <div>
                  <div 
                    className="px-3 py-1 text-xs font-medium border-b"
                    style={{ 
                      color: theme.colors.semantic.text.secondary,
                      backgroundColor: theme.colors.semantic.surface.tertiary,
                      borderColor: theme.colors.semantic.border.secondary
                    }}
                  >
                    Preset Tags
                  </div>
                  {filteredPresetTags.map((tag) => (
                    <div
                      key={tag}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => handleAddTag(tag)}
                    >
                      <span style={{ color: theme.colors.semantic.text.primary }}>{tag}</span>
                      <button
                        onClick={(e) => handleDeletePresetTag(tag, e)}
                        className="text-xs p-1 rounded hover:bg-red-100 transition-all"
                        style={{ color: theme.colors.semantic.status.error }}
                        title="Remove from suggestions"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Create new tag option - Always show when typing */}
              {newTag.trim() && (
                <div>
                  {(filteredPersistentTags.length > 0 || filteredPresetTags.length > 0) && (
                    <div 
                      className="px-3 py-1 text-xs font-medium border-t"
                      style={{ 
                        color: theme.colors.semantic.text.secondary,
                        backgroundColor: theme.colors.semantic.surface.tertiary,
                        borderColor: theme.colors.semantic.border.secondary
                      }}
                    >
                      Create New
                    </div>
                  )}
                  <div
                    className="px-3 py-2 cursor-pointer transition-all"
                    style={{ 
                      backgroundColor: newTag.trim() && !filteredPersistentTags.some(tag => tag.name.toLowerCase() === newTag.trim().toLowerCase()) && !filteredPresetTags.some(tag => tag.toLowerCase() === newTag.trim().toLowerCase())
                        ? (category === 'sources' 
                          ? theme.colors.semantic.status.success + '15'
                          : theme.colors.semantic.status.warning + '15')
                        : 'transparent'
                    }}
                    onClick={() => handleAddTag()}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm"
                        style={{ 
                          color: theme.colors.semantic.text.primary,
                          fontWeight: 'medium'
                        }}
                      >
                        Add "{newTag.trim()}" as new tag
                      </span>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: category === 'sources'
                            ? theme.colors.semantic.status.success + '20'
                            : theme.colors.semantic.status.warning + '20',
                          color: category === 'sources'
                            ? theme.colors.semantic.status.success
                            : theme.colors.semantic.status.warning
                        }}
                      >
                        Enter ↵
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={() => handleAddTag()}
          disabled={!newTag.trim()}
          className="px-4 py-2 rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: category === 'sources'
              ? theme.colors.semantic.status.success + '15'
              : theme.colors.semantic.status.warning + '15',
            border: `1px solid ${category === 'sources'
              ? theme.colors.semantic.status.success + '40'
              : theme.colors.semantic.status.warning + '40'
            }`,
            color: category === 'sources'
              ? theme.colors.semantic.status.success
              : theme.colors.semantic.status.warning
          }}
        >
          Add
        </button>
      </div>
      
      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}

interface TagsSectionProps {
  sourceTags: string[];
  examTags: string[];
  onAddSourceTag: (tag: string) => void;
  onRemoveSourceTag: (tag: string) => void;
  onAddExamTag: (tag: string) => void;
  onRemoveExamTag: (tag: string) => void;
}

export default function TagsSection({
  sourceTags,
  examTags,
  onAddSourceTag,
  onRemoveSourceTag,
  onAddExamTag,
  onRemoveExamTag
}: TagsSectionProps) {
  const { theme } = useTheme();

  return (
    <div 
      className="rounded-xl p-6 border-2"
      style={{
        backgroundColor: theme.colors.semantic.surface.primary,
        borderColor: theme.colors.semantic.border.secondary + '30'
      }}
    >
      <h2 
        className="text-lg font-semibold mb-6"
        style={{ color: theme.colors.semantic.text.primary }}
      >
        Tags (Optional)
      </h2>
      
      <div className="space-y-6">
        {/* Sources Tags */}
        <div>
          <h3 
            className="text-md font-medium mb-3 flex items-center space-x-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.colors.semantic.status.success }}
            />
            <span>Sources</span>
          </h3>
          <TagInputWithSuggestions
            category="sources"
            placeholder="Add source tag (e.g., Textbook Chapter 5, NCERT Physics)..."
            selectedTags={sourceTags}
            onAddTag={onAddSourceTag}
            onRemoveTag={onRemoveSourceTag}
          />
        </div>
        
        {/* Exams Tags */}
        <div>
          <h3 
            className="text-md font-medium mb-3 flex items-center space-x-2"
            style={{ color: theme.colors.semantic.text.primary }}
          >
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.colors.semantic.status.warning }}
            />
            <span>Exams</span>
          </h3>
          <TagInputWithSuggestions
            category="exams"
            placeholder="Add exam tag (e.g., JEE Main 2024, NEET, Board Exam)..."
            selectedTags={examTags}
            onAddTag={onAddExamTag}
            onRemoveTag={onRemoveExamTag}
          />
        </div>
      </div>
      
      <div className="mt-4 text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
        Tags are saved and will be suggested in future questions. Usage count shows how often each tag is used.
      </div>
    </div>
  );
}