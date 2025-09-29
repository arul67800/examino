/**
 * Clean Professional Search Bar Component
 * Modern search with theme integration and minimal effects
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';

export interface SearchBarProps {
  query?: string;
  value?: string;
  onChange?: (value: string) => void;
  onQueryChange?: (query: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  suggestions?: string[];
  isLoading?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query = '',
  onQueryChange = () => {},
  onSearch = () => {},
  placeholder = "Search questions...",
  suggestions = [],
  isLoading = false,
  className = ''
}) => {
  const { theme } = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          onQueryChange(suggestions[focusedIndex]);
          setShowSuggestions(false);
        } else {
          onSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase()) && suggestion !== query
  );

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div 
              className="animate-spin h-5 w-5 border-2 border-t-2 rounded-full"
              style={{
                borderColor: theme.colors.semantic.border.secondary,
                borderTopColor: theme.colors.semantic.action.primary
              }}
            />
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.text.secondary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          className="block w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm transition-all duration-200 transform hover:scale-[1.01]"
          style={{
            backgroundColor: query || isFocused ? theme.colors.semantic.surface.primary : theme.colors.semantic.surface.secondary,
            border: `1px solid ${isFocused ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary}`,
            color: theme.colors.semantic.text.primary,
            boxShadow: isFocused ? `0 0 0 3px ${theme.colors.semantic.action.primary}15` : 'none'
          }}
          placeholder={placeholder}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              onQueryChange('');
              searchRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-80 transition-all duration-200 transform hover:scale-110"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          className="absolute z-50 w-full mt-2 rounded-lg shadow-lg max-h-64 overflow-y-auto transform transition-all duration-200 animate-in slide-in-from-top-2"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => {
                onQueryChange(suggestion);
                setShowSuggestions(false);
                searchRef.current?.focus();
              }}
              className="w-full px-4 py-3 text-left text-sm hover:opacity-80 transition-all duration-200 transform hover:scale-[1.01] first:rounded-t-lg last:rounded-b-lg"
              style={{
                backgroundColor: index === focusedIndex ? theme.colors.semantic.action.primary + '10' : 'transparent',
                color: index === focusedIndex ? theme.colors.semantic.action.primary : theme.colors.semantic.text.primary,
                borderBottom: index < filteredSuggestions.length - 1 ? `1px solid ${theme.colors.semantic.border.secondary}` : 'none'
              }}
            >
              <div className="flex items-center space-x-3">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.text.secondary }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="truncate">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search Shortcuts Help */}
      {query && !showSuggestions && (
        <div 
          className="absolute z-40 w-full mt-2 rounded-lg shadow-sm p-3 transition-all duration-200 animate-in fade-in"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            border: `1px solid ${theme.colors.semantic.border.secondary}`
          }}
        >
          <div className="text-xs space-y-1" style={{ color: theme.colors.semantic.text.secondary }}>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>Enter</kbd>
              <span>to search</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>Esc</kbd>
              <span>to clear</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};