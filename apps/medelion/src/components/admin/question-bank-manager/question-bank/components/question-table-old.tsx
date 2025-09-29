/**
 * Question Table Component
 * Table layout for displaying questions
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-48 h-4 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
                      <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
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
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8v2H3v-2zm0-4h8v2H3V9zm0-4h8v2H3V5zm10 0h8v2h-8V5zm0 4h8v2h-8V9zm0 4h8v2h-8v-2z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-500">
            No questions match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Selection Header */}
              <th className="px-6 py-3 text-left">
                <button
                  onClick={selection?.toggleSelectAll}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selection?.isAllSelected 
                      ? 'bg-blue-500 border-blue-500' 
                      : selection?.isIndeterminate
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {selection?.isAllSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  )}
                  {selection?.isIndeterminate && !selection?.isAllSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13H5v-2h14v2z"/>
                    </svg>
                  )}
                </button>
              </th>

              {/* Human ID */}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(SortBy.HUMAN_ID)}
              >
                <div className="flex items-center space-x-1">
                  <span>ID</span>
                  {getSortIcon(SortBy.HUMAN_ID)}
                </div>
              </th>

              {/* Type */}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(SortBy.TYPE)}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  {getSortIcon(SortBy.TYPE)}
                </div>
              </th>

              {/* Question */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>

              {/* Difficulty */}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(SortBy.DIFFICULTY)}
              >
                <div className="flex items-center space-x-1">
                  <span>Difficulty</span>
                  {getSortIcon(SortBy.DIFFICULTY)}
                </div>
              </th>

              {/* Points */}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(SortBy.POINTS)}
              >
                <div className="flex items-center space-x-1">
                  <span>Points</span>
                  {getSortIcon(SortBy.POINTS)}
                </div>
              </th>

              {/* Created */}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(SortBy.CREATED_AT)}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  {getSortIcon(SortBy.CREATED_AT)}
                </div>
              </th>

              {/* Actions */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((question) => {
              const isExpanded = expandedRows.has(question.id);
              const questionText = extractTextFromHTML(question.question);
              
              return (
                <React.Fragment key={question.id}>
                  <tr className={`hover:bg-gray-50 ${selection?.selectedIds.has(question.id) ? 'bg-blue-50' : ''}`}>
                    {/* Selection */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => selection?.toggleSelection(question.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selection?.selectedIds.has(question.id) 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {selection?.selectedIds.has(question.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                          </svg>
                        )}
                      </button>
                    </td>

                    {/* Human ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {question.humanId}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatQuestionType(question.type)}
                      </span>
                    </td>

                    {/* Question */}
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-900">
                          {truncateText(questionText, 80)}
                        </p>
                        {questionText.length > 80 && (
                          <button
                            onClick={() => toggleRowExpansion(question.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {question.points}
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onPreview?.(question.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Preview"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => onEdit?.(question.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => onDelete?.(question.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
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
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="space-y-4">
                          {/* Full Question Text */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Question:</h4>
                            <p className="text-sm text-gray-700">{questionText}</p>
                          </div>

                          {/* Options */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Options:</h4>
                            <div className="space-y-1">
                              {question.options.map((option, index) => (
                                <div key={option.id} className="flex items-center space-x-2">
                                  <span className={`w-2 h-2 rounded-full ${option.isCorrect ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  <span className="text-sm text-gray-700">
                                    {String.fromCharCode(65 + index)}. {extractTextFromHTML(option.text)}
                                  </span>
                                  {option.isCorrect && (
                                    <span className="text-xs text-green-600 font-medium">Correct</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Explanation */}
                          {question.explanation && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Explanation:</h4>
                              <p className="text-sm text-gray-700">{extractTextFromHTML(question.explanation)}</p>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">Time Limit:</span>
                              <span className="ml-2 text-gray-600">{question.timeLimit ? `${question.timeLimit}s` : 'None'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Tags:</span>
                              <span className="ml-2 text-gray-600">{question.tags?.length || 0}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Created By:</span>
                              <span className="ml-2 text-gray-600">{question.createdBy || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Hierarchy:</span>
                              <span className="ml-2 text-gray-600">{formatHierarchyPath(question.hierarchyPath)}</span>
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