/**
 * Clean Professional Question Table Component
 * Modern table layout with theme integration and smooth interactions
 */

'use client';

import React, { useState } from 'react';
import { Question, SortBy } from '../types';
import { 
  formatDifficulty, 
  formatQuestionType, 
  getDifficultyColor, 
  truncateText, 
  extractTextFromHTML,
  formatHierarchyPath 
} from '../utils';
import { useTheme } from '@/theme';

export interface QuestionTableProps {
  questions: Question[];
  isLoading?: boolean;
  selection?: {
    selectedIds: Set<string>;
    toggleSelection: (id: string) => void;
    toggleSelectAll: () => void;
    isAllSelected: boolean;
    isIndeterminate: boolean;
  };
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  onPreview?: (questionId: string) => void;
  onSort?: (sortBy: SortBy, sortOrder: 'asc' | 'desc') => void;
  sortBy?: SortBy;
  sortOrder?: 'asc' | 'desc';
  viewSettings?: any;
  className?: string;
}

export const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  isLoading = false,
  selection,
  onEdit,
  onDelete,
  onPreview,
  onSort,
  sortBy,
  sortOrder,
  viewSettings,
  className = ''
}) => {
  const { theme } = useTheme();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (column: SortBy) => {
    if (!onSort) return;
    
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column, newOrder);
  };

  const toggleRowExpansion = (questionId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getSortIcon = (column: SortBy) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.text.secondary }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.action.primary }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.action.primary }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className={`rounded-lg overflow-hidden ${className}`} style={{ backgroundColor: theme.colors.semantic.surface.primary, border: `1px solid ${theme.colors.semantic.border.secondary}` }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="w-5 h-5 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.primary }}></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="w-20 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.primary }}></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="w-16 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.primary }}></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="w-32 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.primary }}></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="w-16 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.primary }}></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="w-12 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.primary }}></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="w-16 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.primary }}></div>
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: theme.colors.semantic.surface.primary }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} style={{ borderTop: `1px solid ${theme.colors.semantic.border.secondary}` }}>
                  <td className="px-6 py-4">
                    <div className="w-5 h-5 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-48 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-6 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-4 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <div className="w-6 h-6 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                      <div className="w-6 h-6 rounded animate-pulse" style={{ backgroundColor: theme.colors.semantic.surface.secondary }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={`rounded-lg ${className}`} style={{ backgroundColor: theme.colors.semantic.surface.primary, border: `1px solid ${theme.colors.semantic.border.secondary}` }}>
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4" style={{ color: theme.colors.semantic.text.disabled }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>No questions found</h3>
          <p style={{ color: theme.colors.semantic.text.secondary }}>
            No questions match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ backgroundColor: theme.colors.semantic.surface.primary, border: `1px solid ${theme.colors.semantic.border.secondary}` }}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{ backgroundColor: theme.colors.semantic.surface.secondary }}>
            <tr>
              {/* Selection Header */}
              <th className="px-6 py-4 text-left">
                <button
                  onClick={selection?.toggleSelectAll}
                  className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: selection?.isAllSelected ? theme.colors.semantic.action.primary : 'transparent',
                    border: `2px solid ${selection?.isAllSelected ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary}`,
                    color: selection?.isAllSelected ? '#FFFFFF' : 'transparent'
                  }}
                >
                  {selection?.isAllSelected && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  )}
                  {selection?.isIndeterminate && !selection?.isAllSelected && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.semantic.action.primary }}>
                      <path d="M19 13H5v-2h14v2z"/>
                    </svg>
                  )}
                </button>
              </th>

              {/* Sortable Headers */}
              {[
                { key: SortBy.HUMAN_ID, label: 'ID' },
                { key: SortBy.TYPE, label: 'Type' },
                { key: null, label: 'Question' },
                { key: SortBy.DIFFICULTY, label: 'Difficulty' },
                { key: SortBy.POINTS, label: 'Points' },
                { key: SortBy.CREATED_AT, label: 'Created' }
              ].map(({ key, label }) => (
                <th 
                  key={label}
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${key ? 'cursor-pointer hover:opacity-80' : ''} transition-all duration-200`}
                  onClick={() => key && handleSort(key)}
                  style={{ color: theme.colors.semantic.text.secondary }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{label}</span>
                    {key && getSortIcon(key)}
                  </div>
                </th>
              ))}

              {/* Actions */}
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme.colors.semantic.text.secondary }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: theme.colors.semantic.surface.primary }}>
            {questions.map((question, index) => {
              const isExpanded = expandedRows.has(question.id);
              const isSelected = selection?.selectedIds.has(question.id);
              const isHovered = hoveredRow === question.id;
              const questionText = extractTextFromHTML(question.question);
              
              return (
                <React.Fragment key={question.id}>
                  <tr 
                    className="transition-all duration-200 transform hover:scale-[1.001]"
                    style={{
                      borderTop: index > 0 ? `1px solid ${theme.colors.semantic.border.secondary}` : 'none',
                      backgroundColor: isSelected ? theme.colors.semantic.action.primary + '08' : (isHovered ? theme.colors.semantic.surface.secondary + '50' : 'transparent')
                    }}
                    onMouseEnter={() => setHoveredRow(question.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Selection */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => selection?.toggleSelection(question.id)}
                        className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{
                          backgroundColor: isSelected ? theme.colors.semantic.action.primary : 'transparent',
                          border: `2px solid ${isSelected ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary}`,
                          color: isSelected ? '#FFFFFF' : 'transparent'
                        }}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                          </svg>
                        )}
                      </button>
                    </td>

                    {/* Human ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="text-sm font-mono px-2 py-1 rounded"
                        style={{
                          backgroundColor: theme.colors.semantic.surface.secondary,
                          color: theme.colors.semantic.text.primary
                        }}
                      >
                        {question.humanId}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm" style={{ color: theme.colors.semantic.text.primary }}>
                        {formatQuestionType(question.type)}
                      </span>
                    </td>

                    {/* Question */}
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm" style={{ color: theme.colors.semantic.text.primary }}>
                          {truncateText(questionText, 80)}
                        </p>
                        {questionText.length > 80 && (
                          <button
                            onClick={() => toggleRowExpansion(question.id)}
                            className="text-xs mt-1 hover:opacity-80 transition-opacity"
                            style={{ color: theme.colors.semantic.action.primary }}
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {formatDifficulty(question.difficulty)}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.semantic.text.primary }}>
                      {question.points}
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                      {new Date(question.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onPreview?.(question.id)}
                          className="transition-all duration-200 hover:opacity-80 transform hover:scale-110"
                          style={{ color: theme.colors.semantic.text.secondary }}
                          title="Preview"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => onEdit?.(question.id)}
                          className="transition-all duration-200 hover:opacity-80 transform hover:scale-110"
                          style={{ color: theme.colors.semantic.text.secondary }}
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => onDelete?.(question.id)}
                          className="transition-all duration-200 hover:opacity-80 transform hover:scale-110"
                          style={{ color: theme.colors.semantic.text.secondary }}
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr style={{ backgroundColor: theme.colors.semantic.surface.secondary + '50' }}>
                      <td colSpan={8} className="px-6 py-4">
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                          {/* Full Question Text */}
                          <div>
                            <h4 className="text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>Question:</h4>
                            <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>{questionText}</p>
                          </div>

                          {/* Options */}
                          <div>
                            <h4 className="text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>Options:</h4>
                            <div className="space-y-1">
                              {question.options.map((option, index) => (
                                <div key={option.id} className="flex items-center space-x-2">
                                  <span 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: option.isCorrect ? theme.colors.semantic.status.success : theme.colors.semantic.border.secondary }}
                                  />
                                  <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
                                    {String.fromCharCode(65 + index)}. {extractTextFromHTML(option.text)}
                                  </span>
                                  {option.isCorrect && (
                                    <span className="text-xs font-medium" style={{ color: theme.colors.semantic.status.success }}>Correct</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Explanation */}
                          {question.explanation && (
                            <div>
                              <h4 className="text-sm font-medium mb-2" style={{ color: theme.colors.semantic.text.primary }}>Explanation:</h4>
                              <p className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>{extractTextFromHTML(question.explanation)}</p>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>Time Limit:</span>
                              <span className="ml-2" style={{ color: theme.colors.semantic.text.secondary }}>{question.timeLimit ? `${question.timeLimit}s` : 'None'}</span>
                            </div>
                            <div>
                              <span className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>Tags:</span>
                              <span className="ml-2" style={{ color: theme.colors.semantic.text.secondary }}>{question.tags?.length || 0}</span>
                            </div>
                            <div>
                              <span className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>Created By:</span>
                              <span className="ml-2" style={{ color: theme.colors.semantic.text.secondary }}>{question.createdBy || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="font-medium" style={{ color: theme.colors.semantic.text.primary }}>Hierarchy:</span>
                              <span className="ml-2" style={{ color: theme.colors.semantic.text.secondary }}>{formatHierarchyPath(question.hierarchyPath)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};