/**
 * Delete Confirmation Modal Component
 * Comprehensive delete modal for both individual and bulk question deletions
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Question, BulkOperation } from '../types';
import { useTheme } from '@/theme';
import MCQHierarchyBreadcrumb, { HierarchyPath } from '../../mcq/breadcrumb/mcq-hierarchy-breadcrumb';

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteData: DeleteConfirmationData) => Promise<void>;
  questions?: Question[]; // For bulk delete
  question?: Question; // For single delete
  className?: string;
}

export interface DeleteConfirmationData {
  questionIds: string[];
  deleteReferences?: boolean;
  deleteFromHierarchy?: boolean;
  reason?: string;
  type: 'single' | 'bulk';
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  questions = [],
  question,
  className = ''
}) => {
  const { theme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReferences, setDeleteReferences] = useState(false);
  const [deleteFromHierarchy, setDeleteFromHierarchy] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchyPath>({});

  // Determine if this is single or bulk delete
  const isBulkDelete = questions.length > 0;
  const allQuestions = isBulkDelete ? questions : question ? [question] : [];
  const deleteType = isBulkDelete ? 'bulk' : 'single';

  // Filter questions based on hierarchy selection
  const filteredQuestions = useMemo(() => {
    if (!hierarchyFilter.hierarchyType && !hierarchyFilter.year && !hierarchyFilter.subject && 
        !hierarchyFilter.part && !hierarchyFilter.section && !hierarchyFilter.chapter) {
      return allQuestions; // No filter applied
    }

    return allQuestions.filter(q => {
      // Filter logic based on hierarchy path in question
      if (hierarchyFilter.year && q.hierarchyPath?.year !== hierarchyFilter.year.id) return false;
      if (hierarchyFilter.subject && q.hierarchyPath?.subject !== hierarchyFilter.subject.id) return false;
      if (hierarchyFilter.part && q.hierarchyPath?.part !== hierarchyFilter.part.id) return false;
      if (hierarchyFilter.section && q.hierarchyPath?.section !== hierarchyFilter.section.id) return false;
      if (hierarchyFilter.chapter && q.hierarchyPath?.chapter !== hierarchyFilter.chapter.id) return false;
      
      // For hierarchyItemId-based filtering (more common case)
      if (hierarchyFilter.section && q.hierarchyItemId === hierarchyFilter.section.id) return true;
      if (hierarchyFilter.chapter && q.hierarchyItemId === hierarchyFilter.chapter.id) return true;
      
      // If no specific hierarchy path matches but we have a general hierarchy item
      return !hierarchyFilter.year && !hierarchyFilter.subject && !hierarchyFilter.part && 
             !hierarchyFilter.section && !hierarchyFilter.chapter;
    });
  }, [allQuestions, hierarchyFilter]);

  const targetQuestions = filteredQuestions;

  // Analysis of questions to be deleted
  const deleteAnalysis = useMemo(() => {
    const hasPublished = targetQuestions.some(q => q.isActive);
    const hasReferences = targetQuestions.some(q => q.references);
    const hasHierarchy = targetQuestions.some(q => q.hierarchyItemId);
    const difficultyBreakdown = targetQuestions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const typeBreakdown = targetQuestions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      hasPublished,
      hasReferences,
      hasHierarchy,
      difficultyBreakdown,
      typeBreakdown,
      totalQuestions: targetQuestions.length
    };
  }, [targetQuestions]);

  const handleConfirm = useCallback(async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setIsDeleting(true);
    try {
      const deleteData: DeleteConfirmationData = {
        questionIds: targetQuestions.map(q => q.id),
        deleteReferences,
        deleteFromHierarchy,
        reason: reason.trim() || undefined,
        type: deleteType
      };

      await onConfirm(deleteData);
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [confirmed, targetQuestions, deleteReferences, deleteFromHierarchy, reason, deleteType, onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    if (isDeleting) return;
    setConfirmed(false);
    setReason('');
    setDeleteReferences(false);
    setDeleteFromHierarchy(false);
    onClose();
  }, [isDeleting, onClose]);

  if (!isOpen) return null;

  const renderQuestionSummary = () => (
    <div className="space-y-4">
      {/* Question Count Summary */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="text-red-600 text-xl">⚠️</div>
          <div>
            <div className="font-semibold text-red-900">
              {isBulkDelete 
                ? `Delete ${targetQuestions.length} Questions` 
                : `Delete Question ${question?.humanId}`
              }
            </div>
            <div className="text-sm text-red-700">
              This action cannot be undone. All question data will be permanently removed.
            </div>
          </div>
        </div>
        
        {deleteAnalysis.hasPublished && (
          <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
            <div className="text-sm font-medium text-red-800 mb-1">
              ⚠️ Active Questions Detected
            </div>
            <div className="text-sm text-red-700">
              Some questions are currently active and may be in use. Deleting them will make them unavailable immediately.
            </div>
          </div>
        )}
      </div>

      {/* Hierarchy Filter - Only show for bulk delete */}
      {isBulkDelete && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-gray-900">Filter by Hierarchy</div>
            {(hierarchyFilter.year || hierarchyFilter.subject || hierarchyFilter.part || 
              hierarchyFilter.section || hierarchyFilter.chapter) && (
              <button
                onClick={() => setHierarchyFilter({})}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div 
            className="rounded-xl p-4 border-2"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.secondary + '30'
            }}
          >
            <MCQHierarchyBreadcrumb
              hierarchyPath={hierarchyFilter}
              onHierarchyChange={setHierarchyFilter}
              showEditButton={false}
              isEditing={true}
              compact={true}
            />
          </div>
          <div className="mt-2 text-sm" style={{ color: theme.colors.semantic.text.secondary }}>
            {filteredQuestions.length !== allQuestions.length ? (
              <>Showing {filteredQuestions.length} of {allQuestions.length} questions</>
            ) : (
              <>Showing all {allQuestions.length} questions</>
            )}
          </div>
        </div>
      )}

      {/* Question Details */}
      {isBulkDelete ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Difficulty Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">
              By Difficulty {filteredQuestions.length !== allQuestions.length && `(${filteredQuestions.length} filtered)`}
            </div>
            <div className="space-y-1">
              {Object.entries(deleteAnalysis.difficultyBreakdown).map(([difficulty, count]) => (
                <div key={difficulty} className="flex justify-between text-sm">
                  <span className="text-gray-600">{difficulty}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Type Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-medium text-gray-900 mb-2">
              By Type {filteredQuestions.length !== allQuestions.length && `(${filteredQuestions.length} filtered)`}
            </div>
            <div className="space-y-1">
              {Object.entries(deleteAnalysis.typeBreakdown).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-600">{type.replace('_', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : question && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="font-medium text-gray-900 mb-2">Question Details</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-medium">{question.humanId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{question.type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulty:</span>
              <span className="font-medium">{question.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${question.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {question.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {question.tags && question.tags.length > 0 && (
              <div>
                <span className="text-gray-600">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {question.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderDeleteOptions = () => (
    <div className="space-y-4">
      <div className="font-medium text-gray-900">Delete Options</div>
      
      {/* Reference Handling */}
      {deleteAnalysis.hasReferences && (
        <label className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <input
            type="checkbox"
            checked={deleteReferences}
            onChange={(e) => setDeleteReferences(e.target.checked)}
            className="mt-0.5 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
          />
          <div>
            <div className="font-medium text-yellow-900">Delete References</div>
            <div className="text-sm text-yellow-800">
              Also remove any reference data associated with these questions
            </div>
          </div>
        </label>
      )}

      {/* Hierarchy Handling */}
      {deleteAnalysis.hasHierarchy && (
        <label className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            checked={deleteFromHierarchy}
            onChange={(e) => setDeleteFromHierarchy(e.target.checked)}
            className="mt-0.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-blue-900">Remove from Hierarchy</div>
            <div className="text-sm text-blue-800">
              Remove questions from their current hierarchy position
            </div>
          </div>
        </label>
      )}

      {/* Deletion Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Deletion (Optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Provide a reason for this deletion for audit purposes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
        />
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-4">
      <div className="bg-red-100 border border-red-300 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="text-red-600 text-xl">🚨</div>
          <div className="font-semibold text-red-900">Final Confirmation Required</div>
        </div>
        
        <div className="text-red-800 mb-4">
          You are about to permanently delete{' '}
          <strong>
            {isBulkDelete ? `${targetQuestions.length} questions` : `question ${question?.humanId}`}
          </strong>
          . This action cannot be undone.
        </div>

        <div className="bg-white rounded p-3 border border-red-200">
          <div className="text-sm text-red-700 space-y-1">
            <div>✓ Question data will be permanently removed</div>
            <div>✓ Associated options and explanations will be deleted</div>
            {deleteReferences && <div>✓ Reference data will be removed</div>}
            {deleteFromHierarchy && <div>✓ Questions will be removed from hierarchy</div>}
            {deleteAnalysis.hasPublished && (
              <div>✓ Active questions will become immediately unavailable</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-700">
          <strong>Alternative actions:</strong> Instead of deleting, you could:
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Deactivate questions to make them unavailable without deletion</li>
            <li>Archive questions for future reference</li>
            <li>Move questions to a different hierarchy location</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🗑️</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {confirmed ? 'Confirm Deletion' : 'Delete Questions'}
                </h2>
                <p className="text-sm text-gray-600">
                  {confirmed 
                    ? 'Final confirmation required'
                    : 'Review and configure deletion settings'
                  }
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCancel}
              disabled={isDeleting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {confirmed ? renderConfirmationStep() : (
            <div className="space-y-6">
              {renderQuestionSummary()}
              {renderDeleteOptions()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between">
            <div>
              {confirmed && (
                <button
                  onClick={() => setConfirmed(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Back to Options
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={isDeleting || targetQuestions.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  confirmed
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
              >
                {isDeleting && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                <span>
                  {isDeleting 
                    ? 'Deleting...' 
                    : confirmed 
                      ? `Delete ${isBulkDelete ? `${targetQuestions.length} Questions` : 'Question'}` 
                      : 'Continue to Confirmation'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};