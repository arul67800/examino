/**
 * Bulk Actions Bar Component
 * Actions for multiple selected questions
 */

'use client';

import React, { useState } from 'react';
import { Question, BulkOperation, BulkOperationType } from '../types';
import { DeleteModal, DeleteConfirmationData } from '../modals/delete-modal';

export interface BulkActionsBarProps {
  selectedCount: number;
  selectedQuestions: Question[];
  onAction: (operation: BulkOperation) => Promise<void>;
  onClear: () => void;
  className?: string;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  selectedQuestions,
  onAction,
  onClear,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAction = async (type: BulkOperationType, payload?: any) => {
    if (type === BulkOperationType.DELETE) {
      setShowDeleteModal(true);
      return;
    }

    if (showConfirm !== type) {
      setShowConfirm(type);
      return;
    }

    setIsLoading(true);
    try {
      await onAction({
        type,
        questionIds: selectedQuestions.map(q => q.id),
        payload,
      });
      setShowConfirm(null);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className={`bg-blue-50 border-t border-blue-200 px-6 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Selection Info */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} question{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear Selection
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Export */}
          <button
            onClick={() => handleAction(BulkOperationType.EXPORT)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            📊 Export
          </button>

          {/* Duplicate */}
          <button
            onClick={() => handleAction(BulkOperationType.DUPLICATE)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            📋 Duplicate
          </button>

          {/* Activate */}
          <button
            onClick={() => handleAction(BulkOperationType.ACTIVATE)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            ✅ Activate
          </button>

          {/* Deactivate */}
          <button
            onClick={() => handleAction(BulkOperationType.DEACTIVATE)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            ⏸️ Deactivate
          </button>

          {/* Delete */}
          <button
            onClick={() => handleAction(BulkOperationType.DELETE)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm rounded transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            🗑️ Delete
          </button>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Message for non-delete actions */}
      {showConfirm && showConfirm !== BulkOperationType.DELETE && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Are you sure you want to {showConfirm.toLowerCase()} {selectedCount} question{selectedCount !== 1 ? 's' : ''}?
          </p>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => handleAction(showConfirm as BulkOperationType)}
              className="text-sm bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              className="text-sm text-yellow-600 hover:text-yellow-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        questions={selectedQuestions}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async (deleteData) => {
          await onAction({
            type: BulkOperationType.DELETE,
            questionIds: deleteData.questionIds,
            payload: deleteData
          });
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
};