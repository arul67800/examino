/**
 * Clean Professional Question Card Component
 * Theme-compliant card with advanced animations and neat styling
 */

'use client';

import React, { useState } from 'react';
import { Question, ViewMode } from '../types';
import { DeleteModal } from '../modals/delete-modal';
import { useTheme } from '@/theme';
import { 
  formatDifficulty, 
  formatQuestionType, 
  getDifficultyColor, 
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
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  // SVG Icons
  const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const PencilIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const DuplicateIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const TagIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
    </svg>
  );

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'SINGLE_CHOICE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'MULTIPLE_CHOICE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'TRUE_FALSE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // List view
  if (viewMode === ViewMode.LIST) {
    return (
      <div
        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg ${className}`}
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          border: `1px solid ${selected ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary}`,
          boxShadow: selected 
            ? `0 4px 20px ${theme.colors.semantic.action.primary}30, 0 0 0 2px ${theme.colors.semantic.action.primary}40`
            : `0 2px 8px ${theme.colors.semantic.text.primary}08, 0 1px 3px ${theme.colors.semantic.text.primary}12`
        }}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Selection Checkbox */}
        <div className="flex-shrink-0 mr-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(question.id);
            }}
            className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: selected ? theme.colors.semantic.action.primary : 'transparent',
              border: `2px solid ${selected ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary}`,
              color: selected ? '#FFFFFF' : 'transparent'
            }}
          >
            {selected && <CheckIcon />}
          </button>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            {/* Type Icon */}
            <div style={{ color: theme.colors.semantic.action.primary }}>
              {getQuestionTypeIcon(question.type)}
            </div>
            
            {/* Human ID */}
            <span 
              className="text-sm font-mono px-2 py-1 rounded"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                color: theme.colors.semantic.text.secondary
              }}
            >
              {question.humanId}
            </span>
            
            {/* Question Text */}
            <p className="text-sm truncate" style={{ color: theme.colors.semantic.text.primary }}>
              {truncatedText}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center space-x-4 ml-4">
          {/* Difficulty */}
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: theme.colors.semantic.status.success + (question.difficulty === 'EASY' ? '20' : question.difficulty === 'MEDIUM' ? theme.colors.semantic.status.warning + '20' : theme.colors.semantic.status.error + '20'),
              color: question.difficulty === 'EASY' ? theme.colors.semantic.status.success : question.difficulty === 'MEDIUM' ? theme.colors.semantic.status.warning : theme.colors.semantic.status.error
            }}
          >
            {formatDifficulty(question.difficulty)}
          </span>

          {/* Points */}
          <span className="text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
            {question.points} pts
          </span>

          {/* Actions */}
          {showActions && (
            <div className={`flex items-center space-x-1 transition-opacity duration-200 ${isHovered || selected ? 'opacity-100' : 'opacity-0'}`}>
              {showPreview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview?.(question.id);
                  }}
                  className="p-1.5 rounded transition-all duration-200 hover:scale-110"
                  style={{ color: theme.colors.semantic.text.secondary }}
                  title="Preview"
                >
                  <EyeIcon />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(question.id);
                }}
                className="p-1.5 rounded transition-all duration-200 hover:scale-110"
                style={{ color: theme.colors.semantic.text.secondary }}
                title="Edit"
              >
                <PencilIcon />
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
      className={`rounded-xl cursor-pointer group transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${viewMode === ViewMode.CARDS ? 'p-6' : 'p-4'} ${className}`}
      style={{
        backgroundColor: theme.colors.semantic.surface.secondary,
        border: `1px solid ${selected ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary}`,
        boxShadow: selected 
          ? `0 8px 32px ${theme.colors.semantic.action.primary}25, 0 4px 16px ${theme.colors.semantic.action.primary}15, 0 0 0 2px ${theme.colors.semantic.action.primary}40`
          : isHovered
            ? `0 12px 40px ${theme.colors.semantic.text.primary}12, 0 4px 16px ${theme.colors.semantic.text.primary}08`
            : `0 4px 16px ${theme.colors.semantic.text.primary}06, 0 2px 8px ${theme.colors.semantic.text.primary}10`
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: selected ? theme.colors.semantic.action.primary : 'transparent',
              border: `2px solid ${selected ? theme.colors.semantic.action.primary : theme.colors.semantic.border.secondary}`,
              color: selected ? '#FFFFFF' : 'transparent'
            }}
          >
            {selected && <CheckIcon />}
          </button>

          {/* Type Badge */}
          <div className="flex items-center space-x-2">
            <div style={{ color: theme.colors.semantic.action.primary }}>
              {getQuestionTypeIcon(question.type)}
            </div>
            <span className="text-xs font-medium" style={{ color: theme.colors.semantic.text.secondary }}>
              {formatQuestionType(question.type)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className={`flex items-center space-x-1 transition-opacity duration-300 ${isHovered || selected ? 'opacity-100' : 'opacity-0'}`}>
            {showPreview && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview?.(question.id);
                }}
                className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  color: theme.colors.semantic.text.secondary,
                  backgroundColor: isHovered ? theme.colors.semantic.surface.secondary : 'transparent'
                }}
                title="Preview Question"
              >
                <EyeIcon />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(question.id);
              }}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                color: theme.colors.semantic.text.secondary,
                backgroundColor: isHovered ? theme.colors.semantic.action.primary + '10' : 'transparent'
              }}
              title="Edit Question"
            >
              <PencilIcon />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.(question.id);
              }}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                color: theme.colors.semantic.text.secondary,
                backgroundColor: isHovered ? theme.colors.semantic.status.success + '10' : 'transparent'
              }}
              title="Duplicate Question"
            >
              <DuplicateIcon />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                color: theme.colors.semantic.text.secondary,
                backgroundColor: isHovered ? theme.colors.semantic.status.error + '10' : 'transparent'
              }}
              title="Delete Question"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      {/* Human ID & Difficulty */}
      <div className="flex items-center space-x-2 mb-3">
        <span 
          className="text-xs font-mono px-2 py-1 rounded"
          style={{
            backgroundColor: theme.colors.semantic.surface.secondary,
            color: theme.colors.semantic.text.secondary
          }}
        >
          {question.humanId}
        </span>
        
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: question.difficulty === 'EASY' ? theme.colors.semantic.status.success + '20' : 
                           question.difficulty === 'MEDIUM' ? theme.colors.semantic.status.warning + '20' : 
                           theme.colors.semantic.status.error + '20',
            color: question.difficulty === 'EASY' ? theme.colors.semantic.status.success : 
                   question.difficulty === 'MEDIUM' ? theme.colors.semantic.status.warning : 
                   theme.colors.semantic.status.error
          }}
        >
          {formatDifficulty(question.difficulty)}
        </span>
      </div>

      {/* Question Text */}
      <div className="mb-3">
        <p className="text-sm leading-relaxed" style={{ color: theme.colors.semantic.text.primary }}>
          {isExpanded ? questionText : truncatedText}
        </p>
        
        {questionText.length > truncatedText.length && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs mt-1 hover:opacity-80 transition-opacity"
            style={{ color: theme.colors.semantic.action.primary }}
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
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ 
                    backgroundColor: option.isCorrect ? theme.colors.semantic.status.success : theme.colors.semantic.border.secondary 
                  }} 
                />
                <span className="text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
                  {truncateText(extractTextFromHTML(option.text), 50)}
                </span>
              </div>
            ))}
            {question.options.length > 2 && (
              <p className="text-xs" style={{ color: theme.colors.semantic.text.disabled }}>
                +{question.options.length - 2} more options
              </p>
            )}
          </div>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          {/* Points */}
          <span className="flex items-center space-x-1" style={{ color: theme.colors.semantic.text.secondary }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span>{question.points} pts</span>
          </span>

          {/* Time Limit */}
          {question.timeLimit && (
            <span className="flex items-center space-x-1" style={{ color: theme.colors.semantic.text.secondary }}>
              <ClockIcon />
              <span>{question.timeLimit}s</span>
            </span>
          )}

          {/* Correct Answers Count */}
          <span className="flex items-center space-x-1" style={{ color: theme.colors.semantic.status.success }}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            <span>{correctAnswers.length} correct</span>
          </span>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex items-center space-x-1" style={{ color: theme.colors.semantic.text.secondary }}>
            <TagIcon />
            <span>{question.tags.length} tags</span>
          </div>
        )}
      </div>

      {/* Hierarchy Path */}
      {question.hierarchyPath && viewMode === ViewMode.CARDS && (
        <div 
          className="mt-3 pt-3" 
          style={{ borderTop: `1px solid ${theme.colors.semantic.border.secondary}` }}
        >
          <p className="text-xs" style={{ color: theme.colors.semantic.text.disabled }}>
            {formatHierarchyPath(question.hierarchyPath)}
          </p>
        </div>
      )}

      {/* Tags Preview */}
      {question.tags && question.tags.length > 0 && viewMode === ViewMode.CARDS && (
        <div className="mt-3 flex flex-wrap gap-1">
          {question.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: theme.colors.semantic.action.primary + '10',
                color: theme.colors.semantic.action.primary
              }}
            >
              {tag}
            </span>
          ))}
          {question.tags.length > 3 && (
            <span 
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: theme.colors.semantic.surface.secondary,
                color: theme.colors.semantic.text.disabled
              }}
            >
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