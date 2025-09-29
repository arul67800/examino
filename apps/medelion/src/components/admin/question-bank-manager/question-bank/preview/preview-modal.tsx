/**
 * Question Preview Modal Component
 * Comprehensive question preview with full details and interactive elements
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Question, QuestionType, Difficulty } from '../types';

export interface PreviewModalProps {
  question: Question;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  className?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  question,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  className = ''
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [showExplanation, setShowExplanation] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'history'>('content');

  const handleOptionSelect = useCallback((optionId: string) => {
    if (question.type === QuestionType.SINGLE_CHOICE) {
      setSelectedOptions(new Set([optionId]));
    } else if (question.type === QuestionType.MULTIPLE_CHOICE) {
      setSelectedOptions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(optionId)) {
          newSet.delete(optionId);
        } else {
          newSet.add(optionId);
        }
        return newSet;
      });
    }
  }, [question.type]);

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return 'bg-green-100 text-green-800';
      case Difficulty.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case Difficulty.HARD:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SINGLE_CHOICE:
        return '🔘';
      case QuestionType.MULTIPLE_CHOICE:
        return '☑️';
      case QuestionType.TRUE_FALSE:
        return '⚖️';
      case QuestionType.ASSERTION_REASONING:
        return '🧠';
      default:
        return '❓';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContentTab = () => (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getTypeIcon(question.type)}</div>
            <div>
              <div className="text-sm font-medium text-blue-700">
                Question {question.humanId}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <span className="text-sm text-blue-600">
                  {question.points} point{question.points !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-blue max-w-none">
          <div className="text-lg leading-relaxed text-gray-900">
            {question.question}
          </div>
        </div>
      </div>

      {/* Options */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Answer Options</h4>
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelected = selectedOptions.has(option.id);
              const isCorrect = option.isCorrect;
              
              return (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    showExplanation && isCorrect
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : ''
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {question.type === QuestionType.SINGLE_CHOICE ? (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      ) : (
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Option {optionLetter}
                        </div>
                        {showExplanation && isCorrect && (
                          <div className="text-green-600 text-sm font-medium">
                            ✓ Correct
                          </div>
                        )}
                      </div>
                      
                      <div className="text-gray-900">
                        {option.text}
                      </div>
                      
                      {showExplanation && option.explanation && (
                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                          <div className="font-medium mb-1">Explanation:</div>
                          {option.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showExplanation
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {showExplanation ? 'Hide' : 'Show'} Answer & Explanations
        </button>
        
        {question.references && (
          <button
            onClick={() => setShowReferences(!showReferences)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showReferences
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showReferences ? 'Hide' : 'Show'} References
          </button>
        )}
      </div>

      {/* Main Explanation */}
      {showExplanation && question.explanation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Question Explanation</h4>
          <div className="text-green-800 leading-relaxed">
            {question.explanation}
          </div>
        </div>
      )}

      {/* References */}
      {showReferences && question.references && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">References</h4>
          <div className="text-blue-800 leading-relaxed">
            {question.references}
          </div>
        </div>
      )}
    </div>
  );

  const renderMetadataTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Basic Information</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Question ID</label>
              <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                {question.id}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Human ID</label>
              <div className="font-medium">
                {question.humanId}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <div className="flex items-center space-x-2">
                <span>{getTypeIcon(question.type)}</span>
                <span className="font-medium">{question.type.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Difficulty</label>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Points</label>
              <div className="font-medium">
                {question.points} point{question.points !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Publication</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                question.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {question.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Created</label>
              <div className="text-sm">
                {formatDate(question.createdAt)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Last Updated</label>
              <div className="text-sm">
                {formatDate(question.updatedAt)}
              </div>
            </div>
            
            {question.createdBy && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Created By</label>
                <div className="text-sm font-medium">
                  {question.createdBy}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hierarchy */}
      {question.hierarchyItemId && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Hierarchy Location</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Hierarchy Item ID</div>
            <div className="font-mono text-sm">
              {question.hierarchyItemId}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Question History</h4>
        <div className="space-y-4">
          {/* Creation Event */}
          <div className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium text-green-900">Question Created</div>
                <div className="text-sm text-green-700">
                  {formatDate(question.createdAt)}
                </div>
              </div>
              <div className="text-sm text-green-800 mt-1">
                Question was created {question.createdBy ? `by ${question.createdBy}` : ''}
              </div>
            </div>
          </div>

          {/* Update Event */}
          {question.updatedAt !== question.createdAt && (
            <div className="flex items-start space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-blue-900">Last Updated</div>
                  <div className="text-sm text-blue-700">
                    {formatDate(question.updatedAt)}
                  </div>
                </div>
                <div className="text-sm text-blue-800 mt-1">
                  Question content or metadata was modified
                </div>
              </div>
            </div>
          )}

          {/* Active Status */}
          <div className={`flex items-start space-x-4 p-4 border rounded-lg ${
            question.isActive 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              question.isActive 
                ? 'bg-green-100' 
                : 'bg-red-100'
            }`}>
              <svg className={`w-4 h-4 ${
                question.isActive 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d={question.isActive 
                  ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                } clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className={`font-medium ${
                question.isActive 
                  ? 'text-green-900' 
                  : 'text-red-900'
              }`}>
                {question.isActive ? 'Active' : 'Inactive'}
              </div>
              <div className={`text-sm mt-1 ${
                question.isActive 
                  ? 'text-green-800' 
                  : 'text-red-800'
              }`}>
                {question.isActive 
                  ? 'Question is active and available for use'
                  : 'Question is inactive and not available for use'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">👁️</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Question Preview
                  </h2>
                  <p className="text-sm text-gray-600">
                    {question.humanId} • {question.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 mt-4">
              {[
                { key: 'content', label: 'Content', icon: '📝' },
                { key: 'metadata', label: 'Metadata', icon: '📊' },
                { key: 'history', label: 'History', icon: '📅' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'metadata' && renderMetadataTab()}
            {activeTab === 'history' && renderHistoryTab()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <div className="flex space-x-3">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Question
                  </button>
                )}
                
                {onDuplicate && (
                  <button
                    onClick={onDuplicate}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Duplicate
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};