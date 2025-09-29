/**
 * Advanced Search Bar Component
 * Theme-compliant search with glassmorphism effects and AI-powered suggestions
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import { useDebouncedSearch } from '../hooks';

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
  query,
  onQueryChange,
  onSearch,
  placeholder = "Search questions...",
  suggestions = [],
  isLoading = false,
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [debouncedQuery, setDebouncedQuery] = useDebouncedSearch(onQueryChange, 300);

  useEffect(() => {
    setDebouncedQuery(query);
  }, [query, setDebouncedQuery]);

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
            <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          ) : (
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        
        <input
          ref={searchRef}
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          className={`
            block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-gray-400 text-sm
            transition-all duration-200
            ${query ? 'bg-white' : 'bg-gray-50'}
          `}
          placeholder={placeholder}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              onQueryChange('');
              searchRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => {
                onQueryChange(suggestion);
                setShowSuggestions(false);
                searchRef.current?.focus();
              }}
              className={`
                w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors
                ${index === focusedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                ${index === filteredSuggestions.length - 1 ? '' : 'border-b border-gray-100'}
              `}
            >
              <div className="flex items-center space-x-3">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search Shortcuts Help */}
      {query && !showSuggestions && (
        <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <div className="text-xs text-gray-500">
            <p className="mb-1"><kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> to search</p>
            <p><kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+F</kbd> to focus search</p>
          </div>
        </div>
      )}
    </div>
  );
};