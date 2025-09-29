'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Tag, 
  BookOpen, 
  Eye, 
  Check, 
  X, 
  AlertTriangle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { useTheme } from '@/theme';
import { Question, QuestionOption } from '@/lib/mcq-service';

interface MCQCardProps {
  question: Question;
  onApprove: (questionId: string) => void;
  onReject: (questionId: string) => void;
  onPreview: (questionId: string) => void;
  priority?: 'low' | 'medium' | 'high';
  isSelected?: boolean;
  onSelectionChange?: (questionId: string, selected: boolean) => void;
}

const MCQCard: React.FC<MCQCardProps> = ({ 
  question, 
  onApprove, 
  onReject, 
  onPreview, 
  priority = 'medium',
  isSelected = false,
  onSelectionChange
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to strip HTML tags from text
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'hard': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'easy': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderOption = (option: QuestionOption, index: number) => {
    const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
    
    return (
      <div 
        key={option.id || index}
        className={`flex items-start space-x-2.5 p-2.5 rounded-lg border transition-all ${
          option.isCorrect 
            ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
            : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
        }`}
      >
        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
          option.isCorrect 
            ? 'bg-green-100 text-green-700 border-green-300 border' 
            : 'bg-gray-100 text-gray-600 border-gray-300 border'
        }`}>
          {optionLetter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className="text-gray-900 dark:text-white text-sm leading-snug">
              {stripHtmlTags(option.text)}
            </p>
            {option.isCorrect && (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 ml-2 flex-shrink-0" />
            )}
          </div>
          {option.explanation && isExpanded && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 italic">
              Explanation: {stripHtmlTags(option.explanation)}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {onSelectionChange && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectionChange(question.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              )}
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                ID: {question.humanId}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty || 'Medium'}
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug mb-2">
              {stripHtmlTags(question.question)}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {question.type?.replace('_', ' ').toLowerCase()}
              </span>
              {question.points && (
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center font-medium">
                    P
                  </span>
                  {question.points}
                </span>
              )}
              {question.timeLimit && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.floor(question.timeLimit / 60)}m {question.timeLimit % 60}s
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-1.5 ml-3">
            <button 
              onClick={() => onPreview(question.id)}
              className="px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button 
              onClick={() => onApprove(question.id)}
              className="px-2.5 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </button>
            <button 
              onClick={() => onReject(question.id)}
              className="px-2.5 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {question.options?.filter(opt => opt.isCorrect).length || 0} correct
          </span>
        </div>
        {question.options?.map((option, index) => renderOption(option, index))}
      </div>

      {/* Expand Button */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Details
            </>
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3">
          <div className="space-y-3">
            {/* Full Width Explanation */}
            {question.explanation && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Explanation:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg leading-relaxed">
                  {stripHtmlTags(question.explanation)}
                </p>
              </div>
            )}

            {/* Full Width References */}
            {question.references && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">References:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg leading-relaxed">
                  {stripHtmlTags(question.references)}
                </p>
              </div>
            )}

            {/* Assertion-Reasoning specific fields - Full Width */}
            {question.type === 'ASSERTION_REASONING' && (
              <>
                {question.assertion && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assertion:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg leading-relaxed">
                      {stripHtmlTags(question.assertion)}
                    </p>
                  </div>
                )}
                {question.reasoning && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reasoning:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg leading-relaxed">
                      {stripHtmlTags(question.reasoning)}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Compact Tags and Metadata Layout */}
            <div className="space-y-2.5">
              {/* All Tags in a single compact row */}
              <div className="space-y-1.5">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags & Hierarchy:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {/* General Tags */}
                  {question.tags?.map((tag, index) => (
                    <span
                      key={`general-${index}`}
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40"
                    >
                      {tag}
                    </span>
                  ))}
                  {/* Source Tags */}
                  {question.sourceTags?.map((tag, index) => (
                    <span
                      key={`source-${index}`}
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40"
                    >
                      📚 {tag}
                    </span>
                  ))}
                  {/* Exam Tags */}
                  {question.examTags?.map((tag, index) => (
                    <span
                      key={`exam-${index}`}
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40"
                    >
                      📝 {tag}
                    </span>
                  ))}
                  {/* Hierarchy Chain */}
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40">
                    🏗️ {question.hierarchyItemId}
                  </span>
                </div>
              </div>

              {/* Compact Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="space-y-0.5">
                  <div><strong>Created:</strong> {new Date(question.createdAt).toLocaleDateString()}</div>
                  <div><strong>Updated:</strong> {new Date(question.updatedAt).toLocaleDateString()}</div>
                </div>
                <div className="space-y-0.5">
                  {question.createdBy && <div><strong>Author:</strong> {question.createdBy}</div>}
                  <div><strong>Status:</strong> {question.isActive ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQCard;