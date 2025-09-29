'use client';

import React from 'react';
import {
  X,
  Clock,
  Tag,
  BookOpen,
  CheckCircle2,
  Circle,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import { Question, QuestionOption } from '@/lib/mcq-service';

interface MCQPreviewModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
}

const MCQPreviewModal: React.FC<MCQPreviewModalProps> = ({
  question,
  isOpen,
  onClose
}) => {
  if (!isOpen || !question) return null;

  // Function to strip HTML tags from text
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderOption = (option: QuestionOption, index: number) => {
    const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...

    return (
      <div
        key={option.id || index}
        className={`flex items-start space-x-4 p-4 rounded-xl border-2 transition-all ${
          option.isCorrect
            ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
            : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700/50'
        }`}
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          option.isCorrect
            ? 'bg-green-500 text-white border-2 border-green-600'
            : 'bg-gray-100 text-gray-700 border-2 border-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'
        }`}>
          {optionLetter}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white text-base leading-relaxed mb-2">
            {stripHtmlTags(option.text)}
          </p>
          {option.isCorrect && (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Correct Answer</span>
            </div>
          )}
          {option.explanation && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Explanation:</strong> {stripHtmlTags(option.explanation)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Question ID:</span>
              <span className="font-mono text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                {question.humanId}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty || 'Medium'}
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <BookOpen className="w-4 h-4" />
              {question.type?.replace('_', ' ').toLowerCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-8 space-y-8">
            {/* Question */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-relaxed mb-6">
                {stripHtmlTags(question.question)}
              </h2>

              {/* Question Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                {question.points && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center font-medium">
                      P
                    </div>
                    <span>{question.points} points</span>
                  </div>
                )}
                {question.timeLimit && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(question.timeLimit / 60)}m {question.timeLimit % 60}s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Answer Options
              </h3>
              <div className="space-y-4">
                {question.options?.map((option, index) => renderOption(option, index))}
              </div>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Explanation
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {stripHtmlTags(question.explanation)}
                </p>
              </div>
            )}

            {/* References */}
            {question.references && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  References
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                    {stripHtmlTags(question.references)}
                  </p>
                </div>
              </div>
            )}

            {/* Assertion-Reasoning specific fields */}
            {question.type === 'ASSERTION_REASONING' && (
              <div className="space-y-6">
                {question.assertion && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Assertion
                    </h3>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                      <p className="text-purple-900 dark:text-purple-100 leading-relaxed">
                        {stripHtmlTags(question.assertion)}
                      </p>
                    </div>
                  </div>
                )}
                {question.reasoning && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Reasoning
                    </h3>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                      <p className="text-purple-900 dark:text-purple-100 leading-relaxed">
                        {stripHtmlTags(question.reasoning)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tags and Metadata */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Tags & Metadata
              </h3>

              {/* Tags */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {/* General Tags */}
                  {question.tags?.map((tag, index) => (
                    <span
                      key={`general-${index}`}
                      className="px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40"
                    >
                      {tag}
                    </span>
                  ))}
                  {/* Source Tags */}
                  {question.sourceTags?.map((tag, index) => (
                    <span
                      key={`source-${index}`}
                      className="px-3 py-1 rounded-full text-sm font-medium text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40"
                    >
                      📚 {tag}
                    </span>
                  ))}
                  {/* Exam Tags */}
                  {question.examTags?.map((tag, index) => (
                    <span
                      key={`exam-${index}`}
                      className="px-3 py-1 rounded-full text-sm font-medium text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40"
                    >
                      📝 {tag}
                    </span>
                  ))}
                  {/* Hierarchy Chain */}
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40">
                    🏗️ {question.hierarchyItemId}
                  </span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(question.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {question.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(question.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {question.createdBy && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {question.createdBy}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQPreviewModal;