/**
 * Question Card Component
 * Individual question display with actions and selection
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Question, ViewSettings } from '../types';
import { DeleteModal, DeleteConfirmationData } from '../modals/delete-modal';
// Inline SVG icons to avoid heroicons dependency
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DocumentDuplicateIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

import { ViewMode } from '../types';
import { 
  formatDifficulty, 
  formatQuestionType, 
  getDifficultyColor, 
  getTypeIcon, 
  truncateText, 
  extractTextFromHTML,
  formatHierarchyPath 
} from '../utils';

export interface QuestionCardProps {
  question: Question;
  selected?: boolean;
  viewMode?: ViewMode;
  showActions?: boolean;
  showPreview?: boolean;
  onSelect?: (questionId: string) => void;
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  onDuplicate?: (questionId: string) => void;
  onPreview?: (questionId: string) => void;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selected = false,
  viewMode = ViewMode.GRID,
  showActions = true,
  showPreview = true,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const questionText = extractTextFromHTML(question.question);
  const truncatedText = truncateText(questionText, viewMode === ViewMode.CARDS ? 200 : 100);
  const correctAnswers = question.options.filter(opt => opt.isCorrect);

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement) {
      const isActionButton = e.target.closest('button');
      if (!isActionButton && onSelect) {
        onSelect(question.id);
      }
    }
  };

  // Render based on view mode
  if (viewMode === ViewMode.LIST) {
    return (
      <div
        className={`
          flex items-center p-4 bg-white rounded-lg border transition-all duration-200 cursor-pointer
          ${selected ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200 hover:border-gray-300'}
          ${className}
        `}
        onClick={handleCardClick}
      >
        {/* Selection Checkbox */}
        <div className="flex-shrink-0 mr-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(question.id);
            }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}
          >
            {selected && <CheckCircleIcon className="w-3 h-3 text-white" />}
          </button>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            {/* Type Icon */}
            <span className="text-lg">{getTypeIcon(question.type)}</span>
            
            {/* Human ID */}
            <span className="text-sm font-mono text-gray-500">{question.humanId}</span>
            
            {/* Question Text */}
            <p className="text-sm text-gray-900 truncate">{truncatedText}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center space-x-4 ml-4">
          {/* Difficulty */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {formatDifficulty(question.difficulty)}
          </span>

          {/* Points */}
          <span className="text-sm text-gray-500">{question.points} pts</span>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-1">
              {showPreview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview?.(question.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                  title="Preview"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(question.id);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Card/Grid view
  return (
    <div
      className={`
        bg-white rounded-xl border transition-all duration-200 cursor-pointer group
        ${selected ? 'ring-2 ring-blue-500 border-blue-200 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
        ${viewMode === ViewMode.CARDS ? 'p-6' : 'p-4'}
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* Selection Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(question.id);
            }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {selected && <CheckCircleIcon className="w-3 h-3 text-white" />}
          </button>

          {/* Type Badge */}
          <div className="flex items-center space-x-1">
            <span className="text-lg">{getTypeIcon(question.type)}</span>
            <span className="text-xs font-medium text-gray-600">
              {formatQuestionType(question.type)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className={`flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${selected ? 'opacity-100' : ''}`}>
            {showPreview && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview?.(question.id);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Preview Question"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(question.id);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Question"
            >
              <PencilIcon className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.(question.id);
              }}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Duplicate Question"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Question"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Human ID */}
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {question.humanId}
        </span>
        
        {/* Difficulty */}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
          {formatDifficulty(question.difficulty)}
        </span>
      </div>

      {/* Question Text */}
      <div className="mb-3">
        <p className="text-sm text-gray-900 leading-relaxed">
          {isExpanded ? questionText : truncatedText}
        </p>
        
        {questionText.length > truncatedText.length && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Options Preview */}
      {viewMode === ViewMode.CARDS && (
        <div className="mb-3">
          <div className="space-y-1">
            {question.options.slice(0, 2).map((option, index) => (
              <div key={option.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${option.isCorrect ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs text-gray-600">
                  {truncateText(extractTextFromHTML(option.text), 50)}
                </span>
              </div>
            ))}
            {question.options.length > 2 && (
              <p className="text-xs text-gray-500">+{question.options.length - 2} more options</p>
            )}
          </div>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Points */}
          <span className="flex items-center space-x-1">
            <span>⭐</span>
            <span>{question.points} pts</span>
          </span>

          {/* Time Limit */}
          {question.timeLimit && (
            <span className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{question.timeLimit}s</span>
            </span>
          )}

          {/* Correct Answers Count */}
          <span className="flex items-center space-x-1">
            <CheckCircleIcon className="w-3 h-3 text-green-500" />
            <span>{correctAnswers.length} correct</span>
          </span>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            <TagIcon className="w-3 h-3" />
            <span>{question.tags.length} tags</span>
          </div>
        )}
      </div>

      {/* Hierarchy Path */}
      {question.hierarchyPath && viewMode === ViewMode.CARDS && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {formatHierarchyPath(question.hierarchyPath)}
          </p>
        </div>
      )}

      {/* Tags Preview */}
      {question.tags && question.tags.length > 0 && viewMode === ViewMode.CARDS && (
        <div className="mt-2 flex flex-wrap gap-1">
          {question.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {question.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{question.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        question={question}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async (deleteData) => {
          onDelete?.(question.id);
        }}
      />
    </div>
  );
};